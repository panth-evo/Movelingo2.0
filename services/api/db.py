"""Database setup for MoveLingo (CONTRACT.md section 2). Owned by Person B."""
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

API_DIR = Path(__file__).resolve().parent

# Support PostgreSQL via DATABASE_URL, fallback to SQLite for local/tests
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{API_DIR.as_posix()}/movelingo.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Declarative base. Every file in models/ registers itself via models/__init__."""


def get_db():
    """FastAPI dependency: one session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
