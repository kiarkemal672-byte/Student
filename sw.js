'use strict';
/* ═══════════════════════════════════════════════════════════════
   የንባብ አስተዳደር — Reading Groups Manager
   sw.js — عامل الخدمة (Service Worker)
   الوظيفة: تخزين مؤقت ذكي ليعمل التطبيق دون اتصال بالإنترنت

   استراتيجيات التخزين:
   ┌─ الملفات الأساسية  → تثبيت مسبق (Pre-cache)
   ├─ فتح الصفحات       → شبكة أولاً ثم الكاش (يضمن أحدث إصدار)
   ├─ خطوط جوجل         → الكاش أولاً + تحديث خلفي
   └─ الطلبات الأخرى     → الكاش أولاً ثم الشبكة
═══════════════════════════════════════════════════════════════ */

/* ── 1) الإصدار وأسماء المخازن ── */
const VERSION       = 'v1.0.0';
const CORE_CACHE    = 'qiraat-core-'    + VERSION;
const RUNTIME_CACHE = 'qiraat-runtime-' + VERSION;

/* الملفات المحلية الأساسية (تُخزَّن فور التثبيت) */
const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json'
];

/* ── 2) التثبيت ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => Promise.allSettled(
        CORE_ASSETS.map(asset => cache.add(asset))
      ))
      .then(() => self.skipWaiting())   /* تفعيل الإصدار الجديد فوراً */
  );
});

/* ── 3) التفعيل: تنظيف مخازن الإصدارات القديمة ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CORE_CACHE && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) /* السيطرة على التبويبات المفتوحة فوراً */
  );
});

/* ── 4) اعتراض الطلبات وتوجيهها ── */
self.addEventListener('fetch', event => {
  const req = event.request;

  /* لا نتعامل إلا مع GET عبر http/https */
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* أ) فتح الصفحات والتنقل: شبكة أولاً (لضمان أحدث إصدار) */
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirstPage(req));
    return;
  }

  /* ب) خطوط جوجل: كاش أولاً مع تحديث خلفي */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  /* ج) ملفات التطبيق المحلية: كاش أولاً */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, CORE_CACHE));
    return;
  }

  /* د) ما تبقى: كاش أولاً مع تحديث خلفي */
  event.respondWith(staleWhileRevalidate(req));
});

/* ═══════════════ الدوال المساعدة ═══════════════ */

/* صفحات: شبكة أولاً ← كاش ← صفحة عدم الاتصال الأنيقة */
async function networkFirstPage(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CORE_CACHE);
      cache.put('./index.html', res.clone());
    }
    return res;
  } catch (err) {
    const cached =
      (await caches.match(req)) ||
      (await caches.match('./index.html')) ||
      (await caches.match('./'));
    if (cached) return cached;

    return new Response(
      `<!DOCTYPE html>
       <html lang="ar" dir="rtl">
       <head><meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>የንባብ አስተዳደር — غير متصل</title></head>
       <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
              background:#0e3b2a;color:#f0d98c;font-family:serif;text-align:center;padding:2rem">
         <div>
           <div style="font-size:3rem;margin-bottom:.5rem">◈</div>
           <h1 style="font-size:1.3rem;margin:0 0 .4rem">لا يوجد اتصال بالإنترنت</h1>
           <p style="color:#cfd8d0;margin:0">أعد المحاولة بعد استعادة الاتصال، أو حدِّث الصفحة لاستخدام النسخة المخزَّنة.</p>
         </div>
       </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/* كاش أولاً ثم الشبكة */
async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

/* الكاش أولاً + تحديث خلفي (Stale-While-Revalidate) */
async function staleWhileRevalidate(req) {
  const cached = await caches.match(req);

  const refresh = fetch(req)
    .then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
      }
      return res;
    })
    .catch(() => null);

  if (cached) return cached;

  const fresh = await refresh;
  return fresh || new Response('', { status: 504, statusText: 'Offline' });
}

/* ── 5) رسائل من الصفحة (لتحديث الإصدار مستقبلاً) ── */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
