import { Loader2 } from 'lucide-react'
import { loadingStyles } from './styles'

export default function LoadingState() {
  return (
    <div className={loadingStyles.container}>
      <Loader2 className={loadingStyles.icon} />
      <div className={loadingStyles.text}>Loading your daily review...</div>
    </div>
  )
}
