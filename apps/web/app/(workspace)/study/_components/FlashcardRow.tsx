import { ChevronDown, Edit3 } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { flashcardRowStyles } from './styles'

interface FlashcardRowProps {
  card: Flashcard
  isExpanded: boolean
  onToggleExpand: (e: React.MouseEvent) => void
  onEdit: () => void
}

export default function FlashcardRow({ card, isExpanded, onToggleExpand, onEdit }: FlashcardRowProps) {
  return (
    <div
      onClick={onToggleExpand}
      className={flashcardRowStyles.row}
    >
      <div className={flashcardRowStyles.headerRow}>
        <div className={flashcardRowStyles.questionWrap}>
          <p className={flashcardRowStyles.questionText}>
            {card.question}
          </p>
        </div>
        <ChevronDown className={`${flashcardRowStyles.chevron} ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className={flashcardRowStyles.answerWrap}>
          <p className={flashcardRowStyles.answerText}>
            {card.answer}
          </p>
          <div className={flashcardRowStyles.editRow}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className={flashcardRowStyles.editButton}
            >
              <Edit3 className={flashcardRowStyles.editIcon} />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
