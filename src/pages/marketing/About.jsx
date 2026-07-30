import { Section, SectionHeading } from '../../components/ui/Section.jsx'
import Stat from '../../components/ui/Stat.jsx'

export default function About() {
  return (
    <>
      <Section className="bg-gradient-to-b from-brand-50/70 to-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-3">Our mission</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Give every investor an analyst in their pocket
          </h1>
          <p className="mt-5 text-lg text-ink-500">
            PropScope was built by investors who were tired of rebuilding the same spreadsheet for
            every property. We believe the math behind a good deal should take minutes, not hours —
            and shouldn't require a finance degree.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 sm:grid-cols-3">
          <Stat label="Average report time" value="~3 min" sub="vs. 60+ in a spreadsheet" tone="brand" />
          <Stat label="Properties in our data" value="150M+" sub="U.S. residential" />
          <Stat label="Markets covered" value="50 states" sub="nationwide" />
        </div>
      </Section>

      <Section className="bg-ink-50">
        <SectionHeading eyebrow="Values" title="What we care about" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Clarity over complexity', 'A report should give you an answer, not homework. We lead with the verdict.'],
            ['Honest numbers', 'We surface risk and confidence instead of hiding it. Good underwriting means knowing what could go wrong.'],
            ['Investor-first', 'We build for people putting real money on the line — speed, accuracy, and trust come first.'],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <h3 className="font-semibold text-ink-900">{t}</h3>
              <p className="mt-2 text-sm text-ink-500">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
