from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class ProfileType(str, enum.Enum):
    STUDENT = "student"
    EMPLOYEE = "employee"


class ExpenseType(str, enum.Enum):
    ESSENTIAL = "essential"
    NON_ESSENTIAL = "non-essential"


class InvestmentType(str, enum.Enum):
    STOCK = "stock"
    SIP = "sip"


class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    type = Column(Enum(ProfileType), nullable=False)
    onboarding_complete = Column(Boolean, default=False, nullable=False)
    
    # Student specific
    weekly_pocket_money = Column(Float, nullable=True)
    weekly_expenses = Column(Float, nullable=True)
    
    # Employee specific
    monthly_income = Column(Float, nullable=True)
    fixed_expenses = Column(JSON, nullable=True)  # {rent, groceries, utilities}
    loans = Column(JSON, nullable=True)  # {homeLoan, carLoan, personalLoan, educationLoan}
    sip_commitments = Column(Float, nullable=True)
    savings_preference = Column(Float, nullable=True)
    
    # Auto-split settings
    auto_split_enabled = Column(Boolean, default=False)
    auto_split_percentage = Column(Float, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="profile")


class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(String, nullable=False)  # ISO date string
    type = Column(Enum(ExpenseType), nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="expenses")


class Income(Base):
    __tablename__ = "incomes"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)
    date = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="incomes")


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    saved_amount = Column(Float, default=0, nullable=False)
    deadline = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="goals")


class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    fund_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(Enum(InvestmentType), nullable=False)
    date = Column(String, nullable=False)
    current_value = Column(Float, nullable=True)
    returns = Column(Float, nullable=True)
    risk = Column(Enum(RiskLevel), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="investments")