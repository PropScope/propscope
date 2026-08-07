// Vercel serverless function — founder-only admin overview.
// Verifies the caller is an allowlisted admin, then aggregates Supabase (users/reports)
// and live Stripe (revenue/subscriptions) into a daily business dashboard.

const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'albee816@gmail.com')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)

const DAY = 86400000
const ymd = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }
const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime() }

function seriesByDay(items, field, todayStart) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const t = todayStart - i * DAY
    const d = new Date(t)
    days.push({ key: ymd(t), label: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 })
  }
  const idx = Object.fromEntries(days.map((x) => [x.key, x]))
  items.forEach((it) => { const k = ymd(new Date(it[field]).getTime()); if (idx[k]) idx[k].count++ })
  return days.map((x) => ({ label: x.label, count: x.count }))
}

async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const headers = { Authorization: `Bearer ${key}` }
  try {
    const [aR, cR, chR] = await Promise.all([
      fetch('https://api.stripe.com/v1/subscriptions?status=active&limit=100', { headers }),
      fetch('https://api.stripe.com/v1/subscriptions?status=canceled&limit=100', { headers }),
      fetch('https://api.stripe.com/v1/charges?limit=100', { headers }),
    ])
    const active = aR.ok ? (await aR.json()).data || [] : []
    const canceled = cR.ok ? (await cR.json()).data || [] : []
    const charges = chR.ok ? (await chR.json()).data || [] : []

    let mrrCents = 0
    active.forEach((s) => ((s.items && s.items.data) || []).forEach((it) => {
      const amt = (it.price && it.price.unit_amount) || 0
      const interval = it.price && it.price.recurring && it.price.recurring.interval
      const qty = it.quantity || 1
      mrrCents += (interval === 'year' ? amt / 12 : amt) * qty
    }))

    const paid = charges.filter((c) => c.paid && !c.refunded)
    const monthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime() })()
    const revThisMonthCents = paid.filter((c) => c.created * 1000 >= monthStart).reduce((a, c) => a + (c.amount || 0), 0)
    const recentPayments = paid.slice(0, 6).map((c) => ({
      amount: Math.round((c.amount || 0) / 100),
      email: (c.billing_details && c.billing_details.email) || c.receipt_email || '',
      created: c.created * 1000,
    }))

    return {
      mrr: Math.round(mrrCents / 100),
      activeSubs: active.length,
      canceledSubs: canceled.length,
      revenueThisMonth: Math.round(revThisMonthCents / 100),
      recentPayments,
    }
  } catch (e) {
    return null
  }
}

export default async function handler(req, res) {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!svc) { res.status(500).json({ error: 'Admin is not configured yet (missing service-role key).' }); return }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) { res.status(401).json({ error: 'Not signed in.' }); return }

  try {
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: svc, Authorization: `Bearer ${token}` } })
    const u = await ures.json()
    if (!ures.ok || !u || !u.email || !ADMIN_EMAILS.includes(String(u.email).toLowerCase())) {
      res.status(403).json({ error: 'Not authorized.' }); return
    }
  } catch (e) {
    res.status(401).json({ error: 'Could not verify your session.' }); return
  }

  // Admin maintenance action: set a user's plan flag (metadata-merged, never wipes other fields).
  if (req.method === 'POST') {
    const body = (req.body && typeof req.body === 'object') ? req.body : {}
    if (body.action === 'set-plan') {
      const VALID = ['free', 'deal-check', 'deal-analyzer', 'deal-pro', 'investor-pro']
      const targetId = String(body.userId || '')
      const plan = String(body.plan || '')
      if (!targetId || !VALID.includes(plan)) { res.status(400).json({ error: 'Missing or invalid userId/plan.' }); return }
      try {
        const gr = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${targetId}`, { headers: { apikey: svc, Authorization: `Bearer ${svc}` } })
        const cur = gr.ok ? await gr.json() : {}
        const merged = Object.assign({}, cur.user_metadata || {}, { plan })
        if (body.unlinkStripe) { merged.stripeCustomerId = ''; merged.subscriptionId = '' }
        const pr = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${targetId}`, {
          method: 'PUT',
          headers: { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_metadata: merged }),
        })
        const j = await pr.json().catch(() => ({}))
        if (!pr.ok) { res.status(400).json({ error: (j && j.msg) || 'Could not update plan.' }); return }
        res.status(200).json({ ok: true, plan: (j.user_metadata && j.user_metadata.plan) || plan }); return
      } catch (e) {
        res.status(500).json({ error: 'Could not update plan.' }); return
      }
    }
    res.status(400).json({ error: 'Unknown action.' }); return
  }

  try {
    let users = []
    for (let page = 1; page <= 20; page++) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers: { apikey: svc, Authorization: `Bearer ${svc}` } })
      if (!r.ok) break
      const j = await r.json()
      const list = j.users || []
      users = users.concat(list)
      if (list.length < 1000) break
    }

    const rr = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=id,created_at,tier,verdict,score,address,city,state,user_id`, { headers: { apikey: svc, Authorization: `Bearer ${svc}` } })
    const reports = rr.ok ? await rr.json() : []

    const todayStart = startOfDay(Date.now())
    const weekStart = todayStart - 6 * DAY
    const since = (items, f, t) => items.filter((x) => new Date(x[f]).getTime() >= t).length

    const proUsers = users.filter((x) => x.user_metadata && x.user_metadata.plan === 'investor-pro').length
    const reportsByTier = {}
    reports.forEach((rp) => { const t = rp.tier || 'deal-analyzer'; reportsByTier[t] = (reportsByTier[t] || 0) + 1 })

    const verdictMix = { Strong: 0, Moderate: 0, Thin: 0 }
    let scoreSum = 0, scoreN = 0
    const marketCount = {}
    reports.forEach((rp) => {
      if (verdictMix[rp.verdict] != null) verdictMix[rp.verdict]++
      if (Number(rp.score) > 0) { scoreSum += Number(rp.score); scoreN++ }
      const mkt = [rp.city, rp.state].filter(Boolean).join(', ')
      if (mkt) marketCount[mkt] = (marketCount[mkt] || 0) + 1
    })
    const topMarkets = Object.entries(marketCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([market, count]) => ({ market, count }))
    const usersWithReport = new Set(reports.map((rp) => rp.user_id).filter(Boolean)).size

    const byNew = (a, b) => new Date(b.created_at) - new Date(a.created_at)
    const stripe = await getStripe()

    res.status(200).json({
      totalUsers: users.length,
      proUsers,
      totalReports: reports.length,
      mrr: stripe ? stripe.mrr : proUsers * 497,
      mrrIsReal: !!stripe,
      usersToday: since(users, 'created_at', todayStart),
      usersWeek: since(users, 'created_at', weekStart),
      reportsToday: since(reports, 'created_at', todayStart),
      reportsWeek: since(reports, 'created_at', weekStart),
      signupsSeries: seriesByDay(users, 'created_at', todayStart),
      reportsSeries: seriesByDay(reports, 'created_at', todayStart),
      reportsByTier,
      verdictMix,
      avgScore: scoreN ? Math.round(scoreSum / scoreN) : 0,
      topMarkets,
      activation: { withReport: usersWithReport, total: users.length },
      stripe,
      recentUsers: users.slice().sort(byNew).slice(0, 8).map((x) => ({ email: x.email, plan: (x.user_metadata && x.user_metadata.plan) || 'deal-analyzer', createdAt: x.created_at })),
      recentReports: reports.slice().sort(byNew).slice(0, 8).map((x) => ({ address: x.address, tier: x.tier, verdict: x.verdict, score: x.score, createdAt: x.created_at })),
    })
  } catch (e) {
    res.status(500).json({ error: 'Could not load admin data.' })
  }
}
