import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Lock, Layers, ArrowRight } from 'lucide-react'
import { recompute, grade, scenarioCompare } from '../../lib/underwrite.js'
import { usd, pct } from '../../lib/format.js'

const n = (v) => Number(v) || 0
const xfmt = (v) => `${(Number(v) || 0).toFixed(2)}×`
const rowFmt = (row) => (row.fmt === 'usd' ? usd(row.value) : row.fmt === 'pct' ? pct(row.value) : xfmt(row.value))

const PILL = {
  pass: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-amber-50 text-amber-700',
  fail: 'bg-rose-50 text-rose-700',
}
const PILL_TEXT = { pass: 'On target', warn: 'Close', fail: 'Below target' }

export default function FinancialBreakdown({ report, isPro }) {
  const [open, setOpen] = useState(true)
  const inp = {
    purchasePrice: n(report.purchasePrice), arv: n(report.arv),
    rehab: n(report.rehab), monthlyRent: n(report.monthlyRent),
    rate: report.rate, downPct: report.downPct, termYears: report.termYears, expenseRatio: report.expenseRatio,
  }
  const uw = recompute(inp)
  const rows = grade(uw)

  const deal = [
    ['Purchase price', usd(uw.purchasePrice)],
    ['Down payment', `${usd(uw.downPayment)} (${Math.round(uw.downPct * 100)}%)`],
    ['Loan amount', usd(uw.loan)],
    ['Interest rate', `${(uw.rate * 100).toFixed(2)}%`],
    ['Amortization', `${uw.termYears} years`],
    ['Rehab budget', usd(uw.rehab)],
    ['Closing costs (est.)', usd(uw.closingCosts)],
    ['After-repair value', usd(uw.arv)],
    ['Total cash invested', usd(uw.cashInvested)],
  ]

  const flow = [
    ['Gross monthly rent', usd(uw.monthlyRent), false],
    [`Operating expenses (~${Math.round(uw.expenseRatio * 100)}%)`, `– ${usd(uw.opexMonthly)}`, true],
    ['Net operating income (NOI)', usd(uw.noiMonthly), false],
    [`Mortgage P&I (${(uw.rate * 100).toFixed(2)}%, ${uw.termYears}-yr)`, `– ${usd(uw.piMonthly)}`, true],
  ]

  return (
    <>
      {/* Full financial breakdown — included on every plan */}
      <div className="mt-6 card overflow-hidden">
        <button onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between p-6 text-left">
          <span className="flex items-center gap-2 font-semibold text-ink-900">
            <Layers size={18} className="text-brand-600" /> Full financial breakdown
          </span>
          <ChevronDown size={18} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="px-6 pb-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Deal structure */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Deal structure</h4>
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {deal.map(([k, v]) => (
                      <tr key={k} className="border-b border-ink-50 last:border-0">
                        <td className="py-2 text-ink-600">{k}</td>
                        <td className="py-2 text-right font-semibold text-ink-900 tabular-nums">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Monthly cash-flow waterfall */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Monthly cash flow</h4>
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {flow.map(([k, v, neg]) => (
                      <tr key={k} className="border-b border-ink-50">
                        <td className="py-2 text-ink-600">{k}</td>
                        <td className={`py-2 text-right font-semibold tabular-nums ${neg ? 'text-ink-500' : 'text-ink-900'}`}>{v}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3 font-semibold text-ink-900">Net monthly cash flow</td>
                      <td className={`pt-3 text-right text-lg font-bold tabular-nums ${uw.monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {uw.monthlyCashFlow >= 0 ? '+ ' : '– '}{usd(Math.abs(uw.monthlyCashFlow))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Return metrics vs targets */}
            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-400">Return metrics vs. targets</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {rows.map((row) => (
                <div key={row.key} className="rounded-xl border border-ink-100 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{row.label}</p>
                  <p className="mt-1 text-xl font-bold text-ink-900 tabular-nums">{rowFmt(row)}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${PILL[row.status]}`}>{PILL_TEXT[row.status]}</span>
                  <p className="mt-1.5 text-[11px] text-ink-400">Target {row.target}</p>
                </div>
              ))}
            </div>

            {/* Position snapshot */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-ink-50 p-4">
                <p className="text-[11px] font-medium text-ink-400">Total cash invested</p>
                <p className="mt-1 text-lg font-bold text-ink-900 tabular-nums">{usd(uw.cashInvested)}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-4">
                <p className="text-[11px] font-medium text-ink-400">Annual NOI</p>
                <p className="mt-1 text-lg font-bold text-ink-900 tabular-nums">{usd(uw.noiAnnual)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-[11px] font-medium text-emerald-700">Value created over cost</p>
                <p className="mt-1 text-lg font-bold text-emerald-800 tabular-nums">{usd(uw.valueCreated)}</p>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-ink-400">
              Calculated with standard financing assumptions ({Math.round(uw.downPct * 100)}% down, {(uw.rate * 100).toFixed(2)}% rate,
              {' '}{uw.termYears}-yr loan, ~{Math.round(uw.expenseRatio * 100)}% operating expenses). Edit the numbers above to re-run with your own terms.
            </p>
          </div>
        )}
      </div>

      {/* Scenario compare — Deal Pro & Investor Pro */}
      {isPro ? <ScenarioCompare inp={inp} /> : <ScenarioLocked />}
    </>
  )
}

function ScenarioCompare({ inp }) {
  const { base, target, targetPrice, priceDelta } = scenarioCompare(inp)
  const rows = [
    ['Purchase price', usd(base.purchasePrice), usd(targetPrice)],
    ['Monthly cash flow', usd(base.monthlyCashFlow), usd(target.monthlyCashFlow)],
    ['Cash-on-cash', pct(base.cashOnCash), pct(target.cashOnCash)],
    ['Cap rate', pct(base.capRate), pct(target.capRate)],
    ['DSCR', xfmt(base.dscr), xfmt(target.dscr)],
    ['Value created', usd(base.valueCreated), usd(target.valueCreated)],
  ]
  return (
    <div className="mt-6 card p-6">
      <h3 className="flex items-center gap-2 font-semibold text-ink-900">
        <Layers size={18} className="text-brand-600" /> Scenario compare
        <span className="badge bg-brand-50 text-brand-700">Deal Pro</span>
      </h3>
      <p className="mt-1 text-sm text-ink-500">The deal as-listed vs. bought at your max allowable offer — the price that makes it work.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <th className="py-2 text-left font-medium">Metric</th>
              <th className="py-2 text-right font-medium">As listed</th>
              <th className="py-2 text-right font-medium text-emerald-700">At target price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {rows.map(([k, a, b]) => (
              <tr key={k}>
                <td className="py-2.5 text-ink-600">{k}</td>
                <td className="py-2.5 text-right font-semibold text-ink-800 tabular-nums">{a}</td>
                <td className="py-2.5 text-right font-semibold text-emerald-700 tabular-nums">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl bg-ink-900 p-4 text-white">
        <span className="text-2xl font-bold text-brand-300 whitespace-nowrap">
          {priceDelta < 0 ? '– ' : '+ '}{usd(Math.abs(priceDelta))}
        </span>
        <p className="text-sm leading-snug text-ink-100">
          {priceDelta < 0
            ? `Negotiate about ${usd(Math.abs(priceDelta))} off the asking price and the deal moves onto target across the board. It works on the buy — not on optimistic rent.`
            : `This deal already clears your targets at the asking price — the numbers work as listed.`}
        </p>
      </div>
    </div>
  )
}

function ScenarioLocked() {
  return (
    <div className="mt-6 card p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-500"><Lock size={18} /></span>
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-ink-900">
              Scenario compare <span className="badge bg-brand-50 text-brand-700">Deal Pro</span>
            </h3>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              See the exact purchase price that turns this deal from thin to strong — the as-listed numbers next to your max allowable offer, side by side.
            </p>
          </div>
        </div>
        <Link to="/app/billing" className="btn-primary shrink-0">Upgrade to Deal Pro <ArrowRight size={16} /></Link>
      </div>
    </div>
  )
}
