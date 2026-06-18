'use client'

import React from 'react'
import { Sparkles, Clock, AlertCircle } from 'lucide-react'

export default function StudyPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Daily Review</h1>
        <p className="text-sm text-[#87736c] mt-1">Strengthen your memory with spaced repetition</p>
      </header>

      <div className="max-w-2xl bg-[#fff8f5] border border-[#dac1b9]/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center flex flex-col items-center gap-6 mx-auto mt-12">
        <div className="w-16 h-16 bg-[#d3e8d1] rounded-3xl flex items-center justify-center text-[#0e1f11]">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-serif font-bold text-2xl text-[#1e1b18]">No Cards Due Today</h2>
          <p className="text-sm text-[#87736c] mt-2 leading-relaxed max-w-md">
            Excellent! You have reviewed all available concepts. Generate new cards from your notes to continue learning.
          </p>
        </div>

        <div className="w-full flex items-center justify-center gap-2 p-4 bg-[#fff] border border-[#dac1b9]/20 rounded-2xl text-xs text-[#87736c] font-medium max-w-sm">
          <AlertCircle className="w-4 h-4 text-[#d67d5c]" />
          <span>Need new flashcards? Open any note and use "Magic Study".</span>
        </div>
      </div>
    </div>
  )
}
