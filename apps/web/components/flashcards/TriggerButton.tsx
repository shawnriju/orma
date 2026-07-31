import { Sparkles } from 'lucide-react'
import { triggerButtonStyles } from './styles'

interface TriggerButtonProps {
  onOpen: () => void
}

export default function TriggerButton({ onOpen }: TriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={triggerButtonStyles.button}
    >
      <span className={triggerButtonStyles.iconBadge}>
        <Sparkles className={triggerButtonStyles.icon} />
      </span>
      <span className={triggerButtonStyles.label}>
        Generate flashcards
      </span>
    </button>
  )
}
