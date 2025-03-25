'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, X, Maximize2, Minimize2, Command, Check, X as XIcon } from 'lucide-react';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { EditSuggestion } from '@/types/edit';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
  onEditSuggestion: (edit: EditSuggestion) => void;
}

export function Chat({ onEditSuggestion }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const parseEditSuggestions = (content: string) => {
    const editRegex = /```latex-diff\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = editRegex.exec(content)) !== null) {
      const diffContent = match[1];
      const lines = diffContent.split('\n');
      let original = '';
      let suggested = '';
      
      lines.forEach(line => {
        if (line.startsWith('-')) {
          original += line.slice(1) + '\n';
        } else if (line.startsWith('+')) {
          suggested += line.slice(1) + '\n';
        }
      });

      if (original || suggested) {
        const suggestion: EditSuggestion = {
          id: uuidv4(),
          original: original.trim(),
          suggested: suggested.trim(),
          startLine: 0, // This will be determined by the editor
          endLine: 0,
          status: 'pending'
        };
        onEditSuggestion(suggestion);
      }
    }
  };

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading } = useChat({
    api: '/api/octra',
    onFinish: (message) => {
      parseEditSuggestions(message.content);
    }
  });

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="fixed bottom-4 right-4 flex flex-col items-end space-y-2"
      >
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-blue-600 shadow-sm border border-blue-100 mb-2">
          Press <kbd className="px-1.5 py-0.5 bg-blue-50 rounded-md text-xs font-mono">⌘</kbd>+<kbd className="px-1.5 py-0.5 bg-blue-50 rounded-md text-xs font-mono">B</kbd> to open
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out"
        >
          <OctreeLogo className="w-6 h-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={`fixed bottom-16 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-blue-100 transition-all duration-200 ${isMinimized ? 'h-14' : 'h-[580px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-100/50">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-blue-100/50 rounded-lg">
            <OctreeLogo className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Octra</h3>
            <p className="text-xs text-blue-500">LaTeX Assistant</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg h-8 w-8 p-0"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Messages */}
            <div className="p-4 h-[480px] overflow-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 bg-blue-50 rounded-full">
                    <Command className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">How can I help?</h3>
                    <p className="text-sm text-blue-600">Ask me anything about LaTeX</p>
                  </div>
                </div>
              )}
              {messages.map((message, i) => (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  key={i}
                  className={`mb-4 ${
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg p-3'
                      : 'bg-white border border-blue-100 rounded-lg p-3'
                  }`}
                >
                  <div className="text-sm font-medium mb-1 text-blue-900">
                    {message.role === 'assistant' ? 'Octra' : 'You'}
                  </div>
                  <div className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content.split(/```latex-diff\n[\s\S]*?\n```/g).map((text, i, array) => {
                      if (i === array.length - 1) return text;
                      const match = message.content.match(/```latex-diff\n[\s\S]*?\n```/g)?.[i];
                      return (
                        <>
                          {text}
                          <div key={i} className="bg-blue-50 rounded-lg p-2 my-2 font-mono text-xs">
                            {match}
                          </div>
                        </>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="bg-blue-50 p-2 rounded-full">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-blue-100/50 p-4 bg-white/50 backdrop-blur-sm rounded-b-2xl">
              <form onSubmit={originalHandleSubmit} className="relative">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about LaTeX..."
                  className="w-full px-4 py-2.5 pr-12 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-blue-900 placeholder-blue-400"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0 rounded-lg"
                >
                  <Send size={14} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 