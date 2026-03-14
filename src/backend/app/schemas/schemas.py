from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
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


# Stock Screener Schemas
class StockFundamental(BaseModel):
    symbol: str
    name: str
    sector: str
    market_cap_category: str  # Large, Mid, Small
    current_price: float
    pe_ratio: float
    dividend_yield: float
    eps_growth_1y: float
    debt_to_equity: float
    volatility: str # Low, Medium, High


class StockRecommendation(StockFundamental):
    suitability_score: int  # 0-100
    match_reason: str
    risk_alignment: str  # "Perfect", "Good", "Acceptable", "High Risk"
    is_affordable: bool


class UserFinancialAnalysis(BaseModel):
    monthly_savings_capacity: float
    risk_profile: RiskLevel
    investment_horizon: str  # Short, Medium, Long
    recommended_allocation: Dict[str, int]  # e.g. {"Large Cap": 60, "Mid Cap": 30}


class ScreenerResponse(BaseModel):
    user_analysis: UserFinancialAnalysis
    recommendations: List[StockRecommendation]
    timestamp: str


# Admin Schemas
class AdminActionBase(BaseModel):
    admin_id: str = Field(..., alias="adminId")
    action: str
    target: Optional[str] = None
    status: str
    details: Optional[str] = None

    class Config:
        populate_by_name = True

class AdminActionCreate(AdminActionBase):
    id: str

class AdminActionResponse(AdminActionBase):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

class SystemAlertBase(BaseModel):
    severity: str
    title: str
    message: str
    action: Optional[str] = None

class SystemAlertCreate(SystemAlertBase):
    id: str

class SystemAlertResponse(SystemAlertBase):
    id: str
    timestamp: datetime = Field(..., alias="createdAt")
    dismissed: bool
    
    class Config:
        from_attributes = True
        populate_by_name = True