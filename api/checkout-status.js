// Vercel serverless function — verifies a completed Checkout Session on return from Stripe.
// Also grants add-on report credits when the confirmed session is a report pack (idempotent).

const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'

function monthKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// Grant purchased pack credits to the buyer's user_metadata. Idempotent: each Stripe
// session is only ever counted once (tracked in pack_sessions). Credits reset monthly.
async function grantPackCredits(session) {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  const md = session.metadata || {}
  const userId = md.userId
  const credits = parseInt(md.credits, 10)
  if (!svc || !userId || !credits) return null
  const admin = { apikey: svc, Authorization: `Bearer ${svc}`, 'content-type': 'application/json' }
  try {
    const gr = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, { headers: admin })
    if (!gr.ok) return null
    const user = await gr.json()
    const meta = (user && user.user_metadata) || {}
    const seen = Array.isArray(meta.pack_sessions) ? meta.pack_sessions : []
    if (seen.includes(session.id)) {
      // Already granted — just report the current balance.
      return meta.extra_credits_month === monthKey() ? (meta.extra_credits || 0) : 0
    }
    const mk = monthKey()
    const base = meta.extra_credits_month === mk ? (meta.extra_credits || 0) : 0
    const next = base + credits
    const body = JSON.stringify({
      user_metadata: {
        ...meta,
        extra_credits: next,
        extra_credits_month: mk,
        pack_sessions: [...seen, session.id].slice(-50),
      },
    })
    const up = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, { method: 'PUT', headers: admin, body })
    if (!up.ok) return null
    return next
  } catch (e) {
    return null
  }
}

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

    let extraCredits = null
    const isPack = data.metadata && data.metadata.kind === 'pack'
    if (isPack && data.payment_status === 'paid') {
      extraCredits = await grantPackCredits(data)
    }

    res.status(200).json({
      status: data.status,
      paymentStatus: data.payment_status,
      email: data.customer_details && data.customer_details.email,
      customer: data.customer,
      subscription: data.subscription,
      kind: (data.metadata && data.metadata.kind) || null,
      extraCredits,
    })
  } catch (e) {
    res.status(500).json({ error: 'Could not reach Stripe.' })
  }
}
