from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, BackgroundTasks
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
from safetensors.torch import load_file
import torch
import io
import base64
from fastapi.middleware.cors import CORSMiddleware
import gc
import time
import uuid

assert torch.cuda.is_available(), "CUDA is not available"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipes = {}
pipe = None

model_id_sd15 = "stable-diffusion-v1-5/stable-diffusion-v1-5"
model_id_sdxl = "stabilityai/stable-diffusion-xl-base-1.0"
model_id_lightning = "ByteDance/SDXL-Lightning"

try:
    unet = UNet2DConditionModel.from_config(model_id_sdxl, subfolder="unet").to("cuda", torch.float16)
    unet.load_state_dict(load_file("sdxl_lightning_4step_unet.safetensors", device="cuda"))
    
    pipe_lightning = StableDiffusionXLPipeline.from_pretrained(
        model_id_sdxl,
        unet=unet,
        torch_dtype=torch.float16,
        local_files_only=True
    )
    pipe_lightning.scheduler = EulerDiscreteScheduler.from_config(
        pipe_lightning.scheduler.config, timestep_spacing="trailing"
    )
    
    pipes = {
        model_id_lightning: pipe_lightning
    }
    pipe = pipes[model_id_lightning].to('cuda')
    print("Models loaded successfully.")
except Exception as e:
    print("Error loading models:", e)


class GenerateImageRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    width: int
    height: int
    num_images: int
    guidance_scale: float
    inference_steps: int
    model_name: str

tasks = {}

def process_image_generation(task_id: str, request: GenerateImageRequest):
    try:
        start_time = time.time()
        model_name = request.model_name
        if model_name not in pipes:
            tasks[task_id]['status'] = "FAILED"
            tasks[task_id]['error'] = "Invalid model name"
            return

        with torch.no_grad():
            result = pipes[model_name](
                request.prompt,
                negative_prompt=request.negative_prompt,
                width=request.width,
                height=request.height,
                num_images_per_prompt=request.num_images,
                guidance_scale=request.guidance_scale,
                num_inference_steps=request.inference_steps
            )
            images = result.images

        image_list = []
        for image in images:
            img_bytes = io.BytesIO()
            image.save(img_bytes, format="PNG")
            img_bytes = img_bytes.getvalue()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            image_list.append(img_base64)

        elapsed_time = time.time() - start_time
        print(f"Generated {len(images)} images in {elapsed_time:.2f} seconds")

        torch.cuda.empty_cache()
        gc.collect()

        tasks[task_id]['status'] = "COMPLETE"
        tasks[task_id]['result'] = image_list

    except Exception as e:
        tasks[task_id]['status'] = "FAILED"
        tasks[task_id]['error'] = str(e)

@app.get("/")
def root():
    return {"message": "Welcome to the image generation API!"}

@app.post("/generate_image")
def generate_image(request: GenerateImageRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "PENDING",
        "result": None,
        "error": None,
        "timestamp": time.time()
    }
    
    background_tasks.add_task(process_image_generation, task_id, request)
    return {"task_id": task_id}

@app.get("/generate_image_status/{task_id}")
def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if time.time() - tasks[task_id]["timestamp"] > 1800:
        tasks[task_id]['status'] = "FAILED"
        tasks[task_id]['error'] = "Task timed out"
    
    task = tasks[task_id]
    if task["status"] != "PENDING":
        tasks.pop(task_id, None)
    return task
