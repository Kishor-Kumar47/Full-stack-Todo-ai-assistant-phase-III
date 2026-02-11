import pytest
import sys
import os
from sqlmodel import Session, SQLModel, create_engine
from datetime import datetime

# Add the src directory to the path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.models.task import Task, TaskBase
from src.services.task_service import TaskService

# Create an in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(bind=engine)
    with Session(engine) as session:
        yield session

def test_create_task(session: Session):
    """Test creating a task"""
    task_data = TaskBase(
        title="Test Task",
        description="Test Description",
        user_id=1
    )
    created_task = TaskService.create_task(session, task_data)

    assert created_task.title == "Test Task"
    assert created_task.description == "Test Description"
    assert created_task.user_id == 1
    assert created_task.is_completed == False

def test_get_task_by_id(session: Session):
    """Test getting a task by ID"""
    # Create a task first
    task_data = TaskBase(
        title="Test Task",
        description="Test Description",
        user_id=1
    )
    created_task = TaskService.create_task(session, task_data)

    # Retrieve the task
    retrieved_task = TaskService.get_task_by_id(session, created_task.id, 1)

    assert retrieved_task is not None
    assert retrieved_task.id == created_task.id
    assert retrieved_task.title == "Test Task"

def test_get_tasks_by_user(session: Session):
    """Test getting all tasks for a user"""
    # Create multiple tasks for the same user
    task_data1 = TaskBase(title="Task 1", user_id=1)
    task_data2 = TaskBase(title="Task 2", user_id=1)
    TaskService.create_task(session, task_data1)
    TaskService.create_task(session, task_data2)

    # Create a task for a different user
    task_data3 = TaskBase(title="Task 3", user_id=2)
    TaskService.create_task(session, task_data3)

    # Get tasks for user 1
    user_tasks = TaskService.get_tasks_by_user(session, 1)

    assert len(user_tasks) == 2
    assert all(task.user_id == 1 for task in user_tasks)

def test_update_task(session: Session):
    """Test updating a task"""
    # Create a task first
    task_data = TaskBase(title="Original Task", user_id=1)
    created_task = TaskService.create_task(session, task_data)

    # Update the task
    updated_data = TaskBase(
        title="Updated Task",
        description="Updated Description",
        is_completed=True,
        user_id=1
    )
    updated_task = TaskService.update_task(session, created_task.id, 1, updated_data)

    assert updated_task.title == "Updated Task"
    assert updated_task.description == "Updated Description"
    assert updated_task.is_completed == True

def test_delete_task(session: Session):
    """Test deleting a task"""
    # Create a task first
    task_data = TaskBase(title="Task to Delete", user_id=1)
    created_task = TaskService.create_task(session, task_data)

    # Verify task exists
    retrieved_task = TaskService.get_task_by_id(session, created_task.id, 1)
    assert retrieved_task is not None

    # Delete the task
    success = TaskService.delete_task(session, created_task.id, 1)
    assert success == True

    # Verify task is deleted
    deleted_task = TaskService.get_task_by_id(session, created_task.id, 1)
    assert deleted_task is None

def test_complete_task(session: Session):
    """Test completing a task"""
    # Create a task first
    task_data = TaskBase(title="Task to Complete", user_id=1)
    created_task = TaskService.create_task(session, task_data)

    # Complete the task
    completed_task = TaskService.complete_task(session, created_task.id, 1, True)

    assert completed_task.is_completed == True
    assert completed_task.completed_at is not None

    # Uncomplete the task
    uncompleted_task = TaskService.complete_task(session, created_task.id, 1, False)

    assert uncompleted_task.is_completed == False
    assert uncompleted_task.completed_at is None