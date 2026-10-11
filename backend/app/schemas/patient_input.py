
from pydantic import BaseModel
from typing import Any


class PatientInput(BaseModel):
    features: dict[str, Any]
