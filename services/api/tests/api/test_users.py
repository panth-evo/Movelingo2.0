"""Users and profile endpoints (CONTRACT.md section 5)."""
import db as db_module
from models.core import UserProfile


def test_create_user_returns_user_id(client):
    resp = client.post("/api/users")
    assert resp.status_code == 200
    body = resp.json()
    assert set(body) == {"user_id"}
    assert isinstance(body["user_id"], str) and body["user_id"]


def test_profile_roundtrip_derives_language(client, profile_payload):
    user_id = client.post("/api/users").json()["user_id"]

    resp = client.put(f"/api/users/{user_id}/profile", json=profile_payload)
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}

    with db_module.SessionLocal() as session:
        row = session.get(UserProfile, user_id)
    assert row is not None
    assert row.target_country == "DE"
    assert row.language == "de"
    assert row.profile["goal"]["move_deadline"] == "2027-07-15"  # dates stored YYYY-MM-DD


def test_profile_rejects_bad_enum(client, profile_payload):
    user_id = client.post("/api/users").json()["user_id"]
    bad = {**profile_payload, "goal": {**profile_payload["goal"], "purpose": "escape"}}

    resp = client.put(f"/api/users/{user_id}/profile", json=bad)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"


def test_profile_rejects_bad_date_format(client, profile_payload):
    user_id = client.post("/api/users").json()["user_id"]
    bad = {**profile_payload, "goal": {**profile_payload["goal"], "move_deadline": "15/07/2027"}}

    resp = client.put(f"/api/users/{user_id}/profile", json=bad)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"


def test_profile_rejects_missing_and_extra_fields(client, profile_payload):
    user_id = client.post("/api/users").json()["user_id"]

    missing = {key: value for key, value in profile_payload.items() if key != "age"}
    resp = client.put(f"/api/users/{user_id}/profile", json=missing)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"

    extra = {**profile_payload, "streak_days": 3}
    resp = client.put(f"/api/users/{user_id}/profile", json=extra)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"


def test_profile_unknown_user_404(client, profile_payload):
    resp = client.put("/api/users/u_missing/profile", json=profile_payload)
    assert resp.status_code == 404
    assert resp.json() == {
        "error": {"code": "user_not_found", "message": "No user with id u_missing"}
    }
