from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models import models
from ..schemas import schemas
from datetime import datetime

router = APIRouter()

# --- Activity Logs ---

@router.get("/logs", response_model=List[schemas.AdminActionResponse])
def get_activity_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(models.AdminAction).order_by(models.AdminAction.timestamp.desc()).limit(limit).all()
    return logs

@router.post("/logs", response_model=schemas.AdminActionResponse)
def create_activity_log(log: schemas.AdminActionCreate, db: Session = Depends(get_db)):
    db_log = models.AdminAction(
        id=log.id,
        admin_id=log.admin_id,
        action=log.action,
        target=log.target,
        status=log.status,
        details=log.details,
        timestamp=datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# --- System Alerts ---

@router.get("/alerts", response_model=List[schemas.SystemAlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.SystemAlert).filter(models.SystemAlert.dismissed == False).all()
    return alerts

@router.post("/alerts", response_model=schemas.SystemAlertResponse)
def create_alert(alert: schemas.SystemAlertCreate, db: Session = Depends(get_db)):
    db_alert = models.SystemAlert(
        id=alert.id,
        severity=alert.severity,
        title=alert.title,
        message=alert.message,
        action=alert.action,
        timestamp=datetime.utcnow(),
        dismissed=False
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.patch("/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: str, db: Session = Depends(get_db)):
    db_alert = db.query(models.SystemAlert).filter(models.SystemAlert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db_alert.dismissed = True
    db.commit()
    return {"status": "success"}
