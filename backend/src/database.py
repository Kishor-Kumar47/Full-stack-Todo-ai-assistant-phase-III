from sqlmodel import create_engine
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env (stable even when started from repo root)
backend_dir = Path(__file__).resolve().parents[1]  # backend/
load_dotenv(dotenv_path=backend_dir / ".env")

# Prefer explicit DATABASE_URL, otherwise use a stable sqlite path anchored to the backend folder.
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    db_path = backend_dir / "todo_app.db"
    DATABASE_URL = f"sqlite:///{db_path.as_posix()}"

# Create the engine
engine = create_engine(DATABASE_URL, echo=True)