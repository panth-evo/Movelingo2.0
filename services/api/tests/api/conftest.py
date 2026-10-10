"""Fixtures for B's API tests. Every test gets a temp SQLite file; the real
services/api/movelingo.db is never touched."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import db as db_module
import main
from db import Base


@pytest.fixture()
def engine(tmp_path):
    eng = create_engine(
        f"sqlite:///{(tmp_path / 'test.db').as_posix()}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture()
def session(engine, monkeypatch):
    maker = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    monkeypatch.setattr(db_module, "engine", engine)
    monkeypatch.setattr(db_module, "SessionLocal", maker)
    db = maker()
    yield db
    db.close()


@pytest.fixture()
def client(engine, monkeypatch):
    maker = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    monkeypatch.setattr(db_module, "engine", engine)
    monkeypatch.setattr(db_module, "SessionLocal", maker)
    with TestClient(main.app) as test_client:
        yield test_client


@pytest.fixture()
def profile_payload() -> dict:
    """A complete valid ProfileInput (CONTRACT.md section 6)."""
    return {
        "age": 30,
        "nationality": "US",
        "current_country": "US",
        "passport_valid_until": "2030-01-31",
        "marital_status": "single",
        "dependants": 0,
        "education": {
            "highest": "bachelor",
            "field": "computer science",
            "university": "State University",
            "graduation_year": 2016,
            "grade": "3.5",
        },
        "work": {
            "profession": "software engineer",
            "years_experience": 8,
            "salary_range": "60000-80000",
            "job_offer": False,
            "sponsor": False,
        },
        "goal": {
            "purpose": "work",
            "target_country": "DE",
            "target_city": "Berlin",
            "move_deadline": "2027-07-15",
        },
        "finance": {
            "savings_eur": 15000,
            "monthly_budget_eur": 1800,
            "open_to_loans": True,
        },
        "languages_known": [
            {"language": "en", "self_level": "C1"},
            {"language": "de", "self_level": "A1"},
        ],
        "study": {
            "hours_per_day": 2,
            "style": "practice",
            "device": "laptop",
            "weakest_skill": "speaking",
        },
    }
