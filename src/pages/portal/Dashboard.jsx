import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { FilePlus2, TrendingUp, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import ReportCard from '../../components/portal/ReportCard.jsx'
import Stat from '../../components/ui/Stat.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { listReports } from '../../lib/reports.js'
import { usd } from '../../lib/format.js'

const n = (v) => Number(v) || 0
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const then = new Date(dateStr).getTime()
  const days = Math.floor((Date.now() - then) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listReports()
        if (active) setReports(data)
      } catch (e) {
        if (active) setReports([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const stats = useMemo(() => {
    const count = reports.length
    const scores = reports.map((r) => n(r.score)).filter((s) => s > 0)
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const bestFlip = reports.reduce((best, r) => (n(r.profitFlip) > n(best.profitFlip) ? r : best), { profitFlip: 0 })
    const stratCounts = {}
    reports.forEach((r) => { if (r.strategy) stratCounts[r.strategy] = (stratCounts[r.strategy] || 0) + 1 })
    const activeStrategy = Object.entries(stratCounts).sort((a, b) => b[1] - a[1])[0]
    return { count, avgScore, bestFlip, activeStrategy: activeStrategy ? activeStrategy[0] : '—' }
  }, [reports])

  const trend = useMemo(() => {
    const now = new Date()
    const buckets = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, m: MONTHS[d.getMonth()], deals: 0 })
    }
    const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
    reports.forEach((r) => {
      const d = new Date(r.createdAt || r.created_at)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (byKey[key]) byKey[key].deals += 1
    })
    return buckets
  }, [reports])

  const thisMonth = trend.length ? trend[trend.length - 1].deals : 0

  if (loading) return (
    <>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Here's what's happening across your deals." />
      <div className="card grid place-items-center py-24 text-center">
        <Loader2 size={36} className="animate-spin text-brand-600" />
        <p className="mt-3 text-ink-500">Loading your dashboard…</p>
      </div>
    </>
  )

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what's happening across your deals."
        action={<Link to="/app/new" className="btn-primary"><FilePlus2 size={16} /> New analysis</Link>}
      />

      {reports.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><FilePlus2 size={26} /></span>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">Run your first deal analysis</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Enter a property address and PropScope builds a full report — ARV, rehab budget, comps, strategy comparison, and a verdict.
          </p>
          <Link to="/app/new" className="btn-primary mt-6"><FilePlus2 size={16} /> New analysis</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Reports this month" value={String(thisMonth)} sub={`${stats.count} total`} tone="brand" />
            <Stat label="Avg. PropScope Score" value={`${stats.avgScore}/100`} sub="Across your deals" />
            <Stat label="Best flip profit" value={usd(n(stats.bestFlip.profitFlip))} sub={stats.bestFlip.address || '—'} tone="positive" />
            <Stat label="Active strategy" value={stats.activeStrategy} sub="Most-used" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink-900">Deals analyzed</h3>
                <span className="badge bg-emerald-100 text-emerald-700"><TrendingUp size={12} /> Last 6 months</span>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#213f66" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#213f66" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Area type="monotone" dataKey="deals" stroke="#213f66" strokeWidth={2.5} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-ink-900">Recent activity</h3>
              <ul className="mt-4 space-y-4">
                {reports.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><CheckCircle2 size={15} /></span>
                    <div className="text-sm">
                      <p className="text-ink-700">Report generated: {r.address}</p>
                      <p className="text-xs text-ink-400">{timeAgo(r.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink-900">Recent reports</h3>
            <Link to="/app/reports" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 3).map((r) => <ReportCard key={r.id} r={r} />)}
          </div>
        </>
      )}
    </>
  )
}
