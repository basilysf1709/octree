'use client'

import { useState, useRef, useEffect } from 'react'
import { Share, FileDown, ChevronDown, FileText, Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import { saveAs } from 'file-saver'
import mammoth from 'mammoth'

interface ExportDropdownProps {
  getContent: () => string
}

export function ExportDropdown({ getContent }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportPDF = async () => {
    const content = getContent()
    const element = document.createElement('div')
    element.innerHTML = content
    element.style.padding = '20px'

    const opt = {
      margin: 1,
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
    setIsOpen(false)
  }

  const handleExportDOCX = () => {
    const content = getContent()
    
    // Convert HTML to DOCX-compatible format
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    saveAs(blob, 'document.docx')
    setIsOpen(false)
  }

  const handleShare = () => {
    // Dummy share functionality
    alert('Sharing functionality will be implemented with Supabase')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        <FileDown size={18} />
        Export
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 w-full p-2 hover:bg-secondary text-left"
          >
            <Share size={18} />
            Share
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 w-full p-2 hover:bg-secondary text-left"
          >
            <FileText size={18} />
            Export as PDF
          </button>
          <button
            onClick={handleExportDOCX}
            className="flex items-center gap-2 w-full p-2 hover:bg-secondary text-left"
          >
            <Download size={18} />
            Export as DOCX
          </button>
        </div>
      )}
    </div>
  )
} 