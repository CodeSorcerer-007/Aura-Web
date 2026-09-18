const CACHE_NAME = 'aura-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    '/icon-192.svg',
    '/icon-512.svg'
];

// Install: pre-cache application shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: stale-while-revalidate for local assets, network-first for external APIs
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Don't intercept non-GET requests or browser extension requests
    if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }

    // Cache-first / Stale-While-Revalidate strategy
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If offline and request is for page navigation, return cached root/index
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html') || caches.match('/');
                }
            });

            return cachedResponse || fetchPromise;
        })
    );
});
