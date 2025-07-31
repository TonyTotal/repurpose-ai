'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null) // Clear previous errors
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Sign Up Error:', error)
      setErrorMsg(error.message)
    } else {
      // With email confirmation OFF, this should redirect.
      // If it's ON, you'd show a "check your email" message.
      router.push('/')
      router.refresh()
    }
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null) // Clear previous errors
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign In Error:', error)
      setErrorMsg(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '100px' }}>
      <form onSubmit={handleSignIn} style={{ marginBottom: '20px' }}>
        <h3>Sign In</h3>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit">
          Sign In
        </button>
      </form>

      <form onSubmit={handleSignUp}>
        <h3>Sign Up</h3>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit">
          Sign Up
        </button>
      </form>
      
      {errorMsg && <p style={{ color: 'red', marginTop: '20px' }}>{errorMsg}</p>}
    </div>
  )
}