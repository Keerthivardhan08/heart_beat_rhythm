
"""Inference adapter placeholder. Never invent predictions."""

class ModelNotConfiguredError(RuntimeError):
    pass


def predict(features: dict) -> dict:
    raise ModelNotConfiguredError(
        "No trained model is configured. Train, evaluate, and explicitly register an artifact first."
    )
