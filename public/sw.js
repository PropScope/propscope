// PropScope service worker — makes the app installable and works offline as a fallback.
// Network-first so users always get the latest deployed build when online (no stale bundles),
// with a cache fallback only when the network is unavailable.
const CACHE = 'propscope-v1'

self.addEventListener('install', () => { self.skipWaiting() })

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  e.respondWith((async () => {
    try {
      const res = await fetch(req)
      if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE)
        cache.put(req, res.clone())
      }
      return res
    } catch (err) {
      const cached = await caches.match(req)
      if (cached) return cached
      if (req.mode === 'navigate') {
        const shell = await caches.match('/app') || await caches.match('/')
        if (shell) return shell
      }
      throw err
    }
  })())
})
