import { User } from 'lucide-react'
import { userProfileFooterStyles } from './styles'

interface UserProfileFooterProps {
  email: string | undefined
  onLogout: () => void
}

export default function UserProfileFooter({ email, onLogout }: UserProfileFooterProps) {
  return (
    <div className={userProfileFooterStyles.wrap}>
      <div className={userProfileFooterStyles.row}>
        <div className={userProfileFooterStyles.avatar}>
          <User className={userProfileFooterStyles.avatarIcon} />
        </div>
        <div className={userProfileFooterStyles.textWrap}>
          <span className={userProfileFooterStyles.email}>{email}</span>
          <span className={userProfileFooterStyles.subtitle}>User Session</span>
        </div>
      </div>
      <button
        onClick={onLogout}
        className={userProfileFooterStyles.signOutButton}
      >
        Sign Out
      </button>
    </div>
  )
}
