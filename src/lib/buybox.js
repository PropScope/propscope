// Buy box = an investor's saved target criteria. Auto-scoring grades a report's
// (already-computed) numbers against these rules — pure client-side, no report generation.

export const DEFAULT_BUYBOX = {
  minCashFlow: 200,   // $/mo
  minCashOnCash: 8,   // %
  minCapRate: 5.5,    // %
  minDscr: 1.25,      // x
  minScore: 60,       // PropScope score
  maxPrice: '',       // $ (blank = no limit)
  states: '',         // comma-separated, e.g. "NJ, PA" (blank = any)
}

const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v))

// True if the user has set any criteria worth scoring against.
export function hasBuyBox(bb) {
  if (!bb) return false
  return Object.entries(bb).some(([k, v]) => {
    if (k === 'states') return String(v || '').trim() !== ''
    return num(v) != null
  })
}

// Score one report against the buy box. Returns { fits, fails: [labels] } or null.
export function scoreDeal(uw, report, bb) {
  if (!hasBuyBox(bb)) return null
  const fails = []
  const price = Number(report.purchasePrice) || 0
  const score = Number(report.score) || 0
  const state = String(report.state || '').trim().toUpperCase()
  const wantStates = String(bb.states || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)

  if (num(bb.minCashFlow) != null && uw.monthlyCashFlow < num(bb.minCashFlow)) fails.push('cash flow')
  if (num(bb.minCashOnCash) != null && uw.cashOnCash < num(bb.minCashOnCash)) fails.push('cash-on-cash')
  if (num(bb.minCapRate) != null && uw.capRate < num(bb.minCapRate)) fails.push('cap rate')
  if (num(bb.minDscr) != null && uw.dscr < num(bb.minDscr)) fails.push('DSCR')
  if (num(bb.minScore) != null && score < num(bb.minScore)) fails.push('score')
  if (num(bb.maxPrice) != null && price > num(bb.maxPrice)) fails.push('price')
  if (wantStates.length && state && !wantStates.includes(state)) fails.push('market')

  return { fits: fails.length === 0, fails }
}
