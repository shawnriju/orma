import { Menu } from 'lucide-react'
import { sidebarHeaderStyles } from './styles'

interface SidebarHeaderProps {
  onToggleSidebar: () => void
}

export default function SidebarHeader({ onToggleSidebar }: SidebarHeaderProps) {
  return (
    <div className={sidebarHeaderStyles.row}>
      <div className={sidebarHeaderStyles.logoGroup}>
        <div className={sidebarHeaderStyles.logoBadge}>
          O
        </div>
        <div>
          <h1 className={sidebarHeaderStyles.title}>Orma</h1>
          <span className={sidebarHeaderStyles.subtitle}>Stay curious</span>
        </div>
      </div>
      <button
        onClick={onToggleSidebar}
        className={sidebarHeaderStyles.collapseButton}
      >
        <Menu className={sidebarHeaderStyles.collapseIcon} />
      </button>
    </div>
  )
}
