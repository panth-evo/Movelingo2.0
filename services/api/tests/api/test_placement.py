"""GET /api/progress and POST /api/placement/result (CONTRACT.md sections 4 and 5)."""
from sqlalchemy import select

import db as db_module
from models.core import LanguageProgress, ProgressEvent


def _create_user(client) -> str:
    return client.post("/api/users").json()["user_id"]


def test_progress_returns_zero_filled_contract_shape(client):
    user_id = _create_user(client)

    resp = client.get("/api/progress?language=de", headers={"X-User-Id": user_id})
    assert resp.status_code == 200
    body = resp.json()

    assert set(body) == {"language", "current_level", "target_level", "updated_at", "levels"}
    assert body["language"] == "de"
    assert body["current_level"] == "A1"
    assert body["target_level"] == "B1"
    assert len(body["levels"]) == 5
    assert [card["level"] for card in body["levels"]] == ["A1", "A2", "B1", "B2", "C1"]
    assert body["levels"][0]["status"] == "in_progress"
    assert [card["status"] for card in body["levels"][1:]] == ["locked"] * 4
    for card in body["levels"]:
        assert set(card) == {"level", "status", "progress", "skills"}
        assert set(card["skills"]) == {
            "reading", "listening", "writing", "speaking", "vocabulary", "grammar"
        }
        assert card["progress"] == 0
        for skill in card["skills"].values():
            assert skill == {"progress": 0, "certified": False}


def test_progress_requires_x_user_id_header(client):
    resp = client.get("/api/progress?language=de")
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "missing_user_id"


def test_progress_rejects_unknown_language(client):
    user_id = _create_user(client)
    resp = client.get("/api/progress?language=xx", headers={"X-User-Id": user_id})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"


def test_placement_certifies_every_level_below(client):
    user_id = _create_user(client)

    resp = client.post(
        "/api/placement/result",
        json={"language": "de", "placed_level": "B1"},
        headers={"X-User-Id": user_id},
    )
    assert resp.status_code == 200
    body = resp.json()

    # A1 and A2 fully certified for all six skills
    for card in body["levels"][:2]:
        assert card["status"] == "certified"
        assert card["progress"] == 100
        for skill in card["skills"].values():
            assert skill == {"progress": 100, "certified": True}
    # placed level in progress, above untouched
    assert body["levels"][2]["status"] == "in_progress"
    assert body["levels"][2]["progress"] == 0
    assert [card["status"] for card in body["levels"][3:]] == ["locked"] * 2
    assert body["current_level"] == "B1"
    assert body["target_level"] == "B1"

    with db_module.SessionLocal() as session:
        rows = session.scalars(
            select(LanguageProgress).where(
                LanguageProgress.user_id == user_id, LanguageProgress.language == "de"
            )
        ).all()
        events = session.scalars(
            select(ProgressEvent).where(ProgressEvent.user_id == user_id)
        ).all()

    below = [row for row in rows if row.level in ("A1", "A2")]
    untouched = [row for row in rows if row.level in ("B1", "B2", "C1")]
    assert len(below) == 12  # 2 levels x 6 skills
    assert all(row.certified and row.source == "placement" for row in below)
    assert untouched == []  # placed level and above are never written
    assert len(events) == 12  # every placement event is logged
    assert all(event.source == "placement" and event.passed is None for event in events)


def test_placement_never_uncertifies(client):
    user_id = _create_user(client)
    client.post(
        "/api/placement/result",
        json={"language": "de", "placed_level": "B1"},
        headers={"X-User-Id": user_id},
    )
    # A lower placement must not revoke the earlier certification
    resp = client.post(
        "/api/placement/result",
        json={"language": "de", "placed_level": "A2"},
        headers={"X-User-Id": user_id},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["levels"][0]["status"] == "certified"  # A1 stays
    assert body["levels"][1]["status"] == "certified"  # A2 untouched by this call
    assert body["current_level"] == "B1"


def test_placement_requires_existing_user(client):
    resp = client.post(
        "/api/placement/result",
        json={"language": "de", "placed_level": "A2"},
        headers={"X-User-Id": "u_nope"},
    )
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "user_not_found"


def test_placement_rejects_unknown_level(client):
    user_id = _create_user(client)
    resp = client.post(
        "/api/placement/result",
        json={"language": "de", "placed_level": "D1"},
        headers={"X-User-Id": user_id},
    )
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"
