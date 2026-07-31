export const authCardStyles = {
  pageWrap: 'min-h-screen flex items-center justify-center bg-[#fff8f5] px-4',
  card: 'max-w-md w-full bg-white p-8 rounded-3xl border border-[#dac1b9]/50 shadow-sm flex flex-col gap-6',
} as const

export const authHeaderStyles = {
  wrap: 'text-center flex flex-col gap-2',
  logoBadge: 'w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#94492c] to-[#d67d5c] flex items-center justify-center text-[#fff] font-bold mx-auto shadow-sm',
  heading: 'font-semibold text-2xl text-[#94492c] font-serif',
  subtitle: 'text-xs text-[#87736c] font-sans',
} as const

export const messageBannerStyles = {
  error: 'bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold p-3.5 rounded-xl border border-[#dac1b9]/50',
  success: 'bg-[#d3e8d1] text-[#0e1f11] text-xs font-semibold p-3.5 rounded-xl border border-[#b7ccb6]',
} as const

export const authFormStyles = {
  form: 'flex flex-col gap-4',
} as const

export const authFieldStyles = {
  wrap: 'flex flex-col gap-1.5',
  label: 'text-[10px] font-semibold uppercase tracking-wider text-[#87736c]',
  input: 'px-4 py-3 bg-[#fff8f5] border border-[#dac1b9]/40 focus:border-[#d67d5c] outline-none rounded-2xl text-sm text-[#1e1b18] transition-all',
} as const

export const authSubmitButtonStyles = {
  button: 'w-full py-3 bg-[#d67d5c] hover:bg-[#94492c] disabled:opacity-50 text-white font-semibold rounded-2xl shadow-sm transition-all cursor-pointer',
} as const

export const authDividerStyles = {
  wrap: 'relative flex py-2 items-center',
  line: 'flex-grow border-t border-[#dac1b9]/30',
  label: 'flex-shrink mx-4 text-[10px] font-semibold text-[#87736c] uppercase tracking-wider',
} as const

export const googleAuthButtonStyles = {
  button: 'w-full py-3 bg-white hover:bg-[#fbf2ed] text-[#54433d] font-semibold rounded-2xl border border-[#dac1b9]/50 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm',
  icon: 'w-4 h-4',
} as const

export const authFooterLinkStyles = {
  wrap: 'text-center text-xs text-[#87736c]',
  link: 'text-[#94492c] hover:underline font-semibold',
} as const
