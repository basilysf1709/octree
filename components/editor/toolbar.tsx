'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import { Loader2 } from 'lucide-react';

interface EditorToolbarProps {
  onTextFormat: (format: 'bold' | 'italic' | 'underline') => void;
  onCompile: () => void;
  onExportPDF: () => void;
  compiling: boolean;
  exportingPDF: boolean;
  isSaving: boolean;
}

export function EditorToolbar({
  onTextFormat,
  onCompile,
  onExportPDF,
  compiling,
  exportingPDF,
  isSaving,
}: EditorToolbarProps) {
  return (
    <div className="flex-shrink-0 p-2 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between">
        <ButtonGroup>
          <ButtonGroupItem onClick={() => onTextFormat('bold')}>
            <span className="text-sm font-bold">B</span>
          </ButtonGroupItem>
          <ButtonGroupItem onClick={() => onTextFormat('italic')}>
            <span className="text-sm italic">I</span>
          </ButtonGroupItem>
          <ButtonGroupItem onClick={() => onTextFormat('underline')}>
            <span className="text-sm underline">U</span>
          </ButtonGroupItem>
        </ButtonGroup>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={onCompile}
            disabled={compiling}
          >
            {compiling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Compiling
              </>
            ) : (
              <>
                Compile
                <span className="ml-1 text-xs opacity-60">⌘S</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={onExportPDF}
            disabled={exportingPDF || isSaving}
          >
            {exportingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Exporting
              </>
            ) : (
              'Export'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
