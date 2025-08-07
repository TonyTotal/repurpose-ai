'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'

// Import Shadcn UI components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    setErrorMsg(null)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Sign Up Error:', error)
      setErrorMsg(error.message)
    } else {
      // After sign up, refresh to let the server component redirect
      router.refresh()
    }
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign In Error:', error)
      setErrorMsg(error.message)
    } else {
      // THE FIX IS HERE: Use router.push('/') for an explicit redirect
      router.push('/')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Tabs defaultValue="signin" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Welcome back! Enter your credentials to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleSignIn}>
                <div className="space-y-1">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input id="email-signin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full mt-4">Sign In</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create an account to start repurposing your content with AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleSignUp}>
                <div className="space-y-1">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full mt-4">Sign Up</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        {errorMsg && <p className="text-sm text-red-500 mt-2 text-center">{errorMsg}</p>}
      </Tabs>
    </div>
  )
}
