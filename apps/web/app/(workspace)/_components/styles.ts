export const shellStyles = {
  wrapper: 'flex h-screen bg-surface text-on-surface overflow-hidden font-body-md',
  authLoadingContainer: 'min-h-screen flex items-center justify-center bg-surface text-outline text-sm',
} as const

export const mobileMenuTriggerStyles = {
  button: 'fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 bg-white border border-outline-variant rounded-lg shadow-sm hover:bg-surface-container-low transition-colors md:hidden',
  icon: 'w-5 h-5 text-primary',
} as const

export const sidebarStyles = {
  asideBase: 'fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between p-6 bg-surface border-r border-outline-variant/50 transition-transform duration-300',
  asideOpen: 'translate-x-0',
  asideClosed: '-translate-x-full',
  innerWrap: 'flex flex-col gap-8 overflow-y-auto',
  newNoteButton: 'flex items-center justify-center gap-2 w-full p-3 bg-primary-container text-white font-medium rounded-2xl shadow-sm hover:bg-primary hover:-translate-y-px transition-all',
  newNoteIcon: 'w-5 h-5',
} as const

export const sidebarHeaderStyles = {
  row: 'flex items-center justify-between',
  logoGroup: 'flex items-center gap-3',
  logoBadge: 'w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-sm font-semibold',
  title: 'text-lg font-semibold leading-tight tracking-tight text-primary',
  subtitle: 'text-xs font-medium text-outline',
  collapseButton: 'hidden md:inline-flex p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-colors',
  collapseIcon: 'w-5 h-5',
} as const

export const navStyles = {
  nav: 'flex flex-col gap-1',
  linkBase: 'flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-colors',
  linkActive: 'bg-secondary-fixed text-on-secondary-fixed',
  linkInactive: 'text-on-surface-variant hover:bg-surface-container',
  icon: 'w-5 h-5',
} as const

export const notebooksListStyles = {
  wrap: 'flex flex-col gap-2',
  heading: 'px-4 text-xs font-semibold uppercase tracking-wider text-outline',
  loadingText: 'px-4 text-xs font-semibold uppercase tracking-wider text-outline',
  list: 'flex flex-col gap-1 max-h-40 overflow-y-auto',
  item: 'flex items-center justify-between py-2 px-4 rounded-xl text-left text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors',
  itemLeft: 'flex items-center gap-2 min-w-0',
  itemLabel: 'overflow-hidden text-ellipsis whitespace-nowrap',
  chevron: 'w-5 h-5',
} as const

export const userProfileFooterStyles = {
  wrap: 'pt-4 border-t border-outline-variant/40 flex flex-col gap-2',
  row: 'flex items-center gap-3',
  avatar: 'w-10 h-10 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center text-primary font-semibold border border-outline-variant shrink-0',
  avatarIcon: 'w-5 h-5',
  textWrap: 'flex flex-col min-w-0',
  email: 'text-xs font-semibold text-on-surface overflow-hidden text-ellipsis whitespace-nowrap',
  subtitle: 'text-[10px] font-medium text-outline',
  signOutButton: 'w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-error text-left hover:bg-error-container/30 transition-colors',
} as const

export const mainContentStyles = {
  mainBase: 'relative flex-1 flex flex-col overflow-hidden bg-white transition-all duration-300',
  mainOpen: 'md:ml-64',
  mainClosed: 'ml-0',
  floatingToggleButton: 'absolute top-4 left-4 z-30 hidden md:inline-flex p-2 bg-white border border-outline-variant/50 rounded-lg shadow-sm text-outline hover:bg-surface-container-low hover:text-primary transition-colors',
  floatingToggleIcon: 'w-5 h-5',
} as const
