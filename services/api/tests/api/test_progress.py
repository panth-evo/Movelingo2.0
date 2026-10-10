"""CONTRACT.md section 4 progress rules - required cases (a) through (f)."""
from sqlalchemy import select

from engines.progress_engine import (
    PRODUCTIVE_WEIGHT,
    W_EXAM,
    W_PRACTICE,
    WINDOW,
    compute_progress,
    record_progress_event,
)
from models.core import LanguageProgress, ProgressEvent

USER = "u_test"


def record(
    session,
    *,
    skill: str = "reading",
    level: str = "A1",
    attempted: float = 0.0,
    correct: float = 0.0,
    ratio: float | None = None,
    passed: bool | None = None,
    source: str = "exam",
    language: str = "de",
) -> None:
    record_progress_event(
        session, USER, language, level, skill, source, attempted, correct, ratio, passed
    )


def test_a_new_user_every_skill_zero(session):
    resp = compute_progress(session, USER, "de")

    assert resp.language == "de"
    assert [card.level for card in resp.levels] == ["A1", "A2", "B1", "B2", "C1"]
    assert resp.current_level == "A1"
    assert resp.target_level == "B1"  # no plan yet
    assert resp.updated_at is None
    for card in resp.levels:
        assert card.progress == 0
        for skill_progress in card.skills.model_dump().values():
            assert skill_progress == {"progress": 0, "certified": False}
    assert resp.levels[0].status == "in_progress"
    assert [card.status for card in resp.levels[1:]] == ["locked", "locked", "locked", "locked"]


def test_b_formula_gives_82(session):
    assert (PRODUCTIVE_WEIGHT, WINDOW, W_PRACTICE, W_EXAM) == (6, 60, 0.6, 0.4)

    record(session, attempted=60, correct=54, ratio=0.7, passed=False)
    resp = compute_progress(session, USER, "de")

    skill = resp.levels[0].skills.reading
    # round(100 * (0.6 * 0.9 + 0.4 * 0.7)) == 82
    assert skill.progress == 82
    assert skill.certified is False

    events = session.scalars(select(ProgressEvent)).all()
    assert len(events) == 1
    assert events[0].source == "exam"
    assert events[0].section_ratio == 0.7
    assert events[0].passed is False


def test_c_passed_certifies_and_never_undoes(session):
    record(session, attempted=30, correct=18, ratio=0.6, passed=True)
    skill = compute_progress(session, USER, "de").levels[0].skills.reading
    assert skill.certified is True
    assert skill.progress == 100  # certified forces 100

    # nothing ever un-certifies, even a later failed section
    record(session, attempted=60, correct=0, ratio=0.0, passed=False)
    skill = compute_progress(session, USER, "de").levels[0].skills.reading
    assert skill.certified is True
    assert skill.progress == 100


def test_d_all_four_certified_marks_level(session):
    for skill in ("reading", "listening", "writing", "speaking"):
        record(session, skill=skill, attempted=12, correct=9, ratio=0.75, passed=True)

    resp = compute_progress(session, USER, "de")

    a1, a2 = resp.levels[0], resp.levels[1]
    assert a1.status == "certified"
    assert a1.progress == 100  # mean of the four exam skills only (vocab/grammar excluded)
    assert a2.status == "in_progress"
    assert a2.progress == 0
    assert resp.current_level == "A2"
    assert [card.status for card in resp.levels[2:]] == ["locked", "locked", "locked"]


def test_e_window_keeps_last_60(session):
    record(session, attempted=120, correct=108)

    row = session.scalar(
        select(LanguageProgress).where(
            LanguageProgress.user_id == USER,
            LanguageProgress.language == "de",
            LanguageProgress.level == "A1",
            LanguageProgress.skill == "reading",
        )
    )
    assert row is not None
    assert row.attempted == 60
    assert row.correct == 54  # scaled by the same factor 60/120

    skill = compute_progress(session, USER, "de").levels[0].skills.reading
    assert skill.progress == 54  # 0.6 * (54/60) + 0.4 * 0


def test_f_uncertain_cap_at_99(session):
    record(session, attempted=60, correct=60, ratio=1.0, passed=False)

    skill = compute_progress(session, USER, "de").levels[0].skills.reading
    assert skill.certified is False
    assert skill.progress == 99  # practice 1.0 + exam_best 1.0 still capped
