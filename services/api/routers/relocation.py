"""GET /api/relocation/{country} (CONTRACT.md sections 5 and 9).

Loads data/countries/<cc>/relocation/relocation.json. Unknown numbers stay
null until a human verifies them on an official page (see data/countries/README.md).
"""
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.core import RelocationInfo

router = APIRouter()

API_DIR = Path(__file__).resolve().parents[1]  # services/api
REPO_ROOT = API_DIR.parent.parent  # repo root
COUNTRIES_DIR = REPO_ROOT / "data" / "countries"
COUNTRIES = ("DE", "ES", "FR", "IT")


def load_relocation(country: str) -> RelocationInfo:
    path = COUNTRIES_DIR / country.lower() / "relocation" / "relocation.json"
    if not path.is_file():
        raise HTTPException(
            status_code=404,
            detail={"code": "not_found", "message": f"Unknown country {country}"},
        )
    raw = json.loads(path.read_text(encoding="utf-8"))
    # A broken data file fails validation and surfaces as a 500 via the global handler.
    return RelocationInfo.model_validate(raw)


@router.get("/relocation/{country}", response_model=RelocationInfo)
def get_relocation(country: str) -> RelocationInfo:
    code = country.upper()
    if code not in COUNTRIES:
        raise HTTPException(
            status_code=404,
            detail={"code": "not_found", "message": f"Unknown country {country}"},
        )
    return load_relocation(code)
