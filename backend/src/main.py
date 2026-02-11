from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .models.task import Task
from .models.user import User
from .models.ai_interaction import AIInteraction  # Phase III: AI Task Assistant
from .api.auth import router as auth_router
from .api.simple_tasks import router as simple_tasks_router
from .api.ai import router as ai_router  # Phase III: AI endpoints
from .database import engine

# Initialize FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, tags=["authentication"])
app.include_router(simple_tasks_router, prefix="/api", tags=["tasks"])
app.include_router(ai_router, tags=["AI Assistant"])  # Phase III: AI endpoints

# Create database tables
@app.on_event("startup")
async def on_startup():
    # Create database tables
    SQLModel.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
