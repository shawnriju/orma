import { createMiddleware } from 'hono/factory'
import { supabase } from '../db/client.js'

// Declare custom Hono Environment Variables for type safety across downstream handlers
type Env = {
  Variables: {
    userId: string
  }
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7) // Extracts the token after 'Bearer '
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  // Bind the authenticated user's ID to the Hono context
  c.set('userId', user.id)
  
  await next()
})
