from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from db import get_db
from deps import get_user_id

# Person B: Setting up the REST skeleton.
# Person C: You will plug your CEFR Assessor and Exam Generator functions into these endpoints.

router = APIRouter(prefix="/api/assess", tags=["assess"])

class ExamSubmission(BaseModel):
    answers: dict

@router.get("/mock-exam/{level}")
def generate_mock_exam(
    level: str,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in ai/exam_generator here.
    Generates a mock exam JSON spec for a specific CEFR level (A1, A2, etc.).
    """
    # TODO (Person C): Implement Mock Exam Generation
    return {"status": "Not implemented", "user_id": user_id, "level": level}

@router.post("/mock-exam/{exam_id}/submit")
def submit_mock_exam(
    exam_id: str,
    data: ExamSubmission,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """
    Person C: Plug in engines/cefr_assessor.py here.
    Grades reading/listening via answer key and writing/speaking via AI rubrics.
    Should call engines.progress_engine.record_progress_event internally.
    """
    # TODO (Person C): Implement Exam Grading and record_progress_event
    return {"status": "Not implemented", "user_id": user_id, "exam_id": exam_id}
