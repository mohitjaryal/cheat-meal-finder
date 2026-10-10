from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_vendors():
    response = client.get("/vendors")

    assert response.status_code == 200