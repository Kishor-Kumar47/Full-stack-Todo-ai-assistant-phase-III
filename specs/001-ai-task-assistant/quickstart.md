# AI Task Assistant - Developer Quickstart

**Feature**: AI Task Assistant
**Date**: 2026-02-10
**Branch**: `001-ai-task-assistant`

## Overview

This guide helps developers set up and test the AI Task Assistant feature. The feature adds AI-powered task analysis to the Phase II Todo application while maintaining full backward compatibility.

## Prerequisites

- Phase II Todo application running successfully
- Python 3.11+ with virtual environment
- Node.js 18+ for frontend
- PostgreSQL database (Neon Serverless or local)
- Anthropic API key (get from https://console.anthropic.com/)

## Backend Setup

### 1. Install AI SDK Dependency

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install anthropic==0.18.0
pip freeze > requirements.txt
```

### 2. Configure Environment Variables

Add the following to `backend/.env`:

```bash
# Existing Phase II variables (keep these)
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# NEW: AI Configuration
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-api03-...  # Your Anthropic API key
AI_MODEL=claude-3-sonnet-20240229
AI_MAX_TOKENS=1000
AI_TIMEOUT_SECONDS=30
AI_RATE_LIMIT_PER_MINUTE=10
```

**Important**: Never commit `.env` file to version control. Add to `.gitignore` if not already present.

### 3. Run Database Migration

```bash
# Generate migration for ai_interaction table
alembic revision --autogenerate -m "Add AI interaction table"

# Review the generated migration file in alembic/versions/
# Ensure it creates the ai_interaction table with correct schema

# Apply migration
alembic upgrade head
```

**Verify Migration**:
```bash
# Connect to database and check table exists
psql $DATABASE_URL -c "\d ai_interaction"
```

### 4. Start Backend Server

```bash
# From backend directory
uvicorn src.main:app --reload --port 8000
```

**Verify Backend**:
- Open http://localhost:8000/docs
- You should see new AI endpoints: `/api/ai/query`, `/api/ai/history`, `/api/ai/confirm-breakdown`

## Frontend Setup

### 1. No Additional Dependencies Required

The frontend uses existing dependencies (React, Next.js, axios). No new packages needed.

### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

**Verify Frontend**:
- Open http://localhost:3000
- Existing Phase II functionality should work unchanged

## Testing AI Integration

### 1. Authenticate as a User

```bash
# Option A: Use existing user
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=demo@example.com&password=demo123"

# Option B: Create new user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User",
    "password": "password123"
  }'
```

**Save the access_token** from the response for subsequent requests.

### 2. Create Sample Tasks

```bash
# Set your token
TOKEN="your_access_token_here"

# Create high priority task
curl -X POST http://localhost:8000/api/1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project proposal",
    "description": "Draft and finalize Q1 project proposal",
    "priority": "high",
    "due_date": "2026-02-15T17:00:00Z"
  }'

# Create medium priority task
curl -X POST http://localhost:8000/api/1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review code changes",
    "description": "Review pull requests from team",
    "priority": "medium"
  }'

# Create low priority task
curl -X POST http://localhost:8000/api/1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Update documentation",
    "priority": "low"
  }'
```

### 3. Test AI Query Endpoint

```bash
# Ask about high priority tasks
curl -X POST http://localhost:8000/api/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are my high priority tasks?"
  }'

# Expected response:
# {
#   "interaction_id": "550e8400-e29b-41d4-a716-446655440000",
#   "query": "What are my high priority tasks?",
#   "response": "You have 1 high priority task: Complete project proposal...",
#   "timestamp": "2026-02-10T20:30:00Z",
#   "suggestions": []
# }
```

### 4. Test Task Breakdown Suggestion

```bash
# Ask AI to break down a complex task
curl -X POST http://localhost:8000/api/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How should I break down the project proposal task?"
  }'

# Expected response includes suggestions array with task breakdown
```

### 5. Test AI History

```bash
# Retrieve past interactions
curl -X GET "http://localhost:8000/api/ai/history?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "interactions": [
#     {
#       "id": "550e8400-e29b-41d4-a716-446655440000",
#       "query": "What are my high priority tasks?",
#       "response": "You have 1 high priority task...",
#       "timestamp": "2026-02-10T20:30:00Z",
#       "status": "completed"
#     }
#   ],
#   "total": 1
# }
```

## Testing Fallback Behavior

### 1. Test AI Service Unavailable

```bash
# Stop AI service by setting invalid API key
# Edit .env: AI_API_KEY=invalid_key
# Restart backend

# Try AI query
curl -X POST http://localhost:8000/api/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my tasks?"}'

# Expected: 503 Service Unavailable
# {
#   "detail": "AI assistant temporarily unavailable"
# }
```

### 2. Verify Core App Still Works

```bash
# Verify task CRUD operations work without AI
curl -X GET http://localhost:8000/api/1/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected: Tasks returned successfully (Phase II functionality unaffected)
```

### 3. Test Rate Limiting

```bash
# Send 11 requests rapidly (limit is 10/minute)
for i in {1..11}; do
  curl -X POST http://localhost:8000/api/ai/query \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "Test query '$i'"}' &
done
wait

# Expected: 11th request returns 429 Too Many Requests
```

## Frontend Testing (Manual)

### 1. Navigate to AI Assistant Page

- Open http://localhost:3000
- Log in with your credentials
- Navigate to `/ai-assistant` (once implemented)

### 2. Test AI Chat Interface

- Type: "What are my high priority tasks?"
- Verify: AI response appears with actual task data
- Verify: Loading indicator shows during request
- Verify: Error message appears if AI unavailable

### 3. Test Task Breakdown Flow

- Type: "How should I break down [task name]?"
- Verify: AI suggests 3-5 subtasks
- Verify: "Create these tasks" button appears
- Click button and confirm
- Verify: New tasks appear in task list

## Monitoring & Debugging

### 1. Check AI Interaction Logs

```sql
-- Connect to database
psql $DATABASE_URL

-- View recent AI interactions
SELECT
  id,
  user_id,
  query_text,
  status,
  token_count,
  query_timestamp
FROM ai_interaction
ORDER BY query_timestamp DESC
LIMIT 10;

-- Check for failed interactions
SELECT * FROM ai_interaction WHERE status = 'failed';
```

### 2. Monitor Token Usage

```sql
-- Total tokens used per user
SELECT
  user_id,
  SUM(token_count) as total_tokens,
  COUNT(*) as query_count
FROM ai_interaction
WHERE status = 'completed'
GROUP BY user_id;

-- Estimated cost (Anthropic pricing: $3/M input, $15/M output)
SELECT
  SUM(token_count) / 1000000.0 * 9 as estimated_cost_usd
FROM ai_interaction
WHERE status = 'completed';
```

### 3. Backend Logs

```bash
# Watch backend logs for AI service activity
tail -f backend/logs/app.log | grep "AI"

# Look for:
# - "AI query received: [query]"
# - "AI response generated: [interaction_id]"
# - "AI service error: [error]"
```

## Troubleshooting

### Issue: "AI assistant temporarily unavailable"

**Causes**:
- Invalid or missing `AI_API_KEY`
- Anthropic API rate limit exceeded
- Network connectivity issues

**Solutions**:
1. Verify API key in `.env` is correct
2. Check Anthropic API status: https://status.anthropic.com/
3. Test API key directly:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $AI_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-sonnet-20240229","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
   ```

### Issue: "Rate limit exceeded"

**Cause**: User exceeded 10 queries per minute

**Solution**: Wait 1 minute before retrying, or increase `AI_RATE_LIMIT_PER_MINUTE` in `.env`

### Issue: AI responses are slow

**Causes**:
- Large number of tasks (> 500)
- Network latency to Anthropic API

**Solutions**:
1. Reduce `AI_MAX_TOKENS` in `.env` (default 1000)
2. Implement task context filtering (only send recent/relevant tasks)
3. Add caching for common queries

### Issue: Database migration fails

**Cause**: Existing table conflicts or schema issues

**Solution**:
```bash
# Rollback migration
alembic downgrade -1

# Fix migration file
# Re-run migration
alembic upgrade head
```

## Next Steps

1. **Implement Frontend Components**: Create `AIChat.tsx`, `AIResponse.tsx`, `TaskBreakdown.tsx`
2. **Add Integration Tests**: Test AI service with mocked Anthropic API
3. **Deploy to Staging**: Test with real users and monitor costs
4. **Optimize Prompts**: Refine AI prompts based on user feedback
5. **Add Analytics**: Track query patterns and response quality

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Phase II Architecture](../../README.md)
- [API Contracts](./contracts/ai-api.openapi.yaml)
- [Data Model](./data-model.md)
- [Implementation Plan](./plan.md)
