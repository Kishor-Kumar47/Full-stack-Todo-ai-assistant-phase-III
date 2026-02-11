/**
 * AI Response Component
 * Phase III: Display AI response with formatting
 */

'use client';

import { AIResponse as AIResponseType } from '@/types/ai';
import TaskBreakdown from './TaskBreakdown';

interface AIResponseProps {
  response: AIResponseType;
  onTasksCreated?: (count: number) => void;
}

export default function AIResponse({ response, onTasksCreated }: AIResponseProps) {
  // Check if this is a priority-related response
  const isPriorityResponse = response.query.toLowerCase().includes('priority') ||
    response.query.toLowerCase().includes('focus') ||
    response.query.toLowerCase().includes('urgent') ||
    response.query.toLowerCase().includes('important') ||
    response.query.toLowerCase().includes('what should i') ||
    response.query.toLowerCase().includes('what next');

  // Highlight urgent/priority keywords in response
  const highlightPriorityText = (text: string) => {
    if (!isPriorityResponse) return text;

    const priorityKeywords = [
      'high priority',
      'urgent',
      'overdue',
      'critical',
      'important',
      'due soon',
      'deadline'
    ];

    let highlightedText = text;
    priorityKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<span class="font-semibold text-orange-600 bg-orange-50 px-1 rounded">$1</span>'
      );
    });

    return highlightedText;
  };

  return (
    <div className={`border rounded-lg p-6 ${isPriorityResponse ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className={`h-6 w-6 ${isPriorityResponse ? 'text-orange-600' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isPriorityResponse ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            )}
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-lg font-medium mb-2 ${isPriorityResponse ? 'text-orange-900' : 'text-blue-900'}`}>
            {isPriorityResponse ? 'Priority Advisor' : 'AI Assistant'}
          </h3>

          {/* Query */}
          <div className="mb-4">
            <p className={`text-sm font-medium ${isPriorityResponse ? 'text-orange-800' : 'text-blue-800'}`}>Your question:</p>
            <p className={`text-sm italic mt-1 ${isPriorityResponse ? 'text-orange-700' : 'text-blue-700'}`}>{response.query}</p>
          </div>

          {/* Response */}
          <div className={`rounded-lg p-4 border ${isPriorityResponse ? 'bg-white border-orange-100' : 'bg-white border-blue-100'}`}>
            <div
              className="text-gray-800 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightPriorityText(response.response) }}
            />
          </div>

          {/* Timestamp */}
          <div className={`mt-3 text-xs ${isPriorityResponse ? 'text-orange-600' : 'text-blue-600'}`}>
            {new Date(response.timestamp).toLocaleString()}
          </div>

          {/* Task Breakdown Suggestions */}
          {response.suggestions && response.suggestions.length > 0 && (
            <TaskBreakdown
              interactionId={response.interaction_id}
              suggestions={response.suggestions}
              onTasksCreated={onTasksCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
