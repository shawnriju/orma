'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, AlertCircle, ArrowLeft, Check, X, RotateCw, ChevronLeft, ChevronRight, BookOpen, Edit3, Loader2, ChevronDown } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { api, Flashcard } from '../../../lib/api'
import EditFlashcardModal from '../../../components/flashcards/EditFlashcardModal'
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
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-outline">
        <Loader2 className="w-5 h-5" />
        <div className="text-sm leading-relaxed text-outline">Loading your cards...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-outline">
        <div className="max-w-md mx-auto py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed">Could not load review cards</h2>
            <p className="text-sm leading-relaxed text-outline">
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
      <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8">
        <header className="mb-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-2 rounded-xl border border-outline-variant/40 text-outline hover:bg-surface-container-low transition-colors"
            title="Exit Session"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-headline-md text-primary">Free Study Session</h1>
            <p className="text-sm leading-relaxed text-outline">
              Reviewing {activeSession === 'all' ? 'All Cards' : 'selected note'}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2">
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            {/* Progress Indicator */}
            <div className="w-full max-w-2xl mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-outline mb-2">
                <span>Progress</span>
                <span>{currentCardIndex + 1} of {sessionCards.length}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-300"
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
                className="p-3 rounded-full bg-white hover:bg-surface-container-low border border-outline-variant/40 text-outline hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm shrink-0"
                title="Previous Card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-2xl aspect-[4/3] max-h-[380px] cursor-pointer [perspective:1000px]"
                
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white border border-outline-variant/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm backface-hidden"
                    
                  >
                    <div className="flex justify-between items-center gap-4">
                      {currentCard?.notes?.title && (
                        <div onClick={(e) => { e.stopPropagation(); if (currentCard.note_id) router.push(`/notes/${currentCard.note_id}`); }} className="inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary hover:bg-surface-container-low cursor-pointer transition-colors" title="Go to note">
                          <BookOpen className="w-5 h-5" />
                          <span>{currentCard.notes.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(currentCard)
                          }}
                          className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:bg-surface-container hover:text-primary transition-colors bg-white/50"
                          title="Edit Card"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4">
                      <p className="text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed">
                        {currentCard?.question}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-outline font-medium">
                      <RotateCw className="w-4 h-4" />
                      <span>Tap card to reveal answer</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-surface border-2 border-outline-variant/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm backface-hidden [transform:rotateY(180deg)]"
                    
                  >
                    <div className="flex justify-between items-center gap-4">
                      {currentCard?.notes?.title && (
                        <div onClick={(e) => { e.stopPropagation(); if (currentCard.note_id) router.push(`/notes/${currentCard.note_id}`); }} className="inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary hover:bg-surface-container-low cursor-pointer transition-colors" title="Go to note">
                          <BookOpen className="w-5 h-5" />
                          <span>{currentCard.notes.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(currentCard)
                          }}
                          className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:bg-surface-container hover:text-primary transition-colors bg-white/50"
                          title="Edit Card"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto w-full">
                      <p className="text-base md:text-lg text-on-surface leading-relaxed whitespace-pre-wrap text-center w-full">
                        {currentCard?.answer}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-outline font-medium">
                      <RotateCw className="w-4 h-4" />
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
                className="p-3 rounded-full bg-white hover:bg-surface border border-outline-variant/40 text-outline hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm shrink-0"
                title="Next Card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center mt-4 w-full">
              {!isFlipped ? (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
                >
                  Show Answer
                </button>
              ) : (
                <div className="inline-flex">
                  <button
                    onClick={handleAnswerClick}
                    className="inline-flex items-center justify-center px-8 py-3 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer gap-2"
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
          <div className="fixed inset-0 z-50 bg-on-background/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl flex flex-col gap-2 text-center">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">Exit Study Session?</h3>
                <p className="text-sm text-outline leading-relaxed mb-6">
                  Are you sure you want to leave this free-form study session?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer"
                >
                  Stay
                </button>
                <button
                  onClick={confirmExit}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-error text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-error/90 transition-all active:scale-95 cursor-pointer"
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
    <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline-md text-primary">Study</h1>
        <p className="text-sm leading-relaxed text-outline">Browse all your flashcards and practice freely without affecting spaced repetition.</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="max-w-3xl mx-auto">
          {allCards.length === 0 ? (
            <div className="w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-3xl p-10 flex flex-col gap-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4">
                <BookOpen className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed">No Cards Yet</h2>
                <p className="text-sm leading-relaxed text-outline">
                  Create new notes and use "Magic Study" to automatically generate flashcards to see them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Study All Button */}
              <button
                onClick={handleStartAll}
                className="w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:border-primary-container hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed">Study All Cards</h3>
                    <p className="text-sm leading-relaxed text-outline">Practice everything randomly</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary">
                  {allCards.length} Cards
                </div>
              </button>

              <div className="flex flex-col gap-6">
                {groupedNotes.map((note) => {
                  const isNoteExpanded = expandedNotes[note.noteId]
                  return (
                    <div key={note.noteId} className="w-full max-w-2xl mx-auto bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      {/* Note Header */}
                      <div 
                        onClick={() => toggleNote(note.noteId)}
                        className="w-full bg-surface p-4 md:p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-base text-on-surface">{note.title}</h3>
                            <span className="text-xs text-outline">{note.cards.length} cards</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartNote(note.noteId)
                            }}
                            className="inline-flex items-center justify-center px-4 py-2 bg-primary-container text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
                          >
                            Study Note
                          </button>
                          <ChevronDown className="w-5 h-5 text-outline transition-transform" style={{ transform: expandedNotes[note.noteId] ? 'rotate(180deg)' : 'none' }} />
                        </div>
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
                            className="p-4 hover:bg-surface transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-on-surface line-clamp-2 leading-relaxed">
                                  {card.question}
                                </p>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-outline shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {/* Expanded Answer */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-outline-variant/20 animate-in slide-in-from-top-2 fade-in duration-200">
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                  {card.answer}
                                </p>
                                <div className="flex justify-end mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingCard(card)
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-outline hover:text-primary px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-outline-variant/30 transition-all"
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
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 justify-center items-center text-sm text-outline">
        Loading review session...
      </div>
    }>
      <StudyDashboard />
    </React.Suspense>
  )
}
