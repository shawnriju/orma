export const pageStyles = {
  wrapper: 'font-body-md overflow-x-hidden min-h-screen bg-surface text-on-background',
} as const

export const headerStyles = {
  header: 'w-full top-0 sticky z-50 bg-surface/90 backdrop-blur-md dark:bg-on-background',
  nav: 'flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto',
  logo: 'font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed',
  navLinksWrap: 'hidden md:flex gap-8 items-center',
  navLinkActive: 'font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1',
  navLinkInactive: 'font-body-md text-body-md text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors duration-200',
  ctaButton: 'bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-label-md text-label-md active:scale-95 transition-transform cursor-pointer',
} as const

export const heroStyles = {
  section: 'max-w-container-max mx-auto px-gutter py-stack-lg md:pt-24 md:pb-12 text-center',
  inner: 'max-w-3xl mx-auto',
  heading: 'font-display-lg text-display-lg text-on-surface mb-6 leading-tight',
  subtext: 'font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto',
  ctaButton: 'inline-block bg-primary-container text-on-primary-container px-10 py-4 rounded-xl font-label-md text-[18px] hover:opacity-90 transition-all active:scale-95 cursor-pointer',
} as const

export const dailyReviewStyles = {
  section: 'max-w-container-max mx-auto px-gutter pb-stack-lg',
  panel: 'relative bg-surface-container-low rounded-[3rem] p-8 md:p-24 overflow-hidden flex flex-col items-center justify-center',
  card: 'tonal-card p-10 md:p-12 rounded-[2rem] warm-glow border-primary/10 max-w-lg w-full cursor-default relative z-10',
  cardHeaderRow: 'flex justify-between items-start mb-8',
  iconBadge: 'w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center',
  iconText: 'material-symbols-outlined text-on-secondary-container text-3xl',
  badge: 'bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm font-label-md',
  titleWrap: 'mb-8',
  eyebrow: 'font-label-md text-label-md text-secondary mb-2',
  heading: 'font-headline-md text-headline-md text-on-surface leading-snug',
  bodyText: 'font-body-md text-body-lg text-on-surface-variant mb-10',
  ctaButton: 'inline-block w-full text-center bg-primary-container text-on-primary-container font-label-md text-lg py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10 cursor-pointer',
  decorLeft: 'absolute -left-20 -bottom-20 opacity-30 pointer-events-none',
  decorLeftBlob: 'w-64 h-64 bg-primary-container rounded-full blur-3xl',
  decorRight: 'absolute -right-20 -top-20 opacity-30 pointer-events-none',
  decorRightBlob: 'w-80 h-80 bg-secondary-container rounded-full blur-3xl',
} as const

export const featuresStyles = {
  section: 'max-w-container-max mx-auto px-gutter py-stack-lg',
  headerWrap: 'text-center mb-24',
  heading: 'font-headline-lg text-headline-lg text-on-surface mb-4',
  headingUnderline: 'h-1 w-20 bg-primary mx-auto rounded-full',
  list: 'space-y-32',
  row: 'flex flex-col md:flex-row items-center gap-16 md:gap-24',
  rowReverse: 'flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24',
  textCol: 'w-full md:w-1/2',
  iconBadge: 'w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6',
  iconText: 'material-symbols-outlined text-primary',
  title: 'font-headline-md text-headline-md text-on-surface mb-4',
  bodyText: 'font-body-md text-body-lg text-on-surface-variant leading-relaxed',
} as const

export const feature1Styles = {
  visualOuter: 'bg-surface-container-high rounded-[2rem] p-8 aspect-video flex items-center justify-center',
  visualCard: 'tonal-card w-full h-full rounded-xl p-6 space-y-4 shadow-sm overflow-hidden',
  line1: 'h-4 w-3/4 bg-surface-container-highest/40 rounded',
  line2: 'h-4 w-full bg-surface-container-highest/20 rounded',
  line3: 'h-4 w-5/6 bg-surface-container-highest/20 rounded',
  footerDivider: 'pt-4 border-t border-outline-variant/20',
  tagRow: 'flex gap-2',
  tag1: 'h-6 w-16 bg-primary-container/20 rounded-full',
  tag2: 'h-6 w-20 bg-secondary-container/20 rounded-full',
} as const

export const feature2Styles = {
  visualOuter: 'bg-secondary-container/30 rounded-[2rem] p-10 aspect-video flex items-center justify-center',
  stackWrap: 'relative',
  frontCard: 'tonal-card p-6 rounded-2xl w-56 transform -rotate-4 relative z-20',
  frontCardEyebrow: 'text-label-sm text-secondary mb-2',
  frontCardTitle: 'font-headline-sm text-on-surface font-semibold',
  frontCardFooterRow: 'mt-4 flex justify-between items-center',
  avatarsWrap: 'flex -space-x-2',
  avatar1: 'w-6 h-6 rounded-full bg-primary/20 border-2 border-white',
  avatar2: 'w-6 h-6 rounded-full bg-secondary/20 border-2 border-white',
  trendIcon: 'material-symbols-outlined text-outline text-sm',
  backCard: 'absolute top-4 left-4 tonal-card p-6 rounded-2xl w-56 transform rotate-6 opacity-60 z-10',
  backCardLine1: 'h-4 w-20 bg-surface-container rounded mb-4',
  backCardLine2: 'h-2 w-full bg-surface-container/40 rounded',
} as const

export const feature3Styles = {
  visualOuter: 'bg-primary-container/10 rounded-[2rem] p-8 aspect-video flex items-center justify-center',
  cardWrap: 'relative w-full max-w-xs h-40',
  card: 'absolute inset-0 tonal-card p-6 rounded-2xl flex flex-col justify-between border-primary/20 bg-surface-bright',
  labelRow: 'flex items-center gap-2 mb-3',
  labelIcon: 'material-symbols-outlined text-primary text-sm',
  labelText: 'text-label-sm text-primary uppercase tracking-wider',
  quoteText: 'font-label-md text-on-surface italic',
  barsRow: 'flex gap-1',
  barActive: 'h-1 flex-1 bg-primary rounded-full',
  barInactive: 'h-1 flex-1 bg-primary/20 rounded-full',
} as const

export const ctaStyles = {
  section: 'max-w-container-max mx-auto px-gutter py-stack-lg',
  panel: 'bg-primary text-on-primary rounded-3xl p-12 md:p-24 text-center relative overflow-hidden',
  content: 'relative z-10',
  heading: 'font-display-lg text-display-lg mb-6',
  bodyText: 'font-body-lg text-body-lg mb-10 opacity-90 max-w-xl mx-auto',
  buttonRow: 'flex flex-col md:flex-row gap-4 justify-center',
  primaryButton: 'bg-surface text-primary px-10 py-4 rounded-xl font-label-md text-lg active:scale-95 transition-all cursor-pointer',
  secondaryButton: 'border border-white/30 text-white px-10 py-4 rounded-xl font-label-md text-lg hover:bg-white/10 transition-all cursor-pointer',
  decorTop: 'absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48',
  decorBottom: 'absolute bottom-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -ml-32 -mb-32',
} as const

export const footerStyles = {
  footer: 'w-full py-stack-lg bg-surface-container dark:bg-surface-container-highest',
  inner: 'flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-8',
  brandCol: 'flex flex-col items-center md:items-start gap-2',
  brandTitle: 'font-headline-sm text-headline-sm text-on-surface font-semibold',
  copyright: 'font-label-sm text-label-sm text-on-surface/80 dark:text-on-surface-variant',
  linksRow: 'flex gap-gutter',
  link: 'font-label-sm text-label-sm text-on-surface dark:text-on-surface-variant hover:text-primary transition-colors',
} as const
