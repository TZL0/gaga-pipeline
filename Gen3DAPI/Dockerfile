# Use an official PyTorch image with CUDA support
FROM nvidia/cuda:12.2.2-cudnn8-devel-ubuntu22.04

# Force CUDA usage with env variables
ENV FORCE_CUDA=1

# 30xx  8.0 8.6 8.7 
# ENV TORCH_CUDA_ARCH_LIST="8.0;8.6;8.7"
# 40xx  8.9
# ENV TORCH_CUDA_ARCH_LIST="8.9"

ENV TORCH_CUDA_ARCH_LIST=8.0;8.6;8.7;8.9


# Set the working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-dev \
    python3-pip \
    wget \
    git \
    ninja-build \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Upgrade pip
RUN python -m pip install --upgrade pip setuptools wheel

# Clone TRELLIS fork repo
RUN git clone --recurse-submodules https://github.com/IgorAherne/trellis-stable-projectorz.git && \
    cd trellis-stable-projectorz

# Install PyTorch
RUN pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu121


# Verify CUDA installation and paths
RUN nvcc --version && \
    python -c "import torch; print('CUDA available:', torch.cuda.is_available())"

# Install basic dependencies
RUN pip install --default-timeout=100 \
    pillow imageio imageio-ffmpeg tqdm easydict opencv-python-headless \
    scipy ninja rembg onnxruntime trimesh xatlas pyvista pymeshfix igraph transformers && \
    pip install git+https://github.com/EasternJournalist/utils3d.git@9a4eb15e4021b67b12c460c7057d642626897ec8

# Install xformers
RUN pip3 install -U xformers --index-url https://download.pytorch.org/whl/cu121

# Install kaolin
RUN pip install kaolin==0.17.0 -f https://nvidia-kaolin.s3.us-east-2.amazonaws.com/torch-2.5.1_cu121.html

# Install flash-attn
RUN pip install flash-attn --no-build-isolation

# Install nvdiffrast
RUN mkdir -p /tmp/extensions && \
    git clone https://github.com/NVlabs/nvdiffrast.git /tmp/extensions/nvdiffrast && \
    pip install /tmp/extensions/nvdiffrast

# Install diffoctreerast
RUN mkdir -p /tmp/extensions && \
    git clone --recurse-submodules https://github.com/JeffreyXiang/diffoctreerast.git /tmp/extensions/diffoctreerast && \
    pip install /tmp/extensions/diffoctreerast

# Install mip-splatting
RUN mkdir -p /tmp/extensions && \
    git clone https://github.com/autonomousvision/mip-splatting.git /tmp/extensions/mip-splatting && \
    pip install /tmp/extensions/mip-splatting/submodules/diff-gaussian-rasterization/


# Install spconv
RUN pip install spconv-cu120

# Install diso & rembg inside nvidia container env
RUN pip install diso rembg

# RUN mkdir -p /app/input /app/output

RUN pip install --no-cache-dir fastapi uvicorn python-multipart aiofiles

# Expose the port on which the app will run
EXPOSE 8001

#ENTRYPOINT ["ls"]
# Command to run the FastAPI app with uvicorn

WORKDIR /app/trellis-stable-projectorz

CMD ["python3", "api_spz/main_api.py", "--precision", "half", "--ip", "0.0.0.0", "--port", "8001"]
# CMD ["uvicorn", "trellis-stable-projectorz.api_spz.main_api:app", "--host", "0.0.0.0", "--port", "8001"]
