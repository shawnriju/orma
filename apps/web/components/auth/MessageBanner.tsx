import { messageBannerStyles } from './styles'

interface MessageBannerProps {
  variant: 'error' | 'success'
  message: string
}

export default function MessageBanner({ variant, message }: MessageBannerProps) {
  return (
    <div className={variant === 'error' ? messageBannerStyles.error : messageBannerStyles.success}>
      {message}
    </div>
  )
}
