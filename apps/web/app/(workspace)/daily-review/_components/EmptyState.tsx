'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { pageShellStyles, emptyStateStyles } from './styles'
import OvertimeWarningModal from './OvertimeWarningModal'

interface EmptyStateProps {
  onConfirmOvertime: () => void
}

export default function EmptyState({ onConfirmOvertime }: EmptyStateProps) {
  const router = useRouter()
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)

  return (
    <div className={pageShellStyles.wrapper}>
      <header className={pageShellStyles.header}>
        <h1 className={pageShellStyles.title}>Daily Review</h1>
        <p className={pageShellStyles.subtitle}>Strengthen your memory with spaced repetition</p>
      </header>
      <div className={pageShellStyles.centerPanel}>
        <div className={pageShellStyles.card}>
          <div className={emptyStateStyles.iconBadge}>
            <CheckCircle2 className={emptyStateStyles.icon} />
          </div>

          <div>
            <h2 className={emptyStateStyles.heading}>You're all caught up ✓</h2>
            <p className={emptyStateStyles.bodyText}>
              You have 0 cards due for today.
            </p>
          </div>

          <div className={emptyStateStyles.buttonGroup}>
            <button
              onClick={() => setShowOvertimeWarning(true)}
              className={emptyStateStyles.overtimeButton}
            >
              Study More (Overtime)
            </button>
            <button
              onClick={() => router.push('/study')}
              className={emptyStateStyles.freeStudyButton}
            >
              Free Study →
            </button>
          </div>
        </div>
      </div>

      {showOvertimeWarning && (
        <OvertimeWarningModal
          onCancel={() => setShowOvertimeWarning(false)}
          onConfirm={() => {
            setShowOvertimeWarning(false)
            onConfirmOvertime()
          }}
        />
      )}
    </div>
  )
}
