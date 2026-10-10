from datetime import date, datetime
from typing import Any, Dict

def get_days_to_deadline(move_deadline: date) -> int:
    return (move_deadline - date.today()).days

def get_upcoming_reminders(documents: list[Any], milestones: list[dict]) -> list[dict]:
    """
    Returns upcoming reminders based on:
    - document expiry (within 60 days of today)
    - milestones due within 14 days
    """
    reminders = []
    today = date.today()
    
    for doc in documents:
        if doc.expires_on:
            try:
                # doc.expires_on is a YYYY-MM-DD string or date
                exp_date = date.fromisoformat(doc.expires_on) if isinstance(doc.expires_on, str) else doc.expires_on
                days_left = (exp_date - today).days
                if 0 <= days_left <= 60:
                    reminders.append({
                        "type": "document_expiry",
                        "id": doc.id,
                        "label": doc.label,
                        "days_left": days_left
                    })
            except ValueError:
                pass

    for ms in milestones:
        if ms.get("due_date"):
            try:
                # ms["due_date"] could be ISO string (from PlanResult schema)
                due = date.fromisoformat(ms["due_date"][:10]) if isinstance(ms["due_date"], str) else ms["due_date"]
                days_left = (due - today).days
                if 0 <= days_left <= 14:
                    reminders.append({
                        "type": "milestone_due",
                        "id": ms.get("id"),
                        "label": ms.get("label"),
                        "days_left": days_left
                    })
            except ValueError:
                pass
                
    # Sort reminders chronologically
    reminders.sort(key=lambda x: x["days_left"])
    return reminders

def get_document_flags(label: str, expires_on: str | None, move_deadline: date | None) -> list[str]:
    """Calculate the flags array for a document."""
    flags = []
    if not expires_on:
        return flags
        
    try:
        exp_date = date.fromisoformat(expires_on[:10]) if isinstance(expires_on, str) else expires_on
    except ValueError:
        return flags
        
    today = date.today()
    
    if 0 <= (exp_date - today).days <= 60:
        flags.append("expires_soon")
        
    if move_deadline:
        if exp_date < move_deadline:
            flags.append("expires_before_move")
            
        # "passport_check" on the passport item when it expires less than 6 months (approx 180 days) after move_deadline
        if "passport" in label.lower():
            if exp_date >= move_deadline and (exp_date - move_deadline).days < 180:
                flags.append("passport_check")
                
    return flags
