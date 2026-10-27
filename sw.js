// ProjectFlow service worker — เก็บ "เปลือกแอป" ไว้เปิดได้เร็ว/เปิดตอนเน็ตหลุดได้ (ข้อมูลจริงมาจาก Apps Script เสมอ ไม่ถูกเก็บแคช)
const CACHE = 'pf-shell-v22';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;                       // คำขอ API เป็น POST — ไม่ผ่านแคช
  if (new URL(r.url).origin !== self.location.origin) return; // Apps Script / Google Fonts ไปตามปกติ
  e.respondWith(
    fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)).catch(() => { }); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./')))
  );
});
