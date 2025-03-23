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
          content: 'You are Octra, a LaTeX expert AI assistant. Help users write and format their LaTeX documents effectively. Be clear and helpful.'
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