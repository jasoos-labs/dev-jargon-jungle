const CACHE = 'dev-jargon-jungle-v1'

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const root = new URL('./', self.registration.scope).toString()
    const response = await fetch(root)
    await cache.put(root, response.clone())
    const html = await response.text()
    const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g)].map(match => new URL(match[1], root).toString())
    await Promise.all(assets.map(async url => {
      try { const asset = await fetch(url); if (asset.ok) await cache.put(url, asset) } catch { /* optional asset */ }
    }))
    await cache.add(new URL('./manifest.webmanifest', root).toString())
    await cache.add(new URL('./icon.svg', root).toString())
    await cache.add(new URL('./apple-touch-icon.png', root).toString())
    await cache.add(new URL('./icon-192.png', root).toString())
    await cache.add(new URL('./icon-512.png', root).toString())
    await cache.add(new URL('./everest-base-camp.jpg', root).toString())
    await cache.add(new URL('./IMAGE-CREDITS.md', root).toString())
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter(name => (name.startsWith('dev-lingo-') || name.startsWith('dev-jargon-jungle-')) && name !== CACHE).map(name => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return
  event.respondWith((async () => {
    const cached = await caches.match(event.request)
    if (cached) return cached
    try {
      const response = await fetch(event.request)
      if (response.ok) {
        const cache = await caches.open(CACHE)
        await cache.put(event.request, response.clone())
      }
      return response
    } catch {
      return caches.match(new URL('./', self.registration.scope).toString())
    }
  })())
})
