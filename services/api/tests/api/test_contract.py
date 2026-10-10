from datetime import date, timedelta

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_contract_e2e_flow():
    with TestClient(app) as client:
        # 1. POST /api/users
        resp = client.post("/api/users")
        assert resp.status_code == 200, resp.json()
        user_id = resp.json()["user_id"]
        
        headers = {"X-User-Id": user_id}
        
        # 2. PUT /api/users/{user_id}/profile
        profile_data = {
            "age": 30,
            "nationality": "US",
            "current_country": "US",
            "passport_valid_until": (date.today() + timedelta(days=365)).isoformat(),
            "marital_status": "single",
            "dependants": 0,
            "education": {"highest": "Bachelors", "field": "CS", "university": "MIT", "graduation_year": 2020, "grade": "A"},
            "work": {"profession": "Developer", "years_experience": 3.0, "salary_range": "60k-80k", "job_offer": True, "sponsor": False},
            "goal": {"purpose": "work", "target_country": "DE", "target_city": "Berlin", "move_deadline": (date.today() + timedelta(days=200)).isoformat()},
            "finance": {"savings_eur": 5000.0, "monthly_budget_eur": 2000.0, "open_to_loans": False},
            "languages_known": [{"language": "de", "self_level": "A1"}],
            "study": {"hours_per_day": 2.0, "style": "visual", "device": "laptop", "weakest_skill": "speaking"}
        }
        resp = client.put(f"/api/users/{user_id}/profile", json=profile_data, headers=headers)
        assert resp.status_code == 200, resp.json()
        assert resp.json()["ok"] is True
        
        # 3. POST /api/plan/generate
        resp = client.post("/api/plan/generate", json={"language": "de"}, headers=headers)
        assert resp.status_code == 200, resp.json()
        plan_data = resp.json()
        assert plan_data["language"] == "de"
        assert plan_data["target_country"] == "DE"
        
        # 4. GET /api/progress?language=de
        resp = client.get("/api/progress?language=de", headers=headers)
        assert resp.status_code == 200, resp.json()
        progress_data = resp.json()
        assert progress_data["language"] == "de"
        assert len(progress_data["levels"]) == 5
        
        # 5. POST /api/placement/result
        resp = client.post("/api/placement/result", json={"language": "de", "placed_level": "A2"}, headers=headers)
        assert resp.status_code == 200, resp.json()
        placement_progress = resp.json()
        # placement of A2 implies everything below (A1) is certified
        assert placement_progress["levels"][0]["status"] == "certified" 
        
        # 6. GET /api/relocation/de
        resp = client.get("/api/relocation/de", headers=headers)
        assert resp.status_code == 200, resp.json()
        relo_data = resp.json()
        assert relo_data["country"] == "DE"
        
        # 7. GET /api/documents
        resp = client.get("/api/documents", headers=headers)
        assert resp.status_code == 200, resp.json()
        docs = resp.json()
        assert isinstance(docs, list)
        assert len(docs) > 0  # Should be seeded by plan generation
