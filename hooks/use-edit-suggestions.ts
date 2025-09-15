'use client';

import { useState, useRef, useEffect } from 'react';
import { EditSuggestion } from '@/types/edit';
import type * as Monaco from 'monaco-editor';
import { toast } from 'sonner';

export interface EditSuggestionsState {
  editSuggestions: EditSuggestion[];
  decorationIds: string[];
  setDecorationIds: (ids: string[]) => void;
  suggestionQueueRef: React.MutableRefObject<EditSuggestion[]>;
  handleEditSuggestion: (suggestion: EditSuggestion | string) => void;
  handleAcceptEdit: (suggestionId: string) => Promise<void>;
  handleRejectEdit: (suggestionId: string) => void;
  handleNextSuggestion: () => void;
}

interface UseEditSuggestionsProps {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  monacoInstance: typeof Monaco | null;
}

export function useEditSuggestions({
  editor,
  monacoInstance,
}: UseEditSuggestionsProps): EditSuggestionsState {
  const [editSuggestions, setEditSuggestions] = useState<EditSuggestion[]>([]);
  const [decorationIds, setDecorationIds] = useState<string[]>([]);
  const suggestionQueueRef = useRef<EditSuggestion[]>([]);

  const handleEditSuggestion = (suggestion: EditSuggestion | string) => {
    // Accept both object and stringified suggestion
    let parsedSuggestion: EditSuggestion;
    if (typeof suggestion === 'string') {
      parsedSuggestion = JSON.parse(suggestion) as EditSuggestion;
    } else {
      parsedSuggestion = suggestion;
    }
    setEditSuggestions([parsedSuggestion]);
  };

  const handleNextSuggestion = () => {
    if (suggestionQueueRef.current.length > 0) {
      const next = suggestionQueueRef.current.shift();
      if (next) setEditSuggestions([next]);
    } else {
      setEditSuggestions([]);
    }
  };

  const handleAcceptEdit = async (suggestionId: string) => {
    const suggestion = editSuggestions.find((s) => s.id === suggestionId);
    if (!suggestion || suggestion.status !== 'pending') return;

    // Check if user can make edits
    try {
      const response = await fetch('/api/track-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check edit limits');
      }

      const data = await response.json();

      if (!data.canEdit) {
        // Show paywall or error message
        toast.error(
          'You have reached your free edit limit. Please upgrade to Pro for unlimited edits.'
        );
        return;
      }

      // Notify other components to refresh usage data
      window.dispatchEvent(new Event('usage-update'));
    } catch (error) {
      console.error('Error checking edit limits:', error);
      return;
    }

    if (!editor || !monacoInstance) {
      console.error('Editor or Monaco instance not available.');
      return;
    }

    const model = editor.getModel();
    if (!model) {
      console.error('Editor model not available.');
      return;
    }

    try {
      const startLineNumber = suggestion.startLine;
      const endLineNumber =
        suggestion.originalLineCount > 0
          ? startLineNumber + suggestion.originalLineCount - 1
          : startLineNumber;
      const endColumn =
        suggestion.originalLineCount > 0
          ? model.getLineMaxColumn(endLineNumber)
          : 1;

      const rangeToReplace = new monacoInstance.Range(
        startLineNumber,
        1,
        endLineNumber,
        endColumn
      );

      editor.executeEdits('accept-ai-suggestion', [
        {
          range: rangeToReplace,
          text: suggestion.suggested,
          forceMoveMarkers: true,
        },
      ]);

      setEditSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: 'accepted' } : s
        )
      );
      setTimeout(handleNextSuggestion, 0);
    } catch (error) {
      console.error('Error applying edit:', error);
      setEditSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: 'pending' } : s
        )
      );
    }
  };

  const handleRejectEdit = (suggestionId: string) => {
    setEditSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestionId ? { ...s, status: 'rejected' } : s
      )
    );
    setTimeout(handleNextSuggestion, 0);
  };

  // Update the decoration effect for a clear inline diff view
  useEffect(() => {
    // Ensure editor and monaco are ready
    if (!editor || !monacoInstance) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    const oldDecorationIds = decorationIds; // Get IDs of previous decorations
    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];

    const pendingSuggestions = editSuggestions.filter(
      (s) => s.status === 'pending'
    );

    pendingSuggestions.forEach((suggestion) => {
      const startLineNumber = suggestion.startLine;
      // Ensure endLineNumber is valid and >= startLineNumber
      const endLineNumber = Math.max(
        startLineNumber,
        startLineNumber + suggestion.originalLineCount - 1
      );

      // Validate line numbers against the current model state
      if (
        startLineNumber <= 0 ||
        endLineNumber <= 0 ||
        startLineNumber > model.getLineCount() ||
        endLineNumber > model.getLineCount()
      ) {
        console.warn(
          `Suggestion ${suggestion.id} line numbers [${startLineNumber}-${endLineNumber}] are out of bounds for model line count ${model.getLineCount()}. Skipping decoration.`
        );
        return; // Skip this suggestion if lines are invalid
      }

      // Calculate end column precisely
      const endColumn =
        suggestion.originalLineCount > 0
          ? model.getLineMaxColumn(endLineNumber) // End of the last original line
          : 1; // Insertion point column 1

      // Define the range for the original text (or insertion point)
      const originalRange = new monacoInstance.Range(
        startLineNumber,
        1, // Start column is always 1
        endLineNumber,
        endColumn
      );

      // --- Decoration 1: Mark original text (if any) + Glyph ---
      if (suggestion.originalLineCount > 0) {
        // Apply red strikethrough to the original range
        newDecorations.push({
          range: originalRange,
          options: {
            className: 'octra-suggestion-deleted', // Red strikethrough style
            glyphMarginClassName: 'octra-suggestion-glyph', // Blue margin indicator
            glyphMarginHoverMessage: {
              value: `Suggestion: Replace Lines ${startLineNumber}-${endLineNumber}`,
            },
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        });
      } else {
        // If it's a pure insertion, just add the glyph marker at the start line
        newDecorations.push({
          range: new monacoInstance.Range(
            startLineNumber,
            1,
            startLineNumber,
            1
          ), // Point decoration
          options: {
            glyphMarginClassName: 'octra-suggestion-glyph',
            glyphMarginHoverMessage: {
              value: `Suggestion: Insert at Line ${startLineNumber}`,
            },
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        });
      }

      // --- Decoration 2: Show suggested text inline (if any) ---
      if (suggestion.suggested && suggestion.suggested.trim().length > 0) {
        // Use 'after' content widget placed at the end of the original range
        // The range for the 'after' widget itself should be zero-length
        const afterWidgetRange = new monacoInstance.Range(
          endLineNumber,
          endColumn,
          endLineNumber,
          endColumn
        );

        // Prepare suggested content, replacing newlines for inline view
        const inlineSuggestedContent = ` ${suggestion.suggested.replace(/\n/g, ' ↵ ')}`;

        newDecorations.push({
          range: afterWidgetRange, // Position the widget *after* the original range
          options: {
            after: {
              content: inlineSuggestedContent,
              inlineClassName: 'octra-suggestion-added', // Bold green style
            },
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        });
      }
    });

    // --- Apply Decorations ---
    // This is crucial: deltaDecorations removes old IDs and applies new ones atomically
    const newDecorationIds = editor.deltaDecorations(
      oldDecorationIds,
      newDecorations
    );
    // Update the state to store the IDs of the *currently applied* decorations
    setDecorationIds(newDecorationIds);

    // Dependencies: Re-run when suggestions change, or editor/monaco become available.
  }, [editSuggestions, editor, monacoInstance]); // Removed decorationIds from deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: Clear decorations when component unmounts
      if (editor && decorationIds.length > 0) {
        editor.deltaDecorations(decorationIds, []);
      }
    };
  }, []); // Empty dependency array for unmount cleanup

  return {
    editSuggestions,
    decorationIds,
    setDecorationIds,
    suggestionQueueRef,
    handleEditSuggestion,
    handleAcceptEdit,
    handleRejectEdit,
    handleNextSuggestion,
  };
}
