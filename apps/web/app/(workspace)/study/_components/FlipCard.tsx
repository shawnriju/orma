import { BookOpen, Edit3, RotateCw } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { flipCardStyles } from './styles'

interface FlipCardProps {
  card: Flashcard | undefined
  isFlipped: boolean
  onToggleFlip: () => void
  onEdit: () => void
  onNavigateToNote: (noteId: string) => void
}

export default function FlipCard({ card, isFlipped, onToggleFlip, onEdit, onNavigateToNote }: FlipCardProps) {
  return (
    <div onClick={onToggleFlip} className={flipCardStyles.outer}>
      <div
        className={`${flipCardStyles.inner} ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* Front Side */}
        <div className={flipCardStyles.faceFront}>
          <div className={flipCardStyles.faceHeaderRow}>
            {card?.notes?.title && (
              <div
                onClick={(e) => { e.stopPropagation(); if (card.note_id) onNavigateToNote(card.note_id) }}
                className={flipCardStyles.noteChip}
                title="Go to note"
              >
                <BookOpen className={flipCardStyles.noteChipIcon} />
                <span>{card.notes.title}</span>
              </div>
            )}
            <div className={flipCardStyles.editButtonWrap}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className={flipCardStyles.editButton}
                title="Edit Card"
              >
                <Edit3 className={flipCardStyles.editIcon} />
              </button>
            </div>
          </div>
          <div className={flipCardStyles.questionWrap}>
            <p className={flipCardStyles.questionText}>
              {card?.question}
            </p>
          </div>
          <div className={flipCardStyles.hintRow}>
            <RotateCw className={flipCardStyles.hintIcon} />
            <span>Tap card to reveal answer</span>
          </div>
        </div>

        {/* Back Side */}
        <div className={flipCardStyles.faceBack}>
          <div className={flipCardStyles.faceHeaderRow}>
            {card?.notes?.title && (
              <div
                onClick={(e) => { e.stopPropagation(); if (card.note_id) onNavigateToNote(card.note_id) }}
                className={flipCardStyles.noteChip}
                title="Go to note"
              >
                <BookOpen className={flipCardStyles.noteChipIcon} />
                <span>{card.notes.title}</span>
              </div>
            )}
            <div className={flipCardStyles.editButtonWrap}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className={flipCardStyles.editButton}
                title="Edit Card"
              >
                <Edit3 className={flipCardStyles.editIcon} />
              </button>
            </div>
          </div>
          <div className={flipCardStyles.answerWrap}>
            <p className={flipCardStyles.answerText}>
              {card?.answer}
            </p>
          </div>
          <div className={flipCardStyles.hintRow}>
            <RotateCw className={flipCardStyles.hintIcon} />
            <span>Tap to flip back</span>
          </div>
        </div>
      </div>
    </div>
  )
}
