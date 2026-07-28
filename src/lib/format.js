export const usd = (n, opts = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, ...opts }).format(n ?? 0)

export const usdc = (n) => usd(n, { maximumFractionDigits: 2 })

export const pct = (n, digits = 1) =>
  `${(n ?? 0).toFixed(digits)}%`

export const compactUsd = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n ?? 0)

export const dateFmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
