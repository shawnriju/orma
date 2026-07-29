'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Search, Plus, Sparkles, AlertCircle, MoreVertical, Edit3, Trash2 } from 'lucide-react'
import { api, Note } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const notebookId = searchParams.get('notebook_id') || undefined
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null)

  // Fetch all notes
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: () => api.notes.list(notebookId)
  })

  // Click-away listener for note cards context menus
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuNoteId(null)
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (nbId: string) => api.notes.create({ notebook_id: nbId, title: 'Untitled Note' }),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push(`/notes/${newNote.id}`)
    }
  })

  // Rename note mutation
  const renameNoteMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => api.notes.update(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.notes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })

  const handleRename = async (noteId: string, currentTitle: string) => {
    const newTitle = window.prompt('Rename Note', currentTitle)
    if (newTitle !== null && newTitle.trim() !== '') {
      try {
        await renameNoteMutation.mutateAsync({ id: noteId, title: newTitle.trim() })
      } catch (err) {
        alert('Failed to rename note')
      }
    }
  }

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteMutation.mutateAsync(noteId)
      } catch (err) {
        alert('Failed to delete note')
      }
    }
  }

  const handleCreateNote = async () => {
    // If notebookId is present, create inside it. Otherwise fetch notebooks first or use default
    if (notebookId) {
      createNoteMutation.mutate(notebookId)
    } else {
      const notebooks = await api.notebooks.list().catch(() => [])
      if (notebooks.length > 0) {
        createNoteMutation.mutate(notebooks[0].id)
      } else {
        const newNb = await api.notebooks.create({ title: 'My Notebook' })
        createNoteMutation.mutate(newNb.id)
      }
    }
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter((note: Note) => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Helper: robust text extraction from ProseMirror JSON
  const getNotePreview = (content: any): string => {
    if (!content) return 'No content yet.'
    // If it's a string, try parsing it
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content)
      } catch {
        return content
      }
    }
    if (!content.content || !Array.isArray(content.content)) return 'No content yet.'
    
    const textSegments: string[] = []
    const extractText = (node: any) => {
      if (node.type === 'text' && node.text) {
        textSegments.push(node.text)
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractText)
      }
    }
    
    content.content.forEach(extractText)
    const fullText = textSegments.join(' ').trim()
    return fullText || 'No content yet.'
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden px-8 py-8 gap-8 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 shrink-0">
        <h1 className="text-3xl font-bold font-headline-md text-primary">My Notes</h1>
        <div className="flex items-center gap-2 w-72 bg-surface border border-outline-variant/40 rounded-xl py-2 px-4 focus-within:border-primary-container transition-colors">
          <Search className="w-5 h-5 text-outline" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-sm text-on-surface placeholder:text-outline/70"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="min-h-[50vh] flex items-center justify-center text-sm text-outline">Loading notes...</div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-12 text-center text-error text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Could not fetch notes. Make sure backend is running.</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="max-w-md mx-auto py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-on-surface">No notes found</h3>
              <p className="text-sm leading-relaxed text-outline">
                Create your first note to start writing, planning, and studying.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Note</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note: Note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="relative flex flex-col justify-between gap-4 p-5 bg-surface border border-outline-variant/30 rounded-2xl cursor-pointer hover:border-primary-container hover:shadow-sm hover:-translate-y-px transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className={`${"pr-6 text-base font-semibold text-on-surface leading-snug group-hover:text-primary"} ${"group-hover:text-primary"}`}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuNoteId(activeMenuNoteId === note.id ? null : note.id)
                        }}
                        className="p-1 rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {activeMenuNoteId === note.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-outline-variant/40 rounded-xl shadow-lg py-1 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuNoteId(null)
                              handleRename(note.id, note.title)
                            }}
                            className="w-full flex items-center gap-2 py-2 px-4 text-left text-xs transition-colors hover:bg-surface hover:text-primary"
                          >
                            <Edit3 className="w-5 h-5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuNoteId(null)
                              handleDelete(note.id)
                            }}
                            className={`${"w-full flex items-center gap-2 py-2 px-4 text-left text-xs transition-colors hover:bg-surface hover:text-primary"} ${"text-error hover:bg-error-container/30"}`}
                          >
                            <Trash2 className="w-5 h-5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-outline line-clamp-3">
                    {getNotePreview(note.content)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 text-[11px] font-medium text-outline">
                  <span>{note.word_count || 0} words</span>
                  <span>{note.updated_at ? new Date(note.updated_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
