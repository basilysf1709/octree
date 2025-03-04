'use client'

import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  isDeleting: boolean
  documentName: string
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  isDeleting,
  documentName,
  onClose,
  onConfirm
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="w-[90vw] max-w-[400px] rounded-lg border bg-card p-6 shadow-lg">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Delete Document</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to delete "{documentName}"? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 