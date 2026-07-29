import { AlertCircle } from 'lucide-react'
import { errorStateStyles } from './styles'

export default function ErrorState() {
  return (
    <div className={errorStateStyles.container}>
      <div className={errorStateStyles.wrap}>
        <div className={errorStateStyles.iconBadge}>
          <AlertCircle className={errorStateStyles.icon} />
        </div>
        <div>
          <h2 className={errorStateStyles.heading}>Could not load review cards</h2>
          <p className={errorStateStyles.bodyText}>
            Make sure the backend is running and the study API is available.
          </p>
        </div>
      </div>
    </div>
  )
}
