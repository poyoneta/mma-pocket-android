/* ---------------- Modo carrera (estilo del juego oficial) ----------------
   Ciclo: OFERTAS de pelea → CAMPAMENTO de varias semanas → NOCHE DE PELEA → resultado → ofertas…
   Cada semana tenés TIEMPO para repartir: entrenar, sparring (se juega o se simula), redes sociales,
   invitar a otro peleador, estudiar al rival o descansar.
   - FORMA (fitness): llegás a la pelea en tu pico (zona verde) y peleás al 100 %. Si te pasás, riesgo de lesión.
   - HYPE y FANS: suben con las redes y las victorias; el hype aumenta la bolsa.
   - PUNTOS DE EVOLUCIÓN: se ganan entrenando y peleando; se gastan en atributos.
   - DESGASTE (longevidad): cada pelea gasta el cuerpo; cuanto más gastado, menos mentón.
   - CONTRATO con bonos, DESAFÍOS de los fans, HITOS de la carrera.
   Todo se guarda en este navegador. */
let C=store.get('career',null),kPick=null,kDiv='ligero',kTab='inicio',kSel=null,kLog=[];
const saveC=()=>store.set('career',C);
const rankLabel=k=>{const d=divName(k.div||'ligero').toUpperCase();return k.champ?`CAMPEÓN · ${d}`:k.rank>=16?`SIN RANKING · ${d}`:`#${k.rank} · ${d}`;};
const oppRank=f=>f.rank===0?'CAMPEÓN':f.rank>=16?'Sin ranking':`#${f.rank}`;
const statName=k=>STATS.find(x=>x[0]===k)[1];
const fmtMoney=n=>n>=1e6?`US$ ${(n/1e6).toFixed(n>=1e7?0:2).replace('.',',')}M`:`US$ ${Math.round(n/1e3)}K`;
const fmtNum=n=>n>=1e6?(n/1e6).toFixed(2).replace('.',',')+'M':n>=1e3?(n/1e3).toFixed(1).replace('.',',')+'K':String(Math.round(n));
const fmtDate=ms=>new Date(ms).toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const handle=f=>'@'+(f.last||f.name).normalize('NFD').replace(/[^A-Za-z]/g,'').toLowerCase();
const TIEMPO=10;   // horas-bloque por semana
// Entrenamientos: [nombre, descripción, atributos que suben con los puntos]
const ENTRENOS=[
 ['Boxeo','Manos más rápidas y precisas',['str','spd']],
 ['Patadas','Potencia de piernas y golpes',['pow','str']],
 ['Lucha','Derribos y defensa de derribo',['wre','tdd']],
 ['Jiu-jitsu','Sumisiones y juego de piso',['bjj','wre']],
 ['Cardio','Aguantar los 5 rounds',['car']],
 ['Fuerza','Pegar más fuerte y bancar golpes',['pow','chin']]
];
const ACCIONES={
 entrenar:{n:'Entrenar',c:3,d:'Sube la forma y da puntos de evolución.'},
 sparring:{n:'Sparring',c:4,d:'Un round con un compañero. Jugalo para ganar más puntos.'},
 redes:{n:'Redes sociales',c:1,d:'Publicá algo: sube el hype y los fans.'},
 invitar:{n:'Invitar a un peleador',c:3,d:'Entrená con alguien de la división y aprendé de su fuerte.'},
 estudiar:{n:'Estudiar al rival',c:2,d:'Mirás videos: ves sus atributos y peleás mejor contra él (+3 %).'},
 descansar:{n:'Descansar',c:2,d:'Baja un poco la forma pero cura lesiones y recupera desgaste.'}
};
// Retos que proponen los fans antes de cada pelea
const RETOS=[
 ['ko','Ganá por KO o TKO',r=>r.w==='p'&&/KO/.test(r.method)],
 ['sub','Ganá por sumisión',r=>r.w==='p'&&r.method==='Sumisión'],
 ['r1','Ganá en el primer round',r=>r.w==='p'&&r.round===1&&!/Decisión/.test(r.method)],
 ['dec','Ganá yendo a la decisión',r=>r.w==='p'&&/Decisión/.test(r.method)],
 ['fin','Terminá la pelea antes del final',r=>r.w==='p'&&!/Decisión/.test(r.method)]
];
// Gimnasios (mejoran los puntos que da entrenar y bajan el riesgo de lesión)
const GYMS=[['Gimnasio del barrio',0,1],['Academia regional',150000,1.25],['Centro de alto rendimiento',600000,1.5],['Equipo de élite',2000000,1.8]];
const CONDS={ganar:'si ganás',fin:'si ganás por KO o sumisión',titulo:'en peleas por el título'};
const edadDe=()=>Math.floor((C.ageBase||24)+(C.date-(C.start||C.date))/(365*864e5));
const regional=()=>(C.org||'uw')!=='uw';   // fuera de UW no hay ranking
const REG_WINS=3;   // victorias en la liga regional para conseguir contrato
// Legado: puntaje de toda la carrera
function legado(){const fins=C.hist.filter(h=>h.res==='p'&&!/Decisión/.test(h.method)).length;
 const p=Math.round(C.rec.w*10+fins*6+C.titles*120+C.defenses*45+(C.belts||[]).length*80+Math.min(150,C.fans/8000)-C.rec.l*4);
 const t=p>=900?'GOAT':p>=550?'LEYENDA':p>=300?'CAMPEÓN DE ÉPOCA':p>=150?'CONTENDIENTE':p>=50?'PROMESA':'DEBUTANTE';return[Math.max(0,p),t];}
const CUENTAS=[['Pocket MMA','@pocketmma','org'],['El Profe MMA','@elprofemma','pro'],['Noticias del octágono','@octagononews','pro'],['Fan del barrio','@fan_de_la_jaula','fan']];

function applyGain(s,g){const out=[];for(const k in g){const add=s[k]>=90?1:g[k],nv=Math.min(99,s[k]+add);if(nv>s[k])out.push(`${statName(k)} +${nv-s[k]}`);s[k]=nv;}return out;}
function genOpp(rank,nivel){
 const f=randFighter(null,C?C.div:'ligero'),target=nivel||(rank===0?88:60+(16-rank)*1.7),vals=Object.values(f.s),m=vals.reduce((a,c)=>a+c,0)/vals.length;
 for(const k in f.s)f.s[k]=clamp(Math.round(f.s[k]-m+target+rand(-2,2)),35,98);
 f.rank=rank;f.div=C?C.div:'ligero';return f;
}
function divOpp(rank){
 const f=ROSTER.find(x=>fDiv(x)===(C.div||'ligero')&&x.rank===rank&&x.name!==C.f.name);
 if(f){const o=JSON.parse(JSON.stringify(f));o.rank=rank;return o;}
 return genOpp(rank);
}
const purse=(o,title)=>o.regional?Math.round((PROMOS[o.org||C.org]||PROMOS.ffc).bolsa?(PROMOS[o.org||C.org]||PROMOS.ffc).bolsa(o.nivel||55)*(o.orgTitle?2.5:1):1000):Math.round((o.rival?1.5:1)*((title?260:0)+12*(17-Math.min(16,o.rank===0?0:o.rank))+20)*1000*(C.contract?C.contract.mult:1)*(1+C.hype/200));
function makeOffers(){
 let list;
 if(regional()){
  // promotoras chicas: rivales del nivel de la promotora, bolsas chicas; la quinta de ZENIT o PCL puede ser por su cinturón
  const P=promo(),R=C.orgRec||{n:0,w:0},base=[46,55,64][P.tier]+R.n*2;
  if(P.tier===2&&R.n===4&&R.w>=3){const f=genOpp(16,base+6);f.rank=16;f.regional=true;f.nivel=base+6;f.org=P.id;f.orgTitle=true;return[{f,title:false,weeks:6,orgTitle:true}];}
  return[0,1,2].map(i=>{const f=genOpp(16,base+i*3);f.rank=16;f.regional=true;f.nivel=base+i*3;f.org=P.id;return{f,title:false,weeks:[2,3,4][i]};});
 }
 if(C.champ)list=[1,2,3].map(r=>({f:divOpp(r),title:true}));
 else if(C.rank===1)list=[{f:divOpp(0),title:true}];
 else{const rs=C.rank>=16?[16,15,14]:[Math.min(16,C.rank+2),C.rank-1,Math.max(1,C.rank-3)];list=[...new Set(rs)].map(r=>({f:divOpp(r),title:false}));}
 list=list.map((o,i)=>({...o,weeks:o.title?6:[3,4,5][i%3]}));
 // revancha con un rival (si hay y no fue la última pelea)
 const rv=Object.values(C.rivals||{}).filter(r=>r.f.name!==(C.hist[0]&&C.hist[0].opp)).sort((a,b)=>b.heat-a.heat)[0];
 if(rv&&!C.champ&&rnd()<.7){const f=JSON.parse(JSON.stringify(rv.f));f.rank=Math.max(1,Math.min(16,C.rank+(rnd()<.5?-1:1)));f.rival=true;list.push({f,title:false,weeks:5,rival:true});}
 return list;
}
// Red social: posteos
function post(quien,arroba,tipo,texto,extra){C.feed.unshift({quien,arroba,tipo,texto,f:C.date,...extra});C.feed=C.feed.slice(0,30);}
function migrar(){
 if(!C)return;
 const d={date:Date.now(),fans:1200,hype:15,ep:0,money:0,streak:0,titles:C.champ?1:0,feed:[],best:C.rank,fitness:55,longevity:100,injury:0,
  contract:{total:4,left:4,mult:1,bonoFin:50000,fins:0},gym:0,spons:[],rivals:{},belts:C.champ?[C.div]:[],liga:'pro',org:null,orgRec:{n:0,w:0,l:0,d:0},r1ko:0,coach:'tito',amistad:{tito:10},llamadas:null,ageBase:(C.f.bio&&C.f.bio.edad)||26,start:C.date||Date.now()};
 for(const k in d)if(C[k]==null)C[k]=d[k];
 if(C.pop!=null&&C.hype===15)C.hype=C.pop;
 if(!C.org)C.org=C.liga==='regional'?'amateur':'uw';
 C.spons=(C.spons||[]).filter(id=>SPONS.some(S=>S.id===id));
 if(C.step==='camp'&&!C.camp)C.step='offers';
 if(C.step==='fight'&&!C.camp)C.camp={weeks:1,week:2,time:0,studied:false,reto:null,log:[]};
 if(!C.offers)C.offers=makeOffers();
 C.offers=C.offers.map((o,i)=>({...o,weeks:o.weeks||[3,4,5][i%3]}));
}
migrar();
function startCareer(f,div){
 const d=JSON.parse(JSON.stringify(f));
 d.div=div;
 C={div,f:d,rec:{w:0,l:0,d:0},rank:16,best:16,champ:false,defenses:0,titles:0,hist:[],step:'offers',offers:null,opp:null,title:false,camp:null,
  date:Date.now(),start:Date.now(),ageBase:(d.bio&&d.bio.edad)||22,fans:800,hype:10,ep:0,money:0,streak:0,feed:[],fitness:55,longevity:100,injury:0,
  contract:{total:4,left:4,mult:1,bonoFin:50000,fins:0},gym:0,spons:[],rivals:{},belts:[],liga:'regional',org:'amateur',orgRec:{n:0,w:0,l:0,d:0},r1ko:0,coach:'tito',amistad:{tito:10},llamadas:null,orgBelts:[],
  last:`Arrancás como amateur: 5 peleas en el Circuito Amateur. Si te va bien te llama una promotora. Ganá por KO en el primer round y te llaman antes.`};
 C.offers=makeOffers();
 post('Circuito Amateur','@circuitoamateur','org',`Debut amateur: ${handle(d)} (${divName(div).toLowerCase()}). Los ojeadores de las promotoras miran cada pelea.`);
 post('Tito Ferreyra','@elviejotito','coach',`Este pibe tiene algo. Lo vamos a llevar de a poco. 🥊`);
 post(d.name,handle(d),'yo',`Arranca todo. Desde abajo, como tiene que ser. 🥊`);
 saveC();kTab='inicio';renderCareer();
}
/* ---------- Campamento ---------- */
function aceptarOferta(i){
 if(C.retired)return;
 const o=C.offers[i];C.opp=o.f;C.title=o.title;C.step='camp';
 const reto=pick(RETOS);
 C.camp={weeks:o.weeks,week:1,time:TIEMPO,studied:false,reto:{id:reto[0],txt:reto[1],acc:null},log:[],trash:0};
 C.fightDate=C.date+o.weeks*7*864e5;
 post(...orgCta(),'org',`¡Pelea confirmada! ${handle(C.f)} vs ${handle(o.f)}${o.title?' por el cinturón':''} en ${o.weeks} semanas.`);
 post(o.f.name,handle(o.f),'rival',pick([`Respeto a ${C.f.last}, pero no está listo para esto.`,`Que entrene bien. Lo voy a necesitar entero para ganarle.`,`Otro que viene a buscar fama a mi costa.`]));
 post(...CUENTAS[3].slice(0,2),'reto',`${handle(C.f)} si querés que te sigamos: ${reto[1].toLowerCase()} 🔥`,{reto:1});
 kLog=[];const cj=consejoCamp();if(cj){C.camp.consejo=cj;kLog.unshift(cj.txt);if(cj.revela){C.camp.studied=true;kLog.unshift(`${coach().n} ya estudió al rival: tenés sus números.`);}post(coach().n,'@'+coach().id+'coach','coach',cj.txt.replace(/^[^:]+: /,''));}
 kLog=kLog.slice(0,8);saveC();kTab='semana';renderCareer();
}
function gastar(c){if(C.camp.time<c){kLog.unshift('No te alcanza el tiempo esta semana.');return false;}C.camp.time-=c;return true;}
function ganaEP(n,ent){const K=coach(),bono=ent!=null&&(K.ent===-1||K.ent===ent)?.12*K.prest:.04*K.prest;n=Math.round(n*GYMS[C.gym||0][2]*(1+bono));C.ep+=n;return`+${n} puntos de evolución`;}
function subeForma(n){
 const antes=C.fitness;C.fitness=clamp(C.fitness+n,0,110);let t=`Forma ${antes}→${Math.min(100,C.fitness)}`;
 if(C.fitness>100&&rnd()<.35-(C.gym||0)*.07-amistad()/400){C.injury=2;t+='. ¡Te pasaste y te lesionaste! Descansá para curarte.';}
 C.fitness=Math.min(100,C.fitness);return t;
}
function accion(k,arg){
 const A=ACCIONES[k];if(!A||!C.camp||C.step!=='camp')return;
 if(k==='entrenar'){
  if(!gastar(A.c))return;const E=ENTRENOS[arg];const g={};g[pick(E[2])]=1;const up=rnd()<.35?applyGain(C.f.s,g):[];
  kLog.unshift(`Entrenamiento de ${E[0].toLowerCase()}: ${subeForma(C.injury?5:12)}, ${ganaEP(C.injury?8:18,+arg)}${C.camp.consejo&&C.camp.consejo.ent===+arg?' (lo que pidió tu entrenador)':''}${up.length?', '+up.join(', '):''}.`);
 }else if(k==='sparring'){
  if(arg==='jugar'){if(C.camp.time<A.c){kLog.unshift('No te alcanza el tiempo esta semana.');renderCareer();return;}jugarSparring();return;}
  if(!gastar(A.c))return;kLog.unshift(`Sparring simulado: ${subeForma(9)}, ${ganaEP(20)}.`);
 }else if(k==='redes'){
  if(!gastar(A.c))return;
  const tipo=arg||'promo',txts={promo:`Semana ${C.camp.week} de campamento. Todo saliendo bien. ${handle(C.opp)} nos vemos pronto.`,
   humilde:`Gracias a todos por el apoyo. ${C.opp.last} es un gran rival, vamos a dar todo.`,
   trash:`${handle(C.opp)} disfrutá estas semanas, son las últimas que vas a estar en el ranking. 😤`};
  const h=tipo==='trash'?10:tipo==='humilde'?4:6;C.hype=clamp(C.hype+h,0,100);const fans=Math.round(C.fans*(.02+h/200)+300);C.fans+=fans;
  if(tipo==='trash'){C.camp.trash++;post(C.opp.name,handle(C.opp),'rival',pick(['Hablá todo lo que quieras. En el octágono no hay redes.','Ya veremos quién habla después de la pelea.','Gracias por la motivación extra.']));}
  post(C.f.name,handle(C.f),'yo',txts[tipo]);
  kLog.unshift(`Publicaste en redes: hype +${h}, +${fmtNum(fans)} fans${tipo==='trash'?'. El rival viene más motivado':''}.`);
 }else if(k==='invitar'){
  if(!gastar(A.c))return;const f=ROSTER.find(x=>x.name===arg);if(!f)return;
  const best=Object.entries(f.s).sort((a,b)=>b[1]-a[1])[0][0],g={};g[best]=1;const up=applyGain(C.f.s,g);
  kLog.unshift(`Entrenaste con ${f.name}: aprendiste de su ${statName(best).toLowerCase()} (${up.join(', ')||'ya estás al máximo'}), ${ganaEP(25)}, ${subeForma(6)}.`);
  post(f.name,handle(f),'pro',`Buena sesión con ${handle(C.f)}. Tiene futuro.`);C.fans+=500;
 }else if(k==='estudiar'){
  if(C.camp.studied){kLog.unshift('Ya estudiaste al rival.');renderCareer();return;}
  if(!gastar(A.c))return;C.camp.studied=true;
  const s=C.opp.s,top=Object.entries(s).sort((a,b)=>b[1]-a[1]),low=top[top.length-1];
  kLog.unshift(`Estudiaste a ${C.opp.last}: su fuerte es ${statName(top[0][0]).toLowerCase()} (${top[0][1]}) y su punto débil ${statName(low[0]).toLowerCase()} (${low[1]}).`);
 }else if(k==='descansar'){
  if(!gastar(A.c))return;C.fitness=Math.max(0,C.fitness-4);C.longevity=Math.min(100,C.longevity+2);
  kLog.unshift(`Descansaste${C.injury?` y te curaste la lesión`:''}: forma ${C.fitness}, desgaste recuperado.`);C.injury=0;
 }
 saveC();renderCareer();
}
function terminarSemana(){
 if(C.step!=='camp')return;
 C.fitness=Math.max(0,C.fitness-(C.camp.time>=6?8:4));C.date+=7*864e5;sumaAmistad(3);
 if(C.injury)C.injury=Math.max(0,C.injury-1);
 C.hype=Math.max(0,C.hype-1);
 if(C.camp.week>=C.camp.weeks){C.step='fight';kLog.unshift('Terminó el campamento. ¡Llegó la noche de pelea!');
  post(...CUENTAS[1].slice(0,2),'pro',`Esta noche: ${handle(C.f)} vs ${handle(C.opp)}. ${C.fitness>=75?C.f.last+' llega en gran forma.':'Dicen que '+C.f.last+' no llega del todo bien.'}`);}
 else{C.camp.week++;C.camp.time=TIEMPO;kLog.unshift(`Arranca la semana ${C.camp.week} de ${C.camp.weeks}.`);}
 saveC();renderCareer();
}
// Simular la semana: el ayudante reparte el tiempo
function simularSemana(){
 if(C.step!=='camp')return;
 if(C.injury)accion('descansar');
 if(C.camp.time>=1)accion('redes','promo');
 if(!C.camp.studied&&C.camp.time>=2)accion('estudiar');
 while(C.camp.time>=3){
  if(C.fitness>=88){if(C.camp.time>=2)accion('descansar');break;}
  if(C.camp.time>=4&&rnd()<.4)accion('sparring');else accion('entrenar',Math.floor(rnd()*ENTRENOS.length));
 }
 terminarSemana();
}
function jugarSparring(){
 const p=JSON.parse(JSON.stringify(C.f)),r=genOpp(Math.max(1,Math.min(16,(C.rank>=16?14:C.rank)+2)));r.name='Compañero de sparring';r.last='Sparring';
 startFight(p,r,{kind:'career',esc:'gimnasio',rounds:1,title:`SPARRING · SEMANA ${C.camp.week}`,onDone(res){
  C.camp.time-=ACCIONES.sparring.c;
  const ep=res.w==='p'?55:res.w==='d'?40:30;C.ep+=ep;const t=subeForma(10);
  if(res.w==='r'&&/KO/.test(res.method)&&rnd()<.4){C.injury=1;}
  kLog.unshift(`Sparring jugado: ${res.w==='p'?'lo dominaste':res.w==='r'?'te costó':'parejo'} (+${ep} puntos), ${t}${C.injury?'. Quedaste golpeado: descansá.':''}.`);
  saveC();kTab='semana';showScreen('career');
 }});
}
/* ---------- Pelea ---------- */
// Multiplicador por forma, lesión, desgaste y estudio del rival
function factorForma(){
 const f=C.fitness;let m=f>=80?1.03:f>=65?1:f>=45?.96:.9;
 if(C.injury)m*=.94;if(C.camp&&C.camp.studied)m*=1.03;return m;
}
function peleadorParaPelea(){
 const p=JSON.parse(JSON.stringify(C.f)),m=factorForma();
 for(const k in p.s)p.s[k]=clamp(Math.round(p.s[k]*m),30,99);
 // corte de peso agresivo: llegás más grande (más poder) pero con menos aire; si no diste el peso, peor
 const ct=C.camp&&C.camp.corte;
 if(ct==='agresivo'){p.s.pow=Math.min(99,p.s.pow+4);p.s.str=Math.min(99,p.s.str+2);p.s.car=Math.max(30,p.s.car-6);}
 if(C.camp&&C.camp.missed){p.s.car=Math.max(30,p.s.car-6);p.s.chin=Math.max(30,p.s.chin-3);}
 // edad: después de los 34 se pierde velocidad y mentón
 const ed=edadDe();if(ed>34){const k=Math.min(10,(ed-34)*2);p.s.spd=Math.max(30,p.s.spd-k);p.s.chin=Math.max(30,p.s.chin-k);}
 p.s.chin=clamp(Math.round(p.s.chin*(.85+.15*C.longevity/100)),30,99);return p;
}
function rivalParaPelea(){const o=JSON.parse(JSON.stringify(C.opp));if(C.camp&&C.camp.trash)for(const k in o.s)o.s[k]=Math.min(99,o.s[k]+C.camp.trash);return o;}
function pesaje(tipo){
 if(!C.camp||C.camp.corte)return;C.camp.corte=tipo;
 if(tipo==='agresivo'&&rnd()<.22-(C.gym||0)*.04){C.camp.missed=true;C.hype=Math.max(0,C.hype-5);
  post(...CUENTAS[2].slice(0,2),'pro',`${handle(C.f)} no dio el peso: pierde el 20 % de la bolsa y pelea deshidratado.`);kLog.unshift('No diste el peso: perdés el 20 % de la bolsa y llegás deshidratado.');}
 else{kLog.unshift(tipo==='agresivo'?'Corte agresivo: diste el peso justo. Llegás más grande al octágono.':'Corte tranquilo: diste el peso sin problemas.');
  post(...CUENTAS[2].slice(0,2),'pro',`Pesaje: ${C.f.last} y ${C.opp.last} dieron el peso. Mañana se pelea.`);}
 saveC();renderCareer();
}
function careerFight(){
 const n=C.rec.w+C.rec.l+C.rec.d+1;
 const sede=escenarioCarrera(),ot=C.opp&&C.opp.orgTitle;startFight(peleadorParaPelea(),rivalParaPelea(),{kind:'career',esc:sede&&sede.id,walkout:C.walkout,org:promo().n,rounds:C.title||ot?5:3,title:C.title?(C.champ?'DEFENSA DEL TÍTULO':'PELEA POR EL TÍTULO'):ot?`TÍTULO ${promo().corto}`:regional()?`${promo().corto} · PELEA ${(C.orgRec&&C.orgRec.n||0)+1} DE ${promo().peleas}`:C.opp.rival?'REVANCHA':`CARRERA · PELEA ${n}`,onDone(res){applyResult(res);kTab='inicio';showScreen('career');}});
}
function careerSim(){
 const p=peleadorParaPelea(),r=simFight(p,rivalParaPelea());
 applyResult({w:r.w===p?'p':'r',method:r.method,round:/Decisión/.test(r.method)?(C.title||(C.opp&&C.opp.orgTitle)?5:3):1+Math.floor(rnd()*(C.title?5:3))});
 kTab='inicio';renderCareer();
}
function applyResult(res){
 const opp=C.opp,wasChamp=C.champ,n=C.rec.w+C.rec.l+C.rec.d+1,bolsa=purse(opp,C.title);let txt,cobro=bolsa;
 const fin=res.w==='p'&&!/Decisión/.test(res.method);
 if(regional()){
  // promotoras chicas: no hay ranking; se cuentan las peleas en la promotora y la racha de KO en el primer round
  const P=promo(),R=C.orgRec=C.orgRec||{n:0,w:0,l:0,d:0},ko1=res.w==='p'&&/KO/.test(res.method)&&res.round===1;
  R.n++;C.r1ko=ko1?(C.r1ko||0)+1:0;
  if(res.w==='p'){C.rec.w++;R.w++;C.streak=Math.max(1,C.streak+1);cobro=bolsa*2;C.hype=clamp(C.hype+(ko1?7:4),0,100);txt=`Ganaste en ${P.corto} por ${res.method.toLowerCase()}${ko1?' en el primer round':''}.`;C.ep+=70;sumaAmistad(6);}
  else if(res.w==='r'){C.rec.l++;R.l++;C.streak=Math.min(-1,C.streak-1);txt=`Perdiste en ${P.corto}.`;C.ep+=30;sumaAmistad(2);}else{C.rec.d++;R.d++;txt=`Empate en ${P.corto}.`;C.ep+=40;}
  if(opp.orgTitle&&res.w==='p'){C.orgBelts=C.orgBelts||[];C.orgBelts.push(P.corto);txt+=` ¡CAMPEÓN DE ${P.corto}!`;post(...orgCta(),'org',`🏆 ${handle(C.f)} es el nuevo campeón de ${P.n}.`);}
  // entrenador y patrocinadores
  const fee=Math.round(cobro*coach().costo);if(fee){cobro-=fee;txt+=` ${coach().n.split(' ')[0]} cobra ${fmtMoney(fee)}.`;}
  let sp=0;for(const id of C.spons||[]){const S=SPONS.find(x=>x.id===id);if(!S)continue;sp+=S.pago;if((S.cond==='ganar'&&res.w==='p')||(S.cond==='fin'&&res.w==='p'&&!/Decisión/.test(res.method)))sp+=S.bono;}
  if(sp){cobro+=sp;txt+=` Patrocinadores: ${fmtMoney(sp)}.`;}
  C.fans+=Math.round(res.w==='p'?C.fans*.2+300*(P.tier+1):80);C.money+=cobro;
  C.longevity=Math.max(0,C.longevity-Math.round((res.w==='r'?(/KO/.test(res.method)?10:6):3)*factorDesgaste()));
  C.hist.unshift({n,opp:opp.name,orank:P.corto+(opp.orgTitle?' · título':''),res:res.w,method:res.method,round:res.round,title:false,f:C.date,bolsa:cobro});C.hist=C.hist.slice(0,40);
  // ¿te llama otra promotora?
  let lla=null;
  if(C.r1ko>=3&&P.tier<3)lla=['uw'];
  else if(C.r1ko>=2&&P.tier<2)lla=ESCALERA[P.tier+1];
  else if(opp.orgTitle&&res.w==='p')lla=['uw'];
  else if(R.n>=P.peleas&&R.w>=4)lla=ESCALERA[P.tier+1];
  else if(P.tier>0&&R.l>=3&&R.l>R.w){lla=ESCALERA[P.tier-1];txt+=` ${P.corto} no te renueva: volvés a bajar.`;}
  else if(R.n>=P.peleas){C.orgRec={n:0,w:0,l:0,d:0};txt+=` ${P.corto} te renueva por 5 peleas más: con 4 victorias te llama la siguiente.`;}
  if(lla&&lla[0]!==P.id){C.llamadas=lla;const rap=C.r1ko>=2?` ¡${C.r1ko} KO seguidos en el primer round!`:'';
   txt+=lla[0]==='uw'?` 📞 ¡TE LLAMA ULTIMATE WARRIOR!${rap}`:` 📞 Te llama${lla.length>1?'n':''} ${lla.map(x=>PROMOS[x].n).join(' y ')}.${rap}`;}
  C.date=Math.max(C.date,C.fightDate||C.date)+10*864e5;C.fitness=Math.max(30,C.fitness-25);
  C.last=txt;C.step='offers';C.opp=null;C.title=false;C.camp=null;C.offers=makeOffers();saveC();return;
 }
 if(res.w==='p'){
  C.rec.w++;C.streak=Math.max(1,C.streak+1);cobro=bolsa*2;C.hype=clamp(C.hype+(fin?12:7)+(C.title?10:0)+(opp.rival?8:0),0,100);
  if(opp.rival){delete C.rivals[opp.name];post(C.f.name,handle(C.f),'yo',`Revancha cobrada. ${handle(opp)} ya sabe quién manda. 😤`);}
  if(wasChamp){C.defenses++;txt=`¡Retuviste el título ante ${opp.last}!`;}
  else if(opp.rank===0){C.champ=true;C.rank=0;C.titles++;C.belts=C.belts||[];if(!C.belts.includes(C.div))C.belts.push(C.div);
   txt=C.belts.length>=2?`¡${C.f.last.toUpperCase()} ES CAMPEÓN EN DOS DIVISIONES!`:`¡${C.f.last.toUpperCase()} ES EL NUEVO CAMPEÓN!`;
   if(C.belts.length>=2)post(...orgCta(),'org',`🏆🏆 HISTÓRICO: ${handle(C.f)} es DOBLE CAMPEÓN (${C.belts.map(divName).join(' y ').toLowerCase()}).`);}
  else{C.rank=opp.rank<C.rank?opp.rank:Math.max(1,C.rank-1);txt=`Le ganaste a ${opp.last} por ${res.method.toLowerCase()}.`;}
  C.ep+=100+(fin?50:0);
 }else if(res.w==='r'){
  C.rec.l++;C.streak=Math.min(-1,C.streak-1);C.hype=Math.max(0,C.hype-10);
  if(wasChamp){C.champ=false;C.rank=2;txt=`Perdiste el título contra ${opp.last}.`;}
  else{C.rank=Math.min(16,C.rank+2);txt=`Perdiste con ${opp.last} por ${res.method.toLowerCase()}.`;}
  C.ep+=40;
  // el que te ganó pasa a ser tu rival
  C.rivals=C.rivals||{};const r=C.rivals[opp.name]||{f:JSON.parse(JSON.stringify(opp)),heat:0};r.heat+=2;C.rivals[opp.name]=r;txt+=` ${opp.last} pasa a ser tu rival: vas a tener revancha.`;
 }else{C.rec.d++;C.streak=0;txt=`Empate con ${opp.last}.`;C.ep+=60;}
 // bonos del contrato y reto de los fans
 if(fin){C.contract.fins++;cobro+=C.contract.bonoFin;txt+=` Bono por finalización: ${fmtMoney(C.contract.bonoFin)}.`;}
 if(C.camp&&C.camp.missed){cobro=Math.round(cobro*.8);}
 // trash talk: el rival queda picado aunque le ganes
 if(C.camp&&C.camp.trash>=2&&res.w!=='r'){C.rivals=C.rivals||{};const r=C.rivals[opp.name]||{f:JSON.parse(JSON.stringify(opp)),heat:0};r.heat+=1;C.rivals[opp.name]=r;}
 // patrocinadores
 let sp=0;for(const id of C.spons||[]){const S=SPONS.find(x=>x.id===id);if(!S)continue;sp+=S.pago;
  if((S.cond==='ganar'&&res.w==='p')||(S.cond==='fin'&&fin)||(S.cond==='titulo'&&C.title))sp+=S.bono;}
 if(sp){cobro+=sp;txt+=` Patrocinadores: ${fmtMoney(sp)}.`;}
 // edad
 const ed=edadDe();if(ed>=33&&rnd()<.5){const k=pick(['spd','car','chin']);if(C.f.s[k]>40){C.f.s[k]--;txt+=` Con ${ed} años el cuerpo lo siente (${statName(k)} −1).`;}}
 if(C.longevity<=15||ed>=39)txt+=' Tu cuerpo pide el retiro: pensalo en MI CARRERA.';
 const reto=C.camp&&C.camp.reto;
 if(reto&&reto.acc){const R=RETOS.find(x=>x[0]===reto.id);if(R&&R[2](res)){C.hype=clamp(C.hype+10,0,100);C.fans+=Math.round(C.fans*.15);txt+=' ¡Cumpliste el reto de los fans!';}else{C.hype=Math.max(0,C.hype-4);txt+=' No cumpliste el reto de los fans.';}}
 C.fans+=Math.round((res.w==='p'?C.fans*.12:C.fans*.02)+C.hype*400);
 C.longevity=Math.max(0,C.longevity-Math.round((res.w==='r'?(/KO/.test(res.method)?14:8):/Decisión/.test(res.method)?5:3)*factorDesgaste()));
 sumaAmistad(res.w==='p'?6:2);
 const fee=Math.round(cobro*coach().costo);if(fee){cobro-=fee;txt+=` ${coach().n.split(' ')[0]} cobra ${fmtMoney(fee)}.`;}
 if(C.streak<=-3&&C.rank>=16&&!C.champ){C.llamadas=['zenit','pcl'];txt+=' Ultimate Warrior te corta el contrato. Te quieren en ZENIT y PCL para volver a armarte.';}
 C.money+=cobro;C.best=Math.min(C.best,C.rank);
 C.hist.unshift({n,opp:opp.name,orank:oppRank(opp),res:res.w,method:res.method,round:res.round,title:C.title,f:C.date,bolsa:cobro});C.hist=C.hist.slice(0,40);
 post(...orgCta(),'org',res.w==='p'?`¡${handle(C.f)} gana por ${res.method.toLowerCase()}${res.round&&!/Decisión/.test(res.method)?' en el round '+res.round:''}!${C.champ&&!wasChamp?' 🏆 NUEVO CAMPEÓN':''}`:res.w==='r'?`${handle(opp)} vence a ${handle(C.f)} por ${res.method.toLowerCase()}.`:`Empate entre ${handle(C.f)} y ${handle(opp)}.`);
 if(fin)post(...CUENTAS[1].slice(0,2),'pro',`Qué finalización de ${C.f.last}. Hay que empezar a tomarlo en serio.`);
 // contrato
 C.contract.left--;
 if(C.contract.left<=0){const nm=+(C.contract.mult*(1.15+C.hype/250)).toFixed(2);C.contract={total:4,left:4,mult:nm,bonoFin:Math.round(C.contract.bonoFin*1.3/1000)*1000,fins:0};
  txt+=` Firmaste un contrato nuevo: bolsas ×${nm.toFixed(2).replace('.',',')}.`;}
 C.date=Math.max(C.date,C.fightDate||C.date)+14*864e5;C.fitness=Math.max(30,C.fitness-25);
 C.last=txt;C.step='offers';C.opp=null;C.title=false;C.camp=null;C.offers=makeOffers();saveC();
}
/* ---------- Evolución ---------- */
const costoEvo=v=>Math.max(20,Math.round((v-40)*2.2));
function evolucionar(k){const v=C.f.s[k];if(v>=99)return;const c=costoEvo(v);if(C.ep<c)return;C.ep-=c;C.f.s[k]++;saveC();renderCareer();}
/* ---------- Hitos ---------- */
function hitos(){
 const n=C.rec.w+C.rec.l+C.rec.d,fins=C.hist.filter(h=>h.res==='p'&&!/Decisión/.test(h.method)).length;
 return[
  ['Primera victoria',Math.min(1,C.rec.w),1],['Victorias seguidas',Math.max(0,C.streak),5],['Ganar por finalización',fins,5],
  ['Entrar al top 10',C.best<=10?1:0,1],['Pelear por el título',C.hist.some(h=>h.title)?1:0,1],['Ser campeón',C.titles?1:0,1],
  ['Defensas del título',C.defenses,3],['Fans',Math.min(C.fans,1e6),1e6],['Peleas en la carrera',n,20]
 ];
}
/* ---------- Pantalla ---------- */
function retrato(id){return`<canvas class="cr6-face" id="${id}" width="56" height="48"></canvas>`;}
function crHud(){
 const cp=C.camp,fit=C.fitness,inj=C.injury,lon=C.longevity;
 const lonTxt=lon>=80?'FRESCO':lon>=55?'BIEN':lon>=30?'GASTADO':'AL LÍMITE';
 const wk=C.step==='camp'?`<div class="cr6-weeks">${Array.from({length:cp.weeks},(_,i)=>`<span class="${i+1<cp.week?'ok':i+1===cp.week?'on':''}">${i+1}</span>`).join('<i></i>')}<i></i><span class="fn">🥊</span></div>`
  :C.step==='fight'?`<div class="cr6-weeks"><b class="cr6-night">NOCHE DE PELEA</b></div>`:`<div class="cr6-weeks"><b class="cr6-night">SIN PELEA PACTADA</b></div>`;
 const seg=Array.from({length:10},(_,i)=>`<i class="${i<Math.round(fit/10)?'on':''} z${i}"></i>`).join('');
 const o=C.opp;
 return`<header class="cr6-hud">
  <div class="cr6-l">
   <div class="cr6-row"><button class="cr6-back" data-go="home" aria-label="Menú">◀</button><span class="cr6-day">${C.step==='camp'?'SEMANA '+cp.week:C.step==='fight'?'HOY':'LIBRE'}</span>${wk}</div>
   <div class="cr6-row cr6-meters">
    <div class="cr6-m"><small>FORMA: ${fit}${inj?' · LESIONADO':''}</small><div class="cr6-fit ${inj?'inj':''}">${seg}<b style="left:80%"></b></div></div>
    <div class="cr6-m"><small>HYPE: ${C.hype}</small><div class="cr6-hype"><u style="width:${C.hype}%"></u></div></div>
   </div>
  </div>
  <div class="cr6-c">
   ${C.step==='camp'?`<button class="cr6-sim" id="kSimW">⏩ SIMULAR SEMANA</button>`:C.step==='fight'?`<button class="cr6-sim hot" data-tab="pelea">🥊 IR A LA PELEA</button>`:`<button class="cr6-sim" data-tab="inicio">📄 VER OFERTAS</button>`}
   <div class="cr6-stats">
    <div><small>FANS</small><b>👥 ${fmtNum(C.fans)}</b></div>
    <div><small>PUNTOS</small><b>✦ ${C.ep}</b></div>
    <div><small>BOLSA</small><b>💵 ${fmtMoney(C.money)}</b></div>
    <div><small>DESGASTE</small><b>${lonTxt}</b></div>
   </div>
  </div>
  <div class="cr6-r">${o?`<div class="cr6-vs">${retrato('kHudP')}<div><small>${(C.title?(C.champ?'DEFENSA':'TÍTULO'):'PRÓXIMA PELEA')}</small><b>${esc(C.f.last)}</b><b>vs ${esc(o.last)}</b></div>${retrato('kHudR')}</div>`:`<div class="cr6-vs empty"><small>PRÓXIMA PELEA</small><b>Elegí rival</b></div>`}</div>
 </header>
 <nav class="cr6-tabs">${[['inicio','INICIO'],['semana','SEMANA'],['micarrera','MI CARRERA'],['equipo','EQUIPO'+(SPONS.some(S=>C.fans>=S.fans&&tierDe()>=S.org&&!(C.spons||[]).includes(S.id)&&(C.spons||[]).length<cuposSpons())?' ●':'')],['evolucion','EVOLUCIÓN'+(C.ep>=20?' ●':'')],['ranking','RANKING'],['historial','HISTORIAL']].map(([k,l])=>`<button data-tab="${k}" class="${kTab===k?'on':''}">${l}</button>`).join('')}</nav>`;
}
function tilePromo(){
 const P=promo(),R=C.orgRec||{n:0,w:0,l:0},esc0=ESCALERA.map(g=>g.map(id=>`<span class="${id===P.id?'on':''}">${PROMOS[id].corto}</span>`).join('<small>o</small>')).join('<i>›</i>');
 return`<section class="cr6-tile cr6-promo"><h3>TU PROMOTORA</h3><div class="cr6-pm">${logoPromo(P.id,1)}<div><b>${P.n}</b><small>${P.desc}</small></div></div>
  <div class="cr6-ladder">${esc0}</div>
  <ul><li><span>Peleas en ${P.corto}</span><b>${R.n}/${P.peleas}</b></li><li><span>Récord en ${P.corto}</span><b>${R.w}-${R.l}-${R.d||0}</b></li><li><span>KO seguidos en el 1.er round</span><b>${C.r1ko||0} ${C.r1ko>=1?'🔥':''}</b></li></ul>
  <p class="cr6-note">4 victorias en 5 peleas = te llama la siguiente. 2 KO seguidos en el 1.er round te adelantan; 3 seguidos y te llama UW.</p></section>`;
}
function tileContrato(){
 if(regional())return tilePromo();
 const k=C.contract;
 return`<section class="cr6-tile cr6-contract"><h3>${logoPromo('uw')} CONTRATO CON ULTIMATE WARRIOR</h3>
  <div class="cr6-pen"></div>
  <ul><li><span>Peleas que quedan</span><b>${k.left}/${k.total}</b></li><li><span>Bolsa base</span><b>×${k.mult.toFixed(2).replace('.',',')}</b></li><li><span>Bono por finalización</span><b>${fmtMoney(k.bonoFin)}</b></li></ul>
  <div class="cr6-foot"><span>Finalizaciones este contrato</span><b>${k.fins}/${k.total}</b></div><i class="cr6-prog"><u style="width:${k.fins/k.total*100}%"></u></i></section>`;
}
function tileRedes(n){
 const r=C.camp&&C.camp.reto;
 const items=C.feed.slice(0,n).map(p=>`<div class="cr6-post ${p.tipo}"><i class="cr6-pav ${p.tipo}">${p.tipo==='org'?(p.quien==='Ultimate Warrior'?'UW':p.quien.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase()):p.quien.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</i><div><b>${esc(p.quien)}</b> <small>${esc(p.arroba)}</small><p>${esc(p.texto)}</p>
  ${p.reto&&r&&r.acc==null?`<div class="cr6-reto"><button data-reto="1">Aceptar reto</button><button data-reto="0">Rechazar</button></div>`:p.reto&&r?`<em>${r.acc?'Reto aceptado':'Rechazaste el reto'}</em>`:''}</div></div>`).join('');
 return`<section class="cr6-tile cr6-feed"><div class="cr6-feedl">${items||'<p class="cr6-empty">Sin publicaciones.</p>'}</div><h3>REDES SOCIALES</h3></section>`;
}
function tileHito(){
 const h=hitos().find(x=>x[1]<x[2])||hitos()[0];
 return`<section class="cr6-tile cr6-hito" data-tab="historial"><h3>HITOS</h3><div class="cr6-foot"><span>${h[0]}</span><b>${h[2]>=1e6?fmtNum(h[1])+'/'+fmtNum(h[2]):h[1]+'/'+h[2]}</b></div><i class="cr6-prog"><u style="width:${h[1]/h[2]*100}%"></u></i></section>`;
}
function heroe(){
 return`<section class="cr6-hero"><canvas id="kPrev" width="96" height="112"></canvas>
  <div class="cr6-name"><small>${handle(C.f)}</small><span>${esc(C.f.first||C.f.name.split(' ')[0])}</span><b>${esc(C.f.last)}</b>
  <div class="cr6-div">${divName(C.div).toUpperCase()} · ${regional()?promo().corto:C.champ?'🏆 CAMPEÓN':C.rank>=16?'SIN RANKING':'#'+C.rank}</div>
  ${(C.belts||[]).length?`<div class="cr6-belts">${C.belts.map(b=>`<span title="${divName(b)}">🏆 ${divName(b).replace(/^Peso /,'').toUpperCase()}</span>`).join('')}</div>`:''}
  <div class="cr6-rec">${C.rec.w}-${C.rec.l}-${C.rec.d}${C.champ?` · ${C.defenses} DEFENSAS`:''} · ${edadDe()} AÑOS</div></div></section>`;
}
function panelLlamadas(){
 const L=C.llamadas;return`<section class="cr6-tile cr6-offers cr6-call"><h3>📞 ${L.length>1?'TE LLAMAN DOS PROMOTORAS':'TE LLAMA '+PROMOS[L[0]].n.toUpperCase()}</h3>${C.last?`<p class="cr6-last">${esc(C.last)}</p>`:''}
  <div class="cr6-calls">${L.map(id=>{const P=PROMOS[id];return`<div class="cr6-callc" style="--c1:${P.col}">${logoPromo(id,1)}<div><b>${P.n}</b><small>${P.desc}</small>${P.bolsa?`<small>Bolsas desde ${fmtMoney(P.bolsa([46,55,64][P.tier]))}</small>`:'<small>Contrato por 4 peleas · ranking y cinturones</small>'}</div><button class="cr6-go" data-firmar="${id}">FIRMAR</button></div>`;}).join('')}</div></section>`;
}
function panelOfertas(){
 if(C.llamadas&&C.llamadas.length)return panelLlamadas();
 const cs=consejoOferta();
 return`<section class="cr6-tile cr6-offers"><h3>${regional()?`${promo().corto} · PELEA ${((C.orgRec&&C.orgRec.n)||0)+1} DE ${promo().peleas}${C.offers[0]&&C.offers[0].orgTitle?' · ¡POR EL CINTURÓN!':''}`:C.champ?'ELEGÍ TU DEFENSA':C.offers[0].title?'¡PELEA POR EL TÍTULO!':'OFERTAS DE PELEA'}</h3>
  ${C.last?`<p class="cr6-last">${esc(C.last)}</p>`:''}
  <div class="cr6-olist">${C.offers.map((o,i)=>`<button class="cr6-offer ${o.title||o.orgTitle?'title':''} ${o.rival?'rival':''} ${cs&&cs.i===i?'rec':''}" data-of="${i}">${retrato('kOf'+i)}<div><b>${esc(o.f.name)}</b><small>${cs&&cs.i===i?'⭐ RECOMENDADA · ':''}${o.rival?'🔥 REVANCHA · ':''}${o.orgTitle?'🏆 CINTURÓN '+promo().corto+' · ':''}${o.f.regional?promo().corto:oppRank(o.f)} · Nivel ${Math.round(ovr(o.f))} · ${o.f.style}</small><small>Campamento: ${o.weeks} semanas · ${o.title||o.orgTitle?5:3} rounds</small></div><em>${fmtMoney(purse(o.f,o.title))}</em></button>`).join('')}</div>
  ${cs?`<p class="cr6-coach">🧢 ${esc(cs.txt)}</p>`:''}<p class="cr6-note">Tu nivel: ${Math.round(ovr(C.f))}. Más semanas de campamento = más tiempo para llegar en tu pico.</p></section>`;
}
function vistaInicio(){
 const centro=C.retired?`<section class="cr6-tile"><h3>CARRERA TERMINADA</h3><p class="cr6-last">${esc(C.last)}</p><div class="cr6-actbtns"><button class="cr6-go" data-tab="micarrera">VER TU LEGADO</button></div></section>${tileRedes(3)}`:C.step==='offers'?panelOfertas():`${tileRedes(4)}${tileHito()}`;
 return`<div class="cr6-main"><div class="cr6-colL">${tileContrato()}</div><div class="cr6-colC">${centro}</div>${heroe()}</div>
  <div class="cr6-bottom"><button class="cr6-btn" id="kEdit">EDITAR PELEADOR</button><button class="cr6-btn" data-tab="redesall">REDES SOCIALES</button><button class="cr6-btn" data-tab="micarrera">MI CARRERA</button><button class="cr6-btn danger" id="kReset">NUEVA CARRERA</button></div>`;
}
function vistaSemana(){
 if(C.step!=='camp'){
  return`<div class="cr6-grid"><section class="cr6-tile"><h3>${C.step==='fight'?'NOCHE DE PELEA':'SIN CAMPAMENTO'}</h3><p class="cr6-note">${C.step==='fight'?'Terminaste el campamento. Andá a la pelea.':'Aceptá una oferta de pelea para arrancar el campamento.'}</p>
   <div class="cr6-actbtns">${C.step==='fight'?'<button class="cr6-go" data-tab="pelea">IR A LA PELEA ▶</button>':'<button class="cr6-go" data-tab="inicio">VER OFERTAS</button>'}</div></section>${logHtml()}</div>`;
 }
 const cp=C.camp,t=cp.time,pct=t/TIEMPO*100;
 const invitados=ROSTER.filter(x=>fDiv(x)===C.div&&x.name!==C.f.name&&x.name!==C.opp.name&&x.rank!=null).sort((a,b)=>a.rank-b.rank).slice(0,4);
 const act=(k,body)=>{const A=ACCIONES[k];return`<div class="cr6-act ${t<A.c?'off':''}"><div class="cr6-ah"><b>${A.n}</b><span>⏱ ${A.c}</span></div><small>${A.d}</small>${body}</div>`;};
 return`<div class="cr6-week"><section class="cr6-tile cr6-time"><h3>SEMANA ${cp.week} DE ${cp.weeks} · VS ${esc(C.opp.last).toUpperCase()}</h3>
  <div class="cr6-tbar"><u style="width:${pct}%"></u></div><div class="cr6-foot"><span>Tiempo libre esta semana</span><b>${t}/${TIEMPO}</b></div>
  <div class="cr6-actbtns"><button class="cr6-go" id="kEndW">TERMINAR SEMANA ▶</button><button class="cr6-btn" id="kSimW2">SIMULAR SEMANA</button></div>
  <p class="cr6-note">Llegá a la pelea con la forma en la zona verde (80+). Si pasás de 100 entrenando, te podés lesionar.</p></section>
  <div class="cr6-acts">
   ${act('entrenar',`<div class="cr6-chips">${ENTRENOS.map((e,i)=>`<button data-act="entrenar" data-arg="${i}" title="${e[1]}">${e[0]}</button>`).join('')}</div>`)}
   ${act('sparring',`<div class="cr6-chips"><button data-act="sparring" data-arg="jugar">Jugar sparring</button><button data-act="sparring">Simular</button></div>`)}
   ${act('redes',`<div class="cr6-chips"><button data-act="redes" data-arg="promo">Promocionar</button><button data-act="redes" data-arg="humilde">Humilde</button><button data-act="redes" data-arg="trash">Trash talk</button></div>`)}
   ${act('invitar',`<div class="cr6-chips">${invitados.map(f=>`<button data-act="invitar" data-arg="${esc(f.name)}">${esc(f.last)}</button>`).join('')||'<em>Nadie disponible</em>'}</div>`)}
   ${act('estudiar',`<div class="cr6-chips"><button data-act="estudiar" ${cp.studied?'disabled':''}>${cp.studied?'Ya lo estudiaste':'Ver videos'}</button></div>`)}
   ${act('descansar',`<div class="cr6-chips"><button data-act="descansar">Descansar</button></div>`)}
  </div>${logHtml()}</div>`;
}
function logHtml(){return`<section class="cr6-tile cr6-log"><h3>LO QUE PASÓ</h3>${kLog.length?`<ul>${kLog.slice(0,8).map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:'<p class="cr6-note">Todavía nada esta semana.</p>'}</section>`;}
function vistaPelea(){
 const o=C.opp,cp=C.camp,s=cp&&cp.studied,m=factorForma(),r=cp&&cp.reto;
 return`<div class="cr6-grid2"><section class="cr6-tile cr6-fight"><h3>${C.title?(C.champ?'DEFENSA DEL TÍTULO':'PELEA POR EL TÍTULO'):'NOCHE DE PELEA'} · ${C.title?5:3} ROUNDS</h3>
  <div class="cr6-face2">${retrato('kFP')}<b>VS</b>${retrato('kFR')}</div>
  <div class="cr6-fnames"><div><b>${esc(C.f.name)}</b><small>${C.champ?'Campeón':C.rank>=16?'Sin ranking':'#'+C.rank} · ${C.rec.w}-${C.rec.l}-${C.rec.d}</small></div><div><b>${esc(o.name)}</b><small>${oppRank(o)} · Nivel ${s?Math.round(ovr(o)):'??'}</small></div></div>
  <ul class="cr6-pre"><li><span>Tu forma</span><b class="${m>=1?'ok':'bad'}">${C.fitness} · ${m>=1.03?'en tu pico':m>=1?'bien':'por debajo'}</b></li>${C.injury?'<li><span>Lesión</span><b class="bad">Peleás golpeado</b></li>':''}<li><span>Rival estudiado</span><b class="${s?'ok':''}">${s?'Sí (+3 %)':'No'}</b></li>${cp&&cp.trash?`<li><span>Trash talk</span><b class="bad">Rival motivado (+${cp.trash})</b></li>`:''}<li><span>Reto de los fans</span><b>${r&&r.acc?esc(r.txt):'—'}</b></li><li><span>Bolsa</span><b>${fmtMoney(purse(o,C.title))} (doble si ganás)</b></li></ul>
  ${cp&&!cp.corte?`<div class="cr6-pesaje"><b>PESAJE · ${(DIVISIONES.find(d=>d.id===C.div)||{kg:0}).kg} KG</b><small>Elegí cómo cortar peso antes de pelear.</small><div class="cr6-chips"><button data-pesaje="tranquilo">Corte tranquilo<br><small>sin riesgo</small></button><button data-pesaje="agresivo">Corte agresivo<br><small>+poder, −cardio, puede fallar</small></button></div></div>`
   :`<div class="cr6-actbtns"><button class="cr6-go" id="kFight">PELEAR ▶</button><button class="cr6-btn" id="kSim">DIRECTO AL RESULTADO</button></div>`}${cp&&cp.missed?'<p class="cr6-note" style="color:#ff7b6b">No diste el peso: −20 % de la bolsa y menos cardio.</p>':''}</section>
  <section class="cr6-tile"><h3>ATRIBUTOS DEL RIVAL</h3>${STATS.map(([k,l])=>`<div class="ks"><span>${l}</span><div class="bar r"><i style="width:${s?o.s[k]:0}%"></i></div><b>${s?o.s[k]:'??'}</b></div>`).join('')}${s?'':'<p class="cr6-note">Estudiá al rival durante el campamento para ver sus números.</p>'}</section></div>`;
}
function vistaEvolucion(){
 return`<div class="cr6-grid2"><section class="cr6-tile"><h3>EVOLUCIÓN · ✦ ${C.ep} PUNTOS</h3><p class="cr6-note">Gastá los puntos en atributos. Cuanto más alto, más caro.</p>
  ${STATS.map(([k,l])=>{const v=C.f.s[k],c=costoEvo(v);return`<div class="cr6-evo"><span>${l}</span><div class="bar r"><i style="width:${v}%"></i></div><b>${v}</b><button data-evo="${k}" ${C.ep<c||v>=99?'disabled':''}>+1 · ✦${c}</button></div>`;}).join('')}
  <div class="cr6-foot"><span>Nivel general</span><b>${Math.round(ovr(C.f))}</b></div></section>
  <section class="cr6-tile"><h3>CÓMO SE GANAN PUNTOS</h3><ul class="cr6-list"><li>Entrenar: +18</li><li>Sparring simulado: +20 · jugado: hasta +55</li><li>Invitar a un peleador: +25</li><li>Ganar una pelea: +100 (+50 si la terminás)</li><li>Perder: +40 · empatar: +60</li></ul></section></div>`;
}
function tablaDivision(){
 const out=ROSTER.filter(x=>fDiv(x)===C.div&&x.rank!=null&&x.name!==C.f.name).sort((a,b)=>a.rank-b.rank).map(x=>{let rr=x.rank;if(!C.champ&&C.rank<16&&rr>=C.rank)rr++;if(C.champ&&rr===0)rr=1;return{n:x.name,flag:x.flag,rank:rr,lvl:Math.round(ovr(x))};});
 out.push({n:C.f.name,flag:C.f.flag,rank:C.champ?0:C.rank,lvl:Math.round(ovr(C.f)),me:1});
 return out.sort((a,b)=>a.rank-b.rank).filter(x=>x.rank<=15||x.me);
}
function vistaRanking(){
 return`<section class="cr6-tile"><h3>${divName(C.div).toUpperCase()} · RANKING</h3><table class="cr-tab"><thead><tr><th>#</th><th>PELEADOR</th><th>NIVEL</th></tr></thead><tbody>
  ${tablaDivision().map(x=>`<tr class="${x.me?'me':''}"><td>${x.rank===0?'C':x.rank>=16?'–':x.rank}</td><td>${esc(x.n)} <small>${x.flag}</small></td><td>${x.lvl}</td></tr>`).join('')}</tbody></table></section>`;
}
function vistaHistorial(){
 const n=C.rec.w+C.rec.l+C.rec.d;
 return`<div class="cr6-grid2"><section class="cr6-tile"><h3>HISTORIAL</h3>${C.hist.length?`<ol class="hist">${C.hist.map(h=>`<li class="${h.res==='p'?'w':h.res==='r'?'l':'d'}"><b>${h.res==='p'?'G':h.res==='r'?'P':'E'}</b><span>${esc(h.opp)} <small>${h.orank}${h.title?' · título':''}</small></span><small>${h.method}${/Decisión|Abandono/.test(h.method)?'':` · R${h.round}`} · ${fmtMoney(h.bolsa||0)}</small></li>`).join('')}</ol>`:'<p class="cr6-note">Todavía no peleaste.</p>'}</section>
  <section class="cr6-tile"><h3>HITOS</h3>${hitos().map(([t,v,m])=>`<div class="cr6-hrow ${v>=m?'ok':''}"><span>${v>=m?'✓ ':''}${t}</span><b>${m>=1e6?fmtNum(v)+'/'+fmtNum(m):v+'/'+m}</b><i class="cr6-prog"><u style="width:${Math.min(100,v/m*100)}%"></u></i></div>`).join('')}
   <div class="cr6-foot"><span>Ganado en bolsas</span><b>${fmtMoney(C.money)}</b></div><div class="cr6-foot"><span>Efectividad</span><b>${n?Math.round(C.rec.w/n*100)+'%':'—'}</b></div></section></div>`;
}
function vistaMiCarrera(){
 const g=C.gym||0,G=GYMS[g],NX=GYMS[g+1],[lp,lt]=legado(),ed=edadDe();
 const D=DIVISIONES.find(d=>d.id===C.div),mismas=DIVISIONES.filter(d=>d.g===D.g),i=mismas.indexOf(D),vec=[mismas[i-1],mismas[i+1]].filter(Boolean);
 const disp=SPONS.filter(S=>!(C.spons||[]).includes(S.id));
 return`<div class="cr6-grid2">
  <section class="cr6-tile"><h3>LEGADO · ${lt}</h3><div class="cr6-big">${lp}</div><i class="cr6-prog"><u style="width:${Math.min(100,lp/9)}%"></u></i>
   <ul class="cr6-pre"><li><span>Edad</span><b>${ed} años</b></li><li><span>Desgaste del cuerpo</span><b class="${C.longevity<30?'bad':''}">${C.longevity}/100</b></li><li><span>Cinturones</span><b>${(C.belts||[]).length?C.belts.map(divName).join(' · '):'—'}</b></li><li><span>Récord</span><b>${C.rec.w}-${C.rec.l}-${C.rec.d}</b></li><li><span>Ganado</span><b>${fmtMoney(C.money)}</b></li></ul>
   <p class="cr6-note">Después de los 34 se pierde velocidad y mentón. Ganar títulos, defensas y finalizaciones suma legado.</p>
   ${C.retired?'<p class="cr6-last">Te retiraste. Esta carrera queda como recuerdo.</p>':'<div class="cr6-actbtns"><button class="cr6-btn danger" id="kRetire">RETIRARSE</button></div>'}</section>
  <section class="cr6-tile"><h3>TU GIMNASIO</h3><div class="cr6-foot"><span>${G[0]}</span><b>Puntos ×${G[2].toFixed(2).replace('.',',')}</b></div>
   <p class="cr6-note">Mejor gimnasio = más puntos de evolución por entrenar, menos riesgo de lesión y de fallar el peso.</p>
   ${NX?`<div class="cr6-actbtns"><button class="cr6-go" id="kGym" ${C.money<NX[1]?'disabled':''}>MUDARTE A ${NX[0].toUpperCase()} · ${fmtMoney(NX[1])}</button></div>${C.money<NX[1]?`<p class="cr6-note">Te faltan ${fmtMoney(NX[1]-C.money)}.</p>`:''}`:'<p class="cr6-note">Ya entrenás con el mejor equipo.</p>'}</section>
  <section class="cr6-tile"><h3>CAMBIAR DE DIVISIÓN</h3><p class="cr6-note">${C.champ?'Siendo campeón, subir o bajar te da directo la pelea por el otro cinturón: ¡podés ser doble campeón!':'Probá suerte en otra división. Bajar de peso cuesta forma; subir te hace más chico que los rivales.'}</p>
   <div class="cr6-actbtns">${regional()||C.step!=='offers'?'<em class="cr6-note">Disponible entre peleas, ya con contrato.</em>':vec.map(d=>`<button class="cr6-btn" data-mvdiv="${d.id}">${d.lb<D.lb?'⬇ BAJAR A':'⬆ SUBIR A'} ${d.nombre.toUpperCase()} (${d.kg} kg)</button>`).join('')}</div></section></div>`;
}
function cambiarDivision(id){
 const D=DIVISIONES.find(d=>d.id===id),antes=C.div;if(!D||C.step!=='offers')return;
 const baja=D.lb<(DIVISIONES.find(d=>d.id===antes)||D).lb;
 C.div=id;C.f.div=id;
 if(C.champ){C.champ=false;C.rank=1;C.last=`Dejás en pausa tu cinturón de ${divName(antes).toLowerCase()} y vas por el de ${D.nombre.toLowerCase()}: te dan la pelea por el título.`;
  post(...orgCta(),'org',`¡SUPERPELEA! El campeón ${handle(C.f)} sube por el cinturón de ${D.nombre.toLowerCase()}. ¿Doble campeón?`);}
 else{C.rank=Math.min(16,C.rank+4);C.last=`Nueva división: ${D.nombre}. Arrancás ${C.rank>=16?'sin ranking':'#'+C.rank}.`;}
 if(baja){C.fitness=Math.max(20,C.fitness-15);C.longevity=Math.max(0,C.longevity-3);}
 else{C.f.s.pow=Math.max(35,C.f.s.pow-2);C.f.s.spd=Math.min(99,C.f.s.spd+1);}
 C.offers=makeOffers();saveC();kTab='inicio';renderCareer();
}
function vistaEquipo(){
 const K=coach(),a=amistad(),disp=SPONS.filter(S=>!(C.spons||[]).includes(S.id)),cupo=cuposSpons(),cj=C.camp&&C.camp.consejo;
 return`<div class="cr6-grid2">
  <section class="cr6-tile cr6-coachc"><h3>TU ENTRENADOR</h3>
   <div class="cr6-ch"><i class="cr6-cav">${K.n.split(' ').map(w=>w[0]).join('')}</i><div><b>${K.n} ${K.apodo}</b><small>${K.esp} · ${'★'.repeat(K.prest)}${'☆'.repeat(5-K.prest)} · ${K.gym}</small><small>${K.costo?`Cobra el ${Math.round(K.costo*100)} % de cada bolsa`:'No te cobra nada'}</small></div></div>
   <div class="cr6-foot"><span>Amistad: ${nivelAmistad(a)}</span><b>${a}/100</b></div><i class="cr6-prog amis"><u style="width:${a}%"></u></i>
   <ul class="cr6-pre"><li><span>Desgaste por pelea</span><b class="ok">−${Math.round(a/2)} %</b></li><li><span>Puntos entrenando ${K.ent===-1?'todo':ENTRENOS[K.ent][0].toLowerCase()}</span><b class="ok">+${12*K.prest} %</b></li><li><span>Estudia al rival por vos</span><b>${K.prest>=3?'Sí':'No'}</b></li></ul>
   <p class="cr6-coach">🧢 ${esc(cj?cj.txt:`${K.n.split(' ')[0]}: "${pick(K.frases)}"`)}</p>
   <p class="cr6-note">La amistad sube con cada semana de campamento y cada pelea juntos. Más amistad = tu cuerpo se gasta menos.</p></section>
  <section class="cr6-tile"><h3>CAMBIAR DE ENTRENADOR</h3>
   ${COACHES.filter(x=>x.id!==K.id).map(x=>{const ok=coachDisponible(x),am=amistad(x.id);return`<div class="cr6-spon ${ok?'':'off'}"><i class="cr6-cav sm">${x.n.split(' ').map(w=>w[0]).join('')}</i><b>${x.n} ${x.apodo}</b><small>${x.esp} · ${'★'.repeat(x.prest)} · ${x.costo?Math.round(x.costo*100)+' % de la bolsa':'gratis'}${am?` · amistad ${am}`:''}${ok?'':` · ${x.reqRank?'necesitás estar en el top '+x.reqRank+' de UW':'necesitás estar en '+ESCALERA[x.req].map(i=>PROMOS[i].corto).join(' o ')+' o más arriba'}`}</small><button data-coach="${x.id}" ${ok&&C.step!=='camp'?'':'disabled'}>Contratar</button></div>`;}).join('')}
   <p class="cr6-note">${C.step==='camp'?'No podés cambiar de entrenador en medio del campamento.':'Si te vas, la amistad con el anterior queda guardada (por si volvés), pero arrancás de cero con el nuevo.'}</p></section>
  <section class="cr6-tile cr6-spwrap"><h3>PATROCINADORES · ${(C.spons||[]).length}/${cupo}</h3>
   ${(C.spons||[]).map(id=>{const S=SPONS.find(x=>x.id===id);return`<div class="cr6-spon on"><span class="cr6-logo">${logoMarca(S.id)}</span><b>${S.n}</b><small>${fmtMoney(S.pago)} por pelea + ${fmtMoney(S.bono)} ${CONDS[S.cond]}</small><button data-spoff="${S.id}">Dejar</button></div>`;}).join('')}
   ${disp.map(S=>{const okF=C.fans>=S.fans,okO=tierDe()>=S.org,full=(C.spons||[]).length>=cupo;return`<div class="cr6-spon ${okF&&okO?'':'off'}"><span class="cr6-logo">${logoMarca(S.id)}</span><b>${S.n}</b><small>${fmtMoney(S.pago)} por pelea + ${fmtMoney(S.bono)} ${CONDS[S.cond]}${okO?'':` · solo para peleadores de ${ESCALERA[S.org].map(i=>PROMOS[i].corto).join(' o ')} o más`}${okF?'':` · necesitás ${fmtNum(S.fans)} fans`}</small><button data-spon="${S.id}" ${okF&&okO&&!full?'':'disabled'}>Firmar</button></div>`;}).join('')}
   <p class="cr6-note">Las marcas grandes solo firman con peleadores de las mejores promotoras. En UW tenés 3 lugares.</p></section></div>`;
}
function vistaRedes(){return`<div class="cr6-grid2">${tileRedes(30)}<section class="cr6-tile"><h3>TU CUENTA</h3><div class="cr6-foot"><span>${handle(C.f)}</span><b>${fmtNum(C.fans)} seguidores</b></div><p class="cr6-note">Publicá desde la pestaña SEMANA durante el campamento. El trash talk sube más el hype, pero motiva al rival.</p></section></div>`;}
function renderCareer(){
 const B=$('#kBody');
 $('#career').classList.toggle('cr-on',!!C);
 if(!C){
  const list=[...new Set([...CUSTOM,...fightersOf(kDiv)])];if(!list.includes(kPick))kPick=list[0];
  B.innerHTML=`<header class="sh"><button class="back" data-go="home">◀ MENÚ</button><h2>MODO CARRERA</h2></header>
   <p class="lead">Elegí con quién arrancar. Empezás sin ranking: aceptá peleas, hacé tus semanas de campamento, ganá fans y subí hasta pelear por el cinturón. Lo mejor es usar un peleador tuyo: <button class="link" data-go="create">crear peleador</button>.</p>
   <label class="dsel" for="kDiv"><span>División donde vas a competir</span><select id="kDiv">${divOptions(kDiv,false)}</select></label>
   ${pickerHtml('kPicker',list,kPick)}
   <div class="stick"><button class="go" id="kStart">EMPEZAR CARRERA CON <span id="kName">${esc(kPick.name).toUpperCase()}</span></button></div>`;
  bindPicker('kPicker',list,f=>{kPick=f;$('#kName').textContent=f.name.toUpperCase();});
  $('#kDiv').onchange=e=>{kDiv=e.target.value;renderCareer();};
  $('#kStart').onclick=()=>startCareer(kPick,kDiv);
  return;
 }
 if(kTab==='pelea'&&C.step!=='fight')kTab='inicio';
 const v={micarrera:vistaMiCarrera,inicio:vistaInicio,semana:vistaSemana,pelea:vistaPelea,evolucion:vistaEvolucion,ranking:vistaRanking,historial:vistaHistorial,hitos:vistaHistorial,redesall:vistaRedes,equipo:vistaEquipo}[kTab]||vistaInicio;
 B.innerHTML=crHud()+`<div class="cr6-body">${v()}</div>`;
 const port=(id,f,face)=>{const cv=$('#'+id);if(cv)drawPortrait(cv,f,face);};
 if(C.opp){port('kHudP',C.f,1);port('kHudR',C.opp,-1);port('kFP',C.f,1);port('kFR',C.opp,-1);}
 if(C.step==='offers')C.offers.forEach((o,i)=>port('kOf'+i,o.f,-1));
}
/* ---------- Editar peleador ---------- */
function editarPeleador(){
 if(C.f.sprite){showOv(`<h3>EDITAR PELEADOR</h3><p class="sub">${esc(C.f.name)} usa su propio dibujo: no se le puede cambiar la apariencia. Solo el apodo.</p>
  <input id="kNick" value="${esc((C.f.nick||'').replace(/"/g,''))}" placeholder="Apodo" style="width:100%;box-sizing:border-box;margin:6px 0"><label>Música de entrada</label><select id="kWalk" style="width:100%;box-sizing:border-box;margin:4px 0 2px">${musOpciones(C.walkout||'')}</select><small style="display:block;color:#8b93a5;margin-bottom:6px">Suena cuando salís a pelear. Podés sumar tus canciones desde el botón ♪ del menú.</small>
  <div class="btns"><button class="go" id="kEdOk">GUARDAR</button><button class="alt" data-act="close">CANCELAR</button></div>`);
  $('#kEdOk').onclick=()=>{const n=$('#kNick').value.trim();C.f.nick=n?`"${n}"`:'';C.walkout=$('#kWalk').value||null;saveC();hideOv();renderCareer();};return;}
 const L=C.f.look=C.f.look||{};const ed={...L};
 const pelos=[-1,...CB.pelos.map((_,i)=>i)],pc=['','#141110','#3a2416','#6b4423','#a8743a','#d8b46a','#b5502a','#9a9a9a','#e8e4dc'];
 const sw=(k,arr)=>arr.map(c=>`<button class="sw" data-ek="${k}" data-ev="${c}" style="background:${c||'linear-gradient(135deg,#555,#222)'}" aria-pressed="${(ed[k]||'')===c}" aria-label="${c||'Natural'}"></button>`).join('');
 showOv(`<h3>EDITAR PELEADOR</h3><div class="cr6-edit">
  <canvas id="kEdPrev" width="120" height="190"></canvas>
  <div><label>Apodo</label><input id="kNick" value="${esc((C.f.nick||'').replace(/"/g,''))}" placeholder="Apodo"><label>Música de entrada</label><select id="kWalk" style="width:100%;box-sizing:border-box;margin:4px 0 2px">${musOpciones(C.walkout||'')}</select><small style="display:block;color:#8b93a5;margin-bottom:6px">Suena cuando salís a pelear. Podés sumar tus canciones desde el botón ♪ del menú.</small>
  <label>Peinado</label><div class="opts">${pick2Html('pel',look2(C.f).pel,'data-ek="pel"')}</div>
  <label>Barba</label><div class="opts">${pick2Html('bar',look2(C.f).bar,'data-ek="bar"')}</div>
  <label>Color de pelo</label><div class="opts">${sw('pelo',pc)}</div>
  <label>Piel</label><div class="opts">${sw('skin',GEN.skins)}</div>
  <label>Short</label><div class="opts">${pick2Html('sho',look2(C.f).sho,'data-ek="sho"')}</div>
  <label>Color del short</label><div class="opts">${sw('shorts',SH_COLS)}</div>
  <label>Guantes</label><div class="opts">${ropaHtml('guante',ed.guante,'data-ek="guante"')}</div></div></div>
  <div class="btns"><button class="go" id="kEdOk">GUARDAR</button><button class="alt" data-act="close">CANCELAR</button></div>`);
 const ov=$('#ovc');ov.querySelector('.card')||0;
 ov.querySelectorAll('canvas[data-ropa]').forEach(cv=>dibujarRopa(cv,cv.dataset.ropa,+cv.dataset.ri));pick2Draw(ov);
 const redraw=()=>{ov.querySelectorAll('canvas[data-ph]').forEach(cv=>dibujarCabeza(cv,+cv.dataset.ph,ed.skin,ed.pelo));
  if(c2Ok())prev2($('#kEdPrev'),{...C.f,look:ed},0,'guard');else{const g=$('#kEdPrev').getContext('2d');g.clearRect(0,0,96,112);drawAnimated(g,{...C.f,look:ed},48,108,1,'guard',0,'#10141c');}};
 redraw();
 ov.onclick=e=>{const b=e.target.closest('[data-ek]');if(!b)return;const k=b.dataset.ek,v=b.dataset.ev!=null?b.dataset.ev:b.dataset.lv;ed[k]=k==='peinado'||k==='short'||k==='guante'||k==='pel'||k==='bar'||k==='sho'?+v:(v||null);if(k==='short')ed.shorts=CB.shorts[+v][4];if(k==='pel')ed.peinado=pel2Viejo(+v);
  ov.querySelectorAll(`[data-ek="${k}"]`).forEach(x=>x.setAttribute('aria-pressed',x===b));redraw();};
 $('#kEdOk').onclick=()=>{const n=$('#kNick').value.trim();C.f.nick=n?`"${n}"`:'';C.walkout=$('#kWalk').value||null;C.f.look=ed;ov.onclick=null;saveC();hideOv();renderCareer();};
}
/* ---------- Eventos ---------- */
$('#kBody').addEventListener('click',e=>{
 if(!C)return;const b=e.target.closest('button,[data-tab]');if(!b)return;
 if(b.dataset.tab){kTab=b.dataset.tab;renderCareer();window.scrollTo&&$('#career').scrollTo({top:0});return;}
 if(b.dataset.of!=null){aceptarOferta(+b.dataset.of);return;}
 if(b.dataset.act){accion(b.dataset.act,b.dataset.arg);return;}
 if(b.dataset.evo){evolucionar(b.dataset.evo);return;}
 if(b.dataset.pesaje){pesaje(b.dataset.pesaje);return;}
 if(b.dataset.spon){C.spons=C.spons||[];if(C.spons.length<cuposSpons()){C.spons.push(b.dataset.spon);const S=SPONS.find(x=>x.id===b.dataset.spon);post(S.marca,'@'+S.id,'pro',`Damos la bienvenida a ${handle(C.f)} a la familia ${S.marca}. 💪`);}saveC();renderCareer();return;}
 if(b.dataset.coach){const nx=COACHES.find(x=>x.id===b.dataset.coach);if(!nx||!coachDisponible(nx)||C.step==='camp')return;const vi=coach(),av=amistad();
  post(vi.n,'@'+vi.id+'coach','coach',av>=50?`Me duele, pero entiendo. ${handle(C.f)} siempre va a tener las puertas abiertas acá. ❤️`:`${C.f.last} se va con ${nx.n}. Suerte.`);
  C.coach=nx.id;C.amistad=C.amistad||{};if(C.amistad[nx.id]==null)C.amistad[nx.id]=5;
  post(nx.n,'@'+nx.id+'coach','coach',`Bienvenido al ${nx.gym}, ${handle(C.f)}. ${pick(nx.frases)}`);
  C.last=`Ahora te entrena ${nx.n} (${nx.esp}).`;saveC();renderCareer();return;}
 if(b.dataset.firmar){const id=b.dataset.firmar,P=PROMOS[id];if(!P)return;C.llamadas=null;const de=promo();C.org=id;C.orgRec={n:0,w:0,l:0,d:0};C.r1ko=0;
  if(id==='uw'){C.liga='pro';C.rank=16;C.contract={total:4,left:4,mult:1,bonoFin:50000,fins:0};C.hype=clamp(C.hype+12,0,100);
   post(...orgCta(),'org',`Nuevo fichaje: ${handle(C.f)} llega desde ${de.n} con récord ${C.rec.w}-${C.rec.l}-${C.rec.d}. ¡Bienvenido a Ultimate Warrior! 🔴`);C.last=`¡Firmaste con ULTIMATE WARRIOR! Contrato por 4 peleas en la ${divName(C.div).toLowerCase()}. Arrancás sin ranking.`;}
  else{C.liga='regional';C.hype=clamp(C.hype+(P.tier>de.tier?6:-4),0,100);post(...orgCta(),'org',`${handle(C.f)} firma con ${P.n}. ${P.tier>de.tier?'Viene en alza.':'Busca volver a levantar.'}`);C.last=`Firmaste con ${P.n}. ${P.peleas} peleas: con 4 victorias te llama la siguiente.`;}
  C.offers=makeOffers();saveC();renderCareer();return;}
 if(b.dataset.spoff){C.spons=(C.spons||[]).filter(x=>x!==b.dataset.spoff);saveC();renderCareer();return;}
 if(b.dataset.mvdiv){cambiarDivision(b.dataset.mvdiv);return;}
 if(b.id==='kGym'){const NX=GYMS[(C.gym||0)+1];if(NX&&C.money>=NX[1]){C.money-=NX[1];C.gym=(C.gym||0)+1;post(C.f.name,handle(C.f),'yo',`Nueva casa: ${NX[0]}. A seguir creciendo.`);saveC();renderCareer();}return;}
 if(b.id==='kRetire'){if(!b.dataset.sure){b.dataset.sure='1';b.textContent='¿SEGURO? NO HAY VUELTA';return;}C.retired=true;C.step='retired';const[lp,lt]=legado();C.last=`Te retiraste con ${C.rec.w}-${C.rec.l}-${C.rec.d}. Legado: ${lp} (${lt}).`;
  post(...orgCta(),'org',`${handle(C.f)} anuncia su retiro. Gracias por todo, ${lt.toLowerCase()}. 🙏`);saveC();renderCareer();return;}
 if(b.dataset.reto!=null){C.camp.reto.acc=b.dataset.reto==='1';kLog.unshift(C.camp.reto.acc?`Aceptaste el reto: ${C.camp.reto.txt.toLowerCase()}. Si lo cumplís, +hype y fans.`:'Rechazaste el reto de los fans.');if(!C.camp.reto.acc)C.hype=Math.max(0,C.hype-2);saveC();renderCareer();return;}
 if(b.id==='kSimW'||b.id==='kSimW2'){simularSemana();return;}
 if(b.id==='kEndW'){terminarSemana();return;}
 if(b.id==='kFight'){careerFight();return;}
 if(b.id==='kSim'){careerSim();return;}
 if(b.id==='kEdit'){editarPeleador();return;}
 if(b.id==='kReset'){if(!b.dataset.sure){b.dataset.sure='1';b.textContent='¿SEGURO? SE BORRA';return;}C=null;store.del('career');kTab='inicio';renderCareer();}
});
function drawCareerPrev(t){const cv=$('#kPrev');if(cv&&C){const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);drawAnimated(g,C.f,48,108,-1,'guard',t,null);}}
