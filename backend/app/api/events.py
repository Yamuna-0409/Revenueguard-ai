from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..schemas.event import PaymentEvent
from ..database.connection import SessionLocal
from ..database.models import Payment


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
# CREATE PAYMENT
# =========================================================

@router.post("/payments")
def create_payment(
    payment: PaymentEvent,
    db: Session = Depends(get_db)
):

    new_payment = Payment(
        event_id=payment.event_id,
        customer_id=payment.customer_id,
        amount=payment.amount,
        currency=payment.currency,
        payment_status=payment.payment_status,
        failure_reason=payment.failure_reason,
        payment_method=payment.payment_method
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return {
        "message": "Payment saved successfully",
        "payment_id": new_payment.id
    }


# =========================================================
# GET PAYMENTS
# =========================================================

@router.get("/payments")
def get_payments(
    db: Session = Depends(get_db)
):

    payments = (
        db.query(Payment)
        .order_by(Payment.id.desc())
        .all()
    )

    return {
        "count": len(payments),
        "payments": [
            {
                "id": payment.id,
                "event_id": payment.event_id,
                "customer_id": payment.customer_id,
                "amount": payment.amount,
                "currency": payment.currency,
                "payment_status": payment.payment_status,
                "failure_reason": payment.failure_reason,
                "payment_method": payment.payment_method
            }

            for payment in payments
        ]
    }