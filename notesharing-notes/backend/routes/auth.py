from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
import uuid

from models.user import RegisterRequest, LoginRequest, UserResponse
from services.dynamodb_service import create_user, get_user_by_email, get_user_by_id
from utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    existing = get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc).isoformat()
    user = {
        "user_id": str(uuid.uuid4()),
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": body.role.value,
        "created_at": now,
        "updated_at": now,
    }
    create_user(user)

    token = create_access_token({"sub": user["user_id"], "email": user["email"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {k: v for k, v in user.items() if k != "password_hash"},
    }


@router.post("/login")
async def login(body: LoginRequest):
    user = get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["user_id"], "email": user["email"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {k: v for k, v in user.items() if k != "password_hash"},
    }


@router.get("/me")
async def me(current_user: dict = None):
    from fastapi import Depends
    from utils.auth import get_current_user
    return current_user
