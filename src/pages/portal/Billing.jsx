import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditCard, Check, Sparkles, CheckCircle2, X, ShieldCheck, Settings } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { planById } from '../../lib/plans.js'
import { usd, dateFmt } from '../../lib/format.js'
import { startProCheckout, confirmCheckout, openBillingPortal, getSubscriptionStatus } from '../../lib/billing.js'

const ACTIVE = ['active', 'trialing', 'past_due']

export default function Billing() {
  const { user, setPlan, updateBilling } = useAuth()
  const [params, setParams] = useSearchParams()
  const [notice, setNotice] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [err, setErr] = useState('')
  const [subStatus, setSubStatus] = useState(null)
  const current = planById(user?.plan)

  // Handle return from Stripe Checkout
  useEffect(() => {
    if (params.get('canceled')) { setNotice('canceled'); setParams({}, { replace: true }); return }
    const sid = params.get('session_id')
    if (params.get('success') && sid) {
      ;(async () => {
        try {
          const r = await confirmCheckout(sid)
          if (r.status === 'complete' || r.paymentStatus === 'paid') {
            await updateBilling({ plan: 'investor-pro', stripeCustomerId: r.customer || '', subscriptionId: r.subscription || '' })
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

  // Self-heal: whenever we know a subscription id, pull its real status from Stripe
  useEffect(() => {
    if (!user?.subscriptionId) return
    let active = true
    ;(async () => {
      try {
        const s = await getSubscriptionStatus(user.subscriptionId)
        if (!active) return
        setSubStatus(s)
        const stillActive = ACTIVE.includes(s.status)
        if (!stillActive && user.plan === 'investor-pro') {
          await setPlan('deal-analyzer')
        }
      } catch {
        /* ignore — non-blocking */
      }
    })()
    return () => { active = false }
  }, [user?.subscriptionId])

  const subscribe = async () => {
    setSubscribing(true); setErr('')
    try {
      await startProCheckout({ email: user?.email, userId: user?.id })
    } catch (e) {
      setErr((e && e.message) || 'Could not start checkout.')
      setSubscribing(false)
    }
  }

  const manage = async () => {
    setPortalLoading(true); setErr('')
    try {
      await openBillingPortal(user?.stripeCustomerId)
    } catch (e) {
      setErr((e && e.message) || 'Could not open the billing portal.')
      setPortalLoading(false)
    }
  }

  const renewalLine = () => {
    if (!subStatus || !subStatus.currentPeriodEnd) return `${usd(current?.price || 497)}/month · unlimited reports`
    const when = dateFmt(new Date(subStatus.currentPeriodEnd * 1000).toISOString())
    return subStatus.cancelAtPeriodEnd
      ? `${usd(current?.price || 497)}/month · cancels ${when}`
      : `${usd(current?.price || 497)}/month · renews ${when}`
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
            {current?.subscription && (
              <span className={`badge ${subStatus && subStatus.cancelAtPeriodEnd ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <Check size={12} /> {subStatus && subStatus.cancelAtPeriodEnd ? 'Ending' : 'Active'}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-500">
            {current?.subscription ? renewalLine() : 'Per-report plan — pay only when you run a report.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {current?.subscription ? (
              <>
                <button onClick={manage} disabled={portalLoading || !user?.stripeCustomerId} className="btn-secondary">
                  <Settings size={16} /> {portalLoading ? 'Opening…' : 'Manage subscription'}
                </button>
                <Link to="/pricing" className="btn-ghost">Compare plans</Link>
              </>
            ) : (
              <>
                <button onClick={subscribe} disabled={subscribing} className="btn-primary">{subscribing ? 'Redirecting…' : 'Subscribe to Investor Pro'}</button>
                <Link to="/pricing" className="btn-secondary">Compare plans</Link>
              </>
            )}
          </div>
          {current?.subscription && (
            <p className="mt-3 text-xs text-ink-400">Update your card, download invoices, or cancel anytime in the secure Stripe portal.</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Payment</h3>
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-ink-50 p-4">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm text-ink-600">Card details are handled securely by Stripe — PropScope never sees or stores your card number.</p>
          </div>
          {current?.subscription ? (
            <button onClick={manage} disabled={portalLoading || !user?.stripeCustomerId} className="btn-secondary mt-4 w-full">
              <Settings size={16} /> {portalLoading ? 'Opening…' : 'Manage payment & billing'}
            </button>
          ) : (
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
        <p className="mt-3 text-sm text-ink-500">
          {current?.subscription
            ? 'Your invoices and receipts are available in the Stripe billing portal.'
            : 'No charges yet. Your invoices will appear here once you subscribe.'}
        </p>
      </div>
    </>
  )
}
