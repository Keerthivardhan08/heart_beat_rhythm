
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Any

router = APIRouter(tags=["predictions"])


class PredictionRequest(BaseModel):
    features: dict[str, Any] = Field(
        ...,
        description="Feature names/values defined by the verified shared feature manifest.",
    )


@router.post("/predictions")
def predict(request: PredictionRequest):
    # Intentionally fail closed until Person 1's evaluated model is integrated.
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": "model_not_configured",
            "message": "No trained and evaluated model is configured. No prediction was generated.",
        },
    )
