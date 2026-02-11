# Quickstart Guide: Multi-User Todo Web Application

## Overview

This guide provides instructions for setting up and running the multi-user Todo web application with authentication.

## Prerequisites

- Node.js 18+ for frontend
- Python 3.11+ for backend
- PostgreSQL (Neon Serverless account)
- Better Auth account configuration

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database connection details
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the backend server:
```bash
uvicorn src.main:app --reload --port 8000
```

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API endpoint and Better Auth configuration
```

4. Start the development server:
```bash
npm run dev
```

## Configuration

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
```

## Running the Application

1. Start the backend server (port 8000)
2. Start the frontend server (port 3000)
3. Access the application at `http://localhost:3000`

## API Endpoints

All API endpoints require JWT authentication:

- `GET /api/{user_id}/tasks` - Get all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Mark task as complete/incomplete

## Authentication Flow

1. User signs up or logs in via Better Auth
2. JWT token is issued and stored in browser
3. JWT token is automatically attached to all API requests
4. Backend validates JWT and extracts user identity
5. User can only access their own tasks (user_id validation)

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend
1. Set up production database (Neon PostgreSQL)
2. Configure environment variables
3. Run migrations
4. Deploy to preferred hosting platform

### Frontend
1. Build the application: `npm run build`
2. Deploy to preferred hosting platform (Vercel, Netlify, etc.)
3. Configure environment variables for production