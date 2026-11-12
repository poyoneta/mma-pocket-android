/* ---------------- Pelea rápida ---------------- */
// Retrato chico (cabeza y torso) de un peleador en un canvas de 56x48
function drawPortrait(cnv,d,face){const x=cnv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#10141c';x.fillRect(0,0,56,48);const prev=c;c=x;blitFighter({d,hp:100},{pose:'guard',bob:0},face>0?22:34,88,face,0);c=prev;}
// La pantalla de elección (estilo VS) está en js/fichas.js
let selP=null,selR=null,qDiv='ligero';

/* ---------------- Generador de peleadores ---------------- */
const GEN={
 first:['Matías','Lautaro','Facundo','Bruno','Thiago','Rodrigo','Santiago','Leandro','Gonzalo','Iván','Marcos','Rafael','João','Pedro','Andrés','Sergio','Omar','Kofi','Liam','Mateus','Emre','Arman','Tariq','Niko','Viktor','Hugo','Luca','Kai','Kenta','Aleksei','Franco','Emiliano'],
 last:['González','Rodríguez','Fernández','López','Sosa','Acosta','Benítez','Silva','Santos','Oliveira','Costa','Morales','Herrera','Vargas','Castro','Ivanov','Petrenko','Nakamura','Tanaka','Walker','Okafor','Mensah','Yilmaz','Kaya','Novak','Rossi','Moreau','Kowalski','Quiroga','Ledesma'],
 nick:['El Tanque','La Pantera','Rayo','El Muro','Tornado','El Lobo','Cobra','Dinamita','El Martillo','Huracán','El Puma','Trueno','El Zurdo','Bala','Tigre','Granito','El Cacique','Pitbull','Cuervo','Vikingo','El Halcón','Samurái','Terremoto','El Gringo','Chispa','Muralla'],
 flag:['ARG','BRA','URU','CHI','MEX','COL','PER','PAR','USA','RUS','JPN','NGA','TUR','POL','ITA','FRA','ESP','KAZ','IRL','GHA'],
 skins:['#f3d2b3','#eac39e','#dcb08a','#c58b62','#a8714a','#8a5a3b','#6e4430','#4f3022'],
 hairs:['#0e0a08','#1b1410','#3a2416','#5a3a22','#8a5a2b','#c9a36b','#b0441e','#cfc6b6'],
 hairStyles:['short','buzz','bald','mohawk','long','curly','afro','ponytail','topknot','sidecut'],
 beards:['none','none','full','goatee','stache','stubble'],
 shorts:['#c8202f','#1d4fa3','#16181d','#f4f4f4','#1d7a46','#6b2d8f','#e07a1f','#74b9e8','#f6d32d','#7a1f2b','#2f6f73'],
 trims:['#ffffff','#d4af37','#16181d','#e74c3c','#2e8b57','#fcd116','#3b7be2'],
 gloves:['#2c2f37','#2c2f37','#b8202a','#1d4fa3','#e9e9e9','#c99a1a','#6b2d8f'],
 tapes:['#d8d9dc','#f0f0f0','#2a2d33','#c23b3b','#3b6fc2'],
 bands:['#9aa0a8','#c8202f','#1d4fa3','#d4af37']
};
const ARCH=[
 ['Striker',{str:80,pow:80,spd:72,wre:55,tdd:65,bjj:50,car:72,chin:74}],
 ['Lucha libre',{str:64,pow:62,spd:66,wre:90,tdd:86,bjj:72,car:88,chin:78}],
 ['Jiu-jitsu',{str:60,pow:58,spd:68,wre:72,tdd:58,bjj:92,car:76,chin:70}],
 ['Kickboxing',{str:86,pow:68,spd:88,wre:52,tdd:72,bjj:55,car:82,chin:64}],
 ['Pegador',{str:70,pow:92,spd:58,wre:60,tdd:60,bjj:45,car:60,chin:88}],
 ['Completo',{str:76,pow:72,spd:76,wre:75,tdd:75,bjj:74,car:82,chin:76}],
 ['Muay thai',{str:82,pow:78,spd:74,wre:58,tdd:70,bjj:52,car:84,chin:78}],
 ['Sambo',{str:66,pow:70,spd:64,wre:84,tdd:78,bjj:82,car:74,chin:74}]
];
// Peleador al azar (todas las divisiones son masculinas)
const generoDe=()=>'m';
function randFighter(g,div){
 g='m';
 const[style,base]=pick(ARCH),s={};for(const k in base)s[k]=clamp(Math.round(base[k]+rand(-8,8)),35,97);
 // los pesados pegan más y son más lentos; los livianos al revés
 const D=div&&DIVISIONES.find(x=>x.id===div);if(D){const w=(D.lb-115)/150;s.pow=clamp(Math.round(s.pow+(w-.4)*14),35,97);s.spd=clamp(Math.round(s.spd-(w-.4)*14),35,97);s.car=clamp(Math.round(s.car-(w-.4)*10),35,97);}
 const first=pick(GEN.first),last=pick(GEN.last),CBx=typeof CUERPO_BASE==='undefined'?null:CUERPO_BASE;
 const si=CBx?Math.floor(rnd()*CBx.shorts.length):null,sh=CBx?CBx.shorts[si][4]:pick(GEN.shorts);
 const look={skin:pick(GEN.skins),shorts:sh,short:si,guante:CBx?pick([0,0,0,1,2,3,4]):0,peinado:CBx?(rnd()<.1?-1:Math.floor(rnd()*CBx.pelos.length)):null,pelo:rnd()<.7?null:pick(['#141110','#3a2416','#6b4423','#a8743a','#d8b46a','#b5502a'])};
 const f={name:first+' '+last,first,last,nick:`"${pick(GEN.nick)}"`,flag:pick(GEN.flag),style,s,look,g};
 if(div)f.div=div;return f;
}

let gens=[];
function renderGen(){
 gens=Array.from({length:6},randFighter);
 $('#ggrid').innerHTML=gens.map((f,i)=>`<div class="gcard"><canvas width="72" height="100" data-gi="${i}" aria-label="${f.name}"></canvas><div class="nm">${f.name}</div><div class="nick">${f.nick}</div><div class="meta">${f.flag} · ${f.style}</div><div class="gbtns"><button class="gb-p" data-use="p" data-gi="${i}">VOS</button><button class="gb-r" data-use="r" data-gi="${i}">RIVAL</button></div></div>`).join('');
}
$('#ggrid').addEventListener('click',e=>{
 const b=e.target.closest('[data-use]');if(!b)return;const f=gens[+b.dataset.gi];
 if(!allFighters().includes(f)){f.div=qDiv==='todas'?'ligero':qDiv;EXTRA.push(f);}
 if(b.dataset.use==='p'){selP=f;if(selR===f)selR=null;}else{selR=f;if(selP===f)selP=null;}
 renderMenu();$('#quick').scrollTo({top:0,behavior:'smooth'});
});
$('#regen').onclick=renderGen;
// Secuencia de poses para las animaciones de los menús
const SEQ=[['guard',1.1],['jab',.3],['guard',.5],['cross',.3],['guard',.8],['high',.45],['guard',.6],['upper',.3]],SEQT=SEQ.reduce((a,b)=>a+b[1],0);
function seqPose(t){let x=t%SEQT;for(const[p,d]of SEQ){if(x<d)return p;x-=d;}return'guard';}
// Dibuja un peleador animado en un canvas cualquiera
function drawAnimated(g,f,x,gy,face,pose,t,bg){
 if(bg){g.fillStyle=bg;g.fillRect(0,0,g.canvas.width,g.canvas.height);}
 g.imageSmoothingEnabled=false;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-18,gy-1,36,3);
 const prev=c;c=g;blitFighter({d:f,hp:100},{pose,act:pose==='jab'?'jab':'cross',bob:Math.sin(t*4.5)},x,gy,face,0);c=prev;
}
function drawGen(t){
 document.querySelectorAll('#ggrid canvas').forEach(cv=>{const i=+cv.dataset.gi,f=gens[i];if(f)drawAnimated(cv.getContext('2d'),f,26,96,1,seqPose(t+i*.73),t+i,'#10141c');});
}
