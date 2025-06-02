'use client';

interface DiffViewerProps {
  original: string;
  suggested: string;
  className?: string;
}

export function DiffViewer({ original, suggested, className = '' }: DiffViewerProps) {
  const originalLines = original ? original.split('\n') : [];
  const suggestedLines = suggested ? suggested.split('\n') : [];

  return (
    <div className={`rounded-lg border border-gray-200 bg-white text-xs font-mono max-w-full max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${className}`}>
      {/* Deletions */}
      {originalLines.length > 0 && (
        <div className="bg-red-50/50">
          {originalLines.map((line, index) => (
            <div key={`del-${index}`} className="flex border-l-3 border-red-400">
              <span className="bg-red-100 text-red-600 px-2 py-2 text-center min-w-[24px] border-r border-red-200 flex-shrink-0">
                −
              </span>
              <div className="px-3 py-2 text-red-700 flex-1 min-w-0 break-all whitespace-pre-wrap">
                {line || '\u00A0'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Additions */}
      {suggestedLines.length > 0 && (
        <div className="bg-green-50/50">
          {suggestedLines.map((line, index) => (
            <div key={`add-${index}`} className="flex border-l-3 border-green-400">
              <span className="bg-green-100 text-green-600 px-2 py-2 text-center min-w-[24px] border-r border-green-200 flex-shrink-0">
                +
              </span>
              <div className="px-3 py-2 text-green-700 flex-1 min-w-0 break-all whitespace-pre-wrap">
                {line || '\u00A0'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {originalLines.length === 0 && suggestedLines.length === 0 && (
        <div className="px-4 py-3 text-gray-500 italic text-center bg-gray-50/50">
          No changes to display
        </div>
      )}
    </div>
  );
} 