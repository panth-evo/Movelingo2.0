from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from db import get_db
from deps import get_user_id

# Person B: Setting up the REST skeleton.
# Person C: You will plug your ADAPT engine functions (Understand, PracticeGen, MistakeMind) into these endpoints.

router = APIRouter(prefix="/api/learn", tags=["learn"])

class CaptureInput(BaseModel):
    text: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None

class MistakeInput(BaseModel):
    concept_id: str
    user_input: str

class TeachbackInput(BaseModel):
    concept_id: str
    explanation_text: str

@router.post("/capture")
def capture_content(
    data: CaptureInput,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in engines/understand.py here.
    Detects language, topic, CEFR difficulty.
    """
    # TODO (Person C): Implement LLM understand logic
    return {"status": "Not implemented", "user_id": user_id}

@router.get("/practice")
def generate_practice(
    concept_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in engines/practice_generator.py here.
    Generates exercises targeting this learner's next need.
    """
    # TODO (Person C): Implement Practice Generator
    return {"status": "Not implemented", "user_id": user_id}

@router.post("/mistake")
def report_mistake(
    data: MistakeInput,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in engines/mistakemind.py here.
    Classifies errors and auto-builds a micro-lesson.
    """
    # TODO (Person C): Implement MistakeMind
    return {"status": "Not implemented", "user_id": user_id}

@router.post("/teachback")
def submit_teachback(
    data: TeachbackInput,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in engines/teachback.py here.
    Grades user explanations against CEFR descriptors.
    """
    # TODO (Person C): Implement TeachBack grading
    return {"status": "Not implemented", "user_id": user_id}

@router.get("/review")
def get_review_queue(
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in engines/forgetless.py here.
    Fetches items due for review via Spaced Repetition.
    """
    # TODO (Person C): Implement ForgetLess retrieval
    return {"status": "Not implemented", "user_id": user_id}
