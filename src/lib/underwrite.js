// Transparent underwriting model used when a user edits a report's numbers.
// Standard, documented assumptions so recalculated figures move consistently.

export const ASSUMPTIONS = {
  downPct: 0.20,        // 20% down
  rate: 0.07,           // 7% interest
  termYears: 30,        // 30-year loan
  expenseRatio: 0.40,   // operating expenses = 40% of gross rent (taxes, insurance, maintenance, vacancy, mgmt)
  closingPct: 0.03,     // 3% closing costs
  sellingPct: 0.08,     // 8% selling + holding costs for a flip
  maoArvPct: 0.70,      // max allowable offer = 70% of ARV minus rehab
}

const n = (v) => Number(v) || 0
const r1 = (v) => Math.round(v * 10) / 10

// inputs: { purchasePrice, arv, rehab, monthlyRent }
export function recompute(inp, A = ASSUMPTIONS) {
  const price = n(inp.purchasePrice), arv = n(inp.arv), rehab = n(inp.rehab), rent = n(inp.monthlyRent)

  const mao = Math.round(arv * A.maoArvPct - rehab)

  const loan = price * (1 - A.downPct)
  const mr = A.rate / 12
  const pi = loan > 0 && mr > 0 ? loan * mr / (1 - Math.pow(1 + mr, -A.termYears * 12)) : 0
  const noiMonthly = rent * (1 - A.expenseRatio)
  const monthlyCashFlow = Math.round(noiMonthly - pi)
  const capRate = price > 0 ? r1((noiMonthly * 12 / price) * 100) : 0
  const cashInvested = price * A.downPct + rehab + price * A.closingPct
  const cashOnCash = cashInvested > 0 ? r1((monthlyCashFlow * 12 / cashInvested) * 100) : 0

  const profitFlip = Math.round(arv - price - rehab - arv * A.sellingPct)
  const flipRoi = (price + rehab) > 0 ? r1((profitFlip / (price + rehab)) * 100) : 0
  const flipMarginPct = arv > 0 ? (profitFlip / arv) * 100 : 0

  // Deal quality = the BETTER of a flip or a hold (kept identical to the server underwriting).
  const clamp = (v) => Math.max(0, Math.min(100, v))
  const fScore = clamp((flipMarginPct / 30) * 100)   // 30% margin on ARV -> 100
  const hScore = clamp(((cashOnCash + 10) / 25) * 100) // 15% cash-on-cash -> 100
  const score = Math.round(clamp(Math.max(fScore, hScore)))
  const verdict = score >= 70 ? 'Strong' : score >= 45 ? 'Moderate' : 'Thin'

  const cashflow = [0, 1, 2, 3, 4].map((i) => ({
    name: `Yr ${i + 1}`, value: Math.round(monthlyCashFlow * 12 * Math.pow(1.03, i)),
  }))

  const strategies = [
    { name: 'Fix & Flip', roi: flipRoi, profit: profitFlip },
    { name: 'Buy & Hold', roi: cashOnCash, profit: monthlyCashFlow * 12 },
    { name: 'BRRRR', roi: r1(cashOnCash + 6.5), profit: monthlyCashFlow * 12 + 4800 },
  ]

  return { mao, monthlyCashFlow, capRate, cashOnCash, profitFlip, verdict, score, cashflow, strategies }
}

// Build the flattened patch to persist after an edit.
export function editPatch(inp) {
  const c = recompute(inp)
  return {
    purchasePrice: n(inp.purchasePrice), arv: n(inp.arv), rehab: n(inp.rehab), monthlyRent: n(inp.monthlyRent),
    monthlyCashFlow: c.monthlyCashFlow, capRate: c.capRate, cashOnCash: c.cashOnCash,
    profitFlip: c.profitFlip, score: c.score, verdict: c.verdict,
    cashflow: c.cashflow, strategies: c.strategies,
    editedAt: new Date().toISOString(),
  }
}
