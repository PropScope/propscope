import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Sparkles } from 'lucide-react'
import { PLANS } from '../../lib/plans.js'
import { usd } from '../../lib/format.js'
import Reveal from '../ui/Reveal.jsx'

export default function PricingCards({ ctaTo = '/signup' }) {
  const [annual, setAnnual] = useState(true)

  return (
    <>
      {/* Monthly / Annual toggle (affects the Investor Pro subscription only) */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-ink-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 transition ${!annual ? 'bg-white text-ink-900 shadow' : 'text-ink-500 hover:text-ink-700'}`}>
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${annual ? 'bg-white text-ink-900 shadow' : 'text-ink-500 hover:text-ink-700'}`}>
            Annual
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {PLANS.map((plan, i) => {
          const isSub = !!plan.subscription
          const showAnnual = isSub && annual
          const priceNum = showAnnual ? plan.annualMonthly : plan.price
          return (
            <Reveal key={plan.id} delay={i * 90} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-2xl p-6 transition duration-200 hover:-translate-y-1.5 ${
                  plan.highlight
                    ? 'bg-ink-900 text-white ring-2 ring-brand-500 shadow-xl hover:shadow-2xl'
                    : 'card hover:shadow-lg hover:ring-brand-300'
                }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-brand-500 text-white shadow-md">
                    <Sparkles size={12} /> Most popular
                  </span>
                )}
                <h3 className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{plan.name}</h3>
                <p className={`mt-1 min-h-[40px] text-sm ${plan.highlight ? 'text-ink-300' : 'text-ink-500'}`}>{plan.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  {showAnnual && (
                    <span className="mr-1 text-lg font-semibold text-ink-400 line-through">{usd(plan.price)}</span>
                  )}
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>
                    {usd(priceNum)}
                  </span>
                  <span className="text-sm text-ink-400">{isSub ? '/mo' : ''}</span>
                </div>
                {isSub ? (
                  <p className={`mt-1 text-xs ${showAnnual ? 'font-semibold text-emerald-600' : 'text-ink-400'}`}>
                    {showAnnual ? `Billed ${usd(plan.annualTotal)}/yr — save ${usd(plan.annualSaved)}` : 'Billed monthly'}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-ink-400">{plan.cadence}</p>
                )}

                <Link
                  to={`${ctaTo}?plan=${plan.id}${isSub ? `&billing=${annual ? 'year' : 'month'}` : ''}`}
                  className={`mt-6 btn-shine ${plan.highlight ? 'btn bg-emerald-500 text-white hover:bg-emerald-400' : 'btn-primary'} w-full`}>
                  {plan.cta}
                </Link>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-brand-400' : 'text-brand-600'}`} />
                      <span className={plan.highlight ? 'text-ink-200' : 'text-ink-600'}>{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 opacity-50">
                      <X size={16} className="mt-0.5 shrink-0 text-ink-400" />
                      <span className="text-ink-400 line-through">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )
        })}
      </div>
    </>
  )
}
