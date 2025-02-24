'use client'

import { useState, useRef, useEffect } from 'react'
import { Users2, Plus, X } from 'lucide-react'

interface CollaboratorDropdownProps {
  documentId: string
}

type Collaborator = {
  email: string
  status: 'pending' | 'active'
}

export function CollaboratorDropdown({ documentId }: CollaboratorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
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

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && !collaborators.find(c => c.email === email)) {
      setCollaborators([...collaborators, { email, status: 'pending' }])
      setEmail('')
      // This will be replaced with Supabase implementation
      alert(`Invitation sent to ${email}`)
    }
  }

  const handleRemoveCollaborator = (emailToRemove: string) => {
    setCollaborators(collaborators.filter(c => c.email !== emailToRemove))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 hover:bg-secondary rounded"
        title="Manage collaborators"
      >
        <Users2 size={18} />
        {collaborators.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
            {collaborators.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-background border border-border rounded-lg shadow-lg">
          <div className="p-3 border-b border-border">
            <h3 className="font-medium mb-2">Collaborators</h3>
            <form onSubmit={handleAddCollaborator} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Add by email"
                className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
              />
              <button
                type="submit"
                className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

          <div className="p-2 max-h-60 overflow-auto">
            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collaborators yet
              </p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center justify-between p-2 text-sm hover:bg-secondary rounded"
                  >
                    <div>
                      <p>{collaborator.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {collaborator.status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.email)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 