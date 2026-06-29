'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, AlertCircle, ArrowLeft, Check, X, RotateCw, ChevronLeft, ChevronRight, BookOpen, Edit3, Loader2, ChevronDown } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { api, Flashcard } from '../../../lib/api'
import EditFlashcardModal from '../../../components/flashcards/EditFlashcardModal'
import styles from '../workspace.module.css'

function StudyDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const noteIdParam = searchParams.get('noteId') || undefined

  // State
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
  
  const [showExitModal, setShowExitModal] = useState(false)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  // Track which notes are EXPANDED (so by default they are closed)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  // Queries
  const { data: allCards = [], isLoading, error } = useQuery({
    queryKey: ['study', 'all-cards'],
    queryFn: () => api.flashcards.list(),
  })

  // Start study session automatically if noteIdParam changes and cards load
  useEffect(() => {
    if (noteIdParam && allCards.length > 0 && !activeSession) {
      const noteAllCards = allCards.filter(c => c.note_id === noteIdParam)
      if (noteAllCards.length > 0) {
        setSessionCards(noteAllCards)
        setActiveSession(noteIdParam)
        setCurrentCardIndex(0)
        setIsFlipped(false)
      }
    }
  }, [noteIdParam, allCards, activeSession])

  // Group cards for the dashboard lists
  const groupedNotes = React.useMemo(() => {
    const groups: Record<string, { title: string; cards: Flashcard[] }> = {}
    allCards.forEach((card) => {
      const noteId = card.note_id || 'unassigned'
      const noteTitle = card.notes?.title || 'Untitled Note'
      if (!groups[noteId]) {
        groups[noteId] = { title: noteTitle, cards: [] }
      }
      groups[noteId].cards.push(card)
    })
    return Object.entries(groups).map(([noteId, data]) => ({ noteId, ...data }))
  }, [allCards])

  const handleStartAll = () => {
    if (allCards.length === 0) return
    setSessionCards(allCards)
    setActiveSession('all')
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  const handleStartNote = (noteId: string) => {
    const filtered = allCards.filter((c) => c.note_id === noteId)
    if (filtered.length === 0) return
    setSessionCards(filtered)
    setActiveSession(noteId)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  const handleAnswerClick = () => {
    if (currentCardIndex >= sessionCards.length - 1) {
      handleFinish()
    } else {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1)
      }, 200)
    }
  }

  const confirmExit = () => {
    setShowExitModal(false)
    setActiveSession(null)
    setSessionCards([])
    setCurrentCardIndex(0)
    setIsFlipped(false)
    if (noteIdParam) {
      router.push('/study')
    }
  }

  const handleFinish = () => {
    setActiveSession(null)
    setSessionCards([])
    setCurrentCardIndex(0)
    setIsFlipped(false)
    if (noteIdParam) {
      router.push('/study')
    }
  }

  const toggleCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const toggleNote = (noteId: string) => {
    setExpandedNotes(prev => ({ ...prev, [noteId]: !prev[noteId] }))
  }


  if (isLoading) {
    return (
      <div className={styles.workspacePageLoading}>
        <Loader2 className={styles.workspaceMainToggleIcon} />
        <div className={styles.workspaceEmptyText}>Loading your cards...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.workspacePageLoading}>
        <div className={styles.workspaceEmptyState}>
          <div className={styles.workspaceEmptyIcon}>
            <AlertCircle className={styles.workspaceNavIcon} />
          </div>
          <div>
            <h2 className={styles.workspaceEmptyTitle}>Could not load review cards</h2>
            <p className={styles.workspaceEmptyText}>
              Make sure the backend is running and the study API is available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- STUDY SESSION VIEW ---
  if (activeSession && sessionCards.length > 0) {
    const currentCard = sessionCards[currentCardIndex]

    return (
      <div className={styles.workspaceStudyShell}>
        <header className={styles.workspaceStudyHeader}>
          <button
            onClick={() => setShowExitModal(true)}
            className={styles.workspaceMainToggle}
            title="Exit Session"
          >
            <ArrowLeft className={styles.workspaceMainToggleIcon} />
          </button>
          <div>
            <h1 className={styles.workspaceStudyHeaderTitle}>Free Study Session</h1>
            <p className={styles.workspaceStudyHeaderText}>
              Reviewing {activeSession === 'all' ? 'All Cards' : 'selected note'}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2">
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            {/* Progress Indicator */}
            <div className={styles.workspaceStudyProgressWrap}>
              <div className={styles.workspaceProgressLabel}>
                <span>Progress</span>
                <span>{currentCardIndex + 1} of {sessionCards.length}</span>
              </div>
              <div className={styles.workspaceProgressTrack}>
                <div
                  className={styles.workspaceProgressFill}
                  style={{ width: `${((currentCardIndex) / sessionCards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card Container with Navigation Arrows */}
            <div className="w-full flex items-center justify-center gap-4">
              {/* Prev Button */}
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setIsFlipped(false)
                  setCurrentCardIndex(prev => Math.max(0, prev - 1))
                }}
                className={styles.workspaceMainToggle}
                title="Previous Card"
              >
                <ChevronLeft className={styles.workspaceMainToggleIcon} />
              </button>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={styles.workspaceStudyCardButton}
                style={{ perspective: '1000px' }}
              >
                <div
                  className={styles.workspaceStudyFlipStage}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                  }}
                >
                  {/* Front Side */}
                  <div
                    className={styles.workspaceStudyCardFront}
                    style={{
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="flex justify-between items-center gap-4">
                      {currentCard?.notes?.title && (
                        <div
                          className={styles.workspaceStudyMetaChip}
                        >
                          <BookOpen className={styles.workspaceNavIcon} />
                          <span>{currentCard.notes.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(currentCard)
                          }}
                          className={styles.workspaceMainToggle}
                          title="Edit Card"
                        >
                          <Edit3 className={styles.workspaceMainToggleIcon} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4">
                      <p className={styles.workspaceEmptyTitle}>
                        {currentCard?.question}
                      </p>
                    </div>
                    <div className={styles.workspaceEmptyText}>
                      <RotateCw className={styles.workspaceMainToggleIcon} />
                      <span>Tap card to reveal answer</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div
                    className={styles.workspaceStudyCardBack}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex justify-between items-center gap-4">
                      {currentCard?.notes?.title && (
                        <div
                          className={styles.workspaceStudyMetaChip}
                        >
                          <BookOpen className={styles.workspaceNavIcon} />
                          <span>{currentCard.notes.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(currentCard)
                          }}
                          className={styles.workspaceMainToggle}
                          title="Edit Card"
                        >
                          <Edit3 className={styles.workspaceMainToggleIcon} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto">
                      <p className={styles.workspaceEmptyText}>
                        {currentCard?.answer}
                      </p>
                    </div>
                    <div className={styles.workspaceEmptyText}>
                      <RotateCw className={styles.workspaceMainToggleIcon} />
                      <span>Tap to flip back</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button
                disabled={currentCardIndex === sessionCards.length - 1}
                onClick={() => {
                  setIsFlipped(false)
                  setCurrentCardIndex(prev => Math.min(sessionCards.length - 1, prev + 1))
                }}
                className="p-3 rounded-full bg-white hover:bg-[#fff8f5] border border-[#dac1b9]/40 text-[#87736c] hover:text-[#94492c] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm shrink-0"
                title="Next Card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className={styles.workspaceStudyActionRow}>
              {!isFlipped ? (
                <button
                  onClick={() => setIsFlipped(true)}
                  className={styles.workspaceButtonPrimary}
                >
                  Show Answer
                </button>
              ) : (
                <div className="w-full">
                  <button
                    onClick={handleAnswerClick}
                    className={styles.workspaceButtonPrimary}
                  >
                    <span>{currentCardIndex >= sessionCards.length - 1 ? 'Finish Session' : 'Next Card'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Confirmation Exit Modal */}
        {showExitModal && (
          <div className={styles.workspaceModalOverlay}>
            <div className={styles.workspaceModal}>
              <div>
                <h3 className={styles.workspaceModalTitle}>Exit Study Session?</h3>
                <p className={styles.workspaceModalText}>
                  Are you sure you want to leave this free-form study session?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className={styles.workspaceButtonSecondary}
                >
                  Stay
                </button>
                <button
                  onClick={confirmExit}
                  className={styles.workspaceButtonDanger}
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        )}

        {editingCard && (
          <EditFlashcardModal 
            flashcard={editingCard}
            onClose={() => setEditingCard(null)}
          />
        )}
      </div>
    )
  }

  // --- DASHBOARD VIEW (Free-form browser) ---
  return (
    <div className={styles.workspaceStudyShell}>
      <header className="mb-8">
        <h1 className={styles.workspaceStudyHeaderTitle}>Study</h1>
        <p className={styles.workspaceStudyHeaderText}>Browse all your flashcards and practice freely without affecting spaced repetition.</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="max-w-3xl mx-auto">
          {allCards.length === 0 ? (
            <div className={styles.workspacePageCard}>
              <div className={styles.workspaceEmptyIcon}>
                <BookOpen className={styles.workspaceNavIcon} />
              </div>

              <div>
                <h2 className={styles.workspaceEmptyTitle}>No Cards Yet</h2>
                <p className={styles.workspaceEmptyText}>
                  Create new notes and use "Magic Study" to automatically generate flashcards to see them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Study All Button */}
              <button
                onClick={handleStartAll}
                className={styles.workspacePageCard}
              >
                <div className="flex items-center gap-5">
                  <div className={styles.workspaceEmptyIcon}>
                    <Sparkles className={styles.workspaceNavIcon} />
                  </div>
                  <div>
                    <h3 className={styles.workspaceEmptyTitle}>Study All Cards</h3>
                    <p className={styles.workspaceEmptyText}>Practice everything randomly</p>
                  </div>
                </div>
                <div className={styles.workspaceStudyMetaChip}>
                  {allCards.length} Cards
                </div>
              </button>

              <div className="flex flex-col gap-6">
                {groupedNotes.map((note) => {
                  const isNoteExpanded = expandedNotes[note.noteId]
                  return (
                    <div key={note.noteId} className={styles.workspacePageCard}>
                      {/* Note Header */}
                      <div 
                        onClick={() => toggleNote(note.noteId)}
                        className={styles.workspacePageCardTight}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown className={styles.workspaceMainToggleIcon} />
                          <div>
                            <h3 className="font-semibold text-lg text-[#1e1b18]">{note.title}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={styles.workspaceStudyMetaChip}>
                                {note.cards.length} cards
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartNote(note.noteId)
                          }}
                          className={styles.workspaceButtonPrimary}
                        >
                          Study Note →
                        </button>
                      </div>

                      {/* Cards List */}
                      {isNoteExpanded && (
                        <div className="flex flex-col divide-y divide-[#dac1b9]/20">
                      {note.cards.map((card) => {
                        const isExpanded = expandedCards[card.id]
                        return (
                          <div 
                            key={card.id} 
                            onClick={(e) => toggleCard(card.id, e)}
                            className="p-4 hover:bg-[#fff8f5] transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#1e1b18] line-clamp-2 leading-relaxed">
                                  {card.question}
                                </p>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-[#87736c] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {/* Expanded Answer */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-[#dac1b9]/20 animate-in slide-in-from-top-2 fade-in duration-200">
                                <p className="text-sm text-[#54433d] leading-relaxed">
                                  {card.answer}
                                </p>
                                <div className="flex justify-end mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingCard(card)
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#87736c] hover:text-[#d67d5c] px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#dac1b9]/30 transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
            </div>
          )}
        </div>
      </div>
      {editingCard && (
        <EditFlashcardModal 
          flashcard={editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  )
}

export default function StudyPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 justify-center items-center text-sm text-[#87736c]">
        Loading review session...
      </div>
    }>
      <StudyDashboard />
    </React.Suspense>
  )
}
