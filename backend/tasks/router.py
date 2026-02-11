from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from tasks.crud import get_tasks, get_task, create_task, update_task, delete_task
from models.user import User
from models.task import Task
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/todos", tags=["todos"])

class TaskCreate(BaseModel):
    title: str
    description: str = None
    is_completed: bool = False

class TaskUpdate(BaseModel):
    title: str = None
    description: str = None
    is_completed: bool = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tasks for the current user
    """
    tasks = get_tasks(db, current_user.id)
    return tasks

@router.post("/", response_model=TaskResponse)
def create_new_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task for the current user
    """
    task_data = task.dict()
    db_task = create_task(db, task_data, current_user.id)

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create task"
        )

    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_existing_task(
    task_id: str,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a specific task for the current user
    """
    task_data = {k: v for k, v in task.dict().items() if v is not None}
    db_task = update_task(db, task_id, task_data, current_user.id)

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return db_task

@router.delete("/{task_id}")
def delete_existing_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific task for the current user
    """
    success = delete_task(db, task_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}