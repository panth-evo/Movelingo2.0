import sys
from datetime import date, timedelta
from pathlib import Path

# Add the parent directory to sys.path so we can import from the api directory
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app

def seed_demo():
    print("Seeding demo user...")
    with TestClient(app) as client:
        # Create user
        resp = client.post("/api/users")
        if resp.status_code != 200:
            print(f"Failed to create user: {resp.text}")
            return
        user_id = resp.json()["user_id"]
        print(f"Created user: {user_id}")
        
        headers = {"X-User-Id": user_id}
        
        # Save profile
        profile_data = {
            "age": 30,
            "nationality": "US",
            "current_country": "US",
            "passport_valid_until": (date.today() + timedelta(days=365*3)).isoformat(),
            "marital_status": "single",
            "dependants": 0,
            "education": {"highest": "Bachelors", "field": "CS", "university": "MIT", "graduation_year": 2020, "grade": "A"},
            "work": {"profession": "Developer", "years_experience": 3.0, "salary_range": "60k-80k", "job_offer": True, "sponsor": False},
            "goal": {"purpose": "work", "target_country": "DE", "target_city": "Berlin", "move_deadline": (date.today() + timedelta(days=270)).isoformat()}, # 9 months
            "finance": {"savings_eur": 10000.0, "monthly_budget_eur": 2000.0, "open_to_loans": False},
            "languages_known": [{"language": "de", "self_level": "A1"}],
            "study": {"hours_per_day": 2.0, "style": "visual", "device": "laptop", "weakest_skill": "speaking"}
        }
        
        resp = client.put(f"/api/users/{user_id}/profile", json=profile_data, headers=headers)
        if resp.status_code != 200:
            print(f"Failed to save profile: {resp.text}")
            return
            
        print("Saved Germany profile (Current A1, deadline 9 months away).")
        
        # Generate plan
        resp = client.post("/api/plan/generate", json={"language": "de"}, headers=headers)
        if resp.status_code != 200:
            print(f"Failed to generate plan: {resp.text}")
            return
            
        plan = resp.json()
        print(f"Generated plan! Required level: {plan.get('required_level')}.")
        print(f"---")
        print(f"USER_ID: {user_id}")
        print(f"---")

if __name__ == "__main__":
    seed_demo()
