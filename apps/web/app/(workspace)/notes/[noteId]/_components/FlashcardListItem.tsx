import { Edit3 } from 'lucide-react'
import { Flashcard } from '../../../../../lib/api'
import { flashcardItemStyles } from './styles'

interface FlashcardListItemProps {
  card: Flashcard
  onEdit: () => void
}

export default function FlashcardListItem({ card, onEdit }: FlashcardListItemProps) {
  return (
    <div className={flashcardItemStyles.card}>
      <button
        onClick={onEdit}
        className={flashcardItemStyles.editButton}
        title="Edit Flashcard"
      >
        <Edit3 className={flashcardItemStyles.editIcon} />
      </button>
      <div>
        <span className={flashcardItemStyles.questionLabel}>Question</span>
        <p className={flashcardItemStyles.questionText}>{card.question}</p>
      </div>
      <div className={flashcardItemStyles.divider}></div>
      <div>
        <span className={flashcardItemStyles.answerLabel}>Answer</span>
        <p className={flashcardItemStyles.answerText}>{card.answer}</p>
      </div>
    </div>
  )
}
