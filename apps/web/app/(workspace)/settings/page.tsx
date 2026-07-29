'use client'

import React, { useState, useEffect } from 'react'
import { Save, CheckCircle2, Loader2 } from 'lucide-react'
import { api, Profile } from '../../../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsPageStyles, saveRowStyles } from './_components/styles'
import StudyPreferencesCard from './_components/StudyPreferencesCard'
import GoogleDriveCard from './_components/GoogleDriveCard'

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

  const handleLimitBlur = () => {
    const val = typeof localLimit === 'string' ? parseInt(localLimit) : localLimit
    if (isNaN(val) || val < 3) setLocalLimit(3)
  }

  return (
    <div className={settingsPageStyles.wrapper}>
      <header className={settingsPageStyles.header}>
        <h1 className={settingsPageStyles.title}>Settings</h1>
        <p className={settingsPageStyles.subtitle}>Manage your account preferences and integrations</p>
      </header>

      <div className={settingsPageStyles.contentWrap}>
        <StudyPreferencesCard
          dailyLimit={localLimit}
          onLimitChange={setLocalLimit}
          onLimitBlur={handleLimitBlur}
          emailEnabled={localEmail}
          onEmailToggle={setLocalEmail}
        />

        <GoogleDriveCard />

        {/* Save Actions */}
        <div className={saveRowStyles.row}>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className={saveRowStyles.saveButton}
          >
            {updateMutation.isPending ? <Loader2 className={saveRowStyles.icon} /> : <Save className={saveRowStyles.icon} />}
            Save Changes
          </button>

          {showSaved && (
            <div className={saveRowStyles.savedIndicator}>
              <CheckCircle2 className={saveRowStyles.savedIcon} />
              Settings saved!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
