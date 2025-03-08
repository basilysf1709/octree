import { NextResponse } from 'next/server'
import { deepseek } from '@ai-sdk/deepseek'
import { streamText } from 'ai'

// Configure runtime
export const runtime = 'edge'
export const preferredRegion = 'auto' // Add automatic region selection

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: 'system',
          content: 'You are a concise AI writing assistant. Respond in 1-2 sentences max. Be direct and brief.'
        },
        // Only send last few messages for context
        ...messages.slice(-3)
      ],
      temperature: 0.3, // Lower temperature for faster, more focused responses
      maxTokens: 1000,
    })

    // Use toDataStreamResponse to properly format the stream
    return result.toDataStreamResponse()

  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
} 