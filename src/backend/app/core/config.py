from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database - optional, falls back to SQLite if not set
    DATABASE_URL: str = "sqlite:///./fingenius_fallback.db"
    
    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()