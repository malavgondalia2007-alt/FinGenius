from .core.database import engine, Base
from .models import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import auth, expenses, income, goals, profiles

app = FastAPI(
    title="FinGenius API",
    description="Backend API for FinGenius Financial Management Platform",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(goals.router)
app.include_router(profiles.router)


@app.get("/")
async def root():
    return {
        "message": "FinGenius API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
