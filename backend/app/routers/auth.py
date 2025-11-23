from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
import os
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, UserLogin
from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_user_by_email,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    truncate_password
)
from app.oauth import google_oauth_login
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])

class GoogleTokenRequest(BaseModel):
    token: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with robust validation"""
    try:
        # Validate email format (Pydantic does this, but double-check)
        if not user_data.email or "@" not in user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check if user already exists
        existing_user = get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username is taken
        if user_data.username:
            existing_username = db.query(User).filter(User.username == user_data.username).first()
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Validate password strength
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # CRITICAL: Truncate password BEFORE hashing to prevent 72-byte limit errors
        password = truncate_password(user_data.password)
        
        # Create new user
        hashed_password = get_password_hash(password)
        new_user = User(
            email=user_data.email.lower().strip(),  # Normalize email
            password_hash=hashed_password,
            username=user_data.username.strip() if user_data.username else None,
            edition=user_data.edition or "monitor",
            subscription_status="none",
            subscription_tier="beta",
            is_active=True,
            email_verified=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token with robust error handling"""
    try:
        # Normalize email
        email = credentials.email.lower().strip()
        
        # CRITICAL: Truncate password to 70 bytes BEFORE authentication
        # This prevents passlib/bcrypt from throwing errors about password length
        password = truncate_password(credentials.password)
        # Force truncate to 70 bytes to be absolutely safe
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 70:
            password_bytes = password_bytes[:70]
            password = password_bytes.decode('utf-8', errors='ignore')
        
        # Check if user has OAuth account (no password)
        user = get_user_by_email(db, email)
        if user and user.oauth_provider and not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Please sign in with {user.oauth_provider.title()}"
            )
        
        # Authenticate user with truncated password
        # Wrap in try-except to catch any passlib errors
        try:
            user = authenticate_user(db, email, password)
        except (ValueError, Exception) as e:
            # If passlib still throws 72-byte error, truncate more aggressively
            error_msg = str(e).lower()
            if "72" in error_msg or "byte" in error_msg or "truncate" in error_msg or "too long" in error_msg:
                # Last resort: truncate to 65 bytes and try again
                password_bytes = password.encode('utf-8')[:65]
                password = password_bytes.decode('utf-8', errors='ignore')
                user = authenticate_user(db, email, password)
            else:
                # Re-raise if it's a different error
                raise
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@router.post("/google", response_model=Token)
async def google_login(request: GoogleTokenRequest, db: Session = Depends(get_db)):
    """Login with Google OAuth token"""
    try:
        return await google_oauth_login(db, request.token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth error: {str(e)}"
        )

@router.post("/google/callback")
async def google_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db)
):
    """Handle OAuth 2.0 redirect callback - exchange code for token"""
    import httpx
    from app.oauth import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )
    
    try:
        # Exchange authorization code for tokens
        # The redirect_uri MUST match exactly what was used in the initial request
        redirect_uri = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login"
        
        print(f"🔍 Exchanging OAuth code:")
        print(f"  - Client ID: {GOOGLE_CLIENT_ID}")
        print(f"  - Client Secret: {'*' * 10 if GOOGLE_CLIENT_SECRET else 'MISSING'}")
        print(f"  - Redirect URI: {redirect_uri}")
        print(f"  - Code: {code[:20]}...")
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                timeout=10.0
            )
            
            print(f"🔍 Google token response status: {token_response.status_code}")
            if token_response.status_code != 200:
                error_text = token_response.text
                print(f"❌ Google token exchange error: {error_text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Failed to exchange authorization code: {error_text}"
                )
            
            token_data = token_response.json()
            id_token = token_data.get("id_token")
            
            if not id_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No ID token received from Google"
                )
            
            # Use existing google_oauth_login function with the ID token
            return await google_oauth_login(db, id_token)
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error communicating with Google: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth callback error: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout (client should remove token)"""
    return {"message": "Successfully logged out"}

@router.post("/beta/access-token")
async def generate_beta_access_token(
    current_user: User = Depends(get_current_active_user)
):
    """Generate a short-lived token for logged-in users to bypass betagate password.
    
    Any authenticated user can generate tokens to access the website without entering
    the betagate password again. Tokens expire after 60 seconds.
    """
    # Allow ALL logged-in users to get beta access tokens
    # This enables seamless redirect from Flutter app to website
    tier = (current_user.subscription_tier or '').lower()
    is_admin = current_user.is_admin or False
    
    # Generate a short-lived JWT token (60 seconds TTL)
    token_data = {
        "sub": current_user.email,
        "user_id": str(current_user.id),
        "tier": tier,
        "type": "beta_access"
    }
    expires_delta = timedelta(seconds=60)
    beta_token = create_access_token(data=token_data, expires_delta=expires_delta)
    
    return {
        "token": beta_token,
        "ttl_seconds": 60
    }

@router.post("/verify-token")
async def verify_token(data: dict, db: Session = Depends(get_db)):
    """Verify JWT token and return user data (for desktop app integration)"""
    from app.auth import get_current_active_user_from_token
    from jose import JWTError
    
    token = data.get("token")
    if not token:
        return {"success": False, "error": "Token is required"}
    
    try:
        # Verify token and get user
        user = get_current_active_user_from_token(token, db)
        
        return {
            "success": True,
            "user_id": str(user.id),  # Convert UUID to string
            "email": user.email,
            "license_tier": user.subscription_tier or "beta",
            "edition": user.edition or "monitor",
            "subscription_status": user.subscription_status or "active"
        }
    except JWTError as e:
        return {"success": False, "error": "Invalid token"}
    except HTTPException as e:
        return {"success": False, "error": e.detail}
    except Exception as e:
        logger.error(f"Token verification error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}

@router.get("/health")
async def health_check():
    """Health check endpoint for VPS connectivity"""
    return {"status": "ok"}

