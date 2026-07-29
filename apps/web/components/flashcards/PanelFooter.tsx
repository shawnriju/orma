import { Loader2, Sparkles } from 'lucide-react'
import { panelFooterStyles } from './styles'

interface PanelFooterProps {
  mode: 'choose' | 'custom' | 'ai'
  isSaving: boolean
  draftCardsCount: number
  onSwitchToAi: () => void
  onSaveAll: () => void
}

export default function PanelFooter({ mode, isSaving, draftCardsCount, onSwitchToAi, onSaveAll }: PanelFooterProps) {
  return (
    <div className={panelFooterStyles.bar}>
      <div className={panelFooterStyles.row}>
        <div className={panelFooterStyles.hintText}>
          {mode === 'choose' ? 'Pick how you want to build flashcards.' : 'You can switch modes without losing your draft until you close the modal.'}
        </div>
        <div className={panelFooterStyles.actionsWrap}>
          {mode === 'custom' && (
            <button
              type="button"
              onClick={onSwitchToAi}
              className={panelFooterStyles.aiSwitchButton}
            >
              Generate with AI
            </button>
          )}
          {mode === 'custom' && (
            <button
              type="button"
              onClick={onSaveAll}
              disabled={isSaving || draftCardsCount === 0}
              className={panelFooterStyles.saveButton}
            >
              {isSaving ? <Loader2 className={`${panelFooterStyles.saveIcon} animate-spin`} /> : <Sparkles className={panelFooterStyles.saveIcon} />}
              Save flashcards
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
