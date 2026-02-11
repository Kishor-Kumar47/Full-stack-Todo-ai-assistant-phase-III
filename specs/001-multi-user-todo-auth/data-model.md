# Data Model: Multi-User Todo Web Application

## Overview

This document defines the data models for the multi-user Todo web application, including entities, relationships, and constraints.

## Entity: User

**Description**: Represents a registered user account in the system

**Fields**:
- `id` (UUID/Integer): Unique identifier for the user (Primary Key)
- `email` (String): User's email address (Unique, Required)
- `username` (String): User's chosen username (Unique, Optional)
- `password_hash` (String): Hashed password for authentication (Required)
- `first_name` (String): User's first name (Optional)
- `last_name` (String): User's last name (Optional)
- `created_at` (DateTime): Timestamp when user account was created
- `updated_at` (DateTime): Timestamp when user account was last updated
- `is_active` (Boolean): Whether the user account is active (Default: True)

**Relationships**:
- One-to-Many: User has many Tasks

## Entity: Task

**Description**: Represents a todo item that belongs to a specific user

**Fields**:
- `id` (UUID/Integer): Unique identifier for the task (Primary Key)
- `user_id` (UUID/Integer): Foreign key referencing the user who owns this task (Required)
- `title` (String): Title or subject of the task (Required, Max length: 200)
- `description` (Text): Detailed description of the task (Optional)
- `is_completed` (Boolean): Whether the task is marked as complete (Default: False)
- `due_date` (DateTime): Optional deadline for the task (Optional)
- `priority` (String): Priority level (e.g., 'low', 'medium', 'high') (Default: 'medium')
- `created_at` (DateTime): Timestamp when task was created
- `updated_at` (DateTime): Timestamp when task was last updated
- `completed_at` (DateTime): Timestamp when task was marked as complete (Optional)

**Relationships**:
- Many-to-One: Task belongs to one User

## Database Constraints

1. **User Constraints**:
   - Email must be unique across all users
   - Username must be unique across all users (if provided)
   - Email format must be valid
   - Password must meet security requirements (handled by auth system)

2. **Task Constraints**:
   - Each task must belong to exactly one user
   - Task title must not be empty
   - Priority must be one of the allowed values
   - User_id must reference an existing user (Foreign key constraint)

## Validation Rules

1. **User Validation**:
   - Email must follow standard email format
   - Username (if provided) must be 3-30 characters, alphanumeric with underscores/hyphens
   - Required fields must not be null

2. **Task Validation**:
   - Title must be 1-200 characters
   - Due date cannot be in the past (optional validation)
   - Priority must be one of: 'low', 'medium', 'high'
   - User_id must exist in the users table

## State Transitions

1. **Task Completion**:
   - Initial state: `is_completed = False`, `completed_at = null`
   - On completion: `is_completed = True`, `completed_at = current_timestamp`
   - On uncompletion: `is_completed = False`, `completed_at = null`

## Indexes

1. **User Table**:
   - Index on `email` (for authentication lookups)
   - Index on `username` (for username lookups)

2. **Task Table**:
   - Index on `user_id` (for user-specific queries)
   - Index on `is_completed` (for filtering completed tasks)
   - Index on `due_date` (for deadline-based queries)
   - Composite index on `(user_id, is_completed)` (for user's completed/incomplete tasks)