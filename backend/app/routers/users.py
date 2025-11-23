from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate, PasswordChange
from app.auth import get_current_active_user, verify_password, get_password_hash, truncate_password

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get user profile"""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    # Check if username is taken (if provided and different)
    if user_update.username is not None:
        username_trimmed = user_update.username.strip() if user_update.username else None
        # Allow empty string to clear username
        if username_trimmed == "":
            username_trimmed = None
        
        if username_trimmed != current_user.username:
            if username_trimmed:  # Only check if username is not None/empty
                existing_user = db.query(User).filter(User.username == username_trimmed).first()
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Username already taken"
                    )
            current_user.username = username_trimmed
    
    if user_update.edition:
        current_user.edition = user_update.edition
    
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/profile/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Check if user has a password (OAuth users don't have passwords)
    if not current_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password change not available for OAuth accounts. Please use your OAuth provider to manage your account."
        )
    
    # CRITICAL: Truncate passwords BEFORE verification/hashing to prevent 72-byte limit errors
    current_password = truncate_password(password_data.current_password)
    new_password = truncate_password(password_data.new_password)
    
    # Verify current password
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Check if new password is different
    if verify_password(new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/profile/mark-downloaded")
async def mark_downloaded(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark that user has downloaded the app"""
    current_user.has_downloaded = True
    db.commit()
    db.refresh(current_user)
    return {"message": "Download status updated", "has_downloaded": True}

@router.get("/{user_id}/license/status")
async def get_license_status(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's license status (for desktop app integration)"""
    import uuid
    from datetime import datetime
    
    # Convert user_id string to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Verify user can access this (own profile or admin)
    if str(current_user.id) != str(user_id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Determine if license is valid
    is_valid = True
    if user.subscription_status == "expired":
        is_valid = False
    elif user.subscription_status == "cancelled":
        is_valid = False
    elif user.subscription_end:
        if datetime.now(user.subscription_end.tzinfo) > user.subscription_end:
            is_valid = False
    
    return {
        "success": True,
        "tier": user.subscription_tier or "beta",
        "status": "valid" if is_valid else "expired",
        "is_valid": is_valid,
        "subscription_end": user.subscription_end.isoformat() if user.subscription_end else None,
        "payment_status": user.subscription_status or "active"
    }

@router.get("/{user_id}/license/check")
async def check_license(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check if user's license is valid (for desktop app integration)"""
    import uuid
    from datetime import datetime
    
    # Convert user_id string to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        return {"success": False, "valid": False, "reason": "Invalid user ID format"}
    
    # Verify user can access this
    if str(current_user.id) != str(user_id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        return {"success": False, "valid": False, "reason": "User not found"}
    
    # Check license validity
    is_valid = True
    reason = ""
    
    if user.subscription_status == "expired":
        is_valid = False
        reason = "Subscription expired"
    elif user.subscription_status == "cancelled":
        is_valid = False
        reason = "Subscription cancelled"
    elif user.subscription_end:
        if datetime.now(user.subscription_end.tzinfo) > user.subscription_end:
            is_valid = False
            reason = "Subscription expired"
    
    return {
        "success": True,
        "valid": is_valid,
        "reason": reason
    }

@router.put("/{user_id}/edition")
async def update_edition(
    user_id: str,
    data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's edition (for desktop app integration)"""
    import uuid
    
    # Convert user_id string to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Verify user can update this (own profile or admin)
    if str(current_user.id) != str(user_id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    edition = data.get("edition")
    valid_editions = ["monitor", "parental", "enterprise", "custom"]
    
    if edition not in valid_editions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid edition. Must be one of: {', '.join(valid_editions)}"
        )
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.edition = edition
    db.commit()
    
    return {"success": True}

