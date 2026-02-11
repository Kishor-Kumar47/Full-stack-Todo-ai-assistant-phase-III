# Data Model: Full-stack Todo Application with Authentication

**Feature**: 002-full-stack-todo
**Date**: 2026-02-05
**Status**: Final

## Entity Definitions

### User Entity

**Description**: Represents a registered user in the system

**Fields**:
- `id` (UUID/string): Unique identifier for the user
- `email` (string): User's email address, serves as username
- `hashed_password` (string): BCrypt hashed password
- `created_at` (datetime): Timestamp when account was created
- `updated_at` (datetime): Timestamp when account was last updated
- `is_active` (boolean): Whether the account is active

**Validation Rules**:
- Email must be valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements (at least 8 characters)
- Email cannot be empty

**Relationships**:
- One-to-many with Task entity (one user has many tasks)

### Task Entity

**Description**: Represents a todo task owned by a specific user

**Fields**:
- `id` (UUID/string): Unique identifier for the task
- `title` (string): Title/summary of the task (max 200 characters)
- `description` (string): Detailed description of the task (optional, max 1000 characters)
- `is_completed` (boolean): Whether the task is completed or pending
- `created_at` (datetime): Timestamp when task was created
- `updated_at` (datetime): Timestamp when task was last updated
- `user_id` (UUID/string): Foreign key linking to the owning user

**Validation Rules**:
- Title cannot be empty
- Title must be between 1-200 characters
- Description must be max 1000 characters if provided
- User_id must reference an existing active user
- Is_completed defaults to false when creating a new task

**Relationships**:
- Many-to-one with User entity (many tasks belong to one user)

## State Transitions

### Task State Transitions
- **Pending → Completed**: When user marks task as done
- **Completed → Pending**: When user unmarks completed task

## Data Access Patterns

### User Operations
- Create: Register new user with email and password
- Read: Authenticate user by email/password
- Update: Update user profile information
- Delete: Deactivate user account (soft delete preferred)

### Task Operations
- Create: Create new task for authenticated user
- Read: Fetch all tasks for authenticated user
- Update: Modify task properties (title, description, completion status)
- Delete: Remove task from user's list

## Database Constraints

### User Table
- Primary Key: id
- Unique Constraint: email
- Index: email (for authentication lookups)

### Task Table
- Primary Key: id
- Foreign Key: user_id references User(id)
- Index: user_id (for user-specific task queries)
- Index: is_completed (for filtering completed tasks)

## Security Considerations

### Data Access Control
- Each query must filter tasks by authenticated user's ID
- No direct access to other users' tasks
- Authentication required for all task operations

### Data Privacy
- Passwords stored as bcrypt hashes only
- No plaintext passwords stored in database
- Personal data retention follows privacy regulations