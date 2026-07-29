import { BookOpen } from 'lucide-react'
import { studyPreferencesStyles } from './styles'

interface StudyPreferencesCardProps {
  dailyLimit: number | string
  onLimitChange: (value: number | string) => void
  onLimitBlur: () => void
  emailEnabled: boolean
  onEmailToggle: (checked: boolean) => void
}

export default function StudyPreferencesCard({
  dailyLimit,
  onLimitChange,
  onLimitBlur,
  emailEnabled,
  onEmailToggle,
}: StudyPreferencesCardProps) {
  return (
    <div className={studyPreferencesStyles.card}>
      <div className={studyPreferencesStyles.headerRow}>
        <div className={studyPreferencesStyles.iconBadge}>
          <BookOpen className={studyPreferencesStyles.icon} />
        </div>
        <h2 className={studyPreferencesStyles.heading}>Study Preferences</h2>
      </div>

      <div className={studyPreferencesStyles.body}>
        <div className={studyPreferencesStyles.row}>
          <div className={studyPreferencesStyles.labelWrap}>
            <h3 className={studyPreferencesStyles.labelHeading}>Daily review cards limit</h3>
            <p className={studyPreferencesStyles.labelBody}>
              How many cards appear in your daily review queue per session. (Min: 3, Max: 50)
            </p>
          </div>
          <input
            type="number"
            min={3}
            max={50}
            value={dailyLimit}
            onChange={(e) => {
              const val = e.target.value
              if (val === '') {
                onLimitChange('')
              } else {
                let parsed = parseInt(val)
                if (parsed > 50) parsed = 50
                onLimitChange(parsed)
              }
            }}
            onBlur={onLimitBlur}
            className={studyPreferencesStyles.numberInput}
          />
        </div>

        <div className={studyPreferencesStyles.divider} />

        <div className={studyPreferencesStyles.row}>
          <div className={studyPreferencesStyles.labelWrap}>
            <h3 className={studyPreferencesStyles.labelHeading}>Email notifications</h3>
            <p className={studyPreferencesStyles.labelBody}>
              Get a daily email reminder when you have cards due for review.
            </p>
          </div>
          <label className={studyPreferencesStyles.toggleLabel}>
            <input
              type="checkbox"
              className={studyPreferencesStyles.toggleInput}
              checked={emailEnabled}
              onChange={(e) => onEmailToggle(e.target.checked)}
            />
            <div className={studyPreferencesStyles.toggleTrack}></div>
          </label>
        </div>
      </div>
    </div>
  )
}
