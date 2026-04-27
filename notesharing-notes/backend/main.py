from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.config import settings
from utils.auth import get_current_user
from routes import auth, notes, ai

app = FastAPI(
    title="NoteSharing API",
    description="Cloud-Based Student Notes Sharing System with AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5662", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return {
        "message": "NoteSharing API v1.0",
        "docs": "/docs",
        "status": "running",
        "features": ["auth", "upload", "search", "ai-summarize", "ai-quiz", "ai-qa"],
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "region": settings.aws_region, "bucket": settings.aws_s3_bucket}

@app.get("/profile")
async def profile(current_user: dict = Depends(get_current_user)):
    return current_user
