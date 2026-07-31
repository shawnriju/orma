import { BookOpen } from 'lucide-react'
import { Flashcard } from '../../../../lib/api'
import { dashboardViewStyles } from './styles'
import StudyAllCard from './StudyAllCard'
import NoteGroup from './NoteGroup'

interface GroupedNote {
  noteId: string
  title: string
  cards: Flashcard[]
}

interface DashboardViewProps {
  allCards: Flashcard[]
  groupedNotes: GroupedNote[]
  expandedNotes: Record<string, boolean>
  expandedCards: Record<string, boolean>
  onToggleNote: (noteId: string) => void
  onToggleCard: (cardId: string, e: React.MouseEvent) => void
  onStartAll: () => void
  onStartNote: (noteId: string) => void
  onEditCard: (card: Flashcard) => void
}

export default function DashboardView({
  allCards,
  groupedNotes,
  expandedNotes,
  expandedCards,
  onToggleNote,
  onToggleCard,
  onStartAll,
  onStartNote,
  onEditCard,
}: DashboardViewProps) {
  return (
    <div className={dashboardViewStyles.wrapper}>
      <header className={dashboardViewStyles.header}>
        <h1 className={dashboardViewStyles.title}>Study</h1>
        <p className={dashboardViewStyles.subtitle}>Browse all your flashcards and practice freely without affecting spaced repetition.</p>
      </header>

      <div className={dashboardViewStyles.contentArea}>
        <div className={dashboardViewStyles.contentInner}>
          {allCards.length === 0 ? (
            <div className={dashboardViewStyles.emptyCard}>
              <div className={dashboardViewStyles.emptyIconBadge}>
                <BookOpen className={dashboardViewStyles.emptyIcon} />
              </div>

              <div>
                <h2 className={dashboardViewStyles.emptyHeading}>No Cards Yet</h2>
                <p className={dashboardViewStyles.emptyBodyText}>
                  Create new notes and use "Magic Study" to automatically generate flashcards to see them here.
                </p>
              </div>
            </div>
          ) : (
            <div className={dashboardViewStyles.listWrap}>
              <StudyAllCard totalCount={allCards.length} onStart={onStartAll} />

              <div className={dashboardViewStyles.noteGroupsWrap}>
                {groupedNotes.map((note) => (
                  <NoteGroup
                    key={note.noteId}
                    noteId={note.noteId}
                    title={note.title}
                    cards={note.cards}
                    isExpanded={!!expandedNotes[note.noteId]}
                    onToggleExpand={() => onToggleNote(note.noteId)}
                    onStartNote={() => onStartNote(note.noteId)}
                    expandedCardIds={expandedCards}
                    onToggleCard={onToggleCard}
                    onEditCard={onEditCard}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
