# Research: AI Task Assistant

**Feature**: AI Task Assistant
**Date**: 2026-02-10
**Phase**: Phase 0 - Research & Discovery

## R1: AI Provider Selection

**Decision**: Anthropic Claude (claude-3-sonnet-20240229)

**Rationale**:
- **Context Window**: Claude 3 Sonnet supports 200K tokens, sufficient for user task data (< 1000 tasks)
- **Response Quality**: Excellent at understanding natural language queries and providing explanations
- **Cost**: $3 per million input tokens, $15 per million output tokens (competitive pricing)
- **API Reliability**: Anthropic API has strong uptime SLA and rate limits suitable for our use case
- **SDK Maturity**: Official Python SDK (`anthropic`) is well-maintained and documented
- **Alignment with Constitution**: Claude's design emphasizes helpful, harmless, honest responses - aligns with "no hallucination" requirement

**Alternatives Considered**:
- **OpenAI GPT-4**: Similar capabilities but higher cost ($10/$30 per million tokens), shorter context window (128K)
- **OpenAI GPT-3.5-turbo**: Lower cost but reduced reasoning quality for complex task analysis
- **Local LLMs**: Would eliminate API costs but require infrastructure and have lower quality

**SDK**: `anthropic` (Python package)

**Estimated Cost**:
- Average query: ~500 input tokens (task context) + ~200 output tokens (response)
- Cost per query: ~$0.004
- 1000 queries: ~$4
- Acceptable for hackathon/MVP scope

**Implementation Notes**:
- Use `anthropic.Anthropic(api_key=...)` client
- Model: `claude-3-sonnet-20240229`
- Max tokens: 1000 (configurable via env var)
- Temperature: 0.7 (balance between creativity and consistency)

## R2: Phase II Task Repository Interface

**Interface**: `TaskService` class in `backend/src/services/task_service.py`

**Key Methods**:
```python
@staticmethod
def get_tasks_by_user(session: Session, user_id: int) -> List[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    return session.exec(statement).all()

@staticmethod
def get_task_by_id(session: Session, task_id: int, user_id: int) -> Optional[Task]:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    return session.exec(statement).first()
```

**Usage Pattern**:
```python
# In AI service, fetch user's tasks
tasks = TaskService.get_tasks_by_user(session, user_id)
```

**Task Model Structure** (from `backend/src/models/task.py`):
```python
class Task(TaskBase, table=True):
    id: Optional[int]
    title: str (max 200 chars)
    description: Optional[str]
    is_completed: bool
    due_date: Optional[datetime]
    priority: str (low|medium|high)
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
```

**Integration Strategy**:
- AI service will call `TaskService.get_tasks_by_user()` to fetch task context
- No modifications to TaskService needed
- AI service receives Task objects, extracts relevant fields for context
- Maintains Phase II foundation principle (no changes to existing code)

## R3: Phase II Authentication Flow

**Middleware**: `AuthMiddleware` class in `backend/src/middleware/auth_middleware.py`

**Token Validation**:
```python
@staticmethod
async def get_user_id_from_token(request: Request) -> Optional[int]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    algorithm = os.getenv("ALGORITHM", "HS256")

    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
    user_id = payload.get("sub")
    return int(user_id) if user_id else None
```

**User Extraction Pattern**:
- JWT token in `Authorization: Bearer <token>` header
- Token contains `sub` claim with user ID
- Token expiration checked automatically
- Returns `None` if invalid/expired

**AI Endpoint Integration**:
```python
# In AI endpoint
@router.post("/api/ai/query")
async def query_ai(request: Request, ...):
    user_id = await AuthMiddleware.get_user_id_from_token(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    # Proceed with AI query using user_id
```

**Consistency**: AI endpoints will use identical auth pattern as Phase II endpoints

## R4: Error Handling Patterns

**Format**: Phase II uses FastAPI's `HTTPException` with standard structure

**Examples from Phase II**:
```python
# 404 Not Found
raise HTTPException(status_code=404, detail="Task not found")

# 401 Unauthorized
raise HTTPException(status_code=401, detail="Invalid email or password")

# 403 Forbidden
raise HTTPException(status_code=403, detail="Access denied: insufficient permissions")

# 400 Bad Request
raise HTTPException(status_code=400, detail="User with this email already exists")
```

**Status Codes Used**:
- 200: Success
- 201: Created (for POST endpoints that create resources)
- 400: Bad Request (validation errors, invalid input)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (valid token but insufficient permissions)
- 404: Not Found (resource doesn't exist)

**AI Endpoint Error Responses**:
```python
# AI service unavailable
raise HTTPException(status_code=503, detail="AI assistant temporarily unavailable")

# AI request timeout
raise HTTPException(status_code=504, detail="AI request timed out. Please try again.")

# Rate limit exceeded
raise HTTPException(status_code=429, detail="Too many requests. Please wait before trying again.")

# Invalid query
raise HTTPException(status_code=400, detail="Query is too long or contains invalid content")
```

**Consistency**: AI endpoints will follow identical error response format

## R5: Frontend State Management

**Approach**: React hooks with local component state (no global state library)

**Evidence**:
- `package.json` shows no Redux, Zustand, or other state management libraries
- Only dependencies: `react`, `react-dom`, `next`, `axios`
- Phase II uses standard React hooks (`useState`, `useEffect`)

**Pattern**:
- Components manage their own state
- API calls via `axios` in service files
- Data fetched on component mount or user action

**AI State Integration**:
```typescript
// In AIChat component
const [query, setQuery] = useState('');
const [response, setResponse] = useState<AIResponse | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await aiService.query(query);
    setResponse(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**No Changes Needed**: AI feature will follow existing pattern with local component state

## R6: Rate Limiting Strategy

**Existing**: Phase II has NO rate limiting implemented

**AI Endpoints Requirement**: Rate limiting is CRITICAL for AI endpoints due to:
- API cost per query (~$0.004)
- Potential for abuse
- External API rate limits

**Proposed Implementation**: Custom middleware using in-memory store

**Approach**:
```python
# backend/src/middleware/rate_limiter.py
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import HTTPException, Request

class RateLimiter:
    def __init__(self, requests_per_minute: int = 10):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    async def check_rate_limit(self, request: Request, user_id: int):
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)

        # Clean old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > minute_ago
        ]

        # Check limit
        if len(self.requests[user_id]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute."
            )

        # Record request
        self.requests[user_id].append(now)

# Usage in AI endpoint
rate_limiter = RateLimiter(requests_per_minute=10)

@router.post("/api/ai/query")
async def query_ai(request: Request, ...):
    user_id = await AuthMiddleware.get_user_id_from_token(request)
    await rate_limiter.check_rate_limit(request, user_id)
    # Proceed with AI query
```

**Configuration**:
- Default: 10 requests per minute per user
- Configurable via `AI_RATE_LIMIT_PER_MINUTE` env var
- In-memory storage sufficient for MVP (no Redis needed)

**Future Enhancement**: For production, consider Redis-based rate limiting for multi-instance deployments

## Summary of Key Decisions

1. **AI Provider**: Anthropic Claude 3 Sonnet - best balance of cost, quality, and context window
2. **Phase II Integration**: Use existing `TaskService.get_tasks_by_user()` - no modifications needed
3. **Authentication**: Use existing `AuthMiddleware.get_user_id_from_token()` - consistent with Phase II
4. **Error Handling**: Follow Phase II `HTTPException` pattern with appropriate status codes
5. **Frontend State**: Use React hooks with local state - consistent with Phase II approach
6. **Rate Limiting**: Implement custom middleware with in-memory store - new requirement for AI endpoints

## Risks Identified

1. **API Cost**: Mitigated by rate limiting and token usage monitoring
2. **Response Latency**: Mitigated by 30-second timeout and loading indicators
3. **Context Window Limits**: Mitigated by limiting to < 1000 tasks per user
4. **Phase II Compatibility**: Mitigated by zero modifications to existing code

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create `data-model.md` with AI interaction entities
- Generate API contracts in `contracts/` directory
- Write `quickstart.md` for developer onboarding
