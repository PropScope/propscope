// Client helpers for Stripe Checkout (test mode).

export async function startProCheckout({ email, userId } = {}) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, userId, origin: window.location.origin }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout.')
  window.location.assign(data.url)
}

export async function confirmCheckout(sessionId) {
  const res = await fetch(`/api/checkout-status?id=${encodeURIComponent(sessionId)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not confirm checkout.')
  return data // { status, paymentStatus, email }
}
