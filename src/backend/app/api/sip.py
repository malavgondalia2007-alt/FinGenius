from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.models import UserProfile
from ..models.models import ProfileType
from .auth import get_current_user

router = APIRouter(
    prefix="/sip",
    tags=["SIP"]
)


@router.get("/recommendation")
def sip_recommendation(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 1️⃣ Get user profile
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="User profile not found"
        )

    # 2️⃣ STUDENT logic
    if profile.type == ProfileType.STUDENT:
        if not profile.weekly_pocket_money:
            raise HTTPException(
                status_code=400,
                detail="Pocket money not provided"
            )

        monthly_money = profile.weekly_pocket_money * 4
        sip_amount = round((monthly_money * 0.10) / 100) * 100

        return {
            "user_type": "student",
            "monthly_money": monthly_money,
            "recommended_sip": sip_amount,
            "risk_level": "Low",
            "message": f"Based on your pocket money, you can safely invest ₹{sip_amount}/month in SIP."
        }

    # 3️⃣ EMPLOYEE logic
    if profile.type == ProfileType.EMPLOYEE:
        if not profile.monthly_income:
            raise HTTPException(
                status_code=400,
                detail="Monthly income not provided"
            )

        monthly_money = profile.monthly_income
        sip_amount = round((monthly_money * 0.20) / 100) * 100

        return {
            "user_type": "employee",
            "monthly_money": monthly_money,
            "recommended_sip": sip_amount,
            "risk_level": "Moderate",
            "message": f"Based on your salary, you can safely invest ₹{sip_amount}/month in SIP."
        }

    raise HTTPException(
        status_code=400,
        detail="Invalid profile type"
    )
