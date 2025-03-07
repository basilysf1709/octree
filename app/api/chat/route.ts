import { NextResponse } from 'next/server'
import { deepseek } from '@ai-sdk/deepseek'
import { streamText } from 'ai'

// Configure runtime
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant.'
        },
        ...messages
      ]
    })

    // Use toDataStreamResponse to properly format the stream
    return result.toDataStreamResponse()

  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 