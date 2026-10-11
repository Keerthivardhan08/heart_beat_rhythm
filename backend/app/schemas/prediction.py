
from pydantic import BaseModel
from typing import Any


class TargetOutput(BaseModel):
    label: str | int | None = None
    score: float | None = None
    score_type: str | None = None


class PredictionResponse(BaseModel):
    status: str
    model_version: str | None
    targets: dict[str, TargetOutput | None]
    warnings: list[str] = []
