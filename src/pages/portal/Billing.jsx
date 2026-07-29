import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditCard, Download, Check, Sparkles, CheckCircle2, X, ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { planById } from '../../lib/plans.js'
import { usd, dateFmt } from '../../lib/format.js'
import { startProCheckout, confirmCheckout } from '../../lib/billing.js'

const invoices = [
  { id: 'INV-2026-06', date: '2026-06-02', amount: 497, plan: 'Investor Pro — Monthly' },
  { id: 'INV-2026-05', date: '2026-05-02', amount: 497, plan: 'Investor Pro — Monthly' },
]

export default function Billing() {
  const { user, setPlan } = useAuth()
  const [params, setParams] = useSearchParams()
  const [notice, setNotice] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [err, setErr] = useState('')
  const current = planById(user?.plan)

  useEffect(() => {
    if (params.get('canceled')) { setNotice('canceled'); setParams({}, { replace: true }); return }
    const sid = params.get('session_id')
    if (params.get('success') && sid) {
      ;(async () => {
        try {
          const r = await confirmCheckout(sid)
          if (r.status === 'complete' || r.paymentStatus === 'paid') {
            await setPlan('investor-pro')
            setNotice('success')
          } else {
            setNotice('pending')
          }
        } catch (e) {
          setErr((e && e.message) || 'Could not confirm your subscription.')
        } finally {
          setParams({}, { replace: true })
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subscribe = async () => {
    setSubscribing(true); setErr('')
    try {
      await startProCheckout({ email: user?.email, userId: user?.id })
    } catch (e) {
      setErr((e && e.message) || 'Could not start checkout.')
      setSubscribing(false)
    }
  }

  return (
    <>
      <PageHeader title="Billing" subtitle="Manage your plan and payment method." />

      {notice === 'success' && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} /> You're on Investor Pro — unlimited reports are unlocked.</span>
          <button onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-800"><X size={16} /></button>
        </div>
      )}
      {notice === 'canceled' && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-ink-100 px-4 py-3 text-sm text-ink-700">
          <span>Checkout canceled — no charge was made.</span>
          <button onClick={() => setNotice('')} className="text-ink-500 hover:text-ink-800"><X size={16} /></button>
        </div>
      )}
      {notice === 'pending' && (
        <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">Payment is processing — your plan will update shortly.</div>
      )}
      {err && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">Current plan</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-ink-900">
                <Sparkles size={20} className="text-brand-600" /> {current?.name}
              </p>
            </div>
            {current?.subscription && <span className="badge bg-emerald-100 text-emerald-700"><Check size={12} /> Active</span>}
          </div>
          <p className="mt-3 text-sm text-ink-500">
            {current?.subscription
              ? `${usd(current.price)}/month · unlimited reports`
              : 'Per-report plan — pay only when you run a report.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {current?.subscription ? (
              <>
                <Link to="/pricing" className="btn-secondary">Change plan</Link>
                <button className="btn-ghost text-rose-600 hover:bg-rose-50" disabled title="Cancel/manage via the Stripe portal (coming soon)">Cancel subscription</button>
              </>
            ) : (
              <>
                <button onClick={subscribe} disabled={subscribing} className="btn-primary">{subscribing ? 'Redirecting…' : 'Subscribe to Investor Pro'}</button>
                <Link to="/pricing" className="btn-secondary">Compare plans</Link>
              </>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Payment</h3>
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-ink-50 p-4">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm text-ink-600">Card details are handled securely by Stripe Checkout — PropScope never sees or stores your card number.</p>
          </div>
          {!current?.subscription && (
            <button onClick={subscribe} disabled={subscribing} className="btn-primary mt-4 w-full">
              <CreditCard size={16} /> {subscribing ? 'Redirecting…' : 'Subscribe with card'}
            </button>
          )}
        </div>
      </div>

      {/* Upgrade nudge */}
      {!current?.subscription && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-6 text-white">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Running deals every week?</h3>
              <p className="text-sm text-brand-50/90">Investor Pro gives you unlimited reports for {usd(497)}/mo.</p>
            </div>
            <button onClick={subscribe} disabled={subscribing} className="btn bg-white text-brand-700 hover:bg-brand-50">{subscribing ? 'Redirecting…' : 'Upgrade to Pro'}</button>
          </div>
        </div>
      )}

      <div className="mt-8 card p-6">
        <h3 className="font-semibold text-ink-900">Billing history</h3>
        {current?.subscription ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-2 font-medium">Invoice</th>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Description</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-medium text-ink-800">{inv.id}</td>
                    <td className="py-3 text-ink-500">{dateFmt(inv.date)}</td>
                    <td className="py-3 text-ink-500">{inv.plan}</td>
                    <td className="py-3 font-semibold text-ink-900">{usd(inv.amount)}</td>
                    <td className="py-3 text-right">
                      <button className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"><Download size={14} /> PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-500">No charges yet. Your invoices will appear here once you subscribe.</p>
        )}
      </div>
    </>
  )
}
