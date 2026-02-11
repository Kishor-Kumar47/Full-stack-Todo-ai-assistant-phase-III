'use client';

import { useState, useEffect } from 'react';
import { Task, TaskInput } from '../types';
import { isAuthenticated, getAuthToken } from '../services/auth';
import { useRouter } from 'next/navigation';
import Navigation from '../components/layout/Navigation';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  });

  // AI Assistant state
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const router = useRouter();

  // Check if user is authenticated on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a new task
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority || 'medium',
          is_completed: false
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);

      // Reset form
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
      });
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  // Update a task
  const updateTask = async (taskId: number, updatedData: Partial<Task>) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/1/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
    try {
      // For toggling completion, we'll use the update endpoint since the backend doesn't have a specific completion endpoint
      const updatedData = { is_completed: isCompleted };
      await updateTask(taskId, updatedData);
    } catch (err) {
      setError('Failed to update task completion');
      console.error('Error updating task completion:', err);
    }
  };

  // AI Assistant query handler
  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aiQuery.trim()) return;

    const userMessage = aiQuery.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiQuery('');
    setAiLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to query AI assistant');
      }

      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      console.error('Error querying AI:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Navigation />
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
          <p className="text-gray-200">Manage your tasks efficiently</p>
        </header>

        {/* Add Task Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">Add New Task</h2>
          <form onSubmit={addTask} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
                className="w-full px-4 py-2 border bg-green-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description (optional)"
                rows={3}
                className="w-full px-4 py-2 border bg-pink-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 bg-yellow-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-2 border bg-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">Your Tasks</h2>

          {loading ? (
            <p className="text-gray-600">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-600">No tasks yet. Add your first task above!</p>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 ${task.is_completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => toggleTaskCompletion(task.id, !task.is_completed)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 mb-2">{task.description}</p>
                      )}

                      {task.due_date && (
                        <p className="text-sm text-gray-500 mb-2">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newTitle = prompt('Edit task title:', task.title);
                            if (newTitle) updateTask(task.id, { title: newTitle });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Floating Button */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
        aria-label="Toggle AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* AI Assistant Chat Panel */}
      {aiOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">AI Task Assistant</h3>
            <button
              onClick={() => setAiOpen(false)}
              className="hover:bg-purple-700 rounded p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-2">👋 Hi! I'm your AI assistant.</p>
                <p className="text-sm">Ask me about your tasks or request help breaking down complex tasks.</p>
              </div>
            ) : (
              aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleAiQuery} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask me anything..."
                disabled={aiLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
