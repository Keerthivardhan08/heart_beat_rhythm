
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_prediction_requires_features_object():
    response = client.post("/api/predictions", json={})
    assert response.status_code == 422
