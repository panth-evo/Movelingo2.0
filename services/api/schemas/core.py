"""Pydantic v2 schemas for CONTRACT.md section 6 (Person B).

extra="forbid" on every model: responses must match the contract exactly.
Keys stay required unless section 6 marks them with "?"; a value that is
unknown may be null ("Unknown numbers are null, never invented").
"""
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Language = Literal["de", "es", "fr", "it"]
Level = Literal["A1", "A2", "B1", "B2", "C1"]
ExamSkill = Literal["reading", "listening", "writing", "speaking"]
TargetCountry = Literal["DE", "ES", "FR", "IT"]
LevelStatus = Literal["certified", "in_progress", "locked"]
ProgressSource = Literal["exam", "practice", "placement"]


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


# --- ProfileInput (section 6) ---

class Education(Strict):
    highest: str
    field: str | None
    university: str | None
    graduation_year: int | None
    grade: str | None


class Work(Strict):
    profession: str | None
    years_experience: float | None
    salary_range: str | None
    job_offer: bool
    sponsor: bool


class Goal(Strict):
    purpose: Literal["work", "study", "settle", "family"]
    target_country: TargetCountry
    target_city: str | None = None
    move_deadline: date  # YYYY-MM-DD


class Finance(Strict):
    savings_eur: float | None
    monthly_budget_eur: float | None
    open_to_loans: bool


class LanguageKnown(Strict):
    # Any language the user knows (e.g. "en"); section 1 defines only the
    # languages MoveLingo teaches, not the languages a learner may already speak.
    language: str
    self_level: Level
    certificate: str | None = None


class Study(Strict):
    hours_per_day: float
    style: Literal["visual", "audio", "reading", "practice"]
    device: str
    weakest_skill: ExamSkill


class ProfileInput(Strict):
    age: int
    nationality: str
    current_country: str
    passport_valid_until: date | None  # YYYY-MM-DD
    marital_status: str
    dependants: int
    education: Education
    work: Work
    goal: Goal
    finance: Finance
    languages_known: list[LanguageKnown]
    study: Study


# --- small endpoint responses (section 5) ---

class UserCreated(Strict):
    user_id: str


class Ok(Strict):
    ok: bool


# --- ProgressResponse (section 6) ---

class SkillProgress(Strict):
    progress: int = Field(ge=0, le=100)
    certified: bool


class SkillMap(Strict):
    reading: SkillProgress
    listening: SkillProgress
    writing: SkillProgress
    speaking: SkillProgress
    vocabulary: SkillProgress
    grammar: SkillProgress


class LevelCard(Strict):
    level: Level
    status: LevelStatus
    progress: int = Field(ge=0, le=100)
    skills: SkillMap


class ProgressResponse(Strict):
    language: Language
    current_level: Level
    target_level: Level
    updated_at: str | None
    levels: list[LevelCard] = Field(min_length=5, max_length=5)
