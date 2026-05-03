const CACHE_NAME = "app-cache-v2";

const urlsToCache = [
  "/building-plan/",
  "/building-plan/index.html",
  "/building-plan/app.js",
  "/building-plan/manifest.json",
  "/building-plan/logo.png"
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