import { Plus, Sparkles } from 'lucide-react'
import { chooseModeStyles } from './styles'

interface ChooseModeViewProps {
  onStartCustom: () => void
  onStartAi: () => void
}

export default function ChooseModeView({ onStartCustom, onStartAi }: ChooseModeViewProps) {
  return (
    <div className={chooseModeStyles.grid}>
      <button
        type="button"
        onClick={onStartCustom}
        className={chooseModeStyles.customCard}
      >
        <div className={chooseModeStyles.customIconBadge}>
          <Plus className={chooseModeStyles.icon} />
        </div>
        <div className={chooseModeStyles.textWrap}>
          <h3 className={chooseModeStyles.cardTitle}>Create custom cards</h3>
          <p className={chooseModeStyles.cardBody}>
            Build your own question and answer pairs from scratch.
          </p>
        </div>
        <span className={chooseModeStyles.cardLabel}>Start manually</span>
      </button>

      <button
        type="button"
        onClick={onStartAi}
        className={chooseModeStyles.aiCard}
      >
        <div className={chooseModeStyles.aiIconBadge}>
          <Sparkles className={chooseModeStyles.icon} />
        </div>
        <div className={chooseModeStyles.textWrap}>
          <h3 className={chooseModeStyles.cardTitle}>Generate with AI</h3>
          <p className={chooseModeStyles.cardBody}>
            Let Magic Study draft cards from the note content, then edit before saving.
          </p>
        </div>
        <span className={chooseModeStyles.cardLabel}>Use AI</span>
      </button>
    </div>
  )
}
