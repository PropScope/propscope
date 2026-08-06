// Pricing tiers for PropScope — subscription plans differentiated by reports/month.
// Annual price is a true 20% off the monthly price. Report caps protect data-cost margin.
export const PLANS = [
  {
    id: 'deal-check',
    name: 'Deal Check',
    subscription: true,
    monthly: 36,
    annualMonthly: 29,
    annualTotal: 348,
    annualSaved: 84,
    reportsPerMonth: 3,
    tagline: 'For new investors testing the waters.',
    cta: 'Start Deal Check',
    highlight: false,
    features: [
      '3 full reports per month',
      'Real comps, ARV & rent estimate',
      'Max allowable offer & cash flow',
      'Fix & flip, buy & hold & BRRRR',
      'Branded PDF reports',
    ],
    comingSoon: [],
  },
  {
    id: 'deal-analyzer',
    name: 'Deal Analyzer',
    subscription: true,
    monthly: 99,
    annualMonthly: 79,
    annualTotal: 948,
    annualSaved: 240,
    reportsPerMonth: 25,
    tagline: 'For active investors doing deals every month.',
    cta: 'Start Deal Analyzer',
    highlight: true,
    features: [
      '25 full reports per month',
      'Everything in Deal Check',
      'Report history & dashboard',
      'Priority email support',
    ],
    comingSoon: [],
  },
  {
    id: 'deal-pro',
    name: 'Deal Pro',
    subscription: true,
    monthly: 179,
    annualMonthly: 143,
    annualTotal: 1716,
    annualSaved: 432,
    reportsPerMonth: 100,
    tagline: 'For investors scaling up their volume.',
    cta: 'Start Deal Pro',
    highlight: false,
    features: [
      '100 full reports per month',
      'Everything in Deal Analyzer',
      'Add-on report packs when you run low',
      'Priority support',
    ],
    comingSoon: [],
  },
  {
    id: 'investor-pro',
    name: 'Investor Pro',
    subscription: true,
    monthly: 249,
    annualMonthly: 199,
    annualTotal: 2388,
    annualSaved: 600,
    reportsPerMonth: 250,
    tagline: 'For power investors & small teams.',
    cta: 'Start Investor Pro',
    highlight: false,
    features: [
      'Up to 250 reports per month',
      'Everything in Deal Analyzer',
      'Priority support',
      'Early access to new features',
    ],
    comingSoon: [
      'Team seats',
      'Saved buy-box & auto-scoring',
      'Bulk CSV address import',
      'Portfolio dashboard',
    ],
  },
]

export const planById = (id) => PLANS.find((p) => p.id === id)

// Reports allowed per calendar month for a plan. Unknown / free = 0 (only the one free report).
export const capForPlan = (id) => {
  const p = planById(id)
  return p ? p.reportsPerMonth : 0
}

// Is this a real paid subscription plan?
export const isPaidPlan = (id) => !!planById(id)
