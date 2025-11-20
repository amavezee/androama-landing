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

