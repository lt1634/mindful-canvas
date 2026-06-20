const CACHE = "mindful-canvas-v2-zen-v43";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/logo-mark.svg",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isNetworkFirstRequest(request) {
  const accept = request.headers.get("accept") || "";
  if (request.mode === "navigate" || accept.includes("text/html")) return true;
  const { pathname } = new URL(request.url);
  return pathname.endsWith(".js") || pathname.endsWith(".css");
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  if (isNetworkFirstRequest(e.request)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request)
          .then((res) => {
            if (res.ok && e.request.url.startsWith(self.location.origin)) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
            }
            return res;
          })
          .catch(() => cached)
    )
  );
});
