import { ChevronDown, ChevronUp, CheckSquare, Square, Trash2 } from 'lucide-react'
import { DraftCard } from './types'
import { draftCardItemStyles } from './styles'

interface DraftCardItemProps {
  card: DraftCard
  isExpanded: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
  onUpdateField: (field: 'question' | 'answer', value: string) => void
  onDelete: () => void
}

export default function DraftCardItem({
  card,
  isExpanded,
  isSelected,
  onToggleSelect,
  onToggleExpand,
  onUpdateField,
  onDelete,
}: DraftCardItemProps) {
  return (
    <div
      className={`${draftCardItemStyles.cardBase} ${isSelected ? draftCardItemStyles.cardSelected : draftCardItemStyles.cardUnselected} ${draftCardItemStyles.cardSuffix}`}
    >
      <div className={draftCardItemStyles.innerRow}>
        <button
          type="button"
          onClick={onToggleSelect}
          className={draftCardItemStyles.selectButton}
        >
          {isSelected ? <CheckSquare className={draftCardItemStyles.selectIconChecked} /> : <Square className={draftCardItemStyles.selectIconUnchecked} />}
        </button>

        <div className={draftCardItemStyles.contentWrap}>
          {!isExpanded ? (
            <button
              type="button"
              onClick={onToggleExpand}
              className={draftCardItemStyles.collapsedButton}
            >
              <p className={draftCardItemStyles.questionPreview}>
                {card.question || <span className={draftCardItemStyles.emptyQuestionText}>Empty question...</span>}
              </p>
            </button>
          ) : (
            <div className={draftCardItemStyles.expandedWrap}>
              <div className={draftCardItemStyles.fieldWrap}>
                <label className={draftCardItemStyles.fieldLabel}>Question</label>
                <textarea
                  value={card.question}
                  onChange={(e) => onUpdateField('question', e.target.value)}
                  className={draftCardItemStyles.questionTextarea}
                  rows={2}
                />
              </div>
              <div className={draftCardItemStyles.fieldWrap}>
                <label className={draftCardItemStyles.fieldLabel}>Answer</label>
                <textarea
                  value={card.answer}
                  onChange={(e) => onUpdateField('answer', e.target.value)}
                  className={draftCardItemStyles.answerTextarea}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <div className={draftCardItemStyles.actionsWrap}>
          <button
            type="button"
            onClick={onToggleExpand}
            className={draftCardItemStyles.expandButton}
          >
            {isExpanded ? <ChevronUp className={draftCardItemStyles.expandIcon} /> : <ChevronDown className={draftCardItemStyles.expandIcon} />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={draftCardItemStyles.deleteButton}
          >
            <Trash2 className={draftCardItemStyles.deleteIcon} />
          </button>
        </div>
      </div>
    </div>
  )
}
