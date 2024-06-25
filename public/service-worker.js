// Choose a cache name
const cacheName = 'bingo-cache-v1';

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', event => {
    console.log('Service worker install event!');
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

    // Bug fix
    // https://stackoverflow.com/a/49719964
    if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;

    event.respondWith(
        caches.open(cacheName).then(cache => {
            return cache
                .match(req)
                .then(response => {
                    if (response) {
                        // If there is an entry in the cache for event.request,
                        // then response will be defined and we can just return it.
                        // Note that in this example, only font resources are cached.
                        // console.log(" Found response in cache:", response.url);

                        return response;
                    }

                    // Otherwise, if there is no entry in the cache for event.request,
                    // response will be undefined, and we need to fetch() the resource.
                    // console.log(" No response for %s found in cache. About to fetch from network...", event.request.url);

                    // We call .clone() on the request since we might use it
                    // in a call to cache.put() later on.
                    // Both fetch() and cache.put() "consume" the request,
                    // so we need to make a copy.
                    // (see https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)
                    return fetch(req.clone()).then(response => {
                        // console.log("  Network response from", req.url);

                        if (response.status < 400) {
                            // This avoids caching responses that we know are errors
                            // (i.e. HTTP status code of 4xx or 5xx).
                            
                            // console.log("   Caching the response to", req.url);
                            // We call .clone() on the response to save a copy of it
                            // to the cache. By doing so, we get to keep the original
                            // response object which we will return back to the controlled
                            // page.
                            cache.put(req, response.clone());
                        } else {
                            // console.warn("   Not caching the response to", req.url);
                        }

                        // Return the original response object, which will be used to
                        // fulfill the resource request.
                        return response;
                    });
                })
                .catch(error => {
                    // This catch() will handle exceptions that arise from the match()
                    // or fetch() operations.
                    // Note that a HTTP error response (e.g. 404) will NOT trigger
                    // an exception.
                    // It will return a normal response object that has the appropriate
                    // error code set.
                    console.error("  Error in fetch handler:", error);

                    throw error;
                });
        }),
    );
});