import { Link } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'
import { CheckCircle2 } from 'lucide-react'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-500">{footer}</div>}
        </div>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} PropScope</p>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 lg:block">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex h-full flex-col justify-center px-12 text-white">
          <h2 className="text-3xl font-bold leading-tight">Underwrite your next deal in minutes.</h2>
          <p className="mt-4 max-w-sm text-brand-50/90">
            Join investors using PropScope to screen, score, and close better deals.
          </p>
          <ul className="mt-8 space-y-3">
            {['ARV, rehab, and cash flow modeled automatically',
              'BRRRR and exit-strategy comparison',
              'Investor-grade PDF reports'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-brand-50">
                <CheckCircle2 size={20} className="text-brand-200" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
            <p className="text-sm italic text-brand-50">
              “I screen ten deals before lunch now. PropScope paid for itself on the first one.”
            </p>
            <p className="mt-2 text-xs font-semibold text-brand-100">Marcus T. · Wholesaler</p>
          </div>
        </div>
      </div>
    </div>
  )
}
