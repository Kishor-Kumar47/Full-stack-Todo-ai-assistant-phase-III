from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: Optional[str] = Field(default=None, unique=True, index=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = Field(default=True)

class UserCreate(UserBase):
    password: str

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)