import sys, os; sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import main
from fastapi.testclient import TestClient

client = TestClient(main.app)


def setup_function():
    main._users.clear()
    main._next_user_id = 1


def test_signup_and_login():
    resp = client.post("/signup", json={"username": "alice", "password": "secret"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "alice"
    assert data["id"] == 1

    resp = client.post("/signup", json={"username": "alice", "password": "secret"})
    assert resp.status_code == 400

    resp = client.post("/login", json={"username": "alice", "password": "secret"})
    assert resp.status_code == 200
    assert resp.json()["id"] == 1

    resp = client.post("/login", json={"username": "alice", "password": "wrong"})
    assert resp.status_code == 401
