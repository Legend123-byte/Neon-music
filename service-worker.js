const CACHE_NAME = 'neon-music-v3';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/data.js',
    '/manifest.json'
];

// INSTALL
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// FETCH
self.addEventListener('fetch', (event) => {

    if (event.request.method !== 'GET') return;

    // 1️⃣ Navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return response;
                })
                .catch(() => {
                    return caches.match('/index.html');
                })
        );
        return;
    }

    // 2️⃣ For other assets → Network First
    event.respondWith(
        fetch(event.request)
            .then((response) => {

                if (!response || response.status !== 200) {
                    return caches.match(event.request);
                }

                const responseClone = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseClone);
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
