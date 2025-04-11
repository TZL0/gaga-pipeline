from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
import torch
import io
import time
import uuid
import base64
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

assert torch.cuda.is_available(), "CUDA is not available"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = AutoModelForImageSegmentation.from_pretrained(
    'briaai/RMBG-2.0', local_files_only=True, trust_remote_code=True
)
torch.set_float32_matmul_precision('high')
model.to('cuda')

@app.get("/")
async def root():
    return {"message": "Welcome to the background removal API!"}

tasks = {}

def process_remove_background(task_id: str, image_bytes: bytes):
    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        tasks[task_id]["status"] = "FAILED"
        tasks[task_id]["error"] = f"Invalid image data: {e}"
        return

    image_size = (1024, 1024)
    transform_image = transforms.Compose([
        transforms.Resize(image_size),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    try:
        input_images = transform_image(pil_image).unsqueeze(0).to('cuda')
        with torch.no_grad():
            preds = model(input_images)[-1].sigmoid().cpu()
    except Exception as e:
        tasks[task_id]["status"] = "FAILED"
        tasks[task_id]["error"] = f"Model inference failed: {e}"
        return

    pred = preds[0].squeeze()
    pred_pil = transforms.ToPILImage()(pred)
    mask = pred_pil.resize(pil_image.size)
    mask = mask.convert("L")
    
    foreground = pil_image.copy()
    foreground.putalpha(mask)
    background = Image.new("RGBA", pil_image.size, (255, 255, 255, 255))
    result = Image.alpha_composite(background, foreground)
    
    img_buffer = io.BytesIO()
    result.save(img_buffer, format="PNG")
    img_buffer.seek(0)
    result_bytes = img_buffer.getvalue()
    result_base64 = base64.b64encode(result_bytes).decode("utf-8")
    
    tasks[task_id]["result"] = result_base64
    tasks[task_id]["status"] = "COMPLETE"

@app.get("/")
def root():
    return {"message": "Welcome to the background removal API!"}

@app.post("/remove_background")
async def remove_background(image: bytes = Body(...), background_tasks: BackgroundTasks = None):
    """
    Expects raw image binary data in the request body.
    Returns a task_id that can be used to poll the status.
    """
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "PENDING",
        "result": None,
        "error": None,
        "timestamp": time.time()
    }
    background_tasks.add_task(process_remove_background, task_id, image)
    return {"task_id": task_id}

@app.get("/remove_background_status/{task_id}")
async def remove_background_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    if task["status"] in ["COMPLETE", "FAILED"]:
        tasks.pop(task_id)
        return task
    return task
