const CACHE_NAME = 'today-plan-v1';

const APP_SHELL = [
  './',
  './index.html',
  './weekly.html',
  './settings.html',
  './css/style.css',
  './js/data.js',
  './js/timer.js',
  './js/ui.js',
  './js/app.js',
  './js/pwa.js',
  './manifest.webmanifest',
  './font/Vazirmatn.woff2',
  './assets/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // فقط GET
  if (req.method !== 'GET') return;

  try {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(fetch(req));
      return;
    }
  } catch (e) {
    // ignore
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // در صورت موفقیت، فایل را کش کن
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // در حالت آفلاین، حداقل صفحه اصلی را بده
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          throw new Error('Offline');
        });
    })
  );
});
