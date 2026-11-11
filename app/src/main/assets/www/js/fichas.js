/* ---------------- Fichas de peleadores y pantalla de elección (estilo VS) ---------------- */
const PAISES={ARG:'Argentina',BRA:'Brasil',URU:'Uruguay',CHI:'Chile',PAR:'Paraguay',BOL:'Bolivia',PER:'Perú',COL:'Colombia',VEN:'Venezuela',ECU:'Ecuador',MEX:'México',USA:'EE.UU.',CAN:'Canadá',ESP:'España',ITA:'Italia',FRA:'Francia',IRL:'Irlanda',ENG:'Inglaterra',POL:'Polonia',RUS:'Rusia',KAZ:'Kazajistán',TUR:'Turquía',NGA:'Nigeria',GHA:'Ghana',JPN:'Japón',CHN:'China',KOR:'Corea del Sur',AUS:'Australia',NZL:'Nueva Zelanda',GEO:'Georgia',CMR:'Camerún',BUL:'Bulgaria',MAR:'Marruecos'};
const CIUDADES={ARG:['Buenos Aires','Córdoba','Rosario','Mar del Plata','La Plata','Mendoza','Tucumán'],BRA:['Río de Janeiro','São Paulo','Curitiba','Manaos','Salvador'],URU:['Montevideo','Salto'],CHI:['Santiago','Valparaíso'],MEX:['Ciudad de México','Tijuana','Guadalajara'],COL:['Medellín','Bogotá','Cali'],PER:['Lima','Arequipa'],PAR:['Asunción'],BOL:['La Paz'],VEN:['Caracas'],ECU:['Quito'],USA:['Las Vegas','Denver','Albuquerque','San Diego','Miami'],CAN:['Montreal','Toronto'],RUS:['Moscú','Grozni','Majachkalá'],JPN:['Tokio','Osaka'],NGA:['Lagos'],TUR:['Estambul'],POL:['Varsovia','Cracovia'],ITA:['Roma','Milán'],FRA:['París','Marsella'],ESP:['Madrid','Barcelona'],KAZ:['Almatý'],IRL:['Dublín'],GHA:['Acra'],ENG:['Londres','Liverpool','Manchester'],AUS:['Sídney','Perth'],GEO:['Tiflis'],KOR:['Seúl'],NZL:['Auckland'],CMR:['Duala'],BUL:['Sofía'],MAR:['Casablanca'],CHN:['Pekín']};
const GIMNASIOS=['Las Vegas, EE.UU.','Albuquerque, EE.UU.','Coconut Creek, EE.UU.','Denver, EE.UU.','Río de Janeiro, Brasil','Buenos Aires, Argentina','Córdoba, Argentina','Londres, Inglaterra','Sídney, Australia','Ciudad de México, México','Majachkalá, Rusia','Montreal, Canadá'];

function hashStr(s){let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
// Ficha del peleador. Los inventados se completan solos (siempre igual para el mismo nombre).
// Si el peleador trae "bio" (altura, alcance, edad, récord), se usa eso.
function bio(f){
 const b=f.bio||{},div=fDiv(f),lb=(DIVISIONES.find(d=>d.id===div)||{lb:155}).lb,kg=Math.round(lb*.4536);
 const apodo=(f.nick||'').replace(/"/g,'')||'—';
 let h=hashStr(f.name);const r=()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return(h>>>0)/4294967296;};
 const hr=(DIVISIONES.find(d=>d.id===div)||{alt:[170,180]}).alt,alt=Math.round(hr[0]+r()*(hr[1]-hr[0])),cs=CIUDADES[f.flag]||['—'];
 const rk=f.custom?16:(f.rank??12),w=Math.round(9+(15-Math.min(15,rk))*1.1+r()*6),l=Math.round(1+r()*4+rk*.2),d=r()<.25?1:0;
 return{apodo,edad:b.edad||23+Math.floor(r()*13),altura:(b.altura||alt)+' cm',peso:kg+' kg',alcance:(b.alcance||alt+Math.round(r()*9-2))+' cm',
  posicion:b.posicion||(r()<.75?'Ortodoxo':'Zurdo'),ciudad:b.ciudad||`${cs[Math.floor(r()*cs.length)]}, ${PAISES[f.flag]||f.flag}`,
  procedencia:b.procedencia||GIMNASIOS[Math.floor(r()*GIMNASIOS.length)],record:b.record||(f.custom?'0-0-0':`${w}-${l}-${d}`)};
}
const ratings=f=>{const s=f.s;return[['GOLPE',(s.str+s.pow+s.spd)/3],['GRAPPLING',(s.wre+s.tdd+s.bjj)/3],['CARDIO',s.car],['MENTÓN',s.chin]].map(([k,v])=>[k,Math.round(v)]);};
const firstName=f=>(f.first||f.name.replace(new RegExp('\\s*'+f.last.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'),'')).trim();

/* ---------- Banderas (dibujos simples con los colores de cada país) ---------- */
const FLAGS_H={ARG:['#74acdf','#fff','#74acdf'],RUS:['#fff','#0039a6','#d52b1e'],BUL:['#fff','#00966e','#d62612'],GHA:['#ce1126','#fcd116','#006b3f'],PAR:['#d52b1e','#fff','#0038a8'],BOL:['#d52b1e','#f9e300','#007934'],VEN:['#ffcc00','#00247d','#cf142b'],COL:['#fcd116','#fcd116','#003893','#ce1126'],ECU:['#ffdd00','#ffdd00','#034ea2','#ed1c24'],POL:['#fff','#dc143c'],ESP:['#aa151b','#f1bf00','#f1bf00','#aa151b'],KAZ:['#00afca']};
const FLAGS_V={FRA:['#0055a4','#fff','#ef4135'],ITA:['#009246','#fff','#ce2b37'],IRL:['#169b62','#fff','#ff883e'],NGA:['#008751','#fff','#008751'],MEX:['#006847','#fff','#ce1126'],PER:['#d91023','#fff','#d91023'],CMR:['#007a5e','#ce1126','#fcd116'],CAN:['#d52b1e','#fff','#fff','#d52b1e']};
function drawFlag(g,code,w,h){
 g.clearRect(0,0,w,h);const F=(c,x,y,ww,hh)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh);};
 const disc=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
 if(FLAGS_H[code]){const L=FLAGS_H[code];L.forEach((c,i)=>F(c,0,i*h/L.length,w,h/L.length+1));if(code==='ARG'||code==='KAZ')disc(w/2,h/2,h*.13,'#f6b40e');}
 else if(FLAGS_V[code]){const L=FLAGS_V[code];L.forEach((c,i)=>F(c,i*w/L.length,0,w/L.length+1,h));if(code==='CAN')F('#d52b1e',w*.42,h*.3,w*.16,h*.4);if(code==='CMR')disc(w/2,h/2,h*.1,'#fcd116');}
 else switch(code){
  case'BRA':F('#009c3b',0,0,w,h);g.fillStyle='#ffdf00';g.beginPath();g.moveTo(w/2,h*.1);g.lineTo(w*.92,h/2);g.lineTo(w/2,h*.9);g.lineTo(w*.08,h/2);g.fill();disc(w/2,h/2,h*.22,'#002776');break;
  case'URU':for(let i=0;i<9;i++)F(i%2?'#0038a8':'#fff',0,i*h/9,w,h/9+1);F('#fff',0,0,w*.4,h*5/9);disc(w*.2,h*.27,h*.14,'#fcd116');break;
  case'CHI':F('#fff',0,0,w,h/2);F('#d52b1e',0,h/2,w,h/2);F('#0039a6',0,0,w/3,h/2);disc(w/6,h/4,h*.08,'#fff');break;
  case'USA':for(let i=0;i<13;i++)F(i%2?'#fff':'#b22234',0,i*h/13,w,h/13+1);F('#3c3b6e',0,0,w*.42,h*7/13);break;
  case'JPN':F('#fff',0,0,w,h);disc(w/2,h/2,h*.3,'#bc002d');break;
  case'KOR':F('#fff',0,0,w,h);disc(w/2,h/2,h*.25,'#cd2e3a');g.fillStyle='#0047a0';g.beginPath();g.arc(w/2,h/2,h*.25,0,Math.PI);g.fill();break;
  case'TUR':F('#e30a17',0,0,w,h);disc(w*.4,h/2,h*.25,'#fff');disc(w*.45,h/2,h*.2,'#e30a17');break;
  case'CHN':F('#de2910',0,0,w,h);disc(w*.18,h*.28,h*.12,'#ffde00');break;
  case'MAR':F('#c1272d',0,0,w,h);disc(w/2,h/2,h*.14,'#006233');disc(w/2,h/2,h*.09,'#c1272d');break;
  case'ENG':F('#fff',0,0,w,h);F('#ce1124',w*.44,0,w*.12,h);F('#ce1124',0,h*.4,w,h*.2);break;
  case'GEO':F('#fff',0,0,w,h);F('#ff0000',w*.44,0,w*.12,h);F('#ff0000',0,h*.4,w,h*.2);break;
  case'AUS':case'NZL':F('#012169',0,0,w,h);F('#fff',0,h*.2,w*.5,h*.1);F('#fff',w*.2,0,w*.1,h*.5);F('#c8102e',0,h*.22,w*.5,h*.06);F('#c8102e',w*.22,0,w*.06,h*.5);disc(w*.75,h*.65,h*.07,code==='NZL'?'#c8102e':'#fff');disc(w*.82,h*.3,h*.05,code==='NZL'?'#c8102e':'#fff');break;
  default:F('#8a8f99',0,0,w,h);F('#6f747e',0,h*.5,w,h*.5);
 }
}

/* ---------- Pantalla de elección ---------- */
let vsTab=0;
const ROWS=[['apodo','Apodo'],['edad','Edad'],['altura','Altura'],['peso','Peso'],['alcance','Alcance'],['posicion','Posición'],['ciudad','Ciudad natal'],['procedencia','Procedencia']];
function ringSVG(label,v,best){
 const R=22,C=2*Math.PI*R,col=v>=90?'#2fb45a':v>=80?'#e2b23a':'#8c929e';
 return`<div class="ring ${best?'best':''}"><svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="${R}" fill="#fff" stroke="#d3d6dc" stroke-width="4"/><circle cx="28" cy="28" r="${R}" fill="none" stroke="${col}" stroke-width="4" stroke-dasharray="${C*v/100} ${C}" transform="rotate(-90 28 28)" stroke-linecap="round"/><text x="28" y="34" text-anchor="middle">${v}</text></svg><span>${label}</span></div>`;
}
function infoHtml(f){
 const b=bio(f),rt=ratings(f),mx=Math.max(...rt.map(r=>r[1]));
 return`<table class="ficha"><tbody>${ROWS.map(([k,l])=>`<tr><th>${l}</th><td>${esc(String(b[k]))}</td></tr>`).join('')}</tbody></table>
  <div class="rings">${rt.map(([k,v])=>ringSVG(k,v,v===mx)).join('')}</div>`;
}
function renderMenu(){
 const list=fightersOf(qDiv);
 if(!list.includes(selP))selP=list[0];
 if(!list.includes(selR)||selR===selP)selR=list.find(f=>f!==selP)||allFighters().find(f=>f!==selP);
 for(const[side,f]of[['p',selP],['r',selR]]){
  $(`#${side}First`).textContent=firstName(f).toUpperCase();$(`#${side}Name`).textContent=f.last.toUpperCase();
  const b=bio(f);$(`#${side}Rec`).textContent=`${b.record}${rankTxt(f)?' · '+rankTxt(f):''}`;
  $(`#${side}Nick`).textContent=`${divName(fDiv(f))} · ${f.style}`;
  drawFlag($(`#${side}Flag`).getContext('2d'),f.flag,24,16);
  drawFlag($(`#vf${side==='p'?'P':'R'}`).getContext('2d'),f.flag,48,32);
 }
 $('#vsInfoP').innerHTML=infoHtml(selP);$('#vsInfoR').innerHTML=infoHtml(selR);
 const a=selP.s,b=selR.s;
 $('#tape').innerHTML=`<div class="tape-h"><b>${esc(selP.last.toUpperCase())}</b><span>TALE OF THE TAPE</span><b>${esc(selR.last.toUpperCase())}</b></div>`+STATS.map(([k,l])=>`<div class="trow"><span class="v ${a[k]>b[k]?'hi':''}">${a[k]}</span><div class="bar l"><i style="width:${a[k]}%"></i></div><span class="lab">${l}</span><div class="bar r"><i style="width:${b[k]}%"></i></div><span class="v ${b[k]>a[k]?'hi':''}">${b[k]}</span></div>`).join('');
 setVsTab(vsTab);
}
function setVsTab(i){
 vsTab=(i+2)%2;$('#vsInfo').hidden=vsTab!==0;$('#vsStats').hidden=vsTab!==1;
 $('#tabName').textContent=vsTab?'ESTADÍSTICAS':'INFORMACIÓN GRAL';
 document.querySelectorAll('.vs-tabname .dots i').forEach((d,k)=>d.classList.toggle('on',k===vsTab));
}
function cycle(side,d){
 let list=fightersOf(qDiv);if(list.length<2)list=allFighters();
 const n=list.length,cur=side==='p'?selP:selR,other=side==='p'?selR:selP;
 let i=list.indexOf(cur);do{i=(i+d+n)%n;}while(list[i]===other);
 if(side==='p')selP=list[i];else selR=list[i];renderMenu();
}
$('#pPrev').onclick=()=>cycle('p',-1);$('#pNext').onclick=()=>cycle('p',1);$('#rPrev').onclick=()=>cycle('r',-1);$('#rNext').onclick=()=>cycle('r',1);
$('#tabPrev').onclick=()=>setVsTab(vsTab-1);$('#tabNext').onclick=()=>setVsTab(vsTab+1);
$('#go').onclick=()=>startFight(selP,selR,{kind:'quick',rounds:3});
// Teclado en la pantalla de elección
document.addEventListener('keydown',e=>{
 if(curScreen!=='quick'||!$('#ov').hidden||G)return;
 if(e.target.closest&&e.target.closest('input,select,textarea'))return;
 const k=e.key;
 if(k==='ArrowLeft'||k==='ArrowRight'){cycle('p',k==='ArrowLeft'?-1:1);e.preventDefault();}
 else if(k==='ArrowUp'||k==='ArrowDown'){cycle('r',k==='ArrowUp'?-1:1);e.preventDefault();}
 else if(k==='q'||k==='Q')setVsTab(vsTab-1);else if(k==='e'||k==='E')setVsTab(vsTab+1);
 else if(k==='Enter'&&!(e.target.closest&&e.target.closest('#ggrid,#regen'))){e.preventDefault();$('#go').click();}
});
// Peleadores grandes animados
function drawVS(t){
 const P=$('#vsP').getContext('2d'),Rr=$('#vsR').getContext('2d');
 for(const[g,f,face,off]of[[P,selP,1,0],[Rr,selR,-1,1.3]]){if(!f)continue;g.clearRect(0,0,110,128);g.imageSmoothingEnabled=false;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(30,124,50,3);const prev=c;c=g;blitFighter({d:f,hp:100},{pose:'guard',bob:Math.sin(t*4+off)},55,126,face,0);c=prev;}
}
