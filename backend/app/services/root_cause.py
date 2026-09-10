def find_root_cause(failure_reason):

    if failure_reason == "insufficient_funds":
        return "Insufficient funds"

    if failure_reason == "expired_card":
        return "Expired card"

    if failure_reason == "network_error":
        return "Payment network error"

    return "Unknown payment failure"