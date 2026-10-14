const C='aoe3d-v1',F=['./','index.html','three.slim.min.js','data.js','models.js','world.js','game.js','mp.js','ui.js','manifest.webmanifest','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
// only clean our own old caches (and the retired root side-scroller cache) so /classic/ and /rocket-run/ keep theirs
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C&&(x.startsWith('aoe3d-')||/^aoe-v\d/.test(x))).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// network-first so updates arrive; cache fallback offline
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;const u=new URL(e.request.url);if(u.pathname.includes('/classic/')||u.pathname.includes('/rocket-run/')||u.pathname.includes('/fps/'))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
