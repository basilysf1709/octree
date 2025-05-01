'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, X, Maximize2, Minimize2, Command } from 'lucide-react';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { EditSuggestion } from '@/types/edit';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface ChatProps {
  onEditSuggestion: (edit: EditSuggestion) => void;
  fileContent: string;
}

export function Chat({ onEditSuggestion, fileContent }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const parseEditSuggestions = (content: string) => {
    const editRegex = /```latex-diff\n([\s\S]*?)\n```/g;
    let match;
    let cleanContent = content;

    while ((match = editRegex.exec(content)) !== null) {
      const diffContent = match[1];
      const lines = diffContent.split('\n');
      let original = '';
      let suggested = '';
      let startLine = 0;
      let lineCount = 0;

      // Find the context in the file
      const contextMatch = diffContent.match(
        /@@\s*-(\d+),(\d+)\s*\+\d+,\d+\s*@@/
      );
      if (contextMatch) {
        startLine = parseInt(contextMatch[1]);
        lineCount = parseInt(contextMatch[2]);
      }

      lines.forEach((line) => {
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
          startLine,
          endLine: startLine + lineCount - 1,
          status: 'pending',
        };
        onEditSuggestion(suggestion);
      }

      // Remove the edit block from displayed content
      cleanContent = cleanContent.replace(match[0], '');
    }

    return cleanContent;
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
  } = useChat({
    api: '/api/octra',
    body: {
      fileContent,
    },
    onFinish: (message) => {
      message.content = parseEditSuggestions(message.content);
    },
  });

  // Keyboard shortcut handler
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
        className="fixed right-4 bottom-4 flex cursor-pointer flex-col items-end space-y-2"
        onClick={() => setIsOpen(true)}
      >
        <div className="text-foreground mb-2 rounded-md border border-blue-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm backdrop-blur-sm">
          Press{' '}
          <kbd className="rounded-sm bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
            ⌘
          </kbd>
          {' + '}
          <kbd className="rounded-sm bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
            B
          </kbd>{' '}
          to edit
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={`fixed right-4 bottom-4 w-96 rounded-md border border-blue-100 bg-white shadow-2xl transition-all duration-200 ${isMinimized ? 'h-15' : 'h-[610px]'}`}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2',
          !isMinimized && 'border-b border-blue-100/50'
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-100/50 p-1.5">
            <OctreeLogo className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Octree</h3>
            <p className="text-xs text-slate-500">LaTeX Assistant</p>
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
            {/* Messages */}
            <div className="scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent h-[480px] overflow-auto p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div>
                    <h3 className="text-md font-semibold text-slate-800">
                      How can I help?
                    </h3>
                    <p className="text-sm text-slate-500">
                      Ask me anything about LaTeX
                    </p>
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
                      ? 'rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 p-3'
                      : 'rounded-lg border border-blue-100 bg-white p-3'
                  }`}
                >
                  <div className="mb-1 text-sm font-medium text-blue-900">
                    {message.role === 'assistant' ? 'Octra' : 'You'}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-blue-800">
                    {message.content
                      .split(/```latex-diff\n[\s\S]*?\n```/g)
                      .map((text, i, array) => (
                        <div key={`message-${message.id}-part-${i}`}>
                          {i === array.length - 1 ? (
                            text
                          ) : (
                            <>
                              {text}
                              {
                                message.content.match(
                                  /```latex-diff\n[\s\S]*?\n```/g
                                )?.[i]
                              }
                            </>
                          )}
                        </div>
                      ))}
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

            {/* Input */}
            <div className="rounded-b-2xl border-t border-blue-100/50 p-4">
              <form onSubmit={originalHandleSubmit} className="relative">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    value={input}
                    type="text"
                    placeholder="Ask about LaTeX..."
                    onChange={handleInputChange}
                  />
                  <Button type="submit" variant="default" disabled={isLoading}>
                    <Send />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
