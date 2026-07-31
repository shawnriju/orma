import { AlertCircle, CheckCircle2, CheckSquare, Plus, Square, Trash2 } from 'lucide-react'
import { DraftCard } from './types'
import { customModeStyles } from './styles'
import DraftCardItem from './DraftCardItem'

interface CustomModeViewProps {
  successMsg: string
  errorMsg: string
  draftCards: DraftCard[]
  expandedCards: Set<number>
  selectedCards: Set<number>
  allSelected: boolean
  onAddCard: () => void
  onToggleSelectAll: () => void
  onDeleteSelected: () => void
  onToggleSelectCard: (index: number) => void
  onToggleExpandCard: (index: number) => void
  onUpdateCard: (index: number, field: 'question' | 'answer', value: string) => void
  onDeleteCard: (index: number) => void
}

export default function CustomModeView({
  successMsg,
  errorMsg,
  draftCards,
  expandedCards,
  selectedCards,
  allSelected,
  onAddCard,
  onToggleSelectAll,
  onDeleteSelected,
  onToggleSelectCard,
  onToggleExpandCard,
  onUpdateCard,
  onDeleteCard,
}: CustomModeViewProps) {
  return (
    <div className={customModeStyles.wrap}>
      {successMsg && (
        <div className={customModeStyles.successBanner}>
          <CheckCircle2 className={customModeStyles.successIcon} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className={customModeStyles.errorBanner}>
          <AlertCircle className={customModeStyles.errorIcon} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={customModeStyles.toolbarRow}>
        <div>
          <div className={customModeStyles.toolbarLabel}>
            Draft cards ({draftCards.length})
          </div>
          <p className={customModeStyles.toolbarSubtext}>
            Edit your cards here, or add more before saving.
          </p>
        </div>
        <div className={customModeStyles.toolbarActions}>
          <button
            type="button"
            onClick={onAddCard}
            className={customModeStyles.addButton}
          >
            <Plus className={customModeStyles.addIcon} />
            Add card
          </button>
        </div>
      </div>

      {draftCards.length > 0 && (
        <div className={customModeStyles.bulkRow}>
          <button
            type="button"
            onClick={onToggleSelectAll}
            className={customModeStyles.selectAllButton}
          >
            {allSelected ? <CheckSquare className={customModeStyles.selectAllIconChecked} /> : <Square className={customModeStyles.selectAllIconUnchecked} />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>

          {selectedCards.size > 0 && (
            <button
              type="button"
              onClick={onDeleteSelected}
              className={customModeStyles.deleteSelectedButton}
            >
              <Trash2 className={customModeStyles.deleteSelectedIcon} />
              Delete Selected ({selectedCards.size})
            </button>
          )}
        </div>
      )}

      <div className={customModeStyles.list}>
        {draftCards.map((card, i) => (
          <DraftCardItem
            key={i}
            card={card}
            isExpanded={expandedCards.has(i)}
            isSelected={selectedCards.has(i)}
            onToggleSelect={() => onToggleSelectCard(i)}
            onToggleExpand={() => onToggleExpandCard(i)}
            onUpdateField={(field, value) => onUpdateCard(i, field, value)}
            onDelete={() => onDeleteCard(i)}
          />
        ))}
      </div>
    </div>
  )
}
