'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Search, Plus, Sparkles, AlertCircle, MoreVertical, Edit3, Trash2 } from 'lucide-react'
import { api, Note } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../workspace.module.css'

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
    <div className={styles.workspacePage}>
      {/* Header */}
      <header className={styles.workspaceHeaderCompact}>
        <h1 className={styles.workspaceHeaderTitle}>My Notes</h1>
        <div className={styles.workspaceHeaderSearch}>
          <Search className={styles.workspaceNavIcon} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.workspaceHeaderSearchInput}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className={styles.workspaceContent}>
        {isLoading ? (
          <div className={styles.workspacePageLoading}>Loading notes...</div>
        ) : error ? (
          <div className={styles.workspaceErrorState}>
            <AlertCircle className={styles.workspaceMainToggleIcon} />
            <span>Could not fetch notes. Make sure backend is running.</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={styles.workspaceEmptyState}>
            <div className={styles.workspaceEmptyIcon}>
              <FileText className={styles.workspaceNavIcon} />
            </div>
            <div>
              <h3 className={styles.workspaceEmptyTitle}>No notes found</h3>
              <p className={styles.workspaceEmptyText}>
                Create your first note to start writing, planning, and studying.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className={styles.workspaceButtonPrimary}
            >
              <Plus className={styles.workspaceNavIcon} />
              <span>Create Your First Note</span>
            </button>
          </div>
        ) : (
          <div className={styles.workspaceNoteGrid}>
            {filteredNotes.map((note: Note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className={styles.workspaceNoteCard}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className={`${styles.workspaceNoteCardTitle} ${styles.workspaceNoteCardTitleHover}`}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className={styles.workspaceNoteMenuWrap}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuNoteId(activeMenuNoteId === note.id ? null : note.id)
                        }}
                        className={styles.workspaceNoteMenuButton}
                      >
                        <MoreVertical className={styles.workspaceNavIcon} />
                      </button>
                      {activeMenuNoteId === note.id && (
                        <div className={styles.workspaceNoteMenu}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuNoteId(null)
                              handleRename(note.id, note.title)
                            }}
                            className={styles.workspaceNoteMenuItem}
                          >
                            <Edit3 className={styles.workspaceNavIcon} />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuNoteId(null)
                              handleDelete(note.id)
                            }}
                            className={`${styles.workspaceNoteMenuItem} ${styles.workspaceNoteMenuDanger}`}
                          >
                            <Trash2 className={styles.workspaceNavIcon} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={styles.workspaceNotePreview}>
                    {getNotePreview(note.content)}
                  </p>
                </div>
                <div className={styles.workspaceNoteCardMeta}>
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
