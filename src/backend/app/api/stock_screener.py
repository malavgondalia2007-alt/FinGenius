"""
Personalized Stock Screener API
Analyzes user financial profile and recommends stocks based on fundamentals and suitability.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import logging

from ..core.database import get_db
from ..models.models import User, UserProfile, RiskLevel
from ..schemas.schemas import (
    ScreenerResponse, 
    StockRecommendation, 
    UserFinancialAnalysis,
    RiskLevel as RiskLevelSchema
)
from .auth import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/screener", tags=["Stock Screener"])

# -----------------------------------------------------------------------------
# 1. EXPANDED STOCK UNIVERSE (Mock Fundamental Data)
# -----------------------------------------------------------------------------
# In a real app, this would come from a database or external API like Twelve Data / Yahoo Finance
STOCK_UNIVERSE = [
    # IT Sector
    {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT", "cap": "Large", "price": 3990.0, "pe": 31.2, "div_yield": 1.2, "growth": 8.5, "debt_eq": 0.0, "volatility": "Low"},
    {"symbol": "INFY", "name": "Infosys Limited", "sector": "IT", "cap": "Large", "price": 1620.0, "pe": 27.8, "div_yield": 2.1, "growth": 6.2, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "HCLTECH", "name": "HCL Technologies", "sector": "IT", "cap": "Large", "price": 1540.0, "pe": 24.5, "div_yield": 3.2, "growth": 9.1, "debt_eq": 0.05, "volatility": "Medium"},
    {"symbol": "WIPRO", "name": "Wipro Limited", "sector": "IT", "cap": "Large", "price": 485.0, "pe": 22.3, "div_yield": 0.9, "growth": 4.5, "debt_eq": 0.1, "volatility": "Medium"},
    {"symbol": "LTIM", "name": "LTIMindtree", "sector": "IT", "cap": "Large", "price": 5430.0, "pe": 35.1, "div_yield": 1.1, "growth": 12.4, "debt_eq": 0.0, "volatility": "High"},
    {"symbol": "TECHM", "name": "Tech Mahindra", "sector": "IT", "cap": "Large", "price": 1280.0, "pe": 45.8, "div_yield": 2.8, "growth": -5.2, "debt_eq": 0.1, "volatility": "High"},

    # Banking & Finance
    {"symbol": "HDFCBANK", "name": "HDFC Bank", "sector": "Banking", "cap": "Large", "price": 1450.0, "pe": 19.8, "div_yield": 1.1, "growth": 15.2, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank", "sector": "Banking", "cap": "Large", "price": 1080.0, "pe": 18.5, "div_yield": 0.8, "growth": 18.5, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking", "cap": "Large", "price": 760.0, "pe": 9.5, "div_yield": 1.4, "growth": 22.1, "debt_eq": 0.0, "volatility": "High"},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank", "sector": "Banking", "cap": "Large", "price": 1740.0, "pe": 21.5, "div_yield": 0.1, "growth": 14.2, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "AXISBANK", "name": "Axis Bank", "sector": "Banking", "cap": "Large", "price": 1090.0, "pe": 12.5, "div_yield": 0.1, "growth": 16.8, "debt_eq": 0.0, "volatility": "High"},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "sector": "Finance", "cap": "Large", "price": 6800.0, "pe": 28.9, "div_yield": 0.5, "growth": 24.5, "debt_eq": 3.2, "volatility": "High"},
    {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv", "sector": "Finance", "cap": "Large", "price": 1620.0, "pe": 32.1, "div_yield": 0.1, "growth": 18.2, "debt_eq": 0.0, "volatility": "High"},
    {"symbol": "SHRIRAMFIN", "name": "Shriram Finance", "sector": "Finance", "cap": "Large", "price": 2450.0, "pe": 14.2, "div_yield": 1.5, "growth": 15.5, "debt_eq": 4.1, "volatility": "High"},

    # FMCG
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever", "sector": "FMCG", "cap": "Large", "price": 2380.0, "pe": 56.2, "div_yield": 1.8, "growth": 3.5, "debt_eq": 0.0, "volatility": "Low"},
    {"symbol": "ITC", "name": "ITC Limited", "sector": "FMCG", "cap": "Large", "price": 435.0, "pe": 24.6, "div_yield": 3.5, "growth": 8.9, "debt_eq": 0.0, "volatility": "Low"},
    {"symbol": "NESTLEIND", "name": "Nestle India", "sector": "FMCG", "cap": "Large", "price": 2550.0, "pe": 68.5, "div_yield": 1.2, "growth": 10.5, "debt_eq": 0.1, "volatility": "Low"},
    {"symbol": "BRITANNIA", "name": "Britannia Industries", "sector": "FMCG", "cap": "Large", "price": 4950.0, "pe": 52.1, "div_yield": 1.5, "growth": 9.2, "debt_eq": 0.4, "volatility": "Medium"},
    {"symbol": "TATACONSUM", "name": "Tata Consumer Products", "sector": "FMCG", "cap": "Large", "price": 1150.0, "pe": 75.2, "div_yield": 0.7, "growth": 14.5, "debt_eq": 0.1, "volatility": "Medium"},

    # Energy & Oil
    {"symbol": "RELIANCE", "name": "Reliance Industries", "sector": "Conglomerate", "cap": "Large", "price": 2950.0, "pe": 24.5, "div_yield": 0.3, "growth": 11.2, "debt_eq": 0.4, "volatility": "Medium"},
    {"symbol": "ONGC", "name": "ONGC", "sector": "Energy", "cap": "Large", "price": 275.0, "pe": 6.5, "div_yield": 4.5, "growth": 5.5, "debt_eq": 0.5, "volatility": "Medium"},
    {"symbol": "NTPC", "name": "NTPC Limited", "sector": "Energy", "cap": "Large", "price": 340.0, "pe": 14.2, "div_yield": 2.2, "growth": 12.5, "debt_eq": 1.2, "volatility": "Low"},
    {"symbol": "POWERGRID", "name": "Power Grid Corp", "sector": "Energy", "cap": "Large", "price": 285.0, "pe": 12.8, "div_yield": 3.8, "growth": 8.2, "debt_eq": 1.4, "volatility": "Low"},
    {"symbol": "BPCL", "name": "Bharat Petroleum", "sector": "Energy", "cap": "Large", "price": 620.0, "pe": 8.5, "div_yield": 4.1, "growth": 15.5, "debt_eq": 0.8, "volatility": "Medium"},
    {"symbol": "COALINDIA", "name": "Coal India", "sector": "Energy", "cap": "Large", "price": 450.0, "pe": 8.2, "div_yield": 5.5, "growth": 10.1, "debt_eq": 0.1, "volatility": "Medium"},

    # Auto
    {"symbol": "MARUTI", "name": "Maruti Suzuki", "sector": "Auto", "cap": "Large", "price": 12400.0, "pe": 28.5, "div_yield": 0.9, "growth": 25.5, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "TATAMOTORS", "name": "Tata Motors", "sector": "Auto", "cap": "Large", "price": 980.0, "pe": 18.2, "div_yield": 0.6, "growth": 45.2, "debt_eq": 1.8, "volatility": "High"},
    {"symbol": "M&M", "name": "Mahindra & Mahindra", "sector": "Auto", "cap": "Large", "price": 1950.0, "pe": 22.5, "div_yield": 1.1, "growth": 18.5, "debt_eq": 1.1, "volatility": "Medium"},
    {"symbol": "BAJAJ-AUTO", "name": "Bajaj Auto", "sector": "Auto", "cap": "Large", "price": 8400.0, "pe": 25.5, "div_yield": 3.5, "growth": 15.2, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "EICHERMOT", "name": "Eicher Motors", "sector": "Auto", "cap": "Large", "price": 3950.0, "pe": 28.2, "div_yield": 1.0, "growth": 14.5, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "HEROMOTOCO", "name": "Hero MotoCorp", "sector": "Auto", "cap": "Large", "price": 4600.0, "pe": 21.5, "div_yield": 3.2, "growth": 12.5, "debt_eq": 0.0, "volatility": "Medium"},

    # Pharma
    {"symbol": "SUNPHARMA", "name": "Sun Pharma", "sector": "Pharma", "cap": "Large", "price": 1550.0, "pe": 38.7, "div_yield": 0.8, "growth": 11.5, "debt_eq": 0.1, "volatility": "Medium"},
    {"symbol": "DRREDDY", "name": "Dr. Reddy's Labs", "sector": "Pharma", "cap": "Large", "price": 6200.0, "pe": 18.5, "div_yield": 0.6, "growth": 14.2, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "CIPLA", "name": "Cipla", "sector": "Pharma", "cap": "Large", "price": 1450.0, "pe": 28.5, "div_yield": 0.6, "growth": 10.5, "debt_eq": 0.0, "volatility": "Medium"},
    {"symbol": "DIVISLAB", "name": "Divi's Laboratories", "sector": "Pharma", "cap": "Large", "price": 3650.0, "pe": 55.2, "div_yield": 0.8, "growth": -8.5, "debt_eq": 0.0, "volatility": "High"},
    {"symbol": "APOLLOHOSP", "name": "Apollo Hospitals", "sector": "Healthcare", "cap": "Large", "price": 6100.0, "pe": 85.5, "div_yield": 0.2, "growth": 22.5, "debt_eq": 0.6, "volatility": "High"},

    # Others (Metals, Infra, Telecom)
    {"symbol": "TATASTEEL", "name": "Tata Steel", "sector": "Metals", "cap": "Large", "price": 145.0, "pe": 15.5, "div_yield": 2.5, "growth": -12.5, "debt_eq": 0.8, "volatility": "High"},
    {"symbol": "JSWSTEEL", "name": "JSW Steel", "sector": "Metals", "cap": "Large", "price": 840.0, "pe": 18.2, "div_yield": 1.5, "growth": 5.5, "debt_eq": 0.9, "volatility": "High"},
    {"symbol": "HINDALCO", "name": "Hindalco Industries", "sector": "Metals", "cap": "Large", "price": 580.0, "pe": 12.5, "div_yield": 0.8, "growth": 8.5, "debt_eq": 0.6, "volatility": "High"},
    {"symbol": "LT", "name": "Larsen & Toubro", "sector": "Infra", "cap": "Large", "price": 3650.0, "pe": 31.5, "div_yield": 0.7, "growth": 15.5, "debt_eq": 0.6, "volatility": "Medium"},
    {"symbol": "ULTRACEMCO", "name": "UltraTech Cement", "sector": "Cement", "cap": "Large", "price": 9850.0, "pe": 32.1, "div_yield": 0.4, "growth": 12.5, "debt_eq": 0.2, "volatility": "Medium"},
    {"symbol": "GRASIM", "name": "Grasim Industries", "sector": "Cement", "cap": "Large", "price": 2250.0, "pe": 28.5, "div_yield": 0.5, "growth": 8.5, "debt_eq": 0.3, "volatility": "Medium"},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "sector": "Telecom", "cap": "Large", "price": 1220.0, "pe": 85.4, "div_yield": 0.3, "growth": 45.5, "debt_eq": 1.8, "volatility": "Medium"},
    {"symbol": "TITAN", "name": "Titan Company", "sector": "Consumer", "cap": "Large", "price": 3650.0, "pe": 85.2, "div_yield": 0.3, "growth": 18.5, "debt_eq": 0.5, "volatility": "High"},
    {"symbol": "ADANIENT", "name": "Adani Enterprises", "sector": "Conglomerate", "cap": "Large", "price": 3150.0, "pe": 95.5, "div_yield": 0.1, "growth": 25.5, "debt_eq": 1.2, "volatility": "High"},
    {"symbol": "ADANIPORTS", "name": "Adani Ports", "sector": "Infra", "cap": "Large", "price": 1280.0, "pe": 35.5, "div_yield": 0.4, "growth": 15.5, "debt_eq": 1.1, "volatility": "High"},
]


# -----------------------------------------------------------------------------
# 2. HELPER FUNCTIONS
# -----------------------------------------------------------------------------

def calculate_monthly_savings(profile: UserProfile) -> float:
    """
    Calculate user's monthly disposable income available for investment.
    """
    if profile.type == "student":
        # Students usually have less consistent income, treat pocket money as income
        income = (profile.weekly_pocket_money or 0) * 4
        expenses = (profile.weekly_expenses or 0) * 4
        return max(0, income - expenses)
    
    # Employees
    income = profile.monthly_income or 0
    
    # Sum fixed expenses
    fixed_expenses = 0
    if profile.fixed_expenses:
        fixed_expenses = sum(profile.fixed_expenses.values())
        
    # Sum loan payments
    loan_payments = 0
    if profile.loans:
        loan_payments = sum(profile.loans.values())
        
    sip_commitments = profile.sip_commitments or 0
    
    return max(0, income - fixed_expenses - loan_payments - sip_commitments)


def determine_risk_profile(profile: UserProfile, monthly_savings: float) -> RiskLevelSchema:
    """
    Determine risk profile based on age, income stability, and savings rate.
    """
    age = profile.age
    income = profile.monthly_income or ((profile.weekly_pocket_money or 0) * 4)
    
    # Avoid division by zero
    savings_rate = (monthly_savings / income) if income > 0 else 0
    
    # Logic:
    # Young + High Savings = High Risk Capacity
    # Older OR Low Savings = Low Risk Capacity
    
    if age < 30:
        if savings_rate > 0.3:
            return RiskLevelSchema.HIGH
        elif savings_rate > 0.1:
            return RiskLevelSchema.MODERATE
        else:
            return RiskLevelSchema.LOW  # Young but no savings -> play safe
            
    elif age < 50:
        if savings_rate > 0.4:
            return RiskLevelSchema.HIGH
        elif savings_rate > 0.2:
            return RiskLevelSchema.MODERATE
        else:
            return RiskLevelSchema.LOW
            
    else: # Age 50+
        if savings_rate > 0.5:
            return RiskLevelSchema.MODERATE
        else:
            return RiskLevelSchema.LOW


def score_stock_for_user(stock: Dict[str, Any], user_analysis: UserFinancialAnalysis) -> Dict[str, Any]:
    """
    Score a stock (0-100) based on user profile match.
    """
    score = 50  # Base score
    reasons = []
    
    # 1. Affordability Check (Critical)
    # If stock price is > 40% of monthly savings, it's too expensive to diversify
    affordability_ratio = stock["price"] / user_analysis.monthly_savings_capacity if user_analysis.monthly_savings_capacity > 0 else float('inf')
    is_affordable = True
    
    if affordability_ratio > 0.4:
        score -= 30
        reasons.append("Price is high relative to monthly savings")
        is_affordable = False
    elif affordability_ratio < 0.1:
        score += 10
        reasons.append("Very affordable, allows easy diversification")
    
    # 2. Risk Alignment
    user_risk = user_analysis.risk_profile
    stock_volatility = stock["volatility"]
    
    if user_risk == RiskLevelSchema.HIGH:
        if stock_volatility == "High":
            score += 20
            reasons.append("High growth potential matches your aggressive profile")
        elif stock_volatility == "Medium":
            score += 10
        else: # Low volatility
            score -= 5
            reasons.append("May be too conservative for your growth goals")
            
    elif user_risk == RiskLevelSchema.MODERATE:
        if stock_volatility == "Medium":
            score += 20
            reasons.append("Balanced stability and growth matches your profile")
        elif stock_volatility == "Low":
            score += 10
            reasons.append("Good stability foundation")
        else: # High volatility
            score -= 10
            reasons.append("Higher volatility than recommended")
            
    else: # Low Risk
        if stock_volatility == "Low":
            score += 25
            reasons.append("High stability matches your conservative profile")
        elif stock_volatility == "Medium":
            score -= 10
            reasons.append("Slightly volatile for your risk tolerance")
        else: # High volatility
            score -= 30
            reasons.append("Too risky/volatile for your profile")

    # 3. Fundamental Quality (Growth vs Value)
    # High Risk users like Growth (High EPS Growth)
    # Low Risk users like Value (Low PE, High Dividend)
    
    if user_risk == RiskLevelSchema.HIGH:
        if stock["growth"] > 15:
            score += 15
            reasons.append("Strong earnings growth")
        if stock["pe"] > 50: # Momentum stock
            score += 5
            
    elif user_risk == RiskLevelSchema.LOW:
        if stock["div_yield"] > 2.0:
            score += 15
            reasons.append("Attractive dividend yield")
        if stock["pe"] < 25:
            score += 10
            reasons.append("Reasonable valuation (P/E)")
        if stock["debt_eq"] < 0.1:
            score += 10
            reasons.append("Debt-free/Low debt company")

    # Cap score at 100
    final_score = min(100, max(0, int(score)))
    
    # Determine alignment label
    if final_score >= 80:
        alignment = "Perfect Match"
    elif final_score >= 60:
        alignment = "Good Fit"
    elif final_score >= 40:
        alignment = "Acceptable"
    else:
        alignment = "Mismatch"

    return {
        "score": final_score,
        "reason": reasons[0] if reasons else "General market fit",
        "alignment": alignment,
        "is_affordable": is_affordable
    }


# -----------------------------------------------------------------------------
# 3. API ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/recommendations", response_model=ScreenerResponse)
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized stock recommendations based on user's financial profile.
    """
    # 1. Fetch User Profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete onboarding."
        )
    
    # 2. Analyze User Financials
    monthly_savings = calculate_monthly_savings(profile)
    risk_profile = determine_risk_profile(profile, monthly_savings)
    
    # Determine allocation strategy
    allocation = {}
    if risk_profile == RiskLevelSchema.HIGH:
        allocation = {"Large Cap": 50, "Mid Cap": 30, "Small Cap": 20}
        horizon = "Long Term (5+ Years)"
    elif risk_profile == RiskLevelSchema.MODERATE:
        allocation = {"Large Cap": 70, "Mid Cap": 20, "Small Cap": 10}
        horizon = "Medium Term (3-5 Years)"
    else:
        allocation = {"Large Cap": 90, "Mid Cap": 10, "Small Cap": 0}
        horizon = "Short to Medium Term"
        
    user_analysis = UserFinancialAnalysis(
        monthly_savings_capacity=monthly_savings,
        risk_profile=risk_profile,
        investment_horizon=horizon,
        recommended_allocation=allocation
    )
    
    # 3. Screen Stocks
    recommendations = []
    
    for stock in STOCK_UNIVERSE:
        # Skip if price is unreasonably high for user (hard filter: price > 80% of savings)
        # Exception: if savings are 0, we assume they are just browsing, so show everything but mark unaffordable
        if monthly_savings > 0 and stock["price"] > (monthly_savings * 0.8):
            continue
            
        scoring_result = score_stock_for_user(stock, user_analysis)
        
        # Only recommend stocks with decent scores
        if scoring_result["score"] >= 50:
            rec = StockRecommendation(
                symbol=stock["symbol"],
                name=stock["name"],
                sector=stock["sector"],
                market_cap_category=stock["cap"],
                current_price=stock["price"],
                pe_ratio=stock["pe"],
                dividend_yield=stock["div_yield"],
                eps_growth_1y=stock["growth"],
                debt_to_equity=stock["debt_eq"],
                volatility=stock["volatility"],
                suitability_score=scoring_result["score"],
                match_reason=scoring_result["reason"],
                risk_alignment=scoring_result["alignment"],
                is_affordable=scoring_result["is_affordable"]
            )
            recommendations.append(rec)
            
    # 4. Sort by Score (Desc)
    recommendations.sort(key=lambda x: x.suitability_score, reverse=True)
    
    # Return top 10
    return ScreenerResponse(
        user_analysis=user_analysis,
        recommendations=recommendations[:10],
        timestamp=datetime.now().isoformat()
    )