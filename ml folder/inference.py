
from pathlib import Path
from collections.abc import Mapping
import json
import joblib
import pandas as pd

ARTIFACT_DIR = Path(__file__).resolve().parent

with open(ARTIFACT_DIR / "metadata.json", encoding="utf-8") as f:
    METADATA = json.load(f)

TARGETS = ["Cath", "LAD", "LCX", "RCA"]
MODELS = {}
FEATURES = {}

# Load the exact saved pipelines and feature manifests.
for target in TARGETS:
    config = METADATA["models"][target]

    with open(
        ARTIFACT_DIR / config["features_file"],
        encoding="utf-8"
    ) as f:
        FEATURES[target] = json.load(f)

    MODELS[target] = joblib.load(
        ARTIFACT_DIR / config["artifact"]
    )

def predict_all(patient_features):
    """
    Input:
        Mapping from feature names to patient feature values.

    Output:
        Four model predictions and their class probabilities.

    This is a research prototype interface, not a diagnostic tool.
    """

    if not isinstance(patient_features, Mapping):
        raise TypeError(
            "patient_features must be a dictionary or mapping."
        )

    # Validate the complete input schema before predicting.
    required_features = set(
        feature
        for target in TARGETS
        for feature in FEATURES[target]
    )

    missing = sorted(required_features - set(patient_features))

    if missing:
        raise ValueError(
            "Missing required input features: "
            + ", ".join(missing)
        )

    outputs = {}

    for target in TARGETS:
        feature_names = FEATURES[target]

        # Preserve the exact training feature order.
        row = pd.DataFrame(
            [{
                feature: patient_features[feature]
                for feature in feature_names
            }],
            columns=feature_names
        )

        model = MODELS[target]
        probabilities = model.predict_proba(row)[0]
        predicted_class = str(model.predict(row)[0])
        classes = [str(c) for c in model.classes_]

        class_probabilities = {
            label: float(probability)
            for label, probability in zip(classes, probabilities)
        }

        positive_class = METADATA["models"][target]["positive_class"]

        outputs[target] = {
            "predicted_class": predicted_class,
            "class_probabilities": class_probabilities,
            "positive_class": positive_class,
            "positive_class_model_probability":
                class_probabilities[positive_class],
            "threshold": None,
            "threshold_status": "Not finalized",
        }

    return {
        "project": "CardioVision3D",
        "status": "research_prototype",
        "outputs": outputs,
        "warning": (
            "Research predictions only. Model probabilities are not "
            "clinically validated disease risks and must not be used "
            "as a standalone diagnosis."
        ),
    }
