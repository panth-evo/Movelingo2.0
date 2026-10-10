from datetime import date, timedelta
from engines.deadlines import get_document_flags

def test_document_flags_no_deadline():
    today = date.today()
    exp = today + timedelta(days=30)
    flags = get_document_flags("Degree", exp.isoformat(), None)
    assert "expires_soon" in flags
    assert "expires_before_move" not in flags

def test_document_flags_passport():
    today = date.today()
    move = today + timedelta(days=100)
    exp = move + timedelta(days=90) # Less than 180 days after move
    flags = get_document_flags("Passport", exp.isoformat(), move)
    assert "passport_check" in flags
    assert "expires_before_move" not in flags

def test_document_flags_expires_before_move():
    today = date.today()
    move = today + timedelta(days=200)
    exp = today + timedelta(days=150)
    flags = get_document_flags("Visa", exp.isoformat(), move)
    assert "expires_before_move" in flags

def test_document_flags_expires_soon():
    today = date.today()
    move = today + timedelta(days=100)
    exp = today + timedelta(days=10)
    flags = get_document_flags("ID", exp.isoformat(), move)
    assert "expires_before_move" in flags
    assert "expires_soon" in flags
