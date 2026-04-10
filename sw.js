const CACHE_NAME = "app-cache-v1";

const urlsToCache = [
  "/building-plan/",
  "/building-plan/index.html",
  "/building-plan/app.js",
  "/building-plan/manifest.json",
  "/building-plan/logo.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});