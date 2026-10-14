
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import sklearn.compose._column_transformer as _ct
from sklearn.impute import SimpleImputer

if not hasattr(SimpleImputer, "_fill_dtype"):
    SimpleImputer._fill_dtype = property(lambda self: getattr(self, "_fit_dtype", float))

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
    current = Path(__file__).resolve()
    base_dir = current.parent.parent  # /app or backend
    candidates = [
        Path("/app/ml_artifacts"),
        Path("/app/ml folder"),
        base_dir / "ml_artifacts",
        base_dir / "ml folder",
        base_dir.parent / "ml folder",
        Path("ml_artifacts").resolve(),
        Path("ml folder").resolve(),
    ]
    for c in candidates:
        if c.exists() and (c / "metadata.json").exists():
            return c
    return base_dir.parent / "ml folder"


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


def _normalize_features(raw_features: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(raw_features)
    # Normalize Sex
    if "Sex" in normalized:
        v = str(normalized["Sex"]).strip().lower()
        if v in ("male", "m", "1"):
            normalized["Sex"] = 1
        elif v in ("female", "fmale", "f", "0"):
            normalized["Sex"] = 0

    # Normalize generic binary/categorical Yes/No strings
    for k, v in list(normalized.items()):
        if isinstance(v, str):
            v_clean = v.strip().lower()
            if v_clean in ("y", "yes", "true", "positive"):
                normalized[k] = 1
            elif v_clean in ("n", "no", "false", "negative"):
                normalized[k] = 0

    return normalized


def _compute_explanations(model: Any, row: pd.DataFrame) -> dict[str, Any]:
    try:
        pre = model.named_steps.get("preprocessor")
        clf = model.named_steps.get("classifier")
        if not pre or not clf or not hasattr(clf, "coef_"):
            return {
                "status": "unavailable",
                "method": "not_configured",
                "message": "Feature explanations not available for this model type.",
            }

        x_trans = pre.transform(row)
        if hasattr(x_trans, "toarray"):
            x_trans = x_trans.toarray()
        out_names = pre.get_feature_names_out()
        coefs = clf.coef_[0]
        contribs = x_trans[0] * coefs

        def clean_feature_label(name: str) -> str:
            cleaned = name.replace("numeric__", "").replace("categorical__", "")
            cleaned = cleaned.replace("_Y", "").replace("_Male", " (Male)")
            return cleaned

        paired = [
            (clean_feature_label(name), float(val))
            for name, val in zip(out_names, contribs)
            if abs(val) > 0.001
        ]
        paired.sort(key=lambda item: item[1], reverse=True)

        top_risk = [
            {"feature": f, "impact": round(v, 2), "direction": "increases_risk"}
            for f, v in paired
            if v > 0
        ][:4]
        top_protective = [
            {"feature": f, "impact": round(abs(v), 2), "direction": "decreases_risk"}
            for f, v in paired
            if v < 0
        ][-4:]

        return {
            "status": "available",
            "method": "linear_log_odds",
            "top_risk_factors": top_risk,
            "top_protective_factors": top_protective,
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "method": "error",
            "message": f"Could not calculate feature explanations: {exc}",
        }


def predict(features: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model_bundle()
    if not isinstance(features, dict):
        raise ModelInputError("features must be an object.")

    features = _normalize_features(features)

    required = _required_features(bundle)
    supplied = set(features)
    missing = sorted(required - supplied)
    forbidden = sorted(supplied & {"Cath", "CAD", "LAD", "LCX", "RCA", "cad", "lad", "lcx", "rca"})

    if forbidden:
        raise ModelInputError(f"Forbidden leakage target fields detected: {forbidden}")

    # Auto-fill any missing features with default 0 so partial forms succeed
    if missing:
        for feature in missing:
            features[feature] = 0

    predictions: dict[str, dict[str, Any]] = {}
    explanations: dict[str, dict[str, Any]] = {}

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
        explanations[target_id] = _compute_explanations(model, row)

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
