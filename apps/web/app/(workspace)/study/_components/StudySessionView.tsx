'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { sessionViewStyles } from './styles'
import FlipCard from './FlipCard'
import ExitConfirmModal from './ExitConfirmModal'

interface StudySessionViewProps {
  activeSessionLabel: string
  currentCard: Flashcard | undefined
  currentCardIndex: number
  sessionLength: number
  isFlipped: boolean
  onToggleFlip: () => void
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
  onAnswerClick: () => void
  onEdit: () => void
  onNavigateToNote: (noteId: string) => void
  onConfirmExit: () => void
}

export default function StudySessionView({
  activeSessionLabel,
  currentCard,
  currentCardIndex,
  sessionLength,
  isFlipped,
  onToggleFlip,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  onAnswerClick,
  onEdit,
  onNavigateToNote,
  onConfirmExit,
}: StudySessionViewProps) {
  const [showExitModal, setShowExitModal] = useState(false)

  return (
    <div className={sessionViewStyles.wrapper}>
      <header className={sessionViewStyles.header}>
        <button
          onClick={() => setShowExitModal(true)}
          className={sessionViewStyles.backButton}
          title="Exit Session"
        >
          <ArrowLeft className={sessionViewStyles.backIcon} />
        </button>
        <div>
          <h1 className={sessionViewStyles.title}>Free Study Session</h1>
          <p className={sessionViewStyles.subtitle}>
            Reviewing {activeSessionLabel}
          </p>
        </div>
      </header>

      <div className={sessionViewStyles.contentArea}>
        <div className={sessionViewStyles.contentInner}>
          {/* Progress Indicator */}
          <div className={sessionViewStyles.progressWrap}>
            <div className={sessionViewStyles.progressLabelRow}>
              <span>Progress</span>
              <span>{currentCardIndex + 1} of {sessionLength}</span>
            </div>
            <div className={sessionViewStyles.progressTrack}>
              <div
                className={sessionViewStyles.progressFill}
                style={{ width: `${(currentCardIndex / sessionLength) * 100}%` }}
              />
            </div>
          </div>

          {/* Card Container with Navigation Arrows */}
          <div className={sessionViewStyles.cardRow}>
            <button
              disabled={!canGoPrev}
              onClick={onPrev}
              className={sessionViewStyles.navButtonPrev}
              title="Previous Card"
            >
              <ChevronLeft className={sessionViewStyles.navIcon} />
            </button>

            <FlipCard
              card={currentCard}
              isFlipped={isFlipped}
              onToggleFlip={onToggleFlip}
              onEdit={onEdit}
              onNavigateToNote={onNavigateToNote}
            />

            <button
              disabled={!canGoNext}
              onClick={onNext}
              className={sessionViewStyles.navButtonNext}
              title="Next Card"
            >
              <ChevronRight className={sessionViewStyles.navIcon} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className={sessionViewStyles.actionsRow}>
            {!isFlipped ? (
              <button
                onClick={onToggleFlip}
                className={sessionViewStyles.showAnswerButton}
              >
                Show Answer
              </button>
            ) : (
              <div className={sessionViewStyles.nextButtonWrap}>
                <button
                  onClick={onAnswerClick}
                  className={sessionViewStyles.nextButton}
                >
                  <span>{currentCardIndex >= sessionLength - 1 ? 'Finish Session' : 'Next Card'}</span>
                  <ChevronRight className={sessionViewStyles.nextIcon} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExitModal && (
        <ExitConfirmModal
          onStay={() => setShowExitModal(false)}
          onConfirmExit={onConfirmExit}
        />
      )}
    </div>
  )
}
