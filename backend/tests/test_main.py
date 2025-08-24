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
    assert task["description"] == ""
    assert task["due_date"] is None
    assert task["priority"] == "normal"

    resp = client.get("/tasks")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Task"
    assert data[0]["priority"] == "normal"


def test_update_task():
    client.post("/tasks", json={"title": "Another"})
    resp = client.put(
        "/tasks/2",
        json={
            "done": True,
            "title": "Updated",
            "description": "Desc",
            "due_date": "2025-01-01",
            "priority": "high",
        },
    )
    assert resp.status_code == 200


def test_summary_and_export():
    import main
    main._tasks.clear()
    main._next_id = 1

    client.post("/tasks", json={"title": "A", "priority": "low", "done": True})
    client.post("/tasks", json={"title": "B", "priority": "high"})

    resp = client.get("/summary")
    assert resp.status_code == 200
    assert resp.json() == {
        "total": 2,
        "completed": 1,
        "pending": 1,
        "by_priority": {"low": 1, "high": 1},
    }

    resp = client.get("/export")
    assert resp.status_code == 200
    assert "id,title" in resp.text
    assert "A" in resp.text and "B" in resp.text


def test_delete_task():
    client.post("/tasks", json={"title": "Delete me"})
    resp = client.delete("/tasks/3")
    assert resp.status_code == 204
    resp = client.get("/tasks")
    assert len(resp.json()) == 2  # from previous tests


def test_cors_preflight():
    resp = client.options(
        "/tasks",
        headers={
            "Origin": "http://test",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert resp.status_code == 200
