"""Core MoveLingo tables (CONTRACT.md sections 4 and 6). Person B."""
import os
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from db import Base

if os.environ.get("DATABASE_URL", "sqlite").startswith("sqlite"):
    EmbeddingType = JSON
else:
    try:
        from pgvector.sqlalchemy import Vector
        EmbeddingType = Vector(1536)
    except ImportError:
        EmbeddingType = JSON


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

# --- LEARNING ENGINE MODELS (Phase 2) ---

class LearnerTwin(Base):
    """Tracks granular grammar and vocabulary mastery per user."""
    __tablename__ = "learner_twin"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    concept_id: Mapped[str] = mapped_column(String(100)) # e.g. 'de_grammar_past_tense'
    mastery: Mapped[float] = mapped_column(Float, default=0.0) # 0 to 1
    confusion_pairs: Mapped[list] = mapped_column(JSON, default=list) # e.g. ["das", "dass"]
    last_seen: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class ReviewQueue(Base):
    """ForgetLess Spaced Repetition Scheduler queue."""
    __tablename__ = "review_queue"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    item_id: Mapped[str] = mapped_column(String(100)) # e.g. 'word_hund'
    due_at: Mapped[str] = mapped_column(String(40)) # ISO timestamp
    stability: Mapped[float] = mapped_column(Float, default=0.0) # FSRS stability
    difficulty: Mapped[float] = mapped_column(Float, default=0.0) # FSRS difficulty


class Mistake(Base):
    """MistakeMind error classification."""
    __tablename__ = "mistakes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    concept_id: Mapped[str] = mapped_column(String(100))
    error_type: Mapped[str] = mapped_column(String(50)) # e.g. 'L1_interference', 'conjugation'
    text: Mapped[str] = mapped_column(String(500)) # The wrong text the user submitted
    timestamp: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class TeachbackSession(Base):
    """User voice/text explanations and grading."""
    __tablename__ = "teachback_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    concept_id: Mapped[str] = mapped_column(String(100))
    text_input: Mapped[str] = mapped_column(String(2000))
    grade: Mapped[float] = mapped_column(Float) # Score
    feedback: Mapped[str] = mapped_column(String(1000)) # AI's response/feedback


# --- KNOWLEDGE RAG MODELS (Phase 3) ---

class KnowledgeChunk(Base):
    """Vector database for RAG (Retrieval-Augmented Generation)."""
    __tablename__ = "knowledge_chunks"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(2000))
    embedding: Mapped[list] = mapped_column(EmbeddingType) # pgvector Vector if postgres, else JSON
    country: Mapped[str] = mapped_column(String(2)) # e.g. 'DE', 'ES'
    type: Mapped[str] = mapped_column(String(50)) # e.g. 'grammar', 'visa_rule'
    cefr: Mapped[str | None] = mapped_column(String(2), nullable=True) # e.g. 'A1'
    source: Mapped[str] = mapped_column(String(200)) # e.g. 'tatoeba', 'bmi.bund.de'
    license: Mapped[str | None] = mapped_column(String(50), nullable=True)
    last_verified: Mapped[str | None] = mapped_column(String(40), nullable=True)

# --- ADAPT LEARNING ENGINE TABLES (Required for Person C) ---

class Assessment(Base):
    """Explicit overarching mock exams / placement tests."""
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    type: Mapped[str] = mapped_column(String(50)) # 'placement' or 'mock_exam'
    language: Mapped[str] = mapped_column(String(2))
    target_level: Mapped[str | None] = mapped_column(String(2), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class AssessmentResult(Base):
    """Detailed section-by-section results for an assessment."""
    __tablename__ = "assessment_results"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(Integer, index=True)
    skill: Mapped[str] = mapped_column(String(20)) # 'reading', 'writing', etc.
    attempted: Mapped[float] = mapped_column(Float)
    correct: Mapped[float] = mapped_column(Float)
    passed: Mapped[bool] = mapped_column(Boolean)


class Lesson(Base):
    """Micro-lessons generated for the user."""
    __tablename__ = "lessons"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    concept_id: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="todo") # 'todo', 'completed'
    created_at: Mapped[str] = mapped_column(String(40), default=utcnow_iso)


class Exercise(Base):
    """Targeted exercises for practice."""
    __tablename__ = "exercises"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int | None] = mapped_column(Integer, index=True, nullable=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    type: Mapped[str] = mapped_column(String(50)) # 'cloze', 'translation'
    prompt_text: Mapped[str] = mapped_column(String(1000))
    answer_text: Mapped[str | None] = mapped_column(String(1000), nullable=True)


