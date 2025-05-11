'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, X, Maximize2, Minimize2, ArrowUp } from 'lucide-react';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { EditSuggestion } from '@/types/edit';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

interface ChatProps {
  onEditSuggestion: (edit: EditSuggestion) => void;
  fileContent: string;
  textForInput: string | null;
  onInputSet: () => void;
}

export function Chat({
  onEditSuggestion,
  fileContent,
  textForInput,
  onInputSet,
}: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const parseEditSuggestions = (content: string): string => {
    const editRegex = /```latex-diff\n([\s\S]*?)\n```/g;
    let match;
    let cleanContent = content;

    while ((match = editRegex.exec(content)) !== null) {
      const diffBlockContent = match[1];
      const lines = diffBlockContent.trim().split('\n');

      let originalContent = '';
      let suggestedContent = '';
      let referenceStartLine = 0;
      let referenceOriginalCount = 0;
      let referenceNewStartLine = 0;
      let referenceNewCount = 0;

      const headerMatch = lines[0]?.match(
        /@@\s*-(\d+)(?:,(\d+))?\s*\+(\d+)(?:,(\d+))?\s*@@/
      );

      if (headerMatch) {
        referenceStartLine = parseInt(headerMatch[1], 10);
        referenceOriginalCount = headerMatch[2]
          ? parseInt(headerMatch[2], 10)
          : 0;
        referenceNewStartLine = parseInt(headerMatch[3], 10);
        referenceNewCount = headerMatch[4] ? parseInt(headerMatch[4], 10) : 0;
        console.log('Reference Start Line:', referenceStartLine);
        console.log('Reference Original Count:', referenceOriginalCount);
        console.log('Reference New Start Line:', referenceNewStartLine);
        console.log('Reference New Count:', referenceNewCount);

        let actualOriginalLineCount = 0;
        let firstChangeIndex = -1;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const lineContent = line.slice(1);

          if (line.startsWith('-')) {
            originalContent += lineContent + '\n';
            actualOriginalLineCount++;
            if (firstChangeIndex === -1) {
              firstChangeIndex = i - 1;
            }
          } else if (line.startsWith('+')) {
            suggestedContent += lineContent + '\n';
            if (firstChangeIndex === -1) {
              firstChangeIndex = i - 1;
            }
          } else if (line.startsWith(' ')) {
            // Context line - important for finding the *real* start line
            // If we haven't found a change yet, this context line pushes the start further
            // No action needed here for count, but helps visualize firstChangeIndex logic
          } else if (line.trim() !== '') {
            console.warn("Diff line doesn't start with space, +, or -:", line);
          }
        }

        const correctedStartLine =
          firstChangeIndex !== -1
            ? referenceStartLine + firstChangeIndex
            : referenceStartLine;

        originalContent = originalContent.replace(/\n$/, '');
        suggestedContent = suggestedContent.replace(/\n$/, '');

        if (originalContent || suggestedContent) {
          const suggestion: EditSuggestion = {
            id: uuidv4(),
            original: originalContent,
            suggested: suggestedContent,
            startLine: correctedStartLine,
            originalLineCount: actualOriginalLineCount,
            status: 'pending',
          };
          console.log('Parsed Suggestion (Recalculated):', suggestion);
          onEditSuggestion(suggestion);
        }
      } else {
        console.warn('Could not parse diff header:', lines[0]);
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
    setMessages,
    setInput,
  } = useChat({
    api: '/api/octra',
    body: {
      fileContent: fileContent,
    },
    onFinish(message) {
      const cleanedContent = parseEditSuggestions(message.content);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, content: cleanedContent } : m
        )
      );
    },
  });

  useEffect(() => {
    if (textForInput) {
      setInput(textForInput);

      if (!isOpen) {
        setIsOpen(true);
      }

      if (isMinimized) {
        setIsMinimized(false);
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      onInputSet();
    }
  }, [textForInput, setInput, onInputSet, isOpen, isMinimized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        const target = e.target as HTMLElement;

        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.closest('.monaco-editor')
        ) {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
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
        className="fixed right-4 bottom-4 z-20 flex cursor-pointer flex-col items-end space-y-2"
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
          to chat
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={cn(
        'fixed right-4 bottom-4 z-20 w-96 rounded-md border border-blue-100 bg-white shadow-2xl transition-all duration-200',
        isMinimized ? 'h-15' : 'h-[610px]'
      )}
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
            <div className="scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent h-[440px] overflow-auto p-4">
              {messages.length === 0 && !isLoading && (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div>
                    <h3 className="text-md font-semibold text-slate-800">
                      How can I help?
                    </h3>
                    <p className="text-sm text-slate-500">
                      Ask about LaTeX or select text & press ⌘B to improve.
                    </p>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  key={message.id}
                  className={`mb-4 break-words whitespace-pre-wrap ${
                    message.role === 'assistant'
                      ? 'rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 p-3'
                      : 'rounded-lg border border-blue-100 bg-white p-3'
                  }`}
                >
                  <div className="mb-1 text-sm font-medium text-blue-900">
                    {message.role === 'assistant' ? 'Octra' : 'You'}
                  </div>
                  <div className="text-sm leading-relaxed text-blue-800">
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-2"
                >
                  <div className="rounded-full bg-blue-50 p-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="px-2">
              <form
                onSubmit={originalHandleSubmit}
                className="relative flex w-full flex-col items-end rounded-md border p-1"
              >
                <Textarea
                  ref={inputRef}
                  value={input}
                  placeholder="Prompt to edit your document..."
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      originalHandleSubmit(e);
                    }
                  }}
                  className="scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent h-[70px] resize-none border-none px-1 shadow-none focus-visible:ring-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="default"
                  disabled={isLoading}
                  className="size-6 rounded-full"
                >
                  <ArrowUp />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
