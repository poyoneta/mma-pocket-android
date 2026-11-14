/* ---------------- Peleadores con las hojas nuevas (más detalladas) ----------------
   Un solo cuerpo base (pelado, short y guantes negros) y por código se le cambia:
   piel (según la luz de cada píxel), short (diseño del catálogo estirado sobre el short de cada cuadro,
   el rojo del diseño pasa al color del peleador), guantes (color), pelo y barba (capas puestas sobre la cabeza).
   Se arma una vez por peleador y queda guardado. */
const C2=CUERPO2;
const c2Img={cuerpo:new Image(),mascara:new Image(),capas:new Image(),shorts:new Image(),cabezas:new Image(),shortsMini:new Image()};
let c2Listo=0;const C2_TOTAL=Object.keys(c2Img).length;
for(const k in c2Img)c2Img[k].onload=()=>{c2Listo++;if(c2Listo===C2_TOTAL&&typeof onSpriteLoad==='function')onSpriteLoad();};
c2Img.cuerpo.src=C2.src;c2Img.mascara.src=C2.mascara;c2Img.capas.src=C2.capas;c2Img.shorts.src=C2.shorts;c2Img.cabezas.src=C2.cabezas;c2Img.shortsMini.src=C2.shortsMini;
const c2Ok=()=>c2Listo>=C2_TOTAL;
const c2Rgb=h=>{h=(h||'#000').replace('#','');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};

// Look nuevo a partir del viejo (así sirven los 128 del plantel y los peleadores ya creados)
const GRUPO_A_PEIN={'Clásico':7,'Corto':0,'Puntas':2,'Rizado':3,'Rastas':5,'Largo':4};
function look2(d){
 const L=d.look||{},o={};
 o.skin=L.skin||'#c58a62';
 if(L.pel!=null)o.pel=L.pel;
 else if(L.peinado===-1)o.pel=-1;
 else{const g=typeof CB!=='undefined'&&CB.grupos&&L.peinado!=null?CB.grupos[L.peinado]:null;o.pel=g in GRUPO_A_PEIN?GRUPO_A_PEIN[g]:(hash2(d.name||'')%8);
  if(g==='Rizado'&&hash2(d.name||'')%3===0)o.pel=6;if(g==='Clásico'&&hash2(d.name||'')%2)o.pel=1;}
 if(L.bar!=null)o.bar=L.bar;else{const h=hash2((d.last||'')+'b')%10;o.bar=h<4?-1:[0,2,3,4,1,7][h-4];}
 o.sho=L.sho!=null?L.sho:(L.short!=null?L.short%20:hash2(d.name||'')%20);
 o.col=L.shorts||'#c8202f';
 const GC=['#232222','#1f4fd0','#c4232b','#4d6a2f','#ebe9e9'];o.gl=L.gcol||GC[L.guante||0]||'#232222';
 o.hc=L.pelo||'#2a1c14';
 return o;
}
function hash2(s){let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h;}

const c2Cache=new Map();
function sprite2(d){
 if(!c2Ok())return null;
 const o=look2(d),sig=JSON.stringify(o);
 if(c2Cache.has(sig))return c2Cache.get(sig);
 const Wd=c2Img.cuerpo.width,Hd=c2Img.cuerpo.height;
 const cv=document.createElement('canvas');cv.width=Wd;cv.height=Hd;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(c2Img.cuerpo,0,0);
 const mk=document.createElement('canvas');mk.width=Wd;mk.height=Hd;const mg=mk.getContext('2d',{willReadFrequently:true});mg.drawImage(c2Img.mascara,0,0);
 // textura del short estirada a la caja del short de cada cuadro
 const tx=document.createElement('canvas');tx.width=Wd;tx.height=Hd;const tg=tx.getContext('2d',{willReadFrequently:true});tg.imageSmoothingEnabled=true;
 for(const k in C2.frames){const bb=C2.frames[k].bb;if(!bb)continue;tg.drawImage(c2Img.shorts,o.sho*64,0,64,48,bb[0],bb[1],bb[2]-bb[0]+1,bb[3]-bb[1]+1);}
 try{
  const id=g.getImageData(0,0,Wd,Hd),px=id.data,mp=mg.getImageData(0,0,Wd,Hd).data,tp=tg.getImageData(0,0,Wd,Hd).data;
  const T=c2Rgb(o.skin),SC=c2Rgb(o.col),GC=c2Rgb(o.gl);
  // brillo medio de la piel de cada cuadro (para conservar luces y sombras)
  const medPorX=new Float32Array(Wd).fill(150);for(const k in C2.frames){const f=C2.frames[k];for(let x=f.r[0];x<f.r[0]+f.r[2];x++)medPorX[x]=f.L;}
  // brillo medio del short y de los guantes del dibujo
  let sl=0,sn=0,gl=0,gn=0;for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const L=px[i]*.3+px[i+1]*.59+px[i+2]*.11;if(mp[i]>128){sl+=L;sn++;}else if(mp[i+2]>128){gl+=L;gn++;}}
  sl=sn?sl/sn:50;gl=gn?gl/gn:50;
  for(let i=0;i<px.length;i+=4){
   if(!px[i+3])continue;const L=px[i]*.3+px[i+1]*.59+px[i+2]*.11;
   if(mp[i]>128){   // short
    const k=Math.max(.45,Math.min(1.7,1+(L-sl)/70));let r=tp[i],gg=tp[i+1],b=tp[i+2];const tl=r*.3+gg*.59+b*.11;
    if(r>gg+60){const q=r/200;r=SC[0]*q;gg=SC[1]*q;b=SC[2]*q;}
    else if(tl<70){const q=.6+tl/120;r=30*q;gg=30*q;b=34*q;}
    px[i]=Math.min(255,r*k);px[i+1]=Math.min(255,gg*k);px[i+2]=Math.min(255,b*k);
   }else if(mp[i+2]>128){const k=Math.max(.35,Math.min(1.9,1+(L-gl)/55));px[i]=Math.min(255,GC[0]*k);px[i+1]=Math.min(255,GC[1]*k);px[i+2]=Math.min(255,GC[2]*k);}
   else if(mp[i+1]>128){const k=L/medPorX[(i>>2)%Wd];px[i]=Math.min(255,T[0]*k);px[i+1]=Math.min(255,T[1]*k);px[i+2]=Math.min(255,T[2]*k);}
  }
  g.putImageData(id,0,0);
 }catch(e){}
 // pelo y barba: capas teñidas, puestas en el centro del cráneo de cada cuadro
 const capa=(R,col)=>{if(!R)return null;const c=document.createElement('canvas');c.width=R[2];c.height=R[3];const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(c2Img.capas,R[0],R[1],R[2],R[3],0,0,R[2],R[3]);
  if(col){try{const id=x.getImageData(0,0,R[2],R[3]),p=id.data,C=c2Rgb(col),base=[60,38,28];for(let i=0;i<p.length;i+=4)if(p[i+3]){const L=(p[i]*.3+p[i+1]*.59+p[i+2]*.11)/52;for(let j=0;j<3;j++)p[i+j]=Math.min(255,C[j]*L*1.15+12*L);}x.putImageData(id,0,0);}catch(e){}}
  return{c,ox:R[4],oy:R[5]};};
 const hp=o.pel>=0?[capa(C2.pelo[o.pel][0],o.hc),capa(C2.pelo[o.pel][1],o.hc)]:null;
 const hb=o.bar>=0?[capa(C2.barba[o.bar][0],o.hc),capa(C2.barba[o.bar][1],o.hc)]:null;
 g.imageSmoothingEnabled=false;
 for(const k in C2.frames){const f=C2.frames[k],hd=f.hd;if(!hd)continue;const fr=k.startsWith('win')?1:0,s=hd[2]/C2.R;
  for(const L of[hb,hp]){if(!L||!L[fr])continue;const Q=L[fr];g.drawImage(Q.c,Math.round(hd[0]+Q.ox*s),Math.round(hd[1]+Q.oy*s),Math.round(Q.c.width*s),Math.round(Q.c.height*s));}}
 // cuadros por movimiento
 const L=(m,n)=>[...Array(n)].map((_,i)=>C2.frames[m+i]).filter(Boolean).map(f=>f.r);
 const S={img:cv,k:1,nuevo:true,frames:{guard:L('guard',4),walk:L('walk',6),back:L('back',6),jab:L('jab',5),cross:L('cross',5),hook:L('hook',5),hookR:L('hook',5),upper:L('upper',5),
  low:L('low',6),high:L('high',6),knee:L('knee',4),hurt:L('hurt',4),ko:L('ko',6),win:L('win',4),td:L('shoot',5),shoot:L('shoot',5)}};
 c2Cache.set(sig,S);if(c2Cache.size>16)c2Cache.delete(c2Cache.keys().next().value);
 return S;
}
// Miniaturas para elegir peinado, barba y short
function c2Mini(cv,tipo,i){
 const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);if(!c2Ok()||i<0)return;g.imageSmoothingEnabled=false;
 if(tipo==='short'){g.drawImage(c2Img.shortsMini,i*70,0,70,60,0,0,cv.width,cv.height);return;}
 const j=tipo==='barba'?8+i:i,h=c2Img.cabezas.height;const s=Math.min(cv.width/56,cv.height/h);g.drawImage(c2Img.cabezas,j*58,0,56,h,(cv.width-56*s)/2,(cv.height-h*s)/2,56*s,h*s);
}
// Botones para elegir peinado / barba / short nuevos (sirven en Crear peleador y en la Carrera)
const SH_COLS=['#c8202f','#1f5bd8','#1f8a40','#e0b84a','#7b3fe4','#ff8a2a','#2fd8c8','#e8e8e8','#ff4fa0','#16181d'];
function pick2Html(tipo,cur,attr){
 const N=tipo==='pel'?C2.peinados:tipo==='bar'?C2.barbas:C2.shortsN;
 let h='';if(tipo!=='sho')h+=`<button class="hb-n2 txt" ${attr} data-lv="-1" aria-pressed="${cur===-1}">${tipo==='pel'?'Pelado':'Sin barba'}</button>`;
 N.forEach((n,i)=>{h+=`<button class="hb-n2" ${attr} data-lv="${i}" aria-pressed="${cur===i}" title="${n}" aria-label="${n}"><canvas width="${tipo==='sho'?44:40}" height="${tipo==='sho'?38:44}" data-c2="${tipo==='pel'?'pelo':tipo==='bar'?'barba':'short'}" data-ci="${i}"></canvas></button>`;});
 return h;
}
function pick2Draw(root){root.querySelectorAll('canvas[data-c2]').forEach(cv=>c2Mini(cv,cv.dataset.c2,+cv.dataset.ci));}
// para que el piso (dibujo viejo) use un peinado parecido
const PEL_A_GRUPO=['Corto','Clásico','Puntas','Rizado','Largo','Rastas','Rizado','Clásico'];
function pel2Viejo(p){if(p<0||typeof CB==='undefined'||!CB.grupos)return -1;const i=CB.grupos.indexOf(PEL_A_GRUPO[p]);return i<0?0:i;}
// vista previa grande con el sprite nuevo
function prev2(cv,d,t,pose){
 const g=cv.getContext('2d');g.fillStyle='#10141c';g.fillRect(0,0,cv.width,cv.height);const S=sprite2(d);if(!S)return;
 const L=S.frames[pose||'guard']||S.frames.guard,f=L[Math.floor((t||0)*7)%L.length];const[fx,fy,fw,fh,ax]=f;const s=Math.min((cv.height-6)/fh,1.1);
 g.imageSmoothingEnabled=false;g.drawImage(S.img,fx,fy,fw,fh,Math.round(cv.width/2-ax*s+ (fw/2-ax)*0),Math.round(cv.height-fh*s-2),Math.round(fw*s),Math.round(fh*s));
}
