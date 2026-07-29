export const loadingStyles = {
  container: 'min-h-[50vh] flex items-center justify-center text-sm text-outline',
  icon: 'w-5 h-5',
  text: 'text-sm leading-relaxed text-outline',
} as const

export const pageShellStyles = {
  wrapper: 'flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8',
  header: 'mb-8',
  title: 'text-3xl font-bold font-headline-md text-primary',
  subtitle: 'text-sm leading-relaxed text-outline',
  centerPanel: 'flex-1 flex items-center justify-center p-8',
  card: 'w-full max-w-3xl bg-surface border border-outline-variant/40 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center gap-6',
} as const

export const startStateStyles = {
  iconBadge: 'w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4',
  icon: 'w-5 h-5',
  heading: 'text-lg font-semibold text-on-surface',
  bodyText: 'text-sm leading-relaxed text-outline',
  startButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
} as const

export const emptyStateStyles = {
  iconBadge: 'w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/20 flex items-center justify-center text-secondary mx-auto mb-4',
  icon: 'w-6 h-6',
  heading: 'text-lg font-semibold text-on-surface',
  bodyText: 'text-sm leading-relaxed text-outline',
  buttonGroup: 'flex flex-col gap-3 w-full mt-4 max-w-sm mx-auto',
  overtimeButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer',
  freeStudyButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
} as const

export const overtimeModalStyles = {
  backdrop: 'fixed inset-0 z-50 bg-on-background/20 backdrop-blur-sm flex items-center justify-center p-4',
  panel: 'w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl flex flex-col gap-2 text-center',
  heading: 'text-xl font-semibold text-on-surface',
  bodyText: 'text-sm text-outline leading-relaxed mb-6',
  buttonRow: 'grid grid-cols-2 gap-3 mt-2',
  cancelButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer',
  confirmButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
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

export const completeStateStyles = {
  wrapper: 'flex-1 flex flex-col items-center justify-center bg-white overflow-y-auto p-4 md:p-8',
  card: 'w-full max-w-md bg-surface border border-outline-variant/40 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col items-center gap-6',
  streakBadge: 'inline-flex items-center py-1.5 px-4 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-sm font-bold',
  iconBadge: 'w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/20 flex items-center justify-center text-secondary mx-auto mb-4',
  icon: 'w-6 h-6',
  heading: 'text-3xl font-bold font-headline-md text-primary',
  bodyText: 'text-sm leading-relaxed text-outline',
  totalBadge: 'inline-flex items-center gap-1.5 py-1 px-3 bg-surface border border-outline-variant/40 rounded-full text-xs font-semibold text-primary mt-2',
  statsGrid: 'w-full grid grid-cols-3 gap-3',
  statCard: 'bg-white border border-outline-variant/20 rounded-2xl p-3 flex flex-col items-center gap-1',
  statValueHard: 'text-lg font-bold text-error',
  statValueOk: 'text-lg font-bold text-[#f59e0b]',
  statValueEasy: 'text-lg font-bold text-secondary',
  statLabel: 'text-[10px] text-outline font-medium uppercase tracking-wider mt-1',
  accuracyRow: 'w-full text-center mt-2',
  accuracyText: 'text-sm font-semibold text-outline',
  actionsGroup: 'flex flex-col gap-3 w-full mt-4',
  tryAnotherButton: 'w-full inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
  secondaryButtonRow: 'flex gap-3 w-full',
  secondaryButton: 'flex-1 inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer',
} as const

export const reviewingStateStyles = {
  wrapper: 'flex-1 flex flex-col bg-white overflow-y-auto p-4 md:p-8',
  header: 'mb-4 flex items-center gap-4 shrink-0',
  backButton: 'p-2 rounded-xl border border-outline-variant/40 text-outline hover:bg-surface-container-low transition-colors',
  backIcon: 'w-5 h-5',
  title: 'text-3xl font-bold font-headline-md text-primary',
  contentArea: 'flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center py-2',
  contentInner: 'w-full max-w-2xl flex flex-col items-center gap-6',
  progressWrap: 'w-full max-w-xl',
  progressLabelRow: 'flex justify-between text-xs font-semibold text-outline mb-2 uppercase tracking-wider',
  progressTrack: 'w-full h-2 bg-surface-container rounded-full overflow-hidden',
  progressFill: 'h-full bg-primary-container transition-all duration-300',
  cardRow: 'w-full flex items-center justify-center gap-4',
  actionsWrap: 'w-full max-w-xl flex flex-col items-center gap-3',
  revealButton: 'w-full py-4 bg-primary-container hover:bg-primary text-white font-semibold rounded-2xl transition-all shadow-sm text-sm',
  rateBlock: 'w-full flex flex-col gap-4',
  ratePromptText: 'text-center font-semibold text-outline text-sm',
  rateGrid: 'w-full grid grid-cols-3 gap-4',
  rateButtonHard: 'flex flex-col items-center py-3 bg-error-container hover:bg-[#ffb4ab] text-error rounded-2xl transition-all shadow-sm',
  rateButtonOk: 'flex flex-col items-center py-3 bg-[#fff3e0] hover:bg-[#ffe0b2] text-[#e65100] rounded-2xl transition-all shadow-sm',
  rateButtonEasy: 'flex flex-col items-center py-3 bg-secondary-fixed hover:bg-[#b7ccb6] text-on-secondary-fixed rounded-2xl transition-all shadow-sm',
  rateButtonLabel: 'font-bold text-sm',
  rateButtonInterval: 'text-xs opacity-80 mt-0.5',
} as const

export const flipCardStyles = {
  outer: 'flex-1 max-w-xl aspect-[4/3] max-h-[380px] cursor-pointer',
  inner: 'relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]',
  faceFront: 'absolute inset-0 w-full h-full bg-white border border-outline-variant/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-sm',
  faceBack: 'absolute inset-0 w-full h-full bg-surface border-2 border-primary-container/40 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-sm backface-hidden [transform:rotateY(180deg)]',
  faceHeaderRow: 'flex justify-between items-center gap-4',
  noteChipFront: 'flex items-center gap-1.5 px-3 py-1 bg-surface border border-outline-variant/40 rounded-full font-semibold text-xs text-primary max-w-[220px] truncate shadow-sm hover:bg-surface-container-low cursor-pointer transition-colors',
  noteChipBack: 'flex items-center gap-1.5 px-3 py-1 bg-white border border-outline-variant/40 rounded-full font-semibold text-xs text-primary max-w-[220px] truncate shadow-sm hover:bg-surface-container-low cursor-pointer transition-colors',
  noteChipIcon: 'w-3 h-3 text-primary-container shrink-0',
  editButtonRow: 'flex items-center gap-2',
  editButtonFront: 'p-1.5 rounded-full hover:bg-surface border border-transparent hover:border-outline-variant/40 text-outline hover:text-primary-container transition-all',
  editButtonBack: 'p-1.5 rounded-full hover:bg-white border border-transparent hover:border-outline-variant/40 text-outline hover:text-primary-container transition-all',
  editIcon: 'w-4 h-4',
  questionWrap: 'flex-1 flex items-center justify-center py-4',
  questionText: 'text-lg md:text-xl font-semibold text-on-surface text-center leading-relaxed',
  answerWrap: 'flex-1 flex items-center justify-center py-4 overflow-y-auto w-full',
  answerText: 'text-base md:text-lg text-on-surface leading-relaxed whitespace-pre-wrap text-center w-full',
  hintRow: 'text-center text-xs text-outline font-medium flex items-center justify-center gap-1.5 opacity-60',
  hintIcon: 'w-3.5 h-3.5',
} as const
