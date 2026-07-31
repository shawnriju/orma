export const settingsPageStyles = {
  wrapper: 'flex-1 overflow-y-auto p-8',
  header: 'mb-8',
  title: 'text-3xl font-bold font-headline-md text-primary',
  subtitle: 'text-sm leading-relaxed text-outline',
  contentWrap: 'max-w-2xl mx-auto flex flex-col gap-8 w-full',
} as const

export const saveRowStyles = {
  row: 'flex items-center justify-center gap-4 mt-4',
  saveButton: 'inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer',
  icon: 'w-5 h-5',
  savedIndicator: 'flex items-center gap-2 text-[#506351] font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300',
  savedIcon: 'w-5 h-5',
} as const

export const studyPreferencesStyles = {
  card: 'w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-sm',
  headerRow: 'flex items-center gap-4 mb-2',
  iconBadge: 'w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant',
  icon: 'w-5 h-5',
  heading: 'font-headline-md text-2xl font-bold text-primary',
  body: 'flex flex-col gap-6',
  row: 'flex flex-col md:flex-row md:items-center justify-between gap-4',
  labelWrap: 'text-left flex-1',
  labelHeading: 'text-lg font-semibold text-on-surface',
  labelBody: 'text-sm leading-relaxed text-outline mt-1',
  numberInput: 'w-20 bg-white border border-outline-variant/40 rounded-xl px-4 py-2 text-sm text-on-surface font-semibold text-center focus:border-primary-container focus:outline-none transition-colors shadow-sm',
  divider: 'w-full h-1.5 bg-surface-container rounded-full overflow-hidden',
  toggleLabel: 'relative inline-flex items-center cursor-pointer',
  toggleInput: 'sr-only peer',
  toggleTrack: "w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container",
} as const

export const googleDriveCardStyles = {
  card: 'w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm text-left',
  textWrap: 'flex-1',
  heading: 'text-lg font-semibold text-on-surface',
  bodyText: 'text-sm leading-relaxed text-outline mt-1',
  comingSoonButton: 'shrink-0 inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer shadow-sm',
} as const
