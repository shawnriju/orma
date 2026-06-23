import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client.js'
import { generateFlashcards } from '../services/openai.js'

type Env = {
  Variables: {
    userId: string
  }
}

const flashcards = new Hono<Env>()

// 0. GET / - List all flashcards for the authenticated user (optionally filtered by note_id)
flashcards.get('/', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.query('note_id')

  let query = supabase
    .from('flashcards')
    .select('id, note_id, question, answer, next_review_at, interval_days, ease_factor, created_at, notes ( title )')
    .eq('user_id', userId)

  if (noteId) {
    query = query.eq('note_id', noteId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data)
})

// Helper: extract plain text from ProseMirror JSON document
function extractTextFromProseMirror(doc: any): string {
  if (!doc) return ''
  if (typeof doc === 'string') {
    try {
      doc = JSON.parse(doc)
    } catch {
      return doc
    }
  }
  if (!doc?.content) return ''
  return doc.content
    .flatMap((node: any) => extractNodeText(node))
    .join('\n')
}

function extractNodeText(node: any): string[] {
  if (node.type === 'text') return [node.text || '']
  if (node.content) return node.content.flatMap(extractNodeText)
  return []
}

// 1. POST /generate - Generate flashcards from note content or selection
const generateSchema = z.object({
  note_id: z.string().uuid(),
  selected_text: z.string().optional()
})

flashcards.post('/generate', zValidator('json', generateSchema), async (c) => {
  const userId = c.get('userId')
  const { note_id, selected_text } = c.req.valid('json')

  // Ownership Check: Check if note exists and belongs to user
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('content, title')
    .eq('id', note_id)
    .eq('user_id', userId)
    .single()

  if (noteError || !note) {
    return c.json({ error: 'Note not found or unauthorized' }, 404)
  }

  let textToProcess = selected_text
  if (!textToProcess) {
    textToProcess = extractTextFromProseMirror(note.content)
  }

  if (!textToProcess || textToProcess.trim().length === 0) {
    return c.json({ error: 'Note content is empty, cannot generate flashcards' }, 400)
  }

  const wordCount = textToProcess.split(/\s+/).filter(Boolean).length
  if (wordCount < 20) {
    return c.json({ error: 'Not enough context to generate flashcards. Please write at least 20 words.' }, 400)
  }

  try {
    const cards = await generateFlashcards(textToProcess)
    return c.json(cards)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to generate flashcards' }, 500)
  }
})

// 2. POST / - Save confirmed flashcards
const saveSchema = z.object({
  note_id: z.string().uuid(),
  cards: z.array(
    z.object({
      question: z.string().min(1, 'Question cannot be empty'),
      answer: z.string().min(1, 'Answer cannot be empty')
    })
  )
})

flashcards.post('/', zValidator('json', saveSchema), async (c) => {
  const userId = c.get('userId')
  const { note_id, cards } = c.req.valid('json')

  // Check note ownership
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id')
    .eq('id', note_id)
    .eq('user_id', userId)
    .single()

  if (noteError || !note) {
    return c.json({ error: 'Note not found or unauthorized' }, 404)
  }

  const now = new Date().toISOString()
  const rows = cards.map((card) => ({
    user_id: userId,
    note_id,
    question: card.question,
    answer: card.answer,
    next_review_at: now, // due immediately for first review
    interval_days: 1,
    ease_factor: 2.5
  }))

  const { data, error } = await supabase
    .from('flashcards')
    .insert(rows)
    .select()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data, 201)
})

export default flashcards
