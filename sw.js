const C='aoe-v14-x360',F=['./','index.html','engine.js','gba.js','font.js','art.js','art2.js','art3.js','art4.js','art5.js','real.js','real2.js','hd.js','gc3d.js','three.slim.min.js','world.js','assault.js','modes.js','tutorial.js','aces.js','main.js','touch.js','manifest.webmanifest','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
