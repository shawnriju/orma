import Link from 'next/link'
import { authFooterLinkStyles } from './styles'

interface AuthFooterLinkProps {
  promptText: string
  href: string
  linkLabel: string
}

export default function AuthFooterLink({ promptText, href, linkLabel }: AuthFooterLinkProps) {
  return (
    <div className={authFooterLinkStyles.wrap}>
      <span>{promptText} </span>
      <Link href={href} className={authFooterLinkStyles.link}>
        {linkLabel}
      </Link>
    </div>
  )
}
