import { exitModalStyles } from './styles'

interface ExitConfirmModalProps {
  onStay: () => void
  onConfirmExit: () => void
}

export default function ExitConfirmModal({ onStay, onConfirmExit }: ExitConfirmModalProps) {
  return (
    <div className={exitModalStyles.backdrop}>
      <div className={exitModalStyles.panel}>
        <div>
          <h3 className={exitModalStyles.heading}>Exit Daily Review?</h3>
          <p className={exitModalStyles.bodyText}>
            Are you sure you want to exit your daily review? Your progress so far has been saved, but you still have cards left for today.
          </p>
        </div>
        <div className={exitModalStyles.buttonRow}>
          <button onClick={onStay} className={exitModalStyles.stayButton}>
            Stay
          </button>
          <button onClick={onConfirmExit} className={exitModalStyles.exitButton}>
            Exit Session
          </button>
        </div>
      </div>
    </div>
  )
}
