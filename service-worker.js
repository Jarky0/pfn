/**
 * Service Worker for Primitive Formulierungen für Neudenker
 * Enables offline functionality
 */

const CACHE_VERSION = "v4"; // Increment this value to invalidate the cache
const CACHE_NAME = `pfn-cache-${CACHE_VERSION}`;

// Essential application assets to cache
const CORE_ASSETS = [
    "/",
    "/index.html",
    "/styles.css",
    "/game-statistics-styles.css",
    "/manifest.json"
];

// JavaScript modules to cache
const JS_MODULES = [
    "/script.js",
    "/modules/WordLoader.js",
    "/modules/UIEffects.js",
    "/modules/GameController.js",
    "/modules/GameStatistics.js",
    "/state/GameState.js",
    "/components/ScoreBoard.js",
    "/components/TeamSetup.js",
    "/components/WordDisplay.js",
    "/components/GameTimer.js",
    "/utils/common.js",
    "/game-statistics.js" // Legacy module for backward compatibility
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-regular-400.woff2"
];

// Combined list of all assets to cache
const ASSETS_TO_CACHE = [
    ...CORE_ASSETS,
    ...JS_MODULES,
    ...EXTERNAL_RESOURCES
];

// Install event - cache assets
self.addEventListener("install", (event) => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();

    console.log(`[ServiceWorker] Installing version ${CACHE_VERSION}`);

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[ServiceWorker] Caching app shell and content");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    // Take control of all clients immediately
    event.waitUntil(self.clients.claim());

    console.log(`[ServiceWorker] Activating version ${CACHE_VERSION}`);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return (
                            cacheName.startsWith("pfn-cache-") && cacheName !== CACHE_NAME
                        );
                    })
                    .map((cacheName) => {
                        console.log(`[ServiceWorker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
});

// Fetch event - advanced caching strategy with network-first approach for HTML
self.addEventListener("fetch", (event) => {
    // Different strategies based on request type
    if (
        event.request.mode === "navigate" ||
        (event.request.method === "GET" &&
            event.request.headers.get("accept")?.includes("text/html"))
    ) {
        // Network-first approach for HTML navigation requests
        // This ensures users always get the latest HTML unless offline
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the latest version
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If no cached version, show offline page
                            return caches.match('/index.html');
                        });
                })
        );
    } else if (event.request.url.includes('/words_deDE.txt')) {
        // Special handling for word list - stale-while-revalidate
        // Use cached version immediately while updating it in the background
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request)
                        .then(networkResponse => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(error => {
                            console.log('[ServiceWorker] Failed to update word list:', error);
                        });

                    // Return cached response immediately if available
                    return cachedResponse || fetchPromise;
                });
            })
        );
    } else {
        // Cache-first approach for other static assets
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    // Asset found in cache, return it
                    // Try to update cache in background for next time
                    fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse.ok) {
                                caches.open(CACHE_NAME).then(cache => {
                                    // Only cache same-origin requests
                                    if (event.request.url.startsWith(self.location.origin) ||
                                        EXTERNAL_RESOURCES.includes(event.request.url)) {
                                        cache.put(event.request, networkResponse);
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            // Silently fail on background update
                            console.log(`[ServiceWorker] Failed to update ${event.request.url}`);
                        });

                    return cachedResponse;
                }

                // Not found in cache, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Clone the response
                        const responseToCache = response.clone();

                        if (response.ok) {
                            caches.open(CACHE_NAME).then(cache => {
                                // Only cache same-origin requests or whitelisted external resources
                                if (event.request.url.startsWith(self.location.origin) ||
                                    EXTERNAL_RESOURCES.includes(event.request.url)) {
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        }

                        return response;
                    })
                    .catch(error => {
                        console.log(`[ServiceWorker] Fetch failed: ${error}`);

                        // For image requests, return a placeholder
                        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1f1f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#555">Bild nicht verfügbar</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }

                        // For non-HTML navigation requests that fail, show error
                        return new Response(
                            "Netzwerkfehler, bitte überprüfe deine Internetverbindung.",
                            {
                                status: 503,
                                headers: { "Content-Type": "text/plain" },
                            }
                        );
                    });
            })
        );
    }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});