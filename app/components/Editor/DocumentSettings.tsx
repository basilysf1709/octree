'use client'

import { useState } from 'react'
import { Settings, GitBranch } from 'lucide-react'

interface DocumentSettingsProps {
  onBlameToggle: (enabled: boolean) => void
  showBlame: boolean
}

export function DocumentSettings({ onBlameToggle, showBlame }: DocumentSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-secondary rounded"
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-2">
            <label className="flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer">
              <input
                type="checkbox"
                checked={showBlame}
                onChange={(e) => onBlameToggle(e.target.checked)}
                className="rounded border-border"
              />
              <span className="flex items-center gap-2">
                <GitBranch size={16} />
                Show blame
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
} 