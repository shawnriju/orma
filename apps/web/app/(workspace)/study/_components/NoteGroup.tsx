import { ChevronDown } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { noteGroupStyles } from './styles'
import FlashcardRow from './FlashcardRow'

interface NoteGroupProps {
  noteId: string
  title: string
  cards: Flashcard[]
  isExpanded: boolean
  onToggleExpand: () => void
  onStartNote: () => void
  expandedCardIds: Record<string, boolean>
  onToggleCard: (cardId: string, e: React.MouseEvent) => void
  onEditCard: (card: Flashcard) => void
}

export default function NoteGroup({
  noteId,
  title,
  cards,
  isExpanded,
  onToggleExpand,
  onStartNote,
  expandedCardIds,
  onToggleCard,
  onEditCard,
}: NoteGroupProps) {
  return (
    <div className={noteGroupStyles.card}>
      {/* Note Header */}
      <div
        onClick={onToggleExpand}
        className={noteGroupStyles.headerRow}
      >
        <div className={noteGroupStyles.titleGroup}>
          <div>
            <h3 className={noteGroupStyles.title}>{title}</h3>
            <span className={noteGroupStyles.countText}>{cards.length} cards</span>
          </div>
        </div>
        <div className={noteGroupStyles.actionsGroup}>
          <button
            onClick={(e) => { e.stopPropagation(); onStartNote() }}
            className={noteGroupStyles.studyButton}
          >
            Study Note
          </button>
          <ChevronDown className={noteGroupStyles.chevron} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
        </div>
      </div>

      {/* Cards List */}
      {isExpanded && (
        <div className={noteGroupStyles.list}>
          {cards.map((card) => (
            <FlashcardRow
              key={card.id}
              card={card}
              isExpanded={!!expandedCardIds[card.id]}
              onToggleExpand={(e) => onToggleCard(card.id, e)}
              onEdit={() => onEditCard(card)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
