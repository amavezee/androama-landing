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
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

# CRITICAL FIX: Add __about__ compatibility shim for bcrypt 5.0.0
# Passlib expects bcrypt.__about__.__version__ but bcrypt 5.0.0 doesn't have it
# This must be done BEFORE passlib imports bcrypt
try:
    import bcrypt as _bcrypt_check
    if not hasattr(_bcrypt_check, '__about__'):
        class _BcryptAbout:
            __version__ = getattr(_bcrypt_check, '__version__', '5.0.0')
        _bcrypt_check.__about__ = _BcryptAbout()
        print("✅ Added bcrypt __about__ compatibility shim for passlib")
except Exception as e:
    print(f"⚠️ Warning: Could not add bcrypt __about__ shim: {e}")

# CRITICAL FIX: Monkey-patch bcrypt to truncate passwords BEFORE they reach passlib
# This ensures passwords are always truncated, even if passlib calls bcrypt directly
try:
    import bcrypt as _bcrypt_module
    _original_hashpw = _bcrypt_module.hashpw
    _original_checkpw = _bcrypt_module.checkpw
    
    def _truncate_bytes_for_bcrypt(password: bytes) -> bytes:
        """Truncate password bytes to 70 bytes for bcrypt"""
        if len(password) > 70:
            return password[:70]
        return password
    
    def _patched_hashpw(password: bytes, salt: bytes) -> bytes:
        """Patched hashpw that truncates passwords > 70 bytes"""
        password = _truncate_bytes_for_bcrypt(password)
        return _original_hashpw(password, salt)
    
    def _patched_checkpw(password: bytes, hashed: bytes) -> bool:
        """Patched checkpw that truncates passwords > 70 bytes"""
        password = _truncate_bytes_for_bcrypt(password)
        return _original_checkpw(password, hashed)
    
    # Apply the monkey patch
    _bcrypt_module.hashpw = _patched_hashpw
    _bcrypt_module.checkpw = _patched_checkpw
    print("✅ Monkey-patched bcrypt to truncate passwords automatically")
except Exception as e:
    print(f"⚠️ Warning: Could not monkey-patch bcrypt: {e}")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Configure bcrypt context with truncation handling
# Note: bcrypt has a 72-byte limit, we handle truncation in our functions
# CRITICAL: Configure passlib to work with bcrypt 5.0.0
# Force passlib to use bcrypt backend explicitly and handle $2a$/$2b$ formats
try:
    # Try to force passlib to use bcrypt backend before creating context
    from passlib.handlers.bcrypt import bcrypt
    # Ensure backend is set
    if hasattr(bcrypt, 'set_backend'):
        try:
            bcrypt.set_backend('bcrypt')
        except Exception:
            pass  # Backend might already be set
except Exception:
    pass  # Will use default

_base_pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto", 
    bcrypt__ident="2b",  # Use $2b$ format (most compatible with bcrypt 5.0.0)
    bcrypt__rounds=12,
    bcrypt__min_rounds=4,
    bcrypt__max_rounds=31,
    # Allow passlib to handle both $2a$ and $2b$ formats
    bcrypt__vary_rounds=0.1,
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
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except RuntimeError as e:
        # Handle "wraparound hash" error - this is a passlib/bcrypt compatibility issue
        error_msg = str(e).lower()
        if "wraparound" in error_msg or "backend failed" in error_msg:
            logger.warning(f"Passlib backend error, trying direct bcrypt verification: {e}")
            # Fallback: try direct bcrypt verification
            try:
                import bcrypt as _bcrypt_direct
                # Convert hash to bytes if needed
                if isinstance(hashed_password, str):
                    hashed_bytes = hashed_password.encode('utf-8')
                else:
                    hashed_bytes = hashed_password
                # Verify directly with bcrypt
                password_bytes = plain_password.encode('utf-8')
                if len(password_bytes) > 70:
                    password_bytes = password_bytes[:70]
                return _bcrypt_direct.checkpw(password_bytes, hashed_bytes)
            except Exception as direct_error:
                logger.error(f"Direct bcrypt verification also failed: {direct_error}")
                raise e  # Re-raise original error
        raise
    except Exception as e:
        # Log other errors for debugging
        logger.error(f"Password verification error: {e}, hash format: {hashed_password[:20] if hashed_password else 'None'}...")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Re-raise to maintain original behavior
        raise

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

