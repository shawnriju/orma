import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client.js'

// Environment variables structure for Hono Context
type Env = {
  Variables: {
    userId: string
  }
}

const notes = new Hono<Env>()

// 1. GET / - List all notes for the authenticated user (metadata only)
notes.get('/', async (c) => {
  const userId = c.get('userId')
  const notebookId = c.req.query('notebook_id')

  let query = supabase
    .from('notes')
    .select('id, title, notebook_id, content, word_count, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (notebookId) {
    query = query.eq('notebook_id', notebookId)
  }

  const { data, error } = await query

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data)
})

// 2. GET /:id - Fetch a single note's full details (with ownership check)
notes.get('/:id', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return c.json({ error: 'Note not found' }, 404)
  }

  return c.json(data)
})

// 2b. GET /:id/flashcard-stats - Get total and due flashcard count for a note
notes.get('/:id/flashcard-stats', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')

  // Enforce ownership: Check if note exists and belongs to user
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (noteError || !note) {
    return c.json({ error: 'Note not found or unauthorized' }, 404)
  }

  // Count total flashcards for this note
  const { count: totalCount, error: totalError } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('note_id', noteId)
    .eq('user_id', userId)

  if (totalError) {
    return c.json({ error: totalError.message }, 500)
  }

  // Count due flashcards for this note
  const { count: dueCount, error: dueError } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .lte('next_review_at', new Date().toISOString())

  if (dueError) {
    return c.json({ error: dueError.message }, 500)
  }

  return c.json({
    totalCount: totalCount ?? 0,
    dueCount: dueCount ?? 0,
  })
})

// Validation Schema for creating a note
const createSchema = z.object({
  notebook_id: z.string().uuid(),
  title: z.string().optional().default('Untitled')
})

// 3. POST / - Create a new note (inserts default content = { type: 'doc', content: [] })
notes.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      notebook_id: body.notebook_id,
      title: body.title,
      content: { type: 'doc', content: [] }, // Default content to valid Tiptap empty doc
      word_count: 0
    })
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data, 201)
})

// Validation Schema for updating a note
const updateSchema = z.object({
  title: z.string().optional(),
  content: z.record(z.any()).optional(),
  word_count: z.number().optional()
})

// 4. PATCH /:id - Update a note's content (with ownership check and timestamp update)
notes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')
  const body = c.req.valid('json')

  // Prevent empty updates
  if (Object.keys(body).length === 0) {
    return c.json({ error: 'At least one field (title, content, or word_count) must be provided' }, 400)
  }

  const { data, error } = await supabase
    .from('notes')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    // Supabase will not return data if the row does not match filter (unauthorized or not found)
    return c.json({ error: 'Note not found or unauthorized' }, 404)
  }

  return c.json(data)
})

// 5. DELETE /:id - Remove a note (with ownership check)
notes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')

  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  if (!data || data.length === 0) {
    return c.json({ error: 'Note not found or unauthorized' }, 404)
  }

  return c.json({ success: true })
})

export default notes
