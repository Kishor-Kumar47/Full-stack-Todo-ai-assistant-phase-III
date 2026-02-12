---
title: Todo AI Assistant API
emoji: 🤖
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
license: mit
---

# Todo AI Assistant API

FastAPI backend for the Todo AI Assistant application with Anthropic Claude integration.

## Features

- Task Management API (CRUD operations)
- AI-powered task assistance using Anthropic Claude
- JWT Authentication
- PostgreSQL database
- Rate limiting on AI queries

## Environment Variables

Set these in your Hugging Face Space settings:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `SECRET_KEY` - JWT secret key (required, min 32 characters)
- `AI_API_KEY` - Anthropic API key (required for AI features)

## API Documentation

Once deployed, visit `/docs` for interactive API documentation.

## Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/1/tasks/{id}` - Update task
- `DELETE /api/1/tasks/{id}` - Delete task
- `POST /api/ai/query` - Query AI assistant
- `GET /api/ai/history` - Get AI history

## Tech Stack

- FastAPI
- SQLModel
- PostgreSQL
- Anthropic Claude API
- Alembic (migrations)
