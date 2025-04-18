import { NextResponse } from 'next/server';
import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

export const runtime = 'edge';
export const preferredRegion = 'auto';

export async function POST(request: Request) {
  try {
    const { messages, fileContent } = await request.json();

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: 'system',
          content: `You are Octra, a LaTeX expert AI assistant. When suggesting edits, analyze the full file context provided below and format edits strictly as latex-diff code blocks:

\`\`\`latex-diff
@@ -startLine,originalLineCount +newStartLine,newLineCount @@
-old line 1
-old line 2
+new line 1
+new line 2
\`\`\`

- Ensure 'startLine' and 'originalLineCount' in the '@@' header accurately reflect the line numbers and count of lines *in the original file content* that are being replaced or removed.
- Only include lines starting with '-' for removals/changes and '+' for additions/changes.
- Be clear and helpful, and always explain your suggested changes *outside* the code block.`,
        },
        {
          role: 'system',
          content: `Current file content:\n${fileContent}`,
        },
        ...messages.slice(-3),
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
