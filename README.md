# Multi-User Todo Web Application

A secure, full-stack todo application with user authentication and task management capabilities.

## Features

- User authentication with JWT tokens
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Task prioritization and due dates
- User-specific task isolation
- Responsive web interface

## Tech Stack

- **Frontend**: Next.js 16+ with App Router
- **Backend**: Python FastAPI
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: SQLModel
- **Authentication**: Better Auth with JWT

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (or Neon Serverless account)

### Backend Setup

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

### Frontend Setup

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

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
```

## API Documentation

For detailed API documentation, see [docs/api-reference.md](docs/api-reference.md).

## Project Structure

```
backend/
├── src/
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── api/             # API endpoints
│   ├── middleware/      # Authentication middleware
│   └── main.py          # Application entry point
├── requirements.txt     # Python dependencies
└── alembic/             # Database migrations

frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── services/        # API and auth services
│   └── types/           # TypeScript types
├── package.json         # Node.js dependencies
└── next.config.js       # Next.js configuration
```

## Security

- JWT-based authentication with token validation
- User data isolation - users can only access their own tasks
- Input validation and sanitization
- Secure password hashing

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