// Minimal light/dark theme helper (portal only). Persists to localStorage.
const KEY = 'ps-theme'

export function getTheme() {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}
export function applyTheme(t) {
  const root = document.documentElement
  if (t === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}
export function setTheme(t) {
  try { localStorage.setItem(KEY, t) } catch {}
  applyTheme(t)
}
export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
