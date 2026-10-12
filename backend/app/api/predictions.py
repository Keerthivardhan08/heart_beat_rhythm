
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Any

from app.services.ml_service import (
    ModelInputError,
    ModelNotConfiguredError,
    model_info,
    predict as run_prediction,
)

router = APIRouter(tags=["predictions"])


class PredictionRequest(BaseModel):
    features: dict[str, Any] = Field(
        ...,
        description="Feature names/values defined by the verified shared feature manifest.",
    )
    include_explanations: bool = True


@router.get("/model-info")
def get_model_info():
    try:
        return model_info()
    except ModelNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "model_not_configured",
                "message": str(exc),
            },
        ) from exc


@router.post("/predictions")
def predict(request: PredictionRequest):
    try:
        response = run_prediction(request.features)
    except ModelInputError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "invalid_features",
                "message": "Feature payload does not match the approved model schema.",
                "fields": str(exc),
            },
        ) from exc
    except ModelNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "model_not_configured",
                "message": str(exc),
            },
        ) from exc

    if not request.include_explanations:
        response.pop("explanations", None)
    return response
