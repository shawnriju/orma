export const loadingStateStyles = {
  container: 'flex-1 flex items-center justify-center bg-white text-outline text-sm',
} as const

export const errorStateStyles = {
  container: 'flex-1 flex flex-col items-center justify-center bg-white text-center p-6 gap-4',
  heading: 'text-lg font-bold text-error',
  bodyText: 'text-sm text-outline max-w-sm leading-relaxed',
  backLink: 'inline-flex items-center justify-center py-2 px-4 bg-primary-container text-white text-xs font-semibold rounded-xl hover:bg-primary transition-colors',
} as const

export const workspaceWrapStyles = {
  wrapper: 'flex-1 flex flex-col h-full bg-white overflow-hidden',
  mainLayout: 'flex-1 min-h-0 flex overflow-hidden',
  editorArea: 'flex-1 min-h-0 overflow-y-auto relative',
  editorInner: 'flex-1 pb-24',
} as const

export const headerStyles = {
  bar: 'h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 bg-white shrink-0',
  breadcrumbGroup: 'flex items-center gap-3 min-w-0',
  backLink: 'inline-flex items-center justify-center p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-colors',
  backIcon: 'w-5 h-5',
  breadcrumbText: 'text-xs font-semibold uppercase tracking-wider text-outline min-w-0',
  breadcrumbNotebook: 'flex items-center gap-1.5 min-w-0',
  breadcrumbSeparator: 'opacity-50',
  breadcrumbNote: 'truncate max-w-[150px]',
  actionsGroup: 'flex items-center gap-2',
  cardsToggleButton: 'inline-flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all',
  cardsToggleActive: 'bg-primary-container text-white shadow-sm',
  cardsToggleInactive: 'text-outline hover:bg-surface-container hover:text-on-surface-variant',
  cardsToggleIcon: 'w-4 h-4',
  cardsBadgeActive: 'py-0.5 px-1.5 rounded-full bg-white text-primary-container text-[10px]',
  cardsBadgeInactive: 'py-0.5 px-1.5 rounded-full bg-primary-container text-white text-[10px]',
  divider: 'w-px h-4 bg-[#dac1b9]/50 mx-1',
  deleteButton: 'inline-flex items-center justify-center p-1.5 rounded-lg text-error hover:bg-error-container/50 hover:text-on-error-container transition-colors',
  deleteIcon: 'w-4 h-4',
} as const

export const panelStyles = {
  wrap: 'w-80 shrink-0 flex flex-col overflow-hidden bg-surface/50 border-l border-outline-variant/30',
  headerRow: 'flex items-center justify-between gap-3 py-4 px-5 border-b border-outline-variant/30 bg-white shrink-0',
  heading: 'flex items-center gap-2 text-sm font-bold text-on-surface-variant',
  headingIcon: 'w-4 h-4 text-[#d67d5c]',
  actionsGroup: 'flex items-center gap-2',
  studyLink: 'inline-flex items-center justify-center py-1 px-3 rounded-lg bg-primary-container text-white text-[10px] font-semibold hover:bg-primary transition-colors',
  closeButton: 'inline-flex items-center justify-center p-1 rounded-lg text-outline hover:bg-surface-container transition-colors',
  closeIcon: 'w-4 h-4',
  body: 'flex-1 min-h-0 overflow-y-auto py-4 px-5 pb-32',
  loadingText: 'flex-1 flex items-center justify-center bg-white text-outline text-sm',
  emptyWrap: 'text-center py-8',
  emptyIconBadge: 'w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-outline-variant/50 flex items-center justify-center text-outline-variant',
  emptyIcon: 'w-6 h-6',
  emptyText: 'text-sm text-outline max-w-sm leading-relaxed',
  list: 'flex flex-col gap-3',
} as const

export const flashcardItemStyles = {
  card: 'relative flex flex-col gap-3 p-4 bg-white border border-outline-variant/50 rounded-2xl shadow-sm group',
  editButton: 'absolute top-3 right-3 inline-flex items-center justify-center p-1.5 rounded-lg bg-white border border-outline-variant/30 text-outline opacity-0 transition-all hover:bg-surface hover:text-primary-container hover:border-primary-container/40 group-hover:opacity-100',
  editIcon: 'w-3.5 h-3.5',
  questionLabel: 'block mb-1 text-[10px] font-bold uppercase tracking-wider text-outline',
  questionText: 'pr-8 text-sm font-semibold text-on-surface leading-relaxed',
  divider: 'h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent',
  answerLabel: 'block mb-1 text-[10px] font-bold uppercase tracking-wider text-outline',
  answerText: 'text-sm text-on-surface-variant leading-relaxed',
} as const
