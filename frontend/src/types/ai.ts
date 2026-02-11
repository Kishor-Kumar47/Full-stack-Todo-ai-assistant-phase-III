/**
 * AI Task Assistant - Type Definitions
 * Phase III: AI-powered task assistance
 */

export interface AIQuery {
  query: string;
}

export interface AISuggestion {
  type: 'task_breakdown' | 'priority_recommendation';
  tasks?: Array<{
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
}

export interface AIResponse {
  interaction_id: string;
  query: string;
  response: string;
  timestamp: string;
  suggestions: AISuggestion[];
}

export interface AIInteraction {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed' | 'timeout';
}

export interface AIHistoryResponse {
  interactions: AIInteraction[];
  total: number;
}

export interface ConfirmBreakdownRequest {
  interaction_id: string;
  tasks: Array<{
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
  }>;
}

export interface ConfirmBreakdownResponse {
  message: string;
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    priority: string;
    is_completed: boolean;
    created_at: string;
  }>;
}

export interface AIError {
  detail: string;
}
