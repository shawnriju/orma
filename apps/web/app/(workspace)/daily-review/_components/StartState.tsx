import { Clock } from 'lucide-react'
import { pageShellStyles, startStateStyles } from './styles'

interface StartStateProps {
  totalCards: number
  queueLength: number
  onStart: () => void
}

export default function StartState({ totalCards, queueLength, onStart }: StartStateProps) {
  return (
    <div className={pageShellStyles.wrapper}>
      <header className={pageShellStyles.header}>
        <h1 className={pageShellStyles.title}>Daily Review</h1>
        <p className={pageShellStyles.subtitle}>Strengthen your memory with spaced repetition</p>
      </header>
      <div className={pageShellStyles.centerPanel}>
        <div className={pageShellStyles.card}>
          <div className={startStateStyles.iconBadge}>
            <Clock className={startStateStyles.icon} />
          </div>

          <div>
            <h2 className={startStateStyles.heading}>Ready to study?</h2>
            <p className={startStateStyles.bodyText}>
              Out of the total {totalCards} cards created, these are the {queueLength} selected for your daily review session.
            </p>
          </div>

          <button onClick={onStart} className={startStateStyles.startButton}>
            Start Daily Review
          </button>
        </div>
      </div>
    </div>
  )
}
