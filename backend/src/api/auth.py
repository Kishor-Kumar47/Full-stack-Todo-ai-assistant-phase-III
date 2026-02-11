from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from jose import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from ..database import engine
from ..models.user import User, UserCreate
from ..middleware.auth_middleware import AuthMiddleware

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire.timestamp()})
    secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    algorithm = os.getenv("ALGORITHM", "HS256")
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

@router.post("/auth/register")
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user"""
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password_hash=hashed_password,
        is_active=True
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Generate access token
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name
        }
    }

@router.post("/auth/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
):
    """Login user and return access token"""
    # Find user by email
    user = session.exec(select(User).where(User.email == email)).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }

@router.post("/auth/demo-login")
async def demo_login(session: Session = Depends(get_session)):
    """Create a demo user or login if exists - for demo purposes"""
    demo_email = "demo@example.com"
    demo_password = "demo123"

    # Try to find existing demo user
    user = session.exec(select(User).where(User.email == demo_email)).first()

    if not user:
        # Create demo user
        hashed_password = get_password_hash(demo_password)
        user = User(
            email=demo_email,
            username="demo",
            first_name="Demo",
            last_name="User",
            password_hash=hashed_password,
            is_active=True
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }

@router.get("/auth/me")
async def get_current_user(request):
    return {"message": "Current user info"}