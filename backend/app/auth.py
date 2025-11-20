from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Configure bcrypt context with truncation handling
# Note: bcrypt has a 72-byte limit, we handle truncation in our functions
# Try to disable passlib's internal validation by using a custom handler
_base_pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto", 
    bcrypt__ident="2b",
    # Try to prevent passlib from validating password length
    bcrypt__rounds=12
)

# Create a wrapper class that ALWAYS truncates passwords before passlib sees them
class TruncatingCryptContext:
    """Wrapper around CryptContext that always truncates passwords to 72 bytes"""
    def __init__(self, base_context):
        self._base = base_context
    
    def hash(self, password: str) -> str:
        """Hash a password, truncating to 70 bytes first to avoid passlib errors"""
        # CRITICAL: Truncate BEFORE passlib sees it - this is the only way to prevent the error
        if not isinstance(password, str):
            password = str(password)
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 70:
            password_bytes = password_bytes[:70]
            password = password_bytes.decode('utf-8', errors='ignore')
        try:
            return self._base.hash(password)
        except (ValueError, Exception) as e:
            # If still fails, truncate even more aggressively
            error_str = str(e).lower()
            if "72" in error_str or "byte" in error_str or "truncate" in error_str:
                # Last resort: truncate to 65 bytes
                password_bytes = password.encode('utf-8')[:65]
                password = password_bytes.decode('utf-8', errors='ignore')
                return self._base.hash(password)
            raise
    
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password, truncating to 70 bytes first to avoid passlib errors"""
        # CRITICAL: Truncate BEFORE passlib sees it - this is the only way to prevent the error
        if not isinstance(plain_password, str):
            plain_password = str(plain_password)
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 70:
            password_bytes = password_bytes[:70]
            plain_password = password_bytes.decode('utf-8', errors='ignore')
        try:
            return self._base.verify(plain_password, hashed_password)
        except (ValueError, Exception) as e:
            # If still fails, truncate even more aggressively
            error_str = str(e).lower()
            if "72" in error_str or "byte" in error_str or "truncate" in error_str:
                # Last resort: truncate to 65 bytes
                password_bytes = plain_password.encode('utf-8')[:65]
                plain_password = password_bytes.decode('utf-8', errors='ignore')
                return self._base.verify(plain_password, hashed_password)
            raise

# Use the truncating wrapper
pwd_context = TruncatingCryptContext(_base_pwd_context)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def truncate_password(password: str) -> str:
    """Truncate password to 72 bytes for bcrypt compatibility"""
    if not isinstance(password, str):
        password = str(password)
    
    # Encode to bytes to check actual byte length
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to exactly 72 bytes
        password_bytes = password_bytes[:72]
        # Decode back to string, handling potential UTF-8 truncation issues
        try:
            password = password_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If truncation broke UTF-8, remove last byte and try again
            password_bytes = password_bytes[:71]
            password = password_bytes.decode('utf-8', errors='ignore')
    
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # The TruncatingCryptContext wrapper handles truncation automatically
    # But we'll also truncate here as a safety measure
    plain_password = truncate_password(plain_password)
    
    # Ensure it's definitely <= 70 bytes
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 70:
        password_bytes = password_bytes[:70]
        plain_password = password_bytes.decode('utf-8', errors='ignore')
    
    # The wrapper will truncate again, but this ensures we're safe
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # The TruncatingCryptContext wrapper handles truncation automatically
    # But we'll also truncate here as a safety measure
    password = truncate_password(password)
    
    # Ensure it's definitely <= 70 bytes
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 70:
        password_bytes = password_bytes[:70]
        password = password_bytes.decode('utf-8', errors='ignore')
    
    # The wrapper will truncate again, but this ensures we're safe
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

