from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from auth.models import UserCreate, UserLogin, Token
from auth.crud import create_user, authenticate_user, get_user_by_email
from utils.jwt_utils import create_access_token
from models.user import User
from typing import Dict

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    db_user = create_user(db, user)

    return {
        "message": "User registered successfully",
        "user_id": db_user.id
    }

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return access token
    """
    user = authenticate_user(
        db,
        user_credentials.email,
        user_credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token that expires in 30 minutes
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }