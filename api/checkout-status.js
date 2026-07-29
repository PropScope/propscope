// Vercel serverless function — verifies a completed Checkout Session on return from Stripe.

export default async function handler(req, res) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    res.status(500).json({ error: 'Payments are not configured yet (missing Stripe key).' })
    return
  }
  const id = (req.query && req.query.id) || ''
  if (!id) {
    res.status(400).json({ error: 'Missing session id.' })
    return
  }
  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    const data = await r.json()
    if (!r.ok) {
      res.status(400).json({ error: (data.error && data.error.message) || 'Stripe error.' })
      return
    }
    res.status(200).json({
      status: data.status,
      paymentStatus: data.payment_status,
      email: data.customer_details && data.customer_details.email,
    })
  } catch (e) {
    res.status(500).json({ error: 'Could not reach Stripe.' })
  }
}
