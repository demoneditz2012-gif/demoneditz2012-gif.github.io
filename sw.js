// ============================================================
// 🔧 SERVICE WORKER — Caches app for offline use
// Version bump this string any time you update the app
// ============================================================
const CACHE_NAME = "learnwords-v1";

// Files to cache for offline use
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap"
];

// Install: cache all assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache local files (Google Fonts may fail offline — that's OK)
      return cache.addAll(["./index.html", "./manifest.json"]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Cache new successful responses for local assets
          if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // If offline and not cached, return index.html as fallback
          if (event.request.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
