import { NextResponse } from 'next/server'
import { deepseek } from '@ai-sdk/deepseek'
import { streamText } from 'ai'

export const runtime = 'edge'
export const preferredRegion = 'auto'

export async function POST(request: Request) {
  try {
    const { messages, fileContent } = await request.json()

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: 'system',
          content: `You are Octra, a LaTeX expert AI assistant. When suggesting edits, analyze the full file context and format edits as latex-diff code blocks with line numbers:

\`\`\`latex-diff
@@ -lineNumber,lineCount +lineNumber,lineCount @@
-old code
+new code
\`\`\`

Be clear and helpful, and always explain your suggested changes. Provide the exact line numbers where changes should be made.`
        },
        {
          role: 'system',
          content: `Current file content:\n${fileContent}`
        },
        ...messages.slice(-3)
      ],
      temperature: 0.3,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()

  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
} 