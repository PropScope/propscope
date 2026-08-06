import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Sparkles, CheckCircle2, X, ShieldCheck, Settings } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PLANS, planById, capForPlan } from '../../lib/plans.js'
import { usd, dateFmt } from '../../lib/format.js'
import { startPlanCheckout, confirmCheckout, openBillingPortal, getSubscriptionStatus } from '../../lib/billing.js'
import { monthlyReportCount } from '../../lib/reports.js'

const ACTIVE = ['active', 'trialing', 'past_due']

export default function Billing() {
  const { user, setPlan, updateBilling } = useAuth()
  const [params, setParams] = useSearchParams()
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [err, setErr] = useState('')
  const [subStatus, setSubStatus] = useState(null)
  const [annual, setAnnual] = useState(params.get('billing') !== 'month')
  const [monthUsed, setMonthUsed] = useState(null)
  const current = planById(user?.plan) // undefined = free
  const cap = capForPlan(user?.plan)

  useEffect(() => {
    if (params.get('canceled')) { setNotice('canceled'); setParams({}, { replace: true }); return }
    const sid = params.get('session_id')
    const boughtPlan = params.get('plan')
    if (params.get('success') && sid) {
      ;(async () => {
        try {
          const r = await confirmCheckout(sid)
          if (r.status === 'complete' || r.paymentStatus === 'paid') {
            await updateBilling({ plan: boughtPlan || 'investor-pro', stripeCustomerId: r.customer || '', subscriptionId: r.subscription || '' })
            setNotice('success')
          } else setNotice('pending')
        } catch (e) { setErr((e && e.message) || 'Could not confirm your subscription.') }
        finally { setParams({}, { replace: true }) }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let live = true
    monthlyReportCount().then((n) => { if (live) setMonthUsed(n) }).catch(() => {})
    return () => { live = false }
  }, [user?.plan])

  useEffect(() => {
    if (!user?.subscriptionId) return
    let active = true
    ;(async () => {
      try {
        const s = await getSubscriptionStatus(user.subscriptionId)
        if (!active) return
        setSubStatus(s)
        if (!ACTIVE.includes(s.status) && current) await setPlan('free')
      } catch { /* non-blocking */ }
    })()
    return () => { active = false }
  }, [user?.subscriptionId])

  const subscribe = async (planId) => {
    setBusy(planId); setErr('')
    try {
      await startPlanCheckout({ plan: planId, interval: annual ? 'year' : 'month', email: user?.email, userId: user?.id })
    } catch (e) { setErr((e && e.message) || 'Could not start checkout.'); setBusy('') }
  }
  const manage = async () => {
    setPortalLoading(true); setErr('')
    try { await openBillingPortal(user?.stripeCustomerId) }
    catch (e) { setErr((e && e.message) || 'Could not open the billing portal.'); setPortalLoading(false) }
  }

  return (
    <>
      <PageHeader title="Billing" subtitle="Manage your plan and payment method." />

      {notice === 'success' && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} /> You're subscribed — your monthly reports are unlocked.</span>
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

      {current ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-500">Current plan</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-ink-900"><Sparkles size={20} className="text-brand-600" /> {current.name}</p>
              </div>
              <span className={`badge ${subStatus && subStatus.cancelAtPeriodEnd ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <Check size={12} /> {subStatus && subStatus.cancelAtPeriodEnd ? 'Ending' : 'Active'}
              </span>
            </div>

            {/* Usage meter */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">Reports this month</span>
                <span className="font-semibold text-ink-900">{monthUsed == null ? '…' : monthUsed} / {cap}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, Math.round(((monthUsed || 0) / cap) * 100))}%` }} />
              </div>
              {subStatus && subStatus.currentPeriodEnd && (
                <p className="mt-2 text-xs text-ink-400">
                  {subStatus.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} {dateFmt(new Date(subStatus.currentPeriodEnd * 1000).toISOString())}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={manage} disabled={portalLoading || !user?.stripeCustomerId} className="btn-secondary">
                <Settings size={16} /> {portalLoading ? 'Opening…' : 'Manage subscription'}
              </button>
              <Link to="/pricing" className="btn-ghost">Compare plans</Link>
            </div>
            <p className="mt-3 text-xs text-ink-400">Change plan, update your card, download invoices, or cancel anytime in the secure Stripe portal.</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-ink-900">Payment</h3>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-ink-50 p-4">
              <ShieldCheck size={22} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-sm text-ink-600">Card details are handled securely by Stripe — PropScope never sees or stores your card number.</p>
            </div>
            <button onClick={manage} disabled={portalLoading || !user?.stripeCustomerId} className="btn-secondary mt-4 w-full">
              <Settings size={16} /> {portalLoading ? 'Opening…' : 'Manage payment & billing'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <Sparkles size={16} /> You're on the free plan — your first report was on us. Choose a plan to keep analyzing deals.
          </div>

          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-ink-100 p-1 text-sm font-semibold">
              <button type="button" onClick={() => setAnnual(false)} className={`rounded-full px-4 py-1.5 transition ${!annual ? 'bg-white text-ink-900 shadow' : 'text-ink-500'}`}>Monthly</button>
              <button type="button" onClick={() => setAnnual(true)} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${annual ? 'bg-white text-ink-900 shadow' : 'text-ink-500'}`}>Annual <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">Save 20%</span></button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const price = annual ? p.annualMonthly : p.monthly
              return (
                <div key={p.id} className={`relative flex h-full flex-col rounded-2xl p-6 ${p.highlight ? 'bg-ink-900 text-white ring-2 ring-brand-500' : 'card'}`}>
                  {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-brand-500 text-white"><Sparkles size={12} /> Most popular</span>}
                  <h3 className={`text-lg font-bold ${p.highlight ? 'text-white' : 'text-ink-900'}`}>{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    {annual && <span className="mr-1 text-base font-semibold text-ink-400 line-through">{usd(p.monthly)}</span>}
                    <span className={`text-3xl font-extrabold ${p.highlight ? 'text-white' : 'text-ink-900'}`}>{usd(price)}</span>
                    <span className="text-sm text-ink-400">/mo</span>
                  </div>
                  <p className={`mt-1 text-xs ${annual ? 'font-semibold text-emerald-600' : 'text-ink-400'}`}>{annual ? `Billed ${usd(p.annualTotal)}/yr — save ${usd(p.annualSaved)}` : 'Billed monthly'}</p>
                  <p className={`mt-2 text-sm font-semibold ${p.highlight ? 'text-brand-300' : 'text-brand-700'}`}>{p.reportsPerMonth} reports / month</p>
                  <button onClick={() => subscribe(p.id)} disabled={!!busy} className={`mt-5 w-full ${p.highlight ? 'btn bg-emerald-500 text-white hover:bg-emerald-400' : 'btn-primary'}`}>
                    {busy === p.id ? 'Redirecting…' : p.cta}
                  </button>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-center text-xs text-ink-400">Need more than 250 reports a month? <a className="text-brand-600 underline" href="mailto:support@getpropscope.com?subject=PropScope%20Enterprise">Contact us about Enterprise</a>.</p>
        </>
      )}

      <div className="mt-8 card p-6">
        <h3 className="font-semibold text-ink-900">Billing history</h3>
        <p className="mt-3 text-sm text-ink-500">
          {current ? 'Your invoices and receipts are available in the Stripe billing portal.' : 'No charges yet. Your invoices will appear here once you subscribe.'}
        </p>
      </div>
    </>
  )
}
