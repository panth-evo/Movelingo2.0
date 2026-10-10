from engines.budget import calculate_savings_gap

def test_savings_gap_all_null():
    one_time = [{"amount": None}, {"amount": None}]
    monthly = [{"amount": None}]
    assert calculate_savings_gap(one_time, monthly, 5000.0) is None

def test_savings_gap_partial():
    one_time = [{"amount": 100.0}, {"amount": None}]
    monthly = [{"amount": 500.0}]
    # known_one_time = 100
    # known_monthly = 500
    # gap = 100 + 3*500 - 5000 = -3400
    assert calculate_savings_gap(one_time, monthly, 5000.0) == -3400.0

def test_savings_gap_no_savings():
    one_time = [{"amount": 100.0}]
    monthly = [{"amount": 500.0}]
    assert calculate_savings_gap(one_time, monthly, None) is None

def test_savings_gap_all_known():
    one_time = [{"amount": 100.0}, {"amount": 200.0}]
    monthly = [{"amount": 500.0}, {"amount": 500.0}]
    # one_time = 300, monthly = 1000
    # gap = 300 + 3000 - 1000 = 2300
    assert calculate_savings_gap(one_time, monthly, 1000.0) == 2300.0
