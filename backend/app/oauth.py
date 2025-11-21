"""
Google OAuth2 authentication using Google Identity Services
"""
import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import User
from app.auth import create_access_token, get_user_by_email
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

async def verify_google_token(token: str) -> dict:
    """Verify Google Identity Services JWT token and get user info"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )
    
    try:
        # Google Identity Services provides a JWT credential token (ID token)
        # We'll use Google's tokeninfo endpoint to verify and decode it
        async with httpx.AsyncClient() as client:
            tokeninfo_response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": token},
                timeout=10.0
            )
            
            if tokeninfo_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            token_info = tokeninfo_response.json()
            
            # Verify the token is for our client
            if token_info.get("aud") != GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token audience mismatch"
                )
            
            # Extract user info from token
            user_info = {
                "id": token_info.get("sub"),
                "email": token_info.get("email"),
                "verified_email": token_info.get("email_verified", False),
                "name": token_info.get("name"),
                "picture": token_info.get("picture"),
                "given_name": token_info.get("given_name"),
                "family_name": token_info.get("family_name")
            }
            
            # Verify email is verified
            if not user_info.get("verified_email"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not verified with Google"
                )
            
            return user_info
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Google OAuth verification timeout"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error verifying Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )

async def get_or_create_google_user(db: Session, google_user_info: dict) -> User:
    """Get existing user or create new user from Google OAuth"""
    email = google_user_info.get("email")
    google_id = google_user_info.get("id")
    
    if not email or not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google user information"
        )
    
    # Check if user exists by email
    user = get_user_by_email(db, email)
    
    if user:
        # User exists - update OAuth info if needed
        if not user.oauth_provider or user.oauth_provider != "google":
            # Link Google account to existing user
            user.oauth_provider = "google"
            user.oauth_id = google_id
            user.email_verified = True
            if google_user_info.get("picture"):
                user.avatar_url = google_user_info.get("picture")
            db.commit()
            db.refresh(user)
        elif user.oauth_id != google_id:
            # OAuth ID mismatch - security issue
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered with different Google account"
            )
    else:
        # Create new user
        user = User(
            email=email,
            password_hash=None,  # No password for OAuth users
            username=google_user_info.get("name", "").split()[0] if google_user_info.get("name") else None,
            oauth_provider="google",
            oauth_id=google_id,
            avatar_url=google_user_info.get("picture"),
            email_verified=True,  # Google emails are verified
            edition="monitor",
            subscription_status="none",
            subscription_tier="beta",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

async def google_oauth_login(db: Session, google_token: str) -> dict:
    """Complete Google OAuth login flow"""
    # Verify token and get user info
    google_user_info = await verify_google_token(google_token)
    
    # Get or create user
    user = await get_or_create_google_user(db, google_user_info)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

