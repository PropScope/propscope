import { Link } from 'react-router-dom'
import {
  Calculator, LineChart, Map, FileText, ShieldAlert, Repeat, Gauge,
  Building2, Layers, ArrowRight, Zap, Cpu,
} from 'lucide-react'
import { Section, SectionHeading } from '../../components/ui/Section.jsx'
import Reveal from '../../components/ui/Reveal.jsx'

const features = [
  { icon: Calculator, title: 'Automated underwriting', desc: 'ARV, MAO, rehab, holding costs, and financing modeled from real inputs — no formulas to maintain.' },
  { icon: Map, title: 'Comparable sales analysis', desc: 'Nearby sold comps pulled, weighted by distance, size, and recency to anchor your ARV.' },
  { icon: Repeat, title: 'BRRRR modeling', desc: 'Full buy-rehab-rent-refinance-repeat math, including cash recapture and infinite-return scenarios.' },
  { icon: LineChart, title: 'Cash flow projections', desc: 'Five-year rent, expense, and cash flow projections with cap rate and cash-on-cash return.' },
  { icon: ShieldAlert, title: 'Risk & sensitivity', desc: 'Stress-test price, rent, and rehab assumptions to see how fragile or robust the deal is.' },
  { icon: Gauge, title: 'PropScope Score', desc: 'A single 0–100 score with the drivers behind it, so you can triage deals instantly.' },
  { icon: Layers, title: 'Strategy comparison', desc: 'Flip vs. hold vs. BRRRR ranked side by side, with profit and ROI for each play.' },
  { icon: FileText, title: 'Shareable PDF reports', desc: 'Investor-grade, branded PDFs ready for partners, lenders, and sellers.' },
  { icon: Building2, title: 'Portfolio dashboard', desc: 'On Investor Pro, track every analyzed deal and saved buy-box in one place.' },
]

export default function Features() {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <Section>
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge bg-white text-brand-700 ring-1 ring-inset ring-brand-200"><Zap size={13} className="text-brand-600" /> Everything in one engine</span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              One tool that replaces your <span className="text-gradient">whole stack</span>
            </h1>
            <p className="mt-4 text-lg text-ink-500">
              PropScope rolls the patchwork of spreadsheets, comps tools, and calculators into a single
              engine that returns an answer — not homework.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="card card-hover h-full p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <f.icon size={22} />
                  </div>
                  <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-ink-500">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      <Section className="bg-ink-900 text-white">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Built on the Claude API</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">AI that reasons about your deal</h2>
            <p className="mt-4 text-lg text-ink-300">
              Behind every report is a structured analysis pipeline — not a black box. PropScope pulls
              the data, runs the models, and uses AI to weigh comps, flag risks, and write the
              plain-English verdict you read at the top.
            </p>
            <Link to="/how-it-works" className="btn-primary btn-shine mt-6">See the workflow <ArrowRight size={16} /></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-200">
                <Cpu size={16} className="text-brand-300" /> report.json
              </div>
              <pre className="overflow-x-auto rounded-xl bg-ink-950/80 p-4 text-xs leading-relaxed text-ink-100 ring-1 ring-white/10">
{`{
  "address": "4821 Maple Grove Dr",
  "arv": 238000,
  "rehab": 41000,
  "max_offer": 138600,
  "score": 86,
  "verdict": "Strong — proceed to offer",
  "best_strategy": "BRRRR",
  "risks": ["Rehab overrun: medium"]
}`}
              </pre>
              <p className="mt-3 text-xs text-ink-400">Illustrative report output.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-600 px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight">See it on your next deal</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-50/90">Enter an address and watch the whole report build itself.</p>
          <Link to="/signup" className="btn btn-shine mt-6 bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
            Analyze a deal free <ArrowRight size={18} />
          </Link>
        </div>
      </Section>
    </>
  )
}
