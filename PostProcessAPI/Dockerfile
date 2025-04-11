FROM python:3.9-slim

# Install system dependencies (including xz-utils and OpenGL libraries)
RUN apt update && apt install -y \
    wget \
    xz-utils \
    libgl1 \
    libglu1-mesa \
    libx11-6 \
    libxi6 \
    libxrender1 \
    libxfixes3 \
    libxcursor1 \
    libxrandr2 \
    libxkbcommon-x11-0 \
    libsm6 \
    && rm -rf /var/lib/apt/lists/*

# Download and install Blender
WORKDIR /opt
RUN wget https://download.blender.org/release/Blender4.3/blender-4.3.2-linux-x64.tar.xz \
    && tar -xf blender-4.3.2-linux-x64.tar.xz \
    && rm blender-4.3.2-linux-x64.tar.xz
# RUN wget https://download.blender.org/release/Blender3.6/blender-3.6.0-linux-x64.tar.xz \
#     && tar -xf blender-3.6.0-linux-x64.tar.xz \
#     && rm blender-3.6.0-linux-x64.tar.xz
# RUN wget https://download.blender.org/release/Blender3.4/blender-3.4.1-linux-x64.tar.xz \
#     && tar -xf blender-3.4.1-linux-x64.tar.xz \
#     && rm blender-3.4.1-linux-x64.tar.xz

# Set Blender environment variables manually (no variable expansion)
ENV BLENDER_PATH="/opt/blender-4.3.2-linux-x64"
# ENV BLENDER_PATH="/opt/blender-3.6.0-linux-x64"
# ENV BLENDER_PATH="/opt/blender-3.4.1-linux-x64"
ENV PATH="$BLENDER_PATH:$PATH"

# Install FastAPI and Uvicorn using Blender's Python
RUN $BLENDER_PATH/4.3/python/bin/python3.11 -m ensurepip \
    && $BLENDER_PATH/4.3/python/bin/python3.11 -m pip install --no-cache-dir fastapi uvicorn python-multipart
# RUN $BLENDER_PATH/3.6/python/bin/python3.10 -m ensurepip \
#     && $BLENDER_PATH/3.6/python/bin/python3.10 -m pip install --no-cache-dir fastapi uvicorn python-multipart
# RUN $BLENDER_PATH/3.4/python/bin/python3.10 -m ensurepip \
#     && $BLENDER_PATH/3.4/python/bin/python3.10 -m pip install --no-cache-dir fastapi uvicorn python-multipart

# Copy FastAPI app
WORKDIR /app
COPY app /app

# Run FastAPI using Blender's Python explicitly
CMD ["blender", "-b", "-P", "api.py"]
# CMD ["tail", "-f", "/dev/null"]
