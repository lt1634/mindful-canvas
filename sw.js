/**
 * Mindful Canvas Service Worker
 * Caching strategies: Network-first for HTML/JS/CSS, Cache-first for assets
 * @version 2.0.1
 */

const CACHE_VERSION = "v2-zen-v50";
const CACHE_NAME = `mindful-canvas-${CACHE_VERSION}`;
const OFFLINE_CACHE = "mindful-canvas-offline";

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/logo-mark.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./css/style.css",
  "./src/logic.js",
  "./js/app.js",
  "./js/gallery.js",
  "./js/feedback.js",
  "./src/i18n/index.js",
  "./src/i18n/zh.js",
  "./src/i18n/en.js",
];

// Assets to cache on first use (stale-while-revalidate)
const STALE_WHILE_REVALIDATE = ["./Songs/"];

/**
 * Install event: Pre-cache critical resources
 */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Pre-caching critical resources");
        return cache.addAll(PRECACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("[SW] Pre-cache failed:", err);
      })
  );
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => {
        const oldCaches = keys.filter((k) => k !== CACHE_NAME && k !== OFFLINE_CACHE);
        console.log("[SW] Cleaning old caches:", oldCaches);
        return Promise.all(oldCaches.map((k) => caches.delete(k)));
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Determine caching strategy based on request type
 * @param {Request} request
 * @returns {boolean} True if request should use network-first strategy
 */
function isNetworkFirstRequest(request) {
  const accept = request.headers.get("accept") || "";
  if (request.mode === "navigate" || accept.includes("text/html")) return true;
  const { pathname } = new URL(request.url);
  return pathname.endsWith(".js") || pathname.endsWith(".css");
}

/**
 * Check if request is for a stale-while-revalidate asset
 * @param {Request} request
 * @returns {boolean}
 */
function isStaleWhileRevalidate(request) {
  const { pathname } = new URL(request.url);
  return STALE_WHILE_REVALIDATE.some((prefix) => pathname.includes(prefix));
}

/**
 * Network-first strategy with cache fallback
 * @param {FetchEvent} e
 * @param {Request} request
 */
function networkFirstStrategy(e, request) {
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => {
        console.log("[SW] Network failed, serving from cache:", request.url);
        return caches.match(request);
      })
  );
}

/**
 * Stale-while-revalidate: Return cache immediately, update in background
 * @param {FetchEvent} e
 * @param {Request} request
 */
function staleWhileRevalidateStrategy(e, request) {
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((res) => {
            if (res.ok) {
              cache.put(request, res.clone());
            }
            return res;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      });
    })
  );
}

/**
 * Cache-first strategy with network fallback
 * @param {FetchEvent} e
 * @param {Request} request
 */
function cacheFirstStrategy(e, request) {
  e.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok && request.url.startsWith(self.location.origin)) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => {
            console.log("[SW] Cache miss and network failed:", request.url);
            return cached;
          })
    )
  );
}

/**
 * Main fetch event handler
 */
self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;

  // Skip cross-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  const { pathname } = new URL(e.request.url);

  // Stale-while-revalidate for audio and media assets
  if (isStaleWhileRevalidate(e.request)) {
    staleWhileRevalidateStrategy(e, e.request);
    return;
  }

  // Network-first for HTML, JS, CSS
  if (isNetworkFirstRequest(e.request)) {
    networkFirstStrategy(e, e.request);
    return;
  }

  // Cache-first for everything else (images, fonts, etc.)
  cacheFirstStrategy(e, e.request);
});

/**
 * Handle messages from clients
 */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
