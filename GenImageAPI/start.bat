docker build -t gen-image-api .
docker run --gpus all -p 8000:8000 --rm gen-image-api