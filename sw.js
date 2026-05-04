const CACHE_NAME = "app-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/logo.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(() => {
            console.log("❌ не закэшировался:", url);
          });
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});