// Circular score gauge. Colors itself by score band and uses `currentColor`
// so it stays vivid in both light and dark mode (the dark theme brightens the tone class).
export default function ScoreRing({ score = 0, size = 64, stroke = 7 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pctv = Math.max(0, Math.min(100, score)) / 100
  const tone =
    score >= 80 ? 'text-emerald-600' :
    score >= 65 ? 'text-brand-600' :
    score >= 50 ? 'text-amber-600' : 'text-rose-600'
  return (
    <div className={`relative inline-grid place-items-center ${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pctv)} strokeLinecap="round" />
      </svg>
      <span className="absolute font-bold" style={{ fontSize: Math.round(size * 0.3) }}>{score}</span>
    </div>
  )
}
