// --- EditFlashcardModal ---

export const editModalShellStyles = {
  backdrop: 'fixed inset-0 z-[100] flex items-center justify-center bg-[#fff8f5]/80 backdrop-blur-sm p-4',
  panel: 'w-full max-w-2xl bg-white border border-[#dac1b9]/40 shadow-xl rounded-3xl flex flex-col overflow-hidden',
} as const

export const editHeaderStyles = {
  bar: 'flex items-center justify-between px-6 py-4 border-b border-[#dac1b9]/30 bg-[#fff8f5]',
  title: 'text-sm font-bold text-[#54433d]',
  closeButton: 'p-1.5 hover:bg-[#ffdad6]/20 text-[#87736c] hover:text-[#ba1a1a] rounded-lg transition-colors',
  closeIcon: 'w-5 h-5',
} as const

export const editFieldsStyles = {
  wrap: 'p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]',
  errorBanner: 'bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold px-4 py-3 rounded-xl',
  fieldWrap: 'flex flex-col gap-2',
  fieldLabel: 'text-xs font-bold uppercase tracking-wider text-[#87736c]',
  questionTextarea: 'w-full min-h-[100px] resize-none border border-[#dac1b9]/40 rounded-xl p-4 text-sm font-semibold text-[#1e1b18] outline-none focus:border-[#d67d5c] focus:ring-1 focus:ring-[#d67d5c]',
  answerTextarea: 'w-full min-h-[150px] resize-none border border-[#dac1b9]/40 rounded-xl p-4 text-sm text-[#54433d] outline-none focus:border-[#d67d5c] focus:ring-1 focus:ring-[#d67d5c]',
} as const

export const editFooterStyles = {
  bar: 'px-6 py-4 border-t border-[#dac1b9]/30 bg-[#fff8f5] flex justify-between gap-3',
  deleteButton: 'px-5 py-2.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-xl transition-all flex items-center gap-2',
  deleteIcon: 'w-4 h-4',
  rightGroup: 'flex gap-3',
  cancelButton: 'px-5 py-2.5 text-xs font-semibold text-[#87736c] hover:bg-[#f5ece7] rounded-xl transition-all',
  saveButton: 'px-5 py-2.5 bg-[#d67d5c] hover:bg-[#94492c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
  saveIcon: 'w-4 h-4',
} as const

// --- FlashcardPanel ---

export const triggerButtonStyles = {
  button: 'group fixed bottom-8 right-8 z-30 flex items-center gap-3 rounded-2xl border border-outline-variant/45 bg-surface/95 px-3.5 py-3 text-left shadow-lg shadow-primary/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-xl shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary-container',
  iconBadge: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-white shadow-sm transition-transform group-hover:scale-105',
  icon: 'h-5 w-5',
  label: 'max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.22em] text-primary opacity-0 transition-all duration-300 group-hover:max-w-[15rem] group-hover:opacity-100 pr-1',
} as const

export const panelShellStyles = {
  overlayWrap: 'fixed inset-0 z-50 pointer-events-none',
  positionedPanel: 'pointer-events-auto absolute flex max-h-[min(90vh,48rem)] w-[min(92vw,52rem)] max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-outline-variant/40 bg-surface/88 shadow-2xl shadow-primary/20 backdrop-blur-md',
} as const

export const panelHeaderStyles = {
  barBase: 'flex items-start justify-between border-b border-outline-variant/30 bg-gradient-to-r from-surface-container-low via-surface to-white px-6 py-5 shadow-inner',
  barDragging: 'select-none',
  dragZone: 'cursor-move pr-4',
  titleRow: 'flex items-center gap-2 text-primary',
  iconBadge: 'flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container text-primary shadow-sm ring-1 ring-outline-variant',
  icon: 'h-4 w-4',
  title: 'text-base font-semibold',
  subtitle: 'mt-1 text-xs text-outline',
  closeButton: 'rounded-xl p-2 text-outline transition-colors hover:bg-surface-container hover:text-on-surface-variant',
  closeIcon: 'h-5 w-5',
} as const

export const panelBodyStyles = {
  wrap: 'flex-1 overflow-y-auto px-6 py-5',
  unsavedBanner: 'mb-4 rounded-2xl border border-error-container bg-error-container px-4 py-3 text-xs font-medium text-error',
} as const

export const chooseModeStyles = {
  grid: 'grid gap-4 md:grid-cols-2',
  customCard: 'flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-outline-variant/50 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-container',
  customIconBadge: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-primary',
  aiCard: 'flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-outline-variant/50 bg-surface-container-low p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-container',
  aiIconBadge: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-white',
  icon: 'h-6 w-6',
  textWrap: 'space-y-2',
  cardTitle: 'text-sm font-semibold text-on-surface',
  cardBody: 'text-sm leading-relaxed text-outline',
  cardLabel: 'text-xs font-semibold uppercase tracking-wider text-primary',
} as const

export const aiModeStyles = {
  wrap: 'flex flex-col gap-4',
  errorBanner: 'flex items-start gap-2 rounded-2xl border border-outline-variant bg-error-container p-3 text-xs font-medium text-error',
  errorIcon: 'h-4 w-4 shrink-0',
  loadingWrap: 'flex min-h-64 flex-col items-center justify-center gap-3 text-center',
  loadingIcon: 'h-8 w-8 animate-spin text-primary',
  loadingText: 'text-sm font-medium text-outline',
  promptWrap: 'flex min-h-64 flex-col items-center justify-center gap-4 text-center',
  promptIconBadge: 'flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant bg-white text-primary shadow-sm',
  promptIcon: 'h-7 w-7',
  promptTextWrap: 'max-w-md space-y-2',
  promptHeading: 'text-sm font-semibold text-on-surface',
  promptBody: 'text-sm leading-relaxed text-outline',
  wordCountWarning: 'text-xs font-medium text-error',
  actionsRow: 'flex flex-wrap items-center justify-center gap-3',
  generateButton: 'inline-flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
  generateIcon: 'h-4 w-4',
  switchButton: 'rounded-2xl border border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container',
} as const

export const customModeStyles = {
  wrap: 'flex flex-col gap-4',
  successBanner: 'flex items-start gap-2 rounded-2xl border border-secondary-fixed-dim bg-secondary-fixed p-3 text-xs font-medium text-on-secondary-fixed',
  successIcon: 'h-4 w-4 shrink-0 text-secondary',
  errorBanner: 'flex items-start gap-2 rounded-2xl border border-outline-variant bg-error-container p-3 text-xs font-medium text-error',
  errorIcon: 'h-4 w-4 shrink-0',
  toolbarRow: 'flex items-center justify-between',
  toolbarLabel: 'text-xs font-semibold uppercase tracking-wider text-outline',
  toolbarSubtext: 'mt-1 text-sm text-outline',
  toolbarActions: 'flex items-center gap-2',
  addButton: 'inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-white px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container',
  addIcon: 'h-4 w-4',
  bulkRow: 'flex items-center justify-between rounded-xl bg-white/50 px-4 py-2 border border-outline-variant/30',
  selectAllButton: 'flex items-center gap-2 text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary',
  selectAllIconChecked: 'h-4 w-4 text-primary-container',
  selectAllIconUnchecked: 'h-4 w-4 text-outline',
  deleteSelectedButton: 'flex items-center gap-1.5 text-xs font-semibold text-error transition-colors hover:text-on-error-container',
  deleteSelectedIcon: 'h-3.5 w-3.5',
  list: 'flex flex-col gap-4',
} as const

export const draftCardItemStyles = {
  cardBase: 'group relative flex flex-col gap-3 rounded-[1.5rem] border',
  cardSelected: 'border-[#d67d5c] bg-surface',
  cardUnselected: 'border-outline-variant/50 bg-white',
  cardSuffix: 'p-4 shadow-sm transition-all',
  innerRow: 'flex items-start gap-3',
  selectButton: 'mt-1 shrink-0 text-outline transition-colors hover:text-primary-container',
  selectIconChecked: 'h-4 w-4 text-primary-container',
  selectIconUnchecked: 'h-4 w-4',
  contentWrap: 'flex-1 min-w-0',
  collapsedButton: 'w-full text-left',
  questionPreview: 'truncate text-sm font-semibold text-on-surface',
  emptyQuestionText: 'italic text-outline',
  expandedWrap: 'flex flex-col gap-3 w-full',
  fieldWrap: 'flex flex-col gap-1',
  fieldLabel: 'text-[10px] font-semibold uppercase text-outline',
  questionTextarea: 'min-h-20 w-full resize-none rounded-xl border border-outline-variant/30 bg-white p-2 text-xs font-semibold text-on-surface outline-none focus:border-[#d67d5c]',
  answerTextarea: 'min-h-20 w-full resize-none rounded-xl border border-outline-variant/30 bg-white p-2 text-xs font-medium text-on-surface-variant outline-none focus:border-[#d67d5c]',
  actionsWrap: 'flex items-center gap-1 shrink-0',
  expandButton: 'rounded-lg p-1.5 text-outline transition-all hover:bg-surface-container hover:text-on-surface-variant',
  expandIcon: 'h-4 w-4',
  deleteButton: 'rounded-lg p-1.5 text-outline transition-all hover:bg-error-container/50 hover:text-error',
  deleteIcon: 'h-4 w-4',
} as const

export const panelFooterStyles = {
  bar: 'border-t border-outline-variant/30 bg-white/70 px-6 py-4 backdrop-blur',
  row: 'flex items-center justify-between gap-4',
  hintText: 'min-w-0 text-xs text-outline',
  actionsWrap: 'flex shrink-0 items-center gap-2 whitespace-nowrap',
  aiSwitchButton: 'inline-flex items-center justify-center rounded-2xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container',
  saveButton: 'inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
  saveIcon: 'h-4 w-4',
} as const
