'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Trash2, CheckCircle2, AlertCircle, Loader2, X, Plus, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react'
import { api } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styles from './flashcards.module.css'

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
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'choose' | 'custom' | 'ai'>('choose')
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
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
    setExpandedCards(new Set())
    setSelectedCards(new Set())
    setSuccessMsg('')
    setErrorMsg('')
  }

  const openModal = () => {
    resetDraftState()
    setMode('choose')
    setIsOpen(true)
  }

  const closeModal = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
    setIsOpen(false)
    resetDraftState()
    setMode('choose')
  }

  const startCustomFlow = () => {
    setMode('custom')
    setDraftCards([{ question: '', answer: '' }])
    setExpandedCards(new Set([0]))
    setSelectedCards(new Set())
    setSuccessMsg('')
    setErrorMsg('')
  }

  const startAiFlow = () => {
    setMode('ai')
    setDraftCards([])
    setExpandedCards(new Set())
    setSelectedCards(new Set())
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
        setExpandedCards(new Set())
        setSelectedCards(new Set())
        setMode('custom')
        setErrorMsg('')
        setSuccessMsg('')
      }
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err, 'Failed to generate flashcards.'))
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

      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }

      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false)
        resetDraftState()
        setMode('choose')
        autoCloseTimerRef.current = null
      }, 1500)
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err, 'Failed to save flashcards.'))
    }
  })

  const handleUpdateCard = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...draftCards]
    updated[index][field] = value
    setDraftCards(updated)
  }

  const handleDeleteCard = (index: number) => {
    setDraftCards(draftCards.filter((_, i) => i !== index))
    setExpandedCards(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
    setSelectedCards(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
  }

  const addCard = () => {
    setDraftCards((current) => {
      const newIdx = current.length
      setExpandedCards(prev => {
        const next = new Set(prev)
        next.add(newIdx)
        return next
      })
      return [...current, { question: '', answer: '' }]
    })
  }

  const handleSaveAll = () => {
    if (draftCards.length === 0) return
    saveMutation.mutate(draftCards)
  }

  const allSelected = draftCards.length > 0 && selectedCards.size === draftCards.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(draftCards.map((_, i) => i)))
    }
  }

  const handleDeleteSelected = () => {
    const toDelete = Array.from(selectedCards)
    const newCards = draftCards.filter((_, i) => !toDelete.includes(i))
    setDraftCards(newCards)
    setSelectedCards(new Set())
    setExpandedCards(prev => {
       const next = new Set<number>()
       let currentNewIndex = 0
       for(let i=0; i<draftCards.length; i++) {
         if (!toDelete.includes(i)) {
           if (prev.has(i)) next.add(currentNewIndex)
           currentNewIndex++
         }
       }
       return next
    })
  }

  const toggleSelectCard = (index: number) => {
    setSelectedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleExpandCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const hasUnsavedDrafts = draftCards.length > 0 && mode === 'custom'

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message || fallback
    if (typeof err === 'string') return err || fallback
    return fallback
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={styles.triggerButton}
      >
        <span className={styles.triggerIcon}>
          <Sparkles className="h-5 w-5" />
        </span>
        <span className={styles.triggerLabel}>
          Generate flashcards
        </span>
      </button>

      {mounted && isOpen && createPortal(
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <div className={styles.headerTitleRow}>
                  <span className={styles.headerTitleIcon}>
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h2 className={styles.headerTitle}>Magic Study</h2>
                </div>
                <p className={styles.headerSubtitle}>Build flashcards without leaving the note.</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  closeModal()
                }}
                className={styles.iconButton}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={styles.body}>
              {hasUnsavedDrafts && !saveMutation.isPending && (
                <div className={`${styles.bannerError} mb-4`}>
                  You have unsaved flashcards in this panel. Save them before closing if you want to keep the draft.
                </div>
              )}

              {mode === 'choose' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={startCustomFlow}
                    className="flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-outline-variant/50 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-container"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-primary">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-on-surface">Create custom cards</h3>
                      <p className="text-sm leading-relaxed text-outline">
                        Build your own question and answer pairs from scratch.
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Start manually</span>
                  </button>

                  <button
                    type="button"
                    onClick={startAiFlow}
                    className="flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-outline-variant/50 bg-surface-container-low p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-container"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-on-surface">Generate with AI</h3>
                      <p className="text-sm leading-relaxed text-outline">
                        Let Magic Study draft cards from the note content, then edit before saving.
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Use AI</span>
                  </button>
                </div>
              )}

              {mode === 'ai' && (
                <div className="flex flex-col gap-4">
                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-2xl border border-outline-variant bg-error-container p-3 text-xs font-medium text-error">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {generateMutation.isPending ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-outline">AI is writing your flashcards...</p>
                    </div>
                  ) : draftCards.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant bg-white text-primary shadow-sm">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <h3 className="text-sm font-semibold text-on-surface">Generate from this note</h3>
                        <p className="text-sm leading-relaxed text-outline">
                          Magic Study uses the note content to draft study cards. You can edit every card before saving.
                        </p>
                        {wordCount < 20 && (
                          <p className="text-xs font-medium text-error">
                            Your note needs at least 20 words before AI generation will work.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => generateMutation.mutate()}
                          disabled={wordCount < 20}
                          className="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Sparkles className="h-4 w-4" />
                          Generate flashcards
                        </button>
                        <button
                          type="button"
                          onClick={startCustomFlow}
                          className="rounded-2xl border border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
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
                    <div className="flex items-start gap-2 rounded-2xl border border-secondary-fixed-dim bg-secondary-fixed p-3 text-xs font-medium text-on-secondary-fixed">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-2xl border border-outline-variant bg-error-container p-3 text-xs font-medium text-error">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-outline">
                        Draft cards ({draftCards.length})
                      </div>
                      <p className="mt-1 text-sm text-outline">
                        Edit your cards here, or add more before saving.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addCard}
                        className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-white px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
                      >
                        <Plus className="h-4 w-4" />
                        Add card
                      </button>
                    </div>
                  </div>

                  {draftCards.length > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-2 border border-outline-variant/30">
                      <button 
                        type="button" 
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary"
                      >
                        {allSelected ? <CheckSquare className="h-4 w-4 text-primary-container" /> : <Square className="h-4 w-4 text-outline" />}
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                      
                      {selectedCards.size > 0 && (
                        <button
                          type="button"
                          onClick={handleDeleteSelected}
                          className="flex items-center gap-1.5 text-xs font-semibold text-error transition-colors hover:text-on-error-container"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Selected ({selectedCards.size})
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {draftCards.map((card, i) => {
                      const isExpanded = expandedCards.has(i)
                      const isSelected = selectedCards.has(i)
                      
                      return (
                        <div
                          key={i}
                          className={`group relative flex flex-col gap-3 rounded-[1.5rem] border ${isSelected ? 'border-[#d67d5c] bg-surface' : 'border-outline-variant/50 bg-white'} p-4 shadow-sm transition-all`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleSelectCard(i)}
                              className="mt-1 shrink-0 text-outline transition-colors hover:text-primary-container"
                            >
                              {isSelected ? <CheckSquare className="h-4 w-4 text-primary-container" /> : <Square className="h-4 w-4" />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              {!isExpanded ? (
                                <button 
                                  type="button" 
                                  onClick={() => toggleExpandCard(i)}
                                  className="w-full text-left"
                                >
                                  <p className="truncate text-sm font-semibold text-on-surface">
                                    {card.question || <span className="italic text-outline">Empty question...</span>}
                                  </p>
                                </button>
                              ) : (
                                <div className="flex flex-col gap-3 w-full">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase text-outline">Question</label>
                                    <textarea
                                      value={card.question}
                                      onChange={(e) => handleUpdateCard(i, 'question', e.target.value)}
                                      className="min-h-20 w-full resize-none rounded-xl border border-outline-variant/30 bg-white p-2 text-xs font-semibold text-on-surface outline-none focus:border-[#d67d5c]"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase text-outline">Answer</label>
                                    <textarea
                                      value={card.answer}
                                      onChange={(e) => handleUpdateCard(i, 'answer', e.target.value)}
                                      className="min-h-20 w-full resize-none rounded-xl border border-outline-variant/30 bg-white p-2 text-xs font-medium text-on-surface-variant outline-none focus:border-[#d67d5c]"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleExpandCard(i)}
                                className="rounded-lg p-1.5 text-outline transition-all hover:bg-surface-container hover:text-on-surface-variant"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCard(i)}
                                className="rounded-lg p-1.5 text-outline transition-all hover:bg-error-container/50 hover:text-error"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/30 bg-white/70 px-6 py-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 text-xs text-outline">
                  {mode === 'choose' ? 'Pick how you want to build flashcards.' : 'You can switch modes without losing your draft until you close the modal.'}
                </div>
                <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                  {mode === 'custom' && (
                    <button
                      type="button"
                      onClick={startAiFlow}
                      className="inline-flex items-center justify-center rounded-2xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
                    >
                      Generate with AI
                    </button>
                  )}
                  {mode === 'custom' && (
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={saveMutation.isPending || draftCards.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Save flashcards
                    </button>
                  )}
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
