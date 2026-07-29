'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api, Flashcard } from '../../../lib/api'
import { previewIntervals, Rating } from '../../../lib/sm2'
import { useQueryClient } from '@tanstack/react-query'
import LoadingState from './_components/LoadingState'
import StartState from './_components/StartState'
import EmptyState from './_components/EmptyState'
import CompleteState from './_components/CompleteState'
import ReviewingState from './_components/ReviewingState'

type PageState = 'loading' | 'start' | 'empty' | 'reviewing' | 'complete'

export default function DailyReviewPage() {
  const queryClient = useQueryClient()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [isOvertime, setIsOvertime] = useState(false)

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

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
    return <LoadingState />
  }

  if (pageState === 'start') {
    return (
      <StartState
        totalCards={totalCards}
        queueLength={queue.length}
        onStart={() => setPageState('reviewing')}
      />
    )
  }

  if (pageState === 'empty') {
    return <EmptyState onConfirmOvertime={() => setIsOvertime(true)} />
  }

  if (pageState === 'complete') {
    return (
      <CompleteState
        sessionStats={sessionStats}
        streakCount={streakCount}
        totalCards={totalCards}
        onTryAnother={() => fetchInitialData(isOvertime)}
      />
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
    <ReviewingState
      currentCard={currentCard}
      currentCardIndex={currentCardIndex}
      queueLength={queue.length}
      isFlipped={isFlipped}
      onToggleFlip={() => setIsFlipped(prev => !prev)}
      intervals={intervals}
      onRate={handleRating}
      formatInterval={formatInterval}
    />
  )
}
