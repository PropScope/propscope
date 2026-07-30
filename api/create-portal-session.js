// Vercel serverless function — opens the Stripe Customer Portal so a subscriber can manage or cancel.

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
  if (!d.customerId) {
    res.status(400).json({ error: 'No customer on file for this account yet.' })
    return
  }
  const p = new URLSearchParams()
  p.append('customer', d.customerId)
  p.append('return_url', `${origin}/app/billing`)
  try {
    const r = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p.toString(),
    })
    const data = await r.json()
    if (!r.ok) {
      res.status(400).json({ error: (data.error && data.error.message) || 'Stripe error.' })
      return
    }
    res.status(200).json({ url: data.url })
  } catch (e) {
    res.status(500).json({ error: 'Could not reach Stripe.' })
  }
}
