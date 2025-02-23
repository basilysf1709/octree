'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! How can I help you with your document?' },
    { role: 'user', content: 'Can you help me improve this paragraph?' },
    { role: 'assistant', content: 'Of course! I can help you refine the content, improve clarity, or suggest better phrasing.' }
  ])

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
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-background border border-border rounded-lg shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-secondary rounded"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'assistant'
                      ? 'bg-secondary'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask anything..."
                className="flex-1 bg-secondary px-3 py-2 rounded-md"
              />
              <button className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press ⌘ + P to toggle AI assistant
            </p>
          </div>
        </div>
      )}
    </>
  )
} 