import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FlashcardDraft {
  question: string
  answer: string
}

export async function generateFlashcards(content: string): Promise<FlashcardDraft[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  // 1. Input Length Check (mitigate expensive API DoS)
  if (content.length > 10000) {
    throw new Error('Note content is too long for AI processing. Max limit is 10,000 characters.')
  }

  // 2. Safety Moderation Check
  const moderation = await openai.moderations.create({ input: content })
  if (moderation.results[0]?.flagged) {
    throw new Error('Note content violates safety guidelines. Cannot generate flashcards.')
  }

  // 3. Chat Completion with Structured Outputs and Low Temperature
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an educational assistant that generates high-quality study flashcards. 
Generate question and answer pairs based strictly on the user's provided notes content. 
Do not assume outside context, hallucinate, or make up facts. If the content is insufficient, return an empty list of cards.
Questions should be specific, clear, and testable. Answers should be concise, clear, and correct.`
      },
      {
        role: 'user',
        content,
      }
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
                  answer: { type: 'string' }
                },
                required: ['question', 'answer'],
                additionalProperties: false
              }
            }
          },
          required: ['flashcards'],
          additionalProperties: false
        }
      }
    },
    temperature: 0.25,
  })

  const text = response.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(text)
    return parsed.flashcards || []
  } catch (error) {
    console.error('Failed to parse OpenAI structured output:', text)
    throw new Error('Failed to parse flashcards from AI response')
  }
}
