import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthShell from '../../components/marketing/AuthShell.jsx'
import { Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login({ email, password })
      nav(loc.state?.from?.pathname || '/app', { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not sign in. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your PropScope portal."
      footer={<>New here? <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-100">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">Forgot?</Link>
          </div>
          <input type="password" className="input" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}
