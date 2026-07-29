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
    <div className="flex-1 overflow-y-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline-md text-primary">Settings</h1>
        <p className="text-sm leading-relaxed text-outline">Manage your account preferences and integrations</p>
      </header>

      <div className="max-w-2xl mx-auto flex flex-col gap-8 w-full">
        {/* Study Preferences */}
        <div className="w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-outline-variant">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-primary">Study Preferences</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-on-surface">Daily review cards limit</h3>
                <p className="text-sm leading-relaxed text-outline mt-1">
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
                className="w-20 bg-white border border-outline-variant/40 rounded-xl px-4 py-2 text-sm text-on-surface font-semibold text-center focus:border-primary-container focus:outline-none transition-colors shadow-sm"
              />
            </div>

            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-on-surface">Email notifications</h3>
                <p className="text-sm leading-relaxed text-outline mt-1">
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
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Existing Google Drive (Placeholder) */}
        <div className="w-full max-w-2xl mx-auto bg-surface border border-outline-variant/30 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm text-left">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-on-surface">Google Drive Backup</h3>
            <p className="text-sm leading-relaxed text-outline mt-1">
              Auto-export your notes as Markdown format directly to your Google Drive.
            </p>
          </div>
          <button className="shrink-0 inline-flex items-center justify-center px-6 py-2.5 bg-white text-on-surface text-sm font-semibold rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer shadow-sm">
            Coming Soon
          </button>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-container text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>

          {showSaved && (
            <div className="flex items-center gap-2 text-[#506351] font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 className="w-5 h-5" />
              Settings saved!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
