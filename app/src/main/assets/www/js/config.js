// Configuración general y utilidades
const $=s=>document.querySelector(s);
// W (ancho interno) se adapta a la pantalla para que la pelea la ocupe entera; H es fijo
let W=192;
const H=144,ROUND_LEN=90,ROUNDS=3,DMG=.8;
const rnd=Math.random,rand=(a,b)=>a+rnd()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(rnd()*a.length)];
function shade(hex,amt){hex=hex||"#2c2f37";const n=parseInt(hex.slice(1),16);const ch=[n>>16,n>>8&255,n&255].map(v=>clamp(Math.round(amt<0?v*(1+amt):v+(255-v)*amt),0,255));return'#'+((1<<24)|(ch[0]<<16)|(ch[1]<<8)|ch[2]).toString(16).slice(1);}
const fmt=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};


/* ---------------- Datos ---------------- */
const STATS=[['str','Golpeo'],['pow','Poder'],['spd','Velocidad'],['wre','Lucha'],['tdd','Def. derribo'],['bjj','Sumisión'],['car','Cardio'],['chin','Mentón']];
const MOVES={
 jab:{n:'un jab',pw:.09,rw:.38,rec:.2,dmg:3.2,cost:2.5,acc:.14,tgt:'head',reach:40,hi:1,lunge:39},
 cross:{n:'un recto',pw:.14,rw:.5,rec:.28,dmg:6,cost:5,acc:.02,tgt:'head',reach:43,hi:1,lunge:72},
 hook:{n:'un cross izquierdo',pw:.17,rw:.55,rec:.32,dmg:7.5,cost:6.5,acc:-.04,tgt:'head',reach:35,hi:1,lunge:39},
 hookR:{n:'un cross derecho',pw:.19,rw:.58,rec:.34,dmg:8.5,cost:7,acc:-.05,tgt:'head',reach:35,hi:1,lunge:45},
 upper:{n:'un uppercut',pw:.18,rw:.55,rec:.34,dmg:8,cost:7,acc:-.08,tgt:'head',reach:30,hi:0,lunge:45},
 low:{n:'una patada baja',pw:.2,rw:.5,rec:.3,dmg:3.5,cost:6,acc:.06,tgt:'leg',leg:1,reach:44,hi:0,lunge:26},
 high:{n:'una patada alta',pw:.3,rw:.72,rec:.5,dmg:14,cost:12,acc:-.18,tgt:'head',leg:1,reach:49,hi:1,lunge:13},
 td:{n:'un derribo',pw:.3,rw:.62,rec:.5,cost:11,td:1,reach:44,hi:0,lunge:195}
};
const HAND={jab:'l',hook:'l',cross:'r',hookR:'r',upper:'r'};
const HAND_R={jab:1,cross:-1,hook:1,upper:-1},HAND_P={jab:-1,cross:1,hook:-1,upper:1};
const SUBS=[['mata león','un'],['guillotina','una'],['kimura','una'],['triángulo','un'],['palanca de brazo','una']];

