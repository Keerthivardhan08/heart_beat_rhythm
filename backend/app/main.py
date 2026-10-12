
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.predictions import router as predictions_router

app = FastAPI(
    title="CardioVision 3D API",
    version="0.1.0",
    description="Research/educational prototype. Not for clinical decisions.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")


@app.get("/")
def root():
    return {"name": "CardioVision 3D API", "docs": "/docs"}
