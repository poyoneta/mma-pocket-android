/* ---------------- Peleadores creados con tus dibujos ----------------
   Los peleadores inventados, los generados al azar y los que creás usan el CUERPO BASE
   (tu hoja del peleador pelado, con todas las animaciones) + una CAPA DE PELO (tu carpeta de pelos),
   que se pone sobre la cabeza en cada cuadro siguiendo su posición y su giro.
   Encima se cambia el color de piel, de pelo y del short. Se arma una sola vez por peleador
   y se guardan los últimos 30 para no gastar memoria. */
const CB=CUERPO_BASE;
const cbImg={base:new Image(),mask:new Image(),pelos:new Image(),ropa:new Image(),suelo:new Image(),sueloM:new Image()};
const CB_TOTAL=Object.keys(cbImg).length;let cbListo=0;
for(const k in cbImg)cbImg[k].onload=()=>{if(++cbListo===CB_TOTAL&&typeof onSpriteLoad==='function')onSpriteLoad();};
cbImg.base.src=CB.src;cbImg.mask.src=CB.mascara;cbImg.pelos.src=CB.pelosSrc;cbImg.ropa.src=CB.ropaSrc;cbImg.suelo.src=CB.suelo.src;cbImg.sueloM.src=CB.suelo.mascara;

// Pelo según el estilo elegido en peleadores viejos (si no tienen uno puntual). -1 = pelado
const GRUPO_DE={short:['Clásico','Corto'],buzz:['Corto'],mohawk:['Puntas'],sidecut:['Puntas'],
 long:['Largo'],ponytail:['Largo'],topknot:['Rastas'],curly:['Rizado'],afro:['Rizado'],dreads:['Rastas']};
function hashStr(s){let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
function peinadoDe(d){
 const L=d.look||{};
 if(L.peinado!=null&&(+L.peinado===-1||CB.pelos[L.peinado]))return+L.peinado;
 if(L.hairStyle==='bald')return-1;
 const g=GRUPO_DE[L.hairStyle]||['Clásico','Corto','Puntas','Rizado'];
 const idx=CB.grupos.map((x,i)=>g.includes(x)?i:-1).filter(i=>i>=0);
 return idx.length?idx[hashStr(d.name||d.last||'x')%idx.length]:0;
}
const hexRGB=h=>{h=String(h||'#16181d').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255];};
function esPiel(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return r>g&&g>=b*.9&&mx>84&&(mx-mn)/(mx+1)>.18;}
// Piel: corrimiento suave hacia el tono pedido (mantiene luces y sombras del dibujo)
function recolorPiel(px,i,T,B){
 B=B||CB.piel;
 const r=px[i],g=px[i+1],b=px[i+2];if(!esPiel(r,g,b))return;
 const L=Math.max(r,g,b)/255,w=Math.min(1,Math.max(0,(L-.3)/.35));
 for(let c=0;c<3;c++){const k=px[i+c]/B[c],v=px[i+c]+(T[c]-B[c])*(.55+.35*Math.min(1.4,k));px[i+c]=Math.max(0,Math.min(255,px[i+c]+(v-px[i+c])*w));}
}
// Pelo: se tiñe del color pedido según lo claro u oscuro de cada pixel
function recolorPelo(px,i,C){
 const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255,k=.35+1.35*lum;
 for(let c=0;c<3;c++)px[i+c]=Math.min(255,C[c]*k+lum*30);
}
// Capa de pelo lista para pegar (con su color)
function capaPelo(ph,colorPelo){
 const P=CB.pelos[ph];if(!P)return null;
 const hc=document.createElement('canvas');hc.width=P[2];hc.height=P[3];const hg=hc.getContext('2d');
 hg.drawImage(cbImg.pelos,P[0],P[1],P[2],P[3],0,0,P[2],P[3]);
 if(colorPelo){try{const C=hexRGB(colorPelo),d=hg.getImageData(0,0,P[2],P[3]);for(let i=0;i<d.data.length;i+=4)if(d.data[i+3])recolorPelo(d.data,i,C);hg.putImageData(d,0,0);}catch(e){}}
 return{c:hc,dx:P[4],dy:P[5]};
}
// Short y guantes: se eligen de tu hoja de ropa (sin marca). Si un peleador viejo solo tiene un color, se usa ese.
function shortDe(L){const i=L.short;return i!=null&&CB.shorts[i]?+i:null;}
function colorShort(L){const i=shortDe(L);return i!=null?CB.shorts[i][4]:(L.shorts||'#16181d');}
function guanteDe(L){const i=L.guante;return i!=null&&CB.guantes[i]?+i:0;}
// textura del short elegido estirada sobre el short del cuadro (solo parados; acostados va el color liso)
const TEX_NO=new Set(['ko','gtop','gpun','gsub','gbot','shoot','crouch']);
const cbCache=new Map();
function cuerpoDe(d){
 if(cbListo<CB_TOTAL)return null;
 const L=d.look||{},ph=peinadoDe(d),T=hexRGB(L.skin||'#c58a62'),si=shortDe(L),SH=hexRGB(colorShort(L)),gi=guanteDe(L),GC=hexRGB(CB.guantes[gi][4]),HC=L.pelo||null;
 const FR=CB.frames,PB=CB.piel;
 const sig=ph+'|'+T.join()+'|'+(si!=null?'s'+si:SH.join())+'|'+gi+'|'+HC;
 if(cbCache.has(sig)){const S=cbCache.get(sig);cbCache.delete(sig);cbCache.set(sig,S);return S;}
 const PX=16,PT=22;
 const uniq=new Map();for(const mv in FR)FR[mv].forEach((f,i)=>{const k=f.slice(0,4).join();if(!uniq.has(k))uniq.set(k,{f,mv,i});});
 const maxH=Math.max(...[...uniq.values()].map(u=>u.f[3])),H=maxH+PT;let W=0;for(const u of uniq.values()){u.cx=W;W+=u.f[2]+PX*2+1;}
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const mk=document.createElement('canvas');mk.width=W;mk.height=H;const m=mk.getContext('2d');
 for(const u of uniq.values()){const[x,y,w,h]=u.f;g.drawImage(cbImg.base,x,y,w,h,u.cx+PX,H-h,w,h);m.drawImage(cbImg.mask,x,y,w,h,u.cx+PX,H-h,w,h);}
 let id=null;try{id=g.getImageData(0,0,W,H);}catch(e){}
 if(id){
  const px=id.data,mp=m.getImageData(0,0,W,H).data;
  // textura del short: para cada cuadro parado, la imagen del short estirada a la caja del short
  const tex=new Uint8ClampedArray(px.length);let hayTex=false;
  if(si!=null){
   const R=CB.shorts[si],tc=document.createElement('canvas');tc.width=W;tc.height=H;const tg=tc.getContext('2d');tg.imageSmoothingEnabled=true;
   for(const u of uniq.values()){
    if(TEX_NO.has(u.mv))continue;
    let x0=1e9,y0=1e9,x1=-1,y1=-1;const ux=u.cx+PX,uy=H-u.f[3];
    for(let yy=uy;yy<H;yy++)for(let xx=ux;xx<ux+u.f[2];xx++)if(mp[(yy*W+xx)*4]>128){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy;}
    if(x1<0)continue;
    tg.drawImage(cbImg.ropa,R[0],R[1],R[2],R[3],x0-1,y0-1,x1-x0+3,y1-y0+3);
   }
   try{tex.set(tg.getImageData(0,0,W,H).data);hayTex=true;}catch(e){}
  }
  // brillo medio del short y de los guantes del dibujo (para conservar luces y sombras)
  let sl=0,sn=0,gl=0,gn=0;
  for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255;if(mp[i]>128){sl+=lum;sn++;}else if(mp[i+2]>128){gl+=lum;gn++;}}
  sl=sn?sl/sn:.2;gl=gn?gl/gn:.15;
  for(let i=0;i<px.length;i+=4){
   if(!px[i+3])continue;
   const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255;
   if(mp[i]>128){
    const k=Math.max(.35,Math.min(1.7,1+(lum-sl)*3.2));
    const C=hayTex&&tex[i+3]>0?[tex[i],tex[i+1],tex[i+2]]:SH;
    for(let c=0;c<3;c++)px[i+c]=Math.min(255,C[c]*k);
   }
   else if(mp[i+2]>128){const k=Math.max(.3,Math.min(1.6,1+(lum-gl)*3.5));for(let c=0;c<3;c++)px[i+c]=Math.min(255,GC[c]*k);}
   else recolorPiel(px,i,T,PB);
  }
  g.putImageData(id,0,0);
 }
 const hp=ph>=0?capaPelo(ph,HC):null;
 if(hp)for(const u of uniq.values()){
  const t=CB.cabeza[u.mv]&&CB.cabeza[u.mv][u.i];if(!t)continue;
  const[hx,hy,ang]=t;
  g.save();g.translate(Math.round(u.cx+PX+hx),Math.round(H-u.f[3]+hy));if(ang)g.rotate(-ang*Math.PI/180);
  g.drawImage(hp.c,Math.round(hp.dx),Math.round(hp.dy));g.restore();
 }
 const frames={};
 for(const mv in FR)frames[mv]=FR[mv].map(f=>{const u=uniq.get(f.slice(0,4).join());return[u.cx,0,f[2]+PX*2,H,f[4]+PX];});
 const S={img:cv,frames,plantilla:true,k:1};
 cbCache.set(sig,S);if(cbCache.size>30)cbCache.delete(cbCache.keys().next().value);
 return S;
}
/* Piso con tu hoja de dos peleadores: cada pixel sabe de quién es (el de arriba o el de abajo) y qué es
   (piel, short, guantes o pelo), así cada uno sale con sus colores. Se arma una vez por pareja. */
const pelNatural=new Map();
function colorPeloNatural(ph){
 if(pelNatural.has(ph))return pelNatural.get(ph);let C=[30,24,20];
 try{const P=CB.pelos[ph],c=document.createElement('canvas');c.width=P[2];c.height=P[3];const g=c.getContext('2d');g.drawImage(cbImg.pelos,P[0],P[1],P[2],P[3],0,0,P[2],P[3]);
  const d=g.getImageData(0,0,P[2],P[3]).data;let r=0,gg=0,b=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]){r+=d[i];gg+=d[i+1];b+=d[i+2];n++;}if(n)C=[r/n,gg/n,b/n].map(v=>Math.round(v*1.15));}catch(e){}
 pelNatural.set(ph,C);return C;
}
const sueloCache=new Map();
function sueloDe(dTop,dBot){
 if(cbListo<CB_TOTAL||!CB.suelo)return null;
 const quien=d=>{const L=d.look||{},ph=peinadoDe(d);return{T:hexRGB(L.skin||'#c58a62'),SH:hexRGB(colorShort(L)),GC:hexRGB(CB.guantes[guanteDe(L)][4]),ph,HC:ph<0?null:(L.pelo?hexRGB(L.pelo):colorPeloNatural(ph))};};
 const A=quien(dTop),B=quien(dBot),sig=JSON.stringify([A,B]);
 if(sueloCache.has(sig))return sueloCache.get(sig);
 const SU=CB.suelo,iw=cbImg.suelo.width,ih=cbImg.suelo.height;
 const cv=document.createElement('canvas');cv.width=iw;cv.height=ih;const g=cv.getContext('2d');g.drawImage(cbImg.suelo,0,0);
 try{
  const id=g.getImageData(0,0,iw,ih),px=id.data,mk=document.createElement('canvas');mk.width=iw;mk.height=ih;const mg=mk.getContext('2d');mg.drawImage(cbImg.sueloM,0,0);
  const mp=mg.getImageData(0,0,iw,ih).data;
  // brillo medio de cada short y guantes (por persona y por cuadro no hace falta: alcanza por persona)
  const acc={};for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const w=mp[i]>190?1:mp[i]>60?2:0,pt=Math.round(mp[i+1]/64);if(!w||(pt!==1&&pt!==2))continue;
   const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255,k=w+'_'+pt+'_'+(lum>.42?1:0);acc[k]=acc[k]||[0,0];acc[k][0]+=lum;acc[k][1]++;}
  const media=k=>acc[k]?acc[k][0]/acc[k][1]:.2;
  for(let i=0;i<px.length;i+=4){
   if(!px[i+3])continue;const w=mp[i]>190?1:mp[i]>60?2:0;if(!w)continue;const P=w===1?A:B,pt=Math.round(mp[i+1]/64);
   const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255;
   if(pt===0){recolorPiel(px,i,P.T,SU.piel);continue;}
   if(lum<.11)continue;   // contorno negro: queda
   if(pt===1||pt===2){const C=pt===1?P.SH:P.GC,m=media(w+'_'+pt+'_'+(lum>.42?1:0)),k=Math.max(.35,Math.min(1.7,1+(lum-m)*(lum>.42?1.6:3.2)));for(let c=0;c<3;c++)px[i+c]=Math.min(255,C[c]*k);}
   else if(pt===3){if(P.HC)recolorPelo(px,i,P.HC);else{const k=.55+1.3*lum;for(let c=0;c<3;c++)px[i+c]=Math.min(255,P.T[c]*k);}}
  }
  g.putImageData(id,0,0);
 }catch(e){}
 const S={img:cv,frames:SU.frames};sueloCache.set(sig,S);if(sueloCache.size>8)sueloCache.delete(sueloCache.keys().next().value);
 return S;
}
// Miniatura de un short o de un guante (para el creador y el modo carrera)
function dibujarRopa(cv,tipo,i){
 const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);if(cbListo<CB_TOTAL)return;
 const R=(tipo==='guante'?CB.guantes:CB.shorts)[i];if(!R)return;g.imageSmoothingEnabled=false;
 const s=Math.min(cv.width/R[2],cv.height/R[3]);const w=Math.round(R[2]*s),h=Math.round(R[3]*s);
 g.drawImage(cbImg.ropa,R[0],R[1],R[2],R[3],Math.round((cv.width-w)/2),Math.round((cv.height-h)/2),w,h);
}
// Miniatura de cabeza con pelo (para el creador)
function dibujarCabeza(cv,ph,skin,colorPelo){
 const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);if(cbListo<CB_TOTAL)return;
 // recorte de 26x26 alrededor de la cabeza del cuadro de guardia, agrandado al tamaño del botón
 const f=CB.frames.jab[1],t=CB.cabeza.jab[1],R=26,sx=Math.round(f[0]+t[0]-R/2),sy=Math.round(f[1]+t[1]-15);
 const tc=document.createElement('canvas');tc.width=R;tc.height=R;const tg=tc.getContext('2d');
 tg.drawImage(cbImg.base,sx,sy,R,R,0,0,R,R);
 try{const d=tg.getImageData(0,0,R,R),m=document.createElement('canvas');m.width=R;m.height=R;const mg=m.getContext('2d');mg.drawImage(cbImg.mask,sx,sy,R,R,0,0,R,R);
  const mp=mg.getImageData(0,0,R,R).data,T=hexRGB(skin||'#c58a62');
  for(let i=0;i<d.data.length;i+=4)if(d.data[i+3]&&mp[i+2]<128&&mp[i]<128)recolorPiel(d.data,i,T,CB.piel);tg.putImageData(d,0,0);}catch(e){}
 const hp=ph>=0?capaPelo(ph,colorPelo):null;
 if(hp)tg.drawImage(hp.c,Math.round(f[0]+t[0]-sx+hp.dx),Math.round(f[1]+t[1]-sy+hp.dy));
 g.imageSmoothingEnabled=false;g.drawImage(tc,0,0,R,R,0,0,cv.width,cv.height);
}

