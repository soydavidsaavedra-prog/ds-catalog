// Deliberately does nothing but pass every request straight to the
// network — this project is server-rendered and multi-tenant, so
// caching pages here risks showing one tenant stale/wrong data. Its only
// job is to exist: Chrome/Android's "installable" (Add to Home Screen)
// criteria require a controlling service worker with a fetch handler,
// which this satisfies without changing how any request behaves.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
