from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .core.database import Base, engine, check_db_connection
from .api import auth, expenses, income, goals, profiles, stocks, stock_screener, investments, admin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fingenius")

app = FastAPI(
    title="FinGenius API",
    description="Backend API for FinGenius Financial Management Platform",
    version="1.0.0"
)

# CORS Configuration
origins = settings.ALLOWED_ORIGINS.split(",")
if settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler - prevents raw 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Check backend logs for details.",
            "error_type": type(exc).__name__,
            "path": str(request.url.path),
        }
    )


# Startup: create tables if they don't exist
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting FinGenius API...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"⚠️ Could not create database tables: {e}")
        logger.info("Stock endpoints will still work without a database.")
    
    db_ok = check_db_connection()
    if db_ok:
        logger.info("✅ Database connection: OK")
    else:
        logger.warning("⚠️ Database connection: FAILED - Auth/CRUD endpoints will not work")
        logger.warning("   Stock data endpoints will still work fine.")
        logger.warning("   To fix: ensure PostgreSQL is running and DATABASE_URL is correct in .env")


# Include routers
app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(goals.router)
app.include_router(profiles.router)
app.include_router(stocks.router)
app.include_router(stock_screener.router)
app.include_router(investments.router)
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.get("/")
async def root():
    return {
        "message": "FinGenius API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "api": "running",
        "note": "Stock endpoints work without database" if not db_ok else None,
    }
