'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Note, Flashcard } from '../../../../lib/api'
import Editor from '../../../../components/editor/Editor'
import FlashcardPanel from '../../../../components/flashcards/FlashcardPanel'
import EditFlashcardModal from '../../../../components/flashcards/EditFlashcardModal'
import { loadingStateStyles, errorStateStyles, workspaceWrapStyles } from './_components/styles'
import NoteWorkspaceHeader from './_components/NoteWorkspaceHeader'
import FlashcardsSidePanel from './_components/FlashcardsSidePanel'

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
      <div className={loadingStateStyles.container}>
        Loading workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className={errorStateStyles.container}>
        <h2 className={errorStateStyles.heading}>Note not found</h2>
        <p className={errorStateStyles.bodyText}>
          This note could not be retrieved. It may have been deleted, or you might not have permission to view it.
        </p>
        <Link
          href="/notes"
          className={errorStateStyles.backLink}
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
    <div className={workspaceWrapStyles.wrapper}>
      <NoteWorkspaceHeader
        notebook={currentNotebook}
        noteTitle={note?.title || 'Untitled Note'}
        isCardsPanelOpen={isCardsPanelOpen}
        onToggleCardsPanel={() => setIsCardsPanelOpen(!isCardsPanelOpen)}
        cardsCount={stats?.totalCount}
        onDelete={handleDelete}
      />

      {/* Main Workspace Layout */}
      <div className={workspaceWrapStyles.mainLayout}>
        {/* Editor Area */}
        <div className={workspaceWrapStyles.editorArea}>
          <div className={workspaceWrapStyles.editorInner}>
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
          <FlashcardsSidePanel
            isLoading={isLoadingFlashcards}
            flashcards={flashcards}
            dueCount={stats?.dueCount}
            noteId={noteId}
            onClose={() => setIsCardsPanelOpen(false)}
            onEditCard={setEditingCard}
          />
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
