import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../src/components/tasks/TaskList';
import TaskItem from '../src/components/tasks/TaskItem';
import TaskForm from '../src/components/tasks/TaskForm';
import { Task } from '../src/types/index';

// Mock the API service
jest.mock('../src/services/api', () => ({
  taskApi: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
  },
}));

describe('Task Components', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    is_completed: false,
    priority: 'medium',
    user_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  describe('TaskItem', () => {
    const mockOnUpdate = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnToggleCompletion = jest.fn();

    it('renders task details correctly', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onToggleCompletion={mockOnToggleCompletion}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('calls toggle completion when checkbox is clicked', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onToggleCompletion={mockOnToggleCompletion}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnToggleCompletion).toHaveBeenCalledWith(1, true);
    });

    it('enters edit mode when edit button is clicked', () => {
      render(
        <TaskItem
          task={mockTask}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onToggleCompletion={mockOnToggleCompletion}
        />
      );

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
  });

  describe('TaskForm', () => {
    const mockOnAddTask = jest.fn();

    it('renders form elements correctly', () => {
      render(<TaskForm onAddTask={mockOnAddTask} />);

      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    it('submits form with task data', async () => {
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const titleInput = screen.getByLabelText('Title *');
      const descriptionInput = screen.getByLabelText('Description');
      const prioritySelect = screen.getByLabelText('Priority');
      const submitButton = screen.getByText('Add Task');

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
          due_date: undefined,
          priority: 'high',
        });
      });
    });
  });
});