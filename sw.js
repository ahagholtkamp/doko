// Einfacher Service Worker – notwendig, damit Chrome die App als installierbar erkennt.
// Cached die App-Hülle (App Shell), damit die Seite auch offline startet.

const CACHE_NAME = "dokozettel-cache-v6";
const URLS_ZU_CACHEN = [
  "./",
  "./index.html",
  "./manifest.json",
  "./app-icon.png",
  "./app-icon-192.png"
];

// Beim Installieren: App-Hülle in den Cache legen
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_ZU_CACHEN);
    })
  );
  self.skipWaiting();
});

// Alte Caches beim Aktivieren aufräumen
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// WICHTIG: Ohne einen fetch-Handler zählt Chrome den Service Worker
// nicht als "aktiv genug" für die Installierbarkeits-Prüfung.
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      return (
        cachedResponse ||
        fetch(event.request).catch(function () {
          // Fallback, falls offline und nicht im Cache
          return caches.match("./index.html");
        })
      );
    })
  );
});
