const CACHE_NAME = 'neon-music-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './data.js',
    './manifest.json',
    // You can include specific media files here if desired, 
    // but it's generally better to rely on runtime caching for large media 
    // unless you have a small core set, e.g., './On My Way.mp3', './V1.mp4'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

// Activate Event
self.addEventListener('activate', event => {
    const cacheAllowlist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Claim clients immediately so the page doesn't need to be refreshed
});

// Fetch Event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(networkResponse => {

                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Always return a valid Response object
                        return new Response("Offline", {
                            status: 503,
                            statusText: "Offline"
                        });
                    });
            })
    );
});
