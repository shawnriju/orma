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
      <div className="flex-1 flex items-center justify-center bg-white text-[#87736c] text-sm">
        Loading workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-6 gap-4">
        <h2 className="text-lg font-bold text-[#ba1a1a]">Note not found</h2>
        <p className="text-sm text-[#87736c] max-w-sm">
          This note could not be retrieved. It may have been deleted, or you might not have permission to view it.
        </p>
        <Link 
          href="/notes" 
          className="px-4 py-2 bg-[#d67d5c] hover:bg-[#94492c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
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
    <div className="flex-1 flex flex-col h-full bg-[#fff] overflow-hidden">
      {/* Note Workspace Top Bar Header */}
      <header className="h-16 border-b border-[#dac1b9]/30 px-6 flex items-center justify-between bg-[#fff]">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-3">
          <Link 
            href="/notes" 
            className="p-1.5 hover:bg-[#f5ece7] text-[#87736c] hover:text-[#94492c] rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#87736c]">
            {currentNotebook ? (
              <span className="flex items-center gap-1.5">
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCardsPanelOpen 
                ? 'bg-[#d67d5c] text-white shadow-sm' 
                : 'text-[#87736c] hover:bg-[#f5ece7] hover:text-[#54433d]'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Cards</span>
            {stats && stats.totalCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isCardsPanelOpen ? 'bg-white text-[#d67d5c]' : 'bg-[#d67d5c] text-white'}`}>
                {stats.totalCount}
              </span>
            )}
          </button>
          
          <div className="w-px h-4 bg-[#dac1b9]/50 mx-1"></div>
          
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-[#ffdad6]/50 text-[#ba1a1a] hover:text-[#93000a] rounded-lg transition-all"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
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
          <div className="w-80 lg:w-96 shrink-0 border-l border-[#dac1b9]/30 bg-[#fff8f5]/50 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#dac1b9]/30 bg-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-[#54433d] flex items-center gap-2">
                <Library className="w-4 h-4 text-[#d67d5c]" />
                Generated Cards
              </h3>
              <div className="flex items-center gap-2">
                {stats && stats.dueCount > 0 && (
                  <Link
                    href={`/study?noteId=${noteId}`}
                    className="px-3 py-1 bg-[#d67d5c] hover:bg-[#94492c] text-white text-[10px] font-semibold rounded-lg transition-all shadow-sm"
                  >
                    Study Due ({stats.dueCount})
                  </Link>
                )}
                <button 
                  onClick={() => setIsCardsPanelOpen(false)}
                  className="p-1 hover:bg-[#f5ece7] text-[#87736c] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-4 pb-32">
              {isLoadingFlashcards ? (
                <div className="text-center py-8 text-xs text-[#87736c]">Loading cards...</div>
              ) : !flashcards || flashcards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#dac1b9]/50 shadow-sm text-[#dac1b9]">
                    <Library className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#87736c]">No flashcards generated yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {flashcards.map((card) => (
                    <div key={card.id} className="bg-white border border-[#dac1b9]/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-[#d67d5c]/50 transition-colors group relative">
                      <button 
                        onClick={() => setEditingCard(card)}
                        className="absolute top-3 right-3 p-1.5 bg-white text-[#87736c] hover:text-[#d67d5c] hover:bg-[#fff8f5] border border-[#dac1b9]/30 hover:border-[#d67d5c]/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Edit Flashcard"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#87736c] mb-1 block">Question</span>
                        <p className="text-sm font-semibold text-[#1e1b18] pr-8">{card.question}</p>
                      </div>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#dac1b9]/30 to-transparent"></div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#87736c] mb-1 block">Answer</span>
                        <p className="text-sm text-[#54433d]">{card.answer}</p>
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
