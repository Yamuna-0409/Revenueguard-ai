from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import AuditLog


router = APIRouter()


# Database connection
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# GET AUDIT LOGS
# =========================================================

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db)
):

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .all()
    )

    return {
        "count": len(logs),

        "logs": [
            {
                "id": log.id,
                "payment_id": log.payment_id,
                "event_id": log.event_id,
                "amount": log.amount,
                "action": log.action,
                "status": log.status,
                "message": log.message,
                "created_at": log.created_at
            }

            for log in logs
        ]
    }