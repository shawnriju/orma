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
      <div className="flex-1 flex items-center justify-center bg-white text-outline text-sm">
        Loading workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-6 gap-4">
        <h2 className="text-lg font-bold text-error">Note not found</h2>
        <p className="text-sm text-outline max-w-sm leading-relaxed">
          This note could not be retrieved. It may have been deleted, or you might not have permission to view it.
        </p>
        <Link 
          href="/notes" 
          className="inline-flex items-center justify-center py-2 px-4 bg-primary-container text-white text-xs font-semibold rounded-xl hover:bg-primary transition-colors"
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
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Note Workspace Top Bar Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 bg-white shrink-0">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            href="/notes" 
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-xs font-semibold uppercase tracking-wider text-outline min-w-0">
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCardsPanelOpen(!isCardsPanelOpen)}
            className={`${"inline-flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all"} ${isCardsPanelOpen ? "bg-primary-container text-white shadow-sm" : "text-outline hover:bg-surface-container hover:text-on-surface-variant"}`}
          >
            <Library className="w-4 h-4" />
            <span>Cards</span>
            {stats && stats.totalCount > 0 && (
              <span className={isCardsPanelOpen ? "py-0.5 px-1.5 rounded-full bg-white text-primary-container text-[10px]" : "py-0.5 px-1.5 rounded-full bg-primary-container text-white text-[10px]"}>
                {stats.totalCount}
              </span>
            )}
          </button>
          
          <div className="w-px h-4 bg-[#dac1b9]/50 mx-1"></div>
          
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-error hover:bg-error-container/50 hover:text-on-error-container transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 min-h-0 overflow-y-auto relative">
          <div className="flex-1 pb-24">
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
          <div className="w-80 shrink-0 flex flex-col overflow-hidden bg-surface/50 border-l border-outline-variant/30">
            <div className="flex items-center justify-between gap-3 py-4 px-5 border-b border-outline-variant/30 bg-white shrink-0">
              <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                <Library className="w-4 h-4 text-[#d67d5c]" />
                Generated Cards
              </h3>
              <div className="flex items-center gap-2">
                {stats && stats.dueCount > 0 && (
                  <Link
                    href={`/study?noteId=${noteId}`}
                    className="inline-flex items-center justify-center py-1 px-3 rounded-lg bg-primary-container text-white text-[10px] font-semibold hover:bg-primary transition-colors"
                  >
                    Study Due ({stats.dueCount})
                  </Link>
                )}
                <button 
                  onClick={() => setIsCardsPanelOpen(false)}
                  className="inline-flex items-center justify-center p-1 rounded-lg text-outline hover:bg-surface-container transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto py-4 px-5 pb-32">
              {isLoadingFlashcards ? (
                <div className="flex-1 flex items-center justify-center bg-white text-outline text-sm">Loading cards...</div>
              ) : !flashcards || flashcards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-outline-variant/50 flex items-center justify-center text-outline-variant">
                    <Library className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-outline max-w-sm leading-relaxed">No flashcards generated yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {flashcards.map((card) => (
                    <div key={card.id} className="relative flex flex-col gap-3 p-4 bg-white border border-outline-variant/50 rounded-2xl shadow-sm group">
                      <button 
                        onClick={() => setEditingCard(card)}
                        className="absolute top-3 right-3 inline-flex items-center justify-center p-1.5 rounded-lg bg-white border border-outline-variant/30 text-outline opacity-0 transition-all hover:bg-surface hover:text-primary-container hover:border-primary-container/40 group-hover:opacity-100"
                        title="Edit Flashcard"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <span className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-outline">Question</span>
                        <p className="pr-8 text-sm font-semibold text-on-surface leading-relaxed">{card.question}</p>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent"></div>
                      <div>
                        <span className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-outline">Answer</span>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{card.answer}</p>
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
