# backend/routes/auth.py
"""
Authentication routes – minimal backend endpoints.
Signup/login/OAuth is handled by Supabase JS on the frontend.
The backend only validates JWTs and returns local user info.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas, get_db
from ..auth_utils import get_current_user
import os

router = APIRouter(tags=["Authentication"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.get("/health")
def auth_health_check():
    """Health check for authentication service."""
    supabase_configured = bool(os.getenv("SUPABASE_JWT_SECRET"))
    return {
        "status": "healthy",
        "service": "authentication",
        "provider": "supabase",
        "jwt_validation": "✅ Configured" if supabase_configured else "❌ SUPABASE_JWT_SECRET missing",
    }