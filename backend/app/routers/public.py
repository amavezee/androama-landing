from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models import BetaWaitlist, AppSettings
import uuid

router = APIRouter(prefix="/api/public", tags=["public"])

class BetaWaitlistRequest(BaseModel):
    email: EmailStr

@router.post("/beta-waitlist")
async def join_beta_waitlist(
    request: BetaWaitlistRequest,
    db: Session = Depends(get_db)
):
    """Add email to beta waitlist"""
    # Check if email already exists
    existing = db.query(BetaWaitlist).filter(BetaWaitlist.email == request.email).first()
    if existing:
        return {"message": "Email already registered for beta access", "success": True}
    
    # Add to waitlist
    waitlist_entry = BetaWaitlist(
        email=request.email,
        notified=False
    )
    
    db.add(waitlist_entry)
    db.commit()
    db.refresh(waitlist_entry)
    
    return {"message": "Successfully added to beta waitlist", "success": True}

@router.get("/beta-waitlist")
async def get_waitlist_count(
    db: Session = Depends(get_db)
):
    """Get waitlist count (for display purposes)"""
    count = db.query(BetaWaitlist).count()
    return {"count": count}

@router.get("/beta-password")
async def get_beta_password_public(db: Session = Depends(get_db)):
    """Get current BetaGate password (public endpoint for BetaGate page)"""
    setting = db.query(AppSettings).filter(AppSettings.key == "beta_access_password").first()
    if not setting:
        # Return default if not set
        default_password = "androama2025beta"
        return {"password": default_password}
    return {"password": setting.value}

