import React from 'react'
import { Menu } from 'lucide-react'
import { mainContentStyles } from './styles'

interface MainContentProps {
  sidebarOpen: boolean
  isMounted: boolean
  onToggleSidebar: () => void
  children: React.ReactNode
}

export default function MainContent({ sidebarOpen, isMounted, onToggleSidebar, children }: MainContentProps) {
  return (
    <main className={`${mainContentStyles.mainBase} ${sidebarOpen ? mainContentStyles.mainOpen : mainContentStyles.mainClosed}`}>
      {/* Desktop floating toggle button when sidebar is collapsed */}
      {!sidebarOpen && isMounted && (
        <button
          onClick={onToggleSidebar}
          className={mainContentStyles.floatingToggleButton}
        >
          <Menu className={mainContentStyles.floatingToggleIcon} />
        </button>
      )}
      {children}
    </main>
  )
}
