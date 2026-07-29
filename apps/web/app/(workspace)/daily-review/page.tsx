'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, RotateCw, ChevronLeft, ChevronRight, BookOpen, Clock, Edit3, Loader2 } from 'lucide-react'
import { api, Flashcard } from '../../../lib/api'
import { previewIntervals, Rating } from '../../../lib/sm2'
import EditFlashcardModal from '../../../components/flashcards/EditFlashcardModal'
import { useQueryClient } from '@tanstack/react-query'
type PageState = 'loading' | 'start' | 'empty' | 'reviewing' | 'complete'

export default function DailyReviewPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [pageState, setPageState] = useState<PageState>('loading')
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [isOvertime, setIsOvertime] = useState(false)
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [pendingExitUrl, setPendingExitUrl] = useState<string | null>(null)
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)

  const [sessionStats, setSessionStats] = useState({ hard: 0, ok: 0, easy: 0 })
  const [streakCount, setStreakCount] = useState(0)
  
  const [dueCountAll, setDueCountAll] = useState(0)
  const [totalCards, setTotalCards] = useState(0)

  const fetchInitialData = useCallback(async (overtime = false) => {
    setPageState('loading')
    try {
      const [dueQueue, totalCountData] = await Promise.all([
        api.study.dailyQueue(overtime),
        api.flashcards.count()
      ])
      
      setTotalCards(totalCountData.count)
      
      if (dueQueue.length > 0) {
        setQueue(dueQueue)
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setSessionStats({ hard: 0, ok: 0, easy: 0 })
        setPageState('start')
      } else {
        setPageState('empty')
      }
    } catch (err) {
      console.error(err)
      setPageState('empty') // Fallback on error for now
    }
  }, [])

  useEffect(() => {
    fetchInitialData(isOvertime)
  }, [fetchInitialData, isOvertime])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (pageState !== 'reviewing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to flip
      if (e.code === 'Space') {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageState, isFlipped])

  const handleRating = async (rating: Rating) => {
    const activeCard = queue[currentCardIndex]
    if (!activeCard) return

    // Record local stats
    setSessionStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }))

    // Background API call
    api.study.review(activeCard.id, rating).catch(err => {
      console.error('Failed to save review:', err)
    })

    // Advance
    if (currentCardIndex >= queue.length - 1) {
      setPageState('complete')
      finishSession()
    } else {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1)
      }, 200)
    }
  }

  const finishSession = async () => {
    try {
      const result = await api.study.session({
        hard_count: sessionStats.hard,
        ok_count: sessionStats.ok,
        easy_count: sessionStats.easy
      })
      setStreakCount(result.streak_count)
      queryClient.invalidateQueries({ queryKey: ['study'] })
    } catch (err) {
      console.error('Failed to save session:', err)
    }
  }

  const formatInterval = (days: number) => {
    if (days === 1) return 'Tomorrow'
    return `~${days} days`
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-outline">
        <Loader2 className="w-5 h-5" />
        <div className="text-sm leading-relaxed text-outline">Loading your daily review...</div>
      </div>
    )
  }

  if (pageState === 'start') {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline-md text-primary">Daily Review</h1>
          <p className="text-sm leading-relaxed text-outline">Strengthen your memory with spaced repetition</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
           <div className="w-full max-w-3xl bg-surface border border-outline-variant/40 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4">
              <Clock className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-on-surface">Ready to study?</h2>
              <p className="text-sm leading-relaxed text-outline">
                Out of the total {totalCards} cards created, these are the {queue.length} selected for your daily review session.
              </p>
            </div>

            <button
              onClick={() => setPageState('reviewing')}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
            >
              Start Daily Review
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'empty') {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline-md text-primary">Daily Review</h1>
          <p className="text-sm leading-relaxed text-outline">Strengthen your memory with spaced repetition</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
           <div className="w-full max-w-3xl bg-surface border border-outline-variant/40 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/20 flex items-center justify-center text-secondary mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-on-surface">You're all caught up ✓</h2>
              <p className="text-sm leading-relaxed text-outline">
                You have 0 cards due for today.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4 max-w-sm mx-auto">
              <button
                onClick={() => setShowOvertimeWarning(true)}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer"
              >
                Study More (Overtime)
              </button>
              <button
                onClick={() => router.push('/study')}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
              >
                Free Study →
              </button>
            </div>
          </div>
        </div>

        {/* Overtime Confirmation Modal */}
        {showOvertimeWarning && (
          <div className="fixed inset-0 z-50 bg-on-background/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl flex flex-col gap-2 text-center">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">Start Overtime Session?</h3>
                <p className="text-sm text-outline leading-relaxed mb-6">
                  You have completed your daily review. Further attempts will fetch future cards and affect their scheduling. Are you sure you want to proceed?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setShowOvertimeWarning(false)}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowOvertimeWarning(false)
                    setIsOvertime(true)
                  }}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (pageState === 'complete') {
    const total = sessionStats.hard + sessionStats.ok + sessionStats.easy
    const accuracy = total > 0 ? Math.round(((sessionStats.ok + sessionStats.easy) / total) * 100) : 0
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white overflow-y-auto p-4 md:p-8">
         <div className="w-full max-w-md bg-surface border border-outline-variant/40 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center gap-6">
            {streakCount > 0 && (
              <div className="inline-flex items-center py-1.5 px-4 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-sm font-bold">
                🔥 {streakCount}-day streak
              </div>
            )}
            
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/20 flex items-center justify-center text-secondary mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-3xl font-bold font-headline-md text-primary">Great job!</h2>
              <p className="text-sm leading-relaxed text-outline">
                You finished your daily study session.
              </p>
              <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary mt-2">
                {totalCards} total cards saved
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-3">
              <div className="bg-white border border-outline-variant/20 rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className="text-lg font-bold text-error">{sessionStats.hard}</div>
                <div className="text-[10px] text-outline font-medium uppercase tracking-wider mt-1">Hard</div>
              </div>
              <div className="bg-white border border-outline-variant/20 rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className="text-lg font-bold text-[#f59e0b]">{sessionStats.ok}</div>
                <div className="text-[10px] text-outline font-medium uppercase tracking-wider mt-1">OK</div>
              </div>
              <div className="bg-white border border-outline-variant/20 rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className="text-lg font-bold text-secondary">{sessionStats.easy}</div>
                <div className="text-[10px] text-outline font-medium uppercase tracking-wider mt-1">Easy</div>
              </div>
            </div>
            
            <div className="w-full text-center mt-2">
              <span className="text-sm font-semibold text-outline">Accuracy: {accuracy}%</span>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button onClick={() => fetchInitialData(isOvertime)} className="w-full inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer">
                Try another session
              </button>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => router.push('/notes')}
                  className="flex-1 inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer"
                >
                  Back to notes
                </button>
                <button
                  onClick={() => router.push('/study')}
                  className="flex-1 inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer"
                >
                  Free Study
                </button>
              </div>
            </div>
          </div>
      </div>
    )
  }

  // REVIEWING STATE
  const currentCard = queue[currentCardIndex]
  const cardState = {
    interval_days: currentCard?.interval_days || 0,
    ease_factor: currentCard?.ease_factor || 2.5,
    repetitions: currentCard?.repetitions || 0,
  }
  const intervals = previewIntervals(cardState)

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8">
      <header className="mb-4 flex items-center gap-4 shrink-0">
        <button
          onClick={() => { setPendingExitUrl('/study'); setShowExitModal(true); }}
          className="p-2 rounded-xl border border-outline-variant/40 text-outline hover:bg-surface-container-low transition-colors"
          title="Exit Session"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-headline-md text-primary">Daily Review</h1>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {/* Progress Indicator */}
          <div className="w-full max-w-xl">
            <div className="flex justify-between text-xs font-semibold text-outline mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container transition-all duration-300"
                style={{ width: `${((currentCardIndex) / queue.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Card Container */}
          <div className="w-full flex items-center justify-center gap-4">
            {/* 3D Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 max-w-xl aspect-[4/3] max-h-[380px] cursor-pointer"
              
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
              >
                {/* Front Side */}
                <div
                  className="absolute inset-0 w-full h-full bg-white border border-outline-variant/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-sm"
                  
                >
                  <div className="flex justify-between items-center gap-4">
                    {currentCard?.notes?.title && (
                      <div onClick={(e) => { e.stopPropagation(); if (currentCard.note_id) { setPendingExitUrl(`/notes/${currentCard.note_id}`); setShowExitModal(true); } }} className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-outline-variant/40 rounded-full font-semibold text-xs text-primary max-w-[220px] truncate shadow-sm hover:bg-surface-container-low cursor-pointer transition-colors" title="Go to note">
                        <BookOpen className="w-3 h-3 text-primary-container shrink-0" />
                        <span>From: {currentCard.notes.title}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCard(currentCard)
                        }}
                        className="p-1.5 rounded-full hover:bg-surface border border-transparent hover:border-outline-variant/40 text-outline hover:text-primary-container transition-all"
                        title="Edit Card"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-4">
                    <p className="text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed">
                      {currentCard?.question}
                    </p>
                  </div>
                  <div className="text-center text-xs text-outline font-medium flex items-center justify-center gap-1.5 opacity-60">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Space or tap to reveal answer</span>
                  </div>
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0 w-full h-full bg-surface border-2 border-primary-container/40 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-sm backface-hidden [transform:rotateY(180deg)]"
                >
                  <div className="flex justify-between items-center gap-4">
                    {currentCard?.notes?.title && (
                      <div onClick={(e) => { e.stopPropagation(); if (currentCard.note_id) { setPendingExitUrl(`/notes/${currentCard.note_id}`); setShowExitModal(true); } }} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-outline-variant/40 rounded-full font-semibold text-xs text-primary max-w-[220px] truncate shadow-sm hover:bg-surface-container-low cursor-pointer transition-colors" title="Go to note">
                        <BookOpen className="w-3 h-3 text-primary-container shrink-0" />
                        <span>From: {currentCard.notes.title}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCard(currentCard)
                        }}
                        className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-outline-variant/40 text-outline hover:text-primary-container transition-all"
                        title="Edit Card"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto w-full">
                    <p className="text-base md:text-lg text-on-surface leading-relaxed whitespace-pre-wrap text-center w-full">
                      {currentCard?.answer}
                    </p>
                  </div>
                  <div className="text-center text-xs text-outline font-medium flex items-center justify-center gap-1.5 opacity-60">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Space or tap to flip back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xl flex flex-col items-center gap-3">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 bg-primary-container hover:bg-primary text-white font-semibold rounded-2xl transition-all shadow-sm text-sm"
              >
                Reveal answer
              </button>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <div className="text-center font-semibold text-outline text-sm">
                  How well did you remember this?
                </div>
                <div className="w-full grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleRating('hard')}
                    className="flex flex-col items-center py-3 bg-error-container hover:bg-[#ffb4ab] text-error rounded-2xl transition-all shadow-sm"
                  >
                    <span className="font-bold text-sm">Hard</span>
                    <span className="text-xs opacity-80 mt-0.5">{formatInterval(intervals.hard)}</span>
                  </button>
                  <button
                    onClick={() => handleRating('ok')}
                    className="flex flex-col items-center py-3 bg-[#fff3e0] hover:bg-[#ffe0b2] text-[#e65100] rounded-2xl transition-all shadow-sm"
                  >
                    <span className="font-bold text-sm">OK</span>
                    <span className="text-xs opacity-80 mt-0.5">{formatInterval(intervals.ok)}</span>
                  </button>
                  <button
                    onClick={() => handleRating('easy')}
                    className="flex flex-col items-center py-3 bg-secondary-fixed hover:bg-[#b7ccb6] text-on-secondary-fixed rounded-2xl transition-all shadow-sm"
                  >
                    <span className="font-bold text-sm">Easy</span>
                    <span className="text-xs opacity-80 mt-0.5">{formatInterval(intervals.easy)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-on-background/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl flex flex-col gap-2 text-center">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Exit Daily Review?</h3>
              <p className="text-sm text-outline leading-relaxed mb-6">
                Are you sure you want to exit your daily review? Your progress so far has been saved, but you still have cards left for today.
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
                onClick={() => {
                  setShowExitModal(false)
                  if (pendingExitUrl) router.push(pendingExitUrl)
                }}
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
