import { NextResponse } from 'next/server'
import { deepseek } from '@ai-sdk/deepseek'
import { streamText } from 'ai'

export const runtime = 'edge'
export const preferredRegion = 'auto'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: 'system',
          content: `You are Octra, a LaTeX expert AI assistant. When suggesting edits, format them as latex-diff code blocks:

\`\`\`latex-diff
-old code
+new code
\`\`\`

Be clear and helpful, and always explain your suggested changes.`
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