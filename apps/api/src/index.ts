import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import dotenv from 'dotenv'

// Config env variables early in the entry point
dotenv.config()

// Since package.json uses "type": "module" and tsconfig.json uses "moduleResolution": "NodeNext",
// relative imports must include the ".js" extension to compile and run correctly under Node.js ESM.
import { authMiddleware } from './middleware/auth.js'
import notes from './routes/notes.js'
import notebooks from './routes/notebooks.js'
import flashcards from './routes/flashcards.js'
import study from './routes/study.js'

// import study from './routes/study.js'
// import backup from './routes/backup.js'

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }))

// Auth middleware mounted on all API v1 routes
app.use('/api/v1/*', authMiddleware)

// API routes
app.route('/api/v1/notebooks', notebooks)
app.route('/api/v1/notes', notes)
app.route('/api/v1/flashcards', flashcards)
app.route('/api/v1/study', study)
// app.route('/api/v1/backup', backup)

export default app

import { serve } from '@hono/node-server'
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001
console.log(`Server is running on port ${port}`)
serve({
  fetch: app.fetch,
  port
})
