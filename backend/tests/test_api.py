
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["model_status"] == "not_configured"


def test_prediction_fails_closed_without_model():
    response = client.post("/api/predictions", json={"features": {"example": 1}})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "model_not_configured"
