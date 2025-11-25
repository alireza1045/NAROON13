// Service Worker for NAROON Website
// Cache strategy: Cache First with Network Fallback

const CACHE_VERSION = 'v27';
const CACHE_NAME = `naroonsignmaker-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `naroonsignmaker-runtime-${CACHE_VERSION}`;

// Resources to cache on install
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/gallery.html',
    '/errorr.html',
    '/static/css/styles.css',
    '/static/js/script.js',
    '/static/js/gallery-page.js',
    '/static/js/ERRORR.js',
    '/static/data/gallery-data.json',
    '/favicon.ico'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static resources');
                return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
            })
            .catch((err) => {
                console.error('Cache install failed:', err);
            })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Take control immediately
});

// Fetch event - optimized for mobile with better cache strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    const isHtmlRequest =
        request.mode === 'navigate' ||
        request.destination === 'document' ||
        (request.headers.get('accept') || '').includes('text/html');

    // HTML: Network first, fallback to cache (always fresh content)
    if (isHtmlRequest) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (!response || response.status !== 200) {
                        return caches.match(request) || caches.match('/index.html');
                    }
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseToCache));
                    return response;
                })
                .catch(() => caches.match(request) || caches.match('/index.html'))
        );
        return;
    }

    // Static assets (CSS, JS, images): Stale-While-Revalidate for better performance
    const isStaticAsset = 
        url.pathname.includes('/static/') ||
        url.pathname.includes('/images/') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js');

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                // Return cached version immediately
                const fetchPromise = fetch(request).then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                }).catch(() => null);

                // Return cached version if available, otherwise wait for network
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // Other resources: Cache First with Network Fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                })
                .catch(() => undefined);
        })
    );
});

// Background sync for offline form submissions (optional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Implement background sync logic if needed
    return Promise.resolve();
}

