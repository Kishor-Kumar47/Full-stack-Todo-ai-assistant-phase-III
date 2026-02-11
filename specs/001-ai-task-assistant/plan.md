# Implementation Plan: AI Task Assistant

**Branch**: `001-ai-task-assistant` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-task-assistant/spec.md`

## Summary

Add AI-powered task assistance to the Phase II Todo application. Users can ask natural language questions about their tasks, get breakdown suggestions, and receive priority recommendations. AI service is isolated, read-only by default, and requires explicit confirmation for any data mutations. Core application continues to function when AI is unavailable.

**Technical Approach**: Integrate external AI API (Anthropic Claude or OpenAI) through a dedicated service layer in the backend. AI service accesses task data via existing repositories, validates all inputs/outputs, and enforces user authentication boundaries. Frontend adds a chat-like interface for AI interactions with clear confirmation flows for suggested actions.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Node.js 18+ (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic (backend); Next.js 16+, React (frontend); Anthropic SDK or OpenAI SDK (AI integration)
**Storage**: PostgreSQL (Neon Serverless) - existing Phase II database
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application (Linux/Windows server for backend, browser for frontend)
**Project Type**: web (frontend + backend)
**Performance Goals**: AI responses < 5 seconds for 95% of queries, < 30 second timeout, core app remains responsive when AI unavailable
**Constraints**: AI context window limits (< 1000 tasks per user), API rate limits, no AI logic in controllers/repositories, graceful degradation required
**Scale/Scope**: Support existing user base, AI queries logged for monitoring, stateless AI service (no conversation history in MVP)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Phase II Foundation: Phase II codebase remains the single source of truth; All existing functionality MUST continue to work; AI features are additive
- ✅ Separation of Concerns: Clear boundaries between core business logic, AI services, and data access layer
- ✅ Testability First: Code MUST remain testable and debuggable; AI components MUST be mockable
- ✅ Simplicity Over Engineering: Prefer simple solutions; Avoid over-abstraction; Implement only what Phase III requires
- ✅ AI Read-Only by Default: AI services MUST NOT modify data directly; All data mutations require user confirmation
- ✅ No Hallucinated Data: AI MUST NOT invent data; Responses based on actual data or clearly marked as suggestions
- ✅ Authentication Boundaries: AI services MUST respect user authentication; AI cannot access other users' tasks
- ✅ AI Service Isolation: AI logic in dedicated service modules; Controllers call AI services but contain no AI logic
- ✅ AI Optional: Core application MUST function when AI services unavailable; Graceful degradation required
- ✅ Secrets Management: All API keys and secrets MUST be in environment variables

**Gate Status**: ✅ PASSED - All constitutional requirements satisfied by design

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-task-assistant/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── ai-query.openapi.yaml
│   └── ai-response.schema.json
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py              # Existing Phase II model
│   │   ├── user.py              # Existing Phase II model
│   │   └── ai_interaction.py   # NEW: AI query/response models
│   ├── services/
│   │   ├── task_service.py      # Existing Phase II service
│   │   ├── auth_service.py      # Existing Phase II service
│   │   └── ai_service.py        # NEW: AI integration service
│   ├── api/
│   │   ├── tasks.py             # Existing Phase II endpoints
│   │   ├── auth.py              # Existing Phase II endpoints
│   │   └── ai.py                # NEW: AI endpoints
│   ├── middleware/
│   │   └── auth.py              # Existing Phase II auth middleware
│   ├── database.py              # Existing Phase II database config
│   └── main.py                  # Existing Phase II app entry
├── tests/
│   ├── test_ai_service.py       # NEW: AI service tests
│   └── test_ai_api.py           # NEW: AI endpoint tests
└── requirements.txt             # UPDATE: Add AI SDK dependency

frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/           # Existing Phase II pages
│   │   └── ai-assistant/        # NEW: AI chat interface page
│   ├── components/
│   │   ├── TaskList.tsx         # Existing Phase II component
│   │   ├── AIChat.tsx           # NEW: AI chat component
│   │   ├── AIResponse.tsx       # NEW: AI response display
│   │   └── TaskBreakdown.tsx    # NEW: Suggested tasks with confirmation
│   ├── services/
│   │   ├── taskService.ts       # Existing Phase II service
│   │   ├── authService.ts       # Existing Phase II service
│   │   └── aiService.ts         # NEW: AI API client
│   └── types/
│       ├── task.ts              # Existing Phase II types
│       └── ai.ts                # NEW: AI query/response types
└── package.json                 # No new dependencies needed
```

**Structure Decision**: Web application structure (Option 2) selected. Backend and frontend are separate projects with clear API boundaries. AI service is isolated in `backend/src/services/ai_service.py` and accessed only through `backend/src/api/ai.py` endpoints. Frontend AI components are isolated in dedicated directory with clear separation from core task management UI.

## Complexity Tracking

> No constitutional violations - this section is empty.

## Phase 0: Research & Discovery

### Research Tasks

**R1: AI Provider Selection**
- **Question**: Which AI provider (Anthropic Claude, OpenAI GPT, or other) best fits Phase III requirements?
- **Criteria**: API reliability, cost per query, context window size, response quality for task analysis, SDK maturity
- **Decision needed**: Provider selection impacts SDK dependency and prompt engineering approach

**R2: Phase II Task Repository Interface**
- **Question**: What is the exact interface of the existing task repository/service in Phase II?
- **Action**: Examine `backend/src/services/task_service.py` and `backend/src/models/task.py`
- **Need**: Understand how to fetch user tasks for AI context without modifying Phase II code

**R3: Phase II Authentication Flow**
- **Question**: How does Phase II validate JWT tokens and extract user identity?
- **Action**: Examine `backend/src/middleware/auth.py` and `backend/src/api/auth.py`
- **Need**: Ensure AI endpoints use identical auth validation

**R4: Error Handling Patterns**
- **Question**: What error handling patterns does Phase II use for API failures?
- **Action**: Review existing API endpoints for error response format
- **Need**: Maintain consistency in AI endpoint error responses

**R5: Frontend State Management**
- **Question**: Does Phase II use a state management library (Redux, Zustand, Context)?
- **Action**: Examine `frontend/src/app` and `frontend/src/services`
- **Need**: Determine how to integrate AI state without disrupting existing patterns

**R6: Rate Limiting Strategy**
- **Question**: Does Phase II implement rate limiting? If so, what library/approach?
- **Action**: Check middleware and API configuration
- **Need**: Apply consistent rate limiting to AI endpoints (more restrictive due to cost)

### Research Output

All research findings will be documented in `research.md` with the following structure:

```markdown
# Research: AI Task Assistant

## R1: AI Provider Selection
**Decision**: [Anthropic Claude / OpenAI GPT-4 / Other]
**Rationale**: [Cost, reliability, context window, response quality analysis]
**Alternatives Considered**: [Other providers evaluated]
**SDK**: [anthropic / openai]
**Estimated Cost**: [per 1000 queries]

## R2: Phase II Task Repository Interface
**Interface**: [Method signatures from task_service.py]
**Usage Pattern**: [How to fetch user tasks]
**Data Format**: [Task model structure]

## R3: Phase II Authentication Flow
**Middleware**: [auth.py implementation details]
**Token Validation**: [JWT validation approach]
**User Extraction**: [How to get user_id from request]

## R4: Error Handling Patterns
**Format**: [JSON error response structure]
**Status Codes**: [HTTP codes used]
**Consistency**: [How to match Phase II patterns]

## R5: Frontend State Management
**Approach**: [React hooks / Context / Library]
**Pattern**: [How Phase II manages state]
**Integration**: [How AI state fits in]

## R6: Rate Limiting Strategy
**Existing**: [Phase II rate limiting if any]
**AI Endpoints**: [Proposed rate limits for AI]
**Implementation**: [Library or custom middleware]
```

## Phase 1: Design & Contracts

### Data Model Design

**Output**: `data-model.md`

**Entities**:

1. **AIInteraction** (new database table)
   - `id`: UUID, primary key
   - `user_id`: Foreign key to User table
   - `query_text`: Text, user's question
   - `response_text`: Text, AI's answer
   - `query_timestamp`: DateTime
   - `response_timestamp`: DateTime
   - `status`: Enum (pending, completed, failed, timeout)
   - `error_message`: Text, nullable
   - `token_count`: Integer, for cost tracking

2. **TaskContext** (computed, not stored)
   - Aggregated view of user's tasks
   - Includes: task titles, descriptions, priorities, due dates, completion status
   - Generated on-demand for each AI query
   - Never persisted to avoid data duplication

**Relationships**:
- AIInteraction belongs to User (many-to-one)
- TaskContext is derived from Task table (read-only view)

**Validation Rules**:
- `query_text`: Max 1000 characters, required, sanitized
- `response_text`: Max 10000 characters
- `user_id`: Must match authenticated user
- `status`: Transitions: pending → completed/failed/timeout

### API Contracts

**Output**: `contracts/ai-query.openapi.yaml`

**Endpoints**:

1. **POST /api/ai/query**
   - **Purpose**: Submit a question to AI about user's tasks
   - **Auth**: Required (JWT token)
   - **Request Body**:
     ```json
     {
       "query": "string (max 1000 chars)"
     }
     ```
   - **Response 200**:
     ```json
     {
       "interaction_id": "uuid",
       "query": "string",
       "response": "string",
       "timestamp": "ISO 8601",
       "suggestions": [
         {
           "type": "task_breakdown",
           "tasks": [
             {"title": "string", "description": "string"}
           ]
         }
       ]
     }
     ```
   - **Response 400**: Invalid query (empty, too long, harmful content)
   - **Response 401**: Unauthorized
   - **Response 429**: Rate limit exceeded
   - **Response 503**: AI service unavailable
   - **Response 504**: AI request timeout

2. **GET /api/ai/history**
   - **Purpose**: Retrieve user's past AI interactions
   - **Auth**: Required (JWT token)
   - **Query Params**: `limit` (default 10, max 50), `offset` (default 0)
   - **Response 200**:
     ```json
     {
       "interactions": [
         {
           "id": "uuid",
           "query": "string",
           "response": "string",
           "timestamp": "ISO 8601"
         }
       ],
       "total": "integer"
     }
     ```

3. **POST /api/ai/confirm-breakdown**
   - **Purpose**: Create tasks from AI suggestions after user confirmation
   - **Auth**: Required (JWT token)
   - **Request Body**:
     ```json
     {
       "interaction_id": "uuid",
       "tasks": [
         {"title": "string", "description": "string", "priority": "string"}
       ]
     }
     ```
   - **Response 201**: Tasks created successfully
   - **Response 400**: Invalid task data
   - **Response 404**: Interaction not found or doesn't belong to user

### Quickstart Guide

**Output**: `quickstart.md`

```markdown
# AI Task Assistant - Developer Quickstart

## Prerequisites
- Phase II Todo application running
- AI provider API key (Anthropic or OpenAI)

## Backend Setup

1. Add AI SDK dependency:
   ```bash
   cd backend
   pip install anthropic  # or openai
   ```

2. Configure environment variables in `.env`:
   ```
   AI_PROVIDER=anthropic  # or openai
   AI_API_KEY=your_api_key_here
   AI_MODEL=claude-3-sonnet-20240229  # or gpt-4
   AI_MAX_TOKENS=1000
   AI_TIMEOUT_SECONDS=30
   AI_RATE_LIMIT_PER_MINUTE=10
   ```

3. Run database migration:
   ```bash
   alembic revision --autogenerate -m "Add AI interaction table"
   alembic upgrade head
   ```

4. Start backend (existing command):
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

## Frontend Setup

No additional dependencies required. Frontend uses existing Next.js setup.

## Testing AI Integration

1. Authenticate as a user
2. Create some sample tasks
3. Navigate to `/ai-assistant`
4. Ask: "What are my high priority tasks?"
5. Verify AI responds with actual task data

## Fallback Testing

1. Stop AI service or set invalid API key
2. Verify core task management still works
3. Verify AI endpoints return 503 with clear message
4. Verify frontend shows "AI temporarily unavailable"

## Monitoring

- Check logs for AI interaction records
- Monitor `ai_interaction` table for query patterns
- Track token usage for cost management
```

## Phase 2: Implementation Planning

**Note**: Detailed task breakdown will be generated by `/sp.tasks` command after this plan is approved.

**High-Level Implementation Phases**:

1. **Foundation** (blocking all other work):
   - Add AI SDK dependency to backend
   - Create `ai_interaction` database table
   - Configure environment variables for AI provider

2. **Backend AI Service** (P1 - MVP):
   - Implement `AIService` class with provider abstraction
   - Add input validation and sanitization
   - Implement task context aggregation from existing repository
   - Add error handling and timeout logic
   - Create mock AI service for testing

3. **Backend API Endpoints** (P1 - MVP):
   - Implement POST `/api/ai/query` endpoint
   - Add authentication middleware integration
   - Implement rate limiting
   - Add logging for all AI interactions

4. **Frontend AI Interface** (P1 - MVP):
   - Create `AIChat` component with text input
   - Implement `aiService.ts` API client
   - Add loading states and error handling
   - Display AI responses with proper formatting

5. **Task Breakdown Feature** (P2):
   - Extend AI service to detect breakdown requests
   - Implement POST `/api/ai/confirm-breakdown` endpoint
   - Create `TaskBreakdown` component with confirmation UI
   - Add task creation flow after confirmation

6. **Priority Explanation Feature** (P3):
   - Extend AI prompts for priority analysis
   - Add priority visualization in responses
   - Implement comparison logic in AI service

7. **History & Monitoring** (Polish):
   - Implement GET `/api/ai/history` endpoint
   - Add interaction history UI
   - Create admin dashboard for token usage monitoring

## Post-Phase 1 Constitution Re-Check

After completing Phase 1 design, verify all constitutional requirements:

- ✅ Phase II Foundation: No Phase II code modified, only additions
- ✅ Separation of Concerns: AI service isolated, controllers thin, repositories unchanged
- ✅ Testability: AI service mockable, endpoints testable independently
- ✅ Simplicity: No over-engineering, direct AI SDK usage, minimal abstractions
- ✅ AI Read-Only: Confirm-breakdown endpoint is only mutation path, requires explicit POST
- ✅ No Hallucination: AI service validates responses against actual task data
- ✅ Authentication: All endpoints use existing Phase II auth middleware
- ✅ AI Service Isolation: `ai_service.py` is only file with AI SDK imports
- ✅ AI Optional: Graceful degradation via try-catch and 503 responses
- ✅ Secrets Management: AI_API_KEY in environment variables only

**Final Gate Status**: ✅ PASSED - Ready for task generation

## Risk Analysis

**Risk 1: AI API Cost Overruns**
- **Mitigation**: Implement strict rate limiting (10 queries/minute/user), monitor token usage, set budget alerts
- **Fallback**: Disable AI feature if budget exceeded

**Risk 2: AI Response Quality**
- **Mitigation**: Extensive prompt engineering in research phase, validate responses against task data
- **Fallback**: Show disclaimer "AI suggestions may not be perfect"

**Risk 3: Phase II Integration Breakage**
- **Mitigation**: No modifications to Phase II code, only additions; comprehensive integration tests
- **Fallback**: Feature flag to disable AI without affecting core app

**Risk 4: AI Service Latency**
- **Mitigation**: 30-second timeout, loading indicators, async processing
- **Fallback**: Timeout with retry option

## Next Steps

1. **Review this plan** for completeness and constitutional compliance
2. **Execute Phase 0**: Run research tasks, document findings in `research.md`
3. **Execute Phase 1**: Create `data-model.md`, generate API contracts, write `quickstart.md`
4. **Generate tasks**: Run `/sp.tasks` to create detailed implementation task list
5. **Begin implementation**: Start with Foundation phase, then P1 MVP features
