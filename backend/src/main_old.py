
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlmodel import SQLModel
from .models.user import User
from .models.task import Task
# from .api.tasks import router as tasks_router  # Using simple_tasks instead
from .api.simple_tasks import router as tasks_router
# from .api.auth import router as auth_router  # Temporarily disabled
from .database import engine

# Initialize FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(tasks_router, prefix="/api", tags=["tasks"])
# app.include_router(auth_router, prefix="/api", tags=["auth"])  # Temporarily disabled

# Create database tables
@app.on_event("startup")
async def on_startup():
    # Create database tables
    SQLModel.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

@app.get("/api")
def read_api():
    return {"message": "API is accessible"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
