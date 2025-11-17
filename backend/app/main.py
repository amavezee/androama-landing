from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, community, public, admin
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="ANDROAMA API",
    description="Backend API for ANDROAMA platform",
    version="1.0.0"
)

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(community.router)
app.include_router(public.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "ANDROAMA API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

