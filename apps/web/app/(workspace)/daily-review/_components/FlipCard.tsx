import { BookOpen, Edit3, RotateCw } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { flipCardStyles } from './styles'

interface FlipCardProps {
  card: Flashcard | undefined
  isFlipped: boolean
  onToggleFlip: () => void
  onEdit: () => void
  onExitRequest: (url: string) => void
}

export default function FlipCard({ card, isFlipped, onToggleFlip, onEdit, onExitRequest }: FlipCardProps) {
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
                onClick={(e) => { e.stopPropagation(); if (card.note_id) { onExitRequest(`/notes/${card.note_id}`) } }}
                className={flipCardStyles.noteChipFront}
                title="Go to note"
              >
                <BookOpen className={flipCardStyles.noteChipIcon} />
                <span>From: {card.notes.title}</span>
              </div>
            )}
            <div className={flipCardStyles.editButtonRow}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className={flipCardStyles.editButtonFront}
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
            <span>Space or tap to reveal answer</span>
          </div>
        </div>

        {/* Back Side */}
        <div className={flipCardStyles.faceBack}>
          <div className={flipCardStyles.faceHeaderRow}>
            {card?.notes?.title && (
              <div
                onClick={(e) => { e.stopPropagation(); if (card.note_id) { onExitRequest(`/notes/${card.note_id}`) } }}
                className={flipCardStyles.noteChipBack}
                title="Go to note"
              >
                <BookOpen className={flipCardStyles.noteChipIcon} />
                <span>From: {card.notes.title}</span>
              </div>
            )}
            <div className={flipCardStyles.editButtonRow}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className={flipCardStyles.editButtonBack}
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
            <span>Space or tap to flip back</span>
          </div>
        </div>
      </div>
    </div>
  )
}
