'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot, User, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m Octra, your AI writing assistant. How can I help improve your document?',
      timestamp: new Date()
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setInput('')
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

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
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Octra</h3>
              <p className="text-xs text-muted-foreground">AI Writing Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
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
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
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
                  <div className="w-6 h-6 rounded-full bg-secondary text-foreground flex items-center justify-center flex-shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-2">
                  <Loader2 size={14} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="Add context"
                >
                  <Plus size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-secondary/50 hover:bg-secondary/80 focus:bg-secondary px-4 py-2 rounded-md border border-border focus:border-primary outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Press ⌘ + P to toggle</span>
                <span>↵ to send • Shift + ↵ for new line</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 