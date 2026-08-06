// Client helpers for Stripe Checkout (test mode).

export async function startPlanCheckout({ plan, interval, email, userId } = {}) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ plan, interval, email, userId, origin: window.location.origin }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout.')
  window.location.assign(data.url)
}

// Backwards-compatible alias (defaults to Investor Pro).
export const startProCheckout = (opts = {}) => startPlanCheckout({ plan: 'investor-pro', ...opts })

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

export async function startReportCheckout({ tier, email, userId } = {}) {
  const res = await fetch('/api/create-report-checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tier, email, userId, origin: window.location.origin }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout.')
  window.location.assign(data.url)
}

// Add-on report pack (e.g. 'pack-10', 'pack-25') for subscribers who run low mid-month.
export async function startPackCheckout({ pack, email, userId } = {}) {
  const res = await fetch('/api/create-report-checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pack, email, userId, origin: window.location.origin }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout.')
  window.location.assign(data.url)
}
