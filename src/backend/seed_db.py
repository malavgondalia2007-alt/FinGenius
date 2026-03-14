import sys
import os
from datetime import datetime, timedelta
import enum
import uuid

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.database import SessionLocal, engine, Base
from app.models.models import User, UserProfile, Expense, Income, Goal, Investment, ProfileType, ExpenseType, InvestmentType, RiskLevel
from app.api.auth import get_password_hash

def seed_db():
    print("🌱 Seeding database...")
    db = SessionLocal()
    
    try:
        # Check if user already exists
        user_email = "haed@example.com"
        existing_user = db.query(User).filter(User.email == user_email).first()
        
        if existing_user:
            print(f"User {user_email} already exists. Skipping seeding.")
            return

        # 1. Create User
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=user_email,
            password_hash=get_password_hash("P@ssword123"),
            name="haed",
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.flush() # To get access to related associations
        print(f"✅ Created User: {user_email}")

        # 2. Create UserProfile
        profile = UserProfile(
            user_id=user_id,
            age=24,
            type=ProfileType.EMPLOYEE,
            onboarding_complete=True,
            monthly_income=85000.0,
            fixed_expenses={
                "rent": 25000,
                "groceries": 8000,
                "utilities": 3000
            },
            loans={
                "homeLoan": 0,
                "carLoan": 5000,
                "personalLoan": 0,
                "educationLoan": 0
            },
            sip_commitments=10000.0,
            savings_preference=35.0
        )
        db.add(profile)
        print("✅ Created User Profile")

        # 3. Create Expenses
        expenses = [
            Expense(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=12000.0,
                category="Housing",
                date="2026-01-01",
                type=ExpenseType.ESSENTIAL,
                description="Rent partial"
            ),
            Expense(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=8000.0,
                category="Food",
                date="2026-01-03",
                type=ExpenseType.ESSENTIAL,
                description="Groceries"
            ),
            Expense(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=5000.0,
                category="Transport",
                date="2026-01-05",
                type=ExpenseType.ESSENTIAL,
                description="Fuel & Metro"
            ),
            Expense(
                id=str(uuid.uuid4()),
                user_id=user_id,
                amount=7500.0,
                category="Entertainment",
                date="2026-01-06",
                type=ExpenseType.NON_ESSENTIAL,
                description="Weekend trip"
            )
        ]
        db.add_all(expenses)
        print(f"✅ Created {len(expenses)} Expenses")

        # 4. Create Income
        income = Income(
            id=str(uuid.uuid4()),
            user_id=user_id,
            amount=5000.0,
            source="Freelance Project",
            date="2026-01-10",
            description="Web design work"
        )
        db.add(income)
        print("✅ Created Income record")

        # 5. Create Goals
        goals = [
            Goal(
                id=str(uuid.uuid4()),
                user_id=user_id,
                name="Emergency Fund",
                target_amount=100000.0,
                saved_amount=45000.0,
                deadline="2026-06-01",
                category="Savings"
            ),
            Goal(
                id=str(uuid.uuid4()),
                user_id=user_id,
                name="Vacation",
                target_amount=50000.0,
                saved_amount=12000.0,
                deadline="2026-12-01",
                category="Travel"
            )
        ]
        db.add_all(goals)
        print(f"✅ Created {len(goals)} Goals")

        # 6. Create Investments
        investments = [
            Investment(
                id=str(uuid.uuid4()),
                user_id=user_id,
                fund_name="HDFC Mid-Cap Opportunities",
                amount=50000.0,
                type=InvestmentType.SIP,
                date="2025-06-15",
                returns=18.5,
                risk=RiskLevel.HIGH
            ),
            Investment(
                id=str(uuid.uuid4()),
                user_id=user_id,
                fund_name="SBI Blue Chip Fund",
                amount=75000.0,
                type=InvestmentType.STOCK,
                date="2025-08-20",
                returns=14.2,
                risk=RiskLevel.MODERATE
            )
        ]
        db.add_all(investments)
        print(f"✅ Created {len(investments)} Investments")

        db.commit()
        print("🎉 Database seeding complete!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
