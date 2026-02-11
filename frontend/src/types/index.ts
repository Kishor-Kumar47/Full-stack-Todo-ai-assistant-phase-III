
// Define TypeScript types for the Todo application

export interface User {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  user_id: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  is_completed?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}