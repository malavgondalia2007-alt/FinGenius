#!/usr/bin/env python
import sys
from pathlib import Path

# Add the backend directory to sys.path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.core.database import engine, Base
from app.models.models import User, UserProfile, Expense, Income, Goal, Investment, SIPScheme

# Create all tables
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
