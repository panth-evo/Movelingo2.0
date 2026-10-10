"""Shared FastAPI dependencies. Created at B0 because main.py is frozen afterwards."""
from fastapi import Header, HTTPException


def get_user_id(x_user_id: str | None = Header(default=None, alias="X-User-Id")) -> str:
    """Read the contract's X-User-Id header (CONTRACT.md sections 2 and 5).

    Endpoints that need an identity declare:  user_id: str = Depends(get_user_id)
    POST /api/users is exempt (the client has no id yet).
    """
    if not x_user_id:
        raise HTTPException(
            status_code=400,
            detail={"code": "missing_user_id", "message": "Missing X-User-Id header"},
        )
    return x_user_id
