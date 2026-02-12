/**
 * AI Task Assistant - Type Definitions
 * Phase III: AI-powered task assistance
 */

export interface AIQuery {
  query: string;
}

export interface AISuggestion {
  type: 'task_breakdown' | 'priority_recommendation';
  title?: string;
  description?: string;
  rationale?: string;
  priority?: 'low' | 'medium' | 'high';
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
}

export interface ConfirmBreakdownResponse {
  created_tasks: number;
  task_ids: string[];
  message: string;
}

export interface AIError {
  detail: string;
}
