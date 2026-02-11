# Data Model: AI Task Assistant

**Feature**: AI Task Assistant
**Date**: 2026-02-10
**Phase**: Phase 1 - Design

## Overview

This document defines the data entities required for the AI Task Assistant feature. The design follows Phase III constitutional principles: AI service isolation, no modifications to Phase II models, and clear separation between stored and computed data.

## New Database Entities

### AIInteraction

**Purpose**: Store user queries and AI responses for history, debugging, and cost tracking.

**Table Name**: `ai_interaction`

**Schema**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the interaction |
| user_id | INTEGER | FOREIGN KEY (users.id), NOT NULL | User who made the query |
| query_text | TEXT | NOT NULL, CHECK(length <= 1000) | User's question to AI |
| response_text | TEXT | CHECK(length <= 10000) | AI's response |
| query_timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | When query was submitted |
| response_timestamp | TIMESTAMP | NULL | When response was received |
| status | VARCHAR(20) | NOT NULL, CHECK(IN ('pending', 'completed', 'failed', 'timeout')) | Interaction status |
| error_message | TEXT | NULL | Error details if status is 'failed' |
| token_count | INTEGER | NULL | Total tokens used (for cost tracking) |
| suggestions_json | JSONB | NULL | Structured suggestions (e.g., task breakdowns) |

**Indexes**:
- `idx_ai_interaction_user_id` on `user_id` (for fetching user history)
- `idx_ai_interaction_timestamp` on `query_timestamp` (for chronological queries)

**Relationships**:
- `user_id` → `users.id` (many-to-one)
- Each user can have multiple AI interactions
- Cascade delete: When user is deleted, their AI interactions are deleted

**Validation Rules**:
- `query_text`: Required, max 1000 characters, sanitized before storage
- `response_text`: Max 10000 characters
- `status`: Must be one of: pending, completed, failed, timeout
- `token_count`: Non-negative integer
- `user_id`: Must match authenticated user making the request

**State Transitions**:
```
pending → completed (successful AI response)
pending → failed (AI service error)
pending → timeout (request exceeded 30 seconds)
```

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class InteractionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"

class AIInteractionBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    query_text: str = Field(max_length=1000)
    response_text: Optional[str] = Field(default=None, max_length=10000)
    status: InteractionStatus = Field(default=InteractionStatus.PENDING)
    error_message: Optional[str] = None
    token_count: Optional[int] = Field(default=None, ge=0)
    suggestions_json: Optional[str] = None  # JSON string

class AIInteraction(AIInteractionBase, table=True):
    __tablename__ = "ai_interaction"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    query_timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_timestamp: Optional[datetime] = None
```

## Computed Entities (Not Stored)

### TaskContext

**Purpose**: Aggregated view of user's tasks sent to AI for context. Generated on-demand, never persisted.

**Structure**:
```python
from typing import List
from pydantic import BaseModel

class TaskContextItem(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str  # low, medium, high
    is_completed: bool
    due_date: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]

class TaskContext(BaseModel):
    user_id: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    high_priority_count: int
    overdue_count: int
    tasks: List[TaskContextItem]
```

**Generation Logic**:
```python
def build_task_context(session: Session, user_id: int) -> TaskContext:
    tasks = TaskService.get_tasks_by_user(session, user_id)

    now = datetime.utcnow()
    completed = [t for t in tasks if t.is_completed]
    pending = [t for t in tasks if not t.is_completed]
    high_priority = [t for t in tasks if t.priority == "high"]
    overdue = [t for t in pending if t.due_date and t.due_date < now]

    return TaskContext(
        user_id=user_id,
        total_tasks=len(tasks),
        completed_tasks=len(completed),
        pending_tasks=len(pending),
        high_priority_count=len(high_priority),
        overdue_count=len(overdue),
        tasks=[TaskContextItem(**t.dict()) for t in tasks]
    )
```

**Usage**: Generated in AI service before each query, converted to text for AI prompt, discarded after response.

**Rationale**: Not stored to avoid data duplication and maintain Phase II Task model as single source of truth.

## Existing Entities (No Changes)

### Task (Phase II)

**Location**: `backend/src/models/task.py`

**Status**: ✅ NO MODIFICATIONS REQUIRED

**Usage by AI Feature**: Read-only access via `TaskService.get_tasks_by_user()`

### User (Phase II)

**Location**: `backend/src/models/user.py`

**Status**: ✅ NO MODIFICATIONS REQUIRED

**Usage by AI Feature**: Foreign key reference in `AIInteraction.user_id`

## Database Migration

**Migration File**: `backend/alembic/versions/XXXX_add_ai_interaction_table.py`

**Operations**:
1. Create `ai_interaction` table with all columns
2. Add foreign key constraint to `users.id`
3. Create indexes on `user_id` and `query_timestamp`
4. Add check constraints for `status` enum and text lengths

**Rollback**: Drop `ai_interaction` table and indexes

**Data Migration**: None required (new feature, no existing data)

## Data Retention Policy

**AIInteraction Records**:
- Retain for 90 days for debugging and analytics
- Implement cleanup job to delete records older than 90 days
- User can request deletion of their AI history (GDPR compliance)

**TaskContext**:
- Never stored, generated on-demand
- No retention policy needed

## Privacy & Security Considerations

1. **User Isolation**: `user_id` foreign key ensures queries are tied to authenticated users
2. **Data Access**: AI service validates `user_id` matches authenticated user before fetching tasks
3. **Sensitive Data**: Task descriptions may contain sensitive information - ensure proper access controls
4. **Audit Trail**: All AI interactions logged with timestamps for security auditing
5. **Token Tracking**: `token_count` enables cost monitoring and abuse detection

## Performance Considerations

1. **Query Performance**: Indexes on `user_id` and `query_timestamp` ensure fast history retrieval
2. **Task Context Size**: Limit to < 1000 tasks per user to stay within AI context window
3. **JSONB Storage**: `suggestions_json` uses JSONB for efficient querying if needed later
4. **Cascade Deletes**: Properly indexed to avoid performance issues on user deletion

## Future Enhancements (Out of Scope for MVP)

1. **Conversation History**: Add `conversation_id` to link related queries
2. **Feedback**: Add `user_rating` column for response quality tracking
3. **Caching**: Cache common queries to reduce AI API calls
4. **Analytics**: Aggregate tables for usage patterns and popular queries
