import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles, Clock } from 'lucide-react'
import { PLANS } from '../../lib/plans.js'
import { usd } from '../../lib/format.js'
import Reveal from '../ui/Reveal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function PricingCards({ ctaTo = '/signup' }) {
  const [annual, setAnnual] = useState(true)
  const { user, isAuthed } = useAuth()
  const currentPlan = user?.plan

  return (
    <>
      {/* Monthly / Annual toggle */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-ink-100 p-1 text-sm font-semibold">
          <button type="button" onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 transition ${!annual ? 'bg-white text-ink-900 shadow' : 'text-ink-500 hover:text-ink-700'}`}>
            Monthly
          </button>
          <button type="button" onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${annual ? 'bg-white text-ink-900 shadow' : 'text-ink-500 hover:text-ink-700'}`}>
            Annual <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => {
          const price = annual ? plan.annualMonthly : plan.monthly
          return (
            <Reveal key={plan.id} delay={i * 90} className="h-full">
              <div className={`relative flex h-full flex-col rounded-2xl p-6 transition duration-200 hover:-translate-y-1.5 ${
                plan.highlight ? 'bg-ink-900 text-white ring-2 ring-brand-500 shadow-xl hover:shadow-2xl' : 'card hover:shadow-lg hover:ring-brand-300'
              }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-brand-500 text-white shadow-md">
                    <Sparkles size={12} /> Most popular
                  </span>
                )}
                <h3 className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{plan.name}</h3>
                <p className={`mt-1 min-h-[40px] text-sm ${plan.highlight ? 'text-ink-300' : 'text-ink-500'}`}>{plan.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  {annual && <span className="mr-1 text-lg font-semibold text-ink-400 line-through">{usd(plan.monthly)}</span>}
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{usd(price)}</span>
                  <span className="text-sm text-ink-400">/mo</span>
                </div>
                <p className={`mt-1 text-xs ${annual ? 'font-semibold text-emerald-600' : 'text-ink-400'}`}>
                  {annual ? `Billed ${usd(plan.annualTotal)}/yr — save ${usd(plan.annualSaved)}` : 'Billed monthly'}
                </p>
                <p className={`mt-2 text-sm font-semibold ${plan.highlight ? 'text-brand-300' : 'text-brand-700'}`}>
                  {plan.reportsPerMonth} reports / month
                </p>

                {isAuthed ? (
                  plan.id === currentPlan ? (
                    <Link to="/app/billing"
                      className={`mt-6 btn-secondary w-full ${plan.highlight ? 'bg-ink-800 text-ink-200 ring-ink-700 hover:bg-ink-700' : ''}`}>
                      Your current plan
                    </Link>
                  ) : (
                    <Link to="/app/billing"
                      className={`mt-6 btn-shine ${plan.highlight ? 'btn bg-emerald-500 text-white hover:bg-emerald-400' : 'btn-primary'} w-full`}>
                      Change to {plan.name}
                    </Link>
                  )
                ) : (
                  <Link to={`${ctaTo}?plan=${plan.id}&billing=${annual ? 'year' : 'month'}`}
                    className={`mt-6 btn-shine ${plan.highlight ? 'btn bg-emerald-500 text-white hover:bg-emerald-400' : 'btn-primary'} w-full`}>
                    {plan.cta}
                  </Link>
                )}

                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-brand-400' : 'text-brand-600'}`} />
                      <span className={plan.highlight ? 'text-ink-200' : 'text-ink-600'}>{f}</span>
                    </li>
                  ))}
                  {plan.comingSoon.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Clock size={15} className="mt-0.5 shrink-0 text-ink-400" />
                      <span className={`${plan.highlight ? 'text-ink-400' : 'text-ink-400'}`}>{f} <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">soon</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )
        })}
      </div>

      {/* Enterprise / high-volume strip */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl bg-ink-50 p-5 sm:flex-row">
        <div className="text-sm">
          <span className="font-semibold text-ink-900">Need more than 250 reports a month?</span>
          <span className="text-ink-500"> We'll build a custom Enterprise plan for high-volume teams.</span>
        </div>
        <a href="mailto:support@getpropscope.com?subject=PropScope%20Enterprise" className="btn-secondary whitespace-nowrap">Contact us</a>
      </div>
    </>
  )
}
