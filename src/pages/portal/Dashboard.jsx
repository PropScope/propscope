import { Link } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { FilePlus2, TrendingUp, FileBarChart2, DollarSign, CheckCircle2, Clock, FileText, Receipt } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import ReportCard from '../../components/portal/ReportCard.jsx'
import Stat from '../../components/ui/Stat.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { SAMPLE_REPORTS, ACTIVITY } from '../../lib/mockData.js'
import { usd } from '../../lib/format.js'

const trend = [
  { m: 'Jan', deals: 4 }, { m: 'Feb', deals: 7 }, { m: 'Mar', deals: 6 },
  { m: 'Apr', deals: 11 }, { m: 'May', deals: 9 }, { m: 'Jun', deals: 14 },
]

const iconFor = { complete: CheckCircle2, submit: FileText, billing: Receipt }

export default function Dashboard() {
  const { user } = useAuth()
  const completed = SAMPLE_REPORTS.filter((r) => r.status === 'complete')
  const avgScore = Math.round(completed.reduce((a, r) => a + r.score, 0) / completed.length)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="Here's what's happening across your deals."
        action={<Link to="/app/new" className="btn-primary"><FilePlus2 size={16} /> New analysis</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reports this month" value="14" sub="+56% vs. last month" tone="brand" />
        <Stat label="Avg. PropScope Score" value={`${avgScore}/100`} sub="Across completed deals" />
        <Stat label="Best flip profit" value={usd(38600)} sub="4821 Maple Grove Dr" tone="positive" />
        <Stat label="Active strategy" value="BRRRR" sub="Most-used this month" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink-900">Deals analyzed</h3>
            <span className="badge bg-emerald-100 text-emerald-700"><TrendingUp size={12} /> Trending up</span>
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
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Area type="monotone" dataKey="deals" stroke="#213f66" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Recent activity</h3>
          <ul className="mt-4 space-y-4">
            {ACTIVITY.map((a) => {
              const Icon = iconFor[a.type] || Clock
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon size={15} /></span>
                  <div className="text-sm">
                    <p className="text-ink-700">{a.text}</p>
                    <p className="text-xs text-ink-400">{a.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink-900">Recent reports</h3>
        <Link to="/app/reports" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_REPORTS.slice(0, 3).map((r) => <ReportCard key={r.id} r={r} />)}
      </div>
    </>
  )
}
