import { Menu, X } from 'lucide-react'
import { mobileMenuTriggerStyles } from './styles'

interface MobileMenuTriggerProps {
  sidebarOpen: boolean
  onToggle: () => void
}

export default function MobileMenuTrigger({ sidebarOpen, onToggle }: MobileMenuTriggerProps) {
  return (
    <button
      onClick={onToggle}
      className={mobileMenuTriggerStyles.button}
    >
      {sidebarOpen ? <X className={mobileMenuTriggerStyles.icon} /> : <Menu className={mobileMenuTriggerStyles.icon} />}
    </button>
  )
}
