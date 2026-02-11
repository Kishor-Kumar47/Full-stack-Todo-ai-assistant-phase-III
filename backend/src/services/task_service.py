from typing import List, Optional
from sqlmodel import Session, select
from ..models.task import Task, TaskBase
from ..models.user import User
from datetime import datetime

class TaskService:
    @staticmethod
    def create_task(session: Session, task_data: TaskBase) -> Task:
        task = Task(**task_data.model_dump())
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_task_by_id(session: Session, task_id: int, user_id: int) -> Optional[Task]:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return session.exec(statement).first()

    @staticmethod
    def get_tasks_by_user(session: Session, user_id: int) -> List[Task]:
        statement = select(Task).where(Task.user_id == user_id)
        return session.exec(statement).all()

    @staticmethod
    def update_task(session: Session, task_id: int, user_id: int, task_data: TaskBase) -> Optional[Task]:
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task:
            for key, value in task_data.model_dump(exclude_unset=True).items():
                setattr(task, key, value)
            if task.is_completed and not task.completed_at:
                task.completed_at = datetime.utcnow()
            elif not task.is_completed and task.completed_at:
                task.completed_at = None
            session.add(task)
            session.commit()
            session.refresh(task)
        return task

    @staticmethod
    def delete_task(session: Session, task_id: int, user_id: int) -> bool:
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task:
            session.delete(task)
            session.commit()
            return True
        return False

    @staticmethod
    def complete_task(session: Session, task_id: int, user_id: int, is_completed: bool) -> Optional[Task]:
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task:
            task.is_completed = is_completed
            if is_completed and not task.completed_at:
                task.completed_at = datetime.utcnow()
            elif not is_completed:
                task.completed_at = None
            session.add(task)
            session.commit()
            session.refresh(task)
        return task