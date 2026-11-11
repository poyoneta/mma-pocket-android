/* ---------------- Peleadores creados con tus dibujos ----------------
   Los peleadores inventados, los generados al azar y los que creás usan el CUERPO BASE
   (tu hoja del peleador pelado, con todas las animaciones) + una CAPA DE PELO (tu carpeta de pelos),
   que se pone sobre la cabeza en cada cuadro siguiendo su posición y su giro.
   Encima se cambia el color de piel, de pelo y del short. Se arma una sola vez por peleador
   y se guardan los últimos 30 para no gastar memoria. */
const CB=CUERPO_BASE;
const cbImg={base:new Image(),mask:new Image(),pelos:new Image()};let cbListo=0;
for(const k in cbImg)cbImg[k].onload=()=>{if(++cbListo===3&&typeof onSpriteLoad==='function')onSpriteLoad();};
cbImg.base.src=CB.src;cbImg.mask.src=CB.mascara;cbImg.pelos.src=CB.pelosSrc;

// Pelo según el estilo elegido en peleadores viejos (si no tienen uno puntual). -1 = pelado
const GRUPO_DE={short:['Clásico','Corto'],buzz:['Corto'],mohawk:['Corto moderno'],sidecut:['Corto moderno'],
 long:['Largo'],ponytail:['Largo'],topknot:['Largo'],curly:['Rizado','Desordenado'],afro:['Rizado','Desordenado']};
function hashStr(s){let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
function peinadoDe(d){
 const L=d.look||{};
 if(L.peinado!=null&&(+L.peinado===-1||CB.pelos[L.peinado]))return+L.peinado;
 if(L.hairStyle==='bald')return-1;
 const g=GRUPO_DE[L.hairStyle]||['Clásico','Corto','Corto moderno','Desordenado'];
 const idx=CB.grupos.map((x,i)=>g.includes(x)?i:-1).filter(i=>i>=0);
 return idx.length?idx[hashStr(d.name||d.last||'x')%idx.length]:0;
}
const hexRGB=h=>{h=String(h||'#16181d').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255];};
function esPiel(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return r>g&&g>=b*.9&&mx>84&&(mx-mn)/(mx+1)>.18;}
// Piel: corrimiento suave hacia el tono pedido (mantiene luces y sombras del dibujo)
function recolorPiel(px,i,T){
 const r=px[i],g=px[i+1],b=px[i+2];if(!esPiel(r,g,b))return;
 const L=Math.max(r,g,b)/255,w=Math.min(1,Math.max(0,(L-.3)/.35));
 for(let c=0;c<3;c++){const k=px[i+c]/CB.piel[c],v=px[i+c]+(T[c]-CB.piel[c])*(.55+.35*Math.min(1.4,k));px[i+c]=Math.max(0,Math.min(255,px[i+c]+(v-px[i+c])*w));}
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
const cbCache=new Map();
function cuerpoDe(d){
 if(cbListo<3)return null;
 const L=d.look||{},ph=peinadoDe(d),T=hexRGB(L.skin||'#c58a62'),SH=hexRGB(L.shorts||'#16181d'),HC=L.pelo||null;
 const TOP=L.top?hexRGB(L.top):null;
 const sig=ph+'|'+T.join()+'|'+SH.join()+'|'+HC+'|'+(TOP?TOP.join():'');
 if(cbCache.has(sig)){const S=cbCache.get(sig);cbCache.delete(sig);cbCache.set(sig,S);return S;}
 const PX=16,PT=22;
 // cuadros únicos del cuerpo base
 const uniq=new Map();for(const mv in CB.frames)CB.frames[mv].forEach((f,i)=>{const k=f.slice(0,4).join();if(!uniq.has(k))uniq.set(k,{f,mv,i});});
 const maxH=Math.max(...[...uniq.values()].map(u=>u.f[3])),H=maxH+PT;let W=0;for(const u of uniq.values()){u.cx=W;W+=u.f[2]+PX*2+1;}
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const mk=document.createElement('canvas');mk.width=W;mk.height=H;const m=mk.getContext('2d');
 for(const u of uniq.values()){const[x,y,w,h]=u.f;g.drawImage(cbImg.base,x,y,w,h,u.cx+PX,H-h,w,h);m.drawImage(cbImg.mask,x,y,w,h,u.cx+PX,H-h,w,h);}
 // short y piel (abriendo el index.html con doble clic el navegador no deja leer pixeles: ahí quedan los colores del dibujo)
 let id=null;try{id=g.getImageData(0,0,W,H);}catch(e){}
 if(id){
  const px=id.data,mp=m.getImageData(0,0,W,H).data;
  // peleadoras: se borra la barba del cuerpo base (pelo oscuro en la parte baja de la cara) pintándola de piel
  if(TOP)for(const u of uniq.values()){
   const t=CB.cabeza[u.mv]&&CB.cabeza[u.mv][u.i];if(!t)continue;
   const cx=u.cx+PX+t[0],cy=H-u.f[3]+t[1],a=(t[2]||0)*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
   for(let pass=0;pass<3;pass++)for(let yy=Math.floor(cy-16);yy<cy+16;yy++)for(let xx=Math.floor(cx-16);xx<cx+16;xx++){
    if(xx<1||yy<1||xx>=W-1||yy>=H-1)continue;
    const dx=xx-cx,dy=yy-cy,lx=dx*co-dy*si,ly=dx*si+dy*co;
    if(ly<-1||ly>15||Math.abs(lx)>13)continue;
    const i=(yy*W+xx)*4;if(!px[i+3]||esPiel(px[i],px[i+1],px[i+2]))continue;
    const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255;if(lum<.1||lum>.66)continue;   // contorno negro y brillos quedan
    // vecino de piel más cercano (para no inventar el tono)
    let best=null;for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,-2],[0,2]]){const j=((yy+oy)*W+xx+ox)*4;if(j>=0&&j<px.length&&px[j+3]&&esPiel(px[j],px[j+1],px[j+2])){best=j;break;}}
    if(best==null)continue;px[i]=px[best];px[i+1]=px[best+1];px[i+2]=px[best+2];
   }
  }
  // top deportivo (peleadoras): pinta la piel del pecho, debajo de la cabeza, siguiendo su posición y giro
  if(TOP)for(const u of uniq.values()){
   const t=CB.cabeza[u.mv]&&CB.cabeza[u.mv][u.i];if(!t)continue;
   const cx=u.cx+PX+t[0],cy=H-u.f[3]+t[1],a=(t[2]||0)*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
   for(let yy=Math.floor(cy-30);yy<cy+30;yy++)for(let xx=Math.floor(cx-30);xx<cx+30;xx++){
    if(xx<u.cx||xx>=u.cx+u.f[2]+PX*2||yy<0||yy>=H)continue;
    const dx=xx-cx,dy=yy-cy,lx=dx*co-dy*si,ly=dx*si+dy*co;
    if(ly<17||ly>27||Math.abs(lx)>12)continue;
    const i=(yy*W+xx)*4;if(!px[i+3]||mp[i]>128||!esPiel(px[i],px[i+1],px[i+2]))continue;
    const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255,k=.45+.8*lum;
    for(let c=0;c<3;c++)px[i+c]=Math.min(255,TOP[c]*k+lum*18);px[i+3]=256-1;mp[i+1]=255;
   }
  }
  for(let i=0;i<px.length;i+=4){
   if(!px[i+3])continue;
   if(mp[i]>128){const lum=(px[i]*.3+px[i+1]*.59+px[i+2]*.11)/255,k=.62+.95*lum;for(let c=0;c<3;c++)px[i+c]=Math.min(255,SH[c]*k+lum*22);}
   else if(mp[i+1]!==255)recolorPiel(px,i,T);
  }
  g.putImageData(id,0,0);
 }
 // pelo encima de la cabeza en cada cuadro (sigue la posición y el giro)
 const hp=ph>=0?capaPelo(ph,HC):null;
 if(hp)for(const u of uniq.values()){
  const t=CB.cabeza[u.mv]&&CB.cabeza[u.mv][u.i];if(!t)continue;
  const[hx,hy,ang]=t;
  g.save();g.translate(Math.round(u.cx+PX+hx),Math.round(H-u.f[3]+hy));if(ang)g.rotate(-ang*Math.PI/180);
  g.drawImage(hp.c,Math.round(hp.dx),Math.round(hp.dy));g.restore();
 }
 const frames={};
 for(const mv in CB.frames)frames[mv]=CB.frames[mv].map(f=>{const u=uniq.get(f.slice(0,4).join());return[u.cx,0,f[2]+PX*2,H,f[4]+PX];});
 const S={img:cv,frames,plantilla:true,k:1};
 cbCache.set(sig,S);if(cbCache.size>30)cbCache.delete(cbCache.keys().next().value);
 return S;
}
// Miniatura de cabeza con pelo (para el creador)
function dibujarCabeza(cv,ph,skin,colorPelo){
 const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);if(cbListo<3)return;
 const f=CB.frames.guard[1],t=CB.cabeza.guard[1],ox=cv.width/2-t[0],oy=cv.height/2+4-t[1];
 g.drawImage(cbImg.base,f[0],f[1],f[2],Math.min(f[3],34),ox,oy,f[2],Math.min(f[3],34));
 try{const d=g.getImageData(0,0,cv.width,cv.height),T=hexRGB(skin||'#c58a62');for(let i=0;i<d.data.length;i+=4)if(d.data[i+3])recolorPiel(d.data,i,T);g.putImageData(d,0,0);}catch(e){}
 const hp=ph>=0?capaPelo(ph,colorPelo):null;if(hp)g.drawImage(hp.c,Math.round(ox+t[0]+hp.dx),Math.round(oy+t[1]+hp.dy));
}
