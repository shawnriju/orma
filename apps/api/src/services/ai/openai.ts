import OpenAI from 'openai'
import type { AIProvider, FlashcardDraft } from './types.js'

// --- Fix #1: Lazy client initialization ---
// The client is NOT created at module-load time. It is created on first use,
// after dotenv has run and environment variables are guaranteed to be populated.
// This prevents the silent "undefined API key" footgun.
let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is not set. Check your .env file.'
      )
    }
    _client = new OpenAI({ apiKey })
  }
  return _client
}

// --- Fix #4: Error categorization helper ---
// Distinguishes between transient (network, rate-limit) and permanent
// (auth, parse) failures so callers and logs get actionable messages.
function categorizeError(err: any, stage: string): Error {
  const status: number | undefined = err?.status ?? err?.statusCode

  if (status === 401) {
    return new Error(
      `AI authentication failed during ${stage}. Verify your OPENAI_API_KEY.`
    )
  }
  if (status === 429) {
    return new Error(
      'AI rate limit reached. Please wait a moment and try again.'
    )
  }
  if (typeof status === 'number' && status >= 500) {
    return new Error(
      'OpenAI service is temporarily unavailable. Please try again shortly.'
    )
  }
  if (
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'ETIMEDOUT' ||
    err?.code === 'ENOTFOUND'
  ) {
    return new Error(
      'Could not connect to OpenAI. Check your network connection.'
    )
  }

  return new Error(
    `AI request failed during ${stage}: ${err?.message ?? 'Unknown error'}`
  )
}

/**
 * OpenAI implementation of AIProvider.
 * Responsibilities: call the API, parse the response, surface typed errors.
 * NOT responsible for: input validation, rate limiting, DB logging — those
 * belong in the route/business layer.
 */
export class OpenAIProvider implements AIProvider {
  async generateFlashcards(content: string): Promise<FlashcardDraft[]> {
    const client = getClient()

    // Safety Moderation Check
    let moderation: Awaited<ReturnType<typeof client.moderations.create>>
    try {
      moderation = await client.moderations.create({ input: content })
    } catch (err: any) {
      throw categorizeError(err, 'moderation')
    }

    if (moderation.results[0]?.flagged) {
      throw new Error(
        'Note content violates safety guidelines. Cannot generate flashcards.'
      )
    }

    // Chat Completion with Structured Outputs and low temperature
    let response: Awaited<ReturnType<typeof client.chat.completions.create>>
    try {
      response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an educational assistant that generates high-quality study flashcards. 
Generate question and answer pairs based strictly on the user's provided notes content. 
Do not assume outside context, hallucinate, or make up facts. If the content is insufficient, return an empty list of cards.
Questions should be specific, clear, and testable. Answers should be concise, clear, and correct.`,
          },
          {
            role: 'user',
            content,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'flashcards_response',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                flashcards: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      answer: { type: 'string' },
                    },
                    required: ['question', 'answer'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['flashcards'],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.25,
      })
    } catch (err: any) {
      throw categorizeError(err, 'completion')
    }

    // --- Fix #5: Log token usage for cost observability ---
    if (response.usage) {
      console.log('[AI] Token usage:', {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      })
    }

    const text = response.choices[0]?.message?.content ?? '{}'

    // Parse failure is a permanent error — log the raw output to help debug
    try {
      const parsed = JSON.parse(text)
      return (parsed.flashcards ?? []) as FlashcardDraft[]
    } catch {
      console.error('[AI] Failed to parse structured output:', text)
      throw new Error(
        'Failed to parse flashcards from AI response. The model returned unexpected output.'
      )
    }
  }
}
