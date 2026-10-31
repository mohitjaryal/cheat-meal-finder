
import uuid


def test_get_categoriest(client):
    response = client.get("/categories")
    assert response.status_code == 200


def test_post_category(client):
    response = client.post("/categories", json={
        "name": str(uuid.uuid4())
    })
    assert response.status_code == 201


def test_put_category(client):
    create_response = client.post("/categories", json={
        "name": f"Test-{uuid.uuid4()}"
    })
    category_id = create_response.json()["category_id"]

    response = client.put(f"/categories/{category_id}", json={
        "name": f"Updated-{uuid.uuid4()}"
    })
    assert response.status_code == 200


def test_delete_category(client):
    create_response = client.post("/categories", json={
        "name": f"Test-{uuid.uuid4()}"
    })
    category_id = create_response.json()["category_id"]

    response = client.delete(f"/categories/{category_id}")
    assert response.status_code == 200

    get_response = client.get(f"/categories/{category_id}")
    assert get_response.status_code == 404
