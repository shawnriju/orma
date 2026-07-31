'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'
import { libraryPageStyles } from './_components/styles'

export default function LibraryPage() {
  return (
    <div className={libraryPageStyles.wrapper}>
      <header className={libraryPageStyles.header}>
        <h1 className={libraryPageStyles.title}>Library</h1>
        <p className={libraryPageStyles.subtitle}>Browse and manage your books, highlights, and resources</p>
      </header>

      <div className={libraryPageStyles.emptyStateWrap}>
        <div className={libraryPageStyles.iconBadge}>
          <BookOpen className={libraryPageStyles.icon} />
        </div>
        <div>
          <h3 className={libraryPageStyles.emptyHeading}>Your library is empty</h3>
          <p className={libraryPageStyles.emptyBodyText}>
            In the future, import PDFs, Kindle books, or web articles here to read and study them directly.
          </p>
        </div>
      </div>
    </div>
  )
}
