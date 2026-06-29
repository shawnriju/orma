'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Trash2, Library, X, Edit3 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Note, Flashcard } from '../../../../lib/api'
import Editor from '../../../../components/editor/Editor'
import FlashcardPanel from '../../../../components/flashcards/FlashcardPanel'
import EditFlashcardModal from '../../../../components/flashcards/EditFlashcardModal'
import styles from './page.module.css'

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const noteId = params.noteId as string

  const [isCardsPanelOpen, setIsCardsPanelOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: () => api.notes.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push('/notes')
    }
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteMutation.mutateAsync()
      } catch (err) {
        alert('Failed to delete note')
      }
    }
  }

  // Fetch single note details
  const { data: note, isLoading, error } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => api.notes.get(noteId)
  })

  // Fetch notebooks to find notebook title for breadcrumbs
  const { data: notebooks } = useQuery({
    queryKey: ['notebooks'],
    queryFn: () => api.notebooks.list()
  })

  const currentNotebook = notebooks?.find(n => n.id === note?.notebook_id)

  // Fetch flashcard stats for this note
  const { data: stats } = useQuery({
    queryKey: ['note-stats', noteId],
    queryFn: () => api.notes.flashcardStats(noteId),
    enabled: !!noteId,
  })

  // Fetch existing flashcards
  const { data: flashcards, isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ['flashcards', noteId],
    queryFn: () => api.flashcards.list(noteId),
    enabled: !!noteId && isCardsPanelOpen,
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (data: { title?: string; content?: any; word_count?: number }) => 
      api.notes.update(noteId, data),
    onSuccess: (updatedNote) => {
      // Direct cache update to prevent flashing and avoid refetching all note lists on every autosave.
      queryClient.setQueryData(['note', noteId], updatedNote)
      queryClient.setQueriesData<Note[]>({ queryKey: ['notes'] }, (existingNotes) => {
        if (!existingNotes) return existingNotes

        return existingNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                ...updatedNote,
              }
            : note
        )
      })
    }
  })

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        Loading workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <h2 className={styles.errorTitle}>Note not found</h2>
        <p className={styles.errorText}>
          This note could not be retrieved. It may have been deleted, or you might not have permission to view it.
        </p>
        <Link 
          href="/notes" 
          className={styles.backButton}
        >
          Back to Notes
        </Link>
      </div>
    )
  }

  const handleSave = async (data: { title?: string; content?: any; word_count?: number }) => {
    await updateNoteMutation.mutateAsync(data)
  }

  return (
    <div className={styles.pageShell}>
      {/* Note Workspace Top Bar Header */}
      <header className={styles.topBar}>
        {/* Breadcrumb Path */}
        <div className={styles.breadcrumbRow}>
          <Link 
            href="/notes" 
            className={styles.backIconButton}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={styles.breadcrumbText}>
            {currentNotebook ? (
              <span className="flex items-center gap-1.5 min-w-0">
                <span>{currentNotebook.emoji || '📁'}</span>
                <span>{currentNotebook.title}</span>
                <span className="opacity-50">/</span>
                <span className="truncate max-w-[150px]">{note?.title || 'Untitled Note'}</span>
              </span>
            ) : (
              <span>Workspace</span>
            )}
          </div>
        </div>

        {/* Note Actions */}
        <div className={styles.actionRow}>
          <button
            onClick={() => setIsCardsPanelOpen(!isCardsPanelOpen)}
            className={`${styles.cardsToggle} ${isCardsPanelOpen ? styles.cardsToggleActive : styles.cardsToggleInactive}`}
          >
            <Library className="w-4 h-4" />
            <span>Cards</span>
            {stats && stats.totalCount > 0 && (
              <span className={isCardsPanelOpen ? styles.cardsToggleBadgeActive : styles.cardsToggleBadgeInactive}>
                {stats.totalCount}
              </span>
            )}
          </button>
          
          <div className="w-px h-4 bg-[#dac1b9]/50 mx-1"></div>
          
          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className={styles.mainLayout}>
        {/* Editor Area */}
        <div className={styles.editorPane}>
          <div className={styles.editorSpacer}>
            <Editor 
              noteId={noteId}
              initialTitle={note?.title || 'Untitled Note'}
              initialContent={note?.content}
              onSave={handleSave}
            />
          </div>

        </div>

        {/* Existing Flashcards Side Panel */}
        {isCardsPanelOpen && (
          <div className={styles.cardsPane}>
            <div className={styles.cardsPaneHeader}>
              <h3 className={styles.cardsPaneTitle}>
                <Library className="w-4 h-4 text-[#d67d5c]" />
                Generated Cards
              </h3>
              <div className={styles.cardsPaneActionRow}>
                {stats && stats.dueCount > 0 && (
                  <Link
                    href={`/study?noteId=${noteId}`}
                    className={styles.studyDueButton}
                  >
                    Study Due ({stats.dueCount})
                  </Link>
                )}
                <button 
                  onClick={() => setIsCardsPanelOpen(false)}
                  className={styles.closeCardsButton}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className={styles.cardsPaneBody}>
              {isLoadingFlashcards ? (
                <div className={styles.loadingState}>Loading cards...</div>
              ) : !flashcards || flashcards.length === 0 ? (
                <div className={styles.cardsEmptyState}>
                  <div className={styles.cardsEmptyIcon}>
                    <Library className="w-6 h-6" />
                  </div>
                  <p className={styles.errorText}>No flashcards generated yet.</p>
                </div>
              ) : (
                <div className={styles.cardList}>
                  {flashcards.map((card) => (
                    <div key={card.id} className={styles.flashcardItem}>
                      <button 
                        onClick={() => setEditingCard(card)}
                        className={styles.flashcardEditButton}
                        title="Edit Flashcard"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <span className={styles.flashcardLabel}>Question</span>
                        <p className={styles.flashcardQuestion}>{card.question}</p>
                      </div>
                      <div className={styles.flashcardDivider}></div>
                      <div>
                        <span className={styles.flashcardLabel}>Answer</span>
                        <p className={styles.flashcardAnswer}>{card.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <FlashcardPanel noteId={noteId} wordCount={note?.word_count ?? 0} />
      
      {editingCard && (
        <EditFlashcardModal 
          flashcard={editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  )
}
