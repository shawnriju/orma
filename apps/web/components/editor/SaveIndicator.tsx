import { Clock, Check } from 'lucide-react'
import { SaveState } from '../../stores/editorStore'
import { saveIndicatorStyles } from './styles'

interface SaveIndicatorProps {
  readingTime: string
  saveState: SaveState
}

export default function SaveIndicator({ readingTime, saveState }: SaveIndicatorProps) {
  return (
    <div className={saveIndicatorStyles.row}>
      <div className={saveIndicatorStyles.readingTimeGroup}>
        <Clock className={saveIndicatorStyles.readingTimeIcon} />
        <span>{readingTime}</span>
      </div>
      <div className={saveIndicatorStyles.stateGroup}>
        {saveState === 'saving' && (
          <span className={saveIndicatorStyles.savingText}>Saving...</span>
        )}
        {saveState === 'saved' && (
          <span className={saveIndicatorStyles.savedText}>
            <Check className={saveIndicatorStyles.savedIcon} /> Saved
          </span>
        )}
        {saveState === 'error' && (
          <span className={saveIndicatorStyles.errorText}>Save failed</span>
        )}
      </div>
    </div>
  )
}
