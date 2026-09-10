from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import (
    Payment,
    RecoveryAction,
    AuditLog
)

from ..services.recovery_agent import analyze_payment


router = APIRouter()


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# ANALYZE PAYMENT
# =========================================================

@router.get("/analyze/{payment_id}")
def analyze_payment_api(
    payment_id: int,
    db: Session = Depends(get_db)
):

    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if not payment:

        return {
            "error": "Payment not found"
        }

    analysis = analyze_payment(payment)

    return {

        "payment_id": payment.id,

        "event_id": payment.event_id,

        "amount": payment.amount,

        "payment_status": payment.payment_status,

        "risk_level": analysis["risk_level"],

        "root_cause": analysis["root_cause"],

        "recovery_action": analysis["recovery_action"]

    }


# =========================================================
# EXECUTE RECOVERY
# =========================================================

@router.post("/recover/{payment_id}")
def recover_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):

    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if not payment:

        return {
            "error": "Payment not found"
        }

    analysis = analyze_payment(payment)

    action = analysis["recovery_action"]

    # -----------------------------------------------------
    # Create Recovery Action
    # -----------------------------------------------------

    recovery = RecoveryAction(

        payment_id=payment.id,

        event_id=payment.event_id,

        risk_level=analysis["risk_level"],

        action=action["action"],

        priority=action["priority"],

        message=action["message"],

        recovered_amount=0,

        status="executed"
    )

    db.add(recovery)

    # -----------------------------------------------------
    # Create Audit Log
    # -----------------------------------------------------

    audit = AuditLog(

        payment_id=payment.id,

        event_id=payment.event_id,

        amount=payment.amount,

        action=action["action"],

        priority=action["priority"],

        status="executed",

        message=action["message"]
    )

    db.add(audit)

    db.commit()

    db.refresh(recovery)
    db.refresh(audit)

    return {

        "payment_id": payment.id,

        "event_id": payment.event_id,

        "status": "recovery_action_executed",

        "action": action["action"],

        "priority": action["priority"],

        "message": action["message"],

        "recovered_amount": 0

    }