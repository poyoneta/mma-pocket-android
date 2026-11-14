/* ---------------- Guardado en el navegador ---------------- */
// Todo lo que se guarda queda en este navegador (localStorage). Si el navegador no deja guardar, el juego sigue andando igual.
const store={
 get(k,d){try{const v=localStorage.getItem('lajaula.'+k);return v?JSON.parse(v):d;}catch(e){return d;}},
 set(k,v){try{localStorage.setItem('lajaula.'+k,JSON.stringify(v));this.mod(k);return true;}catch(e){return false;}},
 del(k){try{localStorage.removeItem('lajaula.'+k);this.mod(k);}catch(e){}},
 // Marca la hora del último cambio y avisa a la nube (si está conectada)
 mod(k){if(k==='vertical')return;try{localStorage.setItem('lajaula.ts',String(Date.now()));}catch(e){}if(typeof nubeCambio==='function')nubeCambio();}
};
let CUSTOM=store.get('custom',[]),EXTRA=[];
// Todos los peleadores disponibles: los del juego, los que creaste y los generados al azar que usaste
const allFighters=()=>ROSTER.concat(CUSTOM,EXTRA);
/* ---------------- Divisiones ---------------- */
const divName=id=>(DIVISIONES.find(d=>d.id===id)||DIVISIONES.find(d=>d.id==='ligero')).nombre;
const fDiv=f=>f.div||'ligero';
const byRank=(a,b)=>(a.custom?99:a.rank??50)-(b.custom?99:b.rank??50);
// Peleadores de una división ('todas' = todos), ordenados: campeón, #1..#9, después los tuyos y los generados
const fightersOf=div=>allFighters().filter(f=>div==='todas'||fDiv(f)===div).sort(byRank);
const rankTxt=f=>f.custom?'Tuyo':f.rank===0?'Campeón':f.rank!=null?'#'+f.rank:'';
function divOptions(val,withAll){
 const op=d=>`<option value="${d.id}"${d.id===val?' selected':''}>${d.nombre} · ${d.kg} kg</option>`;
 return(withAll?`<option value="todas"${val==='todas'?' selected':''}>Todas las divisiones</option>`:'')
  +DIVISIONES.map(op).join('');}

/* ---------------- Pantallas ---------------- */
const SCREENS=['home','quick','create','tourney','career','fight'];
let curScreen='home';
function showScreen(id){
 curScreen=id;
 for(const s of SCREENS)$('#'+s).hidden=s!==id;
 const el=$('#'+id);el.scrollTop=0;
 if(id==='home')renderHome();
 else if(id==='quick')renderMenu();
 else if(id==='create')openCreate();
 else if(id==='tourney')renderTourney();
 else if(id==='career')renderCareer();
 if(id!=='fight'){const f=el.querySelector('.m2c,.tile,.back');if(f)f.focus({preventScroll:true});}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-go]');if(!b)return;
 const g=b.dataset.go;initAudio();
 if(g==='help')showHelp();
 else if(g==='quickgen'){showScreen('quick');requestAnimationFrame(()=>$('#ggrid').scrollIntoView({behavior:'smooth',block:'start'}));}
 else{hideOv();showScreen(g);}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&curScreen!=='home'&&curScreen!=='fight'){if(!$('#ov').hidden)hideOv();else showScreen('home');}
});

/* ---------------- Menú principal ---------------- */
function renderHome(){
 const k=typeof C!=='undefined'&&C;
 $('#hRec').hidden=!k;
 if(k){$('#hRec').textContent=`${k.f.last} · ${k.rec.w}-${k.rec.l}-${k.rec.d} · ${rankLabel(k)}`;$('#careerSub').textContent=`${k.rec.w}-${k.rec.l}-${k.rec.d} · ${rankLabel(k)}`;}
 else $('#careerSub').textContent='Del regional al cinturón';
}
function showHelp(){
 showOv(`<h3>CÓMO SE PELEA</h3><ul class="help">
  <li>Caminá y medí la distancia: el jab, el recto y las patadas llegan lejos; los cross y el uppercut hay que tirarlos encima.</li>
  <li>Moverte al costado (<b>↑ ↓</b> o el stick para arriba / abajo) te hace girar alrededor del rival por todo el octógono. Cuando el rival <b>brilla en amarillo</b> está por pegarte: correte al costado y el golpe pasa de largo, cubrite o alejate. Si falla, aparece <b>¡CONTRA!</b> y tus golpes entran mejor.</li>
  <li>Cubrirse gasta la barra <b>BLOQUEO</b>. Si se vacía te rompen la guardia y quedás expuesto: no te quedes cubierto todo el tiempo.</li>
  <li>Si <b>brilla en azul</b> va al derribo: mantené cubrirse para sprawlear o alejate.</li>
  <li>En el piso tocá la acción cuando la marca blanca pase por la <b>zona verde</b>. El centro dorado es perfecto.</li>
 </ul>${controlsHtml()}<div class="btns"><button class="go" data-act="close">ENTENDIDO</button></div>`);
}
// Arte animado de los mosaicos del menú: escenas propias en pixel art
const artLooks={create:null,ct:-9,rand:[],rt:[0,-.7,-1.4]};
function confetti(g,t,w,h,n){const cols=['#ffd23f','#ffffff','#3a8bff','#4fcf6a','#ff8a7a'];for(let i=0;i<n;i++){const sp=16+(i%5)*6,y=((t*sp+i*37)%(h+10))-10,x=(i*53.7)%w+Math.sin(t*2+i)*4;g.fillStyle=cols[i%cols.length];g.fillRect(Math.round(x),Math.round(y),2,i%3?2:1);}}
function sparkBurst(g,x,y,k){const r=3+k*10;g.fillStyle='#fff6c2';for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.8),2,2);}if(k<.5){g.fillStyle='#ffd23f';g.fillRect(x-2,y-2,5,5);}}
function keyCap(g,x,y,ch,on){g.fillStyle='#07080c';g.fillRect(x-1,y-1,13,14);g.fillStyle=on?'#ffd23f':'#e9ebef';g.fillRect(x,y,11,12);g.fillStyle=on?'#b38e12':'#a9aeb6';g.fillRect(x,y+10,11,2);g.font='800 11px "Barlow Condensed", sans-serif';g.textAlign='center';g.textBaseline='top';g.fillStyle='#111';g.fillText(ch,x+6,y+2);}
function die(g,x,y,n){g.fillStyle='#07080c';g.fillRect(x-1,y-1,18,18);g.fillStyle='#f4f5f7';g.fillRect(x,y,16,16);g.fillStyle='#c9ccd2';g.fillRect(x,y+14,16,2);g.fillStyle='#c8202f';const P={1:[[7,7]],2:[[3,3],[11,11]],3:[[3,3],[7,7],[11,11]],4:[[3,3],[11,3],[3,11],[11,11]],5:[[3,3],[11,3],[7,7],[3,11],[11,11]],6:[[3,3],[11,3],[3,7],[11,7],[3,11],[11,11]]}[n];for(const[a,b]of P)g.fillRect(x+a,y+b,3,3);}
function shadowFig(g,f,x,gy,face,col){const prev=c;c=g;blitFighter({d:f,hp:100},{pose:'guard',bob:0,sil:col},x,gy,face,0);c=prev;}
function drawHomeArt(t){
 if(!$("#artQuick"))return;
 // Pelea rápida: una patada alta que conecta
 {const g=$('#artQuick').getContext('2d');g.clearRect(0,0,140,100);
  const ph=t%2.6;let pa='guard',pb='guard',hit=-1;
  if(ph>=.6&&ph<.95)pa='kwind';else if(ph>=.95&&ph<1.75){pa='high';pb='hurt';hit=(ph-.95)/.8;}
  drawAnimated(g,ROSTER[4],98,98,-1,pb,t+1,null);drawAnimated(g,ROSTER[3],54,98,1,pa,t,null);
  if(hit>=0&&hit<.7)sparkBurst(g,92,28,hit/.7);}
 // Modo carrera: levantando el cinturón
 {const g=$('#artCareer').getContext('2d');g.clearRect(0,0,90,100);
  const k=(typeof C!=='undefined'&&C&&!C.f.sprite)?C.f:ROSTER[1];
  const gl=(t*1.2)%1;g.fillStyle=`rgba(242,201,76,${.18+.12*Math.sin(t*3)})`;for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.32;g.beginPath();g.moveTo(48,6);g.lineTo(48+Math.cos(a-.06)*60,6+Math.sin(a-.06)*60);g.lineTo(48+Math.cos(a+.06)*60,6+Math.sin(a+.06)*60);g.fill();}
  drawAnimated(g,k,42,100,1,'raise',t,null);
  if(gl<.25){g.fillStyle='#fff';g.fillRect(50,2,1,7);g.fillRect(47,5,7,1);}}
 // Crear peleador: ficha que cambia de look
 {if(t-artLooks.ct>1.6){artLooks.ct=t;artLooks.create=randFighter();}
  const f=artLooks.create,g=$('#artCreate').getContext('2d');g.clearRect(0,0,90,100);
  shadowFig(g,f,36,96,1,'rgba(18,19,24,.16)');drawAnimated(g,f,54,98,1,'guard',t,null);
  [f.look.skin,f.look.hair,f.look.shorts,f.look.gloves].forEach((col,i)=>{g.fillStyle='#07080c';g.fillRect(78,10+i*12,10,10);g.fillStyle=col||'#2c2f37';g.fillRect(79,11+i*12,8,8);});}
 // Modo torneo: el campeón con el cinturón, rivales en sombra y papelitos
 {const g=$('#artTourney').getContext('2d');g.clearRect(0,0,150,104);
  shadowFig(g,ROSTER[7],30,94,1,'rgba(60,4,10,.55)');shadowFig(g,ROSTER[2],120,94,-1,'rgba(60,4,10,.55)');
  drawAnimated(g,ROSTER[5],75,104,1,'raise',t,null);confetti(g,t,150,104,28);}
 // Cómo se pelea: golpes con sus teclas
 {const g=$('#artHelp').getContext('2d');g.clearRect(0,0,90,100);
  const seq=['jab','guard','cross','guard','hook','guard','hookR','guard'],keys={jab:'Q',cross:'W',hook:'E',hookR:'R'},p=seq[Math.floor(t*2.2)%seq.length];
  drawAnimated(g,ROSTER[6],34,100,1,p,t,null);
  ['Q','W','E','R'].forEach((k,j)=>keyCap(g,62+(j%2)*14,8+Math.floor(j/2)*16,k,keys[p]===k));}
 // Peleadores al azar: se van renovando, con un dado
 {const g=$('#artRand').getContext('2d');g.clearRect(0,0,140,100);
  for(let j=0;j<3;j++){if(!artLooks.rand[j]||t-artLooks.rt[j]>2.2){artLooks.rt[j]=t;artLooks.rand[j]=randFighter();}}
  drawAnimated(g,artLooks.rand[0],46,94,1,'guard',t,null);drawAnimated(g,artLooks.rand[2],118,94,-1,'guard',t+2,null);drawAnimated(g,artLooks.rand[1],84,100,-1,'guard',t+1,null);
  die(g,4,78,1+Math.floor(t*2.5)%6);}
}
/* ---------------- Pantalla completa ---------------- */
if(document.fullscreenEnabled){
 const fb=$('#fsBtn');fb.hidden=false;
 fb.onclick=()=>{try{const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();if(p&&p.catch)p.catch(()=>{});}catch(e){}};
 document.addEventListener('fullscreenchange',()=>{fb.textContent=document.fullscreenElement?'SALIR DE PANTALLA COMPLETA':'PANTALLA COMPLETA';setTimeout(resize,100);});
}
$('#snd').onchange=e=>{sound=e.target.checked;};
// Menú nuevo: flechas para pasar de tarjeta en tarjeta
document.addEventListener('keydown',e=>{
 if(curScreen!=='home'||!$('#ov').hidden)return;
 const cs=[...document.querySelectorAll('#home .m2c')],i=cs.indexOf(document.activeElement);
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=i<0?0:(i+(e.key==='ArrowRight'?1:-1)+cs.length)%cs.length;cs[n].focus();}
});
