from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, BetaWaitlist, CommunityPost, CommunityReply, AppSettings
from app.auth import get_current_active_user
from app.schemas import UserResponse, BetaWaitlistResponse
from pydantic import BaseModel
import uuid
import os
import json
import shutil
from pathlib import Path

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

class UserTierUpdate(BaseModel):
    subscription_tier: str

@router.put("/users/{user_id}/tier", response_model=UserResponse)
async def update_user_tier(
    user_id: str,
    tier_update: UserTierUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update user subscription tier (admin only)"""
    # Validate tier value - only beta and lifetime are available
    valid_tiers = ['beta', 'lifetime']
    tier = tier_update.subscription_tier.lower()
    if tier not in valid_tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Must be one of: {', '.join(valid_tiers)}"
        )
    
    # Find user
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update tier
    old_tier = user.subscription_tier
    user.subscription_tier = tier
    
    # Both beta and lifetime are functionally the same - set status to active/lifetime
    if tier == 'lifetime':
        user.subscription_status = 'lifetime'
        user.subscription_end = None
    elif tier == 'beta':
        # Beta tier is functionally the same as lifetime
        user.subscription_status = 'active'
        user.subscription_end = None
    
    db.commit()
    db.refresh(user)
    
    return user

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

# ==================== APP MANAGEMENT ====================

def get_apps_list_path() -> Path:
    """Get path to apps list JSON file"""
    backend_dir = Path(__file__).parent.parent.parent
    apps_file = backend_dir / "apps_list.json"
    return apps_file

def get_downloads_dir() -> Path:
    """Get path to downloads directory"""
    # Try to get from environment or use default
    downloads_path = os.getenv("APPS_DOWNLOADS_DIR", "/var/www/androama/downloads")
    return Path(downloads_path)

def load_apps_list() -> dict:
    """Load apps list from JSON file"""
    apps_file = get_apps_list_path()
    if not apps_file.exists():
        # Return default structure
        return {
            "apps": [],
            "lastUpdated": datetime.utcnow().isoformat() + "Z"
        }
    
    try:
        with open(apps_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load apps list: {str(e)}"
        )

def save_apps_list(apps_data: dict):
    """Save apps list to JSON file"""
    apps_file = get_apps_list_path()
    try:
        apps_data["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
        with open(apps_file, 'w', encoding='utf-8') as f:
            json.dump(apps_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save apps list: {str(e)}"
        )

class AppCreate(BaseModel):
    name: str
    description: str
    version: str
    package_name: str
    category: str = "Other"
    icon_url: Optional[str] = None
    is_essential: bool = False

class AppUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    package_name: Optional[str] = None
    category: Optional[str] = None
    icon_url: Optional[str] = None
    is_essential: Optional[bool] = None

@router.post("/apps/upload")
async def upload_app(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...),
    version: str = Form(...),
    package_name: str = Form(...),
    category: str = Form("Other"),
    icon_url: Optional[str] = Form(None),
    is_essential: bool = Form(False),
    current_user: User = Depends(get_current_admin)
):
    """Upload a new APK file and add it to the apps list"""
    
    # Validate file type
    if not file.filename.endswith('.apk'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only APK files are allowed"
        )
    
    # Validate file size (max 100MB)
    file_content = await file.read()
    if len(file_content) > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 100MB limit"
        )
    
    # Generate app ID from name
    app_id = name.lower().replace(' ', '_').replace('-', '_')
    app_id = ''.join(c for c in app_id if c.isalnum() or c == '_')
    
    # Check if app ID already exists
    apps_data = load_apps_list()
    existing_app = next((app for app in apps_data["apps"] if app.get("id") == app_id), None)
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"App with ID '{app_id}' already exists"
        )
    
    # Create downloads directory if it doesn't exist
    downloads_dir = get_downloads_dir()
    downloads_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename
    safe_filename = f"{app_id}-v{version}.apk"
    file_path = downloads_dir / safe_filename
    
    # Save file
    try:
        with open(file_path, 'wb') as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Generate download URL (use API endpoint for reliability)
    base_url = os.getenv("FRONTEND_URL", "https://androama.com")
    download_url = f"{base_url}/api/public/downloads/{safe_filename}"
    
    # Create app entry
    app_entry = {
        "id": app_id,
        "name": name,
        "description": description,
        "version": version,
        "packageName": package_name,
        "downloadUrl": download_url,
        "iconUrl": icon_url or f"{base_url}/images/default-app-icon.png",
        "category": category,
        "isEssential": is_essential
    }
    
    # Add to apps list
    apps_data["apps"].append(app_entry)
    save_apps_list(apps_data)
    
    return {
        "message": "App uploaded successfully",
        "app": app_entry
    }

@router.get("/apps/list")
async def get_admin_apps_list(
    current_user: User = Depends(get_current_admin)
):
    """Get all apps (admin view with full details)"""
    apps_data = load_apps_list()
    return apps_data

@router.put("/apps/{app_id}")
async def update_app(
    app_id: str,
    app_update: AppUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update app details"""
    apps_data = load_apps_list()
    
    app_index = next((i for i, app in enumerate(apps_data["apps"]) if app.get("id") == app_id), None)
    if app_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"App with ID '{app_id}' not found"
        )
    
    app = apps_data["apps"][app_index]
    
    # Update fields
    if app_update.name is not None:
        app["name"] = app_update.name
    if app_update.description is not None:
        app["description"] = app_update.description
    if app_update.version is not None:
        app["version"] = app_update.version
        # Update filename if version changed
        old_filename = f"{app_id}-v{app.get('version', '1.0')}.apk"
        new_filename = f"{app_id}-v{app_update.version}.apk"
        downloads_dir = get_downloads_dir()
        old_path = downloads_dir / old_filename
        new_path = downloads_dir / new_filename
        if old_path.exists() and not new_path.exists():
            try:
                shutil.move(str(old_path), str(new_path))
                base_url = os.getenv("FRONTEND_URL", "https://androama.com")
                app["downloadUrl"] = f"{base_url}/downloads/{new_filename}"
            except Exception as e:
                pass  # If move fails, keep old URL
    if app_update.package_name is not None:
        app["packageName"] = app_update.package_name
    if app_update.category is not None:
        app["category"] = app_update.category
    if app_update.icon_url is not None:
        app["iconUrl"] = app_update.icon_url
    if app_update.is_essential is not None:
        app["isEssential"] = app_update.is_essential
    
    save_apps_list(apps_data)
    
    return {
        "message": "App updated successfully",
        "app": app
    }

@router.delete("/apps/{app_id}")
async def delete_app(
    app_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete an app and its APK file"""
    apps_data = load_apps_list()
    
    app_index = next((i for i, app in enumerate(apps_data["apps"]) if app.get("id") == app_id), None)
    if app_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"App with ID '{app_id}' not found"
        )
    
    app = apps_data["apps"][app_index]
    
    # Delete APK file
    downloads_dir = get_downloads_dir()
    version = app.get("version", "1.0")
    filename = f"{app_id}-v{version}.apk"
    file_path = downloads_dir / filename
    
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception as e:
            pass  # Continue even if file deletion fails
    
    # Remove from apps list
    apps_data["apps"].pop(app_index)
    save_apps_list(apps_data)
    
    return {
        "message": "App deleted successfully"
    }

