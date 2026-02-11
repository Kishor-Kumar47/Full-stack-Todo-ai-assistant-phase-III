/**
 * Task Breakdown Component
 * Phase III: Display AI-suggested task breakdowns with confirmation
 */

'use client';

import { useState } from 'react';
import aiService from '@/services/aiService';
import { AISuggestion } from '@/types/ai';

interface TaskBreakdownProps {
  interactionId: string;
  suggestions: AISuggestion[];
  onTasksCreated?: (count: number) => void;
}

export default function TaskBreakdown({ interactionId, suggestions, onTasksCreated }: TaskBreakdownProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  // Filter for task breakdown suggestions
  const taskSuggestions = suggestions.filter(s => s.type === 'task_breakdown');

  if (taskSuggestions.length === 0) {
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await aiService.confirmBreakdown(interactionId);
      setSuccess(true);
      setCreatedCount(result.created_tasks);

      // Notify parent component
      if (onTasksCreated) {
        onTasksCreated(result.created_tasks);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Tasks Created Successfully!</h3>
            <div className="mt-2 text-sm text-green-700">
              {createdCount} {createdCount === 1 ? 'task has' : 'tasks have'} been added to your task list.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-3">
          Suggested Task Breakdown
        </h4>

        <div className="space-y-3 mb-4">
          {taskSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{suggestion.title}</h5>
                  {suggestion.description && (
                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  )}
                  {suggestion.rationale && (
                    <p className="text-xs text-purple-600 mt-2 italic">
                      💡 {suggestion.rationale}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating tasks...
            </span>
          ) : (
            `Create these ${taskSuggestions.length} tasks`
          )}
        </button>

        <p className="text-xs text-purple-600 mt-2 text-center">
          This will add {taskSuggestions.length} new {taskSuggestions.length === 1 ? 'task' : 'tasks'} to your task list
        </p>
      </div>
    </div>
  );
}
