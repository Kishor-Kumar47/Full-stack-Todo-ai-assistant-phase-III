import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../../services/api';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      const newTodo = await createTodo(todoData);
      setTodos([newTodo, ...todos]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTodo = async (id, updatedData) => {
    try {
      const updatedTodo = await updateTodo(id, updatedData);
      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TodoForm onCreateTodo={handleCreateTodo} />

      {todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-lg">No tasks yet. Add your first task above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}