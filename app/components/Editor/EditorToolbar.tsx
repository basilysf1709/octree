'use client'

import React, { useState, useCallback } from 'react'
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, Share, Type, ChevronDown, History,
  List, ListOrdered, Heading2, Quote, Code, Link2,
  ImageIcon, Table, Palette
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { ExportDropdown } from './ExportDropdown'
import { CollaboratorDropdown } from './CollaboratorDropdown'

interface EditorToolbarProps {
  onShowSidebar: () => void
  documentId: string
}

type ColorOption = {
  name: string
  color: string
}

const COLORS: ColorOption[] = [
  { name: 'Default', color: 'inherit' },
  { name: 'Gray', color: '#6b7280' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#a855f7' },
]

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onShowSidebar, documentId }) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { theme } = useTheme()

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
  }, [])

  const handleFormat = (format: string, value?: string) => {
    execCommand(format, value)
  }

  const handleLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const handleImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const handleTable = () => {
    const html = `
      <table class="border-collapse border border-border w-full">
        <tr>
          <td class="border border-border p-2">Cell 1</td>
          <td class="border border-border p-2">Cell 2</td>
        </tr>
        <tr>
          <td class="border border-border p-2">Cell 3</td>
          <td class="border border-border p-2">Cell 4</td>
        </tr>
      </table>
    `
    execCommand('insertHTML', html)
  }

  const handleHeading = () => {
    execCommand('formatBlock', '<h2>')
  }

  const handleQuote = () => {
    execCommand('formatBlock', '<blockquote>')
  }

  const handleCodeBlock = () => {
    const html = '<pre><code>// Your code here</code></pre>'
    execCommand('insertHTML', html)
  }

  const getContent = useCallback(() => {
    const editorContent = document.querySelector('[contenteditable]')
    return editorContent?.innerHTML || ''
  }, [])

  return (
    <div className="border-b border-border bg-background sticky top-0 z-10">
      <div className="flex items-center p-2 gap-2 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('underline')}
            title="Underline"
          >
            <Underline size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('justifyRight')}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={() => handleFormat('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={handleHeading}
            title="Heading"
          >
            <Heading2 size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={handleQuote}
            title="Quote"
          >
            <Quote size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={handleCodeBlock}
            title="Code Block"
          >
            <Code size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={handleLink}
            title="Insert Link"
          >
            <Link2 size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={handleImage}
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-secondary rounded"
            onClick={handleTable}
            title="Insert Table"
          >
            <Table size={18} />
          </button>
        </div>

        <div className="relative">
          <button
            className="p-1.5 hover:bg-secondary rounded flex items-center gap-1"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Palette size={18} />
            <ChevronDown size={14} />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-2 w-48">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  className="flex items-center gap-2 w-full p-2 hover:bg-secondary rounded"
                  onClick={() => {
                    handleFormat('foreColor', color.color)
                    setShowColorPicker(false)
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.color }}
                  />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <CollaboratorDropdown documentId={documentId} />

        <button
          onClick={onShowSidebar}
          className="p-1.5 hover:bg-secondary rounded"
          title="Version History"
        >
          <History size={18} />
        </button>

        <ExportDropdown getContent={getContent} />
      </div>
    </div>
  )
} 