FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip && \
    pip install fastapi uvicorn pillow python-multipart Werkzeug

COPY app /app

EXPOSE 8099

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8099"]
