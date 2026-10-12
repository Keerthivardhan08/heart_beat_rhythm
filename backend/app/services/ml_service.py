
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import sklearn.compose._column_transformer as _ct

if not hasattr(_ct, "_RemainderColsList"):
    _ct._RemainderColsList = type("_RemainderColsList", (list,), {})

from app.core.config import settings


TARGET_MAP = {
    "Cath": "cad",
    "LAD": "lad",
    "LCX": "lcx",
    "RCA": "rca",
}

NOTICE = (
    "Research/educational use only; not a diagnosis. Model probabilities are "
    "not clinically validated disease risks."
)


class ModelNotConfiguredError(RuntimeError):
    pass


class ModelInputError(ValueError):
    pass


def _default_artifact_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "ml folder"


def _artifact_dir() -> Path:
    configured = settings.model_path or settings.model_artifact_dir
    return Path(configured).expanduser().resolve() if configured else _default_artifact_dir()


@lru_cache(maxsize=1)
def load_model_bundle() -> dict[str, Any]:
    artifact_dir = _artifact_dir()
    metadata_path = artifact_dir / "metadata.json"
    if not metadata_path.exists():
        raise ModelNotConfiguredError(f"Model metadata not found at {metadata_path}")

    import json

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    models: dict[str, Any] = {}
    features: dict[str, list[str]] = {}

    for source_target in TARGET_MAP:
        config = metadata["models"][source_target]
        features_path = artifact_dir / config["features_file"]
        artifact_path = artifact_dir / config["artifact"]
        if not features_path.exists() or not artifact_path.exists():
            raise ModelNotConfiguredError(
                f"Missing artifact files for {source_target} in {artifact_dir}"
            )

        features[source_target] = json.loads(features_path.read_text(encoding="utf-8"))
        models[source_target] = joblib.load(artifact_path)

    return {
        "artifact_dir": artifact_dir,
        "metadata": metadata,
        "features": features,
        "models": models,
    }


def model_status() -> str:
    try:
        load_model_bundle()
    except ModelNotConfiguredError:
        return "not_configured"
    return "configured"


def model_info() -> dict[str, Any]:
    bundle = load_model_bundle()
    metadata = bundle["metadata"]
    all_features = sorted(
        {feature for target_features in bundle["features"].values() for feature in target_features}
    )
    return {
        "model_version": metadata.get("project", "CardioVision3D") + "-provisional",
        "status": metadata.get("status", "Provisional research prototype"),
        "sklearn_version": metadata.get("sklearn_version"),
        "dataset_shape": metadata.get("dataset_shape"),
        "targets": list(TARGET_MAP.values()),
        "features": all_features,
        "target_feature_counts": {
            TARGET_MAP[target]: len(features)
            for target, features in bundle["features"].items()
        },
        "notice": NOTICE,
    }


def _required_features(bundle: dict[str, Any]) -> set[str]:
    return {
        feature
        for target_features in bundle["features"].values()
        for feature in target_features
    }


def predict(features: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model_bundle()
    if not isinstance(features, dict):
        raise ModelInputError("features must be an object.")

    required = _required_features(bundle)
    supplied = set(features)
    missing = sorted(required - supplied)
    unknown = sorted(supplied - required)
    forbidden = sorted(supplied & {"Cath", "CAD", "LAD", "LCX", "RCA", "cad", "lad", "lcx", "rca"})

    if missing or unknown or forbidden:
        details: dict[str, list[str]] = {}
        if missing:
            details["missing"] = missing
        if unknown:
            details["unknown"] = unknown
        if forbidden:
            details["forbidden"] = forbidden
        raise ModelInputError(str(details))

    predictions: dict[str, dict[str, Any]] = {}
    explanations: dict[str, dict[str, str]] = {}

    for source_target, target_id in TARGET_MAP.items():
        feature_names = bundle["features"][source_target]
        row = pd.DataFrame(
            [{feature: features[feature] for feature in feature_names}],
            columns=feature_names,
        )
        model = bundle["models"][source_target]
        probabilities = model.predict_proba(row)[0]
        classes = [str(label) for label in model.classes_]
        class_probabilities = {
            label: float(probability)
            for label, probability in zip(classes, probabilities)
        }
        positive_class = bundle["metadata"]["models"][source_target]["positive_class"]
        positive_probability = class_probabilities[positive_class]
        predicted_class = str(model.predict(row)[0])

        predictions[target_id] = {
            "label": "positive" if predicted_class == positive_class else "negative",
            "predicted_class": predicted_class,
            "probability": positive_probability,
            "threshold": None,
            "threshold_status": "Not finalized",
            "positive_class": positive_class,
            "class_probabilities": class_probabilities,
        }
        explanations[target_id] = {
            "status": "unavailable",
            "method": "not_configured",
            "message": "Feature explanations are not available for this provisional artifact.",
        }

    return {
        "status": "ok",
        "model_version": model_info()["model_version"],
        "predictions": predictions,
        "explanations": explanations,
        "notice": NOTICE,
        "warnings": [
            "Thresholds are not finalized.",
            "The model bundle is provisional and has not been clinically validated.",
        ],
    }
