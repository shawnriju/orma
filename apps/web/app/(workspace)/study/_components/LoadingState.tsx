import { Loader2 } from 'lucide-react'
import { loadingStateStyles } from './styles'

export default function LoadingState() {
  return (
    <div className={loadingStateStyles.container}>
      <Loader2 className={loadingStateStyles.icon} />
      <div className={loadingStateStyles.text}>Loading your cards...</div>
    </div>
  )
}
