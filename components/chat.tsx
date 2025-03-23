'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, X, Maximize2, Minimize2 } from 'lucide-react';

export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/octra',
  });

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
      >
        Ask Octra
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-blue-100 transition-all ${isMinimized ? 'h-14' : 'h-[600px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-100">
        <h3 className="font-semibold text-blue-900">Octra - LaTeX Assistant</h3>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-blue-600 hover:text-blue-800">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-blue-600 hover:text-blue-800">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="p-4 h-[480px] overflow-auto">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`mb-4 ${
                  message.role === 'assistant'
                    ? 'bg-blue-50 rounded-lg p-3'
                    : 'bg-white border border-blue-100 rounded-lg p-3'
                }`}
              >
                <div className="text-sm font-semibold mb-1 text-blue-900">
                  {message.role === 'assistant' ? 'Octra' : 'You'}
                </div>
                <div className="text-blue-800">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-blue-100 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about LaTeX..."
                className="flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Send size={18} />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 