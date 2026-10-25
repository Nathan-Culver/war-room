const CACHE='war-room-v2';
const BOARD='https://cdn.steamusercontent.com/ugc/1666856894575883627/D5EA1F53AE0778824FB9AD2FE5466EF2253047CE/';
const FILES=['./','./index.html','./styles.css?v=0.2.0','./app.js?v=0.2.0','./engine.js','./ai.js','./help.js','./data.js','./storage.js','./map.js?v=0.2.0','./icon.svg'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(FILES);
  try{const req=new Request(BOARD,{mode:'no-cors'}),res=await fetch(req);if(res.ok||res.type==='opaque')await c.put(req,res);}catch{}
 }));self.skipWaiting();
});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('war-room-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.url===BOARD){
  // The unmodified board is a stable reference asset: use the cached copy first.
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{if(res.ok||res.type==='opaque')caches.open(CACHE).then(c=>c.put(e.request,res.clone()));return res;})));return;
 }
 if(new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(e.request,res.clone()));return res;}).catch(()=>caches.match(e.request)));
});
