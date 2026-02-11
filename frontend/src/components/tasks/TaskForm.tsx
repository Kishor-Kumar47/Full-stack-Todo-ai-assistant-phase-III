import React, { useState } from 'react';
import { TaskInput } from '../../types';

interface TaskFormProps {
  onAddTask: (taskData: TaskInput) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    // Call the parent function to add the task
    onAddTask({
      title: formData.title,
      description: formData.description || undefined,
      due_date: formData.due_date || undefined,
      priority: formData.priority,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
    });
  };

  return (
    <div className="task-form-container">
      <h3>Add New Task</h3>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button type="submit" className="submit-button">Add Task</button>
      </form>
    </div>
  );
};

export default TaskForm;