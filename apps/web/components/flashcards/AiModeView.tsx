import { AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { aiModeStyles } from './styles'

interface AiModeViewProps {
  errorMsg: string
  isPending: boolean
  hasNoDrafts: boolean
  wordCount: number
  onGenerate: () => void
  onSwitchToCustom: () => void
}

export default function AiModeView({ errorMsg, isPending, hasNoDrafts, wordCount, onGenerate, onSwitchToCustom }: AiModeViewProps) {
  return (
    <div className={aiModeStyles.wrap}>
      {errorMsg && (
        <div className={aiModeStyles.errorBanner}>
          <AlertCircle className={aiModeStyles.errorIcon} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isPending ? (
        <div className={aiModeStyles.loadingWrap}>
          <Loader2 className={aiModeStyles.loadingIcon} />
          <p className={aiModeStyles.loadingText}>AI is writing your flashcards...</p>
        </div>
      ) : hasNoDrafts ? (
        <div className={aiModeStyles.promptWrap}>
          <div className={aiModeStyles.promptIconBadge}>
            <Sparkles className={aiModeStyles.promptIcon} />
          </div>
          <div className={aiModeStyles.promptTextWrap}>
            <h3 className={aiModeStyles.promptHeading}>Generate from this note</h3>
            <p className={aiModeStyles.promptBody}>
              Magic Study uses the note content to draft study cards. You can edit every card before saving.
            </p>
            {wordCount < 20 && (
              <p className={aiModeStyles.wordCountWarning}>
                Your note needs at least 20 words before AI generation will work.
              </p>
            )}
          </div>
          <div className={aiModeStyles.actionsRow}>
            <button
              type="button"
              onClick={onGenerate}
              disabled={wordCount < 20}
              className={aiModeStyles.generateButton}
            >
              <Sparkles className={aiModeStyles.generateIcon} />
              Generate flashcards
            </button>
            <button
              type="button"
              onClick={onSwitchToCustom}
              className={aiModeStyles.switchButton}
            >
              Switch to custom
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
