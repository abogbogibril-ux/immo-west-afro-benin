/**
 * sw.js — Service Worker PWA Immo West Afro Bénin
 *
 * Stratégies de cache :
 *   - App Shell (HTML/CSS/JS) : Cache First
 *   - Images : Cache First avec expiration 7 jours
 *   - API Supabase : Network First avec fallback
 *   - Pages : Stale While Revalidate
 *
 * Optimisé pour connexion lente (3G Bénin)
 */

const CACHE_VERSION = "v1.2.0";
const CACHE_NAMES = {
  shell: `immo-shell-${CACHE_VERSION}`,
  images: `immo-images-${CACHE_VERSION}`,
  pages: `immo-pages-${CACHE_VERSION}`,
  api: `immo-api-${CACHE_VERSION}`,
};

// Pages à précacher (App Shell)
const SHELL_URLS = [
  "/",
  "/recherche",
  "/publier",
  "/connexion",
  "/inscription",
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Installation ────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.shell).then((cache) => {
      console.log("[SW] Précachage App Shell...");
      return cache.addAll(SHELL_URLS).catch((err) => {
        console.warn("[SW] Certaines ressources non précachées:", err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activation — nettoyage anciens caches ──────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !Object.values(CACHE_NAMES).includes(key))
          .map((key) => {
            console.log("[SW] Suppression ancien cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch — stratégies de cache ────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== "GET") return;

  // Ignorer Chrome extensions
  if (!url.protocol.startsWith("http")) return;

  // ── Supabase API → Network First ─────────────────────────
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(networkFirst(request, CACHE_NAMES.api, 5000));
    return;
  }

  // ── Images → Cache First (7 jours) ───────────────────────
  if (request.destination === "image" || url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
    event.respondWith(cacheFirstWithExpiry(request, CACHE_NAMES.images, 7));
    return;
  }

  // ── App Shell (HTML pages) → Stale While Revalidate ──────
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.pages));
    return;
  }

  // ── Autres ressources statiques → Cache First ─────────────
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.shell));
    return;
  }
});

// ── Stratégies ──────────────────────────────────────────────

async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    );
    const networkResponse = await Promise.race([
      fetch(request.clone()),
      timeoutPromise,
    ]);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return offlineFallback(request);
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return offlineFallback(request);
  }
}

async function cacheFirstWithExpiry(request, cacheName, days) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    const dateHeader = cached.headers.get("date");
    if (dateHeader) {
      const age = (Date.now() - new Date(dateHeader).getTime()) / (1000 * 60 * 60 * 24);
      if (age < days) return cached;
    } else {
      return cached;
    }
  }
  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    if (cached) return cached;
    return new Response("", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request.clone())
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise || offlineFallback(request);
}

async function offlineFallback(request) {
  if (request.mode === "navigate") {
    const cache = await caches.open(CACHE_NAMES.pages);
    return (await cache.match("/offline")) || new Response(
      `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Hors ligne — Immo West Afro Bénin</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0d1117; color: #f0f6fc; text-align: center; padding: 24px; box-sizing: border-box; }
          .icon { font-size: 64px; margin-bottom: 24px; }
          h1 { font-size: 24px; margin-bottom: 12px; color: #10b981; }
          p { color: #8b949e; line-height: 1.6; max-width: 320px; margin: 0 auto 24px; }
          button { background: #10b981; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div>
          <div class="icon">📡</div>
          <h1>Vous êtes hors ligne</h1>
          <p>Vérifiez votre connexion internet pour accéder aux annonces immobilières du Bénin.</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  return new Response("", { status: 503 });
}

// ── Push Notifications ──────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "Immo West Afro Bénin",
      body: event.data.text(),
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/badge-72x72.png",
    tag: payload.tag || "immo-push",
    data: payload.data || {},
    actions: payload.actions || [
      { action: "open", title: "Voir" },
      { action: "close", title: "Fermer" },
    ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Immo West Afro", options)
  );
});

// ── Clic sur notification ───────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "close") return;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

// ── Background Sync (envoi messages hors ligne) ─────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // Récupérer les messages en attente depuis IndexedDB
  // et les envoyer quand la connexion revient
  console.log("[SW] Synchronisation des messages en attente...");
  // Implémentation avec IndexedDB à ajouter selon les besoins
}
