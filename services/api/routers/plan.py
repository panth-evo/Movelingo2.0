import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_db
from deps import get_user_id
from engines.plan_generator import generate_plan_dict
from models.core import Plan, UserProfile, Document
from schemas.core import PlanResult, ProfileInput, RelocationInfo

router = APIRouter(prefix="/api/plan", tags=["plan"])

class GenerateInput(BaseModel):
    language: str

@router.post("/generate", response_model=PlanResult)
def generate_plan_route(
    data: GenerateInput,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    profile_model = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile_model:
        raise HTTPException(status_code=404, detail={"code": "profile_not_found", "message": "User profile not found"})
        
    # Read the JSON column and validate it into our Pydantic model
    profile_json = profile_model.profile
    profile = ProfileInput.model_validate(profile_json)
    
    target_country = profile.goal.target_country.lower()
    
    # Load RelocationInfo
    # The file should be at movelingo/data/countries/{de,es,fr,it}/relocation/relocation.json
    relo_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "countries" / target_country / "relocation" / "relocation.json"
    
    if not relo_path.exists():
        raise HTTPException(status_code=404, detail={"code": "relocation_not_found", "message": f"Relocation data for {target_country} not found"})
        
    with open(relo_path, "r", encoding="utf-8") as f:
        relo_data = json.load(f)
    
    relo = RelocationInfo.model_validate(relo_data)
    
    # Generate deterministic plan
    plan_dict = generate_plan_dict(db, user_id, data.language, profile, relo)
    
    # Seed document vault
    existing_docs = {d.label for d in db.query(Document).filter(Document.user_id == user_id).all()}
    for checklist_item in plan_dict["document_checklist"]:
        if checklist_item["label"] not in existing_docs:
            doc_id = str(uuid.uuid4())
            db_doc = Document(
                id=doc_id,
                user_id=user_id,
                label=checklist_item["label"],
                status="todo",
                needs_translation=checklist_item["needs_translation"],
                needs_apostille=checklist_item["needs_apostille"]
            )
            db.add(db_doc)
            existing_docs.add(checklist_item["label"])
    
    plan_id = str(uuid.uuid4())
    db_plan = Plan(
        id=plan_id,
        user_id=user_id,
        language=data.language,
        plan=plan_dict
    )
    db.add(db_plan)
    db.commit()
    
    return plan_dict

@router.get("", response_model=PlanResult)
def get_plan_route(
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """GET /api/plan returns the latest plan or 404"""
    latest_plan = db.query(Plan).filter(Plan.user_id == user_id).order_by(Plan.created_at.desc()).first()
    if not latest_plan:
        raise HTTPException(status_code=404, detail={"code": "plan_not_found", "message": "No plan found"})
        
    return latest_plan.plan
