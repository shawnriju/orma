'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Clock, AlertCircle, ArrowLeft, Check, X, CheckCircle2, RotateCw, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { api, Flashcard } from '../../../lib/api'

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
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })

  // Confirmation Exit Modal State
  const [showExitModal, setShowExitModal] = useState(false)
  const [exitTargetUrl, setExitTargetUrl] = useState<string | null>(null)

  // Queries
  const { data: dueCards = [], isLoading: isDueLoading, error, refetch: refetchDue } = useQuery({
    queryKey: ['study', 'due', noteIdParam],
    queryFn: () => api.study.due(noteIdParam),
  })

  const { data: allCards = [], isLoading: isAllLoading, refetch: refetchAll } = useQuery({
    queryKey: ['study', 'all-cards'],
    queryFn: () => api.flashcards.list(),
  })

  // Start study session automatically if noteIdParam changes and cards load
  useEffect(() => {
    if (noteIdParam && dueCards.length > 0 && !activeSession) {
      setSessionCards(dueCards)
      setActiveSession(noteIdParam)
      setCurrentCardIndex(0)
      setIsFlipped(false)
      setSessionStats({ correct: 0, incorrect: 0 })
    } else if (noteIdParam && dueCards.length === 0 && allCards.length > 0 && !activeSession) {
      // Fallback: If no due cards, load all cards for that note to review
      const noteAllCards = allCards.filter(c => c.note_id === noteIdParam)
      if (noteAllCards.length > 0) {
        setSessionCards(noteAllCards)
        setActiveSession(noteIdParam)
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setSessionStats({ correct: 0, incorrect: 0 })
      }
    }
  }, [noteIdParam, dueCards, allCards, activeSession])

  // Group cards for the dashboard lists
  const groupedNotes = React.useMemo(() => {
    const dueGroups: Record<string, { title: string; count: number }> = {}
    dueCards.forEach((card) => {
      const noteId = card.note_id || 'unassigned'
      const noteTitle = card.notes?.title || 'Untitled Note'
      if (!dueGroups[noteId]) {
        dueGroups[noteId] = { title: noteTitle, count: 0 }
      }
      dueGroups[noteId].count++
    })

    const totalGroups: Record<string, { title: string; count: number }> = {}
    allCards.forEach((card) => {
      const noteId = card.note_id || 'unassigned'
      const noteTitle = card.notes?.title || 'Untitled Note'
      if (!totalGroups[noteId]) {
        totalGroups[noteId] = { title: noteTitle, count: 0 }
      }
      totalGroups[noteId].count++
    })

    const active: Array<{ noteId: string; noteTitle: string; count: number }> = []
    const completed: Array<{ noteId: string; noteTitle: string; count: number }> = []

    Object.entries(totalGroups).forEach(([noteId, totalData]) => {
      const dueCount = dueGroups[noteId]?.count || 0
      if (dueCount > 0) {
        active.push({ noteId, noteTitle: totalData.title, count: dueCount })
      } else {
        completed.push({ noteId, noteTitle: totalData.title, count: totalData.count })
      }
    })

    return { active, completed }
  }, [dueCards, allCards])

  // Mutation for review
  const reviewMutation = useMutation({
    mutationFn: ({ cardId, correct }: { cardId: string; correct: boolean }) =>
      api.study.review(cardId, correct),
  })

  const handleStartAll = () => {
    if (dueCards.length === 0) return
    setSessionCards(dueCards)
    setActiveSession('all')
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  const handleStartNote = (noteId: string, fromCompleted = false) => {
    const cardsSource = fromCompleted ? allCards : dueCards
    const filtered = cardsSource.filter((c) => c.note_id === noteId)
    if (filtered.length === 0) return
    setSessionCards(filtered)
    setActiveSession(noteId)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  const handleAnswer = (correct: boolean) => {
    const activeCard = sessionCards[currentCardIndex]
    if (!activeCard) return

    // Record local stats
    if (correct) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    } else {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
    }

    // Call API background
    reviewMutation.mutate({ cardId: activeCard.id, correct })

    // Move to next card
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1)
    }, 200) // Small delay for smooth transition reset
  }

  const handleExitClick = (targetUrl: string | null = null) => {
    setExitTargetUrl(targetUrl)
    setShowExitModal(true)
  }

  const confirmExit = () => {
    setShowExitModal(false)
    setActiveSession(null)
    setSessionCards([])
    setCurrentCardIndex(0)
    setIsFlipped(false)
    if (exitTargetUrl) {
      router.push(exitTargetUrl)
    } else if (noteIdParam) {
      router.push('/study')
    }
    // Refetch dashboard states
    queryClient.invalidateQueries({ queryKey: ['study', 'due'] })
    queryClient.invalidateQueries({ queryKey: ['study', 'all-cards'] })
    refetchDue()
    refetchAll()
  }

  const handleFinish = () => {
    setActiveSession(null)
    setSessionCards([])
    setCurrentCardIndex(0)
    setIsFlipped(false)
    if (noteIdParam) {
      router.push('/study')
    }
    queryClient.invalidateQueries({ queryKey: ['study', 'due'] })
    queryClient.invalidateQueries({ queryKey: ['study', 'all-cards'] })
    refetchDue()
    refetchAll()
  }

  if (isDueLoading || isAllLoading) {
    return (
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 justify-center items-center">
        <div className="text-center py-10 text-sm text-[#87736c]">Loading due cards...</div>
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
    const isCompleted = currentCardIndex >= sessionCards.length
    const currentCard = sessionCards[currentCardIndex]

    return (
      <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 relative">
        <header className="mb-8 flex items-center gap-4">
          <button
            onClick={() => handleExitClick(null)}
            className="p-2 hover:bg-[#f5ece7] text-[#87736c] hover:text-[#94492c] rounded-xl transition-all"
            title="Exit Session"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#94492c]">Study Session</h1>
            <p className="text-xs text-[#87736c] mt-0.5">
              {isCompleted ? 'Session complete' : `Reviewing ${activeSession === 'all' ? 'All Due' : 'selected note'}`}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-4">
          {isCompleted ? (
            <div className="max-w-md w-full bg-[#fff8f5] border border-[#dac1b9]/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-[#d3e8d1] rounded-full flex items-center justify-center text-[#0e1f11]">
                <CheckCircle2 className="w-10 h-10 text-[#506351]" />
              </div>

              <div>
                <h2 className="font-serif font-bold text-3xl text-[#1e1b18]">Review Completed!</h2>
                <p className="text-sm text-[#87736c] mt-2 leading-relaxed">
                  Great job keeping up with your spaced repetition. You've strengthened these concepts!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                <div className="bg-[#fff] border border-[#dac1b9]/20 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-[#506351]">{sessionStats.correct}</div>
                  <div className="text-xs text-[#87736c] font-medium uppercase tracking-wider mt-1">Correct</div>
                </div>
                <div className="bg-[#fff] border border-[#dac1b9]/20 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-[#ba1a1a]">{sessionStats.incorrect}</div>
                  <div className="text-xs text-[#87736c] font-medium uppercase tracking-wider mt-1">Incorrect</div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full mt-4 py-3.5 bg-[#d67d5c] hover:bg-[#94492c] text-white font-semibold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Done</span>
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl flex flex-col items-center gap-8">
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
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#fff8f5] text-[#94492c] rounded-full border border-[#dac1b9]/30 shrink-0">
                          Question
                        </span>
                        {currentCard?.notes?.title && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExitClick(`/notes/${currentCard.note_id}`)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#fff8f5] border border-[#dac1b9]/40 rounded-full hover:bg-[#fcf3ef] hover:border-[#d67d5c]/60 transition-all font-semibold text-xs text-[#94492c] max-w-[220px] truncate cursor-pointer shadow-sm"
                            title="Go to note"
                          >
                            <BookOpen className="w-3 h-3 text-[#d67d5c] shrink-0" />
                            <span>{currentCard.notes.title}</span>
                          </button>
                        )}
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
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white text-[#d67d5c] rounded-full border border-[#dac1b9]/30 shrink-0">
                          Answer
                        </span>
                        {currentCard?.notes?.title && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExitClick(`/notes/${currentCard.note_id}`)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#dac1b9]/40 rounded-full hover:bg-[#fff8f5] hover:border-[#d67d5c]/60 transition-all font-semibold text-xs text-[#94492c] max-w-[220px] truncate cursor-pointer shadow-sm"
                            title="Go to note"
                          >
                            <BookOpen className="w-3 h-3 text-[#d67d5c] shrink-0" />
                            <span>{currentCard.notes.title}</span>
                          </button>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto">
                        <p className="font-medium text-lg md:text-xl text-[#54433d] text-center leading-relaxed">
                          {currentCard?.answer}
                        </p>
                      </div>
                      <div className="text-center text-xs text-[#87736c] font-medium flex items-center justify-center gap-1.5 opacity-60">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Tap to see question again</span>
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
                  <div className="w-full grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="py-4 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Incorrect</span>
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="py-4 bg-[#d3e8d1] hover:bg-[#b7ccb6] text-[#0e1f11] font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Correct</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom Confirmation Exit Modal */}
        {showExitModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="max-w-sm w-full bg-white rounded-[2rem] border border-[#dac1b9]/40 p-6 flex flex-col gap-4 shadow-xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1e1b18]">Exit Study Session?</h3>
                <p className="text-xs text-[#87736c] mt-2 leading-relaxed">
                  Are you sure you want to leave? Your completed reviews for this session will be preserved, but you will leave the current deck.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowExitModal(false)
                    setExitTargetUrl(null)
                  }}
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
      </div>
    )
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Daily Review</h1>
        <p className="text-sm text-[#87736c] mt-1">Strengthen your memory with spaced repetition</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="max-w-2xl mx-auto mt-6">
          {dueCards.length === 0 && allCards.length === 0 ? (
            <div className="bg-[#fff8f5] border border-[#dac1b9]/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center flex flex-col items-center gap-6 py-12">
              <div className="w-16 h-16 bg-[#d3e8d1] rounded-3xl flex items-center justify-center text-[#0e1f11]">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-serif font-bold text-2xl text-[#1e1b18]">No Cards Yet</h2>
                <p className="text-sm text-[#87736c] mt-2 leading-relaxed max-w-md">
                  Excellent! Create new notes and use "Magic Study" to automatically generate flashcards.
                </p>
              </div>

              <div className="w-full flex items-center justify-center gap-2 p-4 bg-[#fff] border border-[#dac1b9]/20 rounded-2xl text-xs text-[#87736c] font-medium max-w-sm">
                <AlertCircle className="w-4 h-4 text-[#d67d5c]" />
                <span>Need new flashcards? Open any note and use "Magic Study".</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Study All Due Button */}
              {dueCards.length > 0 && (
                <button
                  onClick={handleStartAll}
                  className="w-full text-left bg-[#fff8f5] hover:bg-[#fcf3ef] border-2 border-[#d67d5c]/30 hover:border-[#d67d5c] rounded-[2rem] p-6 md:p-8 shadow-sm transition-all flex items-center justify-between gap-6 group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#d67d5c] text-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#1e1b18]">Study All Due</h3>
                      <p className="text-xs text-[#87736c] mt-1">Blitz through all your reviews in one session</p>
                    </div>
                  </div>
                  <div className="bg-[#d67d5c]/10 text-[#d67d5c] font-bold text-sm px-4 py-2 rounded-full border border-[#d67d5c]/20">
                    {dueCards.length} Cards
                  </div>
                </button>
              )}

              {/* Active Reviews (Due) */}
              {groupedNotes.active.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#87736c]">
                    Active Reviews ({groupedNotes.active.length})
                  </h3>
                  <div className="grid gap-3">
                    {groupedNotes.active.map((note) => (
                      <button
                        key={note.noteId}
                        onClick={() => handleStartNote(note.noteId, false)}
                        className="w-full text-left bg-[#fff] hover:bg-[#fff8f5] border border-[#dac1b9]/40 hover:border-[#dac1b9] rounded-2xl p-5 shadow-sm transition-all flex items-center justify-between gap-4 group"
                      >
                        <span className="font-medium text-sm text-[#1e1b18] group-hover:text-[#94492c] transition-colors truncate max-w-[70%]">
                          {note.noteTitle}
                        </span>
                        <span className="bg-[#f5ece7] text-[#87736c] text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#dac1b9]/30 shrink-0">
                          {note.count} due
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Reviews */}
              {groupedNotes.completed.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#87736c]">
                      Completed Reviews ({groupedNotes.completed.length})
                    </h3>
                    <span className="text-[10px] text-[#506351] font-bold uppercase tracking-wider bg-[#d3e8d1] px-2.5 py-1 rounded-full border border-[#dac1b9]/20 shadow-sm">
                      All caught up
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {groupedNotes.completed.map((note) => (
                      <button
                        key={note.noteId}
                        onClick={() => handleStartNote(note.noteId, true)}
                        className="w-full text-left bg-[#fff] hover:bg-[#fff8f5] border border-[#dac1b9]/20 hover:border-[#dac1b9]/40 rounded-2xl p-5 shadow-sm transition-all flex items-center justify-between gap-4 group opacity-75 hover:opacity-100"
                      >
                        <span className="font-medium text-sm text-[#87736c] group-hover:text-[#94492c] transition-colors truncate max-w-[70%]">
                          {note.noteTitle}
                        </span>
                        <span className="bg-[#f5ece7] text-[#87736c] text-xs font-medium px-3 py-1 rounded-xl border border-[#dac1b9]/20 shrink-0">
                          Revisit ({note.count} cards)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
