import { Sparkles } from 'lucide-react'
import { studyAllCardStyles } from './styles'

interface StudyAllCardProps {
  totalCount: number
  onStart: () => void
}

export default function StudyAllCard({ totalCount, onStart }: StudyAllCardProps) {
  return (
    <button
      onClick={onStart}
      className={studyAllCardStyles.button}
    >
      <div className={studyAllCardStyles.leftGroup}>
        <div className={studyAllCardStyles.iconBadge}>
          <Sparkles className={studyAllCardStyles.icon} />
        </div>
        <div>
          <h3 className={studyAllCardStyles.heading}>Study All Cards</h3>
          <p className={studyAllCardStyles.bodyText}>Practice everything randomly</p>
        </div>
      </div>
      <div className={studyAllCardStyles.countBadge}>
        {totalCount} Cards
      </div>
    </button>
  )
}
