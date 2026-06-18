'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'

export default function LibraryPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Library</h1>
        <p className="text-sm text-[#87736c] mt-1">Browse and manage your books, highlights, and resources</p>
      </header>

      <div className="max-w-md mx-auto text-center py-20 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#f5ece7] rounded-3xl flex items-center justify-center text-[#94492c]">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#1e1b18]">Your library is empty</h3>
          <p className="text-sm text-[#87736c] mt-1 leading-relaxed">
            In the future, import PDFs, Kindle books, or web articles here to read and study them directly.
          </p>
        </div>
      </div>
    </div>
  )
}
