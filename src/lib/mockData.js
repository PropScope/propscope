// Sample data powering the portal in Stage 1 (no backend yet).

export const SAMPLE_USER = {
  name: 'Jordan Avery',
  email: 'jordan@averycapital.co',
  company: 'Avery Capital',
  plan: 'investor-pro',
  avatarInitials: 'JA',
  memberSince: '2025-11-02',
}

export const SAMPLE_REPORTS = [
  {
    id: 'RPT-1042',
    address: '4821 Maple Grove Dr',
    city: 'Columbus', state: 'OH', zip: '43229',
    tier: 'deal-intelligence',
    strategy: 'BRRRR',
    status: 'complete',
    createdAt: '2026-06-21',
    score: 86,
    verdict: 'Strong',
    purchasePrice: 142000,
    arv: 238000,
    rehab: 41000,
    monthlyRent: 1850,
    capRate: 7.8,
    cashOnCash: 14.2,
    monthlyCashFlow: 412,
    profitFlip: 38600,
    thumb: '#182f4d',
  },
]

// Detailed breakdown for a single report (used on the report detail page).
// Prefers real AI-generated data when present, falls back to illustrative sample data.
export const reportDetail = (r) => ({
  comps: (r.comps && r.comps.length) ? r.comps : [
    { address: '4910 Maple Grove Dr', sold: 232000, sqft: 1480, beds: 3, baths: 2, dist: 0.2 },
    { address: '388 Oakridge Ln', sold: 244500, sqft: 1560, beds: 3, baths: 2, dist: 0.4 },
    { address: '5102 Maple Grove Dr', sold: 229000, sqft: 1420, beds: 3, baths: 2, dist: 0.3 },
    { address: '141 Cedar Hollow', sold: 251000, sqft: 1610, beds: 4, baths: 2, dist: 0.6 },
  ],
  rehab: (r.rehabItems && r.rehabItems.length) ? r.rehabItems : [
    { item: 'Kitchen', cost: 12500 },
    { item: 'Bathrooms (2)', cost: 8200 },
    { item: 'Flooring', cost: 6800 },
    { item: 'Paint (interior/exterior)', cost: 5400 },
    { item: 'Roof repair', cost: 4600 },
    { item: 'HVAC servicing', cost: 2100 },
    { item: 'Contingency (10%)', cost: 1400 },
  ],
  cashflow: (r.cashflow && r.cashflow.length) ? r.cashflow : [
    { name: 'Yr 1', value: Math.round((r.monthlyCashFlow || 300) * 12) },
    { name: 'Yr 2', value: Math.round((r.monthlyCashFlow || 300) * 12 * 1.03) },
    { name: 'Yr 3', value: Math.round((r.monthlyCashFlow || 300) * 12 * 1.061) },
    { name: 'Yr 4', value: Math.round((r.monthlyCashFlow || 300) * 12 * 1.093) },
    { name: 'Yr 5', value: Math.round((r.monthlyCashFlow || 300) * 12 * 1.126) },
  ],
  strategies: (r.strategies && r.strategies.length) ? r.strategies : [
    { name: 'Fix & Flip', roi: 27, profit: r.profitFlip || 0 },
    { name: 'Buy & Hold', roi: r.cashOnCash || 0, profit: Math.round((r.monthlyCashFlow || 0) * 12) },
    { name: 'BRRRR', roi: (r.cashOnCash || 0) + 6.5, profit: Math.round((r.monthlyCashFlow || 0) * 12 + 4800) },
  ],
  risks: (r.risks && r.risks.length) ? r.risks : [
    { label: 'Market liquidity', level: 'Low' },
    { label: 'Rehab overrun', level: 'Medium' },
    { label: 'Rent vs. comps', level: 'Low' },
    { label: 'Days on market', level: 'Medium' },
  ],
})
