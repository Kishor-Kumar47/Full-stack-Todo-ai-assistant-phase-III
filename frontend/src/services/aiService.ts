/**
 * AI Task Assistant - API Service
 * Phase III: Client for AI endpoints
 */

import axios, { AxiosError } from 'axios';
import {
  AIQuery,
  AIResponse,
  AIHistoryResponse,
  ConfirmBreakdownRequest,
  ConfirmBreakdownResponse,
  AIError
} from '../types/ai';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Submit a query to the AI assistant
 */
export const query = async (queryText: string): Promise<AIResponse> => {
  try {
    const response = await axios.post<AIResponse>(
      `${API_BASE_URL}/api/ai/query`,
      { query: queryText } as AIQuery,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AIError>;
    throw new Error(axiosError.response?.data?.detail || 'Failed to query AI assistant');
  }
};

/**
 * Get AI interaction history
 */
export const getHistory = async (
  limit: number = 10,
  offset: number = 0
): Promise<AIHistoryResponse> => {
  try {
    const response = await axios.get<AIHistoryResponse>(
      `${API_BASE_URL}/api/ai/history`,
      {
        params: { limit, offset },
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AIError>;
    throw new Error(axiosError.response?.data?.detail || 'Failed to fetch AI history');
  }
};

/**
 * Confirm and create tasks from AI breakdown suggestions
 */
export const confirmBreakdown = async (
  request: ConfirmBreakdownRequest
): Promise<ConfirmBreakdownResponse> => {
  try {
    const response = await axios.post<ConfirmBreakdownResponse>(
      `${API_BASE_URL}/api/ai/confirm-breakdown`,
      request,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AIError>;
    throw new Error(axiosError.response?.data?.detail || 'Failed to create tasks from breakdown');
  }
};

/**
 * Check if AI service is available
 */
export const checkAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE_URL}/api/ai/health`, {
      headers: getAuthHeaders(),
      timeout: 5000
    });
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  query,
  getHistory,
  confirmBreakdown,
  checkAvailability
};
