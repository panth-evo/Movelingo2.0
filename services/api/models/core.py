"""Core MoveLingo tables (CONTRACT.md sections 4 and 6). Person B."""
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    created_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class UserProfile(Base):
    """ProfileInput as JSON plus the fields the backend derives from it."""

    __tablename__ = "user_profiles"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    profile: Mapped[dict] = mapped_column(JSON)
    target_country: Mapped[str] = mapped_column(String(2))
    language: Mapped[str] = mapped_column(String(2))
    updated_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    language: Mapped[str] = mapped_column(String(2), index=True)
    plan: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class LanguageProgress(Base):
    """One row per (user, language, level, skill) - CONTRACT.md section 4."""

    __tablename__ = "language_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "language", "level", "skill", name="uq_progress_key"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    language: Mapped[str] = mapped_column(String(2), index=True)
    level: Mapped[str] = mapped_column(String(2))
    skill: Mapped[str] = mapped_column(String(16))
    attempted: Mapped[float] = mapped_column(Float, default=0.0)
    correct: Mapped[float] = mapped_column(Float, default=0.0)
    exam_history: Mapped[list] = mapped_column(JSON, default=list)  # last 3 ratios
    exam_best: Mapped[float] = mapped_column(Float, default=0.0)
    certified: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str | None] = mapped_column(String(16), nullable=True)
    updated_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class ProgressEvent(Base):
    """Append-only log of every progress event."""

    __tablename__ = "progress_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    language: Mapped[str] = mapped_column(String(2))
    level: Mapped[str] = mapped_column(String(2))
    skill: Mapped[str] = mapped_column(String(16))
    source: Mapped[str] = mapped_column(String(16))
    attempted: Mapped[float] = mapped_column(Float)
    correct: Mapped[float] = mapped_column(Float)
    section_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    label: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(16), default="todo")  # todo|uploaded|done
    expires_on: Mapped[str | None] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    needs_translation: Mapped[bool] = mapped_column(Boolean, default=False)
    needs_apostille: Mapped[bool] = mapped_column(Boolean, default=False)
