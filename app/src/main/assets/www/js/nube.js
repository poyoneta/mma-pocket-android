/* ---------------- Guardado en la nube (Supabase) ----------------
   Entrás con tu email (te llega un link, sin contraseña). Tu carrera y los peleadores que creaste
   se suben solos cada vez que cambian, y al entrar desde otro dispositivo se bajan.
   Gana siempre la versión más nueva. */
const NUBE_KEYS=['custom','career'];
let sb=null,nubeUser=null,nubeT=0,nubeEstado='';
const localTs=()=>{try{return+localStorage.getItem('lajaula.ts')||0;}catch(e){return 0;}};
function nubeBtn(){
 const b=$('#nubeBtn');if(!b)return;b.hidden=!sb;
 b.textContent=nubeUser?'☁ NUBE: '+(nubeEstado||'CONECTADO'):'☁ GUARDAR EN LA NUBE';
}
function nubeInit(){
 if(!SUPABASE_URL||!SUPABASE_KEY)return;
 const s=document.createElement('script');
 s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
 s.onload=()=>{
  try{sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);}catch(e){console.warn('Supabase',e);return;}
  nubeBtn();
  sb.auth.onAuthStateChange((ev,ses)=>{
   const antes=nubeUser;nubeUser=ses?ses.user:null;nubeBtn();
   if(nubeUser&&!antes)setTimeout(nubeBajar,0);
  });
 };
 s.onerror=()=>console.warn('No se pudo cargar Supabase (¿sin internet?)');
 document.head.appendChild(s);
}
function nubeDatos(){const d={ts:localTs()||Date.now()};for(const k of NUBE_KEYS)d[k]=store.get(k,null);return d;}
const hayLocal=()=>NUBE_KEYS.some(k=>{const v=store.get(k,null);return v&&(!Array.isArray(v)||v.length);});
async function nubeBajar(){
 if(!sb||!nubeUser)return;nubeEstado='SINCRONIZANDO';nubeBtn();
 const{data,error}=await sb.from('partidas').select('datos').eq('user_id',nubeUser.id).maybeSingle();
 if(error){nubeEstado='ERROR';nubeBtn();console.warn(error);return;}
 const r=data&&data.datos;
 if(r&&(r.ts||0)>localTs()){
  // La nube es más nueva: la copiamos acá y recargamos para que el juego la lea
  try{for(const k of NUBE_KEYS){if(r[k]==null)localStorage.removeItem('lajaula.'+k);else localStorage.setItem('lajaula.'+k,JSON.stringify(r[k]));}
   localStorage.setItem('lajaula.ts',String(r.ts));}catch(e){}
  if(curScreen!=='fight')location.reload();return;
 }
 if(hayLocal()&&(!r||localTs()>(r.ts||0)))await nubeSubir();
 else{nubeEstado='AL DÍA';nubeBtn();}
}
async function nubeSubir(){
 if(!sb||!nubeUser)return;nubeEstado='GUARDANDO';nubeBtn();
 const{error}=await sb.from('partidas').upsert({user_id:nubeUser.id,datos:nubeDatos(),updated_at:new Date().toISOString()});
 nubeEstado=error?'ERROR':'GUARDADO';nubeBtn();if(error)console.warn(error);
}
// La llama store.set / store.del cada vez que cambia algo
function nubeCambio(){if(!nubeUser)return;clearTimeout(nubeT);nubeT=setTimeout(nubeSubir,1500);}
function nubeMenu(){
 if(!nubeUser){
  showOv(`<h3>GUARDAR EN LA NUBE</h3><p class="sub">Poné tu email y te mando un link para entrar (sin contraseña). Abrilo en el mismo navegador donde jugás: en la compu y en el celular, cada uno con su link.</p>
   <input id="nubeMail" type="email" placeholder="tu@email.com" autocomplete="email" style="width:100%;box-sizing:border-box;font-size:17px;padding:10px;margin:8px 0">
   <p class="note" id="nubeMsg"></p><div class="btns"><button class="go" id="nubeEnviar">MANDAR LINK</button><button class="alt" data-act="close">CANCELAR</button></div>`);
  $('#nubeEnviar').onclick=async()=>{
   const email=$('#nubeMail').value.trim(),m=$('#nubeMsg');if(!/^\S+@\S+\.\S+$/.test(email)){m.textContent='Revisá el email.';return;}
   m.textContent='Mandando…';
   const{error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
   m.textContent=error?'No se pudo: '+error.message:'¡Listo! Revisá tu correo (y el spam) y tocá el link.';
  };
  return;
 }
 showOv(`<h3>NUBE</h3><p class="sub">Conectado como <b>${esc(nubeUser.email||'')}</b>. Tu carrera y tus peleadores se guardan solos.</p>
  <div class="btns"><button class="go" id="nubeYa">GUARDAR AHORA</button><button class="alt" id="nubeBajarB">TRAER DE LA NUBE</button><button class="alt" id="nubeSalir">CERRAR SESIÓN</button><button class="alt" data-act="close">VOLVER</button></div>`);
 $('#nubeYa').onclick=async()=>{await nubeSubir();hideOv();};
 $('#nubeBajarB').onclick=async()=>{try{localStorage.setItem('lajaula.ts','0');}catch(e){}await nubeBajar();hideOv();};
 $('#nubeSalir').onclick=async()=>{await sb.auth.signOut();nubeUser=null;nubeEstado='';nubeBtn();hideOv();};
}
$('#nubeBtn').onclick=()=>{if(sb)nubeMenu();};
nubeInit();
