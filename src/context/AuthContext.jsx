import { createContext, useContext, useState, useCallback } from 'react'
import { SAMPLE_USER } from '../lib/mockData.js'

// Mocked auth for Stage 1. Any credentials work; state lives in memory only.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = useCallback(async ({ email, name }) => {
    // Pretend network call
    await new Promise((res) => setTimeout(res, 500))
    setUser({
      ...SAMPLE_USER,
      email: email || SAMPLE_USER.email,
      name: name || SAMPLE_USER.name,
    })
    return true
  }, [])

  const signup = useCallback(async ({ email, name, company, plan }) => {
    await new Promise((res) => setTimeout(res, 600))
    const initials = (name || 'New User')
      .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
    setUser({
      ...SAMPLE_USER,
      name: name || 'New User',
      email: email || 'you@example.com',
      company: company || '—',
      plan: plan || 'deal-analyzer',
      avatarInitials: initials,
      memberSince: new Date().toISOString().slice(0, 10),
    })
    return true
  }, [])

  const logout = useCallback(() => setUser(null), [])

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthed: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
