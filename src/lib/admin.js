import { supabase } from './supabase.js'

export const ADMIN_EMAILS = ['albee816@gmail.com']
export const isAdmin = (u) => !!u && ADMIN_EMAILS.includes(String(u.email || '').toLowerCase())

export async function getAdminOverview() {
  const { data } = await supabase.auth.getSession()
  const token = (data && data.session && data.session.access_token) || ''
  const res = await fetch('/api/admin', { headers: { Authorization: `Bearer ${token}` } })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j.error || 'Could not load admin data.')
  return j
}
