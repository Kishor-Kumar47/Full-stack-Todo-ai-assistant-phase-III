from fastapi import APIRouter, Depends, HTTPException, Path, Body, Request
from typing import List
from sqlmodel import Session, select
from ..database import engine
from ..models.task import Task, TaskBase
from ..services.task_service import TaskService

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.get("/tasks")
async def get_all_tasks(session: Session = Depends(get_session)):
    """Get all tasks - demo endpoint without user_id"""
    tasks = session.exec(select(Task)).all()
    return tasks

@router.post("/tasks")
async def create_task_demo(
    task_data: TaskBase = Body(...),
    session: Session = Depends(get_session)
):
    """Create task - demo endpoint without user_id in path"""
    task_data_dict = task_data.model_dump()
    task_data_dict['user_id'] = 1  # Default to user 1 for demo
    task = TaskService.create_task(session, TaskBase(**task_data_dict))
    return task

@router.get("/{user_id}/tasks")
async def get_tasks(
    user_id: int = Path(..., description="ID of user whose tasks to retrieve"),
    session: Session = Depends(get_session)
):
    tasks = TaskService.get_tasks_by_user(session, user_id)
    return tasks

@router.post("/{user_id}/tasks")
async def create_task(
    user_id: int = Path(..., description="ID of user to create task for"),
    task_data: TaskBase = Body(...),
    session: Session = Depends(get_session)
):
    task_data_dict = task_data.model_dump()
    task_data_dict['user_id'] = user_id
    task = TaskService.create_task(session, TaskBase(**task_data_dict))
    return task

@router.get("/{user_id}/tasks/{id}")
async def get_task(
    user_id: int = Path(..., description="ID of user"),
    id: int = Path(..., description="ID of task to retrieve"),
    session: Session = Depends(get_session)
):
    task = TaskService.get_task_by_id(session, id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{user_id}/tasks/{id}")
async def update_task(
    user_id: int = Path(..., description="ID of user"),
    id: int = Path(..., description="ID of task to update"),
    task_data: TaskBase = Body(...),
    session: Session = Depends(get_session)
):
    task_data_dict = task_data.model_dump()
    task_data_dict['user_id'] = user_id
    updated_task = TaskService.update_task(session, id, user_id, TaskBase(**task_data_dict))
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@router.delete("/{user_id}/tasks/{id}")
async def delete_task(
    user_id: int = Path(..., description="ID of user"),
    id: int = Path(..., description="ID of task to delete"),
    session: Session = Depends(get_session)
):
    success = TaskService.delete_task(session, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

@router.patch("/{user_id}/tasks/{id}/complete")
async def complete_task(
    user_id: int = Path(..., description="ID of user"),
    id: int = Path(..., description="ID of task to update"),
    is_completed: bool = Body(..., embed=True),
    session: Session = Depends(get_session)
):
    updated_task = TaskService.complete_task(session, id, user_id, is_completed)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task
