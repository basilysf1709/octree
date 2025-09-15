'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import { UsageIndicator } from '@/components/subscription/usage-indicator';
import { Loader2 } from 'lucide-react';

interface EditorToolbarProps {
  onTextFormat: (format: 'bold' | 'italic' | 'underline') => void;
  onCompile: () => void;
  onExportPDF: () => void;
  compiling: boolean;
  exportingPDF: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export function EditorToolbar({
  onTextFormat,
  onCompile,
  onExportPDF,
  compiling,
  exportingPDF,
  isSaving,
  lastSaved,
}: EditorToolbarProps) {
  return (
    <div className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-2 py-0">
      <div className="flex items-center justify-between">
        {/* Text Formatting Controls */}
        <ButtonGroup>
          <ButtonGroupItem
            onClick={() => onTextFormat('bold')}
            className="px-2 py-1 text-xs"
          >
            <span className="text-xs font-bold">B</span>
          </ButtonGroupItem>
          <ButtonGroupItem
            onClick={() => onTextFormat('italic')}
            className="px-2 py-1 text-xs"
          >
            <span className="text-xs italic">I</span>
          </ButtonGroupItem>
          <ButtonGroupItem
            onClick={() => onTextFormat('underline')}
            className="px-2 py-1 text-xs"
          >
            <span className="text-xs underline">U</span>
          </ButtonGroupItem>
        </ButtonGroup>

        {/* Status and Action Controls */}
        <div className="flex items-center gap-2">
          {/* Save Status */}
          {lastSaved && (
            <span className="text-xs text-slate-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-blue-500">
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}

          {/* Compile Button */}
          <Button
            variant="ghost"
            size="xs"
            onClick={onCompile}
            disabled={compiling}
          >
            {compiling ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Compiling
              </>
            ) : (
              <>
                Compile
                <span className="ml-1 text-xs opacity-60">⌘S</span>
              </>
            )}
          </Button>

          {/* Export Button */}
          <Button
            variant="ghost"
            size="xs"
            onClick={onExportPDF}
            disabled={exportingPDF || isSaving}
          >
            {exportingPDF ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Exporting
              </>
            ) : (
              'Export'
            )}
          </Button>

          {/* Usage Indicator */}
          <UsageIndicator />
        </div>
      </div>
    </div>
  );
}
