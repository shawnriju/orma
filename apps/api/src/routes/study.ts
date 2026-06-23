import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client.js'

type Env = {
  Variables: {
    userId: string
  }
}

const study = new Hono<Env>()

study.get('/due', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.query('note_id')

  let query = supabase
    .from('flashcards')
    .select('id, note_id, question, answer, next_review_at, interval_days, ease_factor, created_at, notes ( title )')
    .eq('user_id', userId)
    .lte('next_review_at', new Date().toISOString())

  if (noteId) {
    query = query.eq('note_id', noteId)
  }

  const { data, error } = await query.order('next_review_at', { ascending: true })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data)
})

const reviewSchema = z.object({
  flashcard_id: z.string().uuid(),
  correct: z.boolean(),
})

study.post('/review', zValidator('json', reviewSchema), async (c) => {
  const userId = c.get('userId')
  const { flashcard_id, correct } = c.req.valid('json')

  const { data: flashcard, error: fetchError } = await supabase
    .from('flashcards')
    .select('id, interval_days, ease_factor')
    .eq('id', flashcard_id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !flashcard) {
    return c.json({ error: 'Flashcard not found or unauthorized' }, 404)
  }

  const currentInterval = Math.max(1, flashcard.interval_days || 1)
  const currentEase = Math.max(1.3, flashcard.ease_factor || 2.5)

  const nextInterval = correct ? Math.min(currentInterval === 1 ? 3 : Math.round(currentInterval * currentEase), 3650) : 1
  const nextEase = correct
    ? Math.min(3, currentEase + 0.1)
    : Math.max(1.3, currentEase - 0.2)

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval)

  const { data, error } = await supabase
    .from('flashcards')
    .update({
      interval_days: nextInterval,
      ease_factor: nextEase,
      next_review_at: nextReviewAt.toISOString(),
    })
    .eq('id', flashcard_id)
    .eq('user_id', userId)
    .select('id, note_id, question, answer, next_review_at, interval_days, ease_factor, created_at')
    .single()

  if (error || !data) {
    return c.json({ error: 'Failed to update flashcard review state' }, 500)
  }

  return c.json(data)
})

export default study
