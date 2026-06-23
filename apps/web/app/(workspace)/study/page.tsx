'use client'

import React from 'react'
import { Sparkles, Clock, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export default function StudyPage() {
  const { data: dueCards = [], isLoading, error } = useQuery({
    queryKey: ['study', 'due'],
    queryFn: () => api.study.due(),
  })

  return (
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12 min-h-0">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Daily Review</h1>
        <p className="text-sm text-[#87736c] mt-1">Strengthen your memory with spaced repetition</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="max-w-3xl bg-[#fff8f5] border border-[#dac1b9]/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm mx-auto mt-12">
        {isLoading ? (
          <div className="text-center py-10 text-sm text-[#87736c]">Loading due cards...</div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#ffdad6] rounded-3xl flex items-center justify-center text-[#ba1a1a]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#1e1b18]">Could not load review cards</h2>
              <p className="text-sm text-[#87736c] mt-2 leading-relaxed max-w-md">
                Make sure the backend is running and the study API is available.
              </p>
            </div>
          </div>
        ) : dueCards.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-6 py-8">
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
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#1e1b18]">{dueCards.length} cards due today</h2>
                <p className="text-sm text-[#87736c] mt-2">These were saved from your notes and are ready for review.</p>
              </div>
              <div className="w-16 h-16 bg-[#d3e8d1] rounded-3xl flex items-center justify-center text-[#0e1f11] shrink-0">
                <Clock className="w-8 h-8" />
              </div>
            </div>

            <div className="grid gap-4">
              {dueCards.map((card) => (
                <article key={card.id} className="bg-[#fff] border border-[#dac1b9]/30 rounded-3xl p-5 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#87736c] mb-2">
                    Question
                  </div>
                  <p className="text-sm font-semibold text-[#1e1b18] leading-relaxed">{card.question}</p>
                  <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#87736c] mb-2">
                    Answer
                  </div>
                  <p className="text-sm text-[#54433d] leading-relaxed">{card.answer}</p>
                </article>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
