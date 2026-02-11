from sqlalchemy.orm import Session
from models.user import User
from utils.jwt_utils import get_password_hash, verify_password
from auth.models import UserCreate

def get_user_by_email(db: Session, email: str):
    """
    Retrieve a user by email
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str):
    """
    Retrieve a user by ID
    """
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    """
    Create a new user
    """
    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create the user object
    db_user = User(
        email=user.email,
        hashed_password=hashed_password
    )

    # Add to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate a user by email and password
    """
    user = get_user_by_email(db, email)

    if not user or not verify_password(password, user.hashed_password):
        return None

    return user