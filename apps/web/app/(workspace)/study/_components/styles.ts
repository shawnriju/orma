export const suspenseFallbackStyles = {
  container: 'flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0 justify-center items-center text-sm text-outline',
} as const

export const loadingStateStyles = {
  container: 'min-h-[50vh] flex items-center justify-center text-sm text-outline',
  icon: 'w-5 h-5',
  text: 'text-sm leading-relaxed text-outline',
} as const

export const errorStateStyles = {
  container: 'min-h-[50vh] flex items-center justify-center text-sm text-outline',
  wrap: 'max-w-md mx-auto py-20 flex flex-col items-center gap-4 text-center',
  iconBadge: 'w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4',
  icon: 'w-5 h-5',
  heading: 'text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed',
  bodyText: 'text-sm leading-relaxed text-outline',
} as const

export const exitModalStyles = {
  backdrop: 'fixed inset-0 z-50 bg-on-background/20 backdrop-blur-sm flex items-center justify-center p-4',
  panel: 'w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl flex flex-col gap-2 text-center',
  heading: 'text-xl font-semibold text-on-surface',
  bodyText: 'text-sm text-outline leading-relaxed mb-6',
  buttonRow: 'grid grid-cols-2 gap-3 mt-2',
  stayButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer',
  exitButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-error text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-error/90 transition-all active:scale-95 cursor-pointer',
} as const

export const sessionViewStyles = {
  wrapper: 'flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8',
  header: 'mb-4 flex items-center gap-4 shrink-0',
  backButton: 'p-2 rounded-xl border border-outline-variant/40 text-outline hover:bg-surface-container-low transition-colors',
  backIcon: 'w-5 h-5',
  title: 'text-3xl font-bold font-headline-md text-primary',
  subtitle: 'text-sm leading-relaxed text-outline',
  contentArea: 'flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2',
  contentInner: 'w-full max-w-2xl flex flex-col items-center gap-6',
  progressWrap: 'w-full max-w-2xl mb-6',
  progressLabelRow: 'flex items-center justify-between text-xs font-semibold text-outline mb-2',
  progressTrack: 'w-full h-1.5 bg-surface-container rounded-full overflow-hidden',
  progressFill: 'h-full bg-primary-container rounded-full transition-all duration-300',
  cardRow: 'w-full flex items-center justify-center gap-4',
  navButtonPrev: 'p-3 rounded-full bg-white hover:bg-surface-container-low border border-outline-variant/40 text-outline hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm shrink-0',
  navButtonNext: 'p-3 rounded-full bg-white hover:bg-surface border border-outline-variant/40 text-outline hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm shrink-0',
  navIcon: 'w-5 h-5',
  actionsRow: 'flex items-center justify-center mt-4 w-full',
  showAnswerButton: 'inline-flex items-center justify-center px-8 py-3 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
  nextButtonWrap: 'inline-flex',
  nextButton: 'inline-flex items-center justify-center px-8 py-3 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer gap-2',
  nextIcon: 'w-4 h-4',
} as const

export const flipCardStyles = {
  outer: 'w-full max-w-2xl aspect-[4/3] max-h-[380px] cursor-pointer [perspective:1000px]',
  inner: 'relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]',
  faceFront: 'absolute inset-0 w-full h-full bg-white border border-outline-variant/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm backface-hidden',
  faceBack: 'absolute inset-0 w-full h-full bg-surface border-2 border-outline-variant/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm backface-hidden [transform:rotateY(180deg)]',
  faceHeaderRow: 'flex justify-between items-center gap-4',
  noteChip: 'inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary hover:bg-surface-container-low cursor-pointer transition-colors',
  noteChipIcon: 'w-5 h-5',
  editButtonWrap: 'flex items-center gap-2',
  editButton: 'p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:bg-surface-container hover:text-primary transition-colors bg-white/50',
  editIcon: 'w-5 h-5',
  questionWrap: 'flex-1 flex items-center justify-center py-4',
  questionText: 'text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed',
  answerWrap: 'flex-1 flex items-center justify-center py-4 overflow-y-auto w-full',
  answerText: 'text-base md:text-lg text-on-surface leading-relaxed whitespace-pre-wrap text-center w-full',
  hintRow: 'flex items-center justify-center gap-2 text-sm text-outline font-medium',
  hintIcon: 'w-4 h-4',
} as const

export const dashboardViewStyles = {
  wrapper: 'flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8',
  header: 'mb-8',
  title: 'text-3xl font-bold font-headline-md text-primary',
  subtitle: 'text-sm leading-relaxed text-outline',
  contentArea: 'flex-1 min-h-0 overflow-y-auto pr-1',
  contentInner: 'max-w-3xl mx-auto',
  emptyCard: 'w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-3xl p-10 flex flex-col gap-6 text-center shadow-sm',
  emptyIconBadge: 'w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4',
  emptyIcon: 'w-5 h-5',
  emptyHeading: 'text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed',
  emptyBodyText: 'text-sm leading-relaxed text-outline',
  listWrap: 'flex flex-col gap-8',
  noteGroupsWrap: 'flex flex-col gap-6',
} as const

export const studyAllCardStyles = {
  button: 'w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:border-primary-container hover:shadow-md transition-all group text-left',
  leftGroup: 'flex items-center gap-5',
  iconBadge: 'w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4',
  icon: 'w-5 h-5',
  heading: 'text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed',
  bodyText: 'text-sm leading-relaxed text-outline',
  countBadge: 'inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary',
} as const

export const noteGroupStyles = {
  card: 'w-full max-w-2xl mx-auto bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm flex flex-col',
  headerRow: 'w-full bg-surface p-4 md:p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer',
  titleGroup: 'flex items-center gap-4',
  title: 'font-semibold text-base text-on-surface',
  countText: 'text-xs text-outline',
  actionsGroup: 'flex items-center gap-4',
  studyButton: 'inline-flex items-center justify-center px-4 py-2 bg-primary-container text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
  chevron: 'w-5 h-5 text-outline transition-transform',
  list: 'flex flex-col divide-y divide-[#dac1b9]/20',
} as const

export const flashcardRowStyles = {
  row: 'p-4 hover:bg-surface transition-colors cursor-pointer group',
  headerRow: 'flex items-start justify-between gap-4',
  questionWrap: 'flex-1',
  questionText: 'text-sm font-medium text-on-surface line-clamp-2 leading-relaxed',
  chevron: 'w-5 h-5 text-outline shrink-0 transition-transform',
  answerWrap: 'mt-4 pt-4 border-t border-outline-variant/20 animate-in slide-in-from-top-2 fade-in duration-200',
  answerText: 'text-sm text-on-surface-variant leading-relaxed',
  editRow: 'flex justify-end mt-3',
  editButton: 'flex items-center gap-1.5 text-xs font-semibold text-outline hover:text-primary px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-outline-variant/30 transition-all',
  editIcon: 'w-3.5 h-3.5',
} as const
