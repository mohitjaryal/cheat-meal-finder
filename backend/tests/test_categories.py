from starlette.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

# GET all categories tests
def test_get_categoriest():
    response = client.get("/categories")

    assert response.status_code == 200

# POST - Create new category
def test_post_category():
    response = client.post("/categories", json={
        'name': str(uuid.uuid4())
    })

    assert response.status_code == 201

# PUT - Update category
def test_put_category():
    create_response = client.post("/categories", json={
        "name": f"Test-{uuid.uuid4()}"
    })
    category_id = create_response.json()["category_id"]

    response = client.put(f"/categories/{category_id}", json={
        "name": f"Updated-{uuid.uuid4()}"
    })

    assert response.status_code == 200

# DELETE - Delete category
def test_delete_category():
    create_response = client.post("/categories", json={
        "name": f"Test-{uuid.uuid4()}"
    })
    category_id = create_response.json()["category_id"]

    response = client.delete(f"/categories/{category_id}")

    assert response.status_code == 200

    # Verify category no longer exists
    get_response = client.get(f"/categories/{category_id}")
    assert get_response.status_code == 404
