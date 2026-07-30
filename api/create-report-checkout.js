// Vercel serverless function — one-time Checkout for a single per-report tier.

const TIERS = {
  'deal-check':        { cents: 9700,  name: 'PropScope Deal Check',        desc: 'One go/no-go property report' },
  'deal-analyzer':     { cents: 29700, name: 'PropScope Deal Analyzer',     desc: 'One full investment report' },
  'deal-intelligence': { cents: 59700, name: 'PropScope Deal Intelligence', desc: 'One report with BRRRR + executive memo' },
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
  const tier = TIERS[d.tier] || TIERS['deal-analyzer']
  const origin = d.origin || req.headers.origin || `https://${req.headers.host}`

  const p = new URLSearchParams()
  p.append('mode', 'payment')
  p.append('line_items[0][quantity]', '1')
  p.append('line_items[0][price_data][currency]', 'usd')
  p.append('line_items[0][price_data][unit_amount]', String(tier.cents))
  p.append('line_items[0][price_data][product_data][name]', tier.name)
  p.append('line_items[0][price_data][product_data][description]', tier.desc)
  p.append('success_url', `${origin}/app/new?paid=1&session_id={CHECKOUT_SESSION_ID}`)
  p.append('cancel_url', `${origin}/app/new?canceled=1`)
  p.append('allow_promotion_codes', 'true')
  if (d.email) p.append('customer_email', d.email)
  if (d.userId) p.append('client_reference_id', d.userId)

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
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
