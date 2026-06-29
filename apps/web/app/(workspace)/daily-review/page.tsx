'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, RotateCw, ChevronLeft, ChevronRight, BookOpen, Clock, Edit3, Loader2 } from 'lucide-react'
import { api, Flashcard } from '../../../lib/api'
import { previewIntervals, Rating } from '../../../lib/sm2'
import EditFlashcardModal from '../../../components/flashcards/EditFlashcardModal'
import { useQueryClient } from '@tanstack/react-query'
import styles from '../workspace.module.css'

type PageState = 'loading' | 'start' | 'empty' | 'reviewing' | 'complete'

export default function DailyReviewPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [pageState, setPageState] = useState<PageState>('loading')
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [isOvertime, setIsOvertime] = useState(false)
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)
  
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
      <div className={styles.workspacePageLoading}>
        <Loader2 className={styles.workspaceMainToggleIcon} />
        <div className={styles.workspaceEmptyText}>Loading your daily review...</div>
      </div>
    )
  }

  if (pageState === 'start') {
    return (
      <div className={styles.workspaceDailyWrap}>
        <header className="mb-8">
          <h1 className={styles.workspaceStudyHeaderTitle}>Daily Review</h1>
          <p className={styles.workspaceStudyHeaderText}>Strengthen your memory with spaced repetition</p>
        </header>
        <div className={styles.workspaceDailyHero}>
           <div className={styles.workspaceDailyCard}>
            <div className={styles.workspaceEmptyIcon}>
              <Clock className={styles.workspaceNavIcon} />
            </div>

            <div>
              <h2 className={styles.workspaceEmptyTitle}>Ready to study?</h2>
              <p className={styles.workspaceEmptyText}>
                Out of the total {totalCards} cards created, these are the {queue.length} selected for your daily review session.
              </p>
            </div>

            <button
              onClick={() => setPageState('reviewing')}
              className={styles.workspaceButtonPrimary}
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
      <div className={styles.workspaceDailyWrap}>
        <header className="mb-8">
          <h1 className={styles.workspaceStudyHeaderTitle}>Daily Review</h1>
          <p className={styles.workspaceStudyHeaderText}>Strengthen your memory with spaced repetition</p>
        </header>
        <div className={styles.workspaceDailyHero}>
           <div className={styles.workspaceDailyCard}>
            <div className={styles.workspaceEmptyIcon}>
              <CheckCircle2 className={styles.workspaceNavIcon} />
            </div>

            <div>
              <h2 className={styles.workspaceEmptyTitle}>You're all caught up ✓</h2>
              <p className={styles.workspaceEmptyText}>
                You have 0 cards due for today.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4 max-w-sm mx-auto">
              <button
                onClick={() => setShowOvertimeWarning(true)}
                className={styles.workspaceButtonSecondary}
              >
                Study More (Overtime)
              </button>
              <button
                onClick={() => router.push('/study')}
                className={styles.workspaceButtonPrimary}
              >
                Free Study →
              </button>
            </div>
          </div>
        </div>

        {/* Overtime Confirmation Modal */}
        {showOvertimeWarning && (
          <div className={styles.workspaceModalOverlay}>
            <div className={styles.workspaceModal}>
              <div>
                <h3 className={styles.workspaceModalTitle}>Start Overtime Session?</h3>
                <p className={styles.workspaceModalText}>
                  You have completed your daily review. Further attempts will fetch future cards and affect their scheduling. Are you sure you want to proceed?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setShowOvertimeWarning(false)}
                  className={styles.workspaceButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowOvertimeWarning(false)
                    setIsOvertime(true)
                  }}
                  className={styles.workspaceButtonPrimary}
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
      <div className={styles.workspaceDailyWrap}>
         <div className={styles.workspaceDailyCard}>
            {streakCount > 0 && (
              <div className={styles.workspaceDailyBadge}>
                🔥 {streakCount}-day streak
              </div>
            )}
            
            <div className={styles.workspaceEmptyIcon}>
              <CheckCircle2 className={styles.workspaceNavIcon} />
            </div>

            <div>
              <h2 className={styles.workspaceStudyHeaderTitle}>Great job!</h2>
              <p className={styles.workspaceEmptyText}>
                You finished your daily study session.
              </p>
              <div className={styles.workspaceStudyMetaChip}>
                {totalCards} total cards saved
              </div>
            </div>

            <div className={styles.workspaceDailyStatGrid}>
              <div className={styles.workspaceDailyStatCard}>
                <div className="text-lg font-bold text-[#ba1a1a]">{sessionStats.hard}</div>
                <div className="text-[10px] text-[#87736c] font-medium uppercase tracking-wider mt-1">Hard</div>
              </div>
              <div className={styles.workspaceDailyStatCard}>
                <div className="text-lg font-bold text-[#f59e0b]">{sessionStats.ok}</div>
                <div className="text-[10px] text-[#87736c] font-medium uppercase tracking-wider mt-1">OK</div>
              </div>
              <div className={styles.workspaceDailyStatCard}>
                <div className="text-lg font-bold text-[#506351]">{sessionStats.easy}</div>
                <div className="text-[10px] text-[#87736c] font-medium uppercase tracking-wider mt-1">Easy</div>
              </div>
            </div>
            
            <div className="w-full text-center mt-2">
              <span className="text-sm font-semibold text-[#87736c]">Accuracy: {accuracy}%</span>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button onClick={() => fetchInitialData(isOvertime)} className={styles.workspaceButtonPrimary}>
                Try another session
              </button>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => router.push('/notes')}
                  className={styles.workspaceButtonSecondary}
                >
                  Back to notes
                </button>
                <button
                  onClick={() => router.push('/study')}
                  className={styles.workspaceButtonSecondary}
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
    <div className={styles.workspaceDailyWrap}>
      <header className={styles.workspaceStudyHeader}>
        <button
          onClick={() => router.push('/study')}
          className={styles.workspaceMainToggle}
          title="Exit Session"
        >
          <ArrowLeft className={styles.workspaceMainToggleIcon} />
        </button>
        <div>
          <h1 className={styles.workspaceStudyHeaderTitle}>Daily Review</h1>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {/* Progress Indicator */}
          <div className="w-full max-w-xl">
            <div className="flex justify-between text-xs font-semibold text-[#87736c] mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
            </div>
            <div className="w-full h-2 bg-[#f5ece7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d67d5c] transition-all duration-300"
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
                        title="From note"
                      >
                        <BookOpen className="w-3 h-3 text-[#d67d5c] shrink-0" />
                        <span>From: {currentCard.notes.title}</span>
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
                    <span>Space or tap to reveal answer</span>
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
                        title="From note"
                      >
                        <BookOpen className="w-3 h-3 text-[#d67d5c] shrink-0" />
                        <span>From: {currentCard.notes.title}</span>
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
                className="w-full py-4 bg-[#d67d5c] hover:bg-[#94492c] text-white font-semibold rounded-2xl transition-all shadow-sm text-sm"
              >
                Reveal answer
              </button>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <div className="text-center font-semibold text-[#87736c] text-sm">
                  How well did you remember this?
                </div>
                <div className="w-full grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleRating('hard')}
                    className="flex flex-col items-center py-3 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] rounded-2xl transition-all shadow-sm"
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
                    className="flex flex-col items-center py-3 bg-[#d3e8d1] hover:bg-[#b7ccb6] text-[#0e1f11] rounded-2xl transition-all shadow-sm"
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

      {editingCard && (
        <EditFlashcardModal 
          flashcard={editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  )
}
