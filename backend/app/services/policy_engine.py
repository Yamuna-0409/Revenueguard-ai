def get_recovery_action(risk_level, failure_reason):

    if risk_level == "HIGH":
        return {
            "action": "manual_review",
            "priority": "urgent",
            "message": "Payment requires manual review"
        }

    if failure_reason == "insufficient_funds":
        return {
            "action": "retry_payment",
            "priority": "high",
            "message": "Retry payment after customer notification"
        }

    if risk_level == "MEDIUM":
        return {
            "action": "customer_notification",
            "priority": "medium",
            "message": "Notify customer about payment failure"
        }

    return {
        "action": "monitor",
        "priority": "low",
        "message": "Monitor payment"
    }