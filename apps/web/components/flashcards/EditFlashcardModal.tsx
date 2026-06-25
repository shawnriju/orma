'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Save, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Flashcard } from '../../lib/api'

interface EditFlashcardModalProps {
  flashcard: Flashcard
  onClose: () => void
}

export default function EditFlashcardModal({ flashcard, onClose }: EditFlashcardModalProps) {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState(flashcard.question)
  const [answer, setAnswer] = useState(flashcard.answer)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setMounted(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const updateMutation = useMutation({
    mutationFn: () => api.flashcards.update(flashcard.id, { question, answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update flashcard.')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.flashcards.delete(flashcard.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to delete flashcard.')
    }
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteMutation.mutate()
    }
  }

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      setErrorMsg('Question and answer cannot be empty.')
      return
    }
    updateMutation.mutate()
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fff8f5]/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-white border border-[#dac1b9]/40 shadow-xl rounded-3xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dac1b9]/30 bg-[#fff8f5]">
          <h2 className="text-sm font-bold text-[#54433d]">Edit Flashcard</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#ffdad6]/20 text-[#87736c] hover:text-[#ba1a1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#87736c]">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full min-h-[100px] resize-none border border-[#dac1b9]/40 rounded-xl p-4 text-sm font-semibold text-[#1e1b18] outline-none focus:border-[#d67d5c] focus:ring-1 focus:ring-[#d67d5c]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#87736c]">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full min-h-[150px] resize-none border border-[#dac1b9]/40 rounded-xl p-4 text-sm text-[#54433d] outline-none focus:border-[#d67d5c] focus:ring-1 focus:ring-[#d67d5c]"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#dac1b9]/30 bg-[#fff8f5] flex justify-between gap-3">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending || updateMutation.isPending}
            className="px-5 py-2.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-xl transition-all flex items-center gap-2"
          >
            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Delete</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={updateMutation.isPending || deleteMutation.isPending}
              className="px-5 py-2.5 text-xs font-semibold text-[#87736c] hover:bg-[#f5ece7] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || deleteMutation.isPending || (!question.trim() || !answer.trim())}
              className="px-5 py-2.5 bg-[#d67d5c] hover:bg-[#94492c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
