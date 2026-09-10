from pydantic import BaseModel


class PaymentEvent(BaseModel):
    event_id: str
    customer_id: str
    amount: float
    currency: str
    payment_status: str
    failure_reason: str | None = None
    payment_method: str 