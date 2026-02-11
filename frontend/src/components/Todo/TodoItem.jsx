import React, { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);

  const handleToggleComplete = async () => {
    try {
      await onUpdate(todo.id, { is_completed: !todo.is_completed });
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleEdit = async () => {
    try {
      await onUpdate(todo.id, { title: editText });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(todo.id);
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div className={`bg-card p-4 rounded-lg shadow-md ${todo.is_completed ? 'opacity-70' : ''}`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={handleToggleComplete}
          className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 px-3 py-2 bg-dark-700 text-secondary rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <button
                onClick={handleEdit}
                className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(todo.title);
                }}
                className="px-3 py-2 bg-dark-700 text-secondary rounded hover:bg-dark-600 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <h3
                className={`text-lg font-medium ${
                  todo.is_completed ? 'text-muted line-through' : 'text-secondary'
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-muted mt-1">{todo.description}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary-500 hover:text-primary-600 focus:outline-none"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted">
        Created: {new Date(todo.created_at).toLocaleDateString()}
        {todo.updated_at && todo.updated_at !== todo.created_at && (
          <span>, Updated: {new Date(todo.updated_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}