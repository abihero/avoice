const CACHE_NAME = 'justocall-v1.1'; // Naikkan versi jika kamu update index.html
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Install Service Worker & Simpan Aset (Cache)
self.addEventListener('install', (event) => {
  // Paksa SW yang baru langsung aktif tanpa menunggu tab lama ditutup
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Bersihkan Cache Lama (Agar nama JustoCall & UI baru langsung muncul)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Menghapus Cache Lama...', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Pastikan SW mengontrol semua tab segera setelah aktif
  return self.clients.claim();
});

// 3. Strategi Network First (Cek internet dulu, kalau gagal baru ambil Cache)
// Ini penting agar perubahan nama AI atau Role tetap sinkron dengan internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
