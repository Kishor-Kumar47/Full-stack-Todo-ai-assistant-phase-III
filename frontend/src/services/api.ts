import axios, { AxiosResponse } from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

// Base API URL - should be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // Use the auth service to get the token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear token and potentially redirect
      removeAuthToken();
      // Optionally redirect to login page, but don't do it automatically in interceptor
      // as it might interfere with specific error handling in components
    }
    return Promise.reject(error);
  }
);

// Task API functions
export const taskApi = {
  // Get all tasks for a user
  getTasks: async (userId: number): Promise<AxiosResponse> => {
    return apiClient.get(`/${userId}/tasks`);
  },

  // Create a new task
  createTask: async (userId: number, taskData: any): Promise<AxiosResponse> => {
    return apiClient.post(`/${userId}/tasks`, taskData);
  },

  // Get a specific task
  getTask: async (userId: number, taskId: number): Promise<AxiosResponse> => {
    return apiClient.get(`/${userId}/tasks/${taskId}`);
  },

  // Update a task
  updateTask: async (userId: number, taskId: number, taskData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/${userId}/tasks/${taskId}`, taskData);
  },

  // Delete a task
  deleteTask: async (userId: number, taskId: number): Promise<AxiosResponse> => {
    return apiClient.delete(`/${userId}/tasks/${taskId}`);
  },

  // Complete/incomplete a task
  completeTask: async (userId: number, taskId: number, isCompleted: boolean): Promise<AxiosResponse> => {
    return apiClient.patch(`/${userId}/tasks/${taskId}/complete`, { isCompleted });
  },
};

export default apiClient;