'use client'

import React, { useState, useEffect } from 'react'
import { Save, CheckCircle2, Loader2, BookOpen } from 'lucide-react'
import { api, Profile } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  
  const [localLimit, setLocalLimit] = useState<number | string>(5)
  const [localEmail, setLocalEmail] = useState(false)
  
  const [showSaved, setShowSaved] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profiles.me()
  })

  // Sync local state when profile loads
  useEffect(() => {
    if (profile) {
      setLocalLimit(profile.daily_review_limit)
      setLocalEmail(profile.email_notifications_enabled)
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => api.profiles.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 3000)
    }
  })

  const handleSave = () => {
    let finalLimit = typeof localLimit === 'string' ? parseInt(localLimit) : localLimit
    if (isNaN(finalLimit) || finalLimit < 3) finalLimit = 3
    if (finalLimit > 50) finalLimit = 50
    setLocalLimit(finalLimit)

    updateMutation.mutate({
      daily_review_limit: finalLimit,
      email_notifications_enabled: localEmail
    })
  }

  return (
    <div className="flex-1 flex flex-col bg-[#fff] h-full overflow-y-auto p-8 md:p-12">
      <header className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-[#94492c]">Settings</h1>
        <p className="text-sm text-[#87736c] mt-1">Manage your account preferences and integrations</p>
      </header>

      <div className="max-w-2xl flex flex-col gap-8">
        {/* Study Preferences */}
        <div className="bg-[#fff8f5] border border-[#dac1b9]/40 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#f5ece7] rounded-xl flex items-center justify-center text-[#94492c]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#1e1b18]">Study Preferences</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#1e1b18]">Daily review cards limit</h3>
                <p className="text-xs text-[#87736c] mt-1 leading-relaxed max-w-sm">
                  How many cards appear in your daily review queue per session. (Min: 3, Max: 50)
                </p>
              </div>
              <input 
                type="number" 
                min={3}
                max={50}
                value={localLimit}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    setLocalLimit('')
                  } else {
                    let parsed = parseInt(val)
                    if (parsed > 50) parsed = 50
                    setLocalLimit(parsed)
                  }
                }}
                onBlur={() => {
                  let val = typeof localLimit === 'string' ? parseInt(localLimit) : localLimit
                  if (isNaN(val) || val < 3) setLocalLimit(3)
                }}
                className="w-24 px-4 py-2 bg-white border border-[#dac1b9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d67d5c]/50 text-center font-semibold text-[#54433d]"
              />
            </div>

            <div className="h-px w-full bg-[#dac1b9]/30" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#1e1b18]">Email notifications</h3>
                <p className="text-xs text-[#87736c] mt-1 leading-relaxed max-w-sm">
                  Get a daily email reminder when you have cards due for review.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={localEmail}
                  onChange={(e) => setLocalEmail(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[#dac1b9] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d67d5c]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Existing Google Drive (Placeholder) */}
        <div className="bg-[#fff] border border-[#dac1b9]/40 rounded-[2rem] p-8 shadow-sm flex flex-col gap-4 opacity-70">
          <div>
            <h3 className="font-semibold text-base text-[#1e1b18]">Google Drive Backup</h3>
            <p className="text-xs text-[#87736c] mt-1 leading-relaxed">
              Auto-export your notes as Markdown format directly to your Google Drive.
            </p>
          </div>
          <button className="px-4 py-2 bg-[#f5ece7] text-[#87736c] text-xs font-semibold rounded-xl self-start cursor-not-allowed">
            Coming Soon
          </button>
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className="px-8 py-3 bg-[#d67d5c] hover:bg-[#94492c] disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>

          {showSaved && (
            <div className="flex items-center gap-2 text-[#506351] font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
