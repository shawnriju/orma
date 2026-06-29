import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client.js'
import { computeNextInterval, Rating } from '../lib/sm2.js'

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
    .or(`next_review_at.lte.${new Date().toISOString()},next_review_at.is.null`)

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
  card_id: z.string().uuid(),
  rating: z.enum(['hard', 'ok', 'easy']),
})

study.post('/review', zValidator('json', reviewSchema), async (c) => {
  const userId = c.get('userId')
  const { card_id, rating } = c.req.valid('json')

  const { data: flashcard, error: fetchError } = await supabase
    .from('flashcards')
    .select('id, interval_days, ease_factor, repetitions')
    .eq('id', card_id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !flashcard) {
    return c.json({ error: 'Flashcard not found or unauthorized' }, 404)
  }

  const cardState = {
    interval_days: flashcard.interval_days || 0,
    ease_factor: flashcard.ease_factor || 2.5,
    repetitions: flashcard.repetitions || 0,
  }

  const { interval_days, ease_factor, repetitions, next_review_at } = computeNextInterval(cardState, rating as Rating)

  const isCorrect = rating === 'ok' || rating === 'easy'
  
  const { data, error } = await supabase
    .from('flashcards')
    .update({
      interval_days,
      ease_factor,
      repetitions,
      next_review_at: next_review_at.toISOString()
    })
    .eq('id', card_id)
    .eq('user_id', userId)
    .select('id, note_id, question, answer, next_review_at, interval_days, ease_factor, repetitions, created_at')
    .single()

  if (error || !data) {
    return c.json({ error: 'Failed to update flashcard review state' }, 500)
  }

  return c.json(data)
})

study.get('/daily-queue', async (c) => {
  const userId = c.get('userId')
  const isOvertime = c.req.query('overtime') === 'true'

  // Fetch daily_review_limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_review_limit')
    .eq('id', userId)
    .single()
    
  const limit = profile?.daily_review_limit || 5

  let query = supabase
    .from('flashcards')
    .select('id, note_id, question, answer, next_review_at, interval_days, ease_factor, repetitions, created_at, notes ( title )')
    .eq('user_id', userId)

  if (!isOvertime) {
    query = query.or(`next_review_at.lte.${new Date().toISOString()},next_review_at.is.null`)
  }

  const { data, error } = await query
    .order('next_review_at', { ascending: true }) // nulls will be treated according to Postgres defaults, usually last, which is fine
    .limit(limit)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  // Shuffle the result array
  const shuffled = data.sort(() => 0.5 - Math.random())

  return c.json(shuffled)
})

study.get('/due-count', async (c) => {
  const userId = c.get('userId')

  const { count, error } = await supabase
    .from('flashcards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .or(`next_review_at.lte.${new Date().toISOString()},next_review_at.is.null`)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ count: count || 0 })
})

const sessionSchema = z.object({
  hard_count: z.number().int().min(0),
  ok_count: z.number().int().min(0),
  easy_count: z.number().int().min(0),
})

study.post('/session', zValidator('json', sessionSchema), async (c) => {
  const userId = c.get('userId')
  const { hard_count, ok_count, easy_count } = c.req.valid('json')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('last_review_date, streak_count')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return c.json({ error: 'Profile not found' }, 404)
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  
  let newStreak = profile.streak_count || 0
  let newLastReviewDate = today.toISOString().split('T')[0]

  if (profile.last_review_date) {
    const lastDate = new Date(profile.last_review_date)
    lastDate.setUTCHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(today.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      newStreak += 1
    } else if (diffDays > 1) {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  await supabase
    .from('profiles')
    .update({
      streak_count: newStreak,
      last_review_date: newLastReviewDate
    })
    .eq('id', userId)

  const { error: sessionError } = await supabase
    .from('review_sessions')
    .insert({
      user_id: userId,
      hard_count,
      ok_count,
      easy_count,
    })

  if (sessionError) {
    return c.json({ error: sessionError.message }, 500)
  }

  const total = hard_count + ok_count + easy_count
  const accuracy = total > 0 ? ((ok_count + easy_count) / total) * 100 : 0

  return c.json({
    streak_count: newStreak,
    cards_reviewed: total,
    accuracy
  })
})

export default study
