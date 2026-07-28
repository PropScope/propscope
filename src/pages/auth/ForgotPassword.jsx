import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../../components/marketing/AuthShell.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Loader2, MailCheck, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err?.message || 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={sent ? undefined : 'Enter your email and we\'ll send a reset link.'}
      footer={<>Remembered it? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to login</Link></>}
    >
      {sent ? (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
          <MailCheck size={40} className="mx-auto text-emerald-500" />
          <h3 className="mt-3 font-semibold text-ink-900">Check your inbox</h3>
          <p className="mt-1 text-sm text-ink-500">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <div><label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button className="btn-primary w-full py-3" disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
