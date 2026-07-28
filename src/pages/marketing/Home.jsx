import { Link } from 'react-router-dom'
import {
  ArrowRight, Building2, Calculator, FileText, Gauge, MapPin, ShieldCheck,
  Sparkles, TrendingUp, Clock, CheckCircle2, Zap, DollarSign, Star,
} from 'lucide-react'
import { Section, SectionHeading } from '../../components/ui/Section.jsx'
import Reveal from '../../components/ui/Reveal.jsx'
import { useCountUp } from '../../components/ui/useCountUp.js'
import { usd, pct } from '../../lib/format.js'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <StatsBand />
      <ValueProps />
      <RoiHook />
      <SampleReport />
      <Personas />
      <StepsTeaser />
      <Testimonials />
      <CtaBand />
    </>
  )
}

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="container-x grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div className="max-w-xl">
          <span className="badge animate-pulse-ring bg-white text-brand-700 ring-1 ring-inset ring-brand-200">
            <Zap size={13} className="text-brand-600" /> AI-powered deal analysis
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Know if it's a deal <span className="text-gradient">before</span> you make the offer.
          </h1>
          <p className="mt-5 text-lg text-ink-600">
            Paste an address. PropScope runs the comps, rehab, cash flow, and BRRRR math and
            hands you a scored go/no-go answer in about 3 minutes — no spreadsheet required.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary btn-shine px-6 py-3 text-base">
              Analyze a deal free <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works" className="btn-secondary px-6 py-3 text-base">Watch how it works</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Clock size={15} className="text-brand-600" /> ~3 min per report</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-brand-600" /> No install</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-brand-600" /> Cancel anytime</span>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#213f66','#0ea5e9','#10b981','#6366f1','#f59e0b'].map((c,i)=>(
                <span key={i} className="h-8 w-8 rounded-full ring-2 ring-white" style={{background:c}} />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-amber-400">{[...Array(5)].map((_,i)=><Star key={i} size={13} fill="currentColor" />)}</div>
              <p className="text-ink-500">Trusted by <span className="font-semibold text-ink-800">3,200+ investors</span></p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="animate-float"><HeroCard /></div>
        </div>
      </div>
    </div>
  )
}

function HeroCard() {
  return (
    <div className="card relative mx-auto max-w-md p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <MapPin size={16} className="text-brand-600" /> 4821 Maple Grove Dr
        </div>
        <span className="badge bg-emerald-100 text-emerald-700">Strong deal</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <MiniStat label="ARV" value={usd(238000)} />
        <MiniStat label="Rehab" value={usd(41000)} />
        <MiniStat label="Cash flow" value="$412/mo" />
      </div>
      <div className="mt-4 rounded-xl bg-ink-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">PropScope Score</span>
          <span className="font-bold text-emerald-600">86 / 100</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-200">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: '86%' }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Row label="Cap rate" value={pct(7.8)} />
          <Row label="Cash-on-cash" value={pct(14.2)} />
          <Row label="Flip profit" value={usd(38600)} />
          <Row label="Strategy" value="BRRRR" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-3 -top-3 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-lg">
        Generated in 2m 48s
      </div>
      <div className="pointer-events-none absolute -bottom-4 -left-4 hidden rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-lg ring-1 ring-emerald-100 sm:block">
        ✓ Proceed to offer
      </div>
    </div>
  )
}

const MiniStat = ({ label, value }) => (
  <div className="rounded-xl ring-1 ring-ink-200 p-3">
    <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
    <p className="mt-0.5 text-sm font-bold text-ink-900">{value}</p>
  </div>
)
const Row = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5">
    <span className="text-ink-400">{label}</span><span className="font-semibold text-ink-800">{value}</span>
  </div>
)

function TrustMarquee() {
  const items = ['Wholesalers', 'Fix & Flippers', 'Buy & Hold Landlords', 'BRRRR Investors', 'Agents', 'Syndicators', 'House Hackers']
  const loop = [...items, ...items]
  return (
    <div className="border-y border-ink-100 bg-white py-6">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-ink-400">
        Built for how investors actually source deals
      </p>
      <div className="marquee-mask relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track gap-10 px-5">
          {loop.map((t, i) => (
            <span key={i} className="whitespace-nowrap text-sm font-semibold text-ink-400">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatsBand() {
  const stats = [
    { end: 40000, suffix: '+', label: 'Reports generated', decimals: 0, fmt: (v) => Number(v).toLocaleString() },
    { end: 3, prefix: '~', suffix: ' min', label: 'Average report time', decimals: 0 },
    { end: 2.1, prefix: '$', suffix: 'B', label: 'Property value analyzed', decimals: 1 },
    { end: 48, label: 'U.S. states covered', decimals: 0 },
  ]
  return (
    <Section className="bg-ink-900 text-white">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => <StatCounter key={i} {...s} />)}
      </div>
    </Section>
  )
}

function StatCounter({ end, prefix = '', suffix = '', label, decimals, fmt }) {
  const [ref, val] = useCountUp(end, { decimals })
  const display = fmt ? fmt(val) : val
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        {prefix}{display}{suffix}
      </p>
      <p className="mt-2 text-sm text-ink-300">{label}</p>
    </div>
  )
}

function ValueProps() {
  const items = [
    { icon: Calculator, title: 'Every number, calculated', desc: 'ARV, MAO, rehab, cap rate, cash-on-cash, and flip profit — modeled automatically from real comps.' },
    { icon: Gauge, title: 'A clear go/no-go score', desc: 'One 0–100 PropScope Score with the reasoning behind it, so you can triage deals at a glance.' },
    { icon: TrendingUp, title: 'Compare exit strategies', desc: 'See flip vs. buy-and-hold vs. BRRRR side by side and know which play wins for this property.' },
    { icon: FileText, title: 'Investor-grade PDFs', desc: 'Polished reports you can hand to a partner, lender, or seller — branded and ready to share.' },
  ]
  return (
    <Section>
      <SectionHeading
        eyebrow="Why PropScope"
        title="The analysis you'd sweat over in a spreadsheet — done for you"
        subtitle="Stop rebuilding the same model for every property. Enter an address, get a defensible answer."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 80}>
            <div className="card card-hover h-full p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <it.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-ink-900">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{it.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function RoiHook() {
  return (
    <Section className="bg-gradient-to-br from-brand-700 to-brand-800 text-white">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">The cost of guessing</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            One bad deal costs more than a year of PropScope.
          </h2>
          <p className="mt-4 text-lg text-brand-50/90">
            Overpay by $20k on a flip, miss a roof line-item, or misjudge rent — any single mistake
            dwarfs the price of running the numbers right. PropScope pays for itself the first time it
            says <span className="font-semibold text-white">“walk away.”</span>
          </p>
          <Link to="/pricing" className="btn mt-8 bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
            See pricing <ArrowRight size={18} />
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: DollarSign, big: '$38,600', small: 'Flip profit surfaced on a deal the owner nearly passed on' },
              { icon: TrendingUp, big: '14.2%', small: 'Cash-on-cash return, modeled before a dollar was spent' },
              { icon: Clock, big: '57 min', small: 'Saved per deal vs. building the model by hand' },
              { icon: Gauge, big: '86/100', small: 'Confidence score that turned a maybe into a yes' },
            ].map((c) => (
              <div key={c.big} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <c.icon size={20} className="text-brand-200" />
                <p className="mt-3 text-2xl font-extrabold">{c.big}</p>
                <p className="mt-1 text-xs text-brand-50/80">{c.small}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function SampleReport() {
  const rows = [
    ['Purchase price', usd(142000)], ['After-repair value (ARV)', usd(238000)],
    ['Rehab estimate', usd(41000)], ['Max allowable offer', usd(138600)],
    ['Monthly rent', '$1,850'], ['Monthly cash flow', '$412'],
  ]
  return (
    <Section className="bg-ink-50">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-3">Inside a report</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Not just numbers — a recommendation
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Each report breaks down comps, rehab line items, financing scenarios, and risk —
            then ties it together into a verdict you can act on.
          </p>
          <ul className="mt-6 space-y-3">
            {['Comparable sales pulled and weighted automatically',
              'Rehab budget itemized room by room',
              'Sensitivity analysis on price, rent, and rehab',
              'BRRRR refinance and equity recapture modeling'].map((t) => (
              <li key={t} className="flex items-start gap-3 text-ink-700">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-600" /> {t}
              </li>
            ))}
          </ul>
          <Link to="/features" className="btn-primary mt-8">Explore the report <ArrowRight size={16} /></Link>
        </Reveal>
        <Reveal delay={120}>
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
              <div className="flex items-center gap-2 font-semibold">
                <Building2 size={18} className="text-brand-600" /> Deal Intelligence Report
              </div>
              <span className="badge bg-brand-100 text-brand-700">RPT-1042</span>
            </div>
            <div className="divide-y divide-ink-100">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="text-ink-500">{k}</span>
                  <span className="font-semibold text-ink-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between bg-emerald-50 px-5 py-4">
              <span className="text-sm font-medium text-emerald-800">Verdict</span>
              <span className="font-bold text-emerald-700">Strong — proceed to offer</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function Personas() {
  const cards = [
    { title: 'Wholesalers', desc: 'Triage a list of leads fast and lock contracts with confidence on your MAO.' },
    { title: 'Flippers', desc: 'Nail ARV and rehab so your margins survive contact with reality.' },
    { title: 'Buy & Hold', desc: 'Project cash flow, cap rate, and long-term returns before you commit.' },
    { title: 'Agents', desc: 'Bring investor clients a credible analysis and win more listings and buyers.' },
  ]
  return (
    <Section>
      <SectionHeading eyebrow="Who it's for" title="Made for every kind of investor" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 80}>
            <div className="group h-full rounded-2xl bg-gradient-to-b from-brand-600 to-brand-700 p-6 text-white transition hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-lg font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-brand-50/90">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-100 opacity-0 transition group-hover:opacity-100">
                Learn more <ArrowRight size={14} />
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function StepsTeaser() {
  const steps = [
    ['1', 'Enter the address', 'Add property details and your numbers — or let PropScope estimate them.'],
    ['2', 'AI builds the model', 'Comps, rehab, financing, and exit strategies analyzed in minutes.'],
    ['3', 'Get your report', 'A scored, shareable PDF lands in your portal and inbox.'],
  ]
  return (
    <Section className="bg-ink-900 text-white">
      <SectionHeading eyebrow="How it works" title="From address to answer in three steps" />
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 100}>
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-lg font-bold">{n}</div>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-ink-300">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/how-it-works" className="btn-primary btn-shine">See the full workflow <ArrowRight size={16} /></Link>
      </div>
    </Section>
  )
}

function Testimonials() {
  const quotes = [
    { q: 'I used to spend an hour per deal in spreadsheets. Now I screen ten before lunch.', a: 'Marcus T.', r: 'Wholesaler, Columbus OH' },
    { q: 'The BRRRR refinance modeling alone is worth the subscription. Saved me from a bad buy.', a: 'Priya S.', r: 'Buy & Hold Investor' },
    { q: 'My investor clients take me more seriously when I hand them a PropScope report.', a: 'Dana R.', r: 'Real Estate Agent' },
  ]
  return (
    <Section>
      <SectionHeading eyebrow="What investors say" title="Trusted on real deals" />
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((t, i) => (
          <Reveal key={t.a} delay={i * 90}>
            <figure className="card card-hover h-full p-6">
              <div className="flex gap-0.5 text-amber-400">{[...Array(5)].map((_,k)=><Star key={k} size={15} fill="currentColor" />)}</div>
              <blockquote className="mt-3 text-ink-700">“{t.q}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-ink-900">{t.a}</span>
                <span className="text-ink-400"> · {t.r}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function CtaBand() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-600 px-8 py-14 text-center text-white sm:px-16">
        <div className="pointer-events-none absolute -top-16 right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your next deal is worth 3 minutes.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50/90">
          Run your first analysis today and see why investors are ditching the spreadsheet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="btn btn-shine bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
            Get started free <ArrowRight size={18} />
          </Link>
          <Link to="/pricing" className="btn px-6 py-3 text-base text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
            View pricing
          </Link>
        </div>
        <p className="mt-4 text-sm text-brand-100/80">No credit card to explore · Cancel anytime</p>
      </div>
    </Section>
  )
}
