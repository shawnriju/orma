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
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 justify-center items-center">
        <Loader2 className="w-8 h-8 text-[#d67d5c] animate-spin" />
        <div className="text-center py-4 text-sm text-[#87736c]">Loading your cards...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 justify-center items-center">
        <div className="max-w-md mx-auto text-center py-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#ffdad6] rounded-3xl flex items-center justify-center text-[#ba1a1a]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#1e1b18]">Could not load review cards</h2>
            <p className="text-sm text-[#87736c] mt-2 leading-relaxed max-w-md">
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
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-6 md:p-8 min-h-0 relative">
        <header className="mb-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-2 hover:bg-[#f5ece7] text-[#87736c] hover:text-[#94492c] rounded-xl transition-all"
            title="Exit Session"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#94492c]">Free Study Session</h1>
            <p className="text-xs text-[#87736c] mt-0.5">
              Reviewing {activeSession === 'all' ? 'All Cards' : 'selected note'}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2">
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            {/* Progress Indicator */}
            <div className="w-full max-w-xl">
              <div className="flex justify-between text-xs font-semibold text-[#87736c] mb-2 uppercase tracking-wider">
                <span>Progress</span>
                <span>{currentCardIndex + 1} of {sessionCards.length}</span>
              </div>
              <div className="w-full h-2 bg-[#f5ece7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d67d5c] transition-all duration-300"
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
                className="p-3 rounded-full bg-white hover:bg-[#fff8f5] border border-[#dac1b9]/40 text-[#87736c] hover:text-[#94492c] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm shrink-0"
                title="Previous Card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 max-w-xl aspect-[4/3] max-h-[380px] cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white border border-[#dac1b9]/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-sm"
                    style={{
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="flex justify-between items-center gap-4">
                      {currentCard?.notes?.title && (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1 bg-[#fff8f5] border border-[#dac1b9]/40 rounded-full font-semibold text-xs text-[#94492c] max-w-[220px] truncate shadow-sm"
                        >
                          <BookOpen className="w-3 h-3 text-[#d67d5c] shrink-0" />
                          <span>{currentCard.notes.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(currentCard)
                          }}
                          className="p-1.5 rounded-full hover:bg-[#fff8f5] border border-transparent hover:border-[#dac1b9]/40 text-[#87736c] hover:text-[#d67d5c] transition-all"
                          title="Edit Card"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4">
                      <p className="font-serif font-semibold text-xl md:text-2xl text-[#1e1b18] text-center leading-relaxed">
                        {currentCard?.question}
                      </p>
                    </div>
                    <div className="text-center text-xs text-[#87736c] font-medium flex items-center justify-center gap-1.5 opacity-60">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Tap card to reveal answer</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-[#fff8f5] border-2 border-[#d67d5c]/40 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-sm"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex justify-between items-center gap-4">
                      {currentCard?.notes?.title && (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#dac1b9]/40 rounded-full font-semibold text-xs text-[#94492c] max-w-[220px] truncate shadow-sm"
                        >
                          <BookOpen className="w-3 h-3 text-[#d67d5c] shrink-0" />
                          <span>{currentCard.notes.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCard(currentCard)
                          }}
                          className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#dac1b9]/40 text-[#87736c] hover:text-[#d67d5c] transition-all"
                          title="Edit Card"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto">
                      <p className="font-medium text-lg md:text-xl text-[#54433d] text-center leading-relaxed">
                        {currentCard?.answer}
                      </p>
                    </div>
                    <div className="text-center text-xs text-[#87736c] font-medium flex items-center justify-center gap-1.5 opacity-60">
                      <RotateCw className="w-3.5 h-3.5" />
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
            <div className="w-full max-w-xl flex flex-col items-center gap-3">
              {!isFlipped ? (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-4 bg-[#d67d5c] hover:bg-[#94492c] text-white font-semibold rounded-2xl transition-all shadow-sm text-sm"
                >
                  Show Answer
                </button>
              ) : (
                <div className="w-full">
                  <button
                    onClick={handleAnswerClick}
                    className="w-full py-4 bg-[#d3e8d1] hover:bg-[#b7ccb6] text-[#0e1f11] font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="max-w-sm w-full bg-white rounded-[2rem] border border-[#dac1b9]/40 p-6 flex flex-col gap-4 shadow-xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1e1b18]">Exit Study Session?</h3>
                <p className="text-xs text-[#87736c] mt-2 leading-relaxed">
                  Are you sure you want to leave this free-form study session?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="py-2.5 bg-[#f5ece7] text-[#87736c] hover:bg-[#e1d8d4] font-semibold rounded-xl text-xs transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={confirmExit}
                  className="py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-semibold rounded-xl text-xs transition-all"
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
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 relative">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Study</h1>
        <p className="text-sm text-[#87736c] mt-1">Browse all your flashcards and practice freely without affecting spaced repetition.</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="max-w-3xl mx-auto">
          {allCards.length === 0 ? (
            <div className="bg-[#fff8f5] border border-[#dac1b9]/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center flex flex-col items-center gap-6 py-12">
              <div className="w-16 h-16 bg-[#d3e8d1] rounded-3xl flex items-center justify-center text-[#0e1f11]">
                <BookOpen className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-serif font-bold text-2xl text-[#1e1b18]">No Cards Yet</h2>
                <p className="text-sm text-[#87736c] mt-2 leading-relaxed max-w-md">
                  Create new notes and use "Magic Study" to automatically generate flashcards to see them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Study All Button */}
              <button
                onClick={handleStartAll}
                className="w-full text-left bg-[#fff8f5] hover:bg-[#fcf3ef] border-2 border-[#d67d5c]/30 hover:border-[#d67d5c] rounded-[2rem] p-6 shadow-sm transition-all flex items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#d67d5c] text-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#1e1b18]">Study All Cards</h3>
                    <p className="text-xs text-[#87736c] mt-1">Practice everything randomly</p>
                  </div>
                </div>
                <div className="bg-[#d67d5c]/10 text-[#d67d5c] font-bold text-sm px-4 py-2 rounded-full border border-[#d67d5c]/20">
                  {allCards.length} Cards
                </div>
              </button>

              <div className="flex flex-col gap-6">
                {groupedNotes.map((note) => {
                  const isNoteExpanded = expandedNotes[note.noteId]
                  return (
                    <div key={note.noteId} className="bg-white border border-[#dac1b9]/40 rounded-3xl overflow-hidden shadow-sm">
                      {/* Note Header */}
                      <div 
                        onClick={() => toggleNote(note.noteId)}
                        className="bg-[#fcf3ef] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dac1b9]/40 cursor-pointer hover:bg-[#faeee9] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown className={`w-5 h-5 text-[#94492c] transition-transform ${!isNoteExpanded ? '-rotate-90' : ''}`} />
                          <div>
                            <h3 className="font-semibold text-lg text-[#1e1b18]">{note.title}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs font-semibold text-[#87736c] bg-white px-2.5 py-1 rounded-full border border-[#dac1b9]/30">
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
                          className="px-5 py-2.5 bg-[#d67d5c] hover:bg-[#94492c] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shrink-0"
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
