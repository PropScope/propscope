import { Link } from 'react-router-dom'
import { MapPin, Cpu, FileCheck2, ArrowRight } from 'lucide-react'
import { Section, SectionHeading } from '../../components/ui/Section.jsx'

const steps = [
  { icon: MapPin, n: '01', title: 'Submit a property', desc: 'Enter the address and a few details — purchase price, your rehab estimate, target strategy. Not sure on a number? Leave it blank and PropScope estimates it.' },
  { icon: Cpu, n: '02', title: 'The engine goes to work', desc: 'PropScope pulls comparable sales, estimates ARV and rent, builds the rehab budget and financing scenarios, then runs flip, hold, and BRRRR models in parallel.' },
  { icon: FileCheck2, n: '03', title: 'Get a scored report', desc: 'In minutes, a complete report appears in your portal and inbox — with a PropScope Score, a clear verdict, and a downloadable investor-grade PDF.' },
]

export default function HowItWorks() {
  return (
    <>
      <Section className="bg-gradient-to-b from-brand-50/70 to-white">
        <SectionHeading eyebrow="How it works" title="Three steps from address to answer"
          subtitle="No spreadsheets, no manual comping. Just the inputs you have and the answer you need." />
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div key={s.n} className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-extrabold text-brand-200">{s.n}</span>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white">
                  <s.icon size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-ink-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/signup" className="btn-primary px-6 py-3 text-base">Analyze your first deal <ArrowRight size={18} /></Link>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Under the hood" title="What's inside each report" />
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['Valuation', 'ARV from weighted comps, plus rent estimate and price-per-square-foot context.'],
            ['Rehab budget', 'Itemized scope and costs with a contingency buffer baked in.'],
            ['Financing & returns', 'Cap rate, cash-on-cash, monthly cash flow, and total ROI by strategy.'],
            ['Risk profile', 'Sensitivity tables and flags for the assumptions that move the deal most.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-ink-50 p-6">
              <h3 className="font-semibold text-ink-900">{t}</h3>
              <p className="mt-2 text-sm text-ink-500">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
