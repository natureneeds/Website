// Kisan OS Progressive Web App Service Worker
const CACHE_NAME = 'kisan-os-cache-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/plan',
  '/ledger',
  '/market',
  '/find',
  '/support',
]

// Install event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event: Network-first with cache fallback for navigation & APIs
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Navigation requests: Serve cached HTML or fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/')
        })
    )
    return
  }

  // Assets and API caching strategy: Stale-while-revalidate / Network-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Return cached response if offline
          return cachedResponse
        })

      return cachedResponse || fetchPromise
    })
  )
})

// Background sync simulation & messaging
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
