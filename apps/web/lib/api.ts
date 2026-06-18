import { supabase } from './supabase'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  let token: string | undefined

  try {
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token
  } catch (e) {
    console.warn('Could not fetch supabase session', e)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || `API error: ${response.status}`)
  }

  return response.json()
}

export interface Notebook {
  id: string
  title: string
  emoji: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  notebook_id: string
  content: any
  word_count: number
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  note_id: string
  question: string
  answer: string
  created_at: string
}

export const api = {
  notebooks: {
    list: () => apiCall<Notebook[]>('/api/v1/notebooks'),
    create: (data: { title: string; emoji?: string }) =>
      apiCall<Notebook>('/api/v1/notebooks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiCall<{ success: boolean }>(`/api/v1/notebooks/${id}`, {
        method: 'DELETE',
      }),
  },
  notes: {
    list: (notebookId?: string) =>
      apiCall<Note[]>(`/api/v1/notes${notebookId ? `?notebook_id=${notebookId}` : ''}`),
    get: (id: string) => apiCall<Note>(`/api/v1/notes/${id}`),
    create: (data: { notebook_id: string; title?: string }) =>
      apiCall<Note>('/api/v1/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { title?: string; content?: any; word_count?: number }) =>
      apiCall<Note>(`/api/v1/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiCall<{ success: boolean }>(`/api/v1/notes/${id}`, {
        method: 'DELETE',
      }),
  },
  flashcards: {
    generate: (noteId: string, selectedText?: string) =>
      apiCall<Array<{ question: string; answer: string }>>('/api/v1/flashcards/generate', {
        method: 'POST',
        body: JSON.stringify({ note_id: noteId, selected_text: selectedText }),
      }),
    save: (noteId: string, cards: Array<{ question: string; answer: string }>) =>
      apiCall<Flashcard[]>('/api/v1/flashcards', {
        method: 'POST',
        body: JSON.stringify({ note_id: noteId, cards }),
      }),
  },
}
