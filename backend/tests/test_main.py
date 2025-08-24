import sys, os; sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_create_and_list_tasks():
    resp = client.post("/tasks", json={"title": "Test Task"})
    assert resp.status_code == 201
    task = resp.json()
    assert task["id"] == 1
    assert task["title"] == "Test Task"
    assert task["done"] is False

    resp = client.get("/tasks")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Task"


def test_update_task():
    client.post("/tasks", json={"title": "Another"})
    resp = client.put("/tasks/2", json={"done": True, "title": "Updated"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["done"] is True
    assert data["title"] == "Updated"


def test_delete_task():
    client.post("/tasks", json={"title": "Delete me"})
    resp = client.delete("/tasks/3")
    assert resp.status_code == 204
    resp = client.get("/tasks")
    assert len(resp.json()) == 2  # from previous tests
