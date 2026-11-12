/* ---------------- Presentación antes de cada pelea ----------------
   Como en los juegos de UFC: 1) los dos peleadores en grande con sus nombres y la división,
   2) cartel gigante con el nombre de la división, 3) cámara que gira alrededor del octágono desde arriba.
   Se puede saltar tocando la pantalla. Mientras dura, la pelea está frenada (G.phase='pres'). */
const PRES={on:false,t:0,raf:0,fin:null,esc:[2.9,1.5,3.4]};
const presEl=()=>$('#presenta');

// Retrato: el cuadro de guardia del peleador, recortado de la cabeza a la cintura
function presRetrato(cv,d){
 const S=spriteOf(d),g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
 if(!S||!S.frames||!S.frames.guard)return;
 const[sx,sy,w,h]=S.frames.guard[0],k=S.k||2;
 // recorte justo: de la cabeza a la cintura, sin el aire de los costados
 let top=0,x0=0,x1=w;try{const tc=document.createElement('canvas');tc.width=w;tc.height=h;const tg=tc.getContext('2d');tg.drawImage(S.img,sx,sy,w,h,0,0,w,h);
  const px=tg.getImageData(0,0,w,h).data;let mn=w,mx=0,t=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(px[(y*w+x)*4+3]>20){if(t<0)t=y;if(x<mn)mn=x;if(x>mx)mx=x;}
  if(t>=0){top=t;x0=mn;x1=mx+1;}}catch(e){}
 const ch=Math.round((h-top)*.62),cw=x1-x0;cv.width=cw*k;cv.height=ch*k;g.imageSmoothingEnabled=false;
 g.drawImage(S.img,sx+x0,sy+top,cw,ch,0,0,cw*k,ch*k);
 // que no pase de un tercio del ancho de la pantalla (así no tapa los nombres)
 cv.style.height=`min(94%, ${(34*ch/cw).toFixed(1)}vw)`;
}
function presDivision(){
 const id=(G.p.d.div||G.r.d.div||'');const D=(typeof DIVISIONES!=='undefined'&&DIVISIONES.find(x=>x.id===id))||null;
 const nom=D?D.nombre:'Peso abierto';const fem=false;
 const partes=nom.replace(/\s*\(.*\)/,'').split(' ');
 return{nom:nom.toUpperCase(),a:(partes[0]||'PESO').toUpperCase(),b:(partes.slice(1).join(' ')||'').toUpperCase()+(fem?' FEMENINO':''),kg:D?`${D.kg} KG · ${D.lb} LB`:''};
}
function presentacion(listo){
 const el=presEl();if(!el||!G){listo&&listo();return;}
 const dv=presDivision(),tit=(G.ctx&&G.ctx.title)||'PELEA',rds=G.rounds||3;
 $('#prBadge').textContent=((G.ctx&&G.ctx.org)||'Ultimate Warrior').toUpperCase();
 $('#prNomA').textContent=G.p.d.last.toUpperCase();$('#prNomB').textContent=G.r.d.last.toUpperCase();
 $('#prBarA').textContent=G.p.d.last.toUpperCase();
 $('#prDiv').textContent=dv.nom;$('#prTit').textContent=`${tit.toUpperCase()} · ${rds} ROUNDS`;
 $('#prDivA').textContent=dv.a;$('#prDivB').textContent=dv.b;$('#prDivKg').textContent=dv.kg;
 const E=G.esc,lugar=E?E.lugar:'';
 $('#prLugar').textContent=lugar.toUpperCase();
 $('#prPie').innerHTML=`<b>${esc(G.p.d.last.toUpperCase())}</b> vs <b>${esc(G.r.d.last.toUpperCase())}</b> · ${esc(dv.nom)} · ${rds} rounds${lugar?`<small>${esc(lugar)}</small>`:''}`;
 // música de entrada elegida en la carrera
 const wk=G.ctx&&G.ctx.walkout,ok=wk&&typeof musEntrada==='function'&&musEntrada(wk);
 $('#prMus').textContent=ok?`♪ SALE CON: ${ok.toUpperCase()}`:'';
 const recA=G.p.d.bio&&G.p.d.bio.record,recB=G.r.d.bio&&G.r.d.bio.record;
 $('#prRecA').textContent=recA||'';$('#prRecB').textContent=recB||'';
 presRetrato($('#prFotA'),G.p.d);presRetrato($('#prFotB'),G.r.d);
 el.className='presenta e1';el.hidden=false;PRES.on=true;PRES.t=0;PRES.fin=listo;PRES.ult=performance.now();PRES.esc3=false;
 cancelAnimationFrame(PRES.raf);PRES.raf=requestAnimationFrame(presPaso);
 if(typeof sfx==='function')sfx('whoosh');
}
function presPaso(now){
 if(!PRES.on)return;const dt=Math.min(.05,(now-PRES.ult)/1000);PRES.ult=now;PRES.t+=dt;
 const[a,b,c3]=PRES.esc,el=presEl(),t=PRES.t;
 if(t<a)el.className='presenta e1';
 else if(t<a+b){if(!el.classList.contains('e2')){el.className='presenta e2';if(typeof sfx==='function')sfx('big');}}
 else if(t<a+b+c3){if(!el.classList.contains('e3')){el.className='presenta e3';octPrep();}octDibujar((t-a-b)/c3);}
 else{presTerminar();return;}
 PRES.raf=requestAnimationFrame(presPaso);
}
function presTerminar(){
 if(!PRES.on)return;PRES.on=false;cancelAnimationFrame(PRES.raf);
 const el=presEl();el.classList.add('fuera');setTimeout(()=>{el.hidden=true;el.className='presenta';},300);
 if(typeof musFinEntrada==='function')musFinEntrada();
 const f=PRES.fin;PRES.fin=null;f&&f();
}

/* ---------- Octágono en 3D (pixel art, cámara que gira) ---------- */
const OCT={pub:null,cv:null,g:null};
function octPrep(){
 const cv=$('#prOct');OCT.cv=cv;cv.width=W;cv.height=H;OCT.g=cv.getContext('2d');
 if(!OCT.pub){   // público: puntitos en gradas alrededor de la jaula
  let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;const cols=['#3a2f3a','#2c3446','#463a2c','#2f3d33','#4a2c2c','#5a4a36','#6b5a4a','#b48a6e'];
  OCT.pub=[];for(let i=0;i<2600;i++){const a=r()*Math.PI*2,rad=14+r()*12;OCT.pub.push({x:Math.cos(a)*rad,y:Math.sin(a)*rad,z:(rad-14)*.55+r()*.4+.2,c:cols[Math.floor(r()*cols.length)]});}
 }
}
function octCam(k){
 const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;   // suave al principio y al final
 const th=-.9+e*2.1,el=(68-e*46)*Math.PI/180,dist=26-e*12,T=[0,0,1+e*.4];
 const cam=[T[0]+dist*Math.cos(el)*Math.sin(th),T[1]-dist*Math.cos(el)*Math.cos(th),T[2]+dist*Math.sin(el)];
 const f=[T[0]-cam[0],T[1]-cam[1],T[2]-cam[2]],fl=Math.hypot(...f);f[0]/=fl;f[1]/=fl;f[2]/=fl;
 let r=[f[1],-f[0],0];const rl=Math.hypot(...r);r=[r[0]/rl,r[1]/rl,0];
 const u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];
 return{cam,f,r,u,F:H*1.15};
}
function octP(C,p){const v=[p[0]-C.cam[0],p[1]-C.cam[1],p[2]-C.cam[2]];const z=v[0]*C.f[0]+v[1]*C.f[1]+v[2]*C.f[2];if(z<.3)return null;
 return[W/2+(v[0]*C.r[0]+v[1]*C.r[1]+v[2]*C.r[2])/z*C.F,H/2-(v[0]*C.u[0]+v[1]*C.u[1]+v[2]*C.u[2])/z*C.F,z];}
function octPoly(g,C,pts,fill,stroke,lw){const P=pts.map(p=>octP(C,p));if(P.some(q=>!q))return;g.beginPath();P.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();
 if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke();}}
const octV=(r,z,i)=>{const a=Math.PI/8+i*Math.PI/4;return[Math.cos(a)*r,Math.sin(a)*r,z];};
function octDibujar(k){
 const g=OCT.g,C=octCam(k);if(!g)return;g.imageSmoothingEnabled=false;
 // fondo: oscuro con luces del techo
 const Ee=G.esc||{},dia=Ee.fondo==='patio'?['#5aa9e6','#b8dcf5']:Ee.fondo==='playa'?['#3b2a6b','#ffb35a']:Ee.techo||['#05070b','#141822'];
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,dia[0]);bg.addColorStop(1,dia[1]);g.fillStyle=bg;g.fillRect(0,0,W,H);
 // escenarios sin jaula: el piso llega hasta el horizonte (la gente queda parada encima)
 const Es=G.esc||{};if(!Es.jaula&&Es.s3d){const hz=octP(C,[0,0,0]);g.fillStyle=Es.s3d;const pts=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const q=octP(C,[Math.cos(a)*60,Math.sin(a)*60,0]);if(q)pts.push(q);}
  if(pts.length>2){g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();}}
 // público (de lejos a cerca)
 const pub=[];for(const p of OCT.pub){const q=octP(C,[p.x,p.y,p.z]);if(q&&q[0]>-2&&q[0]<W+2&&q[1]>-2&&q[1]<H+2)pub.push([q,p.c]);}
 pub.sort((a,b)=>b[0][2]-a[0][2]);for(const[q,c]of pub){const s=q[2]<16?2:1;g.fillStyle=c;g.fillRect(Math.round(q[0]),Math.round(q[1]),s,s);}
 const E=G.esc||{jaula:1,lona:'#d3d6db',logo:['#a51b26','#c8202f','#e8eaed','#c8202f']},J=!!E.jaula,LG=E.logo||['#a51b26','#c8202f','#e8eaed','#c8202f'];
 if(!J){octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(7,0,i)),'rgba(0,0,0,.12)');}
 else{
 // base negra, lona y logo
 octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(11.6,0,i)),'#0b0d12');
 octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(10,0,i)),E.lona||'#d3d6db');
 octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(9,0,i)),null,'rgba(70,74,82,.55)',1);
 octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(3.4,0,i)),LG[0]);octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(2.8,0,i)),LG[1]);
 octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(1.9,0,i)),LG[2]);octPoly(g,C,[0,1,2,3,4,5,6,7].map(i=>octV(1,0,i)),LG[3]);
 }
 // luz cenital sobre la lona
 const c0=octP(C,[0,0,0]);if(c0){const sp=g.createRadialGradient(c0[0],c0[1],2,c0[0],c0[1],C.F*9/c0[2]);sp.addColorStop(0,'rgba(255,248,230,.25)');sp.addColorStop(1,'rgba(255,248,230,0)');g.fillStyle=sp;g.fillRect(0,0,W,H);}
 // lados de la jaula: los de atrás antes de los peleadores, los de adelante después
 const lados=[];for(let i=0;i<8;i++){const a=octV(10,0,i),b=octV(10,0,(i+1)%8),m=octP(C,[(a[0]+b[0])/2,(a[1]+b[1])/2,1.1]);lados.push({i,z:m?m[2]:0});}
 const zc=(octP(C,[0,0,1.1])||[0,0,99])[2];
 const lado=(i)=>{const a=octV(10,0,i),b=octV(10,0,(i+1)%8),A=[a[0],a[1],2.4],B=[b[0],b[1],2.4];
  octPoly(g,C,[a,b,B,A],'rgba(20,24,30,.28)');
  for(let s=1;s<6;s++){const t=s/6,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];const q1=octP(C,[p[0],p[1],0]),q2=octP(C,[p[0],p[1],2.4]);if(q1&&q2){g.strokeStyle='rgba(170,180,195,.3)';g.lineWidth=1;g.beginPath();g.moveTo(q1[0],q1[1]);g.lineTo(q2[0],q2[1]);g.stroke();}}
  for(const h of[.8,1.6]){const q1=octP(C,[a[0],a[1],h]),q2=octP(C,[b[0],b[1],h]);if(q1&&q2){g.strokeStyle='rgba(170,180,195,.3)';g.beginPath();g.moveTo(q1[0],q1[1]);g.lineTo(q2[0],q2[1]);g.stroke();}}
  const t1=octP(C,A),t2=octP(C,B);if(t1&&t2){g.strokeStyle='#0b0d12';g.lineWidth=Math.max(1,C.F*.25/t1[2]);g.beginPath();g.moveTo(t1[0],t1[1]);g.lineTo(t2[0],t2[1]);g.stroke();}
  const p0=octP(C,a),p1=octP(C,A);if(p0&&p1){g.strokeStyle='#08090c';g.lineWidth=Math.max(2,C.F*.35/p0[2]);g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke();}
 };
 if(J)lados.filter(l=>l.z>=zc).sort((a,b)=>b.z-a.z).forEach(l=>lado(l.i));
 // los dos peleadores parados en sus esquinas
 const pel=[[G.p,[-3.2,0,0],1],[G.r,[3.2,0,0],-1]].map(([f,p,fc])=>({f,p,fc,q:octP(C,p)})).filter(x=>x.q).sort((a,b)=>b.q[2]-a.q[2]);
 for(const x of pel){const S=spriteOf(x.f.d);if(!S||!S.frames||!S.frames.guard)continue;const[sx,sy,w,h,ax]=S.frames.guard[Math.floor(PRES.t*6)%S.frames.guard.length],kk=S.k||2;
  const hp=C.F*3.4/x.q[2],sc=hp/(h*kk);
  // mira hacia el otro: según de qué lado queda en pantalla
  const otro=pel.find(o=>o!==x),mir=otro&&otro.q[0]<x.q[0]?-1:1;
  g.save();g.translate(Math.round(x.q[0]),Math.round(x.q[1]));g.scale(mir*sc*kk,sc*kk);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-14,-2,28,3);
  try{g.drawImage(S.img,sx,sy,w,h,-ax,-h,w,h);}catch(e){}g.restore();}
 if(J)lados.filter(l=>l.z<zc).sort((a,b)=>b.z-a.z).forEach(l=>lado(l.i));
 // luces del techo y viñeta suave
 for(const lx of[.2,.5,.8]){const lg=g.createRadialGradient(W*lx,0,0,W*lx,0,40);lg.addColorStop(0,'rgba(255,244,214,.35)');lg.addColorStop(1,'rgba(255,244,214,0)');g.fillStyle=lg;g.fillRect(0,0,W,40);}
 // fundido a negro al final
 if(k>.88){g.fillStyle=`rgba(0,0,0,${(k-.88)/.12})`;g.fillRect(0,0,W,H);}
}
// tocar para saltar
(function(){const el=presEl();if(!el)return;el.addEventListener('pointerdown',e=>{e.preventDefault();if(PRES.on)presTerminar();});})();
