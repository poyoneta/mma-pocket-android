/* ---------------- Escenarios ----------------
   Cada pelea se hace en un lugar. Todo se dibuja con código (pixel art), así que no ocupa espacio.
   nivel: 'calle'  = peleas callejeras del comienzo de la carrera (patio, playa, azotea)
          'regional' = liga regional (galpón, club de barrio)
          'pro'    = eventos de la empresa en distintas ciudades
          'elite'  = las sedes grandes: títulos y peleas del top 10 (Estados Unidos y Medio Oriente)
   jaula: true = octágono con jaula; false = se pelea en el piso del lugar (sin jaula).
   En la tribuna aparecen banderas del país de la sede y de los dos peleadores. */
const ESCENARIOS=[
 {id:'vegas',nombre:'Las Vegas',lugar:'Las Vegas, EE.UU.',pais:'USA',nivel:'elite',jaula:1,techo:['#0a0412','#1c0b2b'],luces:['#ff2fd0','#27e3ff','#ffd23f'],tinte:'rgba(140,40,170,.16)',
  lona:'#d8d6de',logo:['#7a1fa0','#b02bd6','#f2e9ff','#ffd23f'],apron:['#ff2fd0','#ffd23f','#27e3ff','#fff'],pantalla:['#2a0b45','#d0249a'],sky:'vegas'},
 {id:'nueva_york',nombre:'Nueva York',lugar:'Nueva York, EE.UU.',pais:'USA',nivel:'elite',jaula:1,techo:['#03060d','#0e1a2e'],luces:['#3a8bff','#ffffff','#d20a0a'],tinte:'rgba(40,90,190,.14)',
  lona:'#d3d6db',logo:['#13305e','#2c5fb3','#e8eaed','#d20a0a'],apron:['#2c5fb3','#fff','#d20a0a','#fff'],pantalla:['#0b1c3a','#4a6fa8'],sky:'ny'},
 {id:'abu_dhabi',nombre:'Abu Dabi',lugar:'Abu Dabi, Emiratos Árabes',pais:'ARE',nivel:'elite',jaula:1,aire:1,techo:['#020611','#0d2238'],luces:['#ffd27a','#3fd0c9','#ffffff'],tinte:'rgba(255,200,110,.1)',
  lona:'#ddd6c8',logo:['#7a5a1f','#c9a24a','#f6efe0','#00843d'],apron:['#c9a24a','#00843d','#fff','#c8102e'],pantalla:['#081a2e','#3a6f8f'],sky:'abudabi'},
 {id:'riad',nombre:'Riad',lugar:'Riad, Arabia Saudita',pais:'SAU',nivel:'elite',jaula:1,techo:['#060805','#1a1608'],luces:['#ffcf5a','#1f9e5a','#ffffff'],tinte:'rgba(220,170,60,.13)',
  lona:'#dcd5c2',logo:['#0b5d33','#178a4c','#f3ead2','#c9a24a'],apron:['#178a4c','#c9a24a','#fff','#c9a24a'],pantalla:['#2b2208','#c9a24a'],sky:'riad',arcos:1},
 {id:'buenos_aires',nombre:'Buenos Aires',lugar:'Buenos Aires, Argentina',pais:'ARG',nivel:'pro',jaula:1,techo:['#04070c','#101d2c'],luces:['#74acdf','#ffffff','#f6b40e'],tinte:'rgba(116,172,223,.14)',
  lona:'#d6dae0',logo:['#3d77b0','#74acdf','#ffffff','#f6b40e'],apron:['#74acdf','#fff','#74acdf','#f6b40e'],pantalla:['#0b2036','#74acdf'],sky:'baires'},
 {id:'rio',nombre:'Río de Janeiro',lugar:'Río de Janeiro, Brasil',pais:'BRA',nivel:'pro',jaula:1,aire:1,techo:['#06081a','#1b2a52'],luces:['#ffdf00','#009c3b','#ffffff'],tinte:'rgba(0,156,59,.12)',
  lona:'#d9dccf',logo:['#00702b','#009c3b','#ffdf00','#002776'],apron:['#009c3b','#ffdf00','#002776','#fff'],pantalla:['#0a1a3a','#e07a3a'],sky:'rio'},
 {id:'cdmx',nombre:'Ciudad de México',lugar:'Ciudad de México, México',pais:'MEX',nivel:'pro',jaula:1,techo:['#07060a','#1d1414'],luces:['#ce1126','#006847','#ffffff'],tinte:'rgba(206,17,38,.1)',
  lona:'#d8d8d4',logo:['#004d33','#006847','#f2f2ee','#ce1126'],apron:['#006847','#fff','#ce1126','#fff'],pantalla:['#1a0f12','#a83a3a'],sky:'cdmx'},
 {id:'gimnasio',vieja:1,nombre:'Club de barrio',lugar:'Club del barrio, Córdoba',pais:'ARG',nivel:'regional',jaula:1,lona:'#2f6db5',logo:['#1d4f8a','#3b82d0','#e8eaed','#d20a0a'],apron:['#d20a0a','#fff','#2c5fb3','#fff'],fondo:'gimnasio'},
 {id:'galpon',vieja:1,nombre:'El galpón',lugar:'Galpón del puerto, Rosario',pais:'ARG',nivel:'regional',jaula:1,lona:'#9a9488',logo:['#4a4438','#6d6556','#c9c2b2','#b33a1a'],apron:['#3a3a3a','#6d6556','#3a3a3a','#b33a1a'],fondo:'galpon'},
 {id:'patio',vieja:1,nombre:'Patio',lugar:'Un patio en Córdoba',pais:'ARG',nivel:'calle',fondo:'patio',suelo:'pasto',s3d:'#5f8f3a'},
 {id:'playa',vieja:1,nombre:'Playa',lugar:'Playa de Copacabana, Río',pais:'BRA',nivel:'calle',fondo:'playa',suelo:'arena',s3d:'#e3c98f'},
 {id:'azotea',vieja:1,nombre:'Azotea',lugar:'Una azotea en Buenos Aires',pais:'ARG',nivel:'calle',fondo:'azotea',suelo:'cemento',s3d:'#7c7f86'},
 // ---- Escenarios con imágenes (fondo 360 + piso visto desde arriba). img: prefijo en assets/esc2/ ----
 {id:'e_gimnasio',img:'01',nombre:'Gimnasio de boxeo',lugar:'Gimnasio de boxeo, Buenos Aires',pais:'ARG',nivel:'calle',jaula:0,s3d:'#3a2a20',techo:['#120d0c','#2a1d16']},
 {id:'e_patio',img:'02',nombre:'Patio con parrilla',lugar:'Un patio en Córdoba',pais:'ARG',nivel:'calle',jaula:0,s3d:'#6b5a4a',techo:['#3b2a6b','#ff8a4a']},
 {id:'e_club',img:'03',nombre:'Club de barrio',lugar:'Club de barrio, Argentina',pais:'ARG',nivel:'calle',jaula:0,s3d:'#9a5a2a',techo:['#20283a','#3a4a6a']},
 {id:'e_favela',img:'04',nombre:'Terraza en la favela',lugar:'Una terraza en Río de Janeiro',pais:'BRA',nivel:'calle',jaula:0,s3d:'#6e6662',techo:['#0b1030','#25204a']},
 {id:'e_copacabana',img:'05',nombre:'Copacabana',lugar:'Playa de Copacabana, Río',pais:'BRA',nivel:'calle',jaula:0,s3d:'#d9b46a',techo:['#4a2a6b','#ff9a4a']},
 {id:'e_rosario',img:'06',nombre:'Galpón del puerto',lugar:'Galpón del puerto, Rosario',pais:'ARG',nivel:'regional',jaula:1,lona:'#cfc9bd',logo:['#4a4438','#e8742a','#f1ece2','#b33a1a'],apron:['#3a3a3a','#e8742a','#3a3a3a','#e8742a'],techo:['#140c06','#2a1a0c']},
 {id:'e_saopaulo',img:'07',nombre:'Arena São Paulo',lugar:'São Paulo, Brasil',pais:'BRA',nivel:'regional',jaula:1,lona:'#d6d8cc',logo:['#00702b','#e8742a','#ffdf00','#002776'],apron:['#009c3b','#ffdf00','#009c3b','#e8742a'],techo:['#160a06','#2e1608']},
 {id:'e_estadio',img:'08',nombre:'Estadio clásico',lugar:'Estadio cubierto, Buenos Aires',pais:'ARG',nivel:'regional',jaula:1,lona:'#d8d3c6',logo:['#3d77b0','#e8742a','#ffffff','#f6b40e'],apron:['#74acdf','#fff','#74acdf','#e8742a'],techo:['#140d06','#2e2010']},
 {id:'e_mendoza',img:'09',nombre:'Noche en Mendoza',lugar:'Bodega al aire libre, Mendoza',pais:'ARG',nivel:'regional',jaula:1,lona:'#d4cfc6',logo:['#5a1e3a','#e8742a','#f3ead2','#7a2a4a'],apron:['#5a1e3a','#e8742a','#5a1e3a','#fff'],techo:['#1a0f2a','#3a2a4a']},
 {id:'e_montevideo',img:'10',nombre:'Boliche de Montevideo',lugar:'Montevideo, Uruguay',pais:'URU',nivel:'regional',jaula:1,lona:'#d2cfe0',logo:['#2a1a5a','#ff2fd0','#f2e9ff','#27e3ff'],apron:['#ff2fd0','#27e3ff','#ff2fd0','#fff'],techo:['#0a0418','#1c0b2b']},
 {id:'e_cdmx',img:'11',nombre:'Arena México',lugar:'Ciudad de México, México',pais:'MEX',nivel:'pro',jaula:1,lona:'#d8d8d4',logo:['#004d33','#d9b24c','#f2f2ee','#ce1126'],apron:['#006847','#fff','#ce1126','#d9b24c'],techo:['#07060a','#1d1414']},
 {id:'e_medellin',img:'12',nombre:'Estadio Medellín',lugar:'Medellín, Colombia',pais:'COL',nivel:'pro',jaula:1,lona:'#d9dccf',logo:['#003893','#d9b24c','#fcd116','#ce1126'],apron:['#fcd116','#003893','#ce1126','#d9b24c'],techo:['#040818','#101a3a']},
 {id:'e_santiago',img:'13',nombre:'Arena Santiago',lugar:'Santiago, Chile',pais:'CHI',nivel:'pro',jaula:1,lona:'#d6dae0',logo:['#0039a6','#d9b24c','#ffffff','#d52b1e'],apron:['#0039a6','#fff','#d52b1e','#d9b24c'],techo:['#0a0a1a','#2a1a3a']},
 {id:'e_lima',img:'14',nombre:'Arena Lima',lugar:'Lima, Perú',pais:'PER',nivel:'pro',jaula:1,lona:'#ddd6c8',logo:['#8a1a1a','#d9b24c','#f6efe0','#d91023'],apron:['#d91023','#d9b24c','#d91023','#fff'],techo:['#140604','#2e0e08']},
 {id:'e_obelisco',img:'15',nombre:'Carpa del Obelisco',lugar:'Av. 9 de Julio, Buenos Aires',pais:'ARG',nivel:'pro',jaula:1,lona:'#d6dae0',logo:['#3d77b0','#d9b24c','#ffffff','#f6b40e'],apron:['#74acdf','#fff','#74acdf','#d9b24c'],techo:['#04070c','#101d2c']}
];
// imágenes de los escenarios nuevos (se cargan cuando hacen falta)
const escImgs={};
function escImg(E){if(!E||!E.img)return null;let o=escImgs[E.img];if(!o){o=escImgs[E.img]={f:new Image(),p:new Image()};const M=typeof ESC2_SRC!=='undefined'?ESC2_SRC:{};o.f.src=M[E.img+'-fondo']||'assets/esc2/'+E.img+'-fondo.jpg';o.p.src=M[E.img+'-piso']||'assets/esc2/'+E.img+'-piso.jpg';}
 return o.f.complete&&o.f.naturalWidth&&o.p.complete&&o.p.naturalWidth?o:null;}
const escDe=id=>ESCENARIOS.find(e=>e.id===id)||null;
const escPick=arr=>escDe(arr[Math.floor(Math.random()*arr.length)]);
const escNivel=n=>ESCENARIOS.filter(e=>e.nivel===n).map(e=>e.id);
// Carrera: arranca en la calle, después la liga regional, después ciudades; títulos y top 10 en las sedes grandes
function escenarioCarrera(){
 if(typeof C==='undefined'||!C)return escPick(escNivel('pro'));
 if(typeof sedesPromo==='function'){const L=sedesPromo();if(L)return escPick(L);}
 const top=C.title||(C.opp&&C.opp.rank!=null&&C.opp.rank<=10);
 if(top)return escPick(Math.random()<.85?escNivel('elite'):escNivel('pro'));
 return escPick(Math.random()<.75?escNivel('pro'):escNivel('elite'));
}
function escenarioTorneo(stage){return escPick(/final/i.test(stage)&&!/semi|cuartos/i.test(stage)?escNivel('elite'):[...escNivel('pro'),...escNivel('elite')]);}

/* ---------- utilidades de dibujo ---------- */
function escRng(seed){let s=seed>>>0||7;return()=>(s=(s*16807)%2147483647)/2147483647;}
const banderaCache={};
function banderita(code,w,h){
 const k=code+w+'x'+h;if(banderaCache[k])return banderaCache[k];
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;
 try{drawFlag(cv.getContext('2d'),code,w,h);}catch(e){const g=cv.getContext('2d');g.fillStyle='#888';g.fillRect(0,0,w,h);}
 return banderaCache[k]=cv;
}
// bandera con mástil (en la tribuna o en la mano de alguien)
function flamea(x,y,code,w,h){R(x-1,y,1,h+5,'#2a2a2a');c.drawImage(banderita(code,w,h),Math.round(x),Math.round(y));R(x,y+h,w,1,'rgba(0,0,0,.35)');}
// gente parada (pixel art simple): pies en y
function persona(x,y,r,alt){
 const pieles=['#f1c9a5','#e0ac7d','#c58a62','#8d5a3b','#5e3a26'],ropa=['#d20a0a','#2c5fb3','#e9e9e9','#1d1f24','#f2c14e','#3fa457','#8a3fb0','#e07a3a','#74acdf','#555b66'];
 const sk=pieles[Math.floor(r()*pieles.length)],rp=ropa[Math.floor(r()*ropa.length)],pn=r()<.5?'#2a2f3a':'#3d5a80',h=alt||Math.round(18+r()*6);
 R(x-2,y-h*.45,2,h*.45,pn);R(x+1,y-h*.45,2,h*.45,pn);
 R(x-3,y-h*.82,7,h*.4,rp);
 if(r()<.35){R(x-5,y-h*1.05,2,h*.32,sk);R(x+4,y-h*1.05,2,h*.32,sk);}else{R(x-4,y-h*.8,2,h*.3,rp);R(x+3,y-h*.8,2,h*.3,rp);}
 R(x-2,y-h,5,5,sk);R(x-2,y-h-1,5,2,['#141110','#3a2416','#6b4423','#d8b46a'][Math.floor(r()*4)]);
}
// silueta de la ciudad (en la pantalla gigante o en el horizonte)
function skyline(tipo,x0,y0,w,h,col,ven,r){
 const B=(x,ww,hh)=>{R(x0+x,y0+h-hh,ww,hh,col);if(ven)for(let yy=y0+h-hh+2;yy<y0+h-1;yy+=3)for(let xx=x0+x+1;xx<x0+x+ww-1;xx+=2)if(r()<.45)R(xx,yy,1,1,ven);};
 for(let x=0;x<w;){const ww=3+Math.floor(r()*6);B(x,ww,Math.round(h*(.2+r()*.35)));x+=ww+1;}
 const m=Math.round(w/2);
 switch(tipo){
  case'vegas':R(x0+m-12,y0+h*.12,2,h*.88,col);R(x0+m-14,y0+h*.12,6,3,col);R(x0+m-13,y0+h*.06,4,2,col);   // torre con mirador
   for(let i=0;i<8;i++)R(x0+m+4+i,y0+h-i*1.3,16-2*i,1.3,col);   // pirámide
   disc(x0+m+26,y0+h-6,6,col);break;   // esfera
  case'ny':B(m-3,6,Math.round(h*.85));R(x0+m-1,y0+h*.05,2,h*.12,col);B(m+6,5,Math.round(h*.65));B(m-12,5,Math.round(h*.7));break;
  case'abudabi':B(m-14,4,Math.round(h*.8));B(m-8,3,Math.round(h*.95));B(m+6,5,Math.round(h*.7));disc(x0+m+18,y0+h-4,5,col);R(x0+m+13,y0+h-4,11,4,col);break;
  case'riad':for(let i=0;i<Math.round(h*.95);i++){const ww=Math.max(2,Math.round(7-i*5/h));R(x0+m-ww/2,y0+h-i,ww,1,col);}R(x0+m-1,y0+h*.12,2,h*.12,ven||'#000');B(m+10,5,Math.round(h*.55));break;
  case'baires':for(let i=0;i<Math.round(h*.9);i++){const ww=i>h*.82?1:Math.max(2,Math.round(4-i*2/h));R(x0+m-ww/2,y0+h-i,ww,1,col);}break;   // obelisco
  case'rio':for(let xx=-18;xx<18;xx++){const a=Math.max(0,h*.8-Math.pow(xx+8,2)*.18),b=Math.max(0,h*.55-Math.pow(xx-9,2)*.12);R(x0+m+xx,y0+h-Math.max(a,b),1,Math.max(a,b),col);}break;   // Pan de Azúcar
  case'cdmx':R(x0+m-1,y0+h*.18,3,h*.82,col);R(x0+m-2,y0+h*.12,5,3,'#f6b40e');B(m+8,6,Math.round(h*.6));break;   // columna del Ángel
 }
}

/* ---------- fondos ---------- */
function fondoArena(E,r,flags){
 if(E.aire){   // al aire libre: cielo de noche con estrellas y la ciudad en el horizonte
  const g0=c.createLinearGradient(0,0,0,40);g0.addColorStop(0,E.techo[0]);g0.addColorStop(1,E.techo[1]);c.fillStyle=g0;c.fillRect(0,0,W,96);
  for(let i=0;i<60;i++)R(Math.floor(r()*W),Math.floor(r()*24),1,1,r()<.5?'#ffffff':'#9fb3c8');
  disc(W*.85,7,4,'#f3ecd2');disc(W*.85+2,6,4,E.techo[0]);
  skyline(E.sky,0,6,W,22,'#0a0f18','#ffd27a',r);
 }else{
  const g0=c.createLinearGradient(0,0,0,100);g0.addColorStop(0,E.techo[0]);g0.addColorStop(1,E.techo[1]);c.fillStyle=g0;c.fillRect(0,0,W,100);
  // haces de luz de colores
  E.luces.forEach((col,i)=>{const x=W*(.15+i*.35);c.globalAlpha=.1;c.fillStyle=col;c.beginPath();c.moveTo(x-3,0);c.lineTo(x+3,0);c.lineTo(x+40-i*30,96);c.lineTo(x+10-i*30,96);c.fill();c.globalAlpha=1;});
  if(E.arcos)for(let x=4;x<W;x+=22){c.strokeStyle='rgba(201,162,74,.45)';c.lineWidth=1;c.beginPath();c.moveTo(x,22);c.lineTo(x,12);c.quadraticCurveTo(x+9,0,x+18,12);c.lineTo(x+18,22);c.stroke();}
 }
 // tribuna
 const crowd=['#3a2f3a','#2c3446','#463a2c','#2f3d33','#4a2c2c','#30303a','#5a4a36'];
 for(let y=24;y<88;y+=5)for(let x=-2;x<W;x+=4){const col=crowd[Math.floor(r()*crowd.length)];R(x+Math.round(r()*2),y,3,4,shade(col,-.45+y/88*.3));R(x+1,y-1,2,2,shade('#b48a6e',-.6+r()*.2+y/300));}
 c.fillStyle=E.tinte;c.fillRect(0,20,W,70);
 // luces del techo
 for(const lx of[26,70,122,166].map(v=>Math.round(v*W/192))){const lg=c.createRadialGradient(lx,4,0,lx,4,26);lg.addColorStop(0,'rgba(255,244,214,.42)');lg.addColorStop(1,'rgba(255,244,214,0)');c.fillStyle=lg;c.fillRect(lx-28,0,56,30);if(!E.aire)R(lx-3,2,6,2,'#fff8e2');}
 // pantalla gigante con la ciudad y el nombre
 const pw=Math.min(76,Math.round(W*.3)),px=Math.round(W/2-pw/2),py=E.aire?30:18,ph=22;
 R(px-2,py-2,pw+4,ph+4,'#050608');const pg=c.createLinearGradient(0,py,0,py+ph);pg.addColorStop(0,E.pantalla[0]);pg.addColorStop(1,E.pantalla[1]);c.fillStyle=pg;c.fillRect(px,py,pw,ph);
 skyline(E.sky,px,py+3,pw,ph-9,'rgba(5,6,10,.85)',E.luces[2],r);
 R(px,py+ph-7,pw,7,'rgba(0,0,0,.6)');tDraw(E.nombre.toUpperCase(),W/2,py+ph-8,'#ffffff',5);
 // banderas colgadas del país sede
 for(const x of[W*.1,W*.9-12]){R(x+6,py-6,1,6,'#222');c.drawImage(banderita(E.pais,14,9),Math.round(x),py);}
 // banderas de la gente: del país sede y de los dos peleadores
 const cods=[E.pais,E.pais,...flags,...flags];
 for(let i=0;i<14;i++){const x=6+r()*(W-18),y=40+r()*38;if(Math.abs(x-W/2)<pw/2+4&&y<py+ph+4)continue;flamea(x,y,cods[i%cods.length],7,5);}
}
function fondoCalle(E,r,flags){
 const host=E.pais,f1=flags[0]||host,f2=flags[1]||host;
 if(E.fondo==='patio'){
  const g0=c.createLinearGradient(0,0,0,60);g0.addColorStop(0,'#5aa9e6');g0.addColorStop(1,'#b8dcf5');c.fillStyle=g0;c.fillRect(0,0,W,96);
  for(const[x,y]of[[W*.2,10],[W*.62,6],[W*.86,14]]){disc(x,y,4,'#fff');disc(x+5,y+1,5,'#fff');disc(x+10,y,3,'#fff');}
  // pared de la casa con ladrillos a la vista, ventana con reja y puerta
  R(0,28,W,68,'#d9c3a3');for(let y=30;y<96;y+=4)for(let x=(y/4%2)*5;x<W;x+=10)if(r()<.35)R(x,y,9,3,'#b5653d');
  R(0,26,W,3,'#8a7a66');
  const vx=Math.round(W*.36);R(vx,40,26,18,'#3a5168');for(let x=vx+3;x<vx+26;x+=5)R(x,40,1,18,'#1d1f24');R(vx-2,58,30,2,'#8a7a66');
  R(Math.round(W*.7),46,16,50,'#6b4423');R(Math.round(W*.7)+12,70,2,2,'#f2c14e');
  // árbol
  R(10,40,5,56,'#5b3a24');for(const[x,y,rr]of[[12,34,13],[4,42,9],[22,40,10],[13,24,9]])disc(x,y,rr,r()<.5?'#2f7a3a':'#3d8f45');
  // soga con ropa colgada
  c.strokeStyle='#ddd';c.lineWidth=1;c.beginPath();c.moveTo(24,34);c.quadraticCurveTo(W*.45,44,W*.66,32);c.stroke();
  for(let i=0;i<6;i++){const x=40+i*((W*.66-50)/6),y=37+Math.sin(i/6*Math.PI)*6;R(x,y,6+r()*4,7+r()*5,['#d20a0a','#2c5fb3','#f2c14e','#fff','#3fa457'][i%5]);}
  // parrilla con humo
  const gx=Math.round(W*.86);R(gx,62,22,34,'#9c4b2c');for(let y=64;y<96;y+=4)R(gx,y,22,1,'#7a3a22');R(gx+2,60,18,3,'#2a2a2a');
  for(let i=0;i<6;i++){c.fillStyle=`rgba(220,220,220,${.35-i*.05})`;disc(gx+10+i*2,56-i*6,3+i,c.fillStyle);}
  // banderines
  c.strokeStyle='#555';c.beginPath();c.moveTo(0,20);c.quadraticCurveTo(W/2,30,W,20);c.stroke();
  for(let x=4;x<W;x+=9){const y=20+Math.sin(x/W*Math.PI)*8.5;c.fillStyle=(x/9|0)%2?'#74acdf':'#ffffff';c.beginPath();c.moveTo(x,y);c.lineTo(x+6,y);c.lineTo(x+3,y+6);c.fill();}
  c.drawImage(banderita(host,18,12),Math.round(W*.55),44);
 }else if(E.fondo==='playa'){
  const g0=c.createLinearGradient(0,0,0,52);g0.addColorStop(0,'#3b2a6b');g0.addColorStop(.55,'#e0607a');g0.addColorStop(1,'#ffb35a');c.fillStyle=g0;c.fillRect(0,0,W,52);
  disc(W*.7,50,12,'#ffe29a');
  const sg=c.createLinearGradient(0,52,0,82);sg.addColorStop(0,'#2d6fa3');sg.addColorStop(1,'#1d4f78');c.fillStyle=sg;c.fillRect(0,52,W,30);
  R(W*.7-12,53,24,1,'#ffd27a');R(W*.7-8,56,16,1,'#ffd27a');R(W*.7-5,59,10,1,'#ffd27a');
  for(let i=0;i<30;i++)R(Math.floor(r()*W),54+Math.floor(r()*26),4+Math.floor(r()*6),1,'rgba(255,255,255,.35)');
  skyline('rio',W*.05,26,70,26,'#3a2a4a',null,r);
  R(0,80,W,16,'#d8bf86');R(0,80,W,2,'rgba(255,255,255,.6)');
  // palmeras
  for(const x of[14,W-22]){for(let i=0;i<46;i++)R(x+Math.sin(i/14)*4,40+i,3,1,'#6b4a2a');
   for(let k=0;k<6;k++){const a=k/6*Math.PI*2;for(let s=0;s<14;s++)R(x+1+Math.cos(a)*s,40+Math.sin(a)*s*.5+s*s*.04,2,2,'#2f7a3a');}}
  // red de vóley
  R(W*.3,58,1,24,'#ddd');R(W*.48,58,1,24,'#ddd');for(let y=59;y<68;y+=2)R(W*.3,y,W*.18,1,'rgba(255,255,255,.4)');
 }else if(E.fondo==='azotea'){
  const g0=c.createLinearGradient(0,0,0,70);g0.addColorStop(0,'#050812');g0.addColorStop(1,'#1c2440');c.fillStyle=g0;c.fillRect(0,0,W,96);
  for(let i=0;i<30;i++)R(Math.floor(r()*W),Math.floor(r()*20),1,1,'#cfd8e3');
  skyline('baires',0,20,W,50,'#0d111c','#ffd27a',r);
  // tanques de agua y antena
  R(W*.1,44,16,14,'#5a5f6a');R(W*.1-1,42,18,3,'#6d7380');R(W*.1+2,58,2,8,'#333');R(W*.1+12,58,2,8,'#333');
  R(W*.8,30,1,36,'#888');R(W*.8-6,34,13,1,'#888');R(W*.8-4,38,9,1,'#888');
  R(0,66,W,30,'#454953');for(let x=0;x<W;x+=12)R(x,66,1,30,'#3a3d46');R(0,66,W,2,'#5d626d');
  // guirnalda de lamparitas
  for(let x=0;x<W;x+=3){const y=14+Math.abs(Math.sin(x/W*Math.PI*3))*10;R(x,y,1,1,'#333');if(x%9===0){R(x-1,y+1,3,3,'#ffe29a');c.fillStyle='rgba(255,226,154,.18)';c.fillRect(x-4,y-2,9,9);}}
  flamea(W*.3,40,host,14,9);
 }
 // gente alrededor (atrás), con algunas banderas de los peleadores
 const base=E.fondo==='playa'?88:94;
 for(let x=-2;x<W+4;x+=7+Math.floor(r()*4))persona(x,base-Math.floor(r()*3),r);
 flamea(W*.18,base-34,f1,10,7);flamea(W*.78,base-34,f2,10,7);if(f1!==host)flamea(W*.5,base-36,host,10,7);
}
function fondoRegional(E,r,flags){
 if(E.fondo==='gimnasio'){
  R(0,0,W,96,'#cfc8ba');R(0,0,W,10,'#a99f8d');for(let x=0;x<W;x+=30)R(x,0,2,96,'#b9b1a1');
  // pósters, bolsas colgadas, banderas y reloj
  for(const[x,col]of[[W*.12,'#d20a0a'],[W*.33,'#2c5fb3'],[W*.62,'#1d1f24']]){R(x,16,18,24,col);R(x+2,18,14,9,'#e9e9e9');R(x+3,30,12,2,'#f2c14e');}
  for(const x of[W*.05,W*.48,W*.9]){R(x+3,10,1,10,'#444');R(x,20,8,22,'#8b1c1c');R(x,20,8,2,'#5a1010');R(x+1,40,6,2,'#5a1010');}
  disc(W*.8,20,5,'#fff');R(W*.8,17,1,4,'#111');R(W*.8,20,3,1,'#111');
  c.drawImage(banderita(E.pais,20,13),Math.round(W*.72),30);
  // sillas plegables con gente
  for(let x=2;x<W;x+=9){persona(x+Math.round(r()*2),80,r,16);R(x-3,80,9,2,'#555');}
  R(0,82,W,6,'#7a7262');
  flags.forEach((f,i)=>flamea(W*(.3+i*.4),56,f,9,6));
 }else{   // galpón: chapa, lámparas colgando y gente parada atrás del alambrado
  R(0,0,W,96,'#2a2c30');for(let x=0;x<W;x+=4)R(x,0,2,96,'#33363c');
  for(const x of[W*.2,W*.5,W*.8]){R(x,0,1,12,'#111');R(x-4,12,9,3,'#3a3a3a');
   c.fillStyle='rgba(255,226,154,.12)';c.beginPath();c.moveTo(x-4,15);c.lineTo(x+5,15);c.lineTo(x+26,96);c.lineTo(x-25,96);c.fill();R(x-2,15,5,1,'#ffe29a');}
  for(let x=-2;x<W+4;x+=6+Math.floor(r()*4))persona(x,86,r);
  for(let y=34;y<88;y++)for(let x=0;x<W;x++)if((x+y)%6===0||(x-y+600)%6===0){c.fillStyle='rgba(160,165,170,.25)';c.fillRect(x,y,1,1);}
  R(W*.05,70,14,16,'#1c1c1c');disc(W*.05+7,70,7,'#1c1c1c');disc(W*.05+7,70,3,'#2a2c30');
  flamea(W*.4,28,E.pais,14,9);flags.forEach((f,i)=>flamea(W*(.25+i*.5),44,f,9,6));
 }
}
function sueloCalle(E,r){
 if(E.suelo==='pasto'){R(0,96,W,H-96,'#5f8f3a');for(let i=0;i<220;i++)R(Math.floor(r()*W),96+Math.floor(r()*48),1,2,r()<.5?'#4c7a2c':'#78a84a');
  c.fillStyle='rgba(120,90,50,.45)';c.beginPath();c.ellipse(W/2,122,W*.33,14,0,0,Math.PI*2);c.fill();}
 else if(E.suelo==='arena'){const g=c.createLinearGradient(0,96,0,H);g.addColorStop(0,'#d8bf86');g.addColorStop(1,'#ecd9a8');c.fillStyle=g;c.fillRect(0,96,W,H-96);
  for(let i=0;i<160;i++)R(Math.floor(r()*W),96+Math.floor(r()*48),1,1,r()<.5?'#c9ad70':'#f5e6bf');for(let i=0;i<10;i++)R(Math.floor(r()*W),100+Math.floor(r()*40),3,1,'rgba(0,0,0,.08)');}
 else{R(0,96,W,H-96,'#7c7f86');for(let i=0;i<40;i++)R(Math.floor(r()*W),96+Math.floor(r()*48),2+Math.floor(r()*8),1,'rgba(0,0,0,.1)');
  c.strokeStyle='rgba(240,240,240,.55)';c.lineWidth=1;c.beginPath();c.ellipse(W/2,121,W*.36,15,0,0,Math.PI*2);c.stroke();
  c.fillStyle='rgba(30,40,60,.25)';c.beginPath();c.ellipse(W*.2,132,14,3,0,0,Math.PI*2);c.fill();}
}
// Escenarios con imágenes, vista de costado vieja (piso y algunas pantallas): fondo arriba y piso aplastado abajo
function fondoImg(E,r){
 const IM=escImg(E);
 if(!IM){R(0,0,W,H,(E.techo||['#111'])[0]);const o=escImgs[E.img];if(o&&!o.esp){o.esp=1;const re=()=>{if(escImg(E)&&typeof G!=='undefined'&&G&&G.esc===E)bgS=buildBg();};o.f.addEventListener('load',re);o.p.addEventListener('load',re);}return;}
 const f=IM.f,sw=Math.min(f.width,f.height*W/96);c.imageSmoothingEnabled=true;
 c.drawImage(f,(f.width-sw)/2,0,sw,f.height,0,0,W,96);
 if(!E.jaula){const p=IM.p;c.drawImage(p,0,p.height*.3,p.width,p.height*.4,0,96,W,H-96);}
 c.imageSmoothingEnabled=false;
 if(E.jaula)jaulaYLona(E,r);
}
// La jaula y la lona (para los escenarios con octágono)
function jaulaYLona(E,r){
 const op0=E.apron;
 for(let y=15;y<88;y++)for(let x=0;x<W;x++)if((x+y)%5===0||(x-y+600)%5===0){c.fillStyle='rgba(130,140,155,.22)';c.fillRect(x,y,1,1);}
 R(0,13,W,3,'#0b0d12');R(0,13,W,1,'#454c59');
 for(const px of[.104,.365,.635,.896].map(v=>Math.round(v*W))){R(px-2,13,5,76,'#08090c');R(px-1,13,1,76,'#353b46');R(px-3,12,7,4,'#15181e');}
 R(0,86,W,10,'#0d0f14');R(0,86,W,1,'#454c59');R(0,95,W,1,'#04050a');
 [[28,0],[50,1],[82,2],[100,3],[130,0],[148,1]].forEach(([x,i])=>{x=Math.round(x*W/192);const col=op0[i];R(x,88,14,5,col);R(x+2,90,10,1,shade(col,-.5));});
 const mg=c.createLinearGradient(0,96,0,H);mg.addColorStop(0,shade(E.lona,-.2));mg.addColorStop(.35,E.lona);mg.addColorStop(1,shade(E.lona,.08));c.fillStyle=mg;c.fillRect(0,96,W,H-96);
 for(let i=0;i<14;i++){const y=100+Math.floor(r()*44),x=Math.floor(r()*W);R(x,y,8+Math.floor(r()*16),1,'rgba(0,0,0,.05)');}
 const op=octPts(W/2,121,W*.45,22);for(let i=0;i<8;i++){const a=op[i],b=op[(i+1)%8];limb(a[0],a[1],b[0],b[1],2,2,'rgba(70,74,82,.55)');}
 const L=E.logo;polyFill(octPts(W/2,124,30,7.5),L[0]);polyFill(octPts(W/2,124,25,6),L[1]);polyFill(octPts(W/2,124,17,4),L[2]);polyFill(octPts(W/2,124,9,2),L[3]);
 for(const side of[-1,1]){
  const x0=side<0?20:W-20,xf=x0+side*-46;
  c.save();c.beginPath();c.moveTo(x0,13);c.lineTo(xf,-6);c.lineTo(xf,H+20);c.lineTo(x0,96);c.closePath();c.clip();
  c.fillStyle='rgba(6,8,12,.12)';c.fillRect(0,0,W,H);
  for(let y=0;y<H;y++)for(let x=side<0?0:x0;x<(side<0?x0:W);x++)if((x+y)%4===0||(x-y+600)%4===0){c.fillStyle='rgba(150,160,175,.28)';c.fillRect(x,y,1,1);}
  c.restore();
  limb(x0,96,xf,H+22,6,9,'#0b0d12');limb(x0,95,xf,H+20,1,1,'#454c59');limb(x0,14,xf,-5,3,4,'#0b0d12');
  R(x0-2,12,5,85,'#08090c');R(x0-1,12,1,85,'#353b46');
 }
}
// Escenario actual (el de la pelea en curso, o Las Vegas en los menús)
function escActual(){return(typeof G!=='undefined'&&G&&G.esc)||escDe('vegas');}
function escFlags(){if(typeof G==='undefined'||!G)return['USA'];return[...new Set([G.p.d.flag,G.r.d.flag].filter(Boolean))];}
