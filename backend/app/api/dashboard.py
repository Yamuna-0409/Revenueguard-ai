from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import Payment, RecoveryAction, AuditLog
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
# DASHBOARD
# =========================================================

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Get all payments
    # -----------------------------------------------------

    payments = db.query(Payment).all()

    total_payments = len(payments)

    successful_payments = 0
    failed_payments = 0

    total_revenue = 0
    failed_revenue = 0


    # -----------------------------------------------------
    # Calculate payment statistics
    # -----------------------------------------------------

    for payment in payments:

        if payment.payment_status == "success":

            successful_payments += 1

            total_revenue += payment.amount

        elif payment.payment_status == "failed":

            failed_payments += 1

            failed_revenue += payment.amount


    # -----------------------------------------------------
    # AI Risk Analysis
    # -----------------------------------------------------

    high_risk = 0
    medium_risk = 0
    low_risk = 0

    for payment in payments:

        if payment.payment_status == "failed":

            analysis = analyze_payment(payment)

            risk_level = analysis["risk_level"]

            if risk_level == "HIGH":

                high_risk += 1

            elif risk_level == "MEDIUM":

                medium_risk += 1

            elif risk_level == "LOW":

                low_risk += 1


    # -----------------------------------------------------
    # Recovery Statistics
    # -----------------------------------------------------

    recovery_actions = (
        db.query(RecoveryAction).all()
    )

    recovered_revenue = 0

    for recovery in recovery_actions:

        recovered_revenue += (
            recovery.recovered_amount or 0
        )


    # -----------------------------------------------------
    # Recovery Rate
    # -----------------------------------------------------

    if failed_revenue > 0:

        recovery_rate = (
            recovered_revenue /
            failed_revenue
        ) * 100

    else:

        recovery_rate = 0


    # -----------------------------------------------------
    # Audit Logs
    # -----------------------------------------------------

    audit_logs_count = (
        db.query(AuditLog).count()
    )


    # -----------------------------------------------------
    # Return Dashboard Data
    # -----------------------------------------------------

    return {

        "total_payments": total_payments,

        "successful_payments": successful_payments,

        "failed_payments": failed_payments,

        "total_revenue": total_revenue,

        "failed_revenue": failed_revenue,

        "recovered_revenue": recovered_revenue,

        "recovery_rate": round(
            recovery_rate,
            2
        ),

        "audit_logs_count": audit_logs_count,

        "risk_distribution": {

            "high": high_risk,

            "medium": medium_risk,

            "low": low_risk
        }
    }


# =========================================================
# ANALYTICS
# =========================================================

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Get payments
    # -----------------------------------------------------

    payments = db.query(Payment).all()


    # -----------------------------------------------------
    # Failed Payments
    # -----------------------------------------------------

    failed_payments = [

        payment

        for payment in payments

        if payment.payment_status == "failed"
    ]


    # -----------------------------------------------------
    # Failed Revenue
    # -----------------------------------------------------

    failed_revenue = sum(

        payment.amount

        for payment in failed_payments
    )


    # -----------------------------------------------------
    # Recovery Actions
    # -----------------------------------------------------

    recovery_actions = (
        db.query(RecoveryAction).all()
    )


    # -----------------------------------------------------
    # Recovered Revenue
    # -----------------------------------------------------

    recovered_revenue = sum(

        recovery.recovered_amount or 0

        for recovery in recovery_actions
    )


    # -----------------------------------------------------
    # Recovery Rate
    # -----------------------------------------------------

    if failed_revenue > 0:

        recovery_rate = (
            recovered_revenue /
            failed_revenue
        ) * 100

    else:

        recovery_rate = 0


    # -----------------------------------------------------
    # Risk Distribution
    # -----------------------------------------------------

    high_risk = 0
    medium_risk = 0
    low_risk = 0

    for payment in failed_payments:

        analysis = analyze_payment(payment)

        risk_level = analysis["risk_level"]

        if risk_level == "HIGH":

            high_risk += 1

        elif risk_level == "MEDIUM":

            medium_risk += 1

        elif risk_level == "LOW":

            low_risk += 1


    # -----------------------------------------------------
    # Audit Logs
    # -----------------------------------------------------

    audit_logs_count = (
        db.query(AuditLog).count()
    )


    # -----------------------------------------------------
    # Return Analytics
    # -----------------------------------------------------

    return {

        "failed_payments": len(
            failed_payments
        ),

        "failed_revenue": failed_revenue,

        "recovered_revenue": recovered_revenue,

        "recovery_rate": round(
            recovery_rate,
            2
        ),

        "audit_logs_count": audit_logs_count,

        "risk_distribution": {

            "high": high_risk,

            "medium": medium_risk,

            "low": low_risk
        }
    }