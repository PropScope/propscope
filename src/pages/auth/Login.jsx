import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthShell from '../../components/marketing/AuthShell.jsx'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await login({ email })
    setLoading(false)
    nav(loc.state?.from?.pathname || '/app', { replace: true })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your PropScope portal."
      footer={<>New here? <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
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
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" defaultChecked />
          Keep me signed in
        </label>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Log in'}
        </button>
        <p className="text-center text-xs text-ink-400">Demo mode — any email and password will sign you in.</p>
      </form>
    </AuthShell>
  )
}
