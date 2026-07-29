import Link from 'next/link'
import { ArrowLeft, Library, Trash2 } from 'lucide-react'
import { Notebook } from '../../../../../lib/api'
import { headerStyles } from './styles'

interface NoteWorkspaceHeaderProps {
  notebook: Notebook | undefined
  noteTitle: string
  isCardsPanelOpen: boolean
  onToggleCardsPanel: () => void
  cardsCount: number | undefined
  onDelete: () => void
}

export default function NoteWorkspaceHeader({
  notebook,
  noteTitle,
  isCardsPanelOpen,
  onToggleCardsPanel,
  cardsCount,
  onDelete,
}: NoteWorkspaceHeaderProps) {
  return (
    <header className={headerStyles.bar}>
      {/* Breadcrumb Path */}
      <div className={headerStyles.breadcrumbGroup}>
        <Link
          href="/notes"
          className={headerStyles.backLink}
        >
          <ArrowLeft className={headerStyles.backIcon} />
        </Link>
        <div className={headerStyles.breadcrumbText}>
          {notebook ? (
            <span className={headerStyles.breadcrumbNotebook}>
              <span>{notebook.emoji || '📁'}</span>
              <span>{notebook.title}</span>
              <span className={headerStyles.breadcrumbSeparator}>/</span>
              <span className={headerStyles.breadcrumbNote}>{noteTitle}</span>
            </span>
          ) : (
            <span>Workspace</span>
          )}
        </div>
      </div>

      {/* Note Actions */}
      <div className={headerStyles.actionsGroup}>
        <button
          onClick={onToggleCardsPanel}
          className={`${headerStyles.cardsToggleButton} ${isCardsPanelOpen ? headerStyles.cardsToggleActive : headerStyles.cardsToggleInactive}`}
        >
          <Library className={headerStyles.cardsToggleIcon} />
          <span>Cards</span>
          {cardsCount !== undefined && cardsCount > 0 && (
            <span className={isCardsPanelOpen ? headerStyles.cardsBadgeActive : headerStyles.cardsBadgeInactive}>
              {cardsCount}
            </span>
          )}
        </button>

        <div className={headerStyles.divider}></div>

        <button
          onClick={onDelete}
          className={headerStyles.deleteButton}
          title="Delete Note"
        >
          <Trash2 className={headerStyles.deleteIcon} />
        </button>
      </div>
    </header>
  )
}
