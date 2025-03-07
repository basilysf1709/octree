'use client'

import { useRef, useState, useEffect } from 'react'
import { Bot, MessageSquare, Send, User, X } from 'lucide-react'
import { Message, useChat } from 'ai/react'
import { cn } from '@/lib/utils'

interface AIChatbotProps {
  documentContent: string;
  onUpdateContent: (newContent: string) => void;
}

export function AIChatbot({ documentContent, onUpdateContent }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai',
    body: {
      documentContent
    },
    onFinish: (message: Message) => {
      // Check if the response contains document edits
      if (message.content.includes('EDIT_DOCUMENT:')) {
        const newContent = message.content.split('EDIT_DOCUMENT:')[1].trim()
        onUpdateContent(newContent)
      }
    }
  })

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 z-50 transition-all duration-200 hover:scale-105"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-xl flex flex-col z-50">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Helping improve your document</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-secondary rounded-md"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 text-sm",
                  message.role === 'assistant' ? "justify-start" : "justify-end"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 max-w-[80%]",
                    message.role === 'assistant' 
                      ? "bg-secondary" 
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <User size={14} className="text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask AI to help improve your document..."
                className="flex-1 bg-secondary/50 hover:bg-secondary/80 focus:bg-secondary px-4 py-2 rounded-md border border-border focus:border-primary outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>Press ⌘ + P to toggle</span>
              <span>↵ to send</span>
            </div>
          </form>
        </div>
      )}
    </>
  )
} 