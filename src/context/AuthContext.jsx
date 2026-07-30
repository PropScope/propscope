import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

// Map a Supabase auth user into the shape the app's UI expects.
function mapUser(u) {
  if (!u) return null
  const md = u.user_metadata || {}
  const name = md.name || (u.email ? u.email.split('@')[0] : 'Investor')
  const initials = name.trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || 'PS'
  return {
    id: u.id,
    name,
    email: u.email,
    company: md.company || '—',
    phone: md.phone || '',
    stripeCustomerId: md.stripeCustomerId || '',
    subscriptionId: md.subscriptionId || '',
    plan: md.plan || 'deal-analyzer',
    avatarInitials: initials,
    memberSince: (u.created_at || new Date().toISOString()).slice(0, 10),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(mapUser(data.session?.user))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user))
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return true
  }, [])

  const signup = useCallback(async ({ email, password, name, company, plan }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, company, plan } },
    })
    if (error) throw error
    // When email confirmation is required, no session is returned yet.
    return { needsConfirmation: !data.session }
  }, [])

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return true
  }, [])

  const updateProfile = useCallback(async ({ name, company, phone }) => {
    const { data, error } = await supabase.auth.updateUser({ data: { name, company, phone } })
    if (error) throw error
    setUser(mapUser(data.user))
    return true
  }, [])

  const setPlan = useCallback(async (plan) => {
    const { data, error } = await supabase.auth.updateUser({ data: { plan } })
    if (error) throw error
    setUser(mapUser(data.user))
    return true
  }, [])

  const updateBilling = useCallback(async (fields) => {
    const { data, error } = await supabase.auth.updateUser({ data: fields })
    if (error) throw error
    setUser(mapUser(data.user))
    return true
  }, [])

  const logout = useCallback(async () => { await supabase.auth.signOut() }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, updateProfile, setPlan, updateBilling, isAuthed: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
