export default function Stat({ label, value, sub, tone = 'default' }) {
  const toneMap = {
    default: 'text-ink-900',
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    brand: 'text-brand-600',
  }
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${toneMap[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  )
}
