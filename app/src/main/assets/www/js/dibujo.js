// Dibujo: pixel art, peleadores, piso y fondo
/* ---------------- Dibujo ---------------- */
const cv=$('#cv'),ctx=cv.getContext('2d');let c=ctx;
function R(x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function limb(x1,y1,x2,y2,t1,t2,col){const dx=x2-x1,dy=y2-y1,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));c.fillStyle=col;for(let i=0;i<=n;i++){const k=i/n,t=Math.round(t1+(t2-t1)*k);c.fillRect(Math.round(x1+dx*k-t/2),Math.round(y1+dy*k-t/2),t,t);}}
function glove(x,y,gs,sk,OL){R(x-gs/2-1,y-gs/2-1,gs+2,gs+2,OL);R(x-gs/2,y-gs/2,gs,gs,'#1c1e24');R(x-gs/2+1,y-gs/2+1,gs-2,1,'#4b505c');R(x-gs/2,y+gs/2-2,gs,2,sk);}
// Textos: en el canvas principal se muestran como HTML encima (nítidos); en otros canvas se dibujan
let LBL=[];
function tDraw(s,x,y,col,size,al){
 size=size||8;
 if(c===ctx){LBL.push({s,x,y,col,size,al:al||'center',a:ctx.globalAlpha});return;}
 c.font='800 '+Math.round(size*1.25)+'px "Barlow Condensed", sans-serif';c.textAlign=al||'center';c.textBaseline='top';c.fillStyle='#07080c';for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1]])c.fillText(s,x+ox,y+oy);c.fillStyle=col;c.fillText(s,x,y);
}
function syncLabels(){
 const box=$('#ftl');if(!box)return;
 while(box.children.length<LBL.length)box.appendChild(document.createElement('b'));
 [...box.children].forEach((el,i)=>{const L=LBL[i];if(!L){el.hidden=true;return;}el.hidden=false;
  if(el.textContent!==L.s)el.textContent=L.s;el.className=L.al==='left'?'l':'';
  el.style.left=(L.x/W*100)+'%';el.style.top=(L.y/H*100)+'%';el.style.color=L.col;el.style.opacity=L.a;
  el.style.fontSize=(L.size*(L.al==='left'?.62:.78)/W*100)+'cqw';el.style.transform=L.al==='left'?'none':'translateX(-50%)';});
 LBL=[];
}

function hairFront(L,hx,hy){const h=L.hair,hL=shade(h,.28);
 switch(L.hairStyle){
  case'short':R(hx-1,hy-2,14,4,h);R(hx-1,hy+2,2,3,h);R(hx+11,hy+2,2,3,h);R(hx+2,hy-1,4,1,hL);break;
  case'buzz':R(hx,hy-1,12,3,h);R(hx,hy+2,1,2,h);R(hx+11,hy+2,1,2,h);break;
  case'bald':R(hx+2,hy+1,4,2,'rgba(255,255,255,.28)');break;
  case'mohawk':R(hx+4,hy-5,4,7,h);R(hx+5,hy-4,1,3,hL);break;
  case'long':R(hx-1,hy-2,14,4,h);R(hx-2,hy+1,3,13,h);R(hx+11,hy+1,3,13,h);R(hx+2,hy-1,4,1,hL);break;
  case'curly':R(hx-2,hy-3,16,5,h);R(hx-2,hy+2,3,4,h);R(hx+11,hy+2,3,4,h);for(let i=0;i<5;i++)R(hx-1+i*3,hy-3,1,1,hL);break;
 }}

// Rival de frente. fy = línea de los pies.
function drawFront(f,cx,fy,pose,o){
 o=o||{};
 const L=f.d.look,sk=L.skin,skD=shade(sk,-.25),skL=shade(sk,.18),hair=L.hair;
 const OL=o.flash?(o.flashCol||'#ffd23f'):(o.hit?'#ffffff':'#07080c');
 const crouch=(o.crouch||0)+(o.bob||0),lean=o.lean||0;
 const top=fy-76+crouch,ty=top+16,tcx=cx+lean,hipY=ty+24,sB=hipY+11;
 const hx=tcx-6+(o.headOff||0),hy=top,ks=-1;
 for(const s of[-1,1]){
  const Hx=cx+s*6+lean*.5,Hy=sB-3;
  let Fx=cx+s*9,Fy=fy-2,Kx=cx+s*(8+crouch*.4),Ky=(Hy+Fy)/2,big=0;
  if(s===ks&&o.leg){
   if(o.leg==='wind'){Kx=cx+s*13;Ky=hipY+4;Fx=cx+s*15;Fy=hipY+15;}
   else if(o.leg==='low'){Kx=cx+s*13;Ky=hipY+8;Fx=cx+s*1;Fy=fy+10;big=1;}
   else if(o.leg==='high'){Kx=cx+s*16;Ky=hipY-6;Fx=cx-s*3;Fy=top+24;big=1;}
  }
  limb(Hx,Hy,Kx,Ky,11,10,OL);limb(Kx,Ky,Fx,Fy,10,9,OL);
  limb(Hx,Hy,Kx,Ky,9,8,sk);limb(Kx,Ky,Fx,Fy,8,7,s>0?skD:sk);
  const fw=big?13:10,fh=big?7:4;R(Fx-fw/2-1,Fy-1,fw+2,fh+2,OL);R(Fx-fw/2,Fy,fw,fh,sk);
 }
 const sD=shade(L.shorts,-.3);
 R(tcx-13,hipY-1,26,sB-hipY+2,OL);R(tcx-12,hipY,24,sB-hipY,L.shorts);R(tcx-12,hipY,24,2,sD);
 R(tcx-12,hipY+2,2,sB-hipY-2,L.trim);R(tcx+10,hipY+2,2,sB-hipY-2,L.trim);R(tcx-1,hipY+6,2,sB-hipY-6,sD);
 R(tcx-15,ty-1,30,1,OL);
 for(let i=0;i<24;i++){const w=28-Math.round(i*8/23);R(tcx-w/2-1,ty+i,w+2,1,OL);}
 for(let i=0;i<24;i++){const w=28-Math.round(i*8/23);R(tcx-w/2,ty+i,w,1,sk);R(tcx+w/2-3,ty+i,3,1,skD);R(tcx-w/2,ty+i,1,1,skL);}
 R(tcx-10,ty+9,8,1,skD);R(tcx+2,ty+9,8,1,skD);R(tcx,ty+11,1,12,skD);R(tcx-4,ty+15,9,1,skD);R(tcx-4,ty+19,9,1,skD);
 R(tcx-4,top+12,8,5,OL);R(tcx-3,top+12,6,5,skD);
 const hs=HAND_R[o.act]||0,gl=[];
 for(const s of[-1,1]){
  const Sx=tcx+s*13,Sy=ty+3;let E,Gp,gs=7;
  if(pose==='block'){E=[tcx+s*13,ty+10];Gp=[tcx+s*4,top+5];gs=8;}
  else if(pose==='hurt'){E=[tcx+s*18,ty+12];Gp=[tcx+s*14,ty+3];}
  else if(pose==='tdwind'){E=[tcx+s*15,ty+15];Gp=[tcx+s*8,ty+27];}
  else if(pose==='wind'&&s===hs){E=[tcx+s*21,ty+12];Gp=[tcx+s*17,ty+1];}
  else if(pose==='punch'&&s===hs){
   if(o.act==='hook'){E=[tcx+s*19,ty+5];Gp=[tcx-s*3,ty+15];gs=11;}
   else if(o.act==='upper'){E=[tcx+s*8,ty+20];Gp=[tcx+s*2,ty+6];gs=11;}
   else{E=[tcx+s*9,ty+12];Gp=[tcx+s*2,ty+23];gs=12;}
  }
  else{E=[tcx+s*17,ty+13];Gp=[tcx+s*7,top+12];}
  limb(Sx,Sy,E[0],E[1],9,8,OL);limb(E[0],E[1],Gp[0],Gp[1],8,7,OL);
  limb(Sx,Sy,E[0],E[1],7,6,s>0?skD:sk);limb(E[0],E[1],Gp[0],Gp[1],6,5,s>0?skD:sk);
  gl.push([Gp[0],Gp[1],gs]);
 }
 R(hx-1,hy-1,14,15,OL);R(hx,hy,12,13,sk);R(hx+10,hy+2,2,10,skD);
 R(hx-2,hy+5,2,3,OL);R(hx+12,hy+5,2,3,OL);R(hx-1,hy+5,1,3,sk);R(hx+12,hy+5,1,3,skD);
 hairFront(L,hx,hy);
 const ey=hy+6,dk='#111';
 if(o.ko){for(const ex of[hx+2,hx+7]){R(ex,ey-1,1,1,dk);R(ex+2,ey-1,1,1,dk);R(ex+1,ey,1,1,dk);R(ex,ey+1,1,1,dk);R(ex+2,ey+1,1,1,dk);}}
 else if(o.hurt){R(hx+2,ey+1,3,1,dk);R(hx+7,ey+1,3,1,dk);}
 else{R(hx+2,ey,3,2,'#f2f2f2');R(hx+3,ey,1,2,dk);R(hx+7,ey,3,2,'#f2f2f2');R(hx+8,ey,1,2,dk);}
 R(hx+2,ey-2,3,1,shade(hair,-.1));R(hx+7,ey-2,3,1,shade(hair,-.1));
 R(hx+5,hy+8,2,2,skD);
 if(L.beard){R(hx,hy+8,1,4,hair);R(hx+11,hy+8,1,4,hair);R(hx+1,hy+10,10,3,hair);}
 R(hx+4,hy+10,4,1,o.hurt?'#f2f2f2':'#5a1f1f');
 if(f.hp<55)R(hx+9,hy+4,2,2,'#a63c32');if(f.hp<30)R(hx+2,hy+3,2,1,'#a63c32');
 for(const[gx,gy,gs]of gl)glove(gx,gy,gs,sk,OL);
}


// Busca la hoja de un peleador y la carga la primera vez que se usa
function spriteOf(d){
 if(!d.sprite)return typeof cuerpoDe==='function'?cuerpoDe(d):null;   // inventados / creados: cuerpo base + peinado
 const key=d.sprite===1?'zanella':d.sprite,S=SPRITES[key];if(!S)return null;
 if(S.plantilla&&!S.frames)S.frames=framesDePlantilla();
 if(!S.img){S.img=new Image();S.img.onload=()=>{if(typeof onSpriteLoad==='function')onSpriteLoad();};S.img.src=S.src;}
 return S;
}
// Dibuja un cuadro de la hoja del peleador (al doble de tamaño)
function spriteFC(f,o){
 const S=spriteOf(f.d),F=S.frames,t=G?G.t:performance.now()/1000;
 let key=o.ko?(F.ko?'ko':'hurt'):o.pose;
 let list=F[key],idx=0,wind=false;
 if((key==='pwind'||key==='kwind')&&S.plantilla&&F[o.act]){list=F[o.act];wind=true;}   // preparación: primer cuadro del golpe
 else if(!list){key='guard';list=F.guard;}
 const vaiven=n=>n<3?[...Array(n).keys()]:[...Array(n).keys(),...Array.from({length:n-2},(_,i)=>n-2-i)];   // 0,1,2,3,2,1
 const golpe=S.plantilla&&list&&list.length>1&&!['guard','walk','win','ko','raise','block','check','crouch','hurt'].includes(key);
 const hi=list&&list.length>=4?2:1;   // cuadro en el que el golpe pega
 if(wind)idx=Math.min(hi-1,Math.floor((o.prog||0)*hi));
 else if(golpe&&o.ph==='rec'){
  // pega, se sostiene un instante y vuelve pasando por los cuadros de vuelta
  const p=o.prog||0,ret=list.length-hi-1;
  if(p<.38)idx=hi;
  else{const q=(p-.38)/.62;if(ret>0&&q<.72)idx=hi+1+Math.min(ret-1,Math.floor(q/.72*ret));else{list=F.guard;idx=0;}}
 }
 else if(o.walking&&key==='guard'){list=F.walk||F.guard;const sq=vaiven(list.length);idx=sq[Math.floor(o.walk/1.1)%sq.length];}
 else if(key==='guard'){const sq=vaiven(list.length);idx=sq[Math.floor((t+(o.off||0))*7)%sq.length];}
 else if(key==='win'||key==='ko')idx=Math.min(list.length-1,Math.floor(t*2)%list.length);
 else if(golpe)idx=hi;
 const[sx,sy,w,h,ax]=list[idx];
 fcx.clearRect(0,0,SPW,SPH);fcx.imageSmoothingEnabled=false;
 if(S.img instanceof HTMLImageElement&&(!S.img.complete||!S.img.naturalWidth))return;
 const k=S.k||2;   // k:1 = hoja en alta resolución, se dibuja tal cual; si no, al doble
 const dh=key==='crouch'&&!S.plantilla?Math.round(h*1.6):h*k;
 fcx.drawImage(S.img,sx,sy,w,h,SOX-ax*k,SOY-dh,w*k,dh);
}
// Peleador de costado, sprite detallado (mirando a la derecha; se espeja para el otro lado)
const SPW=180,SPH=150,SOX=82,SOY=144;
const fc=document.createElement('canvas');fc.width=SPW;fc.height=SPH;const fcx=fc.getContext('2d');
const oc=document.createElement('canvas');oc.width=SPW;oc.height=SPH;const ocx=oc.getContext('2d');
function disc(x,y,r,col){c.fillStyle=col;for(let v=-r;v<=r;v++){const w=Math.round(Math.sqrt(Math.max(0,r*r-v*v))+.3);c.fillRect(Math.round(x-w),Math.round(y+v),w*2,1);}}
function seg(a,b,t1,t2,base,dark,light){
 limb(a[0],a[1],b[0],b[1],t1,t2,dark);
 limb(a[0],a[1]-1,b[0],b[1]-1,Math.max(1,t1-2),Math.max(1,t2-2),base);
 if(light)limb(a[0],a[1]-Math.floor(t1/2)+1,b[0],b[1]-Math.floor(t2/2)+1,1,1,light);
}
const lerp=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
function drawSide(f,gy,o){
 const L=f.d.look,sk=L.skin,skD=shade(sk,-.22),skDD=shade(sk,-.42),skL=shade(sk,.2),h=L.hair,hD=shade(h,-.3),hL=shade(h,.3);
 const sh=L.shorts,sD=shade(sh,-.32),sL=shade(sh,.18),tape=L.tape||'#d8d9dc',tapeD=shade(L.tape||'#d8d9dc',-.3);
 const P=o.pose;let c0=0,lean=0;
 if(P==='crouch')c0=15;if(P==='shoot'){c0=18;lean=10;}if(P==='hurt')lean=-5;if(P==='high')lean=-6;if(P==='cross'||P==='hookR')lean=4;if(P==='pwind'||P==='kwind')lean=-3;
 lean+=(o.lean||0)+(o.wob||0);
 const hipY=gy-38+c0,shY=gy-64+c0+(P==='guard'&&o.bob>0?1:0),sx=1+lean;
 const wp=o.walking?Math.round(Math.sin(o.walk)*6):0;
 let fF=[13+wp,gy],fB=[-13-wp,gy],kF=[9+c0*.4+wp*.5,(hipY+gy)/2-1],kB=[-5-wp*.5-(c0?3:0),(hipY+gy)/2];
 if(P==='kwind'){kB=[9,hipY+4];fB=[-5,hipY+17];}
 else if(P==='low'){kB=[16,gy-20];fB=[36,gy-9];}
 else if(P==='high'){kB=[18,shY+8];fB=[39,shY-8];}
 const leg=(H,K,F,back)=>{
  const b=back?skD:sk,d=back?skDD:skD,l=back?null:skL;
  if(!back){limb(H[0],H[1],K[0],K[1],13,11,skDD);limb(K[0],K[1],F[0],F[1],10,8,skDD);}
  seg(H,K,11,9,b,d,l);
  const cf=lerp(K,F,.32);disc(cf[0]-2,cf[1],3,d);disc(cf[0]-1,cf[1]-1,2,b);
  seg(K,F,9,6,b,d,null);
  disc(K[0]+1,K[1]-1,1,back?b:skL);
  const ta=lerp(K,F,.8);R(ta[0]-4,ta[1]-2,8,5,back?tapeD:tape);R(ta[0]-4,ta[1]+1,8,1,tapeD);
  R(F[0]-4,F[1]-3,13,4,b);R(F[0]-4,F[1],13,1,d);R(F[0]+7,F[1]-2,2,2,d);
  const sp=lerp(H,K,.42);limb(H[0],H[1]-2,sp[0],sp[1],14,13,back?sD:sh);
  limb(H[0]+2,H[1],sp[0]+1,sp[1],2,2,back?shade(sh,-.45):sD);
  if(!back)R(sp[0]+4,sp[1]-3,2,4,L.trim);
 };
 const g0=L.gloves||'#2c2f37',gD=shade(g0,-.4),gH=shade(g0,.45);const glove=(x,y,col)=>{disc(x,y,4,gD);disc(x+1,y-1,3,g0);R(x-1,y-3,3,1,gH);R(x+1,y,3,1,gD);R(x-4,y+3,8,2,L.trim);R(x-3,y+5,6,1,col);};
 const arm=(S,E,G,back,gs)=>{
  const b=back?skD:sk,d=back?skDD:skD;
  limb(S[0],S[1],E[0],E[1],9,8,skDD);limb(E[0],E[1],G[0],G[1],8,7,skDD);
  seg(S,E,7,6,b,d,back?null:skL);
  const bc=lerp(S,E,.45);disc(bc[0]+1,bc[1]-1,3,b);if(!back)R(bc[0],bc[1]-3,2,1,skL);
  const ti='#2d3b4f';if(!back&&(L.tattoo==='arm'||L.tattoo==='sleeve')){R(bc[0]-1,bc[1]-1,3,1,ti);R(bc[0],bc[1]+1,2,1,ti);R(bc[0]-2,bc[1]+1,1,1,ti);R(bc[0]+2,bc[1],1,1,ti);}
  seg(E,G,6,5,b,d,null);
  if(!back&&L.tattoo==='sleeve'){const fm=lerp(E,G,.45);R(fm[0]-1,fm[1]-1,3,1,ti);R(fm[0],fm[1]+1,2,1,ti);R(fm[0]-2,fm[1]+1,1,1,ti);}
  glove(G[0],G[1],b);
 };
 let ar={E:[sx-4,shY+17],G:[sx+8,shY-6]},al={E:[sx+8,shY+17],G:[sx+16,shY-9]};
 switch(P){
  case'jab':al={E:[sx+18,shY+1],G:[sx+33,shY-6]};break;
  case'cross':ar={E:[sx+16,shY+3],G:[sx+35,shY-5]};break;
  case'hook':al={E:[sx+21,shY-1],G:[sx+28,shY-10]};break;
  case'upper':ar={E:[sx+13,shY+14],G:[sx+23,shY-10]};break;
  case'hookR':ar={E:[sx+19,shY-1],G:[sx+27,shY-9]};break;
  case'raise':ar={E:[sx-7,shY-3],G:[sx-3,shY-23]};al={E:[sx+13,shY-3],G:[sx+15,shY-23]};break;
  case'pwind':if(HAND[o.act]==='r')ar={E:[sx-8,shY+13],G:[sx-1,shY+1]};else al={E:[sx+3,shY+16],G:[sx+8,shY+3]};break;
  case'block':ar={E:[sx+6,shY+8],G:[sx+11,shY-13]};al={E:[sx+13,shY+7],G:[sx+17,shY-15]};break;
  case'hurt':ar={E:[sx-9,shY+13],G:[sx-8,shY+3]};al={E:[sx+3,shY+17],G:[sx+8,shY+10]};break;
  case'shoot':ar={E:[sx+13,shY+13],G:[sx+26,shY+16]};al={E:[sx+18,shY+10],G:[sx+31,shY+10]};break;
  case'high':case'low':case'kwind':ar={E:[sx-9,shY+10],G:[sx-4,shY-3]};al={E:[sx+10,shY+13],G:[sx+16,shY-8]};break;
 }
 // pierna de atrás y brazo de atrás
 leg([-3,hipY],kB,fB,true);
 arm([sx-5,shY+4],ar.E,ar.G,true);
 // torso 3/4
 const bw=L.body==='heavy'?5:L.body==='lean'?-2:0,N=hipY-shY,rowX=i=>{const t=i/N;return sx*(1-t)+1;};
 for(let i=0;i<=N;i++){const t=i/N,w=Math.round(24+bw-(7+bw*.4)*t)+(L.body==='heavy'&&t>.5?Math.round((t-.5)*6):0),cx=rowX(i),l=Math.round(cx-w/2),y=shY+i;
  R(l,y,w,1,sk);R(l,y,Math.round(w*.3),1,skD);R(l,y,1,1,skDD);R(l+w-1,y,1,1,skL);}
 const r0=rowX(0);
 disc(r0+6,shY+3,4,sk);R(r0+4,shY,5,1,skL);
 for(let i=3;i<=9;i++){const cx=rowX(i);if(i===4)R(cx+1,shY+i,7,1,skL);if(i===9)R(cx-2,shY+i,11,1,skD);}
 R(rowX(10)-1,shY+10,9,1,skDD);
 if(L.tattoo==='chest'){const cx=rowX(5),ti='#2d3b4f';R(cx,shY+4,7,1,ti);R(cx+1,shY+5,5,1,ti);R(cx+2,shY+6,3,1,ti);R(cx+3,shY+7,1,1,ti);}
 for(let i=12;i<N-2;i++){const cx=rowX(i);R(cx+3,shY+i,1,1,skD);if(i%4===2){R(cx-1,shY+i,9,1,skD);R(cx,shY+i-2,3,1,skL);R(cx+5,shY+i-2,2,1,skL);}R(cx-4+Math.round((i-12)/5),shY+i,1,1,skD);}
 // short
 R(-12,hipY-7,24,3,sD);R(-12,hipY-6,24,1,L.trim);R(-12,hipY-4,24,8,sh);if(L.pattern==='split')R(-12,hipY-4,11,8,shade(L.trim,-.2));if(L.pattern==='stripe')R(-2,hipY-4,3,8,L.trim);R(-12,hipY-4,4,8,sD);R(4,hipY-3,2,2,sL);
 // pierna de adelante
 leg([4,hipY+1],kF,fF,false);
 // cabeza
 const hx=Math.round(sx-5+(P==='hurt'?-3:0)),hy=shY-19;
 R(hx+4,hy+14,8,7,skD);R(hx+3,hy+19,12,3,skD);R(hx+8,hy+15,3,4,sk);
 if(L.hairStyle==='afro'){disc(hx+5,hy+3,10,hD);disc(hx+5,hy+2,9,h);}
 if(L.hairStyle==='ponytail'){limb(hx,hy+2,hx-7,hy+13,4,3,h);limb(hx-1,hy+2,hx-7,hy+12,1,1,hL);}
 for(let y=0;y<16;y++){const a=y<2?2:y>11?3+Math.floor((y-11)/2):0,b=y<2?12:y>12?13-(y-12):14;R(hx+a,hy+y,b-a,1,sk);R(hx+a,hy+y,y>11?2:3,1,skD);}
 R(hx+14,hy+7,1,3,sk);R(hx+13,hy+10,2,1,skD);R(hx+7,hy+10,2,3,skD);R(hx+4,hy+6,3,4,skD);R(hx+5,hy+7,1,2,skDD);
 const hairs={
  short:()=>{R(hx,hy-2,13,4,h);R(hx-1,hy,4,8,h);R(hx+2,hy-2,6,1,hL);R(hx+12,hy,2,2,h);R(hx,hy+2,3,1,hD);},
  buzz:()=>{R(hx+1,hy-1,12,3,hD);R(hx,hy+1,3,6,hD);R(hx+3,hy-1,5,1,h);},
  bald:()=>{R(hx+5,hy,4,1,'rgba(255,255,255,.35)');R(hx+4,hy+1,2,1,'rgba(255,255,255,.2)');},
  mohawk:()=>{R(hx+3,hy-5,8,5,h);R(hx+4,hy-5,4,1,hL);R(hx+1,hy,3,3,hD);},
  long:()=>{R(hx-1,hy-2,14,4,h);R(hx-3,hy,6,15,h);R(hx-3,hy+8,4,8,hD);R(hx+2,hy-2,6,1,hL);R(hx+12,hy,2,3,h);},
  afro:()=>{R(hx-1,hy-3,14,4,h);R(hx-1,hy,3,7,h);for(let i=0;i<5;i++)R(hx+i*3-1,hy-4,2,1,hL);},
  ponytail:()=>{R(hx,hy-2,13,3,h);R(hx-1,hy,4,6,h);R(hx+2,hy-2,7,1,hL);},
  topknot:()=>{R(hx,hy-2,13,3,h);R(hx-1,hy,3,5,h);disc(hx+3,hy-5,3,h);R(hx+2,hy-7,2,1,hL);},
  sidecut:()=>{R(hx+2,hy-3,11,4,h);R(hx+4,hy-3,6,1,hL);R(hx,hy+1,4,5,shade(sk,-.12));},
  curly:()=>{R(hx-2,hy-3,16,5,h);R(hx-3,hy,6,8,h);for(let i=0;i<6;i++)R(hx-1+i*3,hy-3,1,1,hL);R(hx-2,hy+5,2,1,hL);R(hx+13,hy-1,2,3,h);}
 };(hairs[L.hairStyle]||hairs.short)();
 if(L.band){R(hx-1,hy+1,15,2,L.band);R(hx-1,hy+3,15,1,shade(L.band,-.3));limb(hx-1,hy+2,hx-7,hy+7,2,2,L.band);limb(hx,hy+3,hx-5,hy+9,2,2,shade(L.band,-.25));}
 const bd=L.beardStyle||(L.beard?'full':'none');
 if(bd==='full'){R(hx+5,hy+11,8,4,h);R(hx+7,hy+15,5,1,h);R(hx+10,hy+11,4,1,h);R(hx+6,hy+14,4,1,hD);}
 else if(bd==='goatee'){R(hx+9,hy+13,4,3,h);R(hx+10,hy+11,4,1,h);}
 else if(bd==='stache')R(hx+9,hy+11,5,1,h);
 else if(bd==='stubble'){for(const[x,y]of[[6,12],[8,13],[10,14],[12,13],[7,14],[11,12],[9,15],[5,11]])R(hx+x,hy+y,1,1,hD);}
 if(o.ko){for(const[x,y]of[[9,6],[11,6],[10,7],[9,8],[11,8]])R(hx+x,hy+y,1,1,'#111');}
 else if(o.hurt){R(hx+9,hy+7,3,1,'#111');R(hx+8,hy+5,4,1,hD);}
 else{R(hx+9,hy+6,3,2,'#f4f4f4');R(hx+11,hy+6,1,2,'#111');R(hx+8,hy+5,5,1,hD);R(hx+9,hy+8,3,1,skD);}
 R(hx+10,hy+12,3,1,o.hurt?'#f2f2f2':'#6b2a2a');
 if(f.hp<55)R(hx+10,hy+3,2,1,'#a63c32');if(f.hp<30){R(hx+12,hy+8,1,2,'#a63c32');R(hx+9,hy+9,2,1,'#7a2b26');}
 // brazo de adelante
 arm([sx+5,shY+4],al.E,al.G,false);
 // cinturón levantado (pose de festejo)
 if(P==='raise'){const bx=sx-7,by=shY-32;R(bx-1,by-1,26,8,'#3a2a05');R(bx,by,24,6,'#c9961e');R(bx,by,24,1,'#f2cf5c');R(bx+7,by-3,10,12,'#3a2a05');R(bx+8,by-2,8,10,'#f2c94c');R(bx+9,by-1,6,1,'#fff3b0');R(bx+11,by+2,2,3,'#c8202f');}
}
// Dibuja el sprite con contorno de 1 pixel generado a partir de la silueta
function blitFighter(f,o,x,gy,face,rot){
 x+=face*(o.dx||0);gy+=o.dy||0;
 if(spriteOf(f.d))spriteFC(f,o);else{const prev=c;c=fcx;fcx.clearRect(0,0,SPW,SPH);fcx.save();fcx.translate(SOX,0);drawSide(f,SOY,o);fcx.restore();c=prev;}
 ocx.globalCompositeOperation='source-over';ocx.clearRect(0,0,SPW,SPH);ocx.drawImage(fc,0,0);
 ocx.globalCompositeOperation='source-in';ocx.fillStyle=o.sil?o.sil:o.flash?(o.flashCol||'#ffd23f'):(o.hit?'#ffffff':'#07080c');ocx.fillRect(0,0,SPW,SPH);ocx.globalCompositeOperation='source-over';
 const g=c;g.save();g.translate(Math.round(x),0);g.scale(face,1);
 if(rot){g.translate(0,gy);g.rotate(rot);g.translate(0,-gy);}
 const ox=-SOX,oy=gy-SOY,th=o.flash?2:1;
 if(o.sil){g.drawImage(oc,ox,oy);g.restore();return;}
 if(o.trail){g.globalAlpha=.16;g.drawImage(fc,ox-9,oy);g.globalAlpha=.3;g.drawImage(fc,ox-5,oy);g.globalAlpha=1;}   // estela del golpe
 for(const[dx,dy]of[[th,0],[-th,0],[0,th],[0,-th]])g.drawImage(oc,ox+dx,oy+dy);
 g.drawImage(fc,ox,oy);g.restore();
}

// Vista lateral del piso (sprite chico 76x44, se dibuja al doble)
function drawLying(f,o){
 const L=f.d.look,sk=L.skin,skD=shade(sk,-.25),OL=o.hit?'#fff':'#07080c',h=L.hair;
 limb(40,34,48,24,7,6,OL);limb(48,24,58,37,6,5,OL);limb(40,34,48,24,5,4,skD);limb(48,24,58,37,4,3,skD);
 R(55,36,8,4,OL);R(56,37,6,2,skD);
 R(32,29,10,10,OL);R(33,30,8,8,L.shorts);R(33,30,8,1,L.trim);
 R(9,29,25,10,OL);R(10,30,23,8,sk);R(10,35,23,3,skD);R(17,30,1,5,skD);R(24,30,1,5,skD);
 R(0,28,11,10,OL);R(1,29,9,8,sk);R(1,34,9,3,skD);
 if(L.hairStyle==='long')R(-2,29,5,9,h);else if(L.hairStyle!=='bald')R(0,29,3,8,h);
 R(7,27,2,2,sk);R(6,30,1,1,'#111');if(L.beard)R(7,33,3,3,h);
 const arm=(a,b,g)=>{limb(a[0],a[1],b[0],b[1],5,4,OL);limb(b[0],b[1],g[0],g[1],4,4,OL);limb(a[0],a[1],b[0],b[1],3,3,sk);limb(b[0],b[1],g[0],g[1],3,2,sk);glove(g[0],g[1],4,sk,OL);};
 if(o.def){arm([12,30],[11,21],[6,21]);arm([16,30],[15,19],[10,17]);}
 else arm([14,31],[20,24],[25,22]);
}
function drawMount(f,o){
 const L=f.d.look,sk=L.skin,skD=shade(sk,-.25),OL=o.hit?'#fff':'#07080c',h=L.hair;
 const lean=o.sub?6:0,shX=34-lean,shY=12+lean;
 limb(38,28,30,38,8,7,OL);limb(30,38,47,39,6,5,OL);limb(38,28,30,38,6,5,sk);limb(30,38,47,39,4,3,skD);
 limb(shX-1,shY+3,shX-8,34,5,4,OL);limb(shX-1,shY+3,shX-8,34,3,3,skD);glove(shX-9,35,4,sk,OL);
 R(32,22,12,9,OL);R(33,23,10,7,L.shorts);R(33,23,10,1,L.trim);
 limb(38,24,shX,shY,11,10,OL);limb(38,24,shX,shY,9,8,sk);limb(41,24,shX+3,shY,2,2,skD);
 const hx=Math.round(shX-7-lean*.4),hy=shY-9;
 R(hx-1,hy-1,9,9,OL);R(hx,hy,7,7,sk);R(hx-2,hy+3,2,2,sk);
 switch(L.hairStyle){case'bald':R(hx+3,hy,2,1,'rgba(255,255,255,.3)');break;case'long':R(hx+2,hy-1,6,9,h);break;case'mohawk':R(hx+2,hy-3,4,3,h);break;case'curly':R(hx+1,hy-2,8,4,h);R(hx+5,hy+2,3,3,h);break;default:R(hx+2,hy-1,6,3,h);R(hx+5,hy+2,2,3,h);}
 R(hx+1,hy+3,1,1,'#111');if(L.beard)R(hx,hy+5,4,2,h);
 const arm=(a,b,g,gs)=>{limb(a[0],a[1],b[0],b[1],5,5,OL);limb(b[0],b[1],g[0],g[1],5,4,OL);limb(a[0],a[1],b[0],b[1],4,3,sk);limb(b[0],b[1],g[0],g[1],3,3,sk);glove(g[0],g[1],gs||5,sk,OL);};
 if(o.sub){arm([shX+1,shY+2],[shX-6,shY+6],[5,27]);arm([shX+2,shY+4],[shX-4,shY+10],[8,32],4);}
 else if(o.punch)arm([shX+1,shY+2],[shX-5,shY+9],[7,30]);
 else arm([shX+1,shY+2],[shX+8,shY],[shX+4,shY-6]);
}
const rc=document.createElement('canvas');rc.width=80;rc.height=96;const rcx=rc.getContext('2d');
const gc=document.createElement('canvas');gc.width=76;gc.height=44;const gcx=gc.getContext('2d');

// Fondo de costado pre-renderizado
const GY=136,WALL=18,MINSEP=28;
let bgS;
// Puntos de un octágono achatado (para dibujarlo en perspectiva sobre el piso)
function octPts(cx,cy,rx,ry){return Array.from({length:8},(_,i)=>{const a=Math.PI/8+i*Math.PI/4;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry];});}
function polyFill(pts,col){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=col;c.fill();}
// Arena: tribuna, jaula del octágono (fondo y costados), piso con la línea del octágono y logo
function buildBg(){
 const cnv=document.createElement('canvas');cnv.width=W;cnv.height=H;const prev=c;c=cnv.getContext('2d');
 const E=escActual(),r=escRng([...E.id].reduce((a,ch)=>a*31+ch.charCodeAt(0),7)),fl=escFlags();
 try{
  if(E.fondo&&E.jaula)fondoRegional(E,r,fl);else if(E.fondo)fondoCalle(E,r,fl);else fondoArena(E,r,fl);
  if(E.jaula)jaulaYLona(E,r);else sueloCalle(E,r);
 }catch(e){console.error(e);}
 const vg=c.createRadialGradient(W/2,96,70,W/2,96,W*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.16)');c.fillStyle=vg;c.fillRect(0,0,W,H);
 const sp=c.createRadialGradient(W/2,112,6,W/2,118,90);sp.addColorStop(0,'rgba(255,248,230,.18)');sp.addColorStop(1,'rgba(255,248,230,0)');c.fillStyle=sp;c.fillRect(0,0,W,H);
 c=prev;return cnv;
}


/* ---------------- Árbitro ----------------
   Dibujado con código (pixel art, mismo tamaño que los peleadores): remera negra, pantalón gris,
   guantes de látex. arm: 0 = brazo abajo, 1 = levantando el brazo del ganador. hand: [x,y] adonde va la mano (local, mirando a la derecha). */
const refC=document.createElement('canvas');refC.width=120;refC.height=110;const refX=refC.getContext('2d');
const refO=document.createElement('canvas');refO.width=120;refO.height=110;const refOX=refO.getContext('2d');
function drawRef(x,gy,face,arm,walk,hand){
 const prev=c;c=refX;refX.clearRect(0,0,120,110);
 const ox=50,fy=106,SK='#c99470',SKD='#a5714f',SH='#16181d',SHL='#2b2f38',PA='#3d424c',PAD='#2a2e36',GL='#4f86d9',HA='#2a1d16';
 const sw=Math.sin(walk||0)*7;
 // piernas
 limb(ox-3,fy-38,ox-5-sw,fy-3,8,7,PAD);limb(ox+3,fy-38,ox+5+sw,fy-3,8,7,PA);
 R(ox-10-sw,fy-4,10,4,'#0b0c10');R(ox+1+sw,fy-4,11,4,'#0b0c10');
 // brazo de atrás (colgando)
 limb(ox-6,fy-62,ox-9,fy-46,6,5,SH);limb(ox-9,fy-46,ox-8-sw*.4,fy-34,5,4,SKD);R(ox-11-sw*.4,fy-35,5,5,GL);
 // torso: remera negra con cuello, hombros más anchos
 R(ox-11,fy-66,22,6,SH);R(ox-10,fy-60,20,24,SH);R(ox-9,fy-64,5,26,SHL);R(ox-4,fy-67,8,3,'#5b616d');R(ox-10,fy-40,20,3,'#0b0c10');R(ox+3,fy-58,5,3,'#d20a0a');
 // cuello y cabeza redonda
 R(ox-3,fy-71,7,6,SKD);
 disc(ox,fy-80,8,SK);R(ox-7,fy-80,3,6,SKD);R(ox-2,fy-73,9,2,SKD);
 disc(ox-1,fy-85,6,HA);R(ox-8,fy-87,13,4,HA);R(ox-9,fy-84,4,5,HA);
 R(ox-3,fy-81,3,4,SKD);R(ox-2,fy-80,1,2,'#e8b892');R(ox+4,fy-82,2,2,'#111');R(ox+3,fy-84,3,1,HA);R(ox+7,fy-78,2,2,SK);R(ox+4,fy-76,3,1,'#7a4a33');
 // brazo de adelante: de colgando a levantar el brazo del ganador
 const sh=[ox+5,fy-62],down=[ox+9,fy-36],up=hand||[ox+14,fy-92],k=Math.min(1,arm||0);
 const hx=down[0]+(up[0]-down[0])*k,hy=down[1]+(up[1]-down[1])*k,el=[(sh[0]+hx)/2+(k>.2?4:2),(sh[1]+hy)/2+(k>.2?3:0)];
 limb(sh[0],sh[1],el[0],el[1],7,6,SH);limb(el[0],el[1],hx,hy,5,5,SK);R(hx-3,hy-3,6,6,GL);
 c=prev;
 // contorno negro como los peleadores
 refOX.globalCompositeOperation='source-over';refOX.clearRect(0,0,120,110);refOX.drawImage(refC,0,0);
 refOX.globalCompositeOperation='source-in';refOX.fillStyle='#07080c';refOX.fillRect(0,0,120,110);refOX.globalCompositeOperation='source-over';
 const g=c;g.save();g.translate(Math.round(x),0);g.scale(face,1);
 for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])g.drawImage(refO,-ox+dx,gy-fy+dy);
 g.drawImage(refC,-ox,gy-fy);g.restore();
}
