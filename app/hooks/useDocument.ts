'use client'

import { useState, useEffect, useRef } from 'react'
import { Document } from '@/types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import debounce from 'lodash/debounce'
import { CONSTANTS } from '@/config/constants'

export function useDocument(id: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()
  const saveCounter = useRef(0)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch initial document
  useEffect(() => {
    async function fetchDocument() {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setDocument(data)
      } catch (err) {
        console.error('Error fetching document:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch document'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  // Debounced save function
  const saveDocument = debounce(async (content: string) => {
    setIsSaving(true)
    try {
      console.log('Saving document...', { id, content }) // Debug log

      const { error: updateError } = await supabase
        .from('documents')
        .update({ content })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating document:', updateError)
        throw updateError
      }

      // Create new version every X saves
      saveCounter.current += 1
      if (saveCounter.current % CONSTANTS.VERSION_SAVE_INTERVAL === 0) {
        const { error: versionError } = await supabase
          .from('versions')
          .insert({
            document_id: id,
            content,
            version_number: Math.floor(saveCounter.current / CONSTANTS.VERSION_SAVE_INTERVAL)
          })

        if (versionError) {
          console.error('Error creating version:', versionError)
          throw versionError
        }
      }

      // Update local state
      setDocument(prev => prev ? { ...prev, content } : null)

    } catch (err) {
      console.error('Error saving document:', err)
      setError(err instanceof Error ? err : new Error('Failed to save document'))
    } finally {
      setIsSaving(false)
    }
  }, CONSTANTS.AUTO_SAVE_DELAY)

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`document_${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${id}`
      }, (payload) => {
        setDocument(current => current ? {
          ...current,
          ...payload.new as Document
        } : null)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [id])

  return {
    document,
    isLoading,
    isSaving,
    error,
    saveDocument
  }
} 