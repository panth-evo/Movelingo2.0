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
    name: str = "User"
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


# --- placement (section 5) ---

class PlacementInput(Strict):
    language: Language
    placed_level: Level


# --- RelocationInfo (section 6) ---

class RelocationFee(Strict):
    label: str
    amount: float | None  # null until a human verifies it on an official page
    currency: str
    source_url: str | None


class RelocationRoute(Strict):
    id: str
    name: str
    purpose: Literal["work", "study", "settle", "family"]
    required_language_level: Level | None
    summary: str
    eligibility: list[str]
    fees: list[RelocationFee]
    official_url: str | None
    last_verified: str | None  # YYYY-MM-DD
    verified: bool


class ChecklistItem(Strict):
    id: str
    label: str
    needs_translation: bool
    needs_apostille: bool


class RelocationCity(Strict):
    name: str
    rent_range_eur: float | None
    note: str


class RelocationSource(Strict):
    label: str
    url: str
    last_verified: str | None


class RelocationInfo(Strict):
    country: Literal["DE", "ES", "FR", "IT"]
    routes: list[RelocationRoute]
    checklist: list[ChecklistItem]
    cities: list[RelocationCity]
    sources: list[RelocationSource]

# --- PlanResult (section 6) ---

class WeeklyPlan(Strict):
    week: int
    focus: str
    hours: float
    skill_focus: ExamSkill

class BudgetItem(Strict):
    label: str
    amount: float | None
    source_url: str | None = None

class PlanBudget(Strict):
    currency: Literal["EUR"] = "EUR"
    one_time: list[BudgetItem]
    monthly: list[BudgetItem]
    savings_gap: float | None

class PlanMilestone(Strict):
    id: str
    label: str
    due_date: str | None  # YYYY-MM-DD

class PlanResult(Strict):
    target_country: TargetCountry
    language: Language
    recommended_route: str
    required_level: Level
    current_level: Level
    weeks_to_target: int
    days_to_deadline: int
    on_track: bool
    weekly_plan: list[WeeklyPlan]
    budget: PlanBudget
    document_checklist: list[ChecklistItem]
    cities: list[RelocationCity]
    milestones: list[PlanMilestone]
    risks: list[str]
    sources: list[RelocationSource]
    disclaimer: str

# --- documents (section 5 & B4) ---

class DocumentCreate(Strict):
    label: str
    needs_translation: bool
    needs_apostille: bool
    expires_on: str | None = None  # YYYY-MM-DD

class DocumentUpdate(Strict):
    status: Literal["todo", "uploaded", "done"] | None = None
    expires_on: str | None = None

class DocumentResponse(Strict):
    id: str
    label: str
    status: Literal["todo", "uploaded", "done"]
    expires_on: str | None
    needs_translation: bool
    needs_apostille: bool
    flags: list[str]

