'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { authFormStyles } from '../../components/auth/styles'
import AuthCard from '../../components/auth/AuthCard'
import AuthHeader from '../../components/auth/AuthHeader'
import MessageBanner from '../../components/auth/MessageBanner'
import AuthField from '../../components/auth/AuthField'
import AuthSubmitButton from '../../components/auth/AuthSubmitButton'
import AuthDivider from '../../components/auth/AuthDivider'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import AuthFooterLink from '../../components/auth/AuthFooterLink'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/notes')
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setErrorMsg(error.message)
    }
  }

  return (
    <AuthCard>
      <AuthHeader heading="Welcome back to Orma" subtitle="Enter your credentials to access your notes" />

      {errorMsg && <MessageBanner variant="error" message={errorMsg} />}

      <form onSubmit={handleLogin} className={authFormStyles.form}>
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@domain.com" />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <AuthSubmitButton loading={loading} loadingLabel="Logging in..." label="Log In" />
      </form>

      <AuthDivider />

      <GoogleAuthButton onClick={handleGoogleLogin} />

      <AuthFooterLink promptText="Don't have an account?" href="/signup" linkLabel="Sign up" />
    </AuthCard>
  )
}
