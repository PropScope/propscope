import { useState } from 'react'
import { Mail, MessageSquare, Phone, CheckCircle2 } from 'lucide-react'
import { Section, SectionHeading } from '../../components/ui/Section.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <Section className="bg-gradient-to-b from-brand-50/70 to-white">
      <SectionHeading eyebrow="Contact" title="Talk to us"
        subtitle="Questions about a plan, a partnership, or a deal? We're happy to help." />
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[
            [Mail, 'Email', 'support@propscope.app'],
            [MessageSquare, 'Live chat', 'In-app, Mon–Fri 9–6 ET'],
            [Phone, 'Sales', '(555) 010-2025'],
          ].map(([Icon, t, d]) => (
            <div key={t} className="card flex items-center gap-4 p-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={20} /></div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{t}</p>
                <p className="text-sm text-ink-500">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 lg:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 size={44} className="text-emerald-500" />
              <h3 className="mt-4 text-lg font-semibold">Message sent</h3>
              <p className="mt-1 text-sm text-ink-500">Thanks — we'll get back to you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Name</label><input className="input" required placeholder="Your name" /></div>
                <div><label className="label">Email</label><input type="email" className="input" required placeholder="you@example.com" /></div>
              </div>
              <div><label className="label">Subject</label><input className="input" placeholder="How can we help?" /></div>
              <div><label className="label">Message</label><textarea rows={5} className="input" required placeholder="Tell us a bit about what you need…" /></div>
              <button className="btn-primary w-full py-3">Send message</button>
            </form>
          )}
        </div>
      </div>
    </Section>
  )
}
