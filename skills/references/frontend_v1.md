# Frontend Architecture
## NoteFlash MVP — Next.js + TypeScript

---

## Stack

| Tool | Purpose |
|---|---|
| Next.js 14+ (App Router) | Framework, routing, SSR |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library (built on Radix UI) |
| Tiptap | Block-based rich text editor |
| Zustand | Lightweight client state management |
| TanStack Query | Server state, caching, background refetch |
| Supabase JS SDK | Auth, client-side session management |
| Google APIs JS Client | Google Drive backup |

---

## Project Structure

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts           ← OAuth callback handler
│   ├── (app)/
│   │   ├── layout.tsx             ← App shell: sidebar + main content area
│   │   ├── notes/
│   │   │   ├── page.tsx           ← Notes dashboard
│   │   │   └── [noteId]/
│   │   │       └── page.tsx       ← Note editor
│   │   ├── study/
│   │   │   ├── page.tsx           ← Study home
│   │   │   └── [deckId]/
│   │   │       └── page.tsx       ← Review session
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx                 ← Root layout: fonts, providers
│   └── page.tsx                   ← Landing page
├── components/
│   ├── editor/
│   │   ├── Editor.tsx             ← Tiptap editor wrapper
│   │   ├── EditorToolbar.tsx      ← Floating + fixed toolbar
│   │   ├── SlashCommands.tsx      ← "/" command menu
│   │   └── extensions/            ← Custom Tiptap extensions
│   ├── flashcards/
│   │   ├── FlashcardPanel.tsx     ← Slide-in panel after generation
│   │   ├── FlashcardCard.tsx      ← Single editable card
│   │   └── ReviewCard.tsx         ← Flip card for study mode
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── NotebookList.tsx
│   │   └── NoteList.tsx
│   └── ui/                        ← shadcn/ui components live here
├── hooks/
│   ├── useNote.ts
│   ├── useNotebooks.ts
│   ├── useFlashcards.ts
│   └── useStudySession.ts
├── lib/
│   ├── api.ts                     ← Typed API client (wraps fetch to Hono)
│   ├── supabase.ts                ← Supabase client init
│   └── utils.ts
├── stores/
│   └── editorStore.ts             ← Zustand: current note, save state
└── types/
    └── index.ts                   ← Shared TypeScript types
```

---

## Key Implementation Details

### Auth Setup (Supabase SSR)

Use `@supabase/ssr` — not the old `@supabase/auth-helpers-nextjs`.

```typescript
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Middleware file at `middleware.ts` in the root — refreshes sessions on every request:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Refresh session, redirect unauthenticated users away from /app/*
}

export const config = {
  matcher: ['/app/:path*']
}
```

---

### Tiptap Editor Setup

Install:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-highlight @tiptap/extension-task-list @tiptap/extension-task-item
npm install @tiptap/extension-code-block-lowlight lowlight
```

Core editor component:

```typescript
// components/editor/Editor.tsx
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface EditorProps {
  noteId: string
  initialContent: object | null
  onSave: (content: object) => Promise<void>
}

export function Editor({ noteId, initialContent, onSave }: EditorProps) {
  const debouncedSave = useDebouncedCallback(async (content: object) => {
    await onSave(content)
  }, 2000)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Untitled'
          return "Type '/' for commands..."
        }
      })
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON())
    }
  })

  return <EditorContent editor={editor} className="prose prose-neutral max-w-none" />
}
```

**Key note:** Store `editor.getJSON()` in the database, not `editor.getHTML()`. JSON is queryable, diff-able, and lets you attach metadata to blocks later.

---

### API Client

All calls go to the Hono backend. Centralise fetch logic here:

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL // Railway URL

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
      ...options?.headers,
    }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Typed wrappers
export const api = {
  notes: {
    list: (notebookId?: string) => 
      apiCall<Note[]>(`/api/v1/notes${notebookId ? `?notebook_id=${notebookId}` : ''}`),
    get: (id: string) => 
      apiCall<Note>(`/api/v1/notes/${id}`),
    update: (id: string, content: object) =>
      apiCall<Note>(`/api/v1/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content })
      }),
  },
  flashcards: {
    generate: (noteId: string, selectedText?: string) =>
      apiCall<FlashcardDraft[]>('/api/v1/flashcards/generate', {
        method: 'POST',
        body: JSON.stringify({ note_id: noteId, selected_text: selectedText })
      }),
  }
}
```

---

### Save State (Zustand)

```typescript
// stores/editorStore.ts
import { create } from 'zustand'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface EditorStore {
  saveState: SaveState
  setSaveState: (state: SaveState) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  saveState: 'idle',
  setSaveState: (saveState) => set({ saveState })
}))
```

Display this in the top bar: show nothing when idle, "Saving..." when saving, "Saved" (fades after 2s) when saved.

---

### Flashcard Generation UI

The generate button appears in two places:
1. The note top bar — "Generate Cards" (uses full note)
2. The selection toolbar — appears when text is highlighted

After the API call returns, slide in a right panel (use shadcn/ui `Sheet` component):

```typescript
// components/flashcards/FlashcardPanel.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Cards are editable before saving
// Each card has: question textarea, answer textarea, delete button
// Bottom: Cancel + Save Cards button
```

---

### Review Session (Flip Card)

Keep this simple for MVP — no animations required, though a CSS flip transition is straightforward if desired.

State machine for a review session:
```
idle → showing_question → showing_answer → (next card or end)
```

```typescript
const [phase, setPhase] = useState<'question' | 'answer'>('question')
const [cardIndex, setCardIndex] = useState(0)
const [results, setResults] = useState<Record<string, boolean>>({})

const handleFlip = () => setPhase('answer')
const handleResult = (correct: boolean) => {
  setResults(prev => ({ ...prev, [currentCard.id]: correct }))
  setPhase('question')
  setCardIndex(i => i + 1)
}
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://your-app.railway.app
GOOGLE_CLIENT_ID=         # for Drive OAuth
GOOGLE_CLIENT_SECRET=
```

---

## UI/UX Principles

- **Editor must feel fast.** Optimistic updates everywhere — don't wait for the API to update the UI.
- **Sidebar is always visible on desktop**, collapsible on mobile.
- **No modals for destructive actions** that aren't reversible — use inline confirmation instead.
- **Empty states are friendly and actionable** — always include a single CTA.
- **Colour palette:** Neutral base (zinc/slate) with a single accent colour. Don't use multiple accent colours.
- **Typography:** Use a monospace or semi-monospace font inside the editor. Use a clean sans-serif everywhere else. Inter is the safe default.
- **Dark mode:** Build it from day one using Tailwind's `dark:` variant and CSS variables. Much harder to retrofit later.

---

## MVP Build Order

1. Auth screens (login, signup, OAuth callback)
2. App shell layout (sidebar + main area, responsive)
3. Notebook CRUD (create, rename, delete)
4. Note list inside a notebook
5. Tiptap editor with auto-save
6. Flashcard generation flow (API call → editable panel → save)
7. Flashcard review session (flip card → mark result → summary)
8. Google Drive backup (Settings page)
9. Polish: empty states, loading states, error handling, toasts
