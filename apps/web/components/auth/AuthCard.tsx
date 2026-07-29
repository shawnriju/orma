import React from 'react'
import { authCardStyles } from './styles'

interface AuthCardProps {
  children: React.ReactNode
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className={authCardStyles.pageWrap}>
      <div className={authCardStyles.card}>
        {children}
      </div>
    </div>
  )
}
