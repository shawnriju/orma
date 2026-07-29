import { authHeaderStyles } from './styles'

interface AuthHeaderProps {
  heading: string
  subtitle: string
}

export default function AuthHeader({ heading, subtitle }: AuthHeaderProps) {
  return (
    <div className={authHeaderStyles.wrap}>
      <div className={authHeaderStyles.logoBadge}>
        O
      </div>
      <h2 className={authHeaderStyles.heading}>{heading}</h2>
      <p className={authHeaderStyles.subtitle}>{subtitle}</p>
    </div>
  )
}
