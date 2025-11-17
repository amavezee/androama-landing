from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, BetaWaitlist, CommunityPost, CommunityReply, AppSettings
from app.auth import get_current_active_user
from app.schemas import UserResponse, BetaWaitlistResponse
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_current_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Ensure current user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_waitlist: int
    waitlist_notified: int
    total_posts: int
    total_replies: int
    users_last_7_days: int
    users_last_30_days: int
    posts_last_7_days: int
    users_with_downloads: int

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)
    
    # User statistics
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    users_last_7_days = db.query(func.count(User.id)).filter(
        User.created_at >= seven_days_ago
    ).scalar() or 0
    users_last_30_days = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar() or 0
    users_with_downloads = db.query(func.count(User.id)).filter(
        User.has_downloaded == True
    ).scalar() or 0
    
    # Waitlist statistics
    total_waitlist = db.query(func.count(BetaWaitlist.id)).scalar() or 0
    waitlist_notified = db.query(func.count(BetaWaitlist.id)).filter(
        BetaWaitlist.notified == True
    ).scalar() or 0
    
    # Community statistics
    total_posts = db.query(func.count(CommunityPost.id)).scalar() or 0
    total_replies = db.query(func.count(CommunityReply.id)).scalar() or 0
    posts_last_7_days = db.query(func.count(CommunityPost.id)).filter(
        CommunityPost.created_at >= seven_days_ago
    ).scalar() or 0
    
    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        total_waitlist=total_waitlist,
        waitlist_notified=waitlist_notified,
        total_posts=total_posts,
        total_replies=total_replies,
        users_last_7_days=users_last_7_days,
        users_last_30_days=users_last_30_days,
        posts_last_7_days=posts_last_7_days,
        users_with_downloads=users_with_downloads
    )

@router.get("/waitlist", response_model=List[BetaWaitlistResponse])
async def get_waitlist(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all beta waitlist entries"""
    waitlist = db.query(BetaWaitlist).order_by(
        BetaWaitlist.created_at.desc()
    ).offset(skip).limit(limit).all()
    return waitlist

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).order_by(
        User.created_at.desc()
    ).offset(skip).limit(limit).all()
    return users

class BetaPasswordUpdate(BaseModel):
    password: str

@router.get("/beta-password")
async def get_beta_password(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get current BetaGate password"""
    setting = db.query(AppSettings).filter(AppSettings.key == "beta_access_password").first()
    if not setting:
        # Return default if not set
        default_password = "androama2025beta"
        # Create it
        setting = AppSettings(
            key="beta_access_password",
            value=default_password,
            description="Beta access password for ANDROAMA",
            updated_by=current_user.id
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return {"password": setting.value}

@router.put("/beta-password")
async def update_beta_password(
    password_data: BetaPasswordUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update BetaGate password"""
    if not password_data.password or len(password_data.password) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 3 characters long"
        )
    
    setting = db.query(AppSettings).filter(AppSettings.key == "beta_access_password").first()
    if setting:
        setting.value = password_data.password
        setting.updated_by = current_user.id
        setting.updated_at = datetime.utcnow()
    else:
        setting = AppSettings(
            key="beta_access_password",
            value=password_data.password,
            description="Beta access password for ANDROAMA",
            updated_by=current_user.id
        )
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    return {"message": "Beta password updated successfully", "password": setting.value}

