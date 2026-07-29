import { MoreVertical, Edit3, Trash2 } from 'lucide-react'
import { Note } from '../../../../lib/api'
import { noteCardStyles } from './styles'

interface NoteCardProps {
  note: Note
  preview: string
  isMenuOpen: boolean
  onOpenNote: () => void
  onToggleMenu: (e: React.MouseEvent) => void
  onRename: () => void
  onDelete: () => void
}

export default function NoteCard({ note, preview, isMenuOpen, onOpenNote, onToggleMenu, onRename, onDelete }: NoteCardProps) {
  return (
    <div onClick={onOpenNote} className={noteCardStyles.card}>
      <div>
        <div className={noteCardStyles.titleRow}>
          <h3 className={noteCardStyles.title}>
            {note.title || 'Untitled Note'}
          </h3>
          <div className={noteCardStyles.menuButtonWrap}>
            <button onClick={onToggleMenu} className={noteCardStyles.menuButton}>
              <MoreVertical className={noteCardStyles.menuIcon} />
            </button>
            {isMenuOpen && (
              <div className={noteCardStyles.dropdown}>
                <button
                  onClick={(e) => { e.stopPropagation(); onRename() }}
                  className={noteCardStyles.dropdownItem}
                >
                  <Edit3 className={noteCardStyles.dropdownIcon} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className={noteCardStyles.dropdownItemDanger}
                >
                  <Trash2 className={noteCardStyles.dropdownIcon} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className={noteCardStyles.preview}>
          {preview}
        </p>
      </div>
      <div className={noteCardStyles.footer}>
        <span>{note.word_count || 0} words</span>
        <span>{note.updated_at ? new Date(note.updated_at).toLocaleDateString() : ''}</span>
      </div>
    </div>
  )
}
