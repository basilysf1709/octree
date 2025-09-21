'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SelectionButtonProps {
  show: boolean;
  position: { top: number; left: number };
  onCopy: () => void;
  className?: string;
}

export function SelectionButton({
  show,
  position,
  onCopy,
  className = '',
}: SelectionButtonProps) {
  if (!show) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onCopy}
      className={cn('absolute z-10 font-medium', className)}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      Edit
      <kbd className="ml-1 text-xs opacity-60">⌘B</kbd>
    </Button>
  );
}
