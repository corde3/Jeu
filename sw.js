// Garde l'application et sa banque de questions disponibles hors connexion.
// Changez le numéro ci-dessous pour forcer une mise à jour chez tous les joueurs.
const CACHE = "ctf-v7";
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

// Notification envoyée par le serveur quand le partenaire écrit, invite à jouer ou relève un défi.
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { corps: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titre || "Corde à Trois Fils", {
    body: d.corps || "Nouveau message dans votre espace.", icon: "icon-192.png", badge: "icon-192.png",
    tag: "espace", renotify: true, data: { url: "./?onglet=esp" }
  }));
});
// Toucher la notification ouvre l'appli sur « Notre espace ».
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ("focus" in w) { w.postMessage("espace"); return w.focus(); }
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || "./");
  }));
});
