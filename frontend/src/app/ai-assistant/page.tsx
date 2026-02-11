/**
 * AI Assistant Page
 * Phase III: Main page for AI task assistance
 */

'use client';

import { useState } from 'react';
import AIChat from '@/components/AIChat';

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Task Assistant</h1>
            <p className="text-gray-600 mt-2">
              Ask questions about your tasks and get AI-powered insights
            </p>
          </div>

          <AIChat />
        </div>
      </div>
    </div>
  );
}
