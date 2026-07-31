import { ChevronRight } from 'lucide-react'
import { Notebook } from '../../../lib/api'
import { notebooksListStyles } from './styles'

interface NotebooksListProps {
  notebooks: Notebook[]
  isLoading: boolean
  onSelectNotebook: (notebookId: string) => void
}

export default function NotebooksList({ notebooks, isLoading, onSelectNotebook }: NotebooksListProps) {
  return (
    <div className={notebooksListStyles.wrap}>
      <div className={notebooksListStyles.heading}>Notebooks</div>
      {isLoading ? (
        <div className={notebooksListStyles.loadingText}>Loading notebooks...</div>
      ) : (
        <div className={notebooksListStyles.list}>
          {notebooks.map((nb: Notebook) => (
            <button
              key={nb.id}
              className={notebooksListStyles.item}
              onClick={() => onSelectNotebook(nb.id)}
            >
              <div className={notebooksListStyles.itemLeft}>
                <span>{nb.emoji || '📁'}</span>
                <span className={notebooksListStyles.itemLabel}>{nb.title}</span>
              </div>
              <ChevronRight className={notebooksListStyles.chevron} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
