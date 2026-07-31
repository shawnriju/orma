'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Search, Plus, AlertCircle } from 'lucide-react'
import { api, Note } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesPageStyles } from './_components/styles'
import NoteCard from './_components/NoteCard'

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
    <div className={notesPageStyles.wrapper}>
      {/* Header */}
      <header className={notesPageStyles.header}>
        <h1 className={notesPageStyles.title}>My Notes</h1>
        <div className={notesPageStyles.searchBox}>
          <Search className={notesPageStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={notesPageStyles.searchInput}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className={notesPageStyles.contentArea}>
        {isLoading ? (
          <div className={notesPageStyles.loadingText}>Loading notes...</div>
        ) : error ? (
          <div className={notesPageStyles.errorRow}>
            <AlertCircle className={notesPageStyles.errorIcon} />
            <span>Could not fetch notes. Make sure backend is running.</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={notesPageStyles.emptyWrap}>
            <div className={notesPageStyles.emptyIconBadge}>
              <FileText className={notesPageStyles.emptyIcon} />
            </div>
            <div>
              <h3 className={notesPageStyles.emptyHeading}>No notes found</h3>
              <p className={notesPageStyles.emptyBodyText}>
                Create your first note to start writing, planning, and studying.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className={notesPageStyles.createButton}
            >
              <Plus className={notesPageStyles.createIcon} />
              <span>Create Your First Note</span>
            </button>
          </div>
        ) : (
          <div className={notesPageStyles.grid}>
            {filteredNotes.map((note: Note) => (
              <NoteCard
                key={note.id}
                note={note}
                preview={getNotePreview(note.content)}
                isMenuOpen={activeMenuNoteId === note.id}
                onOpenNote={() => router.push(`/notes/${note.id}`)}
                onToggleMenu={(e) => {
                  e.stopPropagation()
                  setActiveMenuNoteId(activeMenuNoteId === note.id ? null : note.id)
                }}
                onRename={() => {
                  setActiveMenuNoteId(null)
                  handleRename(note.id, note.title)
                }}
                onDelete={() => {
                  setActiveMenuNoteId(null)
                  handleDelete(note.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
