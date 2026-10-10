import math
from datetime import date, timedelta
from typing import Any, Dict

from sqlalchemy.orm import Session

from schemas.core import ProfileInput, RelocationInfo, PlanResult
from engines.budget import calculate_savings_gap
from engines.deadlines import get_days_to_deadline

try:
    from ai.llm_client import generate_json
except ImportError:
    generate_json = None

try:
    from engines.progress_engine import compute_progress
except ImportError:
    compute_progress = None

HOURS_PER_LEVEL = {"A1": 80, "A2": 100, "B1": 150, "B2": 200, "C1": 250}
LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"]

def get_current_level(db: Session, user_id: str, language: str, profile: ProfileInput) -> str:
    """Determine the current CEFR level for the target language."""
    if compute_progress is not None:
        try:
            progress = compute_progress(db, user_id, language)
            if progress:
                return progress.current_level
        except Exception:
            pass
            
    # Fallback to self-reported highest level
    known = [k.self_level for k in profile.languages_known if k.language == language]
    if known:
        # Return the highest level known
        for level in reversed(LEVEL_ORDER):
            if level in known:
                return level
    return "A1"

def calculate_hours_needed(current: str, required: str) -> int:
    """Calculate total hours needed to reach required level from current level."""
    try:
        curr_idx = LEVEL_ORDER.index(current)
        req_idx = LEVEL_ORDER.index(required)
    except ValueError:
        return 0
        
    if curr_idx >= req_idx:
        return 0
        
    hours = 0
    # Sum hours for levels *above* current up to required
    for i in range(curr_idx + 1, req_idx + 1):
        hours += HOURS_PER_LEVEL[LEVEL_ORDER[i]]
    return hours

def build_weekly_plan(hours_needed: int, weekly_hours: float, weakest_skill: str) -> list[Dict[str, Any]]:
    skills = ["reading", "listening", "writing", "speaking"]
    try:
        start_idx = skills.index(weakest_skill)
    except ValueError:
        start_idx = 0
        
    weeks_to_target = math.ceil(hours_needed / weekly_hours) if weekly_hours > 0 else 0
    plan = []
    
    for week in range(1, weeks_to_target + 1):
        skill = skills[(start_idx + week - 1) % 4]
        
        focus_text = f"Focus on {skill} exercises and practice exams."
        if generate_json is not None:
            try:
                # Ask LLM for a one-line focus. Mock mode will return a mock response or fallback.
                res = generate_json(
                    task="weekly_focus",
                    system="You are a language tutor. Write one short sentence.",
                    user=f"Write a one-line study focus for week {week} focusing on {skill}.",
                    schema={"type": "object", "properties": {"focus": {"type": "string"}}, "required": ["focus"]}
                )
                if res and not res.get("_mock") and "focus" in res:
                    focus_text = res["focus"]
            except Exception:
                pass
                
        plan.append({
            "week": week,
            "focus": focus_text,
            "hours": weekly_hours,
            "skill_focus": skill
        })
    return plan

def generate_plan_dict(db: Session, user_id: str, language: str, profile: ProfileInput, relo: RelocationInfo) -> dict:
    """Generate the deterministic plan dict matching PlanResult schema."""
    risks = []
    
    # 1. Route
    valid_routes = [r for r in relo.routes if r.purpose == profile.goal.purpose]
    if profile.work.job_offer:
        # Prefer routes requiring job offer (simple check in eligibility text)
        preferred = [r for r in valid_routes if "job offer" in " ".join(r.eligibility).lower()]
        if preferred:
            valid_routes = preferred
            
    route = valid_routes[0] if valid_routes else relo.routes[0]
    required_level = route.required_language_level
    if not required_level:
        required_level = "B1"
        risks.append("Language requirement not yet verified")
        
    # 2. Current level
    current_level = get_current_level(db, user_id, language, profile)
    
    # 3. Hours and deadlines
    risks.append("Study hours per level are an assumption")
    hours_needed = calculate_hours_needed(current_level, required_level)
    weekly_hours = profile.study.hours_per_day * 5
    weeks_to_target = math.ceil(hours_needed / weekly_hours) if weekly_hours > 0 else 0
    
    days_to_deadline = get_days_to_deadline(profile.goal.move_deadline)
    on_track = (weeks_to_target * 7 + 14) <= days_to_deadline
    
    # 4. Weekly plan
    weekly_plan = build_weekly_plan(hours_needed, weekly_hours, profile.study.weakest_skill)
    
    # 5. Budget
    one_time = [{"label": f.label, "amount": f.amount, "source_url": f.source_url} for f in route.fees]
    monthly = [] # Assuming rent or other monthly costs could be added here from cities if needed
    
    unverified_count = sum(1 for item in one_time + monthly if item["amount"] is None)
    if unverified_count > 0:
        risks.append(f"Budget is partial: {unverified_count} items not yet verified")
        
    savings_gap = calculate_savings_gap(one_time, monthly, profile.finance.savings_eur)

    # 6. Milestones
    milestones = []
    # Count back from deadline
    deadline = profile.goal.move_deadline
    milestones.append({"id": "move", "label": "Move date", "due_date": deadline.isoformat()})
    
    visa_due = deadline - timedelta(days=60)
    milestones.append({"id": "visa", "label": "Visa appointment", "due_date": visa_due.isoformat()})
    
    exam_due = deadline - timedelta(days=90)
    milestones.append({"id": "exam", "label": "Exam booked", "due_date": exam_due.isoformat()})
    
    docs_due = deadline - timedelta(days=120)
    milestones.append({"id": "docs", "label": "Documents ready", "due_date": docs_due.isoformat()})
    
    # Sort milestones chronologically
    milestones.sort(key=lambda x: x["due_date"])
    
    doc_checklist = [{"id": c.id, "label": c.label, "needs_translation": c.needs_translation, "needs_apostille": c.needs_apostille} for c in relo.checklist]
    cities = [{"name": c.name, "rent_range_eur": c.rent_range_eur, "note": c.note} for c in relo.cities]
    sources = [{"label": s.label, "url": s.url, "last_verified": s.last_verified} for s in relo.sources]
    
    return {
        "target_country": profile.goal.target_country,
        "language": language,
        "recommended_route": route.name,
        "required_level": required_level,
        "current_level": current_level,
        "weeks_to_target": weeks_to_target,
        "days_to_deadline": days_to_deadline,
        "on_track": on_track,
        "weekly_plan": weekly_plan,
        "budget": {
            "currency": "EUR",
            "one_time": one_time,
            "monthly": monthly,
            "savings_gap": savings_gap
        },
        "document_checklist": doc_checklist,
        "cities": cities,
        "milestones": milestones,
        "risks": risks,
        "sources": sources,
        "disclaimer": "Not legal advice. Check the official site."
    }
