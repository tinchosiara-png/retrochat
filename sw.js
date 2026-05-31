importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({"apiKey": "AIzaSyAuepS1cLPxfWAl_GBzGkTW_-tL64Vet1I", "authDomain": "retrochat-5b990.firebaseapp.com", "projectId": "retrochat-5b990", "storageBucket": "retrochat-5b990.firebasestorage.app", "messagingSenderId": "766061685371", "appId": "1:766061685371:web:36d4914cd2d6f7761690de"});

try {
  const messaging = firebase.messaging();

  // v0.2.1: FCM data-only. Este SW muestra la única notificación visible.
  messaging.onBackgroundMessage((payload) => {
    const data = payload && payload.data ? payload.data : {};
    const title = data.title || 'RetroChat';
    const body = data.body || 'Nuevo mensaje';
    const icon = data.icon || './icon.svg';

    self.registration.showNotification(title, {
      body,
      icon,
      badge: './icon.svg',
      tag: data.chat_id ? 'retrochat-' + data.chat_id : 'retrochat',
      renotify: true,
      vibrate: data.tipo === 'zumbido' ? [120,80,120,80,120] : [80],
      data: {
        url: data.url || './',
        chat_id: data.chat_id || ''
      }
    });
  });
} catch(err) {
  // Firebase Messaging puede fallar en navegadores sin soporte.
}


const CACHE = 'retrochat-v0-2-4';
const ASSETS = ['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
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
  if (url.origin.includes('script.google.com') || url.origin.includes('script.googleusercontent.com')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});


self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification && event.notification.data ? event.notification.data : {};
  const chatId = data.chat_id || '';
  const targetUrl = data.url || (chatId ? './?open_chat=' + encodeURIComponent(chatId) : './');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Preferimos una ventana RetroChat ya abierta.
      for (const client of clientList) {
        if (client.url && client.url.includes(self.location.origin)) {
          client.postMessage({ type: 'retrochat_open_chat', chat_id: chatId });
          if ('focus' in client) return client.focus();
          return;
        }
      }

      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
