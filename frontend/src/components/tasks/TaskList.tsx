import React, { useState, useEffect } from 'react';
import { taskApi } from '../../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { Task, TaskInput } from '../../types';

interface TaskListProps {
  userId: number;
}

const TaskList: React.FC<TaskListProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks for the user
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getTasks(userId);
        setTasks(response.data);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // Add a new task
  const addTask = async (taskData: TaskInput) => {
    try {
      const taskWithCompletion = {
        ...taskData,
        is_completed: taskData.is_completed ?? false
      };
      const response = await taskApi.createTask(userId, taskWithCompletion);
      setTasks([...tasks, response.data]);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  // Update a task
  const updateTask = async (taskId: number, updatedData: Partial<Task>) => {
    try {
      const response = await taskApi.updateTask(userId, taskId, updatedData);
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: number) => {
    try {
      await taskApi.deleteTask(userId, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
    try {
      const response = await taskApi.completeTask(userId, taskId, isCompleted);
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
    } catch (err) {
      setError('Failed to update task completion status');
      console.error('Error updating task completion:', err);
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="task-list-container">
      <h2>Your Tasks</h2>
      <TaskForm onAddTask={addTask} />
      <div className="tasks">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onToggleCompletion={toggleTaskCompletion}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;