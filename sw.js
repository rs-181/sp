const CACHE_NAME = 'sameja-family-v3';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'chat.html',
  'icon-512.png',
  'insta1.jpg',
  'insta2.jpg',
  'insta3.jpg',
  'insta4.jpg',
  'insta5.jpg',
  'insta6.jpg',
  't1.jpg',
  't2.jpg',
  't3.jpg',
  't4.jpg',
  't5.jpg',
  'p1.jpg',
  'p2.jpg',
  'p3.jpg',
  'bg.png'
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

  // Skip external URLs
  if (url.hostname.includes('googleapis.com') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('netlify.app') ||
      url.hostname.includes('blogger.com')) {
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
