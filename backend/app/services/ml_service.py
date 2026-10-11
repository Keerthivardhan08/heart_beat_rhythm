
class ModelNotConfiguredError(RuntimeError):
    pass


def predict(features: dict) -> dict:
    raise ModelNotConfiguredError("No evaluated model artifact is configured.")
