def detect_risk(amount, payment_status, failure_reason, payment_method=None):

    score = 0

    # Payment failed
    if payment_status == "failed":
        score += 40

    # Failure reason
    if failure_reason == "insufficient_funds":
        score += 30

    # High amount
    if amount >= 5000:
        score += 20

    # UPI payment
    if payment_method == "UPI":
        score += 10

    # Risk level
    if score >= 70:
        return "HIGH"

    elif score >= 40:
        return "MEDIUM"

    else:
        return "LOW"