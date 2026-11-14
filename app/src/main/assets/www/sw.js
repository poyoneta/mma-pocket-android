/* Service worker de Pocket MMA: guarda el juego en el celular para abrirlo como app y sin internet.
   Cuando cambies algo y lo subas, aumentá VERSION para que los celulares bajen lo nuevo. */
const VERSION='pmma-v32';
const ARCHIVOS=[
 "./",
 "assets/carga/carga1.jpg",
 "assets/carga/carga2.jpg",
 "assets/carga/carga3.jpg",
 "assets/esc2/01-fondo.jpg",
 "assets/esc2/01-piso.jpg",
 "assets/esc2/02-fondo.jpg",
 "assets/esc2/02-piso.jpg",
 "assets/esc2/03-fondo.jpg",
 "assets/esc2/03-piso.jpg",
 "assets/esc2/04-fondo.jpg",
 "assets/esc2/04-piso.jpg",
 "assets/esc2/05-fondo.jpg",
 "assets/esc2/05-piso.jpg",
 "assets/esc2/06-fondo.jpg",
 "assets/esc2/06-piso.jpg",
 "assets/esc2/07-fondo.jpg",
 "assets/esc2/07-piso.jpg",
 "assets/esc2/08-fondo.jpg",
 "assets/esc2/08-piso.jpg",
 "assets/esc2/09-fondo.jpg",
 "assets/esc2/09-piso.jpg",
 "assets/esc2/10-fondo.jpg",
 "assets/esc2/10-piso.jpg",
 "assets/esc2/11-fondo.jpg",
 "assets/esc2/11-piso.jpg",
 "assets/esc2/12-fondo.jpg",
 "assets/esc2/12-piso.jpg",
 "assets/esc2/13-fondo.jpg",
 "assets/esc2/13-piso.jpg",
 "assets/esc2/14-fondo.jpg",
 "assets/esc2/14-piso.jpg",
 "assets/esc2/15-fondo.jpg",
 "assets/esc2/15-piso.jpg",
 "assets/icons/apple-touch-icon.png",
 "assets/icons/icon-192.png",
 "assets/icons/icon-512.png",
 "assets/icons/maskable-512.png",
 "assets/menu/carrera.png",
 "assets/menu/crear.png",
 "assets/menu/pelea.png",
 "assets/menu/torneo.png",
 "assets/menu2/ayuda.jpg",
 "assets/menu2/carrera.jpg",
 "assets/menu2/eventos.jpg",
 "assets/menu2/fondo.jpg",
 "assets/menu2/pelea.jpg",
 "assets/menu2/torneo.jpg",
 "assets/portada.png",
 "assets/sprites/alejandro-zanella.png",
 "assets/sprites/base-mascara.png",
 "assets/sprites/base.png",
 "assets/sprites/pelos.png",
 "assets/sprites/plantilla-48.png",
 "assets/sprites/plantilla-guia.png",
 "assets/sprites/ropa.png",
 "assets/sprites/suelo-mascara.png",
 "assets/sprites/suelo.png",
 "assets/sprites2/cabezas.png",
 "assets/sprites2/capas.png",
 "assets/sprites2/cuerpo-mascara.png",
 "assets/sprites2/cuerpo.png",
 "assets/sprites2/shorts-mini.png",
 "assets/sprites2/shorts.png",
 "assets/sprites2/suelo2-mascara.png",
 "assets/sprites2/suelo2.png",
 "css/estilos.css",
 "css/menu-imagenes.css",
 "css/menu2.css",
 "data/cuerpo-base.js",
 "data/cuerpo2.js",
 "data/peleadores.js",
 "data/sprites.js",
 "data/suelo2.js",
 "index.html",
 "js/app.js",
 "js/carga.js",
 "js/carrera.js",
 "js/config.js",
 "js/crear.js",
 "js/cuerpos.js",
 "js/cuerpos2.js",
 "js/dibujo.js",
 "js/escenarios.js",
 "js/fichas.js",
 "js/iconos.js",
 "js/inicio.js",
 "js/jaula3d.js",
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
