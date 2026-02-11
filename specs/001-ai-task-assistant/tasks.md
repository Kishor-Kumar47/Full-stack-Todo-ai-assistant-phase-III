# Tasks: AI Task Assistant

**Input**: Design documents from `/specs/001-ai-task-assistant/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend structure: `backend/src/models/`, `backend/src/services/`, `backend/src/api/`
- Frontend structure: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/services/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency management

- [x] T001 Add Anthropic SDK dependency to backend/requirements.txt (anthropic==0.18.0)
- [x] T002 [P] Add AI configuration variables to backend/.env.example (AI_PROVIDER, AI_API_KEY, AI_MODEL, AI_MAX_TOKENS, AI_TIMEOUT_SECONDS, AI_RATE_LIMIT_PER_MINUTE)
- [x] T003 [P] Create backend/src/models/ai_interaction.py with AIInteractionBase and AIInteraction SQLModel classes
- [x] T004 Generate Alembic migration for ai_interaction table in backend/alembic/versions/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Run Alembic migration to create ai_interaction table with indexes (alembic upgrade head)
- [x] T006 [P] Create backend/src/middleware/rate_limiter.py with RateLimiter class (10 requests/minute default)
- [x] T007 [P] Create backend/src/services/ai_service.py with AIService class skeleton (init, query method stub)
- [x] T008 [P] Implement Anthropic client initialization in backend/src/services/ai_service.py (load API key from env)
- [x] T009 Implement build_task_context function in backend/src/services/ai_service.py (fetch user tasks via TaskService)
- [x] T010 [P] Create backend/src/api/ai.py router with authentication dependency (import AuthMiddleware)
- [x] T011 Register AI router in backend/src/main.py (app.include_router)
- [x] T012 [P] Create frontend/src/types/ai.ts with AIQuery, AIResponse, AISuggestion interfaces
- [x] T013 [P] Create frontend/src/services/aiService.ts with query, getHistory, confirmBreakdown methods (axios client)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Ask AI About Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can ask natural language questions about their tasks and receive AI-generated insights based on actual task data

**Independent Test**: Create sample tasks with different priorities, ask "What are my high priority tasks?", verify AI returns accurate list without hallucinating tasks

### Implementation for User Story 1

- [x] T014 [P] [US1] Implement query validation in backend/src/services/ai_service.py (sanitize input, check length <= 1000 chars)
- [x] T015 [P] [US1] Implement format_task_context_for_prompt in backend/src/services/ai_service.py (convert TaskContext to text)
- [x] T016 [US1] Implement query_ai method in backend/src/services/ai_service.py (call Anthropic API with task context and user query)
- [x] T017 [US1] Add error handling for AI service failures in backend/src/services/ai_service.py (timeout, API errors, invalid responses)
- [x] T018 [US1] Implement POST /api/ai/query endpoint in backend/src/api/ai.py (extract user_id, call AIService, save interaction)
- [x] T019 [US1] Add rate limiting to POST /api/ai/query endpoint in backend/src/api/ai.py (use RateLimiter middleware)
- [x] T020 [US1] Implement GET /api/ai/history endpoint in backend/src/api/ai.py (fetch user's past interactions with pagination)
- [x] T021 [P] [US1] Create frontend/src/app/ai-assistant/page.tsx with basic layout and navigation
- [x] T022 [P] [US1] Create frontend/src/components/AIChat.tsx with text input and submit button
- [x] T023 [US1] Implement query submission in frontend/src/components/AIChat.tsx (call aiService.query, handle loading state)
- [x] T024 [P] [US1] Create frontend/src/components/AIResponse.tsx to display AI response text with formatting
- [x] T025 [US1] Add error handling to frontend/src/components/AIChat.tsx (display error messages, handle 503/504/429 errors)
- [x] T026 [US1] Implement AI unavailable fallback message in frontend/src/components/AIChat.tsx (show when 503 error)
- [x] T027 [US1] Add loading indicator to frontend/src/components/AIChat.tsx (spinner during AI request)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can ask questions and get AI responses.

---

## Phase 4: User Story 2 - AI Suggests Task Breakdowns (Priority: P2)

**Goal**: Users can request AI to suggest how to break down complex tasks into subtasks, with explicit confirmation required before creating tasks

**Independent Test**: Create task "Build a website", ask "How should I break this down?", verify AI suggests 3-5 subtasks without creating them in database, confirm button appears

### Implementation for User Story 2

- [x] T028 [P] [US2] Implement detect_breakdown_request in backend/src/services/ai_service.py (identify when user asks for task breakdown)
- [x] T029 [US2] Implement generate_task_breakdown in backend/src/services/ai_service.py (prompt AI for structured subtask suggestions)
- [x] T030 [US2] Add suggestions_json field handling in backend/src/services/ai_service.py (parse AI response into structured format)
- [x] T031 [US2] Update POST /api/ai/query response in backend/src/api/ai.py to include suggestions array
- [x] T032 [US2] Implement POST /api/ai/confirm-breakdown endpoint in backend/src/api/ai.py (validate interaction_id, create tasks via TaskService)
- [x] T033 [US2] Add validation for confirm-breakdown in backend/src/api/ai.py (max 10 tasks, verify interaction belongs to user)
- [x] T034 [P] [US2] Create frontend/src/components/TaskBreakdown.tsx to display suggested tasks with rationale
- [x] T035 [US2] Add "Create these tasks" confirmation button to frontend/src/components/TaskBreakdown.tsx
- [x] T036 [US2] Implement confirmBreakdown handler in frontend/src/components/TaskBreakdown.tsx (call aiService.confirmBreakdown)
- [x] T037 [US2] Update frontend/src/components/AIResponse.tsx to conditionally render TaskBreakdown component when suggestions present
- [x] T038 [US2] Add success notification in frontend/src/components/TaskBreakdown.tsx after tasks created (show count of created tasks)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can get AI suggestions and create tasks from them.

---

## Phase 5: User Story 3 - AI Explains Task Priorities (Priority: P3)

**Goal**: Users can ask AI to explain task priorities and get advisory recommendations without AI making decisions for them

**Independent Test**: Create tasks with different due dates and priorities, ask "What should I focus on?", verify AI explains tradeoffs without dictating choices

### Implementation for User Story 3

- [x] T039 [P] [US3] Implement detect_priority_request in backend/src/services/ai_service.py (identify priority/focus questions)
- [x] T040 [US3] Implement generate_priority_explanation in backend/src/services/ai_service.py (prompt AI to explain priorities with reasoning)
- [x] T041 [US3] Add priority analysis to task context in backend/src/services/ai_service.py (include overdue count, high priority count)
- [x] T042 [P] [US3] Add priority visualization to frontend/src/components/AIResponse.tsx (highlight urgent tasks in response)
- [x] T043 [US3] Implement simple language validation in backend/src/services/ai_service.py (ensure AI avoids technical jargon)

**Checkpoint**: All user stories should now be independently functional. Complete AI assistant feature with query, breakdown, and priority features.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add interaction logging to backend/src/services/ai_service.py (log all queries, responses, errors with timestamps)
- [ ] T045 [P] Create backend/tests/test_ai_service.py with unit tests for AIService (mock Anthropic API)
- [ ] T046 [P] Create backend/tests/test_ai_api.py with integration tests for AI endpoints (test auth, rate limiting, error cases)
- [ ] T047 [P] Add AI interaction history UI to frontend/src/app/ai-assistant/page.tsx (display past queries with timestamps)
- [ ] T048 [P] Implement token usage tracking in backend/src/services/ai_service.py (count tokens for cost monitoring)
- [ ] T049 [P] Add input sanitization for XSS prevention in frontend/src/components/AIChat.tsx
- [ ] T050 [P] Create backend/.env.example documentation with all AI configuration variables and descriptions
- [ ] T051 Update backend/README.md with AI assistant setup instructions (link to quickstart.md)
- [ ] T052 [P] Add graceful degradation test: verify core task CRUD works when AI service down
- [ ] T053 [P] Add authentication boundary test: verify AI cannot access other users' tasks
- [ ] T054 Run quickstart.md validation (follow all setup steps, verify all curl examples work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 query infrastructure but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses US1 query infrastructure but independently testable

### Within Each User Story

- Backend service implementation before API endpoints
- API endpoints before frontend components
- Core components before integration features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T003)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T006-T008, T010, T012-T013)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch parallel backend tasks for User Story 1:
Task T014: Implement query validation (ai_service.py)
Task T015: Implement format_task_context_for_prompt (ai_service.py)

# After T014-T017 complete, launch parallel frontend tasks:
Task T021: Create ai-assistant page (page.tsx)
Task T022: Create AIChat component (AIChat.tsx)
Task T024: Create AIResponse component (AIResponse.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T027)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: Users can ask AI questions about their tasks and receive accurate, helpful responses. Core app continues working if AI is down.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T027)
   - Developer B: User Story 2 (T028-T038)
   - Developer C: User Story 3 (T039-T043)
3. Stories complete and integrate independently
4. Team collaborates on Polish (T044-T054)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are optional - not explicitly requested in spec, but T045-T046 included for quality assurance
- Rate limiting is critical for AI endpoints due to API costs
- All AI interactions must respect user authentication boundaries
- Core Phase II functionality must continue working when AI is unavailable
