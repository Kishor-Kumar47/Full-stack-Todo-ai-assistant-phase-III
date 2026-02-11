# Full-stack Todo AI Assistant - Phase III

A modern full-stack todo application with AI-powered task assistance built with Next.js, FastAPI, and PostgreSQL.

## Features

### Task Management
- ✅ Create, read, update, and delete tasks
- 📅 Set due dates and priorities (low, medium, high)
- ✔️ Mark tasks as complete/incomplete
- 📝 Add detailed descriptions to tasks
- 🎨 Beautiful, responsive UI with Tailwind CSS

### AI Assistant
- 🤖 Intelligent AI-powered assistant using Anthropic Claude
- 💬 Floating chat interface for easy access
- 📊 Ask questions about your tasks
- 🔍 Get task breakdowns and suggestions
- 💡 Natural language interaction
- 📜 View AI interaction history

### Security & Authentication
- 🔐 Secure JWT-based authentication
- 👤 User registration and login
- 🔒 Protected API endpoints
- ⚡ Rate limiting on AI queries (10 requests/minute)

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLModel** - SQL database ORM with Pydantic integration
- **PostgreSQL** - Robust relational database (Neon)
- **Anthropic Claude API** - AI-powered task assistance
- **JWT** - Secure authentication tokens
- **Alembic** - Database migration tool
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database (or Neon account)
- Anthropic API key (for AI features)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
AI_API_KEY=your-anthropic-api-key-here
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the backend server:
```bash
uvicorn src.main:app --reload --port 8001
```

The backend will be available at `http://localhost:8001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in frontend directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit:
```
http://localhost:3000
```

## Project Structure

```
Phase-III/
├── backend/
│   ├── src/
│   │   ├── api/              # API route handlers
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── ai.py         # AI assistant endpoints
│   │   │   └── simple_tasks.py # Task CRUD endpoints
│   │   ├── models/           # Database models
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── ai_interaction.py
│   │   ├── services/         # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── task_service.py
│   │   │   └── ai_service.py
│   │   ├── middleware/       # Auth & rate limiting
│   │   └── database.py       # Database connection
│   ├── alembic/              # Database migrations
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   │   ├── page.tsx      # Main todo page with AI chat
│   │   │   ├── auth/         # Login & signup pages
│   │   │   └── layout.tsx
│   │   ├── components/       # React components
│   │   │   ├── layout/
│   │   │   └── tasks/
│   │   ├── services/         # API client services
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── aiService.ts
│   │   └── types/            # TypeScript types
│   └── package.json          # Node dependencies
│
└── specs/                    # Feature specifications
    └── 001-ai-task-assistant/
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
  - Body: `{ username, email, password, first_name, last_name }`
- `POST /auth/login` - Login user (form-urlencoded)
  - Body: `email=...&password=...`
  - Returns: `{ access_token, token_type }`

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
  - Body: `{ title, description?, priority?, due_date?, is_completed }`
- `PATCH /api/1/tasks/{id}` - Update task
- `DELETE /api/1/tasks/{id}` - Delete task

### AI Assistant
- `POST /api/ai/query` - Query AI assistant
  - Body: `{ query: string }`
  - Returns: `{ interaction_id, query, response, timestamp, suggestions }`
- `GET /api/ai/history` - Get AI interaction history
  - Query params: `limit`, `offset`
- `POST /api/ai/confirm-breakdown` - Create tasks from AI suggestions
  - Body: `{ interaction_id: string }`

## Features in Detail

### Floating AI Assistant
The AI assistant appears as a floating purple button in the bottom-right corner of the main page. Click it to:
- Open a chat interface
- Ask questions about your tasks
- Get AI-powered suggestions
- Request task breakdowns
- View conversation history

### Task Priorities
Tasks can be assigned three priority levels:
- **High** (Red badge) - Urgent tasks
- **Medium** (Yellow badge) - Normal priority
- **Low** (Green badge) - Low priority

### Authentication Flow
1. New users register with username, email, and password
2. Login returns a JWT access token
3. Token is stored in localStorage
4. All API requests include the token in Authorization header
5. Protected routes redirect to login if not authenticated

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-minimum-32-characters
AI_API_KEY=sk-ant-api03-...  # Anthropic API key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- hashed_password
- first_name
- last_name
- created_at

### Tasks Table
- id (Primary Key)
- user_id (Foreign Key)
- title
- description
- priority (low/medium/high)
- is_completed
- due_date
- created_at
- updated_at
- completed_at

### AI Interactions Table
- id (UUID Primary Key)
- user_id (Foreign Key)
- query_text
- response_text
- status (pending/completed/failed/timeout)
- token_count
- suggestions_json
- query_timestamp
- response_timestamp

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Troubleshooting

### Backend won't start
- Check if port 8001 is available
- Verify DATABASE_URL is correct
- Ensure all dependencies are installed
- Check Python version (3.10+)

### Frontend won't connect to backend
- Verify NEXT_PUBLIC_API_BASE_URL in .env.local
- Check if backend is running on port 8001
- Clear browser cache and localStorage

### AI queries failing
- Verify AI_API_KEY is set correctly
- Check Anthropic API key is valid and has credits
- Review rate limiting (10 requests/minute)

## License

MIT

## Author

Kishor Kumar

## Acknowledgments

- Built for GIAIC Q4 Hackathon Phase III
- Powered by Anthropic Claude AI
- Database hosted on Neon PostgreSQL
