'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MoreHorizontal, User, Sparkles } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import Editor from '../../../../components/editor/Editor'
import FlashcardPanel from '../../../../components/flashcards/FlashcardPanel'

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const noteId = params.noteId as string

  // Fetch single note details
  const { data: note, isLoading, error } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => api.notes.get(noteId)
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (data: { title?: string; content?: any; tags?: string[]; word_count?: number }) => 
      api.notes.update(noteId, data),
    onSuccess: (updatedNote) => {
      // Direct cache update to prevent flashing during refetch
      queryClient.setQueryData(['note', noteId], updatedNote)
      queryClient.invalidateQueries({ queryKey: ['notes'] })
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

  const handleSave = async (data: { title?: string; content?: any; tags?: string[]; word_count?: number }) => {
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
            <span>Workspace</span>
          </div>
        </div>

        {/* Member Avatars & Controls */}
        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-[#f5ece7] text-[#87736c] rounded-lg transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Editor + Flashcards Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Middle Editor */}
        <Editor 
          noteId={noteId}
          initialTitle={note?.title || 'Untitled Note'}
          initialContent={note?.content}
          initialTags={note?.tags || []}
          onSave={handleSave}
        />

        {/* Right Magic Study Panel */}
        <FlashcardPanel noteId={noteId} />
      </div>
    </div>
  )
}
