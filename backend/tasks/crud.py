from sqlalchemy.orm import Session
from models.task import Task
from models.user import User
from typing import List

def get_tasks(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    """
    Retrieve tasks for a specific user
    """
    return db.query(Task).filter(Task.user_id == user_id).offset(skip).limit(limit).all()

def get_task(db: Session, task_id: str, user_id: str):
    """
    Retrieve a specific task for a specific user
    """
    return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

def create_task(db: Session, task_data: dict, user_id: str):
    """
    Create a new task for a specific user
    """
    db_task = Task(**task_data, user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: str, task_data: dict, user_id: str):
    """
    Update a specific task for a specific user
    """
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    if db_task:
        for key, value in task_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
        return db_task

    return None

def delete_task(db: Session, task_id: str, user_id: str):
    """
    Delete a specific task for a specific user
    """
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    if db_task:
        db.delete(db_task)
        db.commit()
        return True

    return False