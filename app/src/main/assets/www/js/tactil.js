/* ---------------- Mando táctil (celular en horizontal) ----------------
   Botones transparentes con el dibujo de cada golpe (íconos en js/iconos.js):
   izquierda: stick para caminar + CUBRIRSE y ESQUIVAR (se mantienen apretados)
   derecha: JAB, RECTO, LOW KICK y HIGH KICK grandes; CROSS IZQ., UPPERCUT, CROSS DER. y DERRIBO más chicos
   En el piso: JAB / RECTO / LOW KICK pasan a ser las tres acciones del piso (cambian de dibujo). */
const VP={stick:null};
const touchDev=matchMedia('(pointer:coarse)');
const isPortrait=()=>innerHeight>innerWidth;
const vpActive=()=>touchDev.matches&&!isPortrait()&&!PAD.on;

// Stick: arrastrar desde el centro
(function(){
 const st=$('#vstick'),kn=$('#vknob'),R=40;
 const set=(dx,dy)=>{
  const d=Math.hypot(dx,dy),k=d>R?R/d:1;kn.style.transform=`translate(${dx*k}px,${dy*k}px)`;
  input.left=dx<-16;input.right=dx>16;input.down=dy>22&&Math.abs(dy)>Math.abs(dx)*.6;
 };
 const end=e=>{if(VP.stick!==e.pointerId)return;VP.stick=null;kn.style.transform='';input.left=input.right=input.down=false;st.classList.remove('on');};
 st.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();const r=st.getBoundingClientRect();VP.stick=e.pointerId;VP.cx=r.left+r.width/2;VP.cy=r.top+r.height/2;
  st.setPointerCapture(e.pointerId);st.classList.add('on');set(e.clientX-VP.cx,e.clientY-VP.cy);});
 st.addEventListener('pointermove',e=>{if(VP.stick===e.pointerId)set(e.clientX-VP.cx,e.clientY-VP.cy);});
 st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
})();

// Íconos en cada botón
const ICO_BASE={};document.querySelectorAll('#vpad [data-ico]').forEach(b=>{ICO_BASE[b.dataset.mv||b.dataset.hold||b.id]=[b.dataset.ico,b.querySelector('small')?b.querySelector('small').textContent:''];b.querySelector('i').innerHTML=ICO[b.dataset.ico]||'';});
// Botones que se mantienen: cubrirse y esquivar (agacharse para que el golpe pase por arriba)
document.querySelectorAll('[data-hold]').forEach(b=>{
 const k=b.dataset.hold,on=v=>{if(k==='block')input.block=v;else input.down=v;b.classList.toggle('on',v);};
 b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();b.setPointerCapture(e.pointerId);on(true);});
 for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>on(false));
});
// Botones de golpe: cada uno tira su golpe. En el piso, jab / recto / low kick pasan a ser las tres acciones del piso.
function vpPress(b){
 if(!G)return;
 if(G.mode==='ground'){
  const i=b.dataset.g;if(i==null)return;
  const bs=$(G.top==='p'?'#padTop':'#padBot').querySelectorAll('[data-k]');if(bs[+i])doG(bs[+i].dataset.k);return;
 }
 doP(b.dataset.mv);
}
document.querySelectorAll('[data-mv]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();b.classList.add('on');vpPress(b);});
 for(const ev of['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>b.classList.remove('on'));
});
$('#vpause').addEventListener('click',()=>{if(G)pause(!G.paused);});
// Que el mando no haga zoom ni scroll, ni abra el menú del navegador al mantener apretado
$('#vpad').addEventListener('contextmenu',e=>e.preventDefault());

// En el piso, los tres botones grandes cambian de ícono y texto
const ICO_PISO={gnp:'gnp',sub:'sub',up:'up',def:'def',esc:'esc'};
function vpLabels(m){
 const pad=$('#vpad'),ground=m!=='stand';pad.classList.toggle('ground',ground);
 pad.querySelectorAll('[data-g]').forEach(b=>{
  const[ico,txt]=ICO_BASE[b.dataset.mv];let i=ico,t=txt;
  if(ground){const k=$(m==='top'?'#padTop':'#padBot').querySelectorAll('[data-k]')[+b.dataset.g];if(k){i=ICO_PISO[k.dataset.k]||ico;t=k.firstChild.textContent.trim();}}
  b.querySelector('i').innerHTML=ICO[i];b.querySelector('small').textContent=t;
 });
}

// Al empezar la pelea en el celular: pantalla completa y horizontal (si el navegador lo permite)
function vpStart(){if(touchDev.matches&&typeof forzarHorizontal==='function')forzarHorizontal();checkRot();}
// En el celular se juega siempre acostado: en vertical se tapa todo y la pelea se frena
function checkRot(){
 const need=touchDev.matches&&isPortrait();
 $('#rotHint').hidden=!need;
 if(G&&curScreen==='fight'){
  if(need&&!G.paused){G.paused=true;G.rotPause=true;clearInput();}
  else if(!need&&G.rotPause){G.rotPause=false;if($('#ov').hidden)G.paused=false;}
 }
 document.body.classList.toggle('vp',vpActive());
}
window.addEventListener('resize',checkRot);
window.addEventListener('orientationchange',()=>setTimeout(()=>{checkRot();resize();},250));
setInterval(checkRot,500);checkRot();
