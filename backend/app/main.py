from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routers import auth, users, community, public, admin, stripe
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
app.include_router(stripe.router)

# Mount static files for downloads (served at /downloads/...)
# This allows direct access to APK files uploaded via Admin Panel
try:
    backend_dir = Path(__file__).parent.parent
    public_dir = backend_dir / "public"
    if public_dir.exists():
        app.mount("/downloads", StaticFiles(directory=str(public_dir / "downloads")), name="downloads")
        print(f"✅ Static files mounted: /downloads -> {public_dir / 'downloads'}")
    else:
        print(f"⚠️ Warning: Public directory not found at {public_dir}")
except Exception as e:
    print(f"⚠️ Warning: Could not mount static files: {e}")

@app.get("/")
async def root():
    return {"message": "ANDROAMA API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

