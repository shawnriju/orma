'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'
import styles from '../workspace.module.css'

export default function LibraryPage() {
  return (
    <div className={styles.workspacePage}>
      <header className="mb-8">
        <h1 className={styles.workspaceHeaderTitle}>Library</h1>
        <p className={styles.workspaceHeaderSearchInput}>Browse and manage your books, highlights, and resources</p>
      </header>

      <div className={styles.workspaceEmptyState}>
        <div className={styles.workspaceEmptyIcon}>
          <BookOpen className={styles.workspaceNavIcon} />
        </div>
        <div>
          <h3 className={styles.workspaceEmptyTitle}>Your library is empty</h3>
          <p className={styles.workspaceEmptyText}>
            In the future, import PDFs, Kindle books, or web articles here to read and study them directly.
          </p>
        </div>
      </div>
    </div>
  )
}
