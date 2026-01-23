from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import datetime
from enum import Enum


# Enums
class ProfileType(str, Enum):
    STUDENT = "student"
    EMPLOYEE = "employee"


class ExpenseType(str, Enum):
    ESSENTIAL = "essential"
    NON_ESSENTIAL = "non-essential"


class InvestmentType(str, Enum):
    STOCK = "stock"
    SIP = "sip"


class RiskLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"


# Auth Schemas
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Profile Schemas
class UserProfileBase(BaseModel):
    age: int
    type: ProfileType
    onboarding_complete: bool = False
    weekly_pocket_money: Optional[float] = None
    weekly_expenses: Optional[float] = None
    monthly_income: Optional[float] = None
    fixed_expenses: Optional[Dict[str, float]] = None
    loans: Optional[Dict[str, float]] = None
    sip_commitments: Optional[float] = None
    savings_preference: Optional[float] = None
    auto_split_enabled: Optional[bool] = False
    auto_split_percentage: Optional[float] = None


class UserProfileCreate(UserProfileBase):
    user_id: str


class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    type: Optional[ProfileType] = None
    onboarding_complete: Optional[bool] = None
    weekly_pocket_money: Optional[float] = None
    weekly_expenses: Optional[float] = None
    monthly_income: Optional[float] = None
    fixed_expenses: Optional[Dict[str, float]] = None
    loans: Optional[Dict[str, float]] = None
    sip_commitments: Optional[float] = None
    savings_preference: Optional[float] = None
    auto_split_enabled: Optional[bool] = None
    auto_split_percentage: Optional[float] = None


class UserProfileResponse(UserProfileBase):
    id: int
    user_id: str
    
    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseBase(BaseModel):
    amount: float
    category: str
    date: str
    type: ExpenseType
    description: str


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Income Schemas
class IncomeBase(BaseModel):
    amount: float
    source: str
    date: str
    description: str


class IncomeCreate(IncomeBase):
    pass


class IncomeResponse(IncomeBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Goal Schemas
class GoalBase(BaseModel):
    name: str
    target_amount: float
    saved_amount: float = 0
    deadline: str
    category: str


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    saved_amount: Optional[float] = None
    deadline: Optional[str] = None
    category: Optional[str] = None


class GoalResponse(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Investment Schemas
class InvestmentBase(BaseModel):
    fund_name: str
    amount: float
    type: InvestmentType
    date: str
    current_value: Optional[float] = None
    returns: Optional[float] = None
    risk: Optional[RiskLevel] = None


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentResponse(InvestmentBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True