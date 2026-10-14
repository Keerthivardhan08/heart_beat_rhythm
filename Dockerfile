# Multi-stage build for CardioVision 3D (React + Vite + FastAPI + Scikit-Learn)

# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Runtime Environment
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

COPY backend/app ./app
COPY ["ml folder", "./ml_artifacts/"]
COPY ["ml folder", "./ml folder/"]

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /build/dist ./frontend/dist

ENV PORT=8000
ENV PYTHONPATH=/app
ENV MODEL_ARTIFACT_DIR=/app/ml_artifacts

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
