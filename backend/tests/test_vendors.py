from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get():
    response = client.get("/vendors")

    assert response.status_code == 200