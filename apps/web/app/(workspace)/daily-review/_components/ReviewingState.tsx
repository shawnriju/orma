'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { Rating } from '../../../../lib/sm2'
import EditFlashcardModal from '../../../../components/flashcards/EditFlashcardModal'
import { reviewingStateStyles } from './styles'
import FlipCard from './FlipCard'
import ExitConfirmModal from './ExitConfirmModal'

interface ReviewingStateProps {
  currentCard: Flashcard | undefined
  currentCardIndex: number
  queueLength: number
  isFlipped: boolean
  onToggleFlip: () => void
  intervals: { hard: number; ok: number; easy: number }
  onRate: (rating: Rating) => void
  formatInterval: (days: number) => string
}

export default function ReviewingState({
  currentCard,
  currentCardIndex,
  queueLength,
  isFlipped,
  onToggleFlip,
  intervals,
  onRate,
  formatInterval,
}: ReviewingStateProps) {
  const router = useRouter()
  const [showExitModal, setShowExitModal] = useState(false)
  const [pendingExitUrl, setPendingExitUrl] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)

  const requestExit = (url: string) => {
    setPendingExitUrl(url)
    setShowExitModal(true)
  }

  return (
    <div className={reviewingStateStyles.wrapper}>
      <header className={reviewingStateStyles.header}>
        <button
          onClick={() => requestExit('/study')}
          className={reviewingStateStyles.backButton}
          title="Exit Session"
        >
          <ArrowLeft className={reviewingStateStyles.backIcon} />
        </button>
        <div>
          <h1 className={reviewingStateStyles.title}>Daily Review</h1>
        </div>
      </header>

      <div className={reviewingStateStyles.contentArea}>
        <div className={reviewingStateStyles.contentInner}>
          {/* Progress Indicator */}
          <div className={reviewingStateStyles.progressWrap}>
            <div className={reviewingStateStyles.progressLabelRow}>
              <span>Progress</span>
              <span>Card {currentCardIndex + 1} of {queueLength}</span>
            </div>
            <div className={reviewingStateStyles.progressTrack}>
              <div
                className={reviewingStateStyles.progressFill}
                style={{ width: `${(currentCardIndex / queueLength) * 100}%` }}
              />
            </div>
          </div>

          {/* Card Container */}
          <div className={reviewingStateStyles.cardRow}>
            <FlipCard
              card={currentCard}
              isFlipped={isFlipped}
              onToggleFlip={onToggleFlip}
              onEdit={() => setEditingCard(currentCard ?? null)}
              onExitRequest={requestExit}
            />
          </div>

          {/* Action Buttons */}
          <div className={reviewingStateStyles.actionsWrap}>
            {!isFlipped ? (
              <button
                onClick={onToggleFlip}
                className={reviewingStateStyles.revealButton}
              >
                Reveal answer
              </button>
            ) : (
              <div className={reviewingStateStyles.rateBlock}>
                <div className={reviewingStateStyles.ratePromptText}>
                  How well did you remember this?
                </div>
                <div className={reviewingStateStyles.rateGrid}>
                  <button
                    onClick={() => onRate('hard')}
                    className={reviewingStateStyles.rateButtonHard}
                  >
                    <span className={reviewingStateStyles.rateButtonLabel}>Hard</span>
                    <span className={reviewingStateStyles.rateButtonInterval}>{formatInterval(intervals.hard)}</span>
                  </button>
                  <button
                    onClick={() => onRate('ok')}
                    className={reviewingStateStyles.rateButtonOk}
                  >
                    <span className={reviewingStateStyles.rateButtonLabel}>OK</span>
                    <span className={reviewingStateStyles.rateButtonInterval}>{formatInterval(intervals.ok)}</span>
                  </button>
                  <button
                    onClick={() => onRate('easy')}
                    className={reviewingStateStyles.rateButtonEasy}
                  >
                    <span className={reviewingStateStyles.rateButtonLabel}>Easy</span>
                    <span className={reviewingStateStyles.rateButtonInterval}>{formatInterval(intervals.easy)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExitModal && (
        <ExitConfirmModal
          onStay={() => setShowExitModal(false)}
          onConfirmExit={() => {
            setShowExitModal(false)
            if (pendingExitUrl) router.push(pendingExitUrl)
          }}
        />
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
