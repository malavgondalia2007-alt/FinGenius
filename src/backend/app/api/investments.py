
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..core.database import get_db
from ..models.models import User, Investment
from ..schemas.schemas import InvestmentCreate, InvestmentResponse
from .auth import get_current_user

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.get("/", response_model=List[InvestmentResponse])
async def get_investments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    return investments


@router.post("/", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
async def create_investment(
    investment_data: InvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_investment = Investment(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **investment_data.model_dump()
    )
    
    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)
    
    return new_investment


@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investment(
    investment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    db.delete(investment)
    db.commit()
    
    return None
