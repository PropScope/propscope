import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthShell from '../../components/marketing/AuthShell.jsx'
import { PLANS, planById } from '../../lib/plans.js'
import { usd } from '../../lib/format.js'
import { Loader2, Check, AlertCircle, MailCheck } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const initialPlan = planById(params.get('plan')) ? params.get('plan') : 'deal-analyzer'

  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', plan: initialPlan })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { needsConfirmation } = await signup(form)
      if (needsConfirmation) setConfirm(true)
      else nav('/app', { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={confirm ? 'Confirm your email' : 'Create your account'}
      subtitle={confirm ? undefined : 'Start analyzing deals in minutes.'}
      footer={confirm ? undefined : <>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Log in</Link></>}
    >
      {confirm ? (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
          <MailCheck size={40} className="mx-auto text-emerald-500" />
          <h3 className="mt-3 font-semibold text-ink-900">Almost there</h3>
          <p className="mt-1 text-sm text-ink-500">
            We sent a confirmation link to <span className="font-medium">{form.email}</span>. Click it to activate your
            account, then <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">log in</Link>.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Full name</label>
              <input className="input" placeholder="Jordan Avery" value={form.name} onChange={set('name')} required /></div>
            <div><label className="label">Company <span className="text-ink-400">(optional)</span></label>
              <input className="input" placeholder="Avery Capital" value={form.company} onChange={set('company')} /></div>
          </div>
          <div><label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required /></div>
          <div><label className="label">Password</label>
            <input type="password" className="input" placeholder="At least 6 characters" minLength={6} value={form.password} onChange={set('password')} required /></div>

          <div className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            🎁 Your first report is free — no card required. You can pick a plan later once you've tried it.
          </div>

          <button className="btn-primary w-full py-3" disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Create account'}
          </button>
          <p className="text-center text-xs text-ink-400">No payment collected — your first report is free.</p>
        </form>
      )}
    </AuthShell>
  )
}
