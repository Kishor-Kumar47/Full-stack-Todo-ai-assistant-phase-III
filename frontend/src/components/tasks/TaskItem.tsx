import React, { useState } from 'react';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: number, updatedData: Partial<Task>) => void;
  onDelete: (taskId: number) => void;
  onToggleCompletion: (taskId: number, isCompleted: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete, onToggleCompletion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedPriority, setEditedPriority] = useState(task.priority);

  const handleSave = () => {
    onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setEditedPriority(task.priority);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleToggleCompletion = () => {
    onToggleCompletion(task.id, !task.is_completed);
  };

  return (
    <div className={`task-item ${task.is_completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="task-title-input"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="task-description-input"
          />
          <select
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="task-priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="task-edit-buttons">
            <button onClick={handleSave} className="save-button">Save</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-header">
            <input
              type="checkbox"
              checked={task.is_completed}
              onChange={handleToggleCompletion}
              className="task-completion-checkbox"
            />
            <h3 className="task-title">{task.title}</h3>
            <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
            <button onClick={handleDelete} className="delete-button">Delete</button>
          </div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          {task.due_date && (
            <p className="task-due-date">Due: {new Date(task.due_date).toLocaleDateString()}</p>
          )}
          <p className="task-timestamps">
            Created: {new Date(task.created_at).toLocaleString()} |
            Updated: {new Date(task.updated_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskItem;