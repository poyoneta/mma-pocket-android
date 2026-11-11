/* ---------------- Mando (PlayStation / Xbox) ----------------
   Usa la Gamepad API del navegador. Conectá el mando por USB o Bluetooth y apretá cualquier botón.
   Pelea:  □ jab · △ recto · L1+□ cross izq. · L1+△ cross der. · L2+□/△ uppercut · ○ low kick · ✕ high kick
           R1 cubrirse/sprawl · R2 derribo · stick izq. o cruz: moverse / agacharse · Options: pausa
   Piso:   □ / △ / ○ = las tres acciones de la botonera
   Menús:  cruz o stick para moverse · ✕ elegir · ○ volver · en la elección: L1/R1 cambian la pestaña */
const padIn={left:false,right:false,down:false,block:false};
const PAD={on:false,xbox:false,prev:[],hold:{}};
function getPad(){const ps=navigator.getGamepads?navigator.getGamepads():[];for(const p of ps)if(p&&p.connected!==false)return p;return null;}
function setPadOn(on,id){
 PAD.on=on;PAD.xbox=/xbox|xinput|microsoft/i.test(id||'');
 document.body.classList.toggle('pad-on',on);document.body.classList.toggle('pad-xbox',on&&PAD.xbox);
 if(G)renderSide(G.mode==='stand'?'stand':G.top==='p'?'top':'bottom');
}
window.addEventListener('gamepadconnected',e=>setPadOn(true,e.gamepad.id));
window.addEventListener('gamepaddisconnected',()=>{const p=getPad();setPadOn(!!p,p&&p.id);});
// Ícono de botón: forma de PlayStation (o letra de Xbox si el mando es de Xbox)
const GLYPH={'□':['s','X'],'△':['t','Y'],'○':['o','B'],'✕':['x','A']};
function badge(sym){
 return sym.split('+').map(s=>{s=s.trim();const g=GLYPH[s];
  if(g)return`<i class="gl ${g[0]}"><span class="ps">${s}</span><span class="xb">${g[1]}</span></i>`;
  const xb={L1:'LB',R1:'RB',L2:'LT',R2:'RT',Options:'Menu'}[s];
  return`<i class="gl sh"><span class="ps">${s}</span><span class="xb">${xb||s}</span></i>`;}).join('<span class="gplus">+</span>');
}
function moveFocusList(bs,d){if(!bs.length)return;let i=bs.indexOf(document.activeElement);i=i<0?0:(i+d+bs.length)%bs.length;bs[i].focus();}
// Navegación por pantalla: busca el botón más cercano en esa dirección
function spatialMove(dir){
 const root=$('#'+curScreen);const els=[...root.querySelectorAll('button,select,input,a[href]')].filter(e=>!e.disabled&&e.offsetParent!==null);
 if(!els.length)return;const cur=document.activeElement;if(!els.includes(cur)){els[0].focus();return;}
 const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bd=1e9;
 for(const e of els){if(e===cur)continue;const q=e.getBoundingClientRect(),dx=q.left+q.width/2-cx,dy=q.top+q.height/2-cy;
  const h=dir==='left'||dir==='right',ok=dir==='left'?dx<-4:dir==='right'?dx>4:dir==='up'?dy<-4:dy>4;if(!ok)continue;
  const sc=(h?Math.abs(dx):Math.abs(dy))+(h?Math.abs(dy):Math.abs(dx))*2.2;if(sc<bd){bd=sc;best=e;}}
 if(best){best.focus();best.scrollIntoView({block:'nearest',behavior:'smooth'});}
}
function padPoll(t){
 const p=getPad();if(!p){if(PAD.on)setPadOn(false);return;}if(!PAD.on)setPadOn(true,p.id);
 const now=p.buttons.map(b=>!!(b&&(b.pressed||b.value>.5))),edge=i=>now[i]&&!PAD.prev[i];
 const ax=p.axes[0]||0,ay=p.axes[1]||0;
 const dirs={left:now[14]||ax<-.5,right:now[15]||ax>.5,up:now[12]||ay<-.5,down:now[13]||ay>.5};
 const rep=k=>{if(!dirs[k]){PAD.hold[k]=0;return false;}if(!PAD.hold[k]){PAD.hold[k]=t+.35;return true;}if(t>=PAD.hold[k]){PAD.hold[k]=t+.12;return true;}return false;};
 const inFight=G&&!G.paused&&(G.phase==='fight'||G.phase==='intro');
 if(inFight){
  padIn.left=dirs.left;padIn.right=dirs.right;padIn.down=dirs.down;padIn.block=now[5];
  if(edge(9))pause(true);
  else if(G.mode==='ground'){const bs=$(G.top==='p'?'#padTop':'#padBot').querySelectorAll('[data-k]');if(edge(2))doG(bs[0].dataset.k);if(edge(3))doG(bs[1].dataset.k);if(edge(1))doG(bs[2].dataset.k);}
  else{
   if(edge(2))doP(now[4]?'hook':now[6]?'upper':'jab');
   if(edge(3))doP(now[4]?'hookR':now[6]?'upper':'cross');
   if(edge(1))doP('low');if(edge(0))doP('high');if(edge(7))doP('td');
  }
 }else{
  padIn.left=padIn.right=padIn.down=padIn.block=false;
  if(!$('#ov').hidden){
   const bs=[...$('#ovc').querySelectorAll('button')];
   if(rep('down')||rep('right'))moveFocusList(bs,1);if(rep('up')||rep('left'))moveFocusList(bs,-1);
   if(edge(0)){const f=document.activeElement;(bs.includes(f)?f:bs[0])?.click();}
   if(edge(1)||edge(9)){if(G&&G.paused)pause(false);else if(!G)hideOv();}
  }else if(curScreen==='quick'){
   if(rep('left'))cycle('p',-1);if(rep('right'))cycle('p',1);if(rep('up'))cycle('r',-1);if(rep('down'))cycle('r',1);
   if(edge(4))setVsTab(vsTab-1);if(edge(5))setVsTab(vsTab+1);
   if(edge(0)||edge(9))$('#go').click();if(edge(1))showScreen('home');
  }else if(curScreen!=='fight'){
   for(const k of['left','right','up','down'])if(rep(k))spatialMove(k);
   if(edge(0)){const a=document.activeElement;if(a&&a!==document.body&&$('#'+curScreen).contains(a))a.click();else spatialMove('down');}
   if(edge(1)&&curScreen!=='home')showScreen('home');
  }
 }
 PAD.prev=now;
}
// Dibujo del mando con cada función (para el tutorial y la pausa)
function mandoSVG(){
 const L=(x,y,tx,ty,txt,anchor)=>`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}"/><text x="${anchor==='end'?tx-4:tx+4}" y="${ty+4}" text-anchor="${anchor}">${txt}</text>`;
 return`<svg class="mando" viewBox="-40 24 640 250" role="img" aria-label="Controles con mando">
 <g class="body"><path d="M175,95 C200,80 360,80 385,95 C445,110 475,190 470,230 C465,262 435,268 415,250 L375,212 C345,200 215,200 185,212 L145,250 C125,268 95,262 90,230 C85,190 115,110 175,95 Z"/>
 <rect x="170" y="68" width="62" height="16" rx="6"/><rect x="172" y="48" width="54" height="16" rx="6"/><rect x="328" y="68" width="62" height="16" rx="6"/><rect x="334" y="48" width="54" height="16" rx="6"/>
 <path d="M195,125 h12 v-12 h12 v12 h12 v12 h-12 v12 h-12 v-12 h-12 z" class="dp"/>
 <circle cx="238" cy="188" r="20"/><circle cx="322" cy="188" r="20"/><circle cx="238" cy="188" r="11" class="in"/><circle cx="322" cy="188" r="11" class="in"/>
 <rect x="250" y="112" width="16" height="9" rx="3"/><rect x="294" y="112" width="16" height="9" rx="3"/>
 <circle cx="370" cy="113" r="11" class="bt t"/><circle cx="392" cy="135" r="11" class="bt o"/><circle cx="370" cy="157" r="11" class="bt x"/><circle cx="348" cy="135" r="11" class="bt s"/>
 <text x="370" y="118" class="gly">△</text><text x="392" y="140" class="gly">○</text><text x="370" y="162" class="gly">✕</text><text x="348" y="140" class="gly">□</text>
 <text x="201" y="80" class="sh">L1</text><text x="199" y="60" class="sh">L2</text><text x="359" y="80" class="sh">R1</text><text x="361" y="60" class="sh">R2</text></g>
 <g class="lbl">
 ${L(172,56,150,40,'L2+□ o △: uppercut','end')}${L(170,76,150,72,'L1+□ / L1+△: cross izq. / der.','end')}
 ${L(200,131,150,132,'Cruz: moverse','end')}${L(220,196,150,236,'Stick izq.: moverse','end')}
 ${L(388,56,410,40,'R2: derribo','start')}${L(390,76,410,72,'R1: cubrirse / sprawl','start')}
 ${L(380,110,430,104,'△: recto','start')}${L(403,135,430,136,'○: low kick','start')}${L(380,160,430,168,'✕: high kick','start')}
 ${L(342,146,430,200,'□: jab','start')}${L(302,116,410,236,'Options: pausa','start')}
 </g></svg><p class="note ctr">En mando de Xbox: □ = X · △ = Y · ○ = B · ✕ = A · L1/R1 = LB/RB · L2/R2 = LT/RT</p>`;
}
