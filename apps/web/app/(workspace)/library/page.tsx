'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'
export default function LibraryPage() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden px-8 py-8 gap-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline-md text-primary">Library</h1>
        <p className="text-sm leading-relaxed text-outline">Browse and manage your books, highlights, and resources</p>
      </header>

      <div className="max-w-md mx-auto py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant mx-auto mb-4">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-on-surface">Your library is empty</h3>
          <p className="text-sm leading-relaxed text-outline">
            In the future, import PDFs, Kindle books, or web articles here to read and study them directly.
          </p>
        </div>
      </div>
    </div>
  )
}
