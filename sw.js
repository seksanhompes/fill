const CACHE='hcap-v24';
const ASSETS=[
  'index.html','styles.css','app.js','manifest.webmanifest',
  'tests/reaction.js','tests/memory.js','tests/stroop.js','tests/nback.js','tests/gng.js',
  'tests/arithmetic.js','tests/typing.js','tests/vsearch.js','tests/breath.js','tests/chronotype.js',
  'assets/icon-192.png','assets/icon-512.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(r);
    const fetchP=fetch(r).then(res=>{cache.put(r,res.clone()); return res;}).catch(()=>null);
    if(cached) return cached;
    const net=await fetchP; if(net) return net;
    if(r.mode==='navigate') return cache.match('index.html');
    return new Response('offline',{status:503});
  })());
});
