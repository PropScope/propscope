import { Link } from 'react-router-dom'
import { ShieldCheck, Zap, RefreshCw, Star } from 'lucide-react'
import { Section, SectionHeading } from '../../components/ui/Section.jsx'
import PricingCards from '../../components/marketing/PricingCards.jsx'
import Reveal from '../../components/ui/Reveal.jsx'
import Faq from './Faq.jsx'

export default function Pricing() {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />
        <Section className="pb-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="badge bg-white text-brand-700 ring-1 ring-inset ring-brand-200"><Zap size={13} className="text-brand-600" /> Simple, honest pricing</span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Pay per deal, or go <span className="text-gradient">unlimited</span>
            </h1>
            <p className="mt-4 text-lg text-ink-500">
              Start with a single report. Upgrade to Investor Pro when you're analyzing deals every week.
            </p>
          </div>
          <PricingCards />

          {/* Trust strip */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              [ShieldCheck, 'Not financial advice — just better inputs', 'Every report is a decision aid, with confidence and risk called out.'],
              [RefreshCw, 'Cancel Investor Pro anytime', 'Month-to-month. Keep access through your billing period.'],
              [Star, 'Loved by 3,200+ investors', 'From first-deal wholesalers to full-time flippers.'],
            ].map(([Icon, t, d]) => (
              <Reveal key={t}>
                <div className="flex items-start gap-3 rounded-2xl bg-ink-50 p-5">
                  <Icon size={20} className="mt-0.5 shrink-0 text-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{t}</p>
                    <p className="text-sm text-ink-500">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      <Section className="pt-4">
        <SectionHeading eyebrow="Compare" title="Everything, side by side" center />
        <Reveal><CompareTable /></Reveal>
      </Section>

      <Faq embedded />
    </>
  )
}

function CompareTable() {
  const rows = [
    ['Property & comps snapshot', true, true, true, true],
    ['ARV & rent estimate', true, true, true, true],
    ['Max allowable offer', true, true, true, true],
    ['Full fix & flip model', false, true, true, true],
    ['Buy & hold cash flow', false, true, true, true],
    ['Rehab budget estimator', false, true, true, true],
    ['Risk & sensitivity scoring', false, true, true, true],
    ['BRRRR strategy model', false, false, true, true],
    ['Executive memo', false, false, true, true],
    ['Unlimited reports', false, false, false, true],
    ['Portfolio dashboard', false, false, false, true],
    ['Team seats', false, false, false, true],
  ]
  const cols = ['Deal Check', 'Deal Analyzer', 'Deal Intelligence', 'Investor Pro']
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-ink-200">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50">
            <th className="py-4 pl-5 text-left font-semibold text-ink-900">Feature</th>
            {cols.map((c, i) => (
              <th key={c} className={`px-3 py-4 text-center font-semibold ${i === 2 ? 'text-brand-700' : 'text-ink-700'}`}>
                {c}{i === 2 && <span className="ml-1 align-middle text-[10px] font-bold uppercase text-brand-500">★</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r[0]} className={ri % 2 ? 'bg-white' : 'bg-ink-50/40'}>
              <td className="py-3 pl-5 text-ink-600">{r[0]}</td>
              {r.slice(1).map((v, i) => (
                <td key={i} className={`px-3 py-3 text-center ${i === 2 ? 'bg-brand-50/40' : ''}`}>
                  {v ? <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-brand-700">✓</span> : <span className="text-ink-300">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
