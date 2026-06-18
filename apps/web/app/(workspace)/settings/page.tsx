'use client'

import React from 'react'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-hidden p-8 md:p-12">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Settings</h1>
        <p className="text-sm text-[#87736c] mt-1">Manage your account preferences and integrations</p>
      </header>

      <div className="max-w-xl bg-[#fff8f5] border border-[#dac1b9]/40 rounded-3xl p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-base text-[#1e1b18]">Google Drive Backup</h3>
          <p className="text-xs text-[#87736c] mt-1 leading-relaxed">
            Auto-export your notes as Markdown format directly to your Google Drive.
          </p>
        </div>
        <button className="px-4 py-2 bg-[#d67d5c] hover:bg-[#94492c] text-white text-xs font-semibold rounded-xl transition-all self-start shadow-sm">
          Connect Google Drive
        </button>
      </div>
    </div>
  )
}
