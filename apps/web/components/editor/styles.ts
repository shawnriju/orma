export const editorWrapperStyles = {
  wrapper: 'flex flex-col bg-white py-8 px-8 pb-24 cursor-text',
} as const

export const saveIndicatorStyles = {
  row: 'flex items-center justify-between mb-6 text-outline text-xs select-none pointer-events-none',
  readingTimeGroup: 'flex items-center gap-2',
  readingTimeIcon: 'w-4 h-4',
  stateGroup: 'flex items-center gap-2',
  savingText: 'text-primary animate-pulse',
  savedText: 'flex items-center gap-1 text-secondary',
  savedIcon: 'w-4 h-4',
  errorText: 'text-error',
} as const

export const titleInputStyles = {
  input: 'w-full mb-4 border-0 outline-none bg-transparent text-on-surface font-headline-lg text-4xl font-bold placeholder:text-outline-variant',
} as const

export const editorContentStyles = {
  wrap: 'min-h-[400px] cursor-text',
  content: 'outline-none prose-h1:font-serif prose-h2:font-serif prose-p:font-sans',
} as const
