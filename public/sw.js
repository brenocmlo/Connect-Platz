// Connect Platz CRM Service Worker for PWA & Web Push
const CACHE_NAME = "connect-platz-pwa-v3";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // 1. Não intercepta navegação de páginas (deixa o navegador lidar com redirects de autenticação nativamente)
  // Isso previne o erro do Safari / WebKit: 'Response served by service worker has redirections'
  if (event.request.mode === "navigate") {
    return;
  }

  // 2. Ignora requisições de API para manter dados sempre frescos
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return cachedResponse;
      });
    })
  );
});

// Suporte a Web Push Notifications nativas PWA
self.addEventListener("push", (event) => {
  let data = {
    title: "Connect Platz CRM",
    body: "Você possui uma nova atualização no CRM.",
    url: "/crm/leads",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/crm/leads",
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: "open", title: "Ver Lead" },
      { action: "close", title: "Dispensar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Abertura de janela ao clicar na notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/crm/leads";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes("/crm") && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
