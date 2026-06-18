'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Search, Plus, Sparkles, AlertCircle } from 'lucide-react'
import { api, Note } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const notebookId = searchParams.get('notebook_id') || undefined
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all notes
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: () => api.notes.list(notebookId)
  })

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (nbId: string) => api.notes.create({ notebook_id: nbId, title: 'Untitled Note' }),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push(`/notes/${newNote.id}`)
    }
  })

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
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[#dac1b9]/30 px-8 flex items-center justify-between">
        <h1 className="font-serif font-bold text-xl text-[#94492c]">My Notes</h1>
        <div className="flex items-center gap-4 w-72 bg-[#fff8f5] border border-[#dac1b9]/40 rounded-xl px-3 py-1.5 focus-within:border-[#d67d5c] transition-all">
          <Search className="w-4 h-4 text-[#87736c]" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs outline-none text-[#1e1b18] w-full"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="text-sm text-[#87736c] text-center py-12">Loading notes...</div>
        ) : error ? (
          <div className="text-sm text-[#ba1a1a] text-center py-12 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Could not fetch notes. Make sure backend is running.</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#f5ece7] rounded-3xl flex items-center justify-center text-[#94492c]">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#1e1b18]">No notes found</h3>
              <p className="text-sm text-[#87736c] mt-1 leading-relaxed">
                Create your first note to start writing, planning, and studying.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="px-6 py-3 bg-[#d67d5c] hover:bg-[#94492c] text-white text-sm font-semibold rounded-2xl shadow-sm transition-all"
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note: Note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="p-6 bg-[#fff8f5] border border-[#dac1b9]/30 rounded-3xl hover:border-[#d67d5c] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div>
                  <h3 className="font-semibold text-base text-[#1e1b18] group-hover:text-[#94492c] transition-colors line-clamp-1">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-xs text-[#87736c] mt-2 line-clamp-3 leading-relaxed">
                    {getNotePreview(note.content)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#dac1b9]/20 text-[11px] text-[#87736c] font-medium">
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
