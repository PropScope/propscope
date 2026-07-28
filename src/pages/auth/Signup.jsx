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

          <div>
            <label className="label">Choose a plan</label>
            <div className="grid grid-cols-2 gap-2">
              {PLANS.map((p) => (
                <button type="button" key={p.id} onClick={() => setForm((f) => ({ ...f, plan: p.id }))}
                  className={`relative rounded-xl border p-3 text-left text-sm transition ${
                    form.plan === p.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-ink-200 hover:border-ink-300'
                  }`}>
                  {form.plan === p.id && <Check size={14} className="absolute right-2 top-2 text-brand-600" />}
                  <p className="font-semibold text-ink-900">{p.name}</p>
                  <p className="text-ink-500">{usd(p.price)}{p.subscription ? '/mo' : ''}</p>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full py-3" disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Create account'}
          </button>
          <p className="text-center text-xs text-ink-400">No payment collected yet — you choose a plan here, checkout comes later.</p>
        </form>
      )}
    </AuthShell>
  )
}
