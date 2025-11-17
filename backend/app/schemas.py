from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import json

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    edition: Optional[str] = "monitor"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: UUID
    subscription_status: str
    subscription_tier: str
    license_key: Optional[str] = None
    subscription_end: Optional[datetime] = None
    created_at: datetime
    last_login: Optional[datetime]
    is_active: bool
    email_verified: bool
    is_admin: bool
    oauth_provider: Optional[str] = None
    avatar_url: Optional[str] = None
    has_downloaded: bool = False
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    edition: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# App Schemas
class AppBase(BaseModel):
    name: str
    package_name: str
    description: Optional[str] = None
    version: Optional[str] = None
    apk_url: Optional[str] = None
    icon_url: Optional[str] = None
    category: Optional[str] = None
    requires_edition: str = "all"
    is_featured: bool = False

class AppResponse(AppBase):
    id: UUID
    download_count: int
    rating: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Device Schemas
class DeviceBase(BaseModel):
    device_id: str
    device_name: Optional[str] = None
    device_model: Optional[str] = None
    android_version: Optional[str] = None

class DeviceResponse(DeviceBase):
    id: UUID
    user_id: UUID
    last_seen: Optional[datetime]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Community Post Schemas
class PostAuthor(BaseModel):
    id: UUID
    username: Optional[str]
    email: str
    edition: str
    is_admin: bool
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    content: str = Field(..., min_length=10)
    category: str
    tags: Optional[List[str]] = []

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=500)
    content: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_solved: Optional[bool] = None

class PostResponse(BaseModel):
    id: UUID
    title: str
    content: str
    category: str
    tags: List[str]
    is_pinned: bool
    is_announcement: bool
    is_solved: bool
    views: int
    likes_count: int
    replies_count: int
    created_at: datetime
    updated_at: datetime
    author: PostAuthor
    user_liked: bool = False
    
    class Config:
        from_attributes = True

# Community Reply Schemas
class ReplyCreate(BaseModel):
    content: str = Field(..., min_length=1)

class ReplyAuthor(BaseModel):
    id: UUID
    username: Optional[str]
    email: str
    is_admin: bool
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReplyResponse(BaseModel):
    id: UUID
    content: str
    is_official: bool
    likes_count: int
    created_at: datetime
    updated_at: datetime
    author: ReplyAuthor
    user_liked: bool = False
    
    class Config:
        from_attributes = True

# Beta Waitlist Schemas
class BetaWaitlistEntry(BaseModel):
    email: EmailStr

class BetaWaitlistResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime
    notified: bool
    notified_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
