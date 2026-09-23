import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Target, Lock, Loader2, ArrowRight, Wallet, TrendingUp } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import Stat from '../../components/ui/Stat.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { listReports } from '../../lib/reports.js'
import { recompute } from '../../lib/underwrite.js'
import { usd, compactUsd, pct } from '../../lib/format.js'

const n = (v) => Number(v) || 0
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
const xfmt = (v) => `${(Number(v) || 0).toFixed(2)}×`

export default function Portfolio() {
  const { user } = useAuth()
  const isInvestorPro = user?.plan === 'investor-pro'
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInvestorPro) { setLoading(false); return }
    let active = true
    ;(async () => {
      try { const data = await listReports(); if (active) setReports(data) }
      catch (e) { if (active) setReports([]) }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [isInvestorPro])

  const rows = useMemo(() => (
    reports
      .filter((r) => r.status !== 'generating')
      .map((r) => {
        const uw = recompute({
          purchasePrice: n(r.purchasePrice), arv: n(r.arv), rehab: n(r.rehab), monthlyRent: n(r.monthlyRent),
          rate: r.rate, downPct: r.downPct, termYears: r.termYears, expenseRatio: r.expenseRatio,
        })
        return { r, uw, onTarget: uw.monthlyCashFlow >= 0 && uw.dscr >= 1.25 }
      })
  ), [reports])

  const agg = useMemo(() => ({
    count: rows.length,
    onTarget: rows.filter((x) => x.onTarget).length,
    avgScore: Math.round(avg(rows.map((x) => n(x.r.score)).filter((s) => s > 0))),
    totalCashFlow: rows.reduce((a, x) => a + x.uw.monthlyCashFlow, 0),
    totalValueCreated: rows.reduce((a, x) => a + x.uw.valueCreated, 0),
    totalCashInvested: rows.reduce((a, x) => a + x.uw.cashInvested, 0),
    avgCap: avg(rows.map((x) => x.uw.capRate)),
    avgCoC: avg(rows.map((x) => x.uw.cashOnCash)),
    avgDscr: avg(rows.map((x) => x.uw.dscr)),
  }), [rows])

  const verdicts = useMemo(() => {
    const c = { Strong: 0, Moderate: 0, Thin: 0 }
    rows.forEach((x) => { if (c[x.r.verdict] != null) c[x.r.verdict]++ })
    return c
  }, [rows])

  // Gate: Investor Pro only.
  if (!isInvestorPro) return (
    <>
      <PageHeader title="Portfolio" subtitle="Your entire book of deals in one view." />
      <div className="card grid place-items-center px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-500"><Lock size={26} /></span>
        <h3 className="mt-4 text-lg font-semibold text-ink-900">The Portfolio dashboard is an Investor Pro feature</h3>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          Roll up every deal you've analyzed into one place — total cash flow, equity created, average returns, and how many
          of your deals actually hit target. Built for investors managing a whole book, not one deal at a time.
        </p>
        <Link to="/app/billing" className="btn-primary mt-6">Upgrade to Investor Pro <ArrowRight size={16} /></Link>
      </div>
    </>
  )

  if (loading) return (
    <>
      <PageHeader title="Portfolio" subtitle="Your entire book of deals in one view." />
      <div className="card grid place-items-center py-24 text-center">
        <Loader2 size={36} className="animate-spin text-brand-600" />
        <p className="mt-3 text-ink-500">Building your portfolio…</p>
      </div>
    </>
  )

  if (agg.count === 0) return (
    <>
      <PageHeader title="Portfolio" subtitle="Your entire book of deals in one view." />
      <div className="card grid place-items-center py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Building2 size={26} /></span>
        <h3 className="mt-4 text-lg font-semibold text-ink-900">No deals yet</h3>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Run a few analyses and they'll roll up here into a portfolio view.</p>
        <Link to="/app/new" className="btn-primary mt-6">New analysis <ArrowRight size={16} /></Link>
      </div>
    </>
  )

  const vBadge = { Strong: 'bg-emerald-50 text-emerald-700', Moderate: 'bg-amber-50 text-amber-700', Thin: 'bg-rose-50 text-rose-700' }

  return (
    <>
      <PageHeader title="Portfolio" subtitle={`${agg.count} ${agg.count === 1 ? 'deal' : 'deals'} analyzed — rolled up into one view.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Properties analyzed" value={String(agg.count)} sub="In your book" tone="brand" />
        <Stat label="Deals on target" value={`${agg.onTarget} of ${agg.count}`} sub="Positive cash flow + DSCR ≥ 1.25" tone="positive" />
        <Stat label="Total monthly cash flow" value={usd(agg.totalCashFlow)} sub="If every deal were held" tone="positive" />
        <Stat label="Total equity created" value={compactUsd(agg.totalValueCreated)} sub={`Over ${compactUsd(agg.totalCashInvested)} invested`} tone="positive" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Avg. PropScope Score" value={`${agg.avgScore}/100`} sub="Across your deals" />
        <Stat label="Avg. cap rate" value={pct(agg.avgCap)} sub="Target 5.5%+" />
        <Stat label="Avg. cash-on-cash" value={pct(agg.avgCoC)} sub="Target 8%+" />
        <Stat label="Avg. DSCR" value={xfmt(agg.avgDscr)} sub="Target 1.25+" />
      </div>

      {/* Deal quality mix */}
      <div className="mt-6 card p-6">
        <h3 className="flex items-center gap-2 font-semibold text-ink-900"><Target size={18} className="text-brand-600" /> Deal quality mix</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {['Strong', 'Moderate', 'Thin'].map((v) => (
            <div key={v} className="flex items-center gap-2 rounded-xl border border-ink-100 px-4 py-2.5">
              <span className={`badge ${vBadge[v]}`}>{v}</span>
              <span className="text-lg font-bold text-ink-900">{verdicts[v]}</span>
              <span className="text-xs text-ink-400">{agg.count ? Math.round((verdicts[v] / agg.count) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings table */}
      <div className="mt-6 card p-6">
        <h3 className="flex items-center gap-2 font-semibold text-ink-900"><Wallet size={18} className="text-brand-600" /> All deals</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="py-2 font-medium">Property</th>
                <th className="py-2 text-right font-medium">Score</th>
                <th className="py-2 text-right font-medium">Cap</th>
                <th className="py-2 text-right font-medium">CoC</th>
                <th className="py-2 text-right font-medium">DSCR</th>
                <th className="py-2 text-right font-medium">Monthly CF</th>
                <th className="py-2 text-right font-medium">Equity created</th>
                <th className="py-2 text-right font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {rows.map(({ r, uw }) => (
                <tr key={r.id} className="group">
                  <td className="py-3">
                    <Link to={`/app/reports/${r.id}`} className="font-medium text-ink-800 group-hover:text-brand-700">{r.address}</Link>
                    <div className="text-xs text-ink-400">{[r.city, r.state].filter(Boolean).join(', ')}</div>
                  </td>
                  <td className="py-3 text-right tabular-nums text-ink-700">{n(r.score)}</td>
                  <td className="py-3 text-right tabular-nums text-ink-700">{pct(uw.capRate)}</td>
                  <td className="py-3 text-right tabular-nums text-ink-700">{pct(uw.cashOnCash)}</td>
                  <td className="py-3 text-right tabular-nums text-ink-700">{xfmt(uw.dscr)}</td>
                  <td className={`py-3 text-right font-semibold tabular-nums ${uw.monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{usd(uw.monthlyCashFlow)}</td>
                  <td className="py-3 text-right tabular-nums text-ink-700">{usd(uw.valueCreated)}</td>
                  <td className="py-3 text-right"><span className={`badge ${vBadge[r.verdict] || 'bg-ink-100 text-ink-500'}`}>{r.verdict || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-ink-400">
        Rolled up from reports you've already run — no new reports are generated here. Figures use standard financing where a deal has no custom terms.
      </p>
    </>
  )
}
