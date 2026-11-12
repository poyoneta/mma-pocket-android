/* Service worker de Pocket MMA: guarda el juego en el celular para abrirlo como app y sin internet.
   Cuando cambies algo y lo subas, aumentá VERSION para que los celulares bajen lo nuevo. */
const VERSION='pmma-v30';
const ARCHIVOS=[
 "./",
 "assets/carga/carga1.jpg",
 "assets/carga/carga2.jpg",
 "assets/carga/carga3.jpg",
 "assets/icons/apple-touch-icon.png",
 "assets/icons/icon-192.png",
 "assets/icons/icon-512.png",
 "assets/icons/maskable-512.png",
 "assets/menu/carrera.png",
 "assets/menu/crear.png",
 "assets/menu/pelea.png",
 "assets/menu/torneo.png",
 "assets/portada.png",
 "assets/sprites/alejandro-zanella.png",
 "assets/sprites/base-mascara.png",
 "assets/sprites/base.png",
 "assets/sprites/pelos.png",
 "assets/sprites/ropa.png",
 "assets/sprites/suelo-mascara.png",
 "assets/sprites/suelo.png",
 "css/estilos.css",
 "css/menu-imagenes.css",
 "data/cuerpo-base.js",
 "data/peleadores.js",
 "data/sprites.js",
 "index.html",
 "js/app.js",
 "js/carga.js",
 "js/carrera.js",
 "js/config.js",
 "js/crear.js",
 "js/cuerpos.js",
 "js/dibujo.js",
 "js/escenarios.js",
 "js/fichas.js",
 "js/iconos.js",
 "js/inicio.js",
 "js/juego.js",
 "js/mando.js",
 "js/menu.js",
 "js/musica.js",
 "js/navegacion.js",
 "js/nube-config.js",
 "js/nube.js",
 "js/presenta.js",
 "js/promotoras.js",
 "js/sonido.js",
 "js/tactil.js",
 "js/torneo.js",
 "manifest.webmanifest"
];
// Guardar los archivos de a uno: si alguno falta en el servidor, el resto se guarda igual
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled(ARCHIVOS.map(f=>c.add(f)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Una respuesta que vino de una redirección no se puede usar para abrir la página: se copia limpia
const limpia=res=>res.redirected?res.blob().then(b=>new Response(b,{status:res.status,statusText:res.statusText,headers:res.headers})):res;
const guardar=(r,res)=>{if(res&&res.ok&&res.type==='basic'){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp)).catch(()=>{});}return res;};
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 // Abrir la app: primero internet, si no hay, la copia guardada
 // Con internet, abrir la app lo maneja el navegador solo (igual que tus otras apps); sin internet, la copia guardada
 if(r.mode==='navigate'&&self.navigator.onLine)return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(limpia).then(res=>guardar(r,res))
   .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./')).then(m=>m||caches.match('index.html')).then(m=>m||Response.error())));
  return;
 }
 // Archivos del juego: primero internet (lo último), si no hay, lo guardado
 if(u.origin===location.origin){
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>guardar(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||Response.error())));
  return;
 }
 // Fuentes y librería de Supabase: lo guardado primero
 if(/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u.hostname)){
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res;})));
 }
});
