'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AuthContextValue {
  supabase: SupabaseClient
  user: User | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  changePassword: (newPassword: string) => Promise<string | null>
  updateDisplayName: (name: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  async function changePassword(newPassword: string): Promise<string | null> {
    if (newPassword.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return error?.message ?? null
  }

  async function updateDisplayName(name: string): Promise<string | null> {
    const { error } = await supabase.auth.updateUser({ data: { display_name: name.trim() } })
    return error?.message ?? null
  }

  return (
    <AuthContext.Provider value={{ supabase, user, token, loading, signIn, signOut, changePassword, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
