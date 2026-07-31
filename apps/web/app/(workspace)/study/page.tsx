'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { api, Flashcard } from '../../../lib/api'
import EditFlashcardModal from '../../../components/flashcards/EditFlashcardModal'
import { suspenseFallbackStyles } from './_components/styles'
import LoadingState from './_components/LoadingState'
import ErrorState from './_components/ErrorState'
import StudySessionView from './_components/StudySessionView'
import DashboardView from './_components/DashboardView'

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

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentCardIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentCardIndex(prev => Math.min(sessionCards.length - 1, prev + 1))
  }

  const handleNavigateToNote = (noteId: string) => {
    router.push(`/notes/${noteId}`)
  }

  let mainView: React.ReactNode

  if (isLoading) {
    mainView = <LoadingState />
  } else if (error) {
    mainView = <ErrorState />
  } else if (activeSession && sessionCards.length > 0) {
    // --- STUDY SESSION VIEW ---
    const currentCard = sessionCards[currentCardIndex]
    mainView = (
      <StudySessionView
        activeSessionLabel={activeSession === 'all' ? 'All Cards' : 'selected note'}
        currentCard={currentCard}
        currentCardIndex={currentCardIndex}
        sessionLength={sessionCards.length}
        isFlipped={isFlipped}
        onToggleFlip={() => setIsFlipped(prev => !prev)}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoPrev={currentCardIndex !== 0}
        canGoNext={currentCardIndex !== sessionCards.length - 1}
        onAnswerClick={handleAnswerClick}
        onEdit={() => setEditingCard(currentCard)}
        onNavigateToNote={handleNavigateToNote}
        onConfirmExit={confirmExit}
      />
    )
  } else {
    // --- DASHBOARD VIEW (Free-form browser) ---
    mainView = (
      <DashboardView
        allCards={allCards}
        groupedNotes={groupedNotes}
        expandedNotes={expandedNotes}
        expandedCards={expandedCards}
        onToggleNote={toggleNote}
        onToggleCard={toggleCard}
        onStartAll={handleStartAll}
        onStartNote={handleStartNote}
        onEditCard={setEditingCard}
      />
    )
  }

  return (
    <>
      {mainView}
      {editingCard && (
        <EditFlashcardModal
          flashcard={editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </>
  )
}

export default function StudyPage() {
  return (
    <React.Suspense fallback={
      <div className={suspenseFallbackStyles.container}>
        Loading review session...
      </div>
    }>
      <StudyDashboard />
    </React.Suspense>
  )
}
