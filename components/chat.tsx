'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, X, Maximize2, Minimize2, Command } from 'lucide-react';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { EditSuggestion } from '@/types/edit';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
  onEditSuggestion: (edit: EditSuggestion) => void;
  fileContent: string;
}

export function Chat({ onEditSuggestion, fileContent }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const parseEditSuggestions = (content: string): string => {
    const editRegex = /```latex-diff\n([\s\S]*?)\n```/g;
    let match;
    let cleanContent = content;

    while ((match = editRegex.exec(content)) !== null) {
      const diffBlockContent = match[1];
      const lines = diffBlockContent.split('\n');

      let originalContent = '';
      let suggestedContent = '';
      let startLine = 0;
      let originalLineCount = 0;

      const headerMatch = lines[0]?.match(
        /@@\s*-(\d+)(?:,(\d+))?\s*\+(\d+)(?:,(\d+))?\s*@@/
      );

      if (headerMatch) {
        startLine = parseInt(headerMatch[1], 10);
        originalLineCount = headerMatch[2] ? parseInt(headerMatch[2], 10) : 1;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('-')) {
            originalContent += line.slice(1) + '\n';
          } else if (line.startsWith('+')) {
            suggestedContent += line.slice(1) + '\n';
          }
        }

        originalContent = originalContent.replace(/\n$/, '');
        suggestedContent = suggestedContent.replace(/\n$/, '');

        if (originalContent || suggestedContent) {
          const suggestion: EditSuggestion = {
            id: uuidv4(),
            original: originalContent,
            suggested: suggestedContent,
            startLine: startLine,
            originalLineCount: originalLineCount,
            status: 'pending',
          };
          onEditSuggestion(suggestion);
        }
      } else {
        console.warn("Could not parse diff header:", lines[0]);
      }

      cleanContent = cleanContent.replace(match[0], '');
    }

    return cleanContent.trim();
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages
  } = useChat({
    api: '/api/octra',
    body: {
      fileContent,
    },
    onFinish: (message) => {
      const cleanedContent = parseEditSuggestions(message.content);

      setMessages(prevMessages => prevMessages.map(m =>
        m.id === message.id ? { ...m, content: cleanedContent } : m
      ));
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
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
        className="fixed right-4 bottom-4 flex flex-col items-end space-y-2"
      >
        <div className="mb-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-sm text-blue-600 shadow-sm backdrop-blur-sm">
          Press{' '}
          <kbd className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-xs">
            ⌘
          </kbd>
          +
          <kbd className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-xs">
            B
          </kbd>{' '}
          to open
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-blue-600 p-4 text-white shadow-lg transition-all duration-200 ease-in-out hover:bg-blue-700 hover:shadow-xl"
        >
          <OctreeLogo className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={`fixed right-4 bottom-16 w-96 rounded-2xl border border-blue-100 bg-white shadow-2xl transition-all duration-200 ${isMinimized ? 'h-14' : 'h-[580px]'}`}
    >
      <div className="flex items-center justify-between border-b border-blue-100/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-100/50 p-1.5">
            <OctreeLogo className="h-5 w-5 text-blue-600" />
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
            className="h-8 w-8 rounded-lg p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-lg p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
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
            <div className="scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent h-[480px] overflow-auto p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="rounded-full bg-blue-50 p-4">
                    <Command className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      How can I help?
                    </h3>
                    <p className="text-sm text-blue-600">
                      Ask me anything about LaTeX
                    </p>
                  </div>
                </div>
              )}
              {messages.map((message, i) => (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  key={message.id}
                  className={`mb-4 ${
                    message.role === 'assistant'
                      ? 'rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 p-3'
                      : 'rounded-lg border border-blue-100 bg-white p-3'
                  }`}
                >
                  <div className="mb-1 text-sm font-medium text-blue-900">
                    {message.role === 'assistant' ? 'Octra' : 'You'}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-blue-800">
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="rounded-full bg-blue-50 p-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="rounded-b-2xl border-t border-blue-100/50 bg-white/50 p-4 backdrop-blur-sm">
              <form onSubmit={originalHandleSubmit} className="relative">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about LaTeX..."
                  className="focus:ring-opacity-50 w-full rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2.5 pr-12 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="absolute top-1 right-1 h-8 w-8 rounded-lg bg-blue-600 p-0 text-white hover:bg-blue-700"
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
