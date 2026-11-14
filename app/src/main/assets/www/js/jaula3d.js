/* ---------------- Pelea parada con los sprites nuevos: octógono en perspectiva y cámara que gira ----------------
   La lógica de la pelea sigue siendo la de siempre (distancia entre los dos en f.x). Encima se suma:
   - f.lz: corrimiento al costado (subir / bajar en el stick o ↑ ↓). Si el golpe sale y el otro está corrido de la línea, no entra.
   - J3.a: ángulo de la línea entre los dos. Cuando se mueven al costado la línea gira, y la cámara la sigue:
     lo que se ve girar es el octógono, el público y la reja, como en los juegos de UFC.
   Se dibuja en un canvas propio más grande (#cv3), debajo del de siempre, que queda transparente para textos y chispas. */
const J3={cv:null,g:null,a:0,th:0,camX:0,camY:0,zoom:1,W3:480,H3:360,KX:3.6,HY:1.9,K:.3,R0:500,pub:null};
const J3_HI={jab:3,cross:3,hook:3,hookR:3,upper:3,low:4,high:4,td:2};
function j3Init(){
 if(J3.cv)return;const ar=$('#arena');
 J3.cv=document.createElement('canvas');J3.cv.id='cv3';J3.cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;display:none';
 ar.insertBefore(J3.cv,ar.firstChild);J3.g=J3.cv.getContext('2d');
 let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;J3.pub=[];for(let i=0;i<1600;i++)J3.pub.push([r()*Math.PI*2,r(),r()]);
}
const j3On=()=>!!(G&&(G.mode==='stand'||(G.mode==='ground'&&s2Ok()))&&typeof sprite2==='function'&&c2Ok()&&!G.p.d.sprite&&!G.r.d.sprite);
function j3Resize(){
 j3Init();J3.H3=360;J3.W3=Math.round(W*360/H);J3.cv.width=J3.W3;J3.cv.height=J3.H3;
 J3.R0=((W/2)-WALL)*J3.KX/.8;
}
// mundo -> pantalla
function j3P(X,Z){const c=Math.cos(J3.th),s=Math.sin(J3.th);const x=c*X-s*Z,y=J3.K*(s*X+c*Z),d=s*X+c*Z;
 return[J3.W3/2+(x-J3.camX)*J3.zoom,J3.H3*.83+(y-J3.camY)*J3.zoom,d];}
function j3Pos(f){const u=[Math.cos(J3.a),Math.sin(J3.a)],n=[-u[1],u[0]],w=(f.x-W/2)*J3.KX,l=f.lz||0;return[u[0]*w+n[0]*l,u[1]*w+n[1]*l];}
const j3Esc=d=>.88+.12*(d+J3.R0)/(2*J3.R0);
// coordenadas viejas (x de la pelea, y de 0 a 144) -> canvas viejo, ya girado
function j3Map(x,y){const w=(x-W/2)*J3.KX,u=[Math.cos(J3.a),Math.sin(J3.a)],q=j3P(u[0]*w,u[1]*w);const k=J3.W3/W;return[q[0]/k,(q[1]-(GY-y)*J3.HY*J3.zoom)/k];}

/* ---------- movimiento al costado ---------- */
function j3Update(dt){
 if(G&&G.salida)G.salida.t-=dt;
 if(G&&G.entrada>0)G.entrada-=dt;
 if(G&&G.mode==='ground'){ // en el piso la cámara se queda mirando a los dos
  const A=j3P(...j3Pos(G.p)),B=j3P(...j3Pos(G.r));
  const tx=((A[0]+B[0])/2-J3.W3/2)/J3.zoom+J3.camX,ty=((A[1]+B[1])/2-J3.H3*.83)/J3.zoom+J3.camY;
  J3.camX+=(tx-J3.camX)*Math.min(1,dt*3);J3.camY+=(ty-J3.camY)*Math.min(1,dt*3);J3.zoom+=(1.12-J3.zoom)*Math.min(1,dt*2);return;}
 if(!G||G.mode!=='stand')return;
 const p=G.p,r=G.r;
 const lat=(input.dn||(typeof padIn!=='undefined'&&padIn.dn)?1:0)-(input.up||(typeof padIn!=='undefined'&&padIn.up)?1:0);
 p.vl=freeS(p.state)&&G.phase==='fight'?lat:0;
 if(r.vlT>0){r.vlT-=dt;if(r.vlT<=0)r.vl=0;}
 if(!freeS(r.state)||G.phase!=='fight')r.vl=0;
 for(const f of[p,r]){
  f.lz=f.lz||0;
  if(f.vl){f.lz=clamp(f.lz+f.vl*150*dt,-60,60);f.walk+=dt*10;J3.a+=f.vl*(f===p?1:-1)*.9*dt;}
  else f.lz+=(0-f.lz)*Math.min(1,dt*3.2);
 }
 // la cámara se pone de costado a la línea de pelea (con un poquito de retraso)
 let d=-J3.a-J3.th;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;J3.th+=d*Math.min(1,dt*2.4);
 const A=j3P(...j3Pos(p)),B=j3P(...j3Pos(r));
 const tx=((A[0]+B[0])/2-J3.W3/2)/J3.zoom+J3.camX,ty=((A[1]+B[1])/2-J3.H3*.83)/J3.zoom+J3.camY;
 J3.camX+=(tx-J3.camX)*Math.min(1,dt*3);J3.camY+=(ty-J3.camY)*Math.min(1,dt*3);
 const zt=G.phase==='ko'&&G.koT>1.2?1.35:1;J3.zoom+=(zt-J3.zoom)*Math.min(1,dt*2.5);
 if(G.phase==='ko'||G.phase==='cere'){const lo=G.res&&(G.res.w==='p'?r:p);if(lo&&zt>1){const q=j3P(...j3Pos(lo));J3.camX+=((q[0]-J3.W3/2)/J3.zoom)*Math.min(1,dt*2);}}
}
// ¿se corrió de la línea? (para que el golpe no entre)
function j3Esquiva(a,b){return Math.abs((a.lz||0)-(b.lz||0))>26;}

/* ---------- dibujo ---------- */
function j3Cuadro(f){
 const S=sprite2(f.d);if(!S)return null;const F=S.frames,t=G.t;
 const ganador=G.res&&G.res.w!=='d'&&(G.res.w==='p')===(f===G.p)&&f.state!=='ko';
 if(f.state==='ko'){const T=f.fall?f.fall.t:9;return[S,F.ko[Math.min(F.ko.length-1,Math.floor(T/.1))]];}
 if(ganador&&(G.phase==='end'||(G.phase==='cere'&&G.cere&&G.cere.arm>.3)))return[S,F.win[Math.floor(t*4)%F.win.length]];
 if(G.phase==='cere'||G.phase==='ko')return[S,F.guard[0]];
 const k=f.act,L=k&&F[k];
 if(f.state==='wind'&&L){const hi=J3_HI[k]||3,pr=clamp(1-f.t/(f.tw||1),0,.999);return[S,L[Math.min(hi-1,Math.floor(pr*hi))]];}
 if((f.state==='rec'||f.state==='missed')&&L){const hi=J3_HI[k]||3,pr=clamp(1-f.t/(f.t0||1),0,.999);return[S,L[Math.min(L.length-1,hi+Math.floor(pr*(L.length-hi)))]];}
 if(f.state==='block')return[S,F.guard[0]];
 if(f.state==='check')return[S,F.knee[1]];
 if(f.state==='crouch')return[S,F.upper[1]];
 if(f.state==='hurt')return[S,F.hurt[Math.min(1,Math.floor((t*12)%2))]];
 if(f.state==='stun')return[S,F.hurt[1+Math.floor(t*5)%2]];
 if(Math.abs(f.vx)>1||f.vl){const back=f.vx*f.face<0&&!f.vl,W_=back?F.back:F.walk;return[S,W_[Math.floor(f.walk*.9)%W_.length]];}
 const g=F.guard,sq=[0,1,2,3,2,1];return[S,g[sq[Math.floor(t*6.5+(f===G.p?0:2))%6]]];
}
function j3Peleador(g,f){
 const c=j3Cuadro(f);if(!c)return;const[S,fr]=c;const[fx,fy,fw,fh,ax]=fr;
 const q=j3P(...j3Pos(f)),s=j3Esc(q[2])*J3.zoom;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(q[0],q[1],38*s,8*s,0,0,Math.PI*2);g.fill();
 let dx=0;if(f.recoil>0)dx=-f.face*8*f.recoil/.32;
 if(f.state==='wind'&&f.act&&MOVES[f.act]&&!MOVES[f.act].td)dx-=f.face*3;
 g.save();g.translate(Math.round(q[0]+dx*s),Math.round(q[1])+2);g.scale(f.face*s,s);
 if(f.hit>.11)g.filter='brightness(2.2)';else if(f===G.r&&f.state==='wind'&&Math.floor(G.t*16)%2===0)g.filter=MOVES[f.act]&&MOVES[f.act].td?'drop-shadow(0 0 3px #5aa2ff)':'drop-shadow(0 0 3px #ffd23f)';
 g.drawImage(S.img,fx,fy,fw,fh,-ax,-fh,fw,fh);g.restore();g.filter='none';
}
/* ---------- piso con las hojas nuevas de dos peleadores ----------
   A (short negro en la hoja) es el que domina: arriba, el que derriba o el que hace la sumisión. B es el otro.
   El short de cada uno se pinta con su color. */
const s2Img={a:new Image(),m:new Image()};let s2N=0;s2Img.a.onload=s2Img.m.onload=()=>s2N++;
if(typeof SUELO2!=='undefined'){s2Img.a.src=SUELO2.src;s2Img.m.src=SUELO2.mascara;}
const s2Ok=()=>s2N>=2;
const s2Cache=new Map();
function suelo2(dA,dB){
 if(!s2Ok())return null;const oA=look2(dA),oB=look2(dB),sig=oA.col+oB.col+oA.skin+oB.skin;
 if(s2Cache.has(sig))return s2Cache.get(sig);
 const Wd=s2Img.a.width,Hd=s2Img.a.height,cv=document.createElement('canvas');cv.width=Wd;cv.height=Hd;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(s2Img.a,0,0);
 try{const mk=document.createElement('canvas');mk.width=Wd;mk.height=Hd;const mg=mk.getContext('2d',{willReadFrequently:true});mg.drawImage(s2Img.m,0,0);
  const id=g.getImageData(0,0,Wd,Hd),p=id.data,m=mg.getImageData(0,0,Wd,Hd).data,CA=c2Rgb(oA.col),CB=c2Rgb(oB.col);
  // piel: promedio de los dos (la hoja no separa quién es quién en la piel)
  const T1=c2Rgb(oA.skin),T2=c2Rgb(oB.skin),T=[0,1,2].map(i=>(T1[i]+T2[i])/2),base=[197,138,98];
  for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const L=p[i]*.3+p[i+1]*.59+p[i+2]*.11;
   if(m[i]>128){const k=.55+L/95;for(let j=0;j<3;j++)p[i+j]=Math.min(255,CA[j]*k);}
   else if(m[i+1]>128){const k=Math.min(1.25,L/205);for(let j=0;j<3;j++)p[i+j]=Math.min(255,CB[j]*k*1.05);}
   else if(p[i]>p[i+1]&&p[i+1]>p[i+2]&&p[i]-p[i+2]>30){for(let j=0;j<3;j++)p[i+j]=Math.min(255,p[i+j]*T[j]/base[j]);}}
  g.putImageData(id,0,0);}catch(e){}
 s2Cache.set(sig,cv);if(s2Cache.size>6)s2Cache.delete(s2Cache.keys().next().value);return cv;
}
function j3Piso(g){
 const F=SUELO2.frames,t=G.t;let anim,fi,A,B,sal=G.salida&&G.salida.t>0;
 if(sal){const S=G.salida;A=S.top;B=A===G.p?G.r:G.p;anim='escape';fi=Math.min(3,Math.floor((1-S.t/.9)*4));}
 else{
  const pTop=G.top==='p',topF=pTop?G.p:G.r,botF=pTop?G.r:G.p;A=topF;B=botF;
  const atkTop=G.gAnim>0&&((G.gAtk==='p')===pTop),subOn=pTop?G.pSub>15:G.subOn,subAbajo=!pTop&&G.pSub>15&&!G.subOn;
  if(G.entrada>0){anim='caida';fi=Math.min(3,Math.floor((1-G.entrada/.9)*4));}
  else if(subOn||subAbajo){anim='mataleon';if(subAbajo){A=botF;B=topF;}const v=subAbajo?G.pSub:pTop?G.pSub:G.rSub;fi=Math.min(3,Math.floor(v/100*4));}
  else if(atkTop){anim='golpes';fi=Math.min(3,Math.floor((1-G.gAnim/.25)*4));}
  else{anim='control';fi=Math.floor(t*4)%4;}
 }
 const img=suelo2(A.d,B.d);if(!img)return;const[fx,fy,fw,fh]=F[anim][Math.max(0,fi)];
 const qa=j3P(...j3Pos(G.p)),qb=j3P(...j3Pos(G.r)),q=[(qa[0]+qb[0])/2,(qa[1]+qb[1])/2,(qa[2]+qb[2])/2],sc=j3Esc(q[2])*J3.zoom;
 const flip=A.x>B.x?-1:1,jit=anim==='mataleon'?Math.round(Math.sin(t*22)):0;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(q[0],q[1],fw*.48*sc,10*sc,0,0,Math.PI*2);g.fill();
 g.save();g.translate(Math.round(q[0])+jit,Math.round(q[1])+2);g.scale(flip*sc,sc);
 if((G.p.hit>0||G.r.hit>0)&&Math.floor(t*20)%2)g.filter='brightness(1.8)';
 g.drawImage(img,fx,fy,fw,fh,-fw/2,-fh,fw,fh);g.restore();g.filter='none';
}
function j3Oct(r){return[...Array(8)].map((_,k)=>{const a=(22.5+45*k)*Math.PI/180;return[r*Math.cos(a),r*Math.sin(a)];});}
function j3Fondo(g){
 const E=G.esc||{jaula:1},W3=J3.W3,H3=J3.H3,t=G.t,J=E.jaula!==0&&!E.s3d||(E.img&&E.jaula),IM=escImg(E);
 const te=E.fondo==='patio'?['#5aa9e6','#b8dcf5']:E.fondo==='playa'?['#3b2a6b','#ffb35a']:E.fondo==='azotea'?['#1b2240','#5a4a6a']:E.techo||['#05070b','#141822'];
 const bg=g.createLinearGradient(0,0,0,H3);bg.addColorStop(0,te[0]);bg.addColorStop(.7,te[1]);bg.addColorStop(1,'#07080b');g.fillStyle=bg;g.fillRect(0,0,W3,H3);
 const R0=J3.R0,RF=R0*(J?1.3:1.2);
 if(IM){
  // fondo 360: la imagen y su espejo dan la vuelta entera; gira con la cámara
  const yF=H3*.83+(-J3.K*RF-J3.camY)*J3.zoom,ph=Math.max(150,yF+28),s=ph/IM.f.height,pw=IM.f.width*s,circ=pw*2;
  let x0=-((J3.th/(2*Math.PI))*circ+J3.camX*.25+circ*.25-W3/2)%circ;if(x0>0)x0-=circ;
  g.imageSmoothingEnabled=true;
  for(let x=x0;x<W3;x+=circ){g.drawImage(IM.f,Math.round(x),Math.round(yF+24-ph),Math.ceil(pw)+1,Math.round(ph));
   g.save();g.translate(Math.round(x+circ),0);g.scale(-1,1);g.drawImage(IM.f,0,Math.round(yF+24-ph),Math.ceil(pw)+1,Math.round(ph));g.restore();}
  g.imageSmoothingEnabled=false;
 }else if(J){
  const lc=E.luces||['#fff'];for(let i=0;i<6;i++){const x=W3*(i+.5)/6,lg=g.createRadialGradient(x,0,2,x,0,90);lg.addColorStop(0,'rgba(255,244,214,.35)');lg.addColorStop(1,'rgba(255,244,214,0)');g.fillStyle=lg;g.fillRect(x-90,0,180,90);g.fillStyle=lc[i%lc.length];g.fillRect(x-6,2,12,3);}
  // público: gira con la cámara
  const off=-J3.camX*.25,offy=-J3.camY*.2;
  for(const[a0,h,rr]of J3.pub){const a=a0+J3.th;if(Math.cos(a)<-.1)continue;const x=W3/2+Math.sin(a)*W3*.95+off,y=36+h*170+offy;if(x<-4||x>W3+4)continue;
   const fl=Math.sin(t*2+rr*60)>.996;g.fillStyle=fl?'#fff':rr<.33?'#2a2f3d':rr<.66?'#363c4c':'#22262f';g.fillRect(x|0,y|0,3,4);g.fillStyle=rr<.5?'#3b3027':'#2b2620';g.fillRect(x|0,(y|0)-3,3,3);}
 }
 // piso: se dibuja visto desde arriba y se "aplasta" girado
 const c=Math.cos(J3.th),s=Math.sin(J3.th);
 g.save();g.translate(J3.W3/2-J3.camX*J3.zoom,J3.H3*.83-J3.camY*J3.zoom);g.scale(J3.zoom,J3.zoom);g.transform(c,J3.K*s,-s,J3.K*c,0,0);
 if(IM){
  g.save();g.beginPath();g.arc(0,0,RF,0,7);g.clip();g.imageSmoothingEnabled=false;
  const L=RF*2*(J?1.06:1.25);g.drawImage(IM.p,-L/2,-L/2,L,L);
  const vg=g.createRadialGradient(0,0,RF*.75,0,0,RF);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=vg;g.fillRect(-RF,-RF,RF*2,RF*2);g.restore();
 }
 if(!J){if(!IM){g.fillStyle=E.s3d||'#7c7f86';g.beginPath();g.arc(0,0,R0*3,0,7);g.fill();g.fillStyle='rgba(0,0,0,.08)';g.beginPath();g.arc(0,0,R0*.9,0,7);g.fill();}}
 else{
  const LG=E.logo||['#a51b26','#c8202f','#e8eaed','#c8202f'],O=j3Oct(R0),path=P=>{g.beginPath();P.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
  if(!IM){g.fillStyle='#0f1116';g.beginPath();g.arc(0,0,R0*1.25,0,7);g.fill();}
  else{g.fillStyle='rgba(0,0,0,.45)';path(j3Oct(R0*1.13));g.fill();}
  if(E.apron){for(let k=0;k<8;k++){g.fillStyle=E.apron[k%E.apron.length];const a=O[k],b=O[(k+1)%8];g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(b[0]*1.12,b[1]*1.12);g.lineTo(a[0]*1.12,a[1]*1.12);g.closePath();g.globalAlpha=.55;g.fill();g.globalAlpha=1;}}
  g.fillStyle=E.lona||'#d9dbe0';path(O);g.fill();g.strokeStyle='#9da2ad';g.lineWidth=6;g.stroke();
  g.strokeStyle='rgba(110,118,135,.35)';g.lineWidth=4;path(j3Oct(R0*.82));g.stroke();
  g.fillStyle=LG[0];g.beginPath();g.arc(0,0,R0*.28,0,7);g.fill();g.fillStyle=LG[2];g.beginPath();g.arc(0,0,R0*.22,0,7);g.fill();
  g.fillStyle=LG[1];g.font=`bold ${Math.round(R0*.085)}px sans-serif`;g.textAlign='center';g.fillText('POCKET',0,-R0*.01);g.fillText('MMA',0,R0*.08);
  g.globalAlpha=.5;g.fillStyle=LG[1];g.font=`bold ${Math.round(R0*.1)}px sans-serif`;
  for(let k=0;k<4;k++){g.save();g.rotate(k*Math.PI/2);g.fillText(((E.nombre||'POCKET MMA')+'').toUpperCase(),0,R0*.68);g.restore();}g.globalAlpha=1;
 }
 g.restore();
}
function j3Reja(g,atras){
 const E=G.esc||{jaula:1};if(E.jaula===0||(E.s3d&&!E.img))return;
 const O=j3Oct(J3.R0),L=[];for(let i=0;i<8;i++){const a=j3P(...O[i]),b=j3P(...O[(i+1)%8]);L.push({a,b,d:(a[2]+b[2])/2});}
 const alto=d=>{const u=(d+J3.R0)/(2*J3.R0);return(205-u*165)*J3.zoom;};
 for(const e of L.filter(e=>atras?e.d<=0:e.d>0).sort((p,q)=>p.d-q.d)){
  const{a,b}=e,ha=alto(a[2]),hb=alto(b[2]),fr=e.d>0;
  g.strokeStyle=fr?'rgba(15,17,22,.3)':'rgba(30,34,44,.5)';g.lineWidth=1;
  for(let s=0;s<=1;s+=.03){const x=a[0]+(b[0]-a[0])*s,y=a[1]+(b[1]-a[1])*s,h=ha+(hb-ha)*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+h*.1,y-h);g.moveTo(x,y);g.lineTo(x-h*.1,y-h);g.stroke();}
  g.fillStyle='#111';g.beginPath();g.moveTo(a[0],a[1]-ha);g.lineTo(b[0],b[1]-hb);g.lineTo(b[0],b[1]-hb+4);g.lineTo(a[0],a[1]-ha+4);g.fill();
  const pc=(G.esc&&G.esc.logo&&G.esc.logo[1])||'#c81e28';
  for(const[p,h]of[[a,ha],[b,hb]]){g.fillStyle='#111';g.fillRect(p[0]-4,p[1]-h-2,8,h+2);g.fillStyle=pc;g.fillRect(p[0]-5,p[1]-h-6,10,12);}
 }
}
function j3Render(){
 const g=J3.g;g.imageSmoothingEnabled=false;
 g.save();if(G.shake>0)g.translate(Math.round(rand(-5,5)),Math.round(rand(-3,3)));
 j3Fondo(g);j3Reja(g,true);
 const C=G.cere,fs=[G.p,G.r].sort((a,b)=>j3P(...j3Pos(a))[2]-j3P(...j3Pos(b))[2]);
 if(G.mode==='ground'||(G.salida&&G.salida.t>0&&s2Ok()))j3Piso(g);else for(const f of fs)j3Peleador(g,f);
 j3Reja(g,false);
 g.restore();
 if(G.counterFor===G.p&&G.counterT>0&&Math.floor(G.t*10)%2===0){g.strokeStyle='#ffd23f';g.lineWidth=5;g.strokeRect(2,2,J3.W3-4,J3.H3-4);}
}
