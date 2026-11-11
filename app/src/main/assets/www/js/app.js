/* ---------------- App instalable (PWA) y horizontal ----------------
   - Registra el service worker (sw.js) para que se pueda instalar y ande sin internet.
   - Botón "INSTALAR APP": en Android/PC abre el cartel de instalación del navegador;
     en iPhone explica cómo agregarla a la pantalla de inicio.
   - En el celular, al primer toque pasa a pantalla completa y traba la pantalla acostada
     (Android lo permite; en iPhone hay que girarlo a mano y el juego avisa). */
const esApp=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
const esIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let instEv=null;
function mostrarInstalar(){$('#instBtn').hidden=esApp()||!(instEv||esIOS);}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();instEv=e;mostrarInstalar();});
window.addEventListener('appinstalled',()=>{instEv=null;mostrarInstalar();});
$('#instBtn').onclick=async()=>{
 if(instEv){instEv.prompt();try{await instEv.userChoice;}catch(e){}instEv=null;mostrarInstalar();return;}
 showOv(`<h3>INSTALAR EN IPHONE</h3><ul class="help">
  <li>Abrí esta página en <b>Safari</b>.</li>
  <li>Tocá el botón <b>Compartir</b> (el cuadrado con la flecha para arriba).</li>
  <li>Elegí <b>Agregar a inicio</b> y después <b>Agregar</b>.</li>
  <li>Abrila desde el ícono: se abre a pantalla completa, sin la barra del navegador.</li></ul>
  <div class="btns"><button class="go" data-act="close">ENTENDIDO</button></div>`);
};
mostrarInstalar();

// Pantalla completa + trabar en horizontal (necesita un toque del jugador)
function forzarHorizontal(){
 const lock=()=>{try{const q=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape');if(q&&q.catch)q.catch(()=>{});}catch(e){}};
 try{
  const de=document.documentElement;
  if(!document.fullscreenElement&&de.requestFullscreen){const p=de.requestFullscreen({navigationUI:'hide'});if(p&&p.then)p.then(lock,lock);else lock();}
  else lock();
 }catch(e){lock();}
}
if(matchMedia('(pointer:coarse)').matches){
 document.addEventListener('pointerdown',function primer(){document.removeEventListener('pointerdown',primer,true);forzarHorizontal();},true);
}

// Service worker (solo en https o localhost: Live Server o Render). En la app de Android no hace falta: los archivos ya vienen adentro del APK.
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&!/claude|anthropic|appassets\.androidplatform\.net/.test(location.hostname)){
 window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(e=>console.warn('Service worker:',e)));
}
