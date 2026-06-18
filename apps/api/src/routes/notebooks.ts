import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client.js'

type Env = {
  Variables: {
    userId: string
  }
}

const notebooks = new Hono<Env>()

// 1. GET / - List all notebooks for the user
notebooks.get('/', async (c) => {
  const userId = c.get('userId')

  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data)
})

// Validation Schema for creating a notebook
const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  emoji: z.string().optional()
})

// 2. POST / - Create a new notebook
notebooks.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const { data, error } = await supabase
    .from('notebooks')
    .insert({
      user_id: userId,
      title: body.title,
      emoji: body.emoji || '📁'
    })
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data, 201)
})

// Validation Schema for updating a notebook
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  emoji: z.string().optional()
})

// 3. PATCH /:id - Update notebook title/emoji
notebooks.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId')
  const notebookId = c.req.param('id')
  const body = c.req.valid('json')

  if (Object.keys(body).length === 0) {
    return c.json({ error: 'At least one field (title or emoji) must be updated' }, 400)
  }

  const { data, error } = await supabase
    .from('notebooks')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('id', notebookId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    return c.json({ error: 'Notebook not found or unauthorized' }, 404)
  }

  return c.json(data)
})

// 4. DELETE /:id - Delete a notebook
notebooks.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const notebookId = c.req.param('id')

  const { data, error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', notebookId)
    .eq('user_id', userId)
    .select()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  if (!data || data.length === 0) {
    return c.json({ error: 'Notebook not found or unauthorized' }, 404)
  }

  return c.json({ success: true })
})

export default notebooks
