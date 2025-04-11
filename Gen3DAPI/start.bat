docker build -t to-3d-mock-api .
docker run --gpus all -p 8001:8001 --rm to-3d-mock-api
pause