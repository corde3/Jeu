// Garde l'application et sa banque de questions disponibles hors connexion.
// Changez le numéro ci-dessous pour forcer une mise à jour chez tous les joueurs.
const CACHE = "ctf-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "ressources.txt",
  "donnees/quiz.txt", "donnees/versets.txt", "donnees/coeur.txt", "donnees/qui.txt", "donnees/defis.txt", "donnees/mariage.txt"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord pour avoir la dernière banque ; copie locale si le réseau manque.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
