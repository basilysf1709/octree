'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/types'

export function useDocument(id: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Will be implemented with Supabase
  const saveDocument = async (content: string) => {
    // Implementation
  }

  return {
    document,
    isLoading,
    error,
    saveDocument
  }
} 