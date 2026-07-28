import { Link } from 'react-router-dom'
import { CreditCard, Download, Check, Sparkles } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PLANS, planById } from '../../lib/plans.js'
import { usd, dateFmt } from '../../lib/format.js'

const invoices = [
  { id: 'INV-2026-06', date: '2026-06-02', amount: 497, plan: 'Investor Pro — Monthly' },
  { id: 'INV-2026-05', date: '2026-05-02', amount: 497, plan: 'Investor Pro — Monthly' },
  { id: 'INV-2026-04', date: '2026-04-02', amount: 497, plan: 'Investor Pro — Monthly' },
  { id: 'INV-2026-03', date: '2026-03-18', amount: 597, plan: 'Deal Intelligence — One-time' },
]

export default function Billing() {
  const { user } = useAuth()
  const current = planById(user?.plan)

  return (
    <>
      <PageHeader title="Billing" subtitle="Manage your plan and payment method." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">Current plan</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-ink-900">
                <Sparkles size={20} className="text-brand-600" /> {current?.name}
              </p>
            </div>
            <span className="badge bg-emerald-100 text-emerald-700"><Check size={12} /> Active</span>
          </div>
          <p className="mt-3 text-sm text-ink-500">
            {current?.subscription
              ? `${usd(current.price)}/month · renews ${dateFmt('2026-07-02')}`
              : 'Per-report plan — pay only when you run a report.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/pricing" className="btn-secondary">Change plan</Link>
            {current?.subscription && <button className="btn-ghost text-rose-600 hover:bg-rose-50">Cancel subscription</button>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900">Payment method</h3>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink-50 p-4">
            <CreditCard size={22} className="text-ink-500" />
            <div className="text-sm">
              <p className="font-medium text-ink-900">Visa ending 4242</p>
              <p className="text-ink-400">Expires 09/28</p>
            </div>
          </div>
          <button className="btn-secondary mt-4 w-full">Update card</button>
          <p className="mt-3 text-center text-xs text-ink-400">Payments are stubbed in this stage. Stripe wires in next.</p>
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
            <Link to="/pricing" className="btn bg-white text-brand-700 hover:bg-brand-50">Upgrade to Pro</Link>
          </div>
        </div>
      )}

      <div className="mt-8 card p-6">
        <h3 className="font-semibold text-ink-900">Billing history</h3>
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
      </div>
    </>
  )
}
