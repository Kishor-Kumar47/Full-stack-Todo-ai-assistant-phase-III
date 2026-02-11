from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)
    due_date: Optional[datetime] = None
    priority: str = Field(default="medium", regex="^(low|medium|high)$")
    user_id: Optional[int] = None  # Make user_id optional for demo

class TaskCreate(SQLModel):
    """Schema for creating a new task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)
    due_date: Optional[datetime] = None
    priority: str = Field(default="medium", regex="^(low|medium|high)$")

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None