"""GET /api/progress (CONTRACT.md section 5). Person B."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from deps import get_user_id
from engines.progress_engine import compute_progress
from schemas.core import Language, ProgressResponse

router = APIRouter()


@router.get("/progress", response_model=ProgressResponse)
def get_progress(
    language: Language,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
) -> ProgressResponse:
    return compute_progress(db, user_id, language)
