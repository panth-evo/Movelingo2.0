from datetime import date, timedelta
import json
from pathlib import Path

from engines.plan_generator import generate_plan_dict, calculate_hours_needed
from schemas.core import ProfileInput, RelocationInfo

def test_calculate_hours_needed():
    # current A1, required B1
    # hours needed: A2 (100) + B1 (150) = 250
    assert calculate_hours_needed("A1", "B1") == 250
    assert calculate_hours_needed("A2", "B1") == 150
    assert calculate_hours_needed("B1", "B1") == 0
    assert calculate_hours_needed("B1", "A2") == 0  # Already surpassed

def test_generate_plan_dict_germany(monkeypatch):
    # Mocking compute_progress so it falls back to self_level
    monkeypatch.setattr("engines.plan_generator.compute_progress", None)
    
    profile = ProfileInput(
        age=30,
        nationality="US",
        current_country="US",
        passport_valid_until=date.today() + timedelta(days=365*2),
        marital_status="single",
        dependants=0,
        education={"highest": "Bachelors", "field": "CS", "university": "MIT", "graduation_year": 2020, "grade": "A"},
        work={"profession": "Developer", "years_experience": 3, "salary_range": "60k-80k", "job_offer": True, "sponsor": False},
        goal={"purpose": "work", "target_country": "DE", "target_city": "Berlin", "move_deadline": date.today() + timedelta(days=200)},
        finance={"savings_eur": 5000, "monthly_budget_eur": 2000, "open_to_loans": False},
        languages_known=[{"language": "de", "self_level": "A1"}],
        study={"hours_per_day": 2.0, "style": "visual", "device": "laptop", "weakest_skill": "speaking"}
    )
    
    relo_path = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "countries" / "de" / "relocation" / "relocation.json"
    with open(relo_path, "r", encoding="utf-8") as f:
        relo_data = json.load(f)
    relo = RelocationInfo.model_validate(relo_data)
    
    plan = generate_plan_dict(None, "user_123", "de", profile, relo)
    
    assert plan["target_country"] == "DE"
    assert plan["language"] == "de"
    # Should prefer the route that has 'job offer' in eligibility
    assert "Skilled worker" in plan["recommended_route"]
    
    # Required level was null in DE relocation data, so it defaults to B1
    assert plan["required_level"] == "B1"
    
    # Current level comes from profile languages_known
    assert plan["current_level"] == "A1"
    
    # Hours calculation: 2 hours/day * 5 = 10 weekly_hours
    # Hours needed A1 -> B1 = 250
    # Weeks to target = 250 / 10 = 25
    assert plan["weeks_to_target"] == 25
    assert len(plan["weekly_plan"]) == 25
    
    # Check rotating skill focus (started with 'speaking')
    skills = ["reading", "listening", "writing", "speaking"]
    assert plan["weekly_plan"][0]["skill_focus"] == "speaking"
    assert plan["weekly_plan"][1]["skill_focus"] == "reading" # Wraps around
