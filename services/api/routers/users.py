"""Users and profile endpoints (CONTRACT.md section 5). Person B."""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.core import User, UserProfile, utcnow_iso
from schemas.core import Ok, ProfileInput, UserCreated

router = APIRouter()

COUNTRY_TO_LANGUAGE = {"DE": "de", "ES": "es", "FR": "fr", "IT": "it"}


@router.post("/users", response_model=UserCreated)
def create_user(db: Session = Depends(get_db)) -> UserCreated:
    user = User(id="u_" + uuid.uuid4().hex[:16])
    db.add(user)
    db.commit()
    return UserCreated(user_id=user.id)


@router.put("/users/{user_id}/profile", response_model=Ok)
def save_profile(
    user_id: str,
    profile: ProfileInput,
    db: Session = Depends(get_db),
) -> Ok:
    if db.get(User, user_id) is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": f"No user with id {user_id}"},
        )
    target_country = profile.goal.target_country
    language = COUNTRY_TO_LANGUAGE[target_country]
    data = profile.model_dump(mode="json")
    row = db.get(UserProfile, user_id)
    if row is None:
        db.add(
            UserProfile(
                user_id=user_id,
                profile=data,
                target_country=target_country,
                language=language,
            )
        )
    else:
        row.profile = data
        row.target_country = target_country
        row.language = language
        row.updated_at = utcnow_iso()
    db.commit()
    return Ok(ok=True)
