
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..core.database import get_db
from ..models.models import User, Income
from ..schemas.schemas import IncomeCreate, IncomeResponse
from .auth import get_current_user

router = APIRouter(prefix="/income", tags=["Income"])


@router.get("/", response_model=List[IncomeResponse])
async def get_incomes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
    return incomes


@router.post("/", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_data: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_income = Income(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **income_data.model_dump()
    )
    
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    
    return new_income


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found"
        )
    
    db.delete(income)
    db.commit()
    
    return None
