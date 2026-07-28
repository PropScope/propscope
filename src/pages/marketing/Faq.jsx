import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Section, SectionHeading } from '../../components/ui/Section.jsx'

const faqs = [
  ['How accurate are the estimates?', 'PropScope uses comparable sales and market data to model ARV, rent, and rehab. Estimates are a strong starting point for underwriting, but you should always verify with your own due diligence and local boots-on-the-ground knowledge before making an offer.'],
  ['How long does a report take?', 'Most reports generate in just a few minutes. Deal Intelligence reports with BRRRR analysis and an executive memo can take slightly longer.'],
  ['What\'s the difference between the tiers?', 'Deal Check is a quick go/no-go snapshot. Deal Analyzer adds the full investment model. Deal Intelligence adds BRRRR analysis and an executive memo. Investor Pro gives you unlimited Deal Intelligence reports plus a portfolio dashboard.'],
  ['Do per-report purchases expire?', 'No. Deal Check, Deal Analyzer, and Deal Intelligence are one-time purchases per report. Investor Pro is a monthly subscription with unlimited reports.'],
  ['Can I cancel Investor Pro anytime?', 'Yes. Investor Pro is month-to-month and you can cancel from your billing page at any time. You keep access through the end of your billing period.'],
  ['Is this financial advice?', 'No. PropScope provides automated analysis and estimates for informational purposes only. It is not financial, investment, or legal advice. Always consult appropriate professionals before investing.'],
  ['What markets do you cover?', 'PropScope works across U.S. residential markets. Comp availability and data quality vary by area, and the report notes confidence where data is thin.'],
  ['Can I share reports with partners or lenders?', 'Absolutely. Every report includes a downloadable, investor-grade PDF designed to be shared with partners, lenders, and sellers.'],
]

export default function Faq({ embedded = false }) {
  return (
    <Section className={embedded ? 'bg-ink-50' : 'bg-gradient-to-b from-brand-50/70 to-white'}>
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="mx-auto max-w-3xl divide-y divide-ink-200 rounded-2xl bg-white ring-1 ring-ink-200">
        {faqs.map((f, i) => <Item key={i} q={f[0]} a={f[1]} />)}
      </div>
    </Section>
  )
}

function Item({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="px-5">
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="font-medium text-ink-900">{q}</span>
        <ChevronDown size={20} className={`shrink-0 text-ink-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-ink-500">{a}</p>}
    </div>
  )
}
