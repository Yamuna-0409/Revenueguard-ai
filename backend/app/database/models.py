from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from .connection import Base


# =========================================================
# PAYMENT MODEL
# =========================================================

class Payment(Base):

    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    event_id = Column(
        String,
        unique=True,
        index=True
    )

    customer_id = Column(
        String
    )

    amount = Column(
        Float
    )

    currency = Column(
        String
    )

    payment_status = Column(
        String
    )

    failure_reason = Column(
        String,
        nullable=True
    )

    payment_method = Column(
        String
    )


# =========================================================
# RECOVERY ACTION MODEL
# =========================================================

class RecoveryAction(Base):

    __tablename__ = "recovery_actions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    payment_id = Column(
        Integer
    )

    event_id = Column(
        String
    )

    risk_level = Column(
        String
    )

    action = Column(
        String
    )

    priority = Column(
        String
    )

    message = Column(
        String
    )

    recovered_amount = Column(
        Float,
        default=0
    )

    status = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# AUDIT LOG MODEL
# =========================================================

class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    payment_id = Column(
        Integer
    )

    event_id = Column(
        String
    )

    amount = Column(
        Float,
        default=0
    )

    action = Column(
        String
    )

    priority = Column(
        String
    )

    status = Column(
        String
    )

    message = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )