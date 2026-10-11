
import pytest
from cardiovision_ml.predict import ModelNotConfiguredError, predict


def test_predict_fails_clearly_without_model():
    with pytest.raises(ModelNotConfiguredError):
        predict({})
