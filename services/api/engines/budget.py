def calculate_savings_gap(one_time: list[dict], monthly: list[dict], savings_eur: float | None) -> float | None:
    """
    Calculate the savings gap based on one-time fees and 3 months of monthly costs.
    Returns None if all amounts are unknown (null) or if savings_eur is unknown.
    """
    unverified_count = sum(1 for item in one_time + monthly if item.get("amount") is None)
    
    # If every item is unverified and we have at least one item, we cannot calculate a gap
    if unverified_count == len(one_time) + len(monthly) and (len(one_time) > 0 or len(monthly) > 0):
        return None
        
    if savings_eur is None:
        return None
        
    known_one_time = sum(item["amount"] for item in one_time if item.get("amount") is not None)
    known_monthly = sum(item["amount"] for item in monthly if item.get("amount") is not None)
    
    return known_one_time + (3 * known_monthly) - savings_eur
