# Todo Application API Contract

**Version**: 1.0.0
**Base URL**: `/api/v1`

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Error Responses
All error responses follow this structure:
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

## Public Endpoints

### POST /auth/register
Register a new user account.

#### Request
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

#### Response (201 Created)
```json
{
  "message": "User registered successfully",
  "user_id": "uuid-string"
}
```

#### Response (400 Bad Request)
```json
{
  "detail": "Email already registered"
}
```

### POST /auth/login
Authenticate user and return JWT token.

#### Request
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

#### Response (200 OK)
```json
{
  "access_token": "jwt-token-string",
  "token_type": "bearer",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com"
  }
}
```

#### Response (401 Unauthorized)
```json
{
  "detail": "Incorrect email or password"
}
```

## Protected Endpoints

### GET /todos
Get all todos for the authenticated user.

#### Headers
- `Authorization: Bearer {jwt_token}`

#### Response (200 OK)
```json
[
  {
    "id": "uuid-string",
    "title": "Sample task",
    "description": "Detailed task description",
    "is_completed": false,
    "created_at": "2023-10-01T10:00:00Z",
    "updated_at": "2023-10-01T10:00:00Z",
    "user_id": "user-uuid-string"
  }
]
```

### POST /todos
Create a new todo for the authenticated user.

#### Headers
- `Authorization: Bearer {jwt_token}`

#### Request
```json
{
  "title": "New task",
  "description": "Task description",
  "is_completed": false
}
```

#### Response (201 Created)
```json
{
  "id": "uuid-string",
  "title": "New task",
  "description": "Task description",
  "is_completed": false,
  "created_at": "2023-10-01T10:00:00Z",
  "updated_at": "2023-10-01T10:00:00Z",
  "user_id": "user-uuid-string"
}
```

### PUT /todos/{id}
Update an existing todo.

#### Headers
- `Authorization: Bearer {jwt_token}`

#### Path Parameter
- `id`: Todo ID to update

#### Request
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "is_completed": true
}
```

#### Response (200 OK)
```json
{
  "id": "uuid-string",
  "title": "Updated task title",
  "description": "Updated description",
  "is_completed": true,
  "created_at": "2023-10-01T10:00:00Z",
  "updated_at": "2023-10-02T15:30:00Z",
  "user_id": "user-uuid-string"
}
```

### DELETE /todos/{id}
Delete a todo.

#### Headers
- `Authorization: Bearer {jwt_token}`

#### Path Parameter
- `id`: Todo ID to delete

#### Response (204 No Content)
Success - Todo deleted

#### Response (404 Not Found)
```json
{
  "detail": "Todo not found"
}
```