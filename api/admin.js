// Vercel serverless function — founder-only admin overview.
// Uses the Supabase service-role key (server-only) and verifies the caller is an allowlisted admin.

const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'albee816@gmail.com')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)

export default async function handler(req, res) {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!svc) { res.status(500).json({ error: 'Admin is not configured yet (missing service-role key).' }); return }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) { res.status(401).json({ error: 'Not signed in.' }); return }

  // Verify the caller and confirm they are an admin
  try {
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: svc, Authorization: `Bearer ${token}` },
    })
    const u = await ures.json()
    if (!ures.ok || !u || !u.email || !ADMIN_EMAILS.includes(String(u.email).toLowerCase())) {
      res.status(403).json({ error: 'Not authorized.' }); return
    }
  } catch (e) {
    res.status(401).json({ error: 'Could not verify your session.' }); return
  }

  try {
    // All users (admin API, paginated)
    let users = []
    for (let page = 1; page <= 20; page++) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, {
        headers: { apikey: svc, Authorization: `Bearer ${svc}` },
      })
      if (!r.ok) break
      const j = await r.json()
      const list = j.users || []
      users = users.concat(list)
      if (list.length < 1000) break
    }

    // All reports (service role bypasses RLS)
    const rr = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=id,created_at,tier,verdict,score,address`, {
      headers: { apikey: svc, Authorization: `Bearer ${svc}` },
    })
    const reports = rr.ok ? await rr.json() : []

    const proUsers = users.filter((x) => x.user_metadata && x.user_metadata.plan === 'investor-pro').length
    const reportsByTier = {}
    reports.forEach((rp) => { const t = rp.tier || 'deal-analyzer'; reportsByTier[t] = (reportsByTier[t] || 0) + 1 })

    const byNew = (a, b) => new Date(b.created_at) - new Date(a.created_at)

    res.status(200).json({
      totalUsers: users.length,
      proUsers,
      mrr: proUsers * 497,
      totalReports: reports.length,
      reportsByTier,
      recentUsers: users.slice().sort(byNew).slice(0, 8).map((x) => ({
        email: x.email,
        plan: (x.user_metadata && x.user_metadata.plan) || 'deal-analyzer',
        createdAt: x.created_at,
      })),
      recentReports: reports.slice().sort(byNew).slice(0, 8).map((x) => ({
        address: x.address, tier: x.tier, verdict: x.verdict, score: x.score, createdAt: x.created_at,
      })),
    })
  } catch (e) {
    res.status(500).json({ error: 'Could not load admin data.' })
  }
}
