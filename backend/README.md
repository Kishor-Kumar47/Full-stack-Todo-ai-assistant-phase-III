---
title: Todo API Backend
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo API Backend

A FastAPI-based backend for a Todo application with user authentication and PostgreSQL database.

## Features

- User authentication with JWT tokens
- CRUD operations for todos
- PostgreSQL database integration
- RESTful API design

## API Documentation

Once deployed, visit `/docs` for interactive API documentation (Swagger UI).

## Environment Variables

Set these in your Hugging Face Space settings:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for JWT encoding
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)
