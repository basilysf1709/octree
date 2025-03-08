'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, Share, Type, ChevronDown, History,
  List, ListOrdered, Heading2, Quote, Link2,
  ImageIcon, Palette
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const selectedTextRef = useRef('')
  const selectedRangeRef = useRef<Range | null>(null)

  const execCommand = useCallback((command: string, value?: string) => {
    // @ts-ignore - execCommand is still widely supported despite deprecation
    document.execCommand(command, false, value)
  }, [])

  const buttonClass = 'p-1.5 hover:bg-secondary rounded'

  const handleHeadingClick = useCallback(() => {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return

    const range = selection.getRangeAt(0)
    const parentElement = range.commonAncestorContainer.parentElement

    if (parentElement?.tagName.match(/^H[1-6]$/)) {
      document.execCommand('formatBlock', false, 'p')
    } else {
      document.execCommand('formatBlock', false, 'h1')
    }
  }, [])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Please upload a JPG or PNG image')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      document.execCommand('insertImage', false, event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleLinkClick = () => {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return

    // Store both the selected text and the range
    selectedRangeRef.current = selection.getRangeAt(0).cloneRange()
    selectedTextRef.current = selection.toString()
    setLinkText(selectedTextRef.current)
    setShowLinkDialog(true)
  }

  const handleInsertLink = () => {
    if (!linkUrl) return
    
    // Restore the selection
    const selection = window.getSelection()
    if (selection && selectedRangeRef.current) {
      selection.removeAllRanges()
      selection.addRange(selectedRangeRef.current)
      
      // Add http:// if no protocol is specified
      const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
        ? linkUrl
        : `https://${linkUrl}`
      
      if (linkText) {
        document.execCommand('insertHTML', false, 
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
        )
      } else {
        document.execCommand('createLink', false, url)
        // Make the link open in new tab
        const link = selection.anchorNode?.parentElement
        if (link?.tagName === 'A') {
          link.setAttribute('target', '_blank')
          link.setAttribute('rel', 'noopener noreferrer')
        }
      }
    }
    
    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  return (
    <div className="border-b border-border bg-background sticky top-0 z-10">
      <div className="flex items-center p-2 gap-2 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button className={buttonClass} onClick={() => execCommand('bold')} title="Bold">
            <Bold size={18} />
          </button>
          <button className={buttonClass} onClick={() => execCommand('italic')} title="Italic">
            <Italic size={18} />
          </button>
          <button className={buttonClass} onClick={() => execCommand('underline')} title="Underline">
            <Underline size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button className={buttonClass} onClick={() => execCommand('justifyLeft')} title="Align Left">
            <AlignLeft size={18} />
          </button>
          <button className={buttonClass} onClick={() => execCommand('justifyCenter')} title="Align Center">
            <AlignCenter size={18} />
          </button>
          <button className={buttonClass} onClick={() => execCommand('justifyRight')} title="Align Right">
            <AlignRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button className={buttonClass} onClick={handleHeadingClick} title="Heading">
            <span className="text-lg">H</span>
          </button>
          <button className={buttonClass} onClick={() => execCommand('formatBlock', '<blockquote>')} title="Quote">
            <Quote size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button className={buttonClass} onClick={handleLinkClick} title="Insert Link">
            <Link2 size={18} />
          </button>
          <button className={buttonClass} onClick={handleImageClick} title="Upload Image">
            <ImageIcon size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            onChange={handleImageUpload}
          />
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
                    execCommand('foreColor', color.color)
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

        <div className="flex items-center gap-1 border-r border-border pr-2">
          <button className={buttonClass} onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            <List size={18} />
          </button>
          <button className={buttonClass} onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            <ListOrdered size={18} />
          </button>
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

        <ExportDropdown getContent={() => document.querySelector('[contenteditable]')?.innerHTML || ''} />
      </div>

      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg shadow-lg w-[400px]">
            <h3 className="font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Link URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2 rounded border border-border bg-secondary/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full p-2 rounded border border-border bg-secondary/50"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-3 py-1.5 rounded hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertLink}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 