'use client'

import { useEffect, useState } from 'react'

const code = [
  {
    content: '# Project Overview\n\nThis document outlines our approach...',
    version: 'Initial draft'
  },
  {
    content: '# Project Overview\n\nThis document outlines our new approach to project management...',
    version: 'Updated introduction'
  },
  {
    content: '# Project Overview\n\nThis document outlines our new approach to project management.\n\n## Timeline\nQ1 2024: Planning\nQ2 2024: Implementation',
    version: 'Added timeline'
  }
]

export function CodeAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [showVersion, setShowVersion] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let charIndex = 0
    const targetText = code[currentIndex].content

    const typeText = () => {
      if (charIndex <= targetText.length) {
        setCurrentText(targetText.slice(0, charIndex))
        charIndex++
        timeout = setTimeout(typeText, 50)
      } else {
        // Show version tag after typing
        setTimeout(() => {
          setShowVersion(true)
          // Move to next version after a delay
          setTimeout(() => {
            setShowVersion(false)
            setCurrentIndex((prev) => (prev + 1) % code.length)
            charIndex = 0
          }, 2000)
        }, 1000)
      }
    }

    typeText()
    return () => clearTimeout(timeout)
  }, [currentIndex])

  return (
    <div className="relative font-mono text-sm overflow-hidden rounded-lg border border-border bg-secondary/30 backdrop-blur">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
          </div>
          <span className="text-xs text-muted-foreground">document.txt</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[400px] relative">
        <pre className="whitespace-pre-wrap break-words">
          <code>{currentText}</code>
        </pre>

        {/* Version Tag */}
        {showVersion && (
          <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs animate-in fade-in slide-in-from-bottom-2">
            ✓ {code[currentIndex].version}
          </div>
        )}
      </div>
    </div>
  )
} 