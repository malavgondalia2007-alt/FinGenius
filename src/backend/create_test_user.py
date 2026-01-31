#!/usr/bin/env python
import sys
from pathlib import Path

# Add the backend directory to sys.path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash
import uuid

# Create a test user
db = SessionLocal()
try:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == "test@example.com").first()
    if not existing_user:
        test_user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            name="Test User",
            password_hash=get_password_hash("test123")
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"Test user created successfully! ID: {test_user.id}")
    else:
        print(f"Test user already exists! ID: {existing_user.id}")
finally:
    db.close()
