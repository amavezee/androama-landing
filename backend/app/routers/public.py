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

class BetaTokenRequest(BaseModel):
    token: str

@router.post("/beta/validate-token")
async def validate_beta_token(request: BetaTokenRequest):
    """Validate a beta access token (public endpoint, no auth required).
    
    Returns whether the token is valid and grants beta access.
    """
    from jose import JWTError, jwt
    import os
    
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        
        # Check if this is a beta access token
        if token_type != "beta_access":
            return {"valid": False, "reason": "Invalid token type"}
        
        # Token is valid
        return {"valid": True}
    except JWTError:
        return {"valid": False, "reason": "Token expired or invalid"}

