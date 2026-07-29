import Link from 'next/link'
import { BookOpen, Clock, FolderClosed, Settings, FileText } from 'lucide-react'
import { navStyles } from './styles'

interface SidebarNavProps {
  pathname: string
}

const NAV_ITEMS = [
  { href: '/notes', icon: FolderClosed, label: 'My Notes' },
  { href: '/study', icon: FileText, label: 'Study' },
  { href: '/daily-review', icon: Clock, label: 'Daily Review' },
  { href: '/library', icon: BookOpen, label: 'Library' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function SidebarNav({ pathname }: SidebarNavProps) {
  return (
    <nav className={navStyles.nav}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${navStyles.linkBase} ${pathname.startsWith(href) ? navStyles.linkActive : navStyles.linkInactive}`}
        >
          <Icon className={navStyles.icon} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
