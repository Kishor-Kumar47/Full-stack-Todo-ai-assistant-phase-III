from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum


class InteractionStatus(str, Enum):
    """Status of an AI interaction"""
    pending = "pending"
    completed = "completed"
    failed = "failed"
    timeout = "timeout"


class AIInteractionBase(SQLModel):
    """Base model for AI interactions"""
    user_id: int = Field(foreign_key="user.id", index=True)
    query_text: str = Field(max_length=1000)
    response_text: Optional[str] = Field(default=None, max_length=10000)
    status: str = Field(default="pending")  # Use string instead of enum
    error_message: Optional[str] = None
    token_count: Optional[int] = Field(default=None, ge=0)
    suggestions_json: Optional[str] = None  # JSON string for task breakdown suggestions


class AIInteraction(AIInteractionBase, table=True):
    """AI interaction model for storing user queries and AI responses"""
    __tablename__ = "ai_interaction"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    query_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    response_timestamp: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "query_text": "What are my high priority tasks?",
                "response_text": "You have 3 high priority tasks...",
                "status": "completed",
                "token_count": 250
            }
        }
