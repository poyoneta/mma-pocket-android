/* ---------------- Promotoras, patrocinadores y entrenadores (modo carrera) ----------------
   Todo inventado, inspirado en el mundo real:
   Circuito Amateur → FFC (promotora chica) → ZENIT o PCL (internacionales) → ULTIMATE WARRIOR (UW, la mejor).
   En cada una hacés 5 peleas: con 4 victorias te llama la siguiente. Si ganás 2 seguidas por KO en el primer round
   te llama antes la siguiente; con 3 seguidas te llama directamente UW. Si perdés mucho te cortan y bajás. */
const PROMOS={
 amateur:{id:'amateur',n:'Circuito Amateur',corto:'AMATEUR',tier:0,col:'#7c8494',col2:'#2a2e36',peleas:5,
  bolsa:nv=>Math.round((300+nv*5)/50)*50,desc:'Peleas amateur: casi no se cobra (solo viáticos). Los ojeadores miran todo.'},
 ffc:{id:'ffc',n:'Furia Fighting Championship',corto:'FFC',tier:1,col:'#e8742a',col2:'#2b1407',peleas:5,
  bolsa:nv=>Math.round((2500+Math.max(0,nv-52)*220)/100)*100,desc:'Promotora chica de la región: galpones, clubes y alguna ciudad. Primeras bolsas de verdad.'},
 zenit:{id:'zenit',n:'ZENIT Championship',corto:'ZENIT',tier:2,col:'#d9b24c',col2:'#20180a',peleas:5,
  bolsa:nv=>Math.round((15000+Math.max(0,nv-60)*1500)/500)*500,desc:'Internacional, con eventos grandes en Asia y Medio Oriente. Tiene su propio cinturón.'},
 pcl:{id:'pcl',n:'Prime Combat League',corto:'PCL',tier:2,col:'#3aa0ff',col2:'#08172a',peleas:5,
  bolsa:nv=>Math.round((13000+Math.max(0,nv-60)*1700)/500)*500,desc:'Liga norteamericana con temporada y bonos por finalizar. Tiene su propio cinturón.'},
 uw:{id:'uw',n:'Ultimate Warrior',corto:'UW',tier:3,col:'#d20a0a',col2:'#140304',peleas:0,
  desc:'La mejor promotora del mundo. Ranking, cinturones y las bolsas más grandes.'}
};
const ESCALERA=[['amateur'],['ffc'],['zenit','pcl'],['uw']];
const promo=()=>PROMOS[(C&&C.org)||'uw']||PROMOS.uw;
const tierDe=()=>promo().tier;
// cuenta de la promotora en redes
const orgCta=()=>{const P=promo();return[P.n,'@'+P.corto.toLowerCase()+'oficial'];};
function logoPromo(id,big){const P=PROMOS[id]||PROMOS.uw;return`<span class="pm-logo ${big?'big':''}" style="--c1:${P.col};--c2:${P.col2}"><b>${P.corto}</b></span>`;}
// sedes de cada promotora
function sedesPromo(){
 const o=C.org,w=(C.orgRec&&C.orgRec.n)||0;
 if(o==='amateur')return w<2?['patio','playa','azotea']:['patio','playa','azotea','gimnasio'];
 if(o==='ffc')return['galpon','gimnasio','galpon','buenos_aires'];
 if(o==='zenit')return C.opp&&C.opp.orgTitle?['abu_dhabi','riad']:['abu_dhabi','riad','cdmx','rio'];
 if(o==='pcl')return C.opp&&C.opp.orgTitle?['nueva_york']:['nueva_york','rio','cdmx','buenos_aires'];
 return null;
}

/* ---------- Patrocinadores: marcas deportivas inventadas ---------- */
// org: desde qué promotora te pueden firmar (0 amateur … 3 UW)
const SPONS=[
 {id:'jaguara',marca:'Jaguara',rubro:'ropa deportiva',org:1,fans:2500,pago:3000,cond:'ganar',bono:4000,logo:'jaguara',c:'#f2c14e'},
 {id:'voltio',marca:'Voltio',rubro:'bebida energética',org:1,fans:6000,pago:6000,cond:'fin',bono:9000,logo:'voltio',c:'#9be22d'},
 {id:'rebote',marca:'Rebote',rubro:'zapatillas',org:2,fans:20000,pago:22000,cond:'ganar',bono:28000,logo:'rebote',c:'#ff5a4a'},
 {id:'vibora',marca:'Víbora Fightwear',rubro:'equipo de pelea',org:2,fans:35000,pago:30000,cond:'fin',bono:45000,logo:'vibora',c:'#2fd07a'},
 {id:'trilinea',marca:'Trilínea',rubro:'ropa deportiva',org:3,fans:90000,pago:110000,cond:'ganar',bono:110000,logo:'trilinea',c:'#ffffff'},
 {id:'titan',marca:'Titán Nutrition',rubro:'suplementos',org:3,fans:150000,pago:140000,cond:'ganar',bono:120000,logo:'titan',c:'#ff9f1a'},
 {id:'vuelo',marca:'Vuelo',rubro:'ropa y zapatillas',org:3,fans:400000,pago:320000,cond:'fin',bono:380000,logo:'vuelo',c:'#ffffff'},
 {id:'cronos',marca:'Cronos',rubro:'relojes',org:3,fans:700000,pago:420000,cond:'titulo',bono:500000,logo:'cronos',c:'#d9b24c'},
 {id:'vertice',marca:'Vértice',rubro:'autos',org:3,fans:1200000,pago:600000,cond:'fin',bono:600000,logo:'vertice',c:'#c0c6d0'}
];
SPONS.forEach(S=>S.n=`${S.marca} · ${S.rubro}`);
const cuposSpons=()=>tierDe()>=3?3:2;
// logos simples dibujados en SVG (inventados)
function logoMarca(id){
 const S=SPONS.find(x=>x.id===id)||{c:'#fff'},c=S.c,w='<svg viewBox="0 0 40 24" width="40" height="24" aria-hidden="true">';
 const L={
  jaguara:`<path d="M6 16c3-6 8-9 14-9 5 0 9 2 13 5l-4 1c-2-1-4-2-7-2l3 4-5-2-3 4-1-4c-3 0-6 1-10 3z" fill="${c}"/>`,
  voltio:`<path d="M22 2 10 14h8l-3 8 13-13h-8z" fill="${c}"/>`,
  rebote:`<path d="M5 18c6-12 12-12 15 0 3-8 8-8 12-2" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="32" cy="7" r="3" fill="${c}"/>`,
  vibora:`<path d="M30 5c-8-3-18 0-18 5 0 6 16 2 16 8 0 4-10 5-18 2" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="31" cy="5" r="2" fill="${c}"/>`,
  trilinea:`<rect x="6" y="5" width="28" height="3" fill="${c}"/><rect x="10" y="11" width="20" height="3" fill="${c}"/><rect x="14" y="17" width="12" height="3" fill="${c}"/>`,
  titan:`<path d="M6 20 16 6l5 7 4-4 9 11z" fill="${c}"/><rect x="15" y="4" width="10" height="2" fill="${c}"/>`,
  vuelo:`<path d="M4 15c10 3 20 1 32-9-6 8-14 14-24 14-4 0-7-2-8-5z" fill="${c}"/><path d="M10 13c5 0 10-2 14-5" stroke="#111" stroke-width="1.2" fill="none"/>`,
  cronos:`<circle cx="20" cy="12" r="9" stroke="${c}" stroke-width="2.5" fill="none"/><path d="M20 6v6l4 3" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  vertice:`<path d="M5 6h7l8 12 8-12h7L20 22z" fill="${c}"/>`
 };
 return w+(L[id]||'')+'</svg>';
}

/* ---------- Entrenadores ---------- */
// ent: índice del entrenamiento que mejor enseña (ENTRENOS), -1 = todo. req: promotora mínima (tier). costo: % de la bolsa.
const COACHES=[
 {id:'tito',n:'Tito Ferreyra',apodo:'"El Viejo"',esp:'Boxeo',ent:0,prest:1,costo:0,req:0,gym:'Gimnasio del barrio',
  frases:['Mano arriba y mentón abajo, pibe.','Al que madruga, el jab no le falla.','Yo te vi empezar, no me hagas quedar mal.']},
 {id:'mara',n:'Mara Quiroga',apodo:'',esp:'Jiu-jitsu',ent:3,prest:2,costo:.05,req:1,gym:'Academia Quiroga BJJ',
  frases:['Posición antes que sumisión.','Si te lleva al piso, el piso es mío.','Respirá. En el piso gana el que piensa.']},
 {id:'dimitri',n:'Dimitri Sokolov',apodo:'',esp:'Lucha',ent:2,prest:3,costo:.08,req:2,gym:'Sokolov Wrestling',
  frases:['Cadera baja, siempre.','El cardio se gana en invierno.','Si él quiere pelear de pie, lo llevamos al piso.']},
 {id:'kenji',n:'Kenji Arakawa',apodo:'',esp:'Kickboxing',ent:1,prest:4,costo:.1,req:2,gym:'Arakawa Kickboxing',
  frases:['La distancia lo es todo.','Una patada baja hoy, una pierna rota en el tercer round.','Paciencia. El golpe aparece.']},
 {id:'ray',n:'Ray Holloway',apodo:'"Big Ray"',esp:'MMA completo',ent:-1,prest:5,costo:.12,req:3,reqRank:15,gym:'Holloway Elite MMA',
  frases:['Los campeones se hacen cuando nadie mira.','Vamos a ganar este round, después el siguiente.','No peleamos por plata. Peleamos por el legado.']}
];
const coach=()=>COACHES.find(x=>x.id===(C&&C.coach))||COACHES[0];
const amistad=id=>((C&&C.amistad)||{})[id||coach().id]||0;
const nivelAmistad=a=>a>=80?'Familia':a>=50?'Amigos':a>=20?'Confianza':'Recién conocidos';
function sumaAmistad(n){C.amistad=C.amistad||{};const id=coach().id;C.amistad[id]=Math.max(0,Math.min(100,(C.amistad[id]||0)+n));}
// cuánto menos se gasta el cuerpo (hasta 50 % con amistad 100) y menos lesiones
const factorDesgaste=()=>1-amistad()/200;
const coachDisponible=k=>tierDe()>=k.req&&(!k.reqRank||(C.org==='uw'&&(C.champ||C.rank<=k.reqRank)));
// Consejo para el campamento según el rival
function consejoCamp(){
 const K=coach(),o=C.opp;if(!o)return null;const s=o.s,ent=Object.entries(s).sort((a,b)=>b[1]-a[1]),fuerte=ent[0][0],flojo=ent[ent.length-1][0];
 // con poco prestigio, a veces se equivoca (lee mal al rival)
 const acierta=Math.random()<.55+K.prest*.09,k=acierta?fuerte:pick(['str','wre','car','bjj','pow'].filter(x=>x!==fuerte));
 const rec={wre:2,tdd:2,bjj:3,str:5,pow:5,spd:0,car:4,chin:1}[k];
 const porque={wre:'te va a querer derribar: hacé lucha',tdd:'defiende bien los derribos: trabajá lucha para pasarle',bjj:'es peligroso en el piso: jiu-jitsu',str:'pega mucho de pie: fuerza para bancar golpes',pow:'tiene mano pesada: fuerza y mentón',spd:'es rápido: boxeo para no quedarte',car:'tiene mucho aire: cardio, que va a ser larga',chin:'tiene mentón de piedra: patadas para gastarlo'}[k];
 const fl=flojo===k?ent[ent.length-2][0]:flojo;
 return{ent:rec,txt:`${K.n.split(' ')[0]}: "${o.last} ${porque}. Y fijate que flojea en ${statName(fl).toLowerCase()}."`,revela:K.prest>=3};
}
// Consejo sobre qué oferta aceptar: la que mejor combina chances de ganar y plata
function consejoOferta(){
 const K=coach();if(!C.offers||!C.offers.length)return null;const yo=ovr(C.f);
 let best=0,bv=-1e9;C.offers.forEach((o,i)=>{const d=yo-ovr(o.f),ch=1/(1+Math.exp(-d/4)),v=(K.prest<=1?.4:1)*ch*100+Math.log10(purse(o.f,o.title)+1)*(K.prest<=1?20:8)+(o.title?40:0);if(v>bv){bv=v;best=i;}});
 const o=C.offers[best],d=Math.round(yo-ovr(o.f));
 const txt=d>=4?`Con ${o.f.last} tenés ventaja. Ganá y seguí subiendo.`:d>=-2?`${o.f.last} es parejo, pero te sirve: si le ganás, te miran.`:`${o.f.last} es más que vos. Solo si querés arriesgar.`;
 return{i:best,txt:`${K.n.split(' ')[0]}: "${txt}"`};
}
