from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, DECIMAL, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

# UUID type that works with both PostgreSQL and SQLite
class GUID(TypeDecorator):
    """Platform-independent GUID type. Uses PostgreSQL UUID when available, otherwise String."""
    impl = String
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID())
        else:
            return dialect.type_descriptor(String(36))
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(value)
            return str(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value

class User(Base):
    __tablename__ = "users"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth users
    username = Column(String(100), unique=True, nullable=True)
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'github', etc.
    oauth_id = Column(String(255), nullable=True, index=True)  # OAuth provider user ID
    avatar_url = Column(String(500), nullable=True)  # Profile picture from OAuth
    edition = Column(String(50), default='monitor')  # monitor, parental, enterprise, ultimate
    subscription_status = Column(String(50), default='none')  # none, active, expired, cancelled, lifetime (matches desktop)
    subscription_tier = Column(String(50), default='free')  # free, pro, lifetime (matches desktop license_tier)
    license_key = Column(String(255), unique=True, nullable=True, index=True)  # License key for desktop app
    subscription_end = Column(DateTime(timezone=True), nullable=True)  # When subscription expires
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    app_downloads = relationship("UserAppDownload", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("UserDevice", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("CommunityPost", back_populates="user", cascade="all, delete-orphan")
    replies = relationship("CommunityReply", back_populates="user", cascade="all, delete-orphan")
    
    # Track if user has downloaded the app
    has_downloaded = Column(Boolean, default=False)

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    device_info = Column(Text)  # JSON string
    ip_address = Column(String(45))
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class App(Base):
    __tablename__ = "apps"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    package_name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=True)
    apk_url = Column(String(500), nullable=True)
    icon_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    requires_edition = Column(String(50), default="all")
    is_featured = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    rating = Column(DECIMAL(3, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    downloads = relationship("UserAppDownload", back_populates="app", cascade="all, delete-orphan")

class UserAppDownload(Base):
    __tablename__ = "user_app_downloads"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    app_id = Column(GUID(), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False)
    downloaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="app_downloads")
    app = relationship("App", back_populates="downloads")

class UserDevice(Base):
    __tablename__ = "user_devices"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String(255), nullable=False, index=True)
    device_name = Column(String(255), nullable=True)
    device_model = Column(String(255), nullable=True)
    android_version = Column(String(50), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="devices")

class CommunityPost(Base):
    __tablename__ = "community_posts"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    tags = Column(Text)  # JSON string array
    is_pinned = Column(Boolean, default=False)
    is_announcement = Column(Boolean, default=False)
    is_solved = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="posts")
    replies = relationship("CommunityReply", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")

class CommunityReply(Base):
    __tablename__ = "community_replies"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    post_id = Column(GUID(), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_official = Column(Boolean, default=False)  # For team/admin replies
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    post = relationship("CommunityPost", back_populates="replies")
    user = relationship("User", back_populates="replies")
    likes = relationship("ReplyLike", back_populates="reply", cascade="all, delete-orphan")

class PostLike(Base):
    __tablename__ = "post_likes"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    post_id = Column(GUID(), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("CommunityPost", back_populates="likes")
    
    # Unique constraint
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )

class ReplyLike(Base):
    __tablename__ = "reply_likes"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    reply_id = Column(GUID(), ForeignKey("community_replies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reply = relationship("CommunityReply", back_populates="likes")
    
    # Unique constraint
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )

class BetaWaitlist(Base):
    __tablename__ = "beta_waitlist"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notified = Column(Boolean, default=False)
    notified_at = Column(DateTime(timezone=True), nullable=True)

class AppSettings(Base):
    __tablename__ = "app_settings"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
