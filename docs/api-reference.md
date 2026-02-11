# API Reference

## Base URL

All API endpoints are prefixed with `/api` and are served from the backend server.

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Tasks

#### Get all tasks for a user
```
GET /api/{user_id}/tasks
```

**Path Parameters:**
- `user_id` (integer): ID of the user whose tasks to retrieve

**Response:**
```json
[
  {
    "id": 1,
    "title": "Sample Task",
    "description": "Task description",
    "is_completed": false,
    "due_date": "2023-12-31T00:00:00",
    "priority": "medium",
    "user_id": 1,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00",
    "completed_at": null
  }
]
```

#### Create a new task
```
POST /api/{user_id}/tasks
```

**Path Parameters:**
- `user_id` (integer): ID of the user to create the task for

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "due_date": "2023-12-31T00:00:00",
  "priority": "medium"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description",
  "is_completed": false,
  "due_date": "2023-12-31T00:00:00",
  "priority": "medium",
  "user_id": 1,
  "created_at": "2023-01-02T00:00:00",
  "updated_at": "2023-01-02T00:00:00",
  "completed_at": null
}
```

#### Get a specific task
```
GET /api/{user_id}/tasks/{id}
```

**Path Parameters:**
- `user_id` (integer): ID of the user
- `id` (integer): ID of the task to retrieve

**Response:**
```json
{
  "id": 1,
  "title": "Sample Task",
  "description": "Task description",
  "is_completed": false,
  "due_date": "2023-12-31T00:00:00",
  "priority": "medium",
  "user_id": 1,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00",
  "completed_at": null
}
```

#### Update a task
```
PUT /api/{user_id}/tasks/{id}
```

**Path Parameters:**
- `user_id` (integer): ID of the user
- `id` (integer): ID of the task to update

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "is_completed": true,
  "due_date": "2023-12-31T00:00:00",
  "priority": "high"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated Task",
  "description": "Updated description",
  "is_completed": true,
  "due_date": "2023-12-31T00:00:00",
  "priority": "high",
  "user_id": 1,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-02T00:00:00",
  "completed_at": "2023-01-02T00:00:00"
}
```

#### Delete a task
```
DELETE /api/{user_id}/tasks/{id}
```

**Path Parameters:**
- `user_id` (integer): ID of the user
- `id` (integer): ID of the task to delete

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

#### Mark task as complete/incomplete
```
PATCH /api/{user_id}/tasks/{id}/complete
```

**Path Parameters:**
- `user_id` (integer): ID of the user
- `id` (integer): ID of the task to update

**Request Body:**
```json
{
  "isCompleted": true
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Sample Task",
  "description": "Task description",
  "is_completed": true,
  "due_date": "2023-12-31T00:00:00",
  "priority": "medium",
  "user_id": 1,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-02T00:00:00",
  "completed_at": "2023-01-02T00:00:00"
}
```

## Error Responses

All error responses follow the same structure:

```json
{
  "detail": "Error message"
}
```

Common status codes:
- `401`: Unauthorized - Invalid or missing JWT token
- `403`: Forbidden - User does not have access to the requested resource
- `404`: Not Found - The requested resource does not exist
- `422`: Unprocessable Entity - Request validation failed