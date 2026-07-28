export default function ScoreRing({ score = 0, size = 64, stroke = 7 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pctv = Math.max(0, Math.min(100, score)) / 100
  const color = score >= 80 ? '#059669' : score >= 65 ? '#213f66' : score >= 50 ? '#d97706' : '#e11d48'
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pctv)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  )
}
