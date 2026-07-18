const CACHE_NAME = "festpro-v1"
const STATIC_CACHE = "festpro-static-v1"
const DYNAMIC_CACHE = "festpro-dynamic-v1"
const API_CACHE = "festpro-api-v1"

const STATIC_ASSETS = [
  "/",
  "/mobile",
  "/mobile/login",
  "/manifest.json",
]

const API_CACHE_LIMIT = 50
const DYNAMIC_CACHE_LIMIT = 100

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") {
    if (navigator.onLine === false) {
      event.respondWith(
        new Response(
          JSON.stringify({ offline: true, message: "Queued for sync when online" }),
          { headers: { "Content-Type": "application/json" } }
        )
      )
    }
    return
  }

  if (request.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE, API_CACHE_LIMIT))
    return
  }

  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT))
})

async function cacheFirstStrategy(request, cacheName = STATIC_CACHE) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response("Offline", { status: 503 })
  }
}

async function networkFirstStrategy(request, cacheName = DYNAMIC_CACHE, limit = DYNAMIC_CACHE_LIMIT) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
      trimCache(cacheName, limit)
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.headers.get("Accept")?.includes("text/html")) {
      return caches.match("/mobile")
    }
    return new Response(JSON.stringify({ offline: true, error: "Network unavailable" }), {
      headers: { "Content-Type": "application/json" },
    })
  }
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxItems) {
    const toDelete = keys.slice(0, keys.length - maxItems)
    await Promise.all(toDelete.map((key) => cache.delete(key)))
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-queue") {
    event.waitUntil(processSyncQueue())
  }
  if (event.tag === "sync-media") {
    event.waitUntil(processMediaQueue())
  }
})

async function processSyncQueue() {
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_TRIGGERED", payload: {} })
  })
}

async function processMediaQueue() {
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({ type: "MEDIA_SYNC_TRIGGERED", payload: {} })
  })
}

self.addEventListener("push", (event) => {
  if (!event.data) return
  try {
    const data = event.data.json()
    const options = {
      title: data.title || "FestPro",
      body: data.body || "",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: data.vibrate || [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || "default",
      renotify: data.renotify || false,
    }
    event.waitUntil(self.registration.showNotification(options.title, options))
  } catch (e) {
    event.waitUntil(
      self.registration.showNotification("FestPro", { body: event.data.text(), icon: "/icons/icon-192x192.png" })
    )
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/mobile"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const matchingClient = windowClients.find((client) => client.url === url)
      if (matchingClient) {
        matchingClient.focus()
      } else {
        clients.openWindow(url)
      }
    })
  )
})
