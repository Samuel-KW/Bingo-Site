// Choose a cache name
const cacheName = 'bingo-cache-v1';

const precacheResources = [
    '/images/checkmark.svg',
    '/fonts/riotic-regular-400.otf', '/fonts/SairaCondensed-regular-200.ttf',
    '/styles/bingo.css', '/styles/header.css', '/styles/main.css', '/styles/popup.css', '/styles/sort-grid.css', '/styles/menu-toggle.css',
    '/scripts/bingo.js', '/scripts/main.js', '/scripts/popup.js', '/scripts/sha256.min.js', '/scripts/storage.js',
    '/', '/index.html',
];

async function cacheRequest(request) {
    const response = await fetch(request);
    
    if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }

    return response;
}

async function cacheFirst(request) {

    const cache = await caches.match(request);
    if (cache) return cache;

    const response = await cacheRequest(request);
    return response;
}

async function networkFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            cacheRequest(request);
            return cachedResponse;
        }

        const networkResponse = await cacheRequest(request);
        return networkResponse;

    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}


// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', event => {
    console.log('Service worker install event!');

    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(precacheResources))
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker activate event!');

    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(name => {
                    if (name !== cacheName) {

                        // If this cache name isn't present in the set of
                        // "expected" cache names, then delete it.
                        // console.log("Deleting out of date cache:", name);
                        return caches.delete(cacheName);
                    }
                }),
            ),
        ),
    );
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', event => {

    // Get the request
    const req = event.request;
    const url = new URL(req.url);

    // console.log('Fetch event for:', url);

    // Bug fix
    // https://stackoverflow.com/a/49719964
    if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;

    const dynamic = url.pathname.startsWith('/api/');
    const response = dynamic ? networkFirst(req) : cacheFirst(req);

    event.respondWith(response);

});