# Flow Document
## NoteFlash — User Flows & System Flows

**Version:** 0.1 (MVP)

---

## 1. User Flows

### 1.1 Onboarding Flow

```
Landing Page
    ↓
[Sign Up] clicked
    ↓
Auth Screen
    ├── Email + Password → Email verification → Dashboard
    └── Continue with Google → OAuth consent → Dashboard

Dashboard (first time)
    ↓
Empty state with prompt: "Create your first notebook"
    ↓
User creates notebook → creates first note → editor opens
```

---

### 1.2 Note Creation Flow

```
Dashboard / Sidebar
    ↓
User clicks [+ New Note] inside a notebook
    ↓
Note opens in editor (untitled, cursor in title field)
    ↓
User types title → presses Enter → cursor moves to body
    ↓
User writes content
    ├── Types "/" → slash command menu appears (insert block type)
    ├── Selects text → inline toolbar appears (bold, italic, highlight, etc.)
    └── Pastes content → formatted intelligently
    ↓
Auto-save triggers 2s after last keystroke
    ↓
Save indicator: "Saving..." → "Saved" in top bar
```

---

### 1.3 Flashcard Generation Flow

```
User is inside a note
    ↓
Option A: Select specific text → floating toolbar shows [Generate Flashcards]
Option B: Click [⚡ Generate Cards] button in top bar (uses full note)
    ↓
Loading state: "Generating flashcards..."
(Hono API → Claude Haiku → structured JSON response)
    ↓
Flashcard review panel slides in from the right
    ├── Shows 5–10 generated Q&A pairs
    ├── User can edit any card inline
    ├── User can delete individual cards with [×]
    └── [Save Cards] button at bottom
    ↓
Cards saved to DB, linked to source note
    ↓
Success toast: "8 cards added to [Note Title] deck"
```

---

### 1.4 Flashcard Review Flow

```
User clicks [Study] in sidebar or note header
    ↓
Deck selection screen
    ├── All due cards (across all notes)
    └── Specific note's deck
    ↓
Review session starts
    ↓
Card shown — Question side facing up
    ↓
User reads question → clicks [Flip] or presses Space
    ↓
Answer revealed
    ↓
User selects:
    ├── [Got it] → card marked correct, SM-2 interval increases
    └── [Missed it] → card marked incorrect, shown again later in session
    ↓
Next card loads
    ↓
Session ends when all due cards reviewed
    ↓
Summary screen:
    ├── Cards reviewed: N
    ├── Accuracy: X%
    └── [Back to Notes] or [Review Again]
```

---

### 1.5 Cloud Backup Flow (Google Drive)

```
User goes to Settings → Backup
    ↓
[Connect Google Drive] button
    ↓
Google OAuth flow (drive.file scope — access only to files this app creates)
    ↓
User selects backup frequency: Manual / Daily / Weekly
    ↓
[Backup Now] or automatic trigger fires
    ↓
Hono API fetches all user notes
    ↓
Each note converted to .md file (title as filename)
    ↓
Files written to /NoteFlash/ folder in user's Google Drive
    ↓
Success: "42 notes backed up to Google Drive"
```

---

## 2. System Flows

### 2.1 Authentication Flow

```
Client (Next.js)
    ↓
User submits credentials
    ↓
Supabase Auth SDK (client-side)
    ↓
Supabase returns JWT access token + refresh token
    ↓
Tokens stored in httpOnly cookies (Supabase SSR helper handles this)
    ↓
Every request to Hono API includes Authorization: Bearer <token>
    ↓
Hono middleware validates JWT against Supabase public key
    ↓
Request proceeds with user context attached
```

---

### 2.2 Note Save Flow

```
User types in Tiptap editor
    ↓
Tiptap onChange fires
    ↓
Debounce: 2000ms
    ↓
Frontend calls PATCH /api/v1/notes/:id
    ↓
Hono validates JWT → extracts user_id
    ↓
Verifies note belongs to user (ownership check)
    ↓
Updates notes table in Supabase Postgres
    ├── content (ProseMirror JSON)
    ├── updated_at
    └── word_count
    ↓
Returns 200 → frontend updates save indicator to "Saved"
```

---

### 2.3 Flashcard Generation Flow (System)

```
Client sends POST /api/v1/flashcards/generate
    Body: { note_id, selected_text OR full_note_flag }
    ↓
Hono middleware: auth check + rate limit check
    (max 10 generations per user per day, stored in Redis or Supabase)
    ↓
Fetch note content from DB (if full note flag)
    ↓
Build Claude prompt:
    System: "You are a flashcard generator. Return only JSON..."
    User: "Generate 5-10 flashcards from this content: [content]"
    ↓
POST to Anthropic API (claude-haiku-4-5)
    ↓
Parse response JSON
    ↓
Return flashcard array to client
    ↓
Client shows editable preview panel
    ↓
User confirms → client sends POST /api/v1/flashcards/save
    ↓
Cards saved to flashcards table with note_id foreign key
```

---

### 2.4 Spaced Repetition Scheduling (Simplified SM-2)

```
After each review session:
    ↓
For each card reviewed:
    ├── Correct → increase interval (1d → 3d → 7d → 14d → 30d)
    └── Incorrect → reset interval to 1 day
    ↓
Update flashcard record:
    ├── next_review_at = now + interval
    ├── interval_days
    └── ease_factor (SM-2 quality score)

When user opens Study:
    ↓
Query: SELECT * FROM flashcards
    WHERE user_id = ? AND next_review_at <= now()
    ORDER BY next_review_at ASC
    ↓
Return due cards for the session
```

---

## 3. Data Models

### users
Managed by Supabase Auth. Extended profile in a `profiles` table.

```
profiles
├── id (uuid, FK to auth.users)
├── display_name
├── avatar_url
├── google_drive_connected (boolean)
├── google_drive_refresh_token (encrypted)
├── created_at
└── updated_at
```

### notebooks
```
notebooks
├── id (uuid)
├── user_id (uuid, FK profiles)
├── title
├── emoji (optional icon)
├── created_at
└── updated_at
```

### notes
```
notes
├── id (uuid)
├── user_id (uuid, FK profiles)
├── notebook_id (uuid, FK notebooks)
├── title
├── content (jsonb — ProseMirror JSON)
├── word_count
├── created_at
└── updated_at
```

### flashcards
```
flashcards
├── id (uuid)
├── user_id (uuid, FK profiles)
├── note_id (uuid, FK notes — nullable if standalone)
├── question (text)
├── answer (text)
├── interval_days (integer, default 1)
├── ease_factor (float, default 2.5)
├── next_review_at (timestamp)
├── times_reviewed (integer)
├── times_correct (integer)
├── created_at
└── updated_at
```

### review_sessions
```
review_sessions
├── id (uuid)
├── user_id (uuid, FK profiles)
├── started_at
├── completed_at
├── cards_reviewed (integer)
├── cards_correct (integer)
└── accuracy (float)
```

---

## 4. Page / Route Map

### Frontend (Next.js)

```
/                       → Landing page (marketing)
/auth/login             → Login screen
/auth/signup            → Sign up screen
/auth/callback          → OAuth callback handler

/app                    → Dashboard (redirects to /app/notes if authenticated)
/app/notes              → Notes home — all notebooks listed
/app/notes/[noteId]     → Single note editor view
/app/study              → Study home — due cards count, deck list
/app/study/[deckId]     → Flashcard review session
/app/settings           → Account settings, backup config
```

### Backend (Hono)

```
GET    /health

POST   /api/v1/auth/verify          → Validate JWT (used internally)

GET    /api/v1/notebooks            → List user notebooks
POST   /api/v1/notebooks            → Create notebook
PATCH  /api/v1/notebooks/:id        → Update notebook
DELETE /api/v1/notebooks/:id        → Delete notebook

GET    /api/v1/notes                → List notes (by notebook, or all)
POST   /api/v1/notes                → Create note
GET    /api/v1/notes/:id            → Get single note
PATCH  /api/v1/notes/:id            → Update note content
DELETE /api/v1/notes/:id            → Delete note

POST   /api/v1/flashcards/generate  → Generate cards from content (AI)
GET    /api/v1/flashcards           → List user's flashcards (filterable by note)
POST   /api/v1/flashcards           → Save flashcard batch
PATCH  /api/v1/flashcards/:id       → Edit single card
DELETE /api/v1/flashcards/:id       → Delete card

GET    /api/v1/study/due            → Get due cards for today
POST   /api/v1/study/review         → Submit review result for a card
POST   /api/v1/study/session        → Save completed review session summary

POST   /api/v1/backup/google-drive  → Trigger Google Drive backup
GET    /api/v1/backup/status        → Last backup status
```
