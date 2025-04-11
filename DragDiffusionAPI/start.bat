docker build -t drag-diffusion-api .
docker run --gpus all -p 8010:8010 --rm drag-diffusion-api