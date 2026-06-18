# Backend Architecture
## NoteFlash MVP — Hono + TypeScript

---

## Stack

| Tool | Purpose |
|---|---|
| Hono | Web framework |
| TypeScript | Type safety |
| Supabase JS SDK | Database queries (Postgres) |
| Zod | Request validation and schema definition |
| Anthropic SDK | Claude API for flashcard generation |
| Google APIs | Google Drive backup |
| Railway | Hosting ($5/mo hobby plan) |

---

## Why Hono

Hono runs anywhere JavaScript runs — Cloudflare Workers, Bun, Deno, Node.js, Railway. If Railway's pricing ever changes, the entire backend moves to Cloudflare Workers with zero code changes. It has first-class TypeScript support, simple Zod-based middleware for validation, and a clean Express-like API without Express's baggage.

---

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts               ← App entry point, route registration
│   ├── middleware/
│   │   ├── auth.ts            ← JWT validation via Supabase
│   │   └── rateLimit.ts       ← Per-user rate limiting (flashcard generation)
│   ├── routes/
│   │   ├── notebooks.ts
│   │   ├── notes.ts
│   │   ├── flashcards.ts
│   │   ├── study.ts
│   │   └── backup.ts
│   ├── services/
│   │   ├── claude.ts          ← Anthropic API wrapper
│   │   ├── googleDrive.ts     ← Drive backup logic
│   │   └── spacedrep.ts       ← SM-2 algorithm
│   ├── db/
│   │   └── client.ts          ← Supabase client init
│   └── types/
│       └── index.ts           ← Shared types (Note, Flashcard, etc.)
├── .env
└── package.json
```

---

## Entry Point

```typescript
// src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authMiddleware } from './middleware/auth'
import notebooks from './routes/notebooks'
import notes from './routes/notes'
import flashcards from './routes/flashcards'
import study from './routes/study'
import backup from './routes/backup'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL!,
  credentials: true
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

// All /api/v1/* routes require auth
app.use('/api/v1/*', authMiddleware)

app.route('/api/v1/notebooks', notebooks)
app.route('/api/v1/notes', notes)
app.route('/api/v1/flashcards', flashcards)
app.route('/api/v1/study', study)
app.route('/api/v1/backup', backup)

export default app
```

---

## Auth Middleware

Validates Supabase JWT on every protected route. Attaches `user_id` to context.

```typescript
// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { supabase } from '../db/client'

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  c.set('userId', user.id)
  await next()
})
```

---

## Notes Route

```typescript
// src/routes/notes.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../db/client'

const notes = new Hono()

// List notes — optionally filter by notebook
notes.get('/', async (c) => {
  const userId = c.get('userId')
  const notebookId = c.req.query('notebook_id')

  let query = supabase
    .from('notes')
    .select('id, title, notebook_id, word_count, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (notebookId) query = query.eq('notebook_id', notebookId)

  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)

  return c.json(data)
})

// Get single note (full content)
notes.get('/:id', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)  // ownership check — never skip this
    .single()

  if (error || !data) return c.json({ error: 'Note not found' }, 404)

  return c.json(data)
})

// Create note
const createSchema = z.object({
  notebook_id: z.string().uuid(),
  title: z.string().default('Untitled')
})

notes.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const { data, error } = await supabase
    .from('notes')
    .insert({ ...body, user_id: userId, content: {} })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data, 201)
})

// Update note content
const updateSchema = z.object({
  title: z.string().optional(),
  content: z.record(z.any()).optional(),
  word_count: z.number().optional()
})

notes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')
  const body = c.req.valid('json')

  const { data, error } = await supabase
    .from('notes')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data)
})

// Delete note
notes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) return c.json({ error: error.message }, 500)

  return c.json({ success: true })
})

export default notes
```

---

## Flashcard Generation Route

```typescript
// src/routes/flashcards.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { generateFlashcards } from '../services/claude'
import { supabase } from '../db/client'

const flashcards = new Hono()

const generateSchema = z.object({
  note_id: z.string().uuid(),
  selected_text: z.string().optional() // if omitted, use full note
})

flashcards.post('/generate', zValidator('json', generateSchema), async (c) => {
  const userId = c.get('userId')
  const { note_id, selected_text } = c.req.valid('json')

  // Rate limit: max 10 generations per user per day
  // Simple implementation: count today's generations in a table
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)

  if ((count ?? 0) >= 10) {
    return c.json({ error: 'Daily generation limit reached (10/day)' }, 429)
  }

  // Get note content if no selected text provided
  let contentToProcess = selected_text
  if (!contentToProcess) {
    const { data: note } = await supabase
      .from('notes')
      .select('content, title')
      .eq('id', note_id)
      .eq('user_id', userId)
      .single()

    if (!note) return c.json({ error: 'Note not found' }, 404)
    // Extract plain text from ProseMirror JSON
    contentToProcess = extractTextFromProseMirror(note.content)
  }

  const cards = await generateFlashcards(contentToProcess)

  // Log the generation
  await supabase.from('generation_log').insert({ user_id: userId, note_id })

  return c.json(cards)
})

// Save confirmed flashcards
const saveSchema = z.object({
  note_id: z.string().uuid(),
  cards: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
})

flashcards.post('/', zValidator('json', saveSchema), async (c) => {
  const userId = c.get('userId')
  const { note_id, cards } = c.req.valid('json')

  const now = new Date().toISOString()
  const rows = cards.map(card => ({
    user_id: userId,
    note_id,
    question: card.question,
    answer: card.answer,
    next_review_at: now,   // due immediately
    interval_days: 1,
    ease_factor: 2.5
  }))

  const { data, error } = await supabase
    .from('flashcards')
    .insert(rows)
    .select()

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data, 201)
})

export default flashcards

// Helper: extract plain text from ProseMirror JSON
function extractTextFromProseMirror(doc: any): string {
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
```

---

## Claude Service

```typescript
// src/services/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface FlashcardDraft {
  question: string
  answer: string
}

export async function generateFlashcards(content: string): Promise<FlashcardDraft[]> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate 5 to 10 flashcards from the following notes content.
Return ONLY a JSON array, no preamble, no markdown fences.
Each item must have "question" and "answer" fields.
Make questions specific and testable. Keep answers concise.

Content:
${content}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const cards = JSON.parse(text.trim())
    if (!Array.isArray(cards)) throw new Error('Expected array')
    return cards
  } catch {
    throw new Error('Failed to parse flashcards from AI response')
  }
}
```

---

## Spaced Repetition Service (Simplified SM-2)

```typescript
// src/services/spacedrep.ts

interface ReviewResult {
  card_id: string
  correct: boolean
  current_interval: number
  current_ease: number
}

interface UpdatedSchedule {
  next_review_at: string
  interval_days: number
  ease_factor: number
}

export function calculateNextReview(result: ReviewResult): UpdatedSchedule {
  let { current_interval, current_ease } = result

  if (result.correct) {
    // Increase interval
    if (current_interval === 1) {
      current_interval = 3
    } else if (current_interval === 3) {
      current_interval = 7
    } else {
      current_interval = Math.round(current_interval * current_ease)
    }
    // Ease factor increases slightly on correct
    current_ease = Math.min(2.5, current_ease + 0.1)
  } else {
    // Reset on incorrect
    current_interval = 1
    current_ease = Math.max(1.3, current_ease - 0.2)
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + current_interval)

  return {
    next_review_at: nextReview.toISOString(),
    interval_days: current_interval,
    ease_factor: current_ease
  }
}
```

---

## Database Setup (Supabase SQL)

Run these in Supabase's SQL editor to set up your schema.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  google_drive_connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notebooks
create table notebooks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  emoji text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes
create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  notebook_id uuid references notebooks(id) on delete cascade,
  title text not null default 'Untitled',
  content jsonb default '{}',
  word_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flashcards
create table flashcards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  note_id uuid references notes(id) on delete set null,
  question text not null,
  answer text not null,
  interval_days integer default 1,
  ease_factor float default 2.5,
  next_review_at timestamptz default now(),
  times_reviewed integer default 0,
  times_correct integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Review sessions
create table review_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  cards_reviewed integer default 0,
  cards_correct integer default 0,
  accuracy float
);

-- Generation log (for rate limiting)
create table generation_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  note_id uuid,
  created_at timestamptz default now()
);

-- Row Level Security (critical — never skip this)
alter table profiles enable row level security;
alter table notebooks enable row level security;
alter table notes enable row level security;
alter table flashcards enable row level security;
alter table review_sessions enable row level security;
alter table generation_log enable row level security;

-- RLS policies (users can only access their own data)
create policy "Users own their profiles" on profiles
  for all using (auth.uid() = id);

create policy "Users own their notebooks" on notebooks
  for all using (auth.uid() = user_id);

create policy "Users own their notes" on notes
  for all using (auth.uid() = user_id);

create policy "Users own their flashcards" on flashcards
  for all using (auth.uid() = user_id);

-- Indexes for performance
create index notes_user_id_idx on notes(user_id);
create index notes_notebook_id_idx on notes(notebook_id);
create index flashcards_user_id_next_review_idx on flashcards(user_id, next_review_at);
create index generation_log_user_id_created_at_idx on generation_log(user_id, created_at);
```

---

## Environment Variables

```env
# .env
PORT=3001
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # service role — not anon key, for server-side queries

ANTHROPIC_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Important:** The backend uses the Supabase **service role key**, not the anon key. This bypasses RLS — which is fine because you're enforcing ownership checks manually in every route (`.eq('user_id', userId)`). Never expose the service role key to the frontend.

---

## Deployment (Railway)

```bash
# package.json scripts
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

Railway detects Node.js automatically. Set environment variables in the Railway dashboard. The app will be assigned a Railway URL — set that as `NEXT_PUBLIC_API_URL` in your Vercel frontend deployment.

---

## MVP Build Order

1. Project scaffold — Hono app, TypeScript config, env setup
2. Supabase schema — run SQL migrations
3. Auth middleware — JWT validation
4. Notebooks CRUD routes
5. Notes CRUD routes (including ownership checks)
6. Flashcard generation route + Claude service
7. Flashcard save + list routes
8. Study/review routes (due cards query, submit review result)
9. SM-2 scheduling on review submission
10. Google Drive backup route
11. Rate limiting on generation endpoint
12. Deploy to Railway, point frontend at it

---

## Future-proofing for Mobile (Phase 3)

The backend is already mobile-ready because it's a standalone HTTP API. When you build the React Native app:

- It calls the same Hono endpoints with the same JWT auth
- Add push notification support via Expo Notifications + a `POST /api/v1/notifications/register` endpoint to store device tokens
- Add a `GET /api/v1/study/summary` endpoint for the mobile home screen widget
- For the app-blocking feature, add `POST /api/v1/blocking/rules` to store which apps a user has blocked and the flashcard gate condition — the mobile app reads this on launch

No backend rearchitecture needed. Just new routes.
