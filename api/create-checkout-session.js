// Vercel serverless function — creates a Stripe Checkout Session for the Investor Pro subscription.
// The secret STRIPE_SECRET_KEY lives only here (server-side), never in the browser.

const INVESTOR_PRO_CENTS = 49700 // $497 / month

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

  const p = new URLSearchParams()
  p.append('mode', 'subscription')
  p.append('line_items[0][quantity]', '1')
  p.append('line_items[0][price_data][currency]', 'usd')
  p.append('line_items[0][price_data][unit_amount]', String(INVESTOR_PRO_CENTS))
  p.append('line_items[0][price_data][recurring][interval]', 'month')
  p.append('line_items[0][price_data][product_data][name]', 'PropScope Investor Pro')
  p.append('line_items[0][price_data][product_data][description]', 'Unlimited Deal Intelligence reports')
  p.append('success_url', `${origin}/app/billing?success=1&session_id={CHECKOUT_SESSION_ID}`)
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
