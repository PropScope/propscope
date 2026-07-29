import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'
import {
  ArrowLeft, ArrowRight, MapPin, Download, Share2, Loader2, TrendingUp, AlertTriangle, FileText,
} from 'lucide-react'
import ScoreRing from '../../components/ui/ScoreRing.jsx'
import Stat from '../../components/ui/Stat.jsx'
import { reportDetail } from '../../lib/mockData.js'
import { getReport, listReports } from '../../lib/reports.js'
import { downloadInvestorReport, downloadSellerSummary } from '../../lib/pdf.js'
import { planById } from '../../lib/plans.js'
import { usd, pct } from '../../lib/format.js'

const riskTone = { Low: 'text-emerald-600 bg-emerald-50', Medium: 'text-amber-600 bg-amber-50', High: 'text-rose-600 bg-rose-50' }

const VERDICT_BANNER = {
  Strong:   { wrap: 'bg-emerald-50', icon: 'text-emerald-600', title: 'text-emerald-800', body: 'text-emerald-700', Icon: TrendingUp,
    msg: 'the numbers support moving forward. Watch rehab scope — it is the biggest swing factor.' },
  Moderate: { wrap: 'bg-amber-50', icon: 'text-amber-600', title: 'text-amber-800', body: 'text-amber-700', Icon: AlertTriangle,
    msg: 'the margins are workable but leave little cushion. Tighten your rehab bids and re-verify comps before committing.' },
  Thin:     { wrap: 'bg-rose-50', icon: 'text-rose-600', title: 'text-rose-800', body: 'text-rose-700', Icon: AlertTriangle,
    msg: 'the spread is tight with little room for error. Proceed only on conservative numbers — otherwise pass.' },
}

const n = (v) => Number(v) || 0

export default function ReportDetail() {
  const { id } = useParams()
  const [r, setR] = useState(null)
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const [one, list] = await Promise.all([getReport(id), listReports()])
        if (!active) return
        setR(one); setAll(list)
      } catch (err) {
        if (active) setError((err && err.message) || 'Could not load this report.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  if (loading) return (
    <>
      <Back />
      <div className="card grid place-items-center py-24 text-center">
        <Loader2 size={36} className="animate-spin text-brand-600" />
        <p className="mt-3 text-ink-500">Loading report…</p>
      </div>
    </>
  )

  if (error || !r) return (
    <div className="card grid place-items-center py-20 text-center">
      <p className="text-ink-500">{error || 'Report not found.'}</p>
      <Link to="/app/reports" className="btn-secondary mt-4"><ArrowLeft size={16} /> Back to reports</Link>
    </div>
  )

  const tier = planById(r.tier)
  const d = reportDetail(r)
  const vb = VERDICT_BANNER[r.verdict] || VERDICT_BANNER.Moderate
  const mao = Math.round(n(r.arv) * 0.7 - n(r.rehab))
  const idx = all.findIndex((x) => x.id === r.id)
  const prev = idx > 0 ? all[idx - 1] : null
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
  const position = idx >= 0 ? idx + 1 : 1
  const total = all.length || 1
  const bestStrategy = d.strategies.slice().sort((a, b) => n(b.roi) - n(a.roi))[0]

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/app/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
          <ArrowLeft size={16} /> Back to reports
        </Link>
        <div className="flex items-center gap-2">
          {prev ? (
            <Link to={`/app/reports/${prev.id}`} className="btn-secondary px-3" title={`Prev: ${prev.address}`}>
              <ArrowLeft size={16} /><span className="hidden sm:inline">Prev</span>
            </Link>
          ) : (
            <span className="btn-secondary px-3 cursor-default opacity-40"><ArrowLeft size={16} /><span className="hidden sm:inline">Prev</span></span>
          )}
          <span className="px-1 text-xs text-ink-400">{position} of {total}</span>
          {next ? (
            <Link to={`/app/reports/${next.id}`} className="btn-secondary px-3" title={`Next: ${next.address}`}>
              <span className="hidden sm:inline">Next</span><ArrowRight size={16} />
            </Link>
          ) : (
            <span className="btn-secondary px-3 cursor-default opacity-40"><span className="hidden sm:inline">Next</span><ArrowRight size={16} /></span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="card mb-6 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ background: r.thumb || '#213f66' }}>
              <MapPin size={24} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-ink-900">{r.address}</h1>
              <p className="text-sm text-ink-500">{r.city}, {r.state} {r.zip}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-ink-100 text-ink-600">{tier?.name}</span>
                <span className="badge bg-brand-50 text-brand-700">{r.strategy}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <ScoreRing score={n(r.score)} size={72} />
              <p className="mt-1 text-xs font-medium text-ink-500">PropScope Score</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => downloadInvestorReport(r)} className="btn-primary"><Download size={16} /> PDF</button>
              <button className="btn-secondary"><Share2 size={16} /> Share</button>
            </div>
          </div>
        </div>

        <div className={`mt-5 flex items-start gap-3 rounded-xl ${vb.wrap} p-4`}>
          <vb.Icon size={20} className={`mt-0.5 shrink-0 ${vb.icon}`} />
          <div>
            <p className={`font-semibold ${vb.title}`}>Verdict: {r.verdict}{bestStrategy ? ` — best played as ${bestStrategy.name}` : ''}</p>
            <p className={`mt-0.5 text-sm ${vb.body}`}>
              At {usd(n(r.purchasePrice))} in with {usd(n(r.rehab))} rehab against a {usd(n(r.arv))} ARV, {vb.msg}
            </p>
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Purchase price" value={usd(n(r.purchasePrice))} />
        <Stat label="After-repair value" value={usd(n(r.arv))} tone="brand" />
        <Stat label="Rehab estimate" value={usd(n(r.rehab))} />
        <Stat label="Max allowable offer" value={usd(mao)} />
        <Stat label="Monthly rent" value={usd(n(r.monthlyRent))} />
        <Stat label="Monthly cash flow" value={usd(n(r.monthlyCashFlow))} tone="positive" />
        <Stat label="Cap rate" value={pct(n(r.capRate))} />
        <Stat label="Cash-on-cash" value={pct(n(r.cashOnCash))} tone="positive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Strategy comparison */}
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Strategy comparison</h3>
          <p className="text-sm text-ink-500">Return on investment by exit strategy.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.strategies} margin={{ left: -18, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => [`${v}%`, 'ROI']} />
                <Bar dataKey="roi" radius={[6, 6, 0, 0]}>
                  {d.strategies.map((s, i) => (
                    <Cell key={i} fill={i === 2 ? '#213f66' : '#829ac2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5yr cash flow */}
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Projected annual cash flow</h3>
          <p className="text-sm text-ink-500">Buy & hold, 5-year horizon.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.cashflow} margin={{ left: -8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => [usd(v), 'Cash flow']} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Comps */}
        <div className="card p-6 lg:col-span-3">
          <h3 className="font-semibold text-ink-900">Comparable sales</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-2 font-medium">Address</th>
                  <th className="py-2 font-medium">Sold</th>
                  <th className="py-2 font-medium">Sqft</th>
                  <th className="py-2 font-medium">Bed/Bath</th>
                  <th className="py-2 font-medium">Dist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {d.comps.map((c, i) => (
                  <tr key={c.address || i}>
                    <td className="py-2.5 font-medium text-ink-800">{c.address}</td>
                    <td className="py-2.5 text-ink-700">{usd(n(c.sold))}</td>
                    <td className="py-2.5 text-ink-500">{n(c.sqft).toLocaleString()}</td>
                    <td className="py-2.5 text-ink-500">{c.beds}/{c.baths}</td>
                    <td className="py-2.5 text-ink-500">{c.dist} mi</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900"><AlertTriangle size={18} className="text-amber-500" /> Risk profile</h3>
          <ul className="mt-4 space-y-3">
            {d.risks.map((rk, i) => (
              <li key={rk.label || i} className="flex items-center justify-between">
                <span className="text-sm text-ink-600">{rk.label}</span>
                <span className={`badge ${riskTone[rk.level] || 'text-ink-500 bg-ink-50'}`}>{rk.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rehab budget */}
      <div className="mt-6 card p-6">
        <h3 className="font-semibold text-ink-900">Rehab budget</h3>
        <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {d.rehab.map((item, i) => (
            <div key={item.item || i} className="flex items-center justify-between border-b border-ink-50 py-2 text-sm">
              <span className="text-ink-600">{item.item}</span>
              <span className="font-semibold text-ink-900">{usd(n(item.cost))}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
          <span className="font-semibold text-ink-700">Total rehab estimate</span>
          <span className="text-lg font-bold text-ink-900">{usd(d.rehab.reduce((a, b) => a + n(b.cost), 0))}</span>
        </div>
      </div>

      {/* Seller Summary — plain-English, buyer-to-seller rationale */}
      <div className="mt-6 card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900"><FileText size={18} className="text-brand-600" /> Seller Summary — how we reached our offer</h3>
          <button onClick={() => downloadSellerSummary(r)} className="btn-secondary"><Download size={16} /> Seller PDF</button>
        </div>
        <p className="mt-1 text-sm text-ink-500">A plain-English page you can share with the seller — the offer, and the numbers behind it.</p>

        <p className="mt-4 text-sm leading-relaxed text-ink-700">
          Fully renovated, this home would be worth about <span className="font-semibold text-ink-900">{usd(n(r.arv))}</span>, based on
          recent sales of similar nearby homes. In its current condition it needs an estimated
          <span className="font-semibold text-ink-900"> {usd(n(r.rehab))}</span> in repairs and updates. After that work, holding and
          closing costs, and a modest return, our offer comes to <span className="font-semibold text-emerald-700">{usd(mao)}</span>.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-400">After-repair value</p><p className="mt-1 font-bold text-ink-900">{usd(n(r.arv))}</p><p className="mt-0.5 text-xs text-ink-400">from recent comps</p></div>
          <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-400">Estimated repairs</p><p className="mt-1 font-bold text-ink-900">{usd(n(r.rehab))}</p><p className="mt-0.5 text-xs text-ink-400">to reach that value</p></div>
          <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Our offer</p><p className="mt-1 font-bold text-emerald-800">{usd(mao)}</p><p className="mt-0.5 text-xs text-emerald-600">fair &amp; evidence-based</p></div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-ink-700">Comparable sales this is based on</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {d.comps.map((c, i) => (
              <div key={c.address || i} className="flex items-center justify-between rounded-lg ring-1 ring-ink-100 px-3 py-2 text-sm">
                <span className="text-ink-600">{c.address}</span>
                <span className="font-semibold text-ink-900">{usd(n(c.sold))}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-ink-400">Figures are estimates to support discussion — not a formal appraisal.</p>
      </div>

      {tier?.id === 'deal-intelligence' && (
        <div className="mt-6 card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900"><FileText size={18} className="text-brand-600" /> Executive memo</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
            {r.memo || `${r.address} presents a ${String(r.verdict || '').toLowerCase()} opportunity in the ${r.city} submarket. Acquired at ${usd(n(r.purchasePrice))} with a ${usd(n(r.rehab))} renovation, the property reaches an after-repair value of ${usd(n(r.arv))}. Primary risk is rehab scope creep; lock contractor bids before close. Recommendation: proceed at or below the max allowable offer of ${usd(mao)}.`}
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-ink-400">
        Estimates for informational purposes only. Verify all figures before making an offer. Not financial advice.
      </p>
    </>
  )
}

function Back() {
  return (
    <Link to="/app/reports" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
      <ArrowLeft size={16} /> Back to reports
    </Link>
  )
}
