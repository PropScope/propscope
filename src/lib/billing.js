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
  return data // { status, paymentStatus, email, customer, subscription }
}

export async function openBillingPortal(customerId) {
  const res = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ customerId, origin: window.location.origin }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Could not open the billing portal.')
  window.location.assign(data.url)
}

export async function getSubscriptionStatus(subscriptionId) {
  const res = await fetch(`/api/subscription-status?id=${encodeURIComponent(subscriptionId)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not check subscription.')
  return data // { status, cancelAtPeriodEnd, currentPeriodEnd }
}
