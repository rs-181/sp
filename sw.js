const CACHE_NAME = 'sameja-family-v1';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'insta1.png',
  'insta2.png',
  'insta3.png',
  'insta4.png',
  'insta5.png',
  'insta6.png',
  't1.png',
  't2.png',
  't3.png',
  't4.png',
  't5.png',
  'p1.png',
  'p2.png',
  'p3.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('googleapis.com') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('netlify.app')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((cached) => {
            if (cached) return cached;
            if (event.request.destination === 'image') {
              return caches.match('icon-512.png');
            }
            return caches.match('index.html');
          });
      })
  );
});