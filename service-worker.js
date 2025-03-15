/**
 * Service Worker for Poetry for Neanderthals
 * Enables offline functionality
 */

const CACHE_VERSION = 'v2'; // Increment this value to invalidate the cache
const CACHE_NAME = `pfn-cache-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/word-loader.js',
    '/ui-effects.js',
    '/game-logic.js',
    '/script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-regular-400.woff2'
];

// Install event - cache assets
self.addEventListener('install', event => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    // Take control of all clients immediately
    event.waitUntil(self.clients.claim());
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('pfn-cache-') && cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    console.log('Deleting old cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Fetch event - serve from network first, then cache
self.addEventListener('fetch', event => {
    // Always try network first for HTML files to ensure latest version
    if (event.request.mode === 'navigate' || 
        (event.request.method === 'GET' && 
         event.request.headers.get('accept')?.includes('text/html'))) {
        
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // For all other assets, try network and update cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response
                const responseToCache = response.clone();
                
                if (response.ok) {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Only cache same-origin requests
                            if (event.request.url.startsWith(self.location.origin)) {
                                cache.put(event.request, responseToCache);
                            }
                        });
                }
                
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // If we're offline and no cached response, show a custom message
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        return new Response('Network error, please check your internet connection.', {
                            status: 503,
                            headers: {'Content-Type': 'text/plain'}
                        });
                    });
            })
    );
});