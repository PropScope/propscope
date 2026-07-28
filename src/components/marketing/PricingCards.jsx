import { Link } from 'react-router-dom'
import { Check, X, Sparkles } from 'lucide-react'
import { PLANS } from '../../lib/plans.js'
import { usd } from '../../lib/format.js'
import Reveal from '../ui/Reveal.jsx'

export default function PricingCards({ ctaTo = '/signup' }) {
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {PLANS.map((plan, i) => (
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
              <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>
                {usd(plan.price)}
              </span>
              <span className="text-sm text-ink-400">{plan.subscription ? '/mo' : ''}</span>
            </div>
            <p className="mt-1 text-xs text-ink-400">{plan.cadence}</p>

            <Link to={`${ctaTo}?plan=${plan.id}`}
              className={`mt-6 btn-shine ${plan.highlight ? 'btn bg-brand-500 text-white hover:bg-brand-400' : 'btn-primary'} w-full`}>
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
      ))}
    </div>
  )
}
