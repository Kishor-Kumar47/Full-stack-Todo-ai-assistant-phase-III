/**
 * AI Chat Component
 * Phase III: Chat interface for AI interactions
 */

'use client';

import { useState } from 'react';
import aiService from '@/services/aiService';
import { AIResponse as AIResponseType } from '@/types/ai';
import AIResponse from './AIResponse';

export default function AIChat() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AIResponseType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [tasksCreatedMessage, setTasksCreatedMessage] = useState<string | null>(null);

  const handleTasksCreated = (count: number) => {
    setTasksCreatedMessage(`✓ ${count} ${count === 1 ? 'task has' : 'tasks have'} been added to your task list!`);
    // Clear message after 5 seconds
    setTimeout(() => setTasksCreatedMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    if (query.length > 1000) {
      setError('Question is too long (maximum 1000 characters)');
      return;
    }

    setLoading(true);
    setError(null);
    setAiUnavailable(false);
    setResponse(null);

    try {
      const result = await aiService.query(query);
      setResponse(result);
      setQuery(''); // Clear input after successful query
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get AI response';
      setError(errorMessage);

      // Check for specific error types
      if (errorMessage.includes('503') || errorMessage.includes('unavailable')) {
        setAiUnavailable(true);
      } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        setError('Rate limit exceeded. Please wait a minute before trying again.');
      } else if (errorMessage.includes('504') || errorMessage.includes('timeout')) {
        setError('Request timed out. Please try again with a simpler question.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success notification for created tasks */}
      {tasksCreatedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800">{tasksCreatedMessage}</p>
          </div>
        </div>
      )}

      {/* Query Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Ask about your tasks
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are my high priority tasks? What's due this week?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={loading}
            maxLength={1000}
          />
          <div className="text-sm text-gray-500 mt-1">
            {query.length}/1000 characters
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Ask AI'
          )}
        </button>
      </form>

      {/* Error Messages */}
      {error && (
        <div className={`p-4 rounded-lg ${aiUnavailable ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {aiUnavailable ? (
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${aiUnavailable ? 'text-yellow-800' : 'text-red-800'}`}>
                {aiUnavailable ? 'AI Assistant Temporarily Unavailable' : 'Error'}
              </h3>
              <div className={`mt-2 text-sm ${aiUnavailable ? 'text-yellow-700' : 'text-red-700'}`}>
                {error}
              </div>
              {aiUnavailable && (
                <div className="mt-2 text-sm text-yellow-700">
                  Don't worry - you can still manage your tasks normally. The AI assistant will be back soon.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Response */}
      {response && <AIResponse response={response} onTasksCreated={handleTasksCreated} />}
    </div>
  );
}
