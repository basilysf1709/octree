'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

const editorStates = [
  {
    content: '# Project Overview\n\nOur team is building a new system for handling large-scale data processing...',
    phase: 'writing',
    editedContent: null,
    showAccept: false,
    statusMessage: 'Writing initial content...'
  },
  {
    content: '# Project Overview\n\nOur team is building a new system for handling large-scale data processing...',
    phase: 'ai_thinking',
    editedContent: null,
    showAccept: false,
    statusMessage: 'AI Assistant is analyzing your content...'
  },
  {
    content: '# Project Overview\n\nOur team is building a new system for handling large-scale data processing...',
    phase: 'ai_editing',
    editedContent: 'Our team is developing an innovative solution for processing and analyzing large-scale data with unprecedented efficiency and reliability',
    editRange: { start: 24, end: 90 },
    showAccept: false,
    statusMessage: 'AI Assistant is improving the writing...'
  },
  {
    content: '# Project Overview\n\nOur team is developing an innovative solution for processing and analyzing large-scale data with unprecedented efficiency and reliability...',
    phase: 'show_accept',
    editedContent: null,
    showAccept: true,
    statusMessage: 'Auto-saving changes...'
  },
  {
    content: '# Project Overview\n\nOur team is developing an innovative solution for processing and analyzing large-scale data with unprecedented efficiency and reliability...',
    phase: 'complete',
    editedContent: null,
    showAccept: false,
    statusMessage: 'Document saved'
  }
]

export function CodeAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const currentState = editorStates[currentIndex]

    switch (currentState.phase) {
      case 'writing':
        let charIndex = 0
        const typeText = () => {
          if (charIndex <= currentState.content.length) {
            setCurrentText(currentState.content.slice(0, charIndex))
            charIndex++
            timeout = setTimeout(typeText, 30)
          } else {
            setIsTyping(false)
            setTimeout(() => {
              setCurrentIndex(prev => prev + 1)
            }, 1000)
          }
        }
        typeText()
        break

      case 'ai_thinking':
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
        }, 2000)
        break

      case 'ai_editing':
        if (currentState.editedContent && currentState.editRange) {
          const { start, end } = currentState.editRange
          let editCharIndex = 0
          const typeEdit = () => {
            if (editCharIndex <= currentState.editedContent.length) {
              const newText = 
                currentState.content.slice(0, start) +
                currentState.editedContent.slice(0, editCharIndex) +
                currentState.content.slice(end)
              setCurrentText(newText)
              editCharIndex++
              timeout = setTimeout(typeEdit, 30)
            } else {
              setTimeout(() => {
                setCurrentIndex(prev => prev + 1)
              }, 1000)
            }
          }
          typeEdit()
        }
        break

      case 'show_accept':
        setCurrentText(currentState.content)
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
        }, 2000)
        break

      case 'complete':
        setCurrentText(currentState.content)
        break
    }

    return () => clearTimeout(timeout)
  }, [currentIndex])

  const renderText = () => {
    const currentState = editorStates[currentIndex]
    if (currentState.phase !== 'ai_editing' && !currentState.showAccept) {
      return currentText
    }

    if (currentState.editRange) {
      const { start, end } = currentState.editRange
      return (
        <>
          {currentText.slice(0, start)}
          <span className="text-green-500 dark:text-green-400">
            {currentText.slice(start, currentText.length - (currentState.content.length - end))}
          </span>
          {currentText.slice(currentText.length - (currentState.content.length - end))}
        </>
      )
    }

    return currentText
  }

  return (
    <div className="relative rounded-lg border border-border overflow-hidden bg-background shadow-2xl">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-background/50">
        <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm">
          document.txt
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {editorStates[currentIndex].statusMessage}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-6 min-h-[400px] relative">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="font-mono whitespace-pre-wrap">{renderText()}</div>
        </div>

        {/* AI Thinking Indicator */}
        {editorStates[currentIndex].phase === 'ai_thinking' && (
          <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm">
            <div className="w-2 h-4 bg-primary animate-pulse" />
            AI Assistant is analyzing your content to suggest improvements...
          </div>
        )}

        {/* AI Editing Indicator */}
        {editorStates[currentIndex].phase === 'ai_editing' && (
          <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm">
            <div className="w-2 h-4 bg-primary animate-pulse" />
            AI Assistant is enhancing your writing for clarity and impact...
          </div>
        )}

        {/* Accept Changes Dialog */}
        {editorStates[currentIndex].showAccept && (
          <div className="absolute bottom-4 right-6 flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-2">
            <Check size={16} />
            AI improvements applied successfully
          </div>
        )}
      </div>
    </div>
  )
} 