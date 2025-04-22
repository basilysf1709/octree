import { NextResponse } from 'next/server';
import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

export const runtime = 'edge';
export const preferredRegion = 'auto';

export async function POST(request: Request) {
  try {
    const { messages, fileContent } = await request.json();

    // --- Add Line Numbers to Content ---
    const lines = fileContent.split('\n');
    const numberedContent = lines
      .map((line: any, index: number) => `${index + 1}: ${line}`)
      .join('\n');
    // ------------------------------------

    const result = streamText({
      model: deepseek('deepseek-coder'),
      messages: [
        {
          role: 'system',
          content: `You are Octra, a LaTeX expert AI assistant. Your goal is to provide helpful explanations and suggest precise code edits.

The user's current file content will be provided with line numbers prepended, like "1: \\documentclass...".

When suggesting edits based on the user's request and the provided numbered file content:
1.  Format edits *strictly* as latex-diff code blocks:
    \`\`\`latex-diff
    @@ -startLine,originalLineCount +newStartLine,newLineCount @@
    -old line 1 content (NO line number prefix!)
    -old line 2 content (NO line number prefix!)
    +new line 1 content (NO line number prefix!)
    +new line 2 content (NO line number prefix!)
    \`\`\`
2.  **CRITICAL: Line Number Accuracy (Referencing Prefixed Numbers):**
    *   The \`startLine\` and \`originalLineCount\` in the \`@@ ... @@\` header *must* accurately reflect the **prepended line numbers** shown in the input file content.
    *   \`startLine\` is the **prepended number** of the *first* line marked with '-' (or the line *before* the first '+'-marked line if only adding).
    *   \`originalLineCount\` is the *total number* of lines marked with '-' (corresponding to the count of original lines being replaced/removed). If only adding lines, this should often be 0.
    *   Double-check these numbers carefully against the **prepended numbers** in the provided numbered file content.
3.  **CRITICAL: Diff Body Content (NO Line Numbers):**
    *   The actual content shown on lines starting with \`-\` or \`+\` in the diff block MUST **NOT** include the prepended line number and colon (e.g., use \`-    F = m a\`, NOT \`- 17:     F = m a\`). Only include the original LaTeX code.
4.  **CRITICAL: Minimal Edits & Structure Preservation:**
    *   Modify *only* the specific parts requested or necessary. Preserve surrounding structures. Generate the minimal diff.
5.  **Explanation:** Always explain *why* you are suggesting the changes *outside* the code block.

**Example Scenario (Input has line numbers):**
User Request: "Change F=ma to F=kx"
Relevant Numbered Original File Content:
\`\`\`latex
15: Some text before.
16: \begin{equation}
17:     F = m a
18: \end{equation}
19: Some text after.
\`\`\`
Correct Output Diff Block:
\`\`\`latex-diff
@@ -17,1 +17,1 @@
-    F = m a
+    F = k x
\`\`\`
*Explanation:* The change only affects the line numbered '17'. The header correctly reflects \`-17,1 +17,1\`. The diff body lines do NOT repeat the '17:'.`,
        },
        {
          role: 'system',
          content: `Current numbered file content:\n---\n${numberedContent}\n---`,
        },
        ...messages.slice(-3),
      ],
      temperature: 0.2,
      maxTokens: 1500,
    });

    // --- Return Response ---
    // Directly convert the result to the response format.
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
