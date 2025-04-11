docker build -t background-removal-api .
docker run --gpus all -p 8011:8011 --rm background-removal-api