// Securely persist edited report numbers server-side (service role bypasses RLS,
// after verifying the signed-in user actually owns the report).

const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'
const COLS = ['address', 'city', 'state', 'zip', 'tier', 'strategy', 'status', 'score', 'verdict']

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!svc) { res.status(500).json({ error: 'Server is not configured to save changes.' }); return }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) { res.status(401).json({ error: 'Please sign in to save changes.' }); return }

  const { id, patch } = (req.body && typeof req.body === 'object') ? req.body : {}
  if (!id || !patch || typeof patch !== 'object') { res.status(400).json({ error: 'Missing report id or changes.' }); return }

  try {
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: svc, Authorization: `Bearer ${token}` } })
    const u = ures.ok ? await ures.json() : null
    if (!u || !u.id) { res.status(401).json({ error: 'Your session has expired — please sign in again.' }); return }

    const auth = { apikey: svc, Authorization: `Bearer ${svc}`, 'content-type': 'application/json' }
    const gr = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${id}&select=*`, { headers: auth })
    const rows = gr.ok ? await gr.json() : []
    const row = Array.isArray(rows) ? rows[0] : null
    if (!row) { res.status(404).json({ error: 'Report not found.' }); return }
    if (row.user_id && row.user_id !== u.id) { res.status(403).json({ error: 'You can only edit your own reports.' }); return }

    const cols = {}
    const dataPatch = {}
    Object.entries(patch).forEach(([k, v]) => { if (COLS.includes(k)) cols[k] = v; else dataPatch[k] = v })
    const body = JSON.stringify({ ...cols, data: { ...(row.data || {}), ...dataPatch } })

    const up = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${id}`, {
      method: 'PATCH', headers: { ...auth, Prefer: 'return=representation' }, body,
    })
    const updated = up.ok ? await up.json() : null
    if (!updated || !updated[0]) {
      const t = await up.text().catch(() => '')
      res.status(502).json({ error: 'Could not save changes.', detail: t.slice(0, 200) }); return
    }
    res.status(200).json(updated[0])
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong saving your changes.', detail: String(e).slice(0, 200) })
  }
}
