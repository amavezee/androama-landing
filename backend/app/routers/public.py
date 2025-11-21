from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models import BetaWaitlist, AppSettings
from pathlib import Path
import os
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


@router.get("/apps/list")
async def get_apps_list():
    """
    Get list of available apps for Androama desktop app.
    This endpoint is checked automatically when users open the Apps section.
    
    Apps are managed through the Admin Panel - no manual editing needed!
    """
    import json
    from pathlib import Path
    
    # Try to load from JSON file (managed by admin panel)
    backend_dir = Path(__file__).parent.parent.parent
    apps_file = backend_dir / "apps_list.json"
    
    if apps_file.exists():
        try:
            with open(apps_file, 'r', encoding='utf-8') as f:
                apps_data = json.load(f)
                # Ensure lastUpdated is current
                from datetime import datetime
                apps_data["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
                return apps_data
        except Exception as e:
            # If JSON file is corrupted, fall back to default
            pass
    
    # Fallback to default apps if JSON file doesn't exist
    from datetime import datetime
    
    apps = [
        {
            "id": "androama_websocket_client",
            "name": "ANDROAMA Client",
            "description": "Enhanced WebSocket client v2.0 with SMS, phone calls, photos, notifications, and ADB Proxy. Full device integration for seamless PC-to-phone connectivity.",
            "version": "2.0.0",
            "build": 13,
            "packageName": "com.androama.websocketclient",
            "downloadUrl": "https://androama.com/downloads/androama-client-v2.0.0-build13.apk",
            "iconUrl": "https://androama.com/images/androama-client-icon.png",
            "category": "Essentials",
            "isEssential": True
        },
        {
            "id": "termux",
            "name": "Termux",
            "description": "Terminal emulator with package management. Required for SSH tunnels and advanced features. Provides Linux-like environment on Android.",
            "version": "0.118.0",
            "packageName": "com.termux",
            "downloadUrl": "https://androama.com/downloads/termux-latest.apk",
            "iconUrl": "https://raw.githubusercontent.com/termux/termux-app/master/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
            "category": "Tools",
            "isEssential": False
        }
    ]
    
    return {
        "apps": apps,
        "lastUpdated": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/downloads/{filename:path}")
async def download_file(filename: str):
    """
    Serve APK files from the public/downloads directory.
    This endpoint allows downloading APK files that were uploaded via the Admin Panel.
    """
    try:
        # Get the backend directory (parent of app directory)
        backend_dir = Path(__file__).parent.parent.parent
        downloads_dir = backend_dir / "public" / "downloads"
        file_path = downloads_dir / filename
        
        # Security: prevent directory traversal
        try:
            file_path.resolve().relative_to(downloads_dir.resolve())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid file path"
            )
        
        # Check if file exists
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found: {filename}"
            )
        
        # Return file with appropriate content type
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type="application/vnd.android.package-archive"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error serving file: {str(e)}"
        )

