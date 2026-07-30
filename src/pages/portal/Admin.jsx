import { useState, useEffect } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import Stat from '../../components/ui/Stat.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { isAdmin, getAdminOverview } from '../../lib/admin.js'
import { usd, dateFmt } from '../../lib/format.js'
import { planById } from '../../lib/plans.js'

const TIER_LABEL = { 'deal-check': 'Deal Check', 'deal-analyzer': 'Deal Analyzer', 'deal-intelligence': 'Deal Intelligence' }
const verdictTone = { Strong: 'text-emerald-600', Moderate: 'text-amber-600', Thin: 'text-rose-600' }

export default function Admin() {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!admin) { setLoading(false); return }
    let active = true
    ;(async () => {
      try { const d = await getAdminOverview(); if (active) setData(d) }
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

  const tiers = data.reportsByTier || {}

  return (
    <>
      <PageHeader title="Admin" subtitle="Founder overview — everything across PropScope." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={String(data.totalUsers ?? 0)} tone="brand" />
        <Stat label="Pro subscribers" value={String(data.proUsers ?? 0)} sub="Investor Pro" tone="positive" />
        <Stat label="Est. MRR" value={usd(data.mrr ?? 0)} sub="From Pro subs" />
        <Stat label="Total reports" value={String(data.totalReports ?? 0)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Reports by tier</h3>
          <ul className="mt-4 space-y-3">
            {['deal-check', 'deal-analyzer', 'deal-intelligence'].map((t) => (
              <li key={t} className="flex items-center justify-between text-sm">
                <span className="text-ink-600">{TIER_LABEL[t]}</span>
                <span className="font-semibold text-ink-900">{tiers[t] || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-ink-900">Recent signups</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[380px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Plan</th>
                  <th className="py-2 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {(data.recentUsers || []).map((u, i) => (
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
              {(data.recentReports || []).map((r, i) => (
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
