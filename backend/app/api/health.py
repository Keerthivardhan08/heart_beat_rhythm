
from fastapi import APIRouter

from app.services.ml_service import model_status

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "model_status": model_status()}
