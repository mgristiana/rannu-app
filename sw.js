const CACHE='rannu-app-v4';
const ASSETS=['./','./index.html','./styles.css','./app.js','./sw.js','./manifest.webmanifest','./brand-logo.png','./rannu-apple-touch-icon.png','./rannu-icon-192.png','./rannu-icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{if(new URL(e.request.url).origin===location.origin){let copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match('./index.html'))))});
