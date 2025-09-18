import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';
export const preferredRegion = 'auto';

interface ConflictRequestBody {
  fileContent: string;
  suggestion: {
    id: string;
    original: string;
    suggested: string;
    startLine: number;
    originalLineCount: number;
  };
  currentText: string;
  isSmallChange: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConflictRequestBody;
    const { fileContent, suggestion, currentText, isSmallChange } = body;

    if (!fileContent || !suggestion || !suggestion.suggested) {
      return NextResponse.json(
        { error: 'Invalid conflict resolution payload' },
        { status: 400 }
      );
    }

    const lines = fileContent.split('\n');
    const numberedContent = lines
      .map((line, index) => `${index + 1}: ${line}`)
      .join('\n');

    const model = isSmallChange
      ? openai('gpt-4o-mini')
      : deepseek('deepseek-coder');

    const previousOriginal = suggestion.original.trim().length
      ? suggestion.original
      : '(no original content)';
    const previousSuggested = suggestion.suggested.trim().length
      ? suggestion.suggested
      : '(no suggested content)';

    const { text } = await generateText({
      model,
      temperature: 0.2,
      maxTokens: 1200,
      messages: [
        {
          role: 'system' as const,
          content:
            'You are Octra, a LaTeX expert assistant. Provide updated latex-diff code blocks that apply the intended change. Ensure diffs use accurate line numbers, omit line number prefixes within the diff body, and keep changes minimal.',
        },
        {
          role: 'user' as const,
          content: `The document changed after an earlier suggestion. Update the suggestion so it applies cleanly now.\n\nPrevious suggestion metadata:\n- Start line: ${suggestion.startLine}\n- Original line count: ${suggestion.originalLineCount}\n- Original snippet:\n---\n${previousOriginal}\n---\n- Intended replacement snippet:\n---\n${previousSuggested}\n---\n\nCurrent snippet at the targeted region:\n---\n${currentText || '(empty)'}\n---\n\nCurrent numbered file content:\n---\n${numberedContent}\n---\n\nReturn updated latex-diff code block(s) that integrate the intended replacement. Include a brief explanation after the code block.`,
        },
      ],
    });

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Conflict resolution error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve suggestion conflict' },
      { status: 500 }
    );
  }
}
