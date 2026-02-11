# Quickstart Guide: Full-stack Todo Application

**Feature**: 002-full-stack-todo
**Date**: 2026-02-05

## Overview
This guide will help you quickly set up and run the Todo Application with authentication.

## Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- npm or yarn package manager
- SQLite (usually comes with Python installation)

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set environment variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./todo_app.db
```

### 5. Run the backend
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Run the frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running Both Together

1. Start the backend server first
2. In a separate terminal, start the frontend
3. Visit `http://localhost:3000` in your browser

## API Documentation
- Backend API docs: `http://localhost:8000/docs`
- Interactive API playground: `http://localhost:8000/redoc`

## First Steps
1. Visit the landing page at `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Log in with your credentials
4. Use the todo dashboard to create and manage tasks

## Troubleshooting
- If you encounter CORS errors, check that both servers are running on the expected ports
- Ensure the API_BASE_URL in frontend points to your running backend
- Check that the database file has proper read/write permissions