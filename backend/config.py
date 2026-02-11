import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    secret_key: str = "your-default-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_url: str = "sqlite:///./todo_app.db"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()