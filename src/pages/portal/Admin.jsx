import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Loader2, ShieldAlert } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import Stat from '../../components/ui/Stat.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { isAdmin, getAdminOverview } from '../../lib/admin.js'
import { usd, dateFmt } from '../../lib/format.js'
import { planById } from '../../lib/plans.js'

const TIER_LABEL = { 'deal-check': 'Deal Check', 'deal-analyzer': 'Deal Analyzer', 'deal-intelligence': 'Deal Intelligence' }
const verdictTone = { Strong: 'text-emerald-600', Moderate: 'text-amber-600', Thin: 'text-rose-600' }

function MiniBars({ data }) {
  return (
    <div className="mt-4 h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -22, right: 4, top: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} stroke="#94a3b8" interval={5} />
          <YAxis tickLine={false} axisLine={false} fontSize={10} stroke="#94a3b8" allowDecimals={false} width={26} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
          <Bar dataKey="count" fill="#213f66" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!admin) { setLoading(false); return }
    let active = true
    ;(async () => {
      try { const data = await getAdminOverview(); if (active) setD(data) }
      catch (e) { if (active) setErr((e && e.message) || 'Could not load admin data.') }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [admin])

  if (!admin) return (
    <>
      <PageHeader title="Admin" subtitle="Founder overview." />
      <div className="card grid place-items-center py-20 text-center">
        <ShieldAlert size={26} className="text-amber-500" />
        <p className="mt-3 font-medium text-ink-700">Not authorized</p>
        <p className="mt-1 text-sm text-ink-500">This area is restricted to PropScope administrators.</p>
      </div>
    </>
  )

  if (loading) return (
    <>
      <PageHeader title="Admin" subtitle="Founder overview." />
      <div className="card grid place-items-center py-20 text-center">
        <Loader2 size={26} className="animate-spin text-brand-600" />
        <p className="mt-3 text-ink-500">Loading admin data…</p>
      </div>
    </>
  )

  if (err) return (
    <>
      <PageHeader title="Admin" subtitle="Founder overview." />
      <div className="card grid place-items-center py-20 text-center">
        <p className="text-rose-600">{err}</p>
        <p className="mt-1 text-xs text-ink-400">If this mentions a missing key, add SUPABASE_SERVICE_ROLE_KEY in Vercel and redeploy.</p>
      </div>
    </>
  )

  const tiers = d.reportsByTier || {}
  const s = d.stripe

  return (
    <>
      <PageHeader title="Admin" subtitle="Your daily business dashboard — everything across PropScope." />

      {/* KPIs with deltas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={String(d.totalUsers ?? 0)} sub={`+${d.usersToday ?? 0} today · +${d.usersWeek ?? 0} this week`} tone="brand" />
        <Stat label="Total reports" value={String(d.totalReports ?? 0)} sub={`+${d.reportsToday ?? 0} today · +${d.reportsWeek ?? 0} this week`} />
        <Stat label="MRR" value={usd(d.mrr ?? 0)} sub={d.mrrIsReal ? 'live from Stripe' : 'estimated'} tone="positive" />
        <Stat label="Revenue this month" value={usd(s ? s.revenueThisMonth : 0)} sub={s ? `${s.activeSubs} active subscriptions` : 'connect Stripe to see'} />
      </div>

      {/* Trends */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">New signups <span className="text-sm font-normal text-ink-400">· last 30 days</span></h3>
          <MiniBars data={d.signupsSeries || []} />
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Reports generated <span className="text-sm font-normal text-ink-400">· last 30 days</span></h3>
          <MiniBars data={d.reportsSeries || []} />
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Verdict mix</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {['Strong', 'Moderate', 'Thin'].map((v) => (
              <li key={v} className="flex items-center justify-between">
                <span className={verdictTone[v]}>{v}</span>
                <span className="font-semibold text-ink-900">{(d.verdictMix && d.verdictMix[v]) || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Engagement</h3>
          <p className="mt-4 text-3xl font-bold text-ink-900">{d.avgScore ?? 0}<span className="text-lg text-ink-400">/100</span></p>
          <p className="text-sm text-ink-500">Average PropScope Score</p>
          <p className="mt-4 text-sm text-ink-600">
            <span className="font-semibold text-ink-900">{d.activation ? d.activation.withReport : 0}</span> of{' '}
            <span className="font-semibold text-ink-900">{d.activation ? d.activation.total : 0}</span> users have run a report
          </p>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Subscriptions</h3>
          {s ? (
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between"><span className="text-ink-600">Active</span><span className="font-semibold text-emerald-600">{s.activeSubs}</span></li>
              <li className="flex items-center justify-between"><span className="text-ink-600">Canceled</span><span className="font-semibold text-rose-600">{s.canceledSubs}</span></li>
              <li className="flex items-center justify-between"><span className="text-ink-600">Pro (in app)</span><span className="font-semibold text-ink-900">{d.proUsers}</span></li>
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-500">Live subscription data appears once Stripe is connected.</p>
          )}
        </div>
      </div>

      {/* Markets + payments */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Top markets</h3>
          {d.topMarkets && d.topMarkets.length ? (
            <ul className="mt-4 space-y-3 text-sm">
              {d.topMarkets.map((m) => (
                <li key={m.market} className="flex items-center justify-between">
                  <span className="text-ink-600">{m.market}</span>
                  <span className="font-semibold text-ink-900">{m.count}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-ink-500">No reports yet.</p>}
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-ink-900">Recent payments</h3>
          {s && s.recentPayments && s.recentPayments.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="py-2 font-medium">Customer</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {s.recentPayments.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-ink-700">{p.email || '—'}</td>
                      <td className="py-2.5 font-semibold text-ink-900">{usd(p.amount)}</td>
                      <td className="py-2.5 text-right text-ink-500">{dateFmt(new Date(p.created).toISOString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="mt-4 text-sm text-ink-500">Payments will appear here once customers check out.</p>}
        </div>
      </div>

      {/* Tiers + recent signups */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Reports by tier</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {['deal-check', 'deal-analyzer', 'deal-intelligence'].map((t) => (
              <li key={t} className="flex items-center justify-between">
                <span className="text-ink-600">{TIER_LABEL[t]}</span>
                <span className="font-semibold text-ink-900">{tiers[t] || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-ink-900">Recent signups</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Plan</th>
                  <th className="py-2 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {(d.recentUsers || []).map((u, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-medium text-ink-800">{u.email}</td>
                    <td className="py-2.5 text-ink-500">{planById(u.plan)?.name || u.plan}</td>
                    <td className="py-2.5 text-right text-ink-500">{dateFmt(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="mt-6 card p-6">
        <h3 className="font-semibold text-ink-900">Recent reports</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="py-2 font-medium">Property</th>
                <th className="py-2 font-medium">Tier</th>
                <th className="py-2 font-medium">Verdict</th>
                <th className="py-2 font-medium">Score</th>
                <th className="py-2 font-medium text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {(d.recentReports || []).map((r, i) => (
                <tr key={i}>
                  <td className="py-2.5 font-medium text-ink-800">{r.address}</td>
                  <td className="py-2.5 text-ink-500">{TIER_LABEL[r.tier] || r.tier}</td>
                  <td className={`py-2.5 font-medium ${verdictTone[r.verdict] || 'text-ink-500'}`}>{r.verdict}</td>
                  <td className="py-2.5 text-ink-700">{r.score}</td>
                  <td className="py-2.5 text-right text-ink-500">{dateFmt(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
