"""Deterministic progress rules - CONTRACT.md sections 4 and 7. No LLM here.

B owns this file (section 7): C imports record_progress_event inside
try/except ImportError until this lands.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.core import LanguageProgress, Plan, ProgressEvent, utcnow_iso
from schemas.core import LevelCard, ProgressResponse, SkillMap, SkillProgress

PRODUCTIVE_WEIGHT = 6
WINDOW = 60
W_PRACTICE = 0.6
W_EXAM = 0.4
UNCERTIFIED_CAP = 99

EXAM_SKILLS = ("reading", "listening", "writing", "speaking")
EXTRA_SKILLS = ("vocabulary", "grammar")
SKILLS = EXAM_SKILLS + EXTRA_SKILLS
LEVELS = ("A1", "A2", "B1", "B2", "C1")
SOURCES = ("exam", "practice", "placement")
DEFAULT_TARGET_LEVEL = "B1"


def record_progress_event(
    db: Session,
    user_id: str,
    language: str,
    level: str,
    skill: str,
    source: str,
    attempted: float,
    correct: float,
    section_ratio: float | None = None,
    passed: bool | None = None,
) -> None:
    """Record one answered batch (section 7 signature, frozen).

    - Accumulates into (user, language, level, skill), then scales back to the
      WINDOW of the last 60 answered items (correct scales by the same factor).
    - section_ratio appends to exam_history (last 3 kept); exam_best is their max.
    - passed=True certifies the skill; nothing ever un-certifies.
    Commits, so callers (including C's submit) need no extra commit.
    """
    if source not in SOURCES:
        raise ValueError(f"invalid source: {source!r}")
    if level not in LEVELS:
        raise ValueError(f"invalid level: {level!r}")
    if skill not in SKILLS:
        raise ValueError(f"invalid skill: {skill!r}")
    if attempted < 0 or correct < 0:
        raise ValueError("attempted and correct must be >= 0")

    row = db.scalar(
        select(LanguageProgress).where(
            LanguageProgress.user_id == user_id,
            LanguageProgress.language == language,
            LanguageProgress.level == level,
            LanguageProgress.skill == skill,
        )
    )
    if row is None:
        row = LanguageProgress(
            user_id=user_id,
            language=language,
            level=level,
            skill=skill,
            attempted=0.0,
            correct=0.0,
            exam_history=[],
            exam_best=0.0,
            certified=False,
        )
        db.add(row)

    total_attempted = float(row.attempted) + float(attempted)
    total_correct = float(row.correct) + float(correct)
    if total_attempted > WINDOW:
        factor = WINDOW / total_attempted
        total_attempted = float(WINDOW)
        total_correct *= factor
    row.attempted = total_attempted
    row.correct = total_correct

    if section_ratio is not None:
        history = list(row.exam_history or []) + [float(section_ratio)]
        history = history[-3:]
        row.exam_history = history
        row.exam_best = max(history)
    if passed is True:
        row.certified = True

    row.source = source
    row.updated_at = utcnow_iso()

    db.add(
        ProgressEvent(
            user_id=user_id,
            language=language,
            level=level,
            skill=skill,
            source=source,
            attempted=float(attempted),
            correct=float(correct),
            section_ratio=None if section_ratio is None else float(section_ratio),
            passed=passed,
        )
    )
    db.commit()


def _skill_metrics(row: LanguageProgress | None) -> tuple[int, bool]:
    if row is None:
        return 0, False
    if row.certified:
        return 100, True
    attempted = float(row.attempted)
    if attempted <= 0:
        mastery = 0.0
    else:
        mastery = min(1.0, attempted / WINDOW) * (float(row.correct) / attempted)
    progress = round(100 * (W_PRACTICE * mastery + W_EXAM * float(row.exam_best or 0.0)))
    return min(UNCERTIFIED_CAP, progress), False


def compute_progress(db: Session, user_id: str, language: str) -> ProgressResponse:
    rows = db.scalars(
        select(LanguageProgress).where(
            LanguageProgress.user_id == user_id,
            LanguageProgress.language == language
        )
    ).all()
    by_key = {(row.level, row.skill): row for row in rows}

    first_open = next(
        (level for level in LEVELS
         if not all(_skill_metrics(by_key.get((level, skill)))[1] for skill in EXAM_SKILLS)),
        LEVELS[-1],
    )

    cards: list[LevelCard] = []
    for level in LEVELS:
        skill_map: dict[str, SkillProgress] = {}
        exam_progress: list[int] = []
        exam_certified = 0
        for skill in SKILLS:
            progress, certified = _skill_metrics(by_key.get((level, skill)))
            skill_map[skill] = SkillProgress(progress=progress, certified=certified)
            if skill in EXAM_SKILLS:
                exam_progress.append(progress)
                exam_certified += int(certified)
        if exam_certified == len(EXAM_SKILLS):
            status = "certified"
        elif level == first_open or sum(exam_progress) > 0:
            status = "in_progress"
        else:
            status = "locked"
        cards.append(
            LevelCard(
                level=level,
                status=status,
                progress=round(sum(exam_progress) / len(exam_progress)),
                skills=SkillMap(**skill_map),
            )
        )

    updated_at = max((row.updated_at for row in rows), default=None)
    return ProgressResponse(
        language=language,
        current_level=first_open,
        target_level=_target_level(db, user_id, language),
        updated_at=updated_at,
        levels=cards,
    )


def _target_level(db: Session, user_id: str, language: str) -> str:
    plan = db.scalar(
        select(Plan)
        .where(Plan.user_id == user_id, Plan.language == language)
        .order_by(Plan.created_at.desc())
    )
    if plan is None:
        return DEFAULT_TARGET_LEVEL
    required = (plan.plan or {}).get("required_level")
    return required if required in LEVELS else DEFAULT_TARGET_LEVEL
