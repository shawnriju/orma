'use client'

import React, { useState, useEffect } from 'react'
import { Save, CheckCircle2, Loader2, BookOpen } from 'lucide-react'
import { api, Profile } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../workspace.module.css'

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
    <div className={styles.workspaceContent}>
      <header className="mb-8">
        <h1 className={styles.workspaceHeaderTitle}>Settings</h1>
        <p className={styles.workspaceEmptyText}>Manage your account preferences and integrations</p>
      </header>

      <div className="max-w-2xl flex flex-col gap-8">
        {/* Study Preferences */}
        <div className={styles.workspacePageCard}>
          <div className="flex items-center gap-3 mb-6">
            <div className={styles.workspaceEmptyIcon}>
              <BookOpen className={styles.workspaceNavIcon} />
            </div>
            <h2 className={styles.workspaceStudyHeaderTitle}>Study Preferences</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className={styles.workspaceEmptyTitle}>Daily review cards limit</h3>
                <p className={styles.workspaceEmptyText}>
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
                className={styles.workspaceHeaderSearchInput}
              />
            </div>

            <div className={styles.workspaceProgressTrack} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className={styles.workspaceEmptyTitle}>Email notifications</h3>
                <p className={styles.workspaceEmptyText}>
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
        <div className={styles.workspacePageCard}>
          <div>
            <h3 className={styles.workspaceEmptyTitle}>Google Drive Backup</h3>
            <p className={styles.workspaceEmptyText}>
              Auto-export your notes as Markdown format directly to your Google Drive.
            </p>
          </div>
          <button className={styles.workspaceButtonSecondary}>
            Coming Soon
          </button>
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className={styles.workspaceButtonPrimary}
          >
            {updateMutation.isPending ? <Loader2 className={styles.workspaceMainToggleIcon} /> : <Save className={styles.workspaceMainToggleIcon} />}
            Save Changes
          </button>

          {showSaved && (
            <div className="flex items-center gap-2 text-[#506351] font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 className={styles.workspaceMainToggleIcon} />
              Settings saved!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
