import { Plus } from 'lucide-react'
import { Notebook } from '../../../lib/api'
import { sidebarStyles } from './styles'
import SidebarHeader from './SidebarHeader'
import SidebarNav from './SidebarNav'
import NotebooksList from './NotebooksList'
import UserProfileFooter from './UserProfileFooter'

interface SidebarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  pathname: string
  onCreateNote: () => void
  notebooks: Notebook[]
  loadingNotebooks: boolean
  onSelectNotebook: (notebookId: string) => void
  userEmail: string | undefined
  onLogout: () => void
}

export default function Sidebar({
  sidebarOpen,
  onToggleSidebar,
  pathname,
  onCreateNote,
  notebooks,
  loadingNotebooks,
  onSelectNotebook,
  userEmail,
  onLogout,
}: SidebarProps) {
  return (
    <aside className={`${sidebarStyles.asideBase} ${sidebarOpen ? sidebarStyles.asideOpen : sidebarStyles.asideClosed}`}>
      <div className={sidebarStyles.innerWrap}>
        <SidebarHeader onToggleSidebar={onToggleSidebar} />

        <button
          onClick={onCreateNote}
          className={sidebarStyles.newNoteButton}
        >
          <Plus className={sidebarStyles.newNoteIcon} />
          <span>New Note</span>
        </button>

        <SidebarNav pathname={pathname} />

        <NotebooksList
          notebooks={notebooks}
          isLoading={loadingNotebooks}
          onSelectNotebook={onSelectNotebook}
        />
      </div>

      <UserProfileFooter email={userEmail} onLogout={onLogout} />
    </aside>
  )
}
