import { supabase } from './supabase.js'

const THUMBS = ['#1d4ed8', '#0ea5e9', '#0d9488', '#1e40af', '#0369a1', '#075985']

// Flatten a stored row (top-level columns + jsonb `data`) into one object the UI can read.
export function flatten(row) {
  if (!row) return null
  return { ...(row.data || {}), ...row, createdAt: row.created_at }
}

// Call the AI function, then save the result to Supabase for this user.
export async function generateReport(input, { paid = false } = {}) {
  const { data: sess } = await supabase.auth.getSession()
  const token = sess && sess.session && sess.session.access_token
  const res = await fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ ...input, paid }),
  })
  if (!res.ok) {
    let msg = 'The report could not be generated. Please try again.'
    try { const e = await res.json(); if (e && e.error) msg = e.error } catch {}
    throw new Error(msg)
  }
  const ai = await res.json()

  const bestStrategy = () => {
    const s = (ai.strategies || []).slice().sort((a, b) => (b.roi || 0) - (a.roi || 0))
    return s[0] && s[0].name
  }
  const chosen = (input.strategy && !/not sure/i.test(input.strategy))
    ? input.strategy
    : (bestStrategy() || 'BRRRR')

  const record = {
    address: input.address || 'Untitled property',
    city: input.city || '', state: input.state || '', zip: input.zip || '',
    tier: input.tier || 'deal-analyzer',
    strategy: chosen,
    status: 'complete',
    score: Math.round(Number(ai.score) || 0),
    verdict: ai.verdict || 'Moderate',
    data: { ...ai, thumb: THUMBS[Math.floor(Math.random() * THUMBS.length)] },
  }

  const { data, error } = await supabase.from('reports').insert(record).select().single()
  if (error) throw error
  return flatten(data)
}

// How many reports this user already has (used to grant the first one free).
export async function reportCount() {
  const { count, error } = await supabase.from('reports').select('id', { count: 'exact', head: true })
  if (error) throw error
  return count || 0
}

// Reports run in the current calendar month (for the usage meter and monthly cap).
export async function monthlyReportCount() {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const { count, error } = await supabase
    .from('reports').select('id', { count: 'exact', head: true }).gte('created_at', monthStart)
  if (error) throw error
  return count || 0
}

export async function listReports() {
  const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(flatten)
}

export async function getReport(id) {
  const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return flatten(data)
}

// Persist edited numbers through a secure server endpoint (service role bypasses RLS
// after verifying ownership). Client-side update is blocked by row-level security.
export async function updateReport(id, patch) {
  const { data: sess } = await supabase.auth.getSession()
  const token = sess && sess.session && sess.session.access_token
  const res = await fetch('/api/update-report', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ id, patch }),
  })
  if (!res.ok) {
    let msg = 'Could not save your changes.'
    try { const e = await res.json(); if (e && e.error) msg = e.error } catch {}
    throw new Error(msg)
  }
  return flatten(await res.json())
}
