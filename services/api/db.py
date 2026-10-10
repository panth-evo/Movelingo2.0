"""Database setup for MoveLingo (CONTRACT.md section 2). Owned by Person B."""
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

API_DIR = Path(__file__).resolve().parent
# Always services/api/movelingo.db, regardless of the working directory.
DB_PATH = API_DIR / "movelingo.db"

engine = create_engine(
    f"sqlite:///{DB_PATH.as_posix()}",
    connect_args={"check_same_thread": False},
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
