FROM pytorch/pytorch:2.6.0-cuda11.8-cudnn9-runtime


ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y wget bzip2 ca-certificates libglib2.0-0 libxext6 libsm6 libxrender1 git && \
    rm -rf /var/lib/apt/lists/*

COPY app/environment.yaml /tmp/environment.yaml

RUN conda env create -f /tmp/environment.yaml

SHELL ["conda", "run", "-n", "dragdiff", "/bin/bash", "-c"]

WORKDIR /app

COPY app /app

# RUN python -c "from diffusers import DiffusionPipeline; DiffusionPipeline.from_pretrained('stable-diffusion-v1-5/stable-diffusion-v1-5')"
RUN python -c "from diffusers import AutoencoderKL; AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse')"

EXPOSE 8010

CMD ["conda", "run", "-n", "dragdiff", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8010", "--workers", "1"]
