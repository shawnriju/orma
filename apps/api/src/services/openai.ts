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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an assistant that generates high-quality flashcards for learning. 
Return ONLY a valid JSON array of objects, with no markdown formatting, no code blocks (do not wrap in \`\`\`json), and no preamble.
Each object must have exactly two string fields: "question" and "answer".
Keep the questions specific and testable. Keep the answers concise and clear.`
      },
      {
        role: 'user',
        content: `Generate 5 to 10 flashcards from the following notes content:

${content}`
      }
    ],
    temperature: 0.3,
  })

  const text = response.choices[0]?.message?.content || ''

  try {
    const cleanText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const cards = JSON.parse(cleanText)
    if (!Array.isArray(cards)) {
      throw new Error('Response is not a JSON array')
    }
    return cards
  } catch (error) {
    console.error('Failed to parse OpenAI response:', text)
    throw new Error('Failed to parse flashcards from AI response')
  }
}
