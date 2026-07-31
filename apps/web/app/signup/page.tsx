'use client'

import React, { useState } from 'react'
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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      setSuccessMsg('Account created successfully! Check your email for confirmation, or try logging in.')
      setLoading(false)
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
      <AuthHeader heading="Create your account" subtitle="Start organizing your curiosity today" />

      {errorMsg && <MessageBanner variant="error" message={errorMsg} />}
      {successMsg && <MessageBanner variant="success" message={successMsg} />}

      <form onSubmit={handleSignup} className={authFormStyles.form}>
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@domain.com" />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <AuthSubmitButton loading={loading} loadingLabel="Signing up..." label="Sign Up" />
      </form>

      <AuthDivider />

      <GoogleAuthButton onClick={handleGoogleLogin} />

      <AuthFooterLink promptText="Already have an account?" href="/login" linkLabel="Log in" />
    </AuthCard>
  )
}
