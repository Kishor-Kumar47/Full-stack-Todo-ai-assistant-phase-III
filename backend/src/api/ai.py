from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID, uuid4
import json
from ..database import engine
from ..middleware.auth_middleware import AuthMiddleware
from ..middleware.rate_limiter import RateLimiter
from ..services.ai_service import AIService
from ..services.task_service import TaskService
from ..models.ai_interaction import AIInteraction
from ..models.task import TaskCreate

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

# Initialize rate limiter (10 requests per minute)
rate_limiter = RateLimiter(requests_per_minute=10)

# Initialize AI service
try:
    ai_service = AIService()
except ValueError as e:
    print(f"Warning: AI service initialization failed: {e}")
    ai_service = None


def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session


class AIQueryRequest(BaseModel):
    """Request model for AI query."""
    query: str = Field(..., min_length=1, max_length=1000)


class AIQueryResponse(BaseModel):
    """Response model for AI query."""
    interaction_id: str
    query: str
    response: str
    timestamp: str
    suggestions: List[dict] = []


class AIHistoryItem(BaseModel):
    """History item model."""
    id: str
    query: str
    response: str
    timestamp: str
    status: str


class AIHistoryResponse(BaseModel):
    """Response model for AI history."""
    interactions: List[AIHistoryItem]
    total: int


class ConfirmBreakdownRequest(BaseModel):
    """Request model for confirming task breakdown."""
    interaction_id: str = Field(..., description="ID of the AI interaction with suggestions")


class ConfirmBreakdownResponse(BaseModel):
    """Response model for confirm breakdown."""
    created_tasks: int
    task_ids: List[str]
    message: str


@router.post("/query", response_model=AIQueryResponse)
async def query_ai(
    request: Request,
    query_request: AIQueryRequest,
    session: Session = Depends(get_session)
):
    """
    Submit a query to the AI assistant.

    Requires authentication. Rate limited to 10 requests per minute per user.
    """
    # Check if AI service is available
    if ai_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI assistant temporarily unavailable. Please check AI_API_KEY configuration."
        )

    # Extract user_id from JWT token
    user_id = await AuthMiddleware.get_user_id_from_token(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Check rate limit
    await rate_limiter.check_rate_limit(user_id)

    # Create interaction record
    interaction = AIInteraction(
        user_id=user_id,
        query_text=query_request.query,
        status="pending"
    )
    session.add(interaction)
    session.commit()
    session.refresh(interaction)

    try:
        # Build task context
        task_context = ai_service.build_task_context(session, user_id)

        # Query AI
        ai_result = await ai_service.query(query_request.query, task_context)

        # Update interaction with response
        interaction.response_text = ai_result["response"]
        interaction.token_count = ai_result["token_count"]
        interaction.status = "completed"
        interaction.response_timestamp = datetime.utcnow()

        # Store suggestions if present
        suggestions = ai_result.get("suggestions", [])
        if suggestions:
            import json
            interaction.suggestions_json = json.dumps(suggestions)

        session.add(interaction)
        session.commit()
        session.refresh(interaction)

        # Return response
        return AIQueryResponse(
            interaction_id=str(interaction.id),
            query=interaction.query_text,
            response=interaction.response_text,
            timestamp=interaction.response_timestamp.isoformat(),
            suggestions=suggestions
        )

    except ValueError as e:
        # Validation error
        interaction.status = "failed"
        interaction.error_message = str(e)
        session.add(interaction)
        session.commit()
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # AI service error
        interaction.status = "failed"
        interaction.error_message = str(e)
        session.add(interaction)
        session.commit()

        # Check if it's a timeout
        if "timeout" in str(e).lower():
            interaction.status = "timeout"
            session.add(interaction)
            session.commit()
            raise HTTPException(
                status_code=504,
                detail="AI request timed out. Please try again."
            )

        raise HTTPException(
            status_code=503,
            detail="AI assistant temporarily unavailable"
        )


@router.get("/history", response_model=AIHistoryResponse)
async def get_ai_history(
    request: Request,
    limit: int = 10,
    offset: int = 0,
    session: Session = Depends(get_session)
):
    """
    Retrieve user's AI interaction history.

    Requires authentication. Returns paginated list of past interactions.
    """
    # Extract user_id from JWT token
    user_id = await AuthMiddleware.get_user_id_from_token(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Validate pagination parameters
    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 50")
    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset must be non-negative")

    # Query interactions for user
    statement = (
        select(AIInteraction)
        .where(AIInteraction.user_id == user_id)
        .order_by(AIInteraction.query_timestamp.desc())
        .offset(offset)
        .limit(limit)
    )
    interactions = session.exec(statement).all()

    # Count total interactions
    count_statement = (
        select(AIInteraction)
        .where(AIInteraction.user_id == user_id)
    )
    total = len(session.exec(count_statement).all())

    # Format response
    history_items = [
        AIHistoryItem(
            id=str(interaction.id),
            query=interaction.query_text,
            response=interaction.response_text or "",
            timestamp=interaction.query_timestamp.isoformat(),
            status=interaction.status.value
        )
        for interaction in interactions
    ]

    return AIHistoryResponse(
        interactions=history_items,
        total=total
    )


@router.post("/confirm-breakdown", response_model=ConfirmBreakdownResponse)
async def confirm_task_breakdown(
    request: Request,
    breakdown_request: ConfirmBreakdownRequest,
    session: Session = Depends(get_session)
):
    """
    Create tasks from AI suggestions after user confirmation.

    Requires authentication. Validates interaction_id belongs to user.
    Maximum 10 tasks can be created from a single breakdown.
    """
    # Extract user_id from JWT token
    user_id = await AuthMiddleware.get_user_id_from_token(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Retrieve the interaction
    try:
        interaction_uuid = UUID(breakdown_request.interaction_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid interaction ID format")

    statement = select(AIInteraction).where(
        AIInteraction.id == interaction_uuid,
        AIInteraction.user_id == user_id
    )
    interaction = session.exec(statement).first()

    if not interaction:
        raise HTTPException(
            status_code=404,
            detail="Interaction not found or does not belong to user"
        )

    # Check if interaction has suggestions
    if not interaction.suggestions_json:
        raise HTTPException(
            status_code=400,
            detail="No task breakdown suggestions found for this interaction"
        )

    # Parse suggestions
    try:
        suggestions = json.loads(interaction.suggestions_json)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse task suggestions"
        )

    # Filter for task_breakdown type suggestions
    task_suggestions = [
        s for s in suggestions
        if s.get("type") == "task_breakdown"
    ]

    if not task_suggestions:
        raise HTTPException(
            status_code=400,
            detail="No task breakdown suggestions found"
        )

    # Validate max 10 tasks
    if len(task_suggestions) > 10:
        raise HTTPException(
            status_code=400,
            detail="Cannot create more than 10 tasks at once"
        )

    # Create tasks via TaskService
    created_task_ids = []
    for suggestion in task_suggestions:
        try:
            task_data = TaskCreate(
                title=suggestion.get("title", "Untitled Task"),
                description=suggestion.get("description", ""),
                priority="medium",  # Default priority
                is_completed=False
            )

            # Create task using TaskService
            new_task = TaskService.create_task(session, user_id, task_data)
            created_task_ids.append(str(new_task.id))

        except Exception as e:
            # Log error but continue creating other tasks
            print(f"Failed to create task from suggestion: {str(e)}")
            continue

    if not created_task_ids:
        raise HTTPException(
            status_code=500,
            detail="Failed to create any tasks from suggestions"
        )

    return ConfirmBreakdownResponse(
        created_tasks=len(created_task_ids),
        task_ids=created_task_ids,
        message=f"Successfully created {len(created_task_ids)} tasks from AI suggestions"
    )
