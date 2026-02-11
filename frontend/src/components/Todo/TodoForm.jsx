import React, { useState } from 'react';

export default function TodoForm({ onCreateTodo }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    setIsSubmitting(true);

    try {
      await onCreateTodo({
        title: formData.title,
        description: formData.description
      });

      setFormData({
        title: '',
        description: ''
      });
    } catch (err) {
      console.error('Error creating todo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-secondary mb-4">Add New Task</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-muted mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-dark-700 text-secondary rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="What needs to be done?"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 bg-dark-700 text-secondary rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add details about this task..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding Task...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}