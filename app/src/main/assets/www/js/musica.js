/* ---------------- Música de los menús + reproductor ----------------
   Suena en los menús y se corta en las peleas. Respeta la casilla "Sonido".
   - Temas del juego: se generan en el momento (no ocupan espacio). Son 5 estilos distintos y van rotando.
   - Tu música: desde el botón ♪ MÚSICA del menú podés agregar canciones del celular o la compu
     (quedan guardadas en el juego, en este dispositivo).
   - Spotify: pegás el link de una playlist, álbum o tema y suena el reproductor oficial de Spotify. */
const MUS={on:false,quiere:true,azar:true,idx:0,lista:[],step:0,next:0,bus:null,timer:null,tema:null,d16:.15,audio:null,url:null,
 fuente:'lista',spo:null,spoCtl:null,spoPausado:true,spoFrenado:false};
const hz=semi=>73.42*Math.pow(2,semi/12);   // 0 = Re grave (D2)

/* ---------- instrumentos ---------- */
function musBus(){
 if(MUS.bus)return MUS.bus;
 const out=AC.createGain();out.gain.value=0;out.connect(AC.destination);
 const comp=AC.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;comp.connect(out);
 const dist=AC.createWaveShaper(),n=1024,cu=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;cu[i]=Math.tanh(x*9);}dist.curve=cu;dist.oversample='4x';
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=90;
 const gg=AC.createGain();gg.gain.value=.16;dist.connect(hp).connect(lp).connect(gg).connect(comp);
 MUS.bus={out,comp,gtr:dist};return MUS.bus;
}
function musEnv(t,peak,dur,att){const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+(att||.005));g.gain.exponentialRampToValueAtTime(.001,t+dur);return g;}
function musOsc(type,f,t,dur,dest){const o=AC.createOscillator();o.type=type;o.frequency.value=f;o.connect(dest);o.start(t);o.stop(t+dur+.03);return o;}
// guitarra distorsionada (power chord); mute = chug apagado
function musGtr(t,semi,len,mute){const d=mute?.09:len;for(const det of[-7,7,0]){const g=musEnv(t,.5,d);g.connect(MUS.bus.gtr);musOsc('sawtooth',hz(semi)*(det===0?1.5:1)*(1+det/2400),t,d,g);}}
function musBass(t,semi,len){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=musEnv(t,.22,len,.003);f.connect(g).connect(MUS.bus.comp);musOsc('square',hz(semi)/2,t,len,f);}
// 808 / bajo sub (con un poco de glide hacia abajo)
function musSub(t,semi,len,glide){const g=musEnv(t,.5,len,.004);g.connect(MUS.bus.comp);const o=musOsc('sine',hz(semi),t,len,g);if(glide)o.frequency.exponentialRampToValueAtTime(hz(semi-glide),t+len*.8);
 const g2=musEnv(t,.08,len*.6);g2.connect(MUS.bus.comp);musOsc('triangle',hz(semi)*2,t,len*.6,g2);}
function musKick(t,v=1){const g=musEnv(t,.9*v,.25,.002);g.connect(MUS.bus.comp);const o=musOsc('sine',150,t,.26,g);o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);}
function musNoise(t,dur,freq,vol,type){const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;
 const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(MUS.bus.comp);s.start(t,Math.random()*.3);s.stop(t+dur);}
function musSnare(t,v=1){musNoise(t,.18,1800,.5*v,'bandpass');const g=musEnv(t,.3*v,.1,.002);g.connect(MUS.bus.comp);musOsc('triangle',190,t,.11,g);}
function musClap(t){for(const d of[0,.012,.024])musNoise(t+d,.12,1400,.45,'bandpass');}
function musHat(t,open,v=1){musNoise(t,open?.2:.04,8000,(open?.12:.08)*v,'highpass');}
// teclado (acordes suaves) y campana / cencerro
function musKeys(t,notas,len,vol=.06){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1700;f.connect(MUS.bus.comp);
 for(const n of notas){const g=musEnv(t,vol,len,.01);g.connect(f);musOsc('triangle',hz(n+24),t,len,g);const g2=musEnv(t,vol*.5,len*.7,.01);g2.connect(f);musOsc('sine',hz(n+12),t,len*.7,g2);}}
function musBell(t,semi,len=.5,vol=.09){for(const[m,v]of[[1,1],[2.01,.35],[3.02,.12]]){const g=musEnv(t,vol*v,len*(m===1?1:.5),.002);g.connect(MUS.bus.comp);musOsc('sine',hz(semi+36)*m,t,len,g);}}
function musCowbell(t,semi,vol=.12){const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=hz(semi+36)*1.4;f.Q.value=2;const g=musEnv(t,vol,.22,.002);f.connect(g).connect(MUS.bus.comp);
 musOsc('square',hz(semi+36),t,.22,f);musOsc('square',hz(semi+36)*1.48,t,.22,f);}
function musLead(t,semi,len,vol=.07){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2600;const g=musEnv(t,vol,len,.01);f.connect(g).connect(MUS.bus.comp);musOsc('square',hz(semi+24),t,len,f);musOsc('sawtooth',hz(semi+24)*1.005,t,len,f);}

/* ---------- temas del juego (cada paso es un 16avo) ---------- */
const TEMAS=[
 {id:'jaula',nombre:'Jaula',estilo:'nu metal',bpm:96,largo:32,paso(t,i){
  const RA=[0,'x',0,'x',null,0,'x',null,3,null,0,'x',5,null,3,null],RB=[0,'x',0,null,7,null,6,null,0,'x',0,null,10,null,8,7],P=['A','A','B','A','A','B','C','C'];
  const bar=i>>4,s=i&15,pa=P[bar%8],riff=pa==='B'?RB:RA,d=MUS.d16;
  if(pa==='C'){if(s%2===0)musKick(t,.8);}else if(s===0||s===7||s===10||(s===14&&bar%2))musKick(t);
  if(s===4||s===12)musSnare(t);musHat(t,s===14);
  const n=pa==='C'?(s%4===0?[0,0,3,5][s>>2]:'x'):riff[s];if(n==null)return;
  if(n==='x'){musGtr(t,0,0,true);return;}musGtr(t,n,d*1.8);musBass(t,n,d*1.6);if(s===0&&bar%4===0)musNoise(t,1.2,5000,.12,'highpass');}},
 {id:'barrio',nombre:'Barrio',estilo:'rap boom bap',bpm:88,largo:24,paso(t,i){
  const bar=i>>4,s=i&15,d=MUS.d16,tt=t+(s%2?d*.2:0);   // swing en los contratiempos
  const AC_=[[0,3,7,10],[-4,0,3,7],[-7,-4,0,3],[-5,-1,2,5]],ch=AC_[bar%4],root=ch[0];
  if(s===0||s===10||(s===7&&bar%2===0)||(s===3&&bar%4===3)){musKick(t);musSub(t,root,d*3);}
  if(s===4||s===12)musSnare(t,1.1);
  if(s%2===0)musHat(tt,false,.8);if(s===14&&bar%2)musHat(tt,true,.7);
  if(s===0)musKeys(t,ch,d*7);if(s===6)musKeys(tt,ch,d*1.5,.045);if(s===11&&bar%2)musKeys(tt,ch,d*2,.04);
  if(Math.random()<.2)musNoise(t+Math.random()*d,.008,3000,.025,'highpass');}},   // ruido de vinilo
 {id:'walkout',nombre:'Walkout',estilo:'trap',bpm:140,largo:32,paso(t,i){
  const bar=i>>4,s=i&15,d=MUS.d16,roots=[0,0,-4,-2],r=roots[bar%4];
  const K=bar%2?[0,3,11]:[0,7,10];if(K.includes(s)){musKick(t,.9);musSub(t,r,d*(s===0?6:3),s===11?2:0);}
  if(s===8)musClap(t);
  if(s%2===0)musHat(t,false,.9);
  if(bar%2&&s>=12){musHat(t,false,.6);musHat(t+d/2,false,.5);}   // redobles de hi-hat
  const MEL=[24,null,22,null,19,null,null,17,19,null,15,null,17,null,null,null,24,null,27,null,24,null,22,null,19,null,22,null,17,null,null,null];
  const m=MEL[(bar%2)*16+s];if(m!=null&&bar%8>=2)musBell(t,m+r,.45);}},
 {id:'octagono',nombre:'Octágono',estilo:'thrash metal',bpm:160,largo:32,paso(t,i){
  const bar=i>>4,s=i&15,d=MUS.d16,pa=bar%8<6?'A':'C',acc=[[2,2,2,5],[2,2,8,7],[2,2,2,5],[10,8,7,5]][bar%4][s>>2];
  if(pa==='C')musKick(t,.6);else if(s%4===0||s%4===3)musKick(t,.8);
  if(s===4||s===12)musSnare(t);if(s%2===0)musHat(t,false,.7);
  const g=s%4;   // galope: corchea + dos semis
  if(g===0)musGtr(t,acc,d*1.6);else if(g===2||g===3)musGtr(t,2,0,true);
  if(g===0)musBass(t,acc,d*1.4);
  if(pa==='C'&&s%2===0){const L=[14,17,19,17,22,19,17,14];musLead(t,L[(s>>1)%8]+(bar%2?-2:0),d*1.8);}
  if(s===0&&bar%4===0)musNoise(t,1.2,5000,.12,'highpass');}},
 {id:'drift',nombre:'Drift',estilo:'phonk',bpm:128,largo:32,paso(t,i){
  const bar=i>>4,s=i&15,d=MUS.d16,r=[0,0,-2,-5][bar%4];
  if(s===0||s===6||s===10||(s===13&&bar%2)){musKick(t);musSub(t,r,d*4,1);}
  if(s===4||s===12)musClap(t);
  if(s%2===0)musHat(t,false,.7);if(s===10)musHat(t,true,.6);
  const CB=[12,null,12,15,null,12,null,10,12,null,12,15,null,17,15,null];   // cencerro que lleva la melodía
  if(CB[s]!=null&&bar%8>=1)musCowbell(t,CB[s]+r);}}
];

/* ---------- motor ---------- */
function musLoop(){
 if(!MUS.on||!AC||!MUS.tema)return;
 while(MUS.next<AC.currentTime+.25){MUS.tema.paso(MUS.next,MUS.step++);MUS.next+=MUS.d16;}
 if(MUS.step>=MUS.tema.largo*16)musSiguiente();   // al terminar el tema pasa al próximo
}
function musActual(){return MUS.lista[MUS.idx]||MUS.lista[0];}
function musArrancar(){
 if(MUS.on||!AC)return;const it=musActual();if(!it)return;MUS.on=true;
 if(it.tipo==='propia'){
  if(!MUS.audio){MUS.audio=new Audio();MUS.audio.volume=.55;MUS.audio.addEventListener('ended',()=>musSiguiente());MUS.audio.addEventListener('error',()=>{if(MUS.on)setTimeout(musSiguiente,300);});}
  if(MUS.audio._id!==it.id){if(MUS.url)URL.revokeObjectURL(MUS.url);MUS.url=URL.createObjectURL(it.blob);MUS.audio.src=MUS.url;MUS.audio._id=it.id;}
  MUS.audio.play().catch(()=>{MUS.on=false;});
 }else{
  musBus();MUS.tema=it.tema;MUS.d16=60/it.tema.bpm/4;MUS.next=AC.currentTime+.1;
  MUS.bus.out.gain.cancelScheduledValues(AC.currentTime);MUS.bus.out.gain.setTargetAtTime(.55,AC.currentTime,.3);
  clearInterval(MUS.timer);MUS.timer=setInterval(musLoop,60);
 }
 musUI();
}
function musParar(){
 if(!MUS.on)return;MUS.on=false;
 if(MUS.audio)MUS.audio.pause();
 clearInterval(MUS.timer);if(MUS.bus&&AC)MUS.bus.out.gain.setTargetAtTime(0,AC.currentTime,.12);
 musUI();
}
// cambiar de tema (dir: 1 siguiente, -1 anterior, o un índice exacto con 'ir')
function musCambiar(i){
 const sonaba=MUS.on;musParar();MUS.idx=(i+MUS.lista.length)%MUS.lista.length;MUS.step=0;
 if(MUS.audio)MUS.audio.currentTime=0;
 musGuardar();musUI();if(sonaba||MUS.quiere)setTimeout(()=>{if(musDebe())musArrancar();},80);
}
function musSiguiente(){
 const n=MUS.lista.length;if(n<2){MUS.step=0;if(MUS.audio&&MUS.on){MUS.audio.currentTime=0;MUS.audio.play().catch(()=>{});}return;}
 let i=MUS.idx+1;if(MUS.azar){do{i=Math.floor(Math.random()*n);}while(i===MUS.idx);}
 musCambiar(i);
}
// suena en los menús y durante la presentación de la pelea; se corta cuando arranca el round
const enMenu=()=>curScreen!=='fight'||(typeof G!=='undefined'&&G&&G.phase==='pres');
const musDebe=()=>sound&&MUS.quiere&&MUS.fuente==='lista'&&enMenu()&&!document.hidden;
setInterval(()=>{
 if(!AC)return;
 if(musDebe())musArrancar();else musParar();
 // Spotify: se pausa en las peleas y vuelve después
 if(MUS.fuente==='spotify'&&MUS.spoCtl){
  const frenar=!enMenu()||document.hidden||!sound;
  if(frenar&&!MUS.spoPausado){MUS.spoFrenado=true;MUS.spoCtl.pause();}
  else if(!frenar&&MUS.spoFrenado){MUS.spoFrenado=false;MUS.spoCtl.resume();}
 }
},300);
document.addEventListener('visibilitychange',()=>{if(document.hidden)musParar();});
document.addEventListener('pointerdown',function m1(){initAudio();document.removeEventListener('pointerdown',m1,true);},true);
document.addEventListener('keydown',function m2(){initAudio();document.removeEventListener('keydown',m2,true);},true);

/* ---------- tu música (queda guardada en el dispositivo) ---------- */
const MDB={db:null,
 abrir(){return this.db?Promise.resolve(this.db):new Promise((ok,no)=>{try{const r=indexedDB.open('pmma-musica',1);r.onupgradeneeded=()=>r.result.createObjectStore('temas',{keyPath:'id'});
  r.onsuccess=()=>{this.db=r.result;ok(this.db);};r.onerror=()=>no(r.error);}catch(e){no(e);}});},
 async op(modo,fn){const db=await this.abrir();return new Promise((ok,no)=>{const tx=db.transaction('temas',modo),st=tx.objectStore('temas'),r=fn(st);tx.oncomplete=()=>ok(r&&r.result);tx.onerror=()=>no(tx.error);});},
 todos(){return this.op('readonly',st=>st.getAll());},poner(x){return this.op('readwrite',st=>st.put(x));},sacar(id){return this.op('readwrite',st=>st.delete(id));}
};
async function musCargarLista(){
 const base=TEMAS.map(t=>({id:'j-'+t.id,nombre:t.nombre,estilo:t.estilo,tipo:'juego',tema:t}));
 let mias=[];try{mias=(await MDB.todos()||[]).sort((a,b)=>a.fecha-b.fecha).map(x=>({...x,tipo:'propia'}));}catch(e){}
 const act=musActual();MUS.lista=[...base,...mias];
 if(act){const j=MUS.lista.findIndex(x=>x.id===act.id);if(j>=0)MUS.idx=j;}
 musUI();
}
async function musAgregar(files){
 let n=0;for(const f of files){if(!/^audio\//.test(f.type)&&!/\.(mp3|m4a|aac|ogg|wav|flac|opus)$/i.test(f.name))continue;
  try{await MDB.poner({id:'p-'+Date.now()+'-'+n,nombre:f.name.replace(/\.[^.]+$/,''),blob:f,fecha:Date.now()+n});n++;}catch(e){alert('No se pudo guardar "'+f.name+'". Puede que el celular no tenga espacio.');}}
 await musCargarLista();
 if(n){const j=MUS.lista.length-n;MUS.fuente==='spotify'?0:musCambiar(j);}
}
async function musBorrar(id){try{await MDB.sacar(id);}catch(e){}const era=musActual()&&musActual().id===id;if(era){musParar();if(MUS.audio)MUS.audio._id=null;}await musCargarLista();if(era)musCambiar(0);}

/* ---------- Spotify (reproductor oficial embebido) ---------- */
function spoUri(link){
 link=String(link||'').trim();let m=link.match(/spotify:(playlist|album|track|artist|episode|show):([A-Za-z0-9]+)/);
 if(!m)m=link.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/);
 return m?`spotify:${m[1]}:${m[2]}`:null;
}
let spoApi=null,spoEsperando=[];
function spoCargarApi(cb){
 if(spoApi){cb(spoApi);return;}spoEsperando.push(cb);if(spoEsperando.length>1)return;
 window.onSpotifyIframeApiReady=api=>{spoApi=api;spoEsperando.splice(0).forEach(f=>f(api));};
 const s=document.createElement('script');s.src='https://open.spotify.com/embed/iframe-api/v1';s.async=true;
 s.onerror=()=>{spoEsperando=[];$('#mpSpoMsg').textContent='No se pudo conectar con Spotify. Revisá que tengas internet.';};document.head.appendChild(s);
}
function spoUsar(link){
 const uri=spoUri(link);if(!uri){$('#mpSpoMsg').textContent='Ese link no parece de Spotify. Copiá el link desde Spotify: Compartir → Copiar enlace.';return;}
 $('#mpSpoMsg').textContent='Cargando Spotify…';
 spoCargarApi(api=>{
  const box=$('#mpSpoBox');if(MUS.spoCtl){try{MUS.spoCtl.destroy();}catch(e){}MUS.spoCtl=null;}box.innerHTML='<div></div>';
  api.createController(box.firstChild,{uri,width:'100%',height:152},ctl=>{
   MUS.spoCtl=ctl;MUS.spo=uri;MUS.fuente='spotify';MUS.spoPausado=true;musParar();musGuardar();musUI();
   ctl.addListener('playback_update',e=>{MUS.spoPausado=!!(e&&e.data&&e.data.isPaused);});
   $('#mpSpoMsg').textContent='Tocá ▶ en el reproductor de Spotify. En las peleas se pausa solo.';
  });
 });
}
function spoQuitar(){if(MUS.spoCtl){try{MUS.spoCtl.destroy();}catch(e){}}MUS.spoCtl=null;MUS.spo=null;MUS.fuente='lista';$('#mpSpoBox').innerHTML='';$('#mpSpoMsg').textContent='';musGuardar();musUI();}

/* ---------- pantalla del reproductor ---------- */
function musGuardar(){try{localStorage.setItem('pmma-mus',JSON.stringify({id:musActual()&&musActual().id,azar:MUS.azar,quiere:MUS.quiere,spo:MUS.spo}));}catch(e){}}
function musUI(){
 const it=musActual(),btn=$('#musBtn');if(!btn)return;
 const nom=MUS.fuente==='spotify'?'Spotify':it?it.nombre:'—';
 btn.innerHTML=`<span class="mb-eq${(MUS.on||(MUS.fuente==='spotify'&&!MUS.spoPausado))?' on':''}"><i></i><i></i><i></i></span>${esc(nom)}`;
 $('#mpNombre').textContent=MUS.fuente==='spotify'?'Spotify (tu link)':it?it.nombre:'—';
 $('#mpEstilo').textContent=MUS.fuente==='spotify'?'':it?(it.tipo==='juego'?'Tema del juego · '+it.estilo:'Tu música'):'';
 $('#mpPlay').innerHTML=(MUS.quiere&&MUS.fuente==='lista')?'❚❚':'▶';$('#mpAzar').checked=MUS.azar;
 $('#mpSpoQuitar').hidden=MUS.fuente!=='spotify';
 const L=$('#mpLista');
 L.innerHTML='<div class="mp-h">TEMAS DEL JUEGO</div>'+MUS.lista.map((x,i)=>(x.tipo==='propia'&&(i===0||MUS.lista[i-1].tipo!=='propia')?'<div class="mp-h">TU MÚSICA</div>':'')+
  `<div class="mp-it${i===MUS.idx&&MUS.fuente==='lista'?' on':''}" data-i="${i}"><b>${esc(x.nombre)}</b><small>${x.tipo==='juego'?esc(x.estilo):'archivo'}</small>${x.tipo==='propia'?`<button class="mp-x" data-del="${x.id}" aria-label="Quitar">✕</button>`:''}</div>`).join('')+
  (MUS.lista.some(x=>x.tipo==='propia')?'':'<div class="mp-vacio">Todavía no agregaste canciones tuyas.</div>');
 if(!sound)$('#mpEstilo').textContent='El sonido está apagado (casilla "Sonido" del menú).';
}
function musAbrir(v){const p=$('#musPanel');p.classList.toggle('abierto',v);p.setAttribute('aria-hidden',v?'false':'true');if(v)musUI();}
function musIniciarUI(){
 $('#musBtn').onclick=()=>{initAudio();musAbrir(true);};
 $('#mpCerrar').onclick=()=>musAbrir(false);
 $('#musPanel').addEventListener('click',e=>{if(e.target.id==='musPanel')musAbrir(false);});
 $('#mpPlay').onclick=()=>{initAudio();if(MUS.fuente==='spotify'){spoQuitar();MUS.quiere=true;}else MUS.quiere=!MUS.quiere;musGuardar();if(!MUS.quiere)musParar();musUI();};
 $('#mpNext').onclick=()=>{initAudio();if(MUS.fuente==='spotify')spoQuitar();MUS.quiere=true;musSiguiente();};
 $('#mpPrev').onclick=()=>{initAudio();if(MUS.fuente==='spotify')spoQuitar();MUS.quiere=true;musCambiar(MUS.idx-1);};
 $('#mpAzar').onchange=e=>{MUS.azar=e.target.checked;musGuardar();};
 $('#mpLista').addEventListener('click',e=>{
  const d=e.target.closest('[data-del]');if(d){e.stopPropagation();if(confirm('¿Quitar esta canción del juego?'))musBorrar(d.dataset.del);return;}
  const it=e.target.closest('[data-i]');if(!it)return;initAudio();if(MUS.fuente==='spotify')spoQuitar();MUS.quiere=true;musCambiar(+it.dataset.i);});
 $('#mpArchivo').onchange=e=>{const f=[...e.target.files];e.target.value='';if(f.length)musAgregar(f);};
 $('#mpSpoUsar').onclick=()=>spoUsar($('#mpSpoLink').value);
 $('#mpSpoQuitar').onclick=()=>{spoQuitar();MUS.quiere=true;};
 // lo último que se eligió
 let g={};try{g=JSON.parse(localStorage.getItem('pmma-mus')||'{}');}catch(e){}
 if(g.azar===false)MUS.azar=false;if(g.quiere===false)MUS.quiere=false;
 MUS.lista=TEMAS.map(t=>({id:'j-'+t.id,nombre:t.nombre,estilo:t.estilo,tipo:'juego',tema:t}));
 MUS.idx=Math.floor(Math.random()*MUS.lista.length);   // cada vez que abrís el juego arranca con un tema distinto
 musCargarLista().then(()=>{if(g.id&&!MUS.azar){const j=MUS.lista.findIndex(x=>x.id===g.id);if(j>=0)MUS.idx=j;}musUI();});
 if(g.spo){$('#mpSpoLink').value=g.spo.replace(/^spotify:(\w+):/,'https://open.spotify.com/$1/');$('#mpSpoMsg').textContent='Tocá USAR para volver a cargar tu Spotify.';}
 musUI();
}
musIniciarUI();

/* ---------- Música de entrada (modo carrera) ----------
   Durante la presentación de la pelea suena el tema que eligió el jugador; después se vuelve a lo que sonaba en el menú. */
function musEntrada(id){
 if(MUS.fuente!=='lista'||!sound)return null;const j=MUS.lista.findIndex(x=>x.id===id);if(j<0)return null;
 MUS.entrada={idx:MUS.idx,quiere:MUS.quiere};MUS.quiere=true;
 if(j!==MUS.idx||!MUS.on){musParar();MUS.idx=j;MUS.step=0;if(MUS.audio){MUS.audio._id=null;}setTimeout(()=>{if(musDebe())musArrancar();},60);}
 return MUS.lista[j].nombre;
}
function musFinEntrada(){
 if(!MUS.entrada)return;const e=MUS.entrada;MUS.entrada=null;musParar();
 MUS.idx=e.idx;MUS.quiere=e.quiere;MUS.step=0;if(MUS.audio)MUS.audio._id=null;musUI();
}
// lista para elegir la música de entrada (temas del juego + tu música)
function musOpciones(sel){return'<option value="">Sin música de entrada</option>'+MUS.lista.map(x=>`<option value="${x.id}"${x.id===sel?' selected':''}>${esc(x.nombre)}${x.tipo==='juego'?' ('+esc(x.estilo)+')':' (tuya)'}</option>`).join('');}
