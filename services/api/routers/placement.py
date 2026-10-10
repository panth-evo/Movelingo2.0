"""POST /api/placement/result (CONTRACT.md sections 4 and 5). Person B."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from deps import get_user_id
from engines.progress_engine import certify_levels_below, compute_progress
from models.core import User
from schemas.core import PlacementInput, ProgressResponse

router = APIRouter()


@router.post("/placement/result", response_model=ProgressResponse)
def placement_result(
    payload: PlacementInput,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
) -> ProgressResponse:
    if db.get(User, user_id) is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": f"No user with id {user_id}"},
        )
    certify_levels_below(db, user_id, payload.language, payload.placed_level)
    return compute_progress(db, user_id, payload.language)
