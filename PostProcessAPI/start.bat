docker build -t postprocess-api .
docker run -d -p 8002:8002 --rm postprocess-api
pause