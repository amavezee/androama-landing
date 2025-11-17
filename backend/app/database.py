from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, NullPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://androama_user:androama_pass@localhost:5432/androama_db")

# Use NullPool for SQLite (no connection pooling needed), QueuePool for PostgreSQL
is_sqlite = DATABASE_URL.startswith("sqlite")
pool_class = NullPool if is_sqlite else QueuePool
pool_args = {} if is_sqlite else {
    "pool_size": 20,
    "max_overflow": 40,
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

# Production-ready connection pooling for high traffic (PostgreSQL) or simple connection (SQLite)
engine = create_engine(
    DATABASE_URL,
    poolclass=pool_class,
    connect_args={"check_same_thread": False} if is_sqlite else {},  # SQLite needs this
    **pool_args,
    echo=False  # Set to True for SQL debugging
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

