'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Trash2, CheckCircle2, AlertCircle, Loader2, X, Plus } from 'lucide-react'
import { api } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface FlashcardPanelProps {
  noteId: string
  wordCount: number
}

interface DraftCard {
  question: string
  answer: string
}

export default function FlashcardPanel({ noteId, wordCount }: FlashcardPanelProps) {
  const queryClient = useQueryClient()
  const [draftCards, setDraftCards] = useState<DraftCard[]>([])
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'choose' | 'custom' | 'ai'>('choose')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const resetDraftState = () => {
    setDraftCards([])
    setSuccessMsg('')
    setErrorMsg('')
  }

  const openModal = () => {
    resetDraftState()
    setMode('choose')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    resetDraftState()
    setMode('choose')
  }

  const startCustomFlow = () => {
    setMode('custom')
    setDraftCards([{ question: '', answer: '' }])
    setSuccessMsg('')
    setErrorMsg('')
  }

  const startAiFlow = () => {
    setMode('ai')
    setDraftCards([])
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => api.flashcards.generate(noteId),
    onSuccess: (cards) => {
      if (!cards || cards.length === 0) {
        setErrorMsg('The AI could not extract any educational facts from this note. Please add more study material.')
        setDraftCards([])
      } else {
        setDraftCards(cards)
        setMode('custom')
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
      queryClient.invalidateQueries({ queryKey: ['note-stats', noteId] })
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

  const addCard = () => {
    setDraftCards((current) => [...current, { question: '', answer: '' }])
  }

  const handleSaveAll = () => {
    if (draftCards.length === 0) return
    saveMutation.mutate(draftCards)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="group fixed bottom-8 right-8 z-30 flex items-center gap-3 rounded-2xl border border-[#dac1b9]/45 bg-[#fff8f5]/95 px-3.5 py-3 text-left shadow-[0_12px_30px_rgba(44,22,16,0.12)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(44,22,16,0.16)] focus:outline-none focus:ring-2 focus:ring-[#d67d5c]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d67d5c] text-white shadow-sm transition-transform group-hover:scale-105">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.22em] text-[#94492c] opacity-0 transition-all duration-200 group-hover:max-w-[11rem] group-hover:opacity-100">
          Generate flashcards
        </span>
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1b18]/50 px-4 py-6 backdrop-blur-sm">
          <div className="relative flex max-h-[min(90vh,48rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-[#dac1b9]/40 bg-[#fff8f5] shadow-[0_30px_90px_rgba(44,22,16,0.28)]">
            <div className="flex items-start justify-between border-b border-[#dac1b9]/30 px-6 py-5">
              <div>
                <div className="flex items-center gap-2 text-[#94492c]">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-base font-semibold">Magic Study</h2>
                </div>
                <p className="mt-1 text-xs text-[#87736c]">Create custom flashcards or generate them with AI.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-[#87736c] transition-colors hover:bg-[#f5ece7] hover:text-[#54433d]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {mode === 'choose' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={startCustomFlow}
                    className="flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-[#dac1b9]/50 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d67d5c]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ece7] text-[#94492c]">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[#1e1b18]">Create custom cards</h3>
                      <p className="text-sm leading-relaxed text-[#87736c]">
                        Build your own question and answer pairs from scratch.
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94492c]">Start manually</span>
                  </button>

                  <button
                    type="button"
                    onClick={startAiFlow}
                    className="flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-[#dac1b9]/50 bg-[#fff2eb] p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d67d5c]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d67d5c] text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[#1e1b18]">Generate with AI</h3>
                      <p className="text-sm leading-relaxed text-[#87736c]">
                        Let Magic Study draft cards from the note content, then edit before saving.
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94492c]">Use AI</span>
                  </button>
                </div>
              )}

              {mode === 'ai' && (
                <div className="flex flex-col gap-4">
                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-2xl border border-[#dac1b9] bg-[#ffdad6] p-3 text-xs font-medium text-[#ba1a1a]">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {generateMutation.isPending ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#94492c]" />
                      <p className="text-sm font-medium text-[#87736c]">AI is writing your flashcards...</p>
                    </div>
                  ) : draftCards.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#dac1b9] bg-white text-[#94492c] shadow-sm">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <h3 className="text-sm font-semibold text-[#1e1b18]">Generate from this note</h3>
                        <p className="text-sm leading-relaxed text-[#87736c]">
                          Magic Study uses the note content to draft study cards. You can edit every card before saving.
                        </p>
                        {wordCount < 20 && (
                          <p className="text-xs font-medium text-[#ba1a1a]">
                            Your note needs at least 20 words before AI generation will work.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => generateMutation.mutate()}
                          disabled={wordCount < 20}
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#d67d5c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#94492c] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Sparkles className="h-4 w-4" />
                          Generate flashcards
                        </button>
                        <button
                          type="button"
                          onClick={startCustomFlow}
                          className="rounded-2xl border border-[#dac1b9] px-4 py-3 text-sm font-semibold text-[#54433d] transition-colors hover:bg-[#f5ece7]"
                        >
                          Switch to custom
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {mode === 'custom' && (
                <div className="flex flex-col gap-4">
                  {successMsg && (
                    <div className="flex items-start gap-2 rounded-2xl border border-[#b7ccb6] bg-[#d3e8d1] p-3 text-xs font-medium text-[#0e1f11]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#506351]" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-2xl border border-[#dac1b9] bg-[#ffdad6] p-3 text-xs font-medium text-[#ba1a1a]">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#87736c]">
                        Draft cards ({draftCards.length})
                      </div>
                      <p className="mt-1 text-sm text-[#87736c]">
                        Edit your cards here, or add more before saving.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCard}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#dac1b9] bg-white px-3 py-2 text-xs font-semibold text-[#54433d] transition-colors hover:bg-[#f5ece7]"
                    >
                      <Plus className="h-4 w-4" />
                      Add card
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {draftCards.map((card, i) => (
                      <div
                        key={i}
                        className="group relative flex flex-col gap-3 rounded-[1.5rem] border border-[#dac1b9]/50 bg-white p-4 shadow-sm transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(i)}
                          className="absolute right-3 top-3 rounded-lg p-1.5 text-[#87736c] opacity-0 transition-all hover:bg-[#ffdad6]/20 hover:text-[#ba1a1a] group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold uppercase text-[#87736c]">Question</label>
                          <textarea
                            value={card.question}
                            onChange={(e) => handleUpdateCard(i, 'question', e.target.value)}
                            className="min-h-20 w-full resize-none rounded-xl border border-[#dac1b9]/30 bg-white p-2 text-xs font-semibold text-[#1e1b18] outline-none focus:border-[#d67d5c]"
                            rows={2}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold uppercase text-[#87736c]">Answer</label>
                          <textarea
                            value={card.answer}
                            onChange={(e) => handleUpdateCard(i, 'answer', e.target.value)}
                            className="min-h-20 w-full resize-none rounded-xl border border-[#dac1b9]/30 bg-white p-2 text-xs font-medium text-[#54433d] outline-none focus:border-[#d67d5c]"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#dac1b9]/30 bg-white/70 px-6 py-4 backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[#87736c]">
                  {mode === 'choose' ? 'Pick how you want to build flashcards.' : 'You can switch modes without losing your draft until you close the modal.'}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {mode === 'custom' && (
                    <button
                      type="button"
                      onClick={startAiFlow}
                      className="rounded-2xl border border-[#dac1b9] px-4 py-2.5 text-sm font-semibold text-[#54433d] transition-colors hover:bg-[#f5ece7]"
                    >
                      Generate with AI
                    </button>
                  )}
                  {mode === 'custom' && (
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={saveMutation.isPending || draftCards.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d67d5c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#94492c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Save flashcards
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-[#dac1b9] px-4 py-2.5 text-sm font-semibold text-[#54433d] transition-colors hover:bg-[#f5ece7]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
