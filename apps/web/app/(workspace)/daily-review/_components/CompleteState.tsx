'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { completeStateStyles } from './styles'

interface CompleteStateProps {
  sessionStats: { hard: number; ok: number; easy: number }
  streakCount: number
  totalCards: number
  onTryAnother: () => void
}

export default function CompleteState({ sessionStats, streakCount, totalCards, onTryAnother }: CompleteStateProps) {
  const router = useRouter()
  const total = sessionStats.hard + sessionStats.ok + sessionStats.easy
  const accuracy = total > 0 ? Math.round(((sessionStats.ok + sessionStats.easy) / total) * 100) : 0

  return (
    <div className={completeStateStyles.wrapper}>
      <div className={completeStateStyles.card}>
        {streakCount > 0 && (
          <div className={completeStateStyles.streakBadge}>
            🔥 {streakCount}-day streak
          </div>
        )}

        <div className={completeStateStyles.iconBadge}>
          <CheckCircle2 className={completeStateStyles.icon} />
        </div>

        <div>
          <h2 className={completeStateStyles.heading}>Great job!</h2>
          <p className={completeStateStyles.bodyText}>
            You finished your daily study session.
          </p>
          <div className={completeStateStyles.totalBadge}>
            {totalCards} total cards saved
          </div>
        </div>

        <div className={completeStateStyles.statsGrid}>
          <div className={completeStateStyles.statCard}>
            <div className={completeStateStyles.statValueHard}>{sessionStats.hard}</div>
            <div className={completeStateStyles.statLabel}>Hard</div>
          </div>
          <div className={completeStateStyles.statCard}>
            <div className={completeStateStyles.statValueOk}>{sessionStats.ok}</div>
            <div className={completeStateStyles.statLabel}>OK</div>
          </div>
          <div className={completeStateStyles.statCard}>
            <div className={completeStateStyles.statValueEasy}>{sessionStats.easy}</div>
            <div className={completeStateStyles.statLabel}>Easy</div>
          </div>
        </div>

        <div className={completeStateStyles.accuracyRow}>
          <span className={completeStateStyles.accuracyText}>Accuracy: {accuracy}%</span>
        </div>

        <div className={completeStateStyles.actionsGroup}>
          <button onClick={onTryAnother} className={completeStateStyles.tryAnotherButton}>
            Try another session
          </button>
          <div className={completeStateStyles.secondaryButtonRow}>
            <button
              onClick={() => router.push('/notes')}
              className={completeStateStyles.secondaryButton}
            >
              Back to notes
            </button>
            <button
              onClick={() => router.push('/study')}
              className={completeStateStyles.secondaryButton}
            >
              Free Study
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
