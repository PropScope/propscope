// Vercel serverless function — creates a Stripe Checkout Session for a PropScope subscription plan.
// The secret STRIPE_SECRET_KEY lives only here (server-side), never in the browser.

// Amounts in cents. Annual = 12 x the annual monthly rate (a true 20% off the monthly price).
const PRICING = {
  'deal-check':    { name: 'PropScope Deal Check',    month: 3600,  year: 34800 },
  'deal-analyzer': { name: 'PropScope Deal Analyzer', month: 9900,  year: 94800 },
  'investor-pro':  { name: 'PropScope Investor Pro',  month: 24900, year: 238800 },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    res.status(500).json({ error: 'Payments are not configured yet (missing Stripe key).' })
    return
  }

  const d = (req.body && typeof req.body === 'object') ? req.body : {}
  const origin = d.origin || req.headers.origin || `https://${req.headers.host}`
  const plan = PRICING[d.plan] ? d.plan : 'deal-analyzer'
  const info = PRICING[plan]
  const interval = d.interval === 'year' ? 'year' : 'month'
  const amount = interval === 'year' ? info.year : info.month
  const stripeInterval = interval === 'year' ? 'year' : 'month'

  const p = new URLSearchParams()
  p.append('mode', 'subscription')
  p.append('line_items[0][quantity]', '1')
  p.append('line_items[0][price_data][currency]', 'usd')
  p.append('line_items[0][price_data][unit_amount]', String(amount))
  p.append('line_items[0][price_data][recurring][interval]', stripeInterval)
  p.append('line_items[0][price_data][product_data][name]', info.name + (interval === 'year' ? ' (annual)' : ''))
  p.append('line_items[0][price_data][product_data][description]', 'PropScope subscription')
  p.append('success_url', `${origin}/app/billing?success=1&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`)
  p.append('cancel_url', `${origin}/app/billing?canceled=1`)
  p.append('allow_promotion_codes', 'true')
  p.append('billing_address_collection', 'auto')
  if (d.email) p.append('customer_email', d.email)
  if (d.userId) p.append('client_reference_id', d.userId)

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: p.toString(),
    })
    const data = await r.json()
    if (!r.ok) {
      res.status(400).json({ error: (data.error && data.error.message) || 'Stripe rejected the request.' })
      return
    }
    res.status(200).json({ url: data.url })
  } catch (e) {
    res.status(500).json({ error: 'Could not reach Stripe. Please try again.' })
  }
}
