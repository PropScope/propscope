import { Link } from 'react-router-dom'
import { MapPin, Loader2 } from 'lucide-react'
import { usd } from '../../lib/format.js'
import { planById } from '../../lib/plans.js'

const verdictTone = {
  Strong: 'bg-emerald-100 text-emerald-700',
  Moderate: 'bg-amber-100 text-amber-700',
  Thin: 'bg-rose-100 text-rose-700',
}

export default function ReportCard({ r }) {
  const tier = planById(r.tier)
  const generating = r.status === 'generating'
  return (
    <Link to={`/app/reports/${r.id}`}
      className="card group flex flex-col p-5 transition hover:ring-brand-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: r.thumb }}>
            <MapPin size={16} />
          </span>
          <span>
            {r.address}
            <span className="block text-xs font-normal text-ink-400">{r.city}, {r.state} {r.zip}</span>
          </span>
        </div>
        {generating ? (
          <span className="badge bg-brand-100 text-brand-700"><Loader2 size={12} className="animate-spin" /> Generating</span>
        ) : (
          <span className={`badge ${verdictTone[r.verdict] || 'bg-ink-100 text-ink-600'}`}>{r.verdict}</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="badge bg-ink-100 text-ink-600">{tier?.name}</span>
        <span className="badge bg-brand-50 text-brand-700">{r.strategy}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4 text-sm">
        <div><p className="text-xs text-ink-400">ARV</p><p className="font-semibold">{usd(r.arv)}</p></div>
        <div><p className="text-xs text-ink-400">Rehab</p><p className="font-semibold">{usd(r.rehab)}</p></div>
        <div><p className="text-xs text-ink-400">Score</p>
          <p className="font-semibold">{generating ? '—' : `${r.score}/100`}</p></div>
      </div>
    </Link>
  )
}
