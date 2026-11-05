// offline cache for the installed game; the ranking API always goes to the network
const CACHE = 'barquinho-v1';
const CORE = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png',   "/img/adila-face.jpg",   "/img/adila.jpg",   "/img/bequi-face.jpg",   "/img/bequi.jpg",   "/img/breno-face.jpg",   "/img/breno.jpg",   "/img/davi-face.jpg",   "/img/davi.jpg",   "/img/debora-face.jpg",   "/img/debora.jpg",   "/img/grupo.png",   "/img/iago-face.jpg",   "/img/iago.jpg",   "/img/ingrid-face.jpg",   "/img/ingrid.jpg",   "/img/jael-face.jpg",   "/img/jael.jpg",   "/img/levi-face.jpg",   "/img/levi.jpg",   "/img/milena-face.jpg",   "/img/milena.jpg",   "/img/najla-face.jpg",   "/img/najla.jpg",   "/img/regis-face.jpg",   "/img/regis.jpg",   "/img/sarah-face.jpg",   "/img/sarah.jpg",   "/img/thais-face.jpg",   "/img/thais.jpg", ];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // the API, the music (Safari needs real range responses) and other methods skip the cache
  if (req.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.endsWith('.mp3') || req.headers.has('range')) return;
  if (req.mode === 'navigate') {
    // page: network first so a new version shows up, cache when offline
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('/', copy)); return r; })
      .catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
