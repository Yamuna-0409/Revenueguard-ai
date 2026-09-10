from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import Payment
from ..services.recovery_agent import analyze_payment


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):

    message = request.message.lower()

    payments = db.query(Payment).all()

    # -----------------------------------
    # Total failed revenue
    # -----------------------------------
    if "at risk" in message or "risk revenue" in message:

        failed_payments = [
            payment
            for payment in payments
            if payment.payment_status == "failed"
        ]

        total = sum(payment.amount for payment in failed_payments)

        return {
            "reply": f"Currently, ₹{total:.0f} of failed payment revenue is at risk."
        }

    # -----------------------------------
    # High risk payments
    # -----------------------------------
    if "high risk" in message:

        high_risk = []

        for payment in payments:

            if payment.payment_status == "failed":

                analysis = analyze_payment(payment)

                if analysis["risk_level"] == "HIGH":
                    high_risk.append(payment.event_id)

        if high_risk:
            return {
                "reply": "High-risk payments: " + ", ".join(high_risk)
            }

        return {
            "reply": "There are no high-risk payments currently."
        }

    # -----------------------------------
    # Search payment by Event ID
    # -----------------------------------
    for payment in payments:

        if payment.event_id.lower() in message:

            analysis = analyze_payment(payment)

            return {
                "reply": (
                    f"{payment.event_id} is classified as "
                    f"{analysis['risk_level']} risk. "
                    f"Root cause: {analysis['root_cause']}. "
                    f"Recommended action: "
                    f"{analysis['recovery_action']['action']}."
                )
            }

    # -----------------------------------
    # General questions
    # -----------------------------------
    if "recovery" in message:

        return {
            "reply": (
                "RevenueGuard AI analyzes failed payments, "
                "detects risk, identifies the root cause, "
                "and recommends a recovery action such as "
                "retry, customer notification, or manual review."
            )
        }

    return {
        "reply": (
            "I can help you analyze failed payments, "
            "risk levels, root causes, recovery actions, "
            "and at-risk revenue."
        )
    }