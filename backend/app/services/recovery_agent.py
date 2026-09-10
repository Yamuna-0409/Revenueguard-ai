from .risk_detector import detect_risk
from .root_cause import find_root_cause
from .policy_engine import get_recovery_action
from .notifications import send_customer_notification


def analyze_payment(payment):

    risk_level = detect_risk(
        payment.amount,
        payment.payment_status,
        payment.failure_reason,
        payment.payment_method
    )

    root_cause = find_root_cause(
        payment.failure_reason
    )

    recovery_action = get_recovery_action(
        risk_level,
        payment.failure_reason
    )

    notification = None

    if recovery_action["action"] == "retry_payment":
        notification = send_customer_notification(
            payment.customer_id,
            "Your payment failed. Please retry the payment."
        )

    elif recovery_action["action"] == "customer_notification":
        notification = send_customer_notification(
            payment.customer_id,
            "Your payment has failed. Please check your payment details."
        )

    return {
        "risk_level": risk_level,
        "root_cause": root_cause,
        "recovery_action": recovery_action,
        "notification": notification
    }