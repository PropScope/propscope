// Securely delete a report server-side (service role bypasses RLS, after verifying
// the signed-in user actually owns it). Client delete is blocked by row-level security.

const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!svc) { res.status(500).json({ error: 'Server is not configured to delete reports.' }); return }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) { res.status(401).json({ error: 'Please sign in.' }); return }

  const { id } = (req.body && typeof req.body === 'object') ? req.body : {}
  if (!id) { res.status(400).json({ error: 'Missing report id.' }); return }

  try {
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: svc, Authorization: `Bearer ${token}` } })
    const u = ures.ok ? await ures.json() : null
    if (!u || !u.id) { res.status(401).json({ error: 'Your session has expired — please sign in again.' }); return }

    const auth = { apikey: svc, Authorization: `Bearer ${svc}`, 'content-type': 'application/json' }
    const gr = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${id}&select=user_id`, { headers: auth })
    const rows = gr.ok ? await gr.json() : []
    const row = Array.isArray(rows) ? rows[0] : null
    if (!row) { res.status(200).json({ ok: true }); return } // already gone
    if (row.user_id && row.user_id !== u.id) { res.status(403).json({ error: 'You can only delete your own reports.' }); return }

    const del = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${id}`, { method: 'DELETE', headers: auth })
    if (!del.ok) {
      const t = await del.text().catch(() => '')
      res.status(502).json({ error: 'Could not delete this report.', detail: t.slice(0, 200) }); return
    }
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong deleting the report.', detail: String(e).slice(0, 200) })
  }
}
