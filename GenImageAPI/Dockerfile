FROM pytorch/pytorch:2.5.1-cuda12.1-cudnn9-runtime

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3-pip wget \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir diffusers torch torchvision torchaudio transformers accelerate fastapi uvicorn pillow hf_xet

RUN wget -O sdxl_lightning_4step_unet.safetensors "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step_unet.safetensors"
# RUN python -c "from diffusers import DiffusionPipeline; DiffusionPipeline.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0')"
# RUN python -c "from diffusers import DiffusionPipeline; DiffusionPipeline.from_pretrained('stable-diffusion-v1-5/stable-diffusion-v1-5')"

# RUN python -c "from diffusers import DiffusionPipeline; StableDiffusionXLPipeline.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', variant='fp16')""

COPY app /app

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]