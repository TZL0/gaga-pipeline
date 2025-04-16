# main.py
import ast
import io
import json
import base64
import math
import os
import gc
import logging
import time
import uuid
import asyncio
from typing import Tuple, List

import cv2
import uvicorn
import numpy as np
from PIL import Image

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from utils.ui_utils import train_lora_interface, run_drag

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dictionaries to hold task status for each operation.
tasks_train_lora = {}
tasks_drag_image = {}


def read_image(file: UploadFile) -> Tuple[np.ndarray, np.ndarray]:
    file.file.seek(0)
    image_bytes = file.file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    width, height = image.size
    max_side = max(width, height)

    if max_side != 512:
        scale = 512 / max_side
        new_width = int(round(width * scale))
        new_height = int(round(height * scale))
        resized_image = image.resize((new_width, new_height), Image.LANCZOS)
    else:
        resized_image = image

    return np.array(image), np.array(resized_image)


def map_vectors_to_resized_image(vectors, original_size, resized_size):
    scale_x = resized_size[1] / original_size[1]
    scale_y = resized_size[0] / original_size[0]

    mapped_vectors = []
    for vector in vectors:
        start_pos = vector['start']
        end_pos = vector['end']
        start_pos = [int(start_pos[0] * scale_x), int(start_pos[1] * scale_y)]
        end_pos = [int(end_pos[0] * scale_x), int(end_pos[1] * scale_y)]
        mapped_vectors.append(start_pos)
        mapped_vectors.append(end_pos)
    return mapped_vectors


def map_mask_to_resized_image(mask, original_size, resized_size):
    scale_x = resized_size[1] / original_size[1]
    scale_y = resized_size[0] / original_size[0]

    resized_mask = np.zeros((resized_size[0], resized_size[1]), dtype=np.uint8)
    for i in range(resized_size[0]):
        for j in range(resized_size[1]):
            orig_i = math.floor(i / scale_y)
            orig_j = math.floor(j / scale_x)
            resized_mask[i, j] = mask[orig_i][orig_j]
    return resized_mask


def decode_rle(encoded_str: str) -> List[int]:
    parts = encoded_str.split('-')
    current_bit = int(parts[0])
    decoded = []
    for count_str in parts[1:]:
        count = int(count_str)
        decoded.extend([current_bit] * count)
        current_bit = 1 - current_bit
    return decoded


def decompress_2d_array(encoded_rows: List[str]) -> List[List[int]]:
    return [decode_rle(row) for row in encoded_rows]


######################################
# Background Task Functions
######################################

def process_train_lora(task_id: str, original_img_np, prompt: str, path_model: str,
                       lora_step: int, lora_lr: float, lora_batch_size: int, lora_rank: int):
    """
    Runs the LoRA training in the background. Each task gets its own temporary directory.
    When complete, reads the generated safetensors file, base64-encodes its contents,
    and updates the task status.
    """
    vae_path = 'default'
    # Create a unique directory for this task using its task_id.
    lora_task_dir = os.path.join('lora_tmp', task_id)
    os.makedirs(lora_task_dir, exist_ok=True)
    
    try:
        train_lora_interface(
            original_img_np, prompt, path_model,
            vae_path, lora_task_dir, lora_step, lora_lr, lora_batch_size, lora_rank,
        )
    except Exception as e:
        tasks_train_lora[task_id]["status"] = "FAILED"
        tasks_train_lora[task_id]["error"] = f"LoRA training failed: {e}"
        return

    safetensors_path = os.path.join(lora_task_dir, 'pytorch_lora_weights.safetensors')
    if os.path.exists(safetensors_path):
        try:
            with open(safetensors_path, 'rb') as f:
                content = f.read()
            os.remove(safetensors_path)
            # Remove the temporary directory if empty.
            try:
                os.rmdir(lora_task_dir)
            except Exception as e:
                logger.warning("Could not remove temporary directory %s: %s", lora_task_dir, e)
            tasks_train_lora[task_id]["result"] = base64.b64encode(content).decode("utf-8")
            tasks_train_lora[task_id]["status"] = "COMPLETE"
        except Exception as e:
            tasks_train_lora[task_id]["status"] = "FAILED"
            tasks_train_lora[task_id]["error"] = f"Error reading safetensors: {e}"
    else:
        tasks_train_lora[task_id]["status"] = "FAILED"
        tasks_train_lora[task_id]["error"] = "LoRA safetensors file not found."


def process_drag_image(task_id: str, original_image_np, resized_image_np,
                       selected_points: str, mask: str, prompt: str,
                       inversion_strength: float, lam: float, latent_lr: float,
                       n_pix_step: int, path_model: str, start_step: int, start_layer: int,
                       lora_file_content: bytes):
    try:
        selected_points_list = json.loads(selected_points)
        mapped_points_list = map_vectors_to_resized_image(
            selected_points_list,
            original_image_np.shape,
            resized_image_np.shape
        )
        original_mask = decompress_2d_array(ast.literal_eval(mask))
        resized_mask_np = map_mask_to_resized_image(
            original_mask,
            original_image_np.shape,
            resized_image_np.shape
        )
        input_img_np = np.zeros_like(resized_image_np)
    except Exception as e:
        tasks_drag_image[task_id]["status"] = "FAILED"
        tasks_drag_image[task_id]["error"] = f"Error processing selected_points or mask: {e}"
        return

    lora_task_dir = os.path.join('lora_tmp', task_id)
    os.makedirs(lora_task_dir, exist_ok=True)
    lora_path = os.path.join(lora_task_dir, 'pytorch_lora_weights.safetensors')
    
    try:
        with open(lora_path, 'wb') as f:
            f.write(lora_file_content)
    except Exception as e:
        tasks_drag_image[task_id]["status"] = "FAILED"
        tasks_drag_image[task_id]["error"] = f"Failed to write LoRA file: {e}"
        return

    try:
        edited_image = run_drag(
            resized_image_np,
            input_img_np,
            resized_mask_np,
            prompt,
            mapped_points_list,
            inversion_strength,
            lam,
            latent_lr,
            n_pix_step,
            path_model,
            'default',
            lora_path,
            start_step,
            start_layer,
        )
    except Exception as e:
        tasks_drag_image[task_id]["status"] = "FAILED"
        tasks_drag_image[task_id]["error"] = f"Drag editing failed: {e}"
        return

    try:
        edited_image_rgb = cv2.cvtColor(edited_image, cv2.COLOR_BGR2RGB)
        ret, buf = cv2.imencode(".png", edited_image_rgb)
        if not ret:
            raise ValueError("Image encoding failed.")
        base64_image = base64.b64encode(buf).decode("utf-8")
        tasks_drag_image[task_id]["result"] = base64_image
        tasks_drag_image[task_id]["status"] = "COMPLETE"
    except Exception as e:
        tasks_drag_image[task_id]["status"] = "FAILED"
        tasks_drag_image[task_id]["error"] = f"Failed to encode edited image: {e}"
    finally:
        try:
            os.remove(lora_path)
            logger.info("Removed temporary LoRA file: %s", lora_path)
        except Exception as e:
            logger.error("Failed to remove temporary LoRA file: %s", e)
        try:
            os.rmdir(lora_task_dir)
            logger.info("Removed temporary directory: %s", lora_task_dir)
        except Exception as e:
            logger.warning("Failed to remove temporary directory %s: %s", lora_task_dir, e)


######################################
# API Endpoints
######################################

@app.get("/")
async def root():
    return {"message": "Welcome to the DragDiffusion API!"}


@app.post("/drag_diff_train_lora")
async def train_lora_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    path_model: str = Form(...),
    lora_step: int = Form(...),
    lora_lr: float = Form(...),
    lora_batch_size: int = Form(...),
    lora_rank: int = Form(...),
    background_tasks: BackgroundTasks = None,
):
    try:
        _, original_img_np = read_image(image)
    except Exception as e:
        logger.exception("Failed to process original image.")
        return JSONResponse(
            status_code=400,
            content={"error": "Failed to process original image.", "details": str(e)}
        )

    try:
        task_id = str(uuid.uuid4())
        tasks_train_lora[task_id] = {
            "status": "PENDING",
            "result": None,
            "error": None,
            "timestamp": time.time()
        }
        background_tasks.add_task(
            process_train_lora,
            task_id, original_img_np, prompt, path_model,
            lora_step, lora_lr, lora_batch_size, lora_rank,
        )
        return {"task_id": task_id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/drag_diff_train_lora_status/{task_id}")
async def train_lora_status(task_id: str):
    try:
        if task_id not in tasks_train_lora:
            return JSONResponse(status_code=404, content={"error": "Task not found"})
        task = tasks_train_lora[task_id]
        if task["status"] in ["COMPLETE", "FAILED"]:
            tasks_train_lora.pop(task_id)
            return task
        return task
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/drag_diff_image")
async def drag_image_endpoint(
    original_image: UploadFile = File(...),
    lora_file: UploadFile = File(...),
    prompt: str = Form(...),
    mask: str = Form(...),
    selected_points: str = Form(...),
    inversion_strength: float = Form(...),
    lam: float = Form(...),
    latent_lr: float = Form(...),
    n_pix_step: int = Form(...),
    start_step: int = Form(0),
    start_layer: int = Form(10),
    path_model: str = Form(...),
    background_tasks: BackgroundTasks = None,
):
    try:
        original_image_np, resized_image_np = read_image(original_image)
    except Exception as e:
        logger.exception("Failed to process original image.")
        return JSONResponse(
            status_code=400,
            content={"error": "Failed to process original image.", "details": str(e)}
        )
    try:
        lora_file_content = await lora_file.read()
    except Exception as e:
        logger.exception("Failed to read LoRA file.")
        return JSONResponse(
            status_code=400,
            content={"error": "Failed to read LoRA file.", "details": str(e)}
        )

    try:
        task_id = str(uuid.uuid4())
        tasks_drag_image[task_id] = {
            "status": "PENDING",
            "result": None,
            "error": None,
            "timestamp": time.time()
        }
        background_tasks.add_task(
            process_drag_image,
            task_id, original_image_np, resized_image_np,
            selected_points, mask, prompt,
            inversion_strength, lam, latent_lr, n_pix_step,
            path_model, start_step, start_layer, lora_file_content,
        )
        return {"task_id": task_id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/drag_diff_image_status/{task_id}")
async def drag_image_status(task_id: str):
    try:
        if task_id not in tasks_drag_image:
            return JSONResponse(status_code=404, content={"error": "Task not found"})
        task = tasks_drag_image[task_id]
        if task["status"] in ["COMPLETE", "FAILED"]:
            tasks_drag_image.pop(task_id)
            return task
        return task
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8010, reload=True)
