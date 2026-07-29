import { Link } from 'react-router-dom'

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 font-bold text-lg tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-800">
        <svg width="19" height="19" viewBox="0 0 32 32" fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="16" cy="16" r="9" />
          <line x1="16" y1="3" x2="16" y2="8" />
          <line x1="16" y1="24" x2="16" y2="29" />
          <line x1="3" y1="16" x2="8" y2="16" />
          <line x1="24" y1="16" x2="29" y2="16" />
          <circle cx="16" cy="16" r="2" fill="#34d399" stroke="none" />
        </svg>
      </span>
      <span className={`ps-wordmark ${light ? 'text-white' : 'text-brand-900'}`}>
        Prop<span className="text-emerald-600">Scope</span>
      </span>
    </Link>
  )
}
