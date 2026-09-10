from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.connection import Base, engine

# Import models so SQLAlchemy knows all tables
from .database.models import (
    Payment,
    RecoveryAction,
    AuditLog
)

from .api.events import router as events_router
from .api.recovery import router as recovery_router
from .api.dashboard import router as dashboard_router
from .api.audit import router as audit_router
from .api.chatbot import router as chatbot_router
from app.database.connection import SessionLocal
from app.database.models import Payment

# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(

    title="RevenueGuard AI",

    description=(
        "AI-powered Revenue Recovery Platform"
    ),

    version="1.0.0"
)

# =========================================================
# CORS
# =========================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:5173",

        "http://127.0.0.1:5173",

        "http://localhost:5174",

        "http://127.0.0.1:5174",

        "http://localhost:5175",

        "http://127.0.0.1:5175"

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    events_router
)

app.include_router(
    recovery_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    audit_router
)

app.include_router(
    chatbot_router
)

# =========================================================
# HOME
# =========================================================
@app.delete("/payments/{payment_id}")
def delete_payment(payment_id: int):
    db = SessionLocal()

    try:
        payment = db.query(Payment).filter(
            Payment.id == payment_id
        ).first()

        if payment is None:
            return {
                "message": "Payment not found"
            }

        db.delete(payment)
        db.commit()

        return {
            "message": "Payment deleted successfully",
            "payment_id": payment_id
        }

    finally:
        db.close()

@app.get("/")
def home():

    return {

        "message": "RevenueGuard AI is running!",

        "status": "online"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {

        "status": "healthy"
    }