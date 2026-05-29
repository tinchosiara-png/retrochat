const CACHE = 'retrochat-v0-1-4';
const ASSETS = ['./','./index.html','./manifest.json','./icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // No cachear Apps Script.
  if (url.origin.includes('script.google.com') || url.origin.includes('script.googleusercontent.com')) return;

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
