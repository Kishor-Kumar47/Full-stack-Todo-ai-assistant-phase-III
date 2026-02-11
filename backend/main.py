from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.router import router as auth_router
from tasks.router import router as tasks_router
from database import Base, engine
from config import settings

# Create the database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)

@app.get("/")
def read_root():
    """
    Root endpoint
    """
    return {"message": "Welcome to the Todo API"}

@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "message": "Todo API is running"}
