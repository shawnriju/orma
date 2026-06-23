'use client'

import React, { useState } from 'react'
import { Sparkles, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useMutation } from '@tanstack/react-query'

interface FlashcardPanelProps {
  noteId: string
  wordCount: number
}

interface DraftCard {
  question: string
  answer: string
}

export default function FlashcardPanel({ noteId, wordCount }: FlashcardPanelProps) {
  const [draftCards, setDraftCards] = useState<DraftCard[]>([])
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => api.flashcards.generate(noteId),
    onSuccess: (cards) => {
      if (!cards || cards.length === 0) {
        setErrorMsg('The AI could not extract any educational facts from this note. Please add more study material.')
        setDraftCards([])
      } else {
        setDraftCards(cards)
        setErrorMsg('')
        setSuccessMsg('')
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to generate flashcards.')
    }
  })

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (cards: DraftCard[]) => api.flashcards.save(noteId, cards),
    onSuccess: () => {
      setSuccessMsg('Flashcards saved successfully!')
      setDraftCards([])
      setErrorMsg('')
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to save flashcards.')
    }
  })

  const handleUpdateCard = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...draftCards]
    updated[index][field] = value
    setDraftCards(updated)
  }

  const handleDeleteCard = (index: number) => {
    setDraftCards(draftCards.filter((_, i) => i !== index))
  }

  const handleSaveAll = () => {
    if (draftCards.length === 0) return
    saveMutation.mutate(draftCards)
  }

  return (
    <aside className="w-80 border-l border-[#dac1b9]/50 bg-[#fff8f5] flex flex-col h-full overflow-hidden p-6 gap-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#dac1b9]/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#94492c]" />
          <h2 className="font-semibold text-base text-[#94492c]">Magic Study</h2>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#94492c] animate-pulse" title="Live Insights Ready" />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
        {successMsg && (
          <div className="flex items-start gap-2 p-3 bg-[#d3e8d1] text-[#0e1f11] rounded-2xl text-xs font-medium border border-[#b7ccb6]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#506351]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-xs font-medium border border-[#dac1b9]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {draftCards.length === 0 && !generateMutation.isPending && (
          wordCount < 20 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff] border border-[#dac1b9] flex items-center justify-center shadow-sm text-[#87736c]">
                <AlertCircle className="w-6 h-6 text-[#94492c]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1e1b18]">Not Enough Context</p>
                <p className="text-xs text-[#87736c] mt-1 leading-relaxed">
                  Your note needs at least 20 words to generate flashcards. Please write a bit more to give the AI context.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff] border border-[#dac1b9] flex items-center justify-center shadow-sm text-[#87736c]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1e1b18]">No Study Cards Yet</p>
                <p className="text-xs text-[#87736c] mt-1 leading-relaxed">
                  Generate study cards automatically using AI based on your current note.
                </p>
              </div>
              <button
                onClick={() => generateMutation.mutate()}
                className="px-4 py-2.5 bg-[#d67d5c] hover:bg-[#94492c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Flashcards</span>
              </button>
            </div>
          )
        )}

        {generateMutation.isPending && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 gap-3">
            <Loader2 className="w-8 h-8 text-[#94492c] animate-spin" />
            <p className="font-medium text-xs text-[#87736c]">AI is writing your flashcards...</p>
          </div>
        )}

        {draftCards.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#87736c]">
              Draft Cards ({draftCards.length})
            </div>
            {draftCards.map((card, i) => (
              <div 
                key={i}
                className="p-4 bg-[#fff] border border-[#dac1b9]/50 rounded-2xl shadow-sm flex flex-col gap-3 group relative transition-all"
              >
                <button 
                  onClick={() => handleDeleteCard(i)}
                  className="absolute top-3 right-3 p-1.5 text-[#87736c] hover:text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6]/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#87736c] uppercase">Question</label>
                  <textarea
                    value={card.question}
                    onChange={(e) => handleUpdateCard(i, 'question', e.target.value)}
                    className="w-full bg-[#fff] text-xs font-semibold text-[#1e1b18] border border-[#dac1b9]/30 focus:border-[#d67d5c] outline-none rounded-xl p-2 resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#87736c] uppercase">Answer</label>
                  <textarea
                    value={card.answer}
                    onChange={(e) => handleUpdateCard(i, 'answer', e.target.value)}
                    className="w-full bg-[#fff] text-xs font-medium text-[#54433d] border border-[#dac1b9]/30 focus:border-[#d67d5c] outline-none rounded-xl p-2 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button Footer */}
      {draftCards.length > 0 && (
        <div className="flex flex-col gap-2 pt-4 border-t border-[#dac1b9]/30">
          <button
            onClick={handleSaveAll}
            disabled={saveMutation.isPending}
            className="w-full py-3 bg-[#d67d5c] hover:bg-[#94492c] text-white text-sm font-semibold rounded-2xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Save Flashcards ({draftCards.length})</span>
          </button>
          <button
            onClick={() => setDraftCards([])}
            className="w-full py-2.5 bg-transparent hover:bg-[#f5ece7] text-[#87736c] text-xs font-medium rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      )}
    </aside>
  )
}
