from fastapi import FastAPI

app = FastAPI(
    title="RevenueGuard AI",
    description="AI-powered Revenue Recovery Platform",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "RevenueGuard AI is running!",
        "status": "online"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }