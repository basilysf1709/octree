'use client';

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type * as Monaco from 'monaco-editor';

export interface EditorSelectionState {
  buttonPos: { top: number; left: number };
  showButton: boolean;
  selectedText: string;
  handleCopy: (textToCopy?: string) => void;
  setupSelectionHandling: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  setTextFromEditor: (text: string | null) => void;
}

interface UseEditorSelectionProps {
  onTextSelected?: (text: string) => void;
}

export function useEditorSelection({
  onTextSelected,
}: UseEditorSelectionProps = {}): EditorSelectionState {
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Function to set text from editor (for external components like Chat)
  const setTextFromEditor = (text: string | null) => {
    if (onTextSelected && text) {
      onTextSelected(text);
    }
  };

  // Handle copying selected text
  function handleCopy(textToCopy?: string) {
    const currentSelectedText = textToCopy ?? selectedText;

    if (currentSelectedText.trim()) {
      setTextFromEditor(currentSelectedText);
      setShowButton(false);
    }
  }

  // Debounced cursor selection handler
  const debouncedCursorSelection = useDebouncedCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      const selection = editor.getSelection();
      const model = editor.getModel();
      const text = model?.getValueInRange(selection!);

      if (text && selection && !selection?.isEmpty()) {
        const range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        };
        const startCoords = editor.getScrolledVisiblePosition({
          lineNumber: range.startLineNumber,
          column: range.startColumn,
        });

        if (startCoords) {
          setButtonPos({
            top: startCoords.top - 30,
            left: startCoords.left,
          });
          setSelectedText(text);
          setShowButton(true);
        }
      } else {
        setShowButton(false);
        setSelectedText('');
      }
    },
    200
  ); // debounce delay in ms

  // Setup selection handling for the editor
  const setupSelectionHandling = (
    editor: Monaco.editor.IStandaloneCodeEditor
  ) => {
    // Add selection change listener for floating button
    editor.onDidChangeCursorSelection((e) => {
      debouncedCursorSelection(editor);
    });
  };

  return {
    buttonPos,
    showButton,
    selectedText,
    handleCopy,
    setupSelectionHandling,
    setTextFromEditor,
  };
}
