import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client.js'

type Env = {
  Variables: {
    userId: string
  }
}

const profiles = new Hono<Env>()

profiles.get('/me', async (c) => {
  const userId = c.get('userId')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data)
})

const patchProfileSchema = z.object({
  daily_review_limit: z.number().int().min(3).max(50).optional(),
  email_notifications_enabled: z.boolean().optional(),
  display_name: z.string().optional(),
})

profiles.patch('/me', zValidator('json', patchProfileSchema), async (c) => {
  const userId = c.get('userId')
  const updates = c.req.valid('json')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json(data)
})

export default profiles
