import Link from 'next/link'
import { Library, X } from 'lucide-react'
import { Flashcard } from '../../../../../lib/api'
import { panelStyles } from './styles'
import FlashcardListItem from './FlashcardListItem'

interface FlashcardsSidePanelProps {
  isLoading: boolean
  flashcards: Flashcard[] | undefined
  dueCount: number | undefined
  noteId: string
  onClose: () => void
  onEditCard: (card: Flashcard) => void
}

export default function FlashcardsSidePanel({ isLoading, flashcards, dueCount, noteId, onClose, onEditCard }: FlashcardsSidePanelProps) {
  return (
    <div className={panelStyles.wrap}>
      <div className={panelStyles.headerRow}>
        <h3 className={panelStyles.heading}>
          <Library className={panelStyles.headingIcon} />
          Generated Cards
        </h3>
        <div className={panelStyles.actionsGroup}>
          {dueCount !== undefined && dueCount > 0 && (
            <Link
              href={`/study?noteId=${noteId}`}
              className={panelStyles.studyLink}
            >
              Study Due ({dueCount})
            </Link>
          )}
          <button
            onClick={onClose}
            className={panelStyles.closeButton}
          >
            <X className={panelStyles.closeIcon} />
          </button>
        </div>
      </div>

      <div className={panelStyles.body}>
        {isLoading ? (
          <div className={panelStyles.loadingText}>Loading cards...</div>
        ) : !flashcards || flashcards.length === 0 ? (
          <div className={panelStyles.emptyWrap}>
            <div className={panelStyles.emptyIconBadge}>
              <Library className={panelStyles.emptyIcon} />
            </div>
            <p className={panelStyles.emptyText}>No flashcards generated yet.</p>
          </div>
        ) : (
          <div className={panelStyles.list}>
            {flashcards.map((card) => (
              <FlashcardListItem key={card.id} card={card} onEdit={() => onEditCard(card)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
