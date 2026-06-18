'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

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
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f5] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#dac1b9]/50 shadow-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#94492c] to-[#d67d5c] flex items-center justify-center text-[#fff] font-bold mx-auto shadow-sm">
            O
          </div>
          <h2 className="font-semibold text-2xl text-[#94492c] font-serif">Welcome back to Orma</h2>
          <p className="text-xs text-[#87736c] font-sans">Enter your credentials to access your notes</p>
        </div>

        {errorMsg && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold p-3.5 rounded-xl border border-[#dac1b9]/50">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#87736c]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="px-4 py-3 bg-[#fff8f5] border border-[#dac1b9]/40 focus:border-[#d67d5c] outline-none rounded-2xl text-sm text-[#1e1b18] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#87736c]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-3 bg-[#fff8f5] border border-[#dac1b9]/40 focus:border-[#d67d5c] outline-none rounded-2xl text-sm text-[#1e1b18] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#d67d5c] hover:bg-[#94492c] disabled:opacity-50 text-white font-semibold rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#dac1b9]/30"></div>
          <span className="flex-shrink mx-4 text-[10px] font-semibold text-[#87736c] uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-[#dac1b9]/30"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white hover:bg-[#fbf2ed] text-[#54433d] font-semibold rounded-2xl border border-[#dac1b9]/50 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.44 0-6.228-2.788-6.228-6.228 0-3.44 2.788-6.229 6.228-6.229 1.5 0 2.87.53 3.96 1.402l3.107-3.108C18.99 1.94 15.816 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.786 0 10.826-4.04 10.826-11.24 0-.648-.078-1.25-.218-1.955H12.24z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="text-center text-xs text-[#87736c]">
          <span>Don't have an account? </span>
          <Link href="/signup" className="text-[#94492c] hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
