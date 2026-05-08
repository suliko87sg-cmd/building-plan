const CACHE_NAME = "app-cache-v1";

// temporary disabled service worker
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});