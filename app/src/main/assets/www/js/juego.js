// Lógica de la pelea: estado, golpes, IA, piso, rounds, loop y controles
/* ---------------- Estado ---------------- */
let G=null,lastFight=null,input={block:false,left:false,right:false,down:false},buffer=null;
function mkF(d,x,face){return{d,s:d.s,hp:100,st:100,legs:0,state:'idle',t:0,t0:0,act:null,aiT:1,hit:0,guard:100,x,face,vx:0,kv:0,walk:0,mv:0,mvT:0,gT:0,guardUp:0,stats:{thr:0,land:0,dmg:0,head:0,leg:0,td:0,tdA:0,subA:0,ctrl:0}};}
function ticker(s){$('#tick').textContent=s;}
function txt(s,x,y,col,life){if(!G)return;G.texts.forEach(t=>t.y-=10);G.texts.push({s,x,y,col:col||'#fff',life:life||.9,max:life||.9});if(G.texts.length>3)G.texts.shift();}
function txtAt(f,s,col){txt(s,clamp(Math.round(f.x),46,W-46),GY-120,col);}
function spark(x,y,col,n){for(let i=0;i<(n||8);i++)G.parts.push({x,y,vx:rand(-70,70),vy:rand(-90,20),life:rand(.2,.4),col});}
const spdMul=f=>1.18-clamp(f.s.spd-f.legs*.35,20,100)/100*.36+(f.st<15?.2:0);
const walkSpd=f=>58*(.8+f.s.spd/250)*(1-f.legs/150);
const freeS=s=>s==='idle'||s==='block'||s==='crouch';
function resetPos(){G.p.x=W/2-42;G.r.x=W/2+42;G.p.face=1;G.r.face=-1;for(const f of[G.p,G.r]){f.vx=f.kv=0;f.mvT=0;}}

// ctx: {kind:'quick'|'tourney'|'career', rounds, title, onDone(res)}
function startFight(pd,rd,ctx){
 if(!pd){if(!lastFight)return;({pd,rd,ctx}=lastFight);}
 ctx=ctx||{kind:'quick',rounds:3};lastFight={pd,rd,ctx};
 initAudio();
 G={ctx,rounds:ctx.rounds||3,p:mkF(pd,W/2-42,1),r:mkF(rd,W/2+42,-1),mode:'stand',top:null,round:1,time:ROUND_LEN,phase:'intro',introT:1.6,counterT:0,counterFor:null,
  texts:[],parts:[],shake:0,flashRed:0,cards:[],t:0,paused:false,res:null,koT:0,
  bar:{x:0,d:1,zc:.5,zw:.25,cd:0},gT:1.2,pSub:0,rSub:0,subOn:false,subT:0,esc:0,pEsc:0,defT:0,gAnim:0,gAtk:'p',pSubName:SUBS[0],rSubName:SUBS[0]};
 snapshotRound();buffer=null;clearInput();
 showScreen('fight');hideOv();setPad('stand');if(typeof vpStart==='function')vpStart();
 $('#hpN').textContent=G.p.d.last;$('#hrN').textContent=G.r.d.last;$('#rseg').innerHTML='<i></i>'.repeat(G.rounds);
 requestAnimationFrame(resize);
 ticker(`${ctx.title?ctx.title+' · ':''}Round 1: ${G.p.d.last} contra ${G.r.d.last}.`);sfx('bell');
}
function clearInput(){input.block=input.left=input.right=input.down=false;document.querySelectorAll('.b.on').forEach(b=>b.classList.remove('on'));}
function leaveFight(to){G=null;hideOv();clearInput();showScreen(to||'quick');}
function finishCtx(){const ctx=G.ctx,res=G.res;G=null;hideOv();clearInput();if(ctx.onDone)ctx.onDone(res);else showScreen('quick');}
function setPad(m){$('#padStand').hidden=m!=='stand';$('#padTop').hidden=m!=='top';$('#padBot').hidden=m!=='bottom';clearInput();renderSide(m);if(typeof vpLabels==='function')vpLabels(m);}
function snapshotRound(){G.rs={p:{...G.p.stats},r:{...G.r.stats}};}

/* ---------------- Parado ---------------- */
function doP(k){
 if(!G||G.phase!=='fight'||G.paused||G.mode!=='stand')return;
 if(!freeS(G.p.state)){buffer={k,t:.22};return;}
 startAtk(G.p,k);
}
function startAtk(f,k){
 const m=MOVES[k],isP=f===G.p;
 f.state='wind';f.act=k;f.t=f.tw=(isP?m.pw:m.rw)*spdMul(f)*(f.st<10?1.4:1);f.st=Math.max(0,f.st-m.cost*(isP?1:.7));
 f.kv+=f.face*m.lunge;f.vx=0;f.mvT=0;
 if(isP)G.r.react=1;
}
function setCounter(b){G.counterFor=b;G.counterT=.8;if(b===G.p){txtAt(G.r,'¡CONTRA!','#ffd23f');ticker(`${G.r.d.last} falla y queda de contra.`);}}
function whiff(a,b,msg){sfx('whoosh');a.state='missed';a.t=a.t0=a===G.p?.3:.5;txtAt(b,msg,'#8b93a5');setCounter(b);}
function land(a,b,m,k,mult,open,intr){
 const isP=a===G.p;
 let dmg=DMG*m.dmg*(.5+a.s.pow/100*.75)*(.55+.45*a.st/100)*(1.3-b.s.chin/100*.55)*rand(.85,1.15)*mult;
 if(open)dmg*=1.5;const crit=open&&rnd()<.18;if(crit)dmg*=1.6;
 b.hp=Math.max(0,b.hp-dmg);a.stats.land++;a.stats.dmg+=dmg;a.stats[m.tgt]=(a.stats[m.tgt]||0)+1;
 if(k==='low'){b.legs=Math.min(60,b.legs+7);b.st=Math.max(0,b.st-5);}
 b.hit=.16;b.kv+=a.face*(35+dmg*7);
 G.stop=Math.max(G.stop||0,dmg>=7?.12:.065);G.shake=Math.max(G.shake,dmg>=7?.2:.08);   // golpe que entra: se congela un instante (sensación de impacto)
 sfx(dmg>=7?'big':'hit');
 const hy=k==='low'?GY-15:(b.state==='crouch'?GY-58:GY-76);
 spark(b.x-a.face*8,hy,dmg>=7?'#ffd23f':isP?'#ffffff':'#ff8a7a',dmg>=7?12:7);
 if(isP){
  if(dmg>=4||b.state!=='wind'){if(b.state==='wind')txtAt(b,'¡LO CORTÁS!','#ffd23f');b.state='hurt';b.t=.22+(dmg>8?.2:0);b.act=null;}
  if(rnd()<.35)b.guardUp=1;
  if(crit)txtAt(b,'¡CRÍTICO!','#ffd23f');
 }else{
  b.state='hurt';b.t=.28;b.act=null;G.shake=.25;G.flashRed=Math.min(.45,.12+dmg/30);buzz(dmg>7?60:30);
 }
 if(dmg>=7&&b.hp<30&&b.hp>0){b.state='stun';b.t=.9;txtAt(b,isP?'¡LO SACUDISTE!':'¡TE SACUDIÓ!','#ff6b5a');}
 ticker(`${a.d.last} conecta ${m.n}${open?' de contra':''}.`);
 if(b.hp<=0)finish(a,dmg>=6?(k==='high'?'KO · patada alta':'KO'):'TKO · golpes');
}
function resolveHit(a,b,k){
 const m=MOVES[k],isP=a===G.p,d=Math.abs(a.x-b.x);
 if(m.td){if(d>m.reach){a.stats.tdA++;a.state='stun';a.t=.5;a.act=null;txtAt(b,'NO LLEGA','#8b93a5');setCounter(b);return;}tryTD(a,b,isP);return;}
 a.stats.thr++;
 if(d>m.reach+2){whiff(a,b,'NO LLEGA');return;}
 if(m.hi&&b.state==='crouch'){whiff(a,b,b===G.p?'¡PASÓ POR ARRIBA!':'SE AGACHA');return;}
 if(b.state==='block'){
  if(k==='low'){land(a,b,m,k,1,false,false);return;}
  if(k==='high'&&rnd()<.3){land(a,b,m,k,.5,false,false);return;}
  b.st=Math.max(0,b.st-3);b.kv+=a.face*30;b.guard-=10+m.dmg*1.6;
  if(b.guard<=0){b.guard=35;b.state='stun';b.t=.9;b.act=null;txtAt(b,'¡GUARDIA ROTA!','#ff6b5a');sfx('big');setCounter(a);if(b===G.p){G.shake=.25;buzz(60);}return;}
  txtAt(b,'BLOQUEA','#9fb3c8');sfx('block');spark(b.x-a.face*10,GY-76,'#cfd8e3',4);return;
 }
 const open=(G.counterFor===a&&G.counterT>0)||b.state==='missed'||b.state==='stun',intr=b.state==='wind';
 let mult=1,ch=.8+m.acc*.5+(a.s.str-(b.s.spd+b.s.str)/2)/220+(open?.3:0)+(intr?.1:0);
 if(k==='upper'&&b.state==='crouch'){ch+=.25;mult=1.4;}
 ch*=.75+.25*a.st/100;
 if(rnd()<ch)land(a,b,m,k,mult,open,intr);else whiff(a,b,isP?'LO ESQUIVA':'¡LO ESQUIVÁS!');
}
function tryTD(a,b,isP){
 a.stats.tdA++;
 let ch=.3+(a.s.wre-b.s.tdd)/110+(a.st-b.st)/400;
 const away=Math.sign(b.vx)===a.face&&Math.abs(b.vx)>1;
 if(b.state==='block')ch=.18+(a.s.wre-b.s.tdd)/120;
 else{ch+=.12;if(G.counterFor===a&&G.counterT>0)ch+=.25;if(['missed','stun','hurt','rec','wind'].includes(b.state))ch+=.12;}
 if(away)ch-=.2;
 ch=clamp(ch,.06,.92);
 if(rnd()<ch){a.stats.td++;txt('¡DERRIBO!',W/2,40,'#7fb2ff');sfx('slam');G.shake=.3;buzz(50);ticker(`${a.d.last} lo lleva al piso.`);enterGround(isP?'p':'r');}
 else{a.st=Math.max(0,a.st-6);a.state='stun';a.t=.6;a.act=null;sfx('block');
  txtAt(b,isP?'LO FRENA':'¡SPRAWL!','#cfd8e3');ticker(`${b.d.last} frena el derribo.`);setCounter(b);}
}
function ai(dt){
 const r=G.r,p=G.p,d=Math.abs(r.x-p.x),tw=Math.sign(p.x-r.x)||1;
 r.vx=0;
 if(r.state==='block'||r.state==='crouch'){r.gT-=dt;if(r.gT<=0)r.state='idle';return;}
 if(r.state!=='idle')return;
 const sk=(r.s.spd+r.s.str)/2/100;
 if(r.react&&p.state==='wind'){r.react=0;const m=MOVES[p.act],q=rnd();
  if(d<=m.reach+10){if(q<sk*.32*(r.guard<40?.4:1)){if(m.hi&&rnd()<.55){r.state='crouch';r.gT=.45;}else{r.state='block';r.gT=.5;}return;}if(q<sk*.45){r.mv=-tw;r.mvT=.35;}}}
 if(G.counterFor===r&&G.counterT>0&&d<44&&rnd()<.6+sk*.3){startAtk(r,pick(d<32?['upper','hook','hookR','cross']:['cross','jab','low']));return;}
 if(r.mvT>0){r.mvT-=dt;r.vx=r.mv*walkSpd(r);}
 r.aiT-=dt;if(r.aiT>0)return;
 r.aiT=rand(.3,.85)*(1.25-r.s.spd/220)*(r.st<30?1.4:1);
 if(r.st<12&&rnd()<.6){r.state='block';r.gT=rand(.8,1.3);return;}
 const wr=(r.s.wre-55)/40,want=wr>.6?31:39;
 if(d>52){r.mv=tw;r.mvT=rand(.3,.7);r.aiT=r.mvT*.8;return;}
 const roll=rnd(),blockP=(.1+(1-r.hp/100)*.12+(r.guardUp?.25:0))*(r.guard<40?.35:1);r.guardUp=0;
 const tdP=d<47?Math.max(.03,wr*.26)*(['rec','hurt','missed'].includes(p.state)?1.6:1):0;
 if(roll<blockP){r.state='block';r.gT=rand(.4,.9);return;}
 if(roll<blockP+tdP){startAtk(r,'td');return;}
 if(roll<blockP+tdP+.12){r.mv=d<want?-tw:tw;r.mvT=rand(.2,.45);return;}
 const w={jab:3,cross:2.6,hook:2,hookR:1.6,upper:1.1,low:Math.max(.4,1.4+(r.s.str-60)/40),high:Math.max(.2,.5+(r.s.str-70)/30)};
 if(p.state==='crouch'){w.upper*=3;w.low*=2;}
 const opts=Object.keys(w).filter(k=>MOVES[k].reach+MOVES[k].lunge/9>=d);
 if(!opts.length){r.mv=tw;r.mvT=rand(.2,.4);return;}
 let tot=0;opts.forEach(k=>tot+=w[k]);let x=rnd()*tot,k=opts[0];for(const kk of opts){x-=w[kk];if(x<=0){k=kk;break;}}
 startAtk(r,k);
}
function stepF(f,dt){
 if(freeS(f.state))return;
 f.t-=dt;if(f.t>0)return;
 if(f.state==='wind'){const k=f.act;resolveHit(f,f===G.p?G.r:G.p,k);if(G.mode!=='stand'||G.phase!=='fight')return'x';if(f.state==='wind'){f.state='rec';f.t0=f.t=MOVES[k].rec*spdMul(f);}}
 else{f.state='idle';f.act=null;if(f===G.r&&f.aiT<=0)f.aiT=rand(.15,.45);}
}
function updStand(dt){
 const p=G.p,r=G.r;
 if(G.counterT>0){G.counterT-=dt;if(G.counterT<=0)G.counterFor=null;}
 if(buffer){buffer.t-=dt;if(buffer.t<=0)buffer=null;}
 p.face=r.x>p.x?1:-1;r.face=-p.face;
 if(stepF(p,dt)==='x'||stepF(r,dt)==='x')return;
 if(freeS(p.state)){p.state=(input.block||padIn.block)?'block':(input.down||padIn.down)?'crouch':'idle';if(buffer){const b=buffer;buffer=null;startAtk(p,b.k);}}
 p.vx=0;
 if(p.state==='idle'){const dd=((input.right||padIn.right)?1:0)-((input.left||padIn.left)?1:0);p.vx=dd*walkSpd(p)*(dd===-p.face?.85:1);}
 ai(dt);
 for(const f of[p,r]){f.x+=(f.vx+f.kv)*dt;f.kv*=Math.max(0,1-9*dt);if(Math.abs(f.vx)>1)f.walk+=dt*12;}
 const dx=r.x-p.x;if(Math.abs(dx)<MINSEP){const push=(MINSEP-Math.abs(dx))/2,s=Math.sign(dx)||1;p.x-=push*s;r.x+=push*s;}
 for(const f of[p,r])f.x=clamp(f.x,WALL,W-WALL);
 if(Math.abs(r.x-p.x)<MINSEP){const lo=p.x<r.x?p:r,hi=lo===p?r:p;if(lo.x<=WALL+.5)hi.x=lo.x+MINSEP;else lo.x=hi.x-MINSEP;}
}

/* ---------------- Piso ---------------- */
function enterGround(top){
 Object.assign(G,{mode:'ground',top,pSub:0,rSub:0,subOn:false,esc:0,pEsc:0,defT:0,gT:1.1,gAnim:0,counterT:0,pSubName:pick(SUBS)});
 for(const f of[G.p,G.r]){f.state='idle';f.act=null;f.vx=f.kv=0;}buffer=null;newZone();setPad(top==='p'?'top':'bottom');
 setTimeout(()=>{if(G&&G.mode==='ground')ticker(top==='p'?'Estás arriba: golpeá o buscá la sumisión. Tocá cuando la marca esté en verde.':'Estás abajo: defendete y escapá. Tocá cuando la marca esté en verde.');},700);
}
function leaveGround(msg){G.mode='stand';G.top=null;G.subOn=false;setPad('stand');for(const f of[G.p,G.r]){f.state='idle';f.act=null;f.vx=f.kv=0;}const mid=clamp((G.p.x+G.r.x)/2,WALL+36,W-WALL-36),s=G.p.x<=G.r.x?1:-1;G.p.x=mid-s*30;G.r.x=mid+s*30;G.r.aiT=.8;if(msg)txt(msg,W/2,50,'#cfd8e3');}
function newZone(){const p=G.p;G.bar.zw=.16+((p.s.bjj+p.s.wre)/2)/100*.14;G.bar.zc=rand(.2,.8);}
function judge(){const d=Math.abs(G.bar.x-G.bar.zc);return d<G.bar.zw*.18?2:d<G.bar.zw/2?1:0;}
function groundHit(a,b,base){
 const dmg=DMG*base*(.5+a.s.pow/100*.75)*(1.3-b.s.chin/100*.55)*rand(.85,1.15);
 b.hp=Math.max(0,b.hp-dmg);a.stats.land++;a.stats.dmg+=dmg;a.stats.head++;b.hit=.16;G.gAnim=.25;G.gAtk=a===G.p?'p':'r';sfx('hit');
 if(b===G.p){G.shake=.2;G.flashRed=.25;buzz(30);}
 spark((W-152)/2+12,110,'#ffffff',6);
 if(b.hp<=0)finish(a,'TKO · golpes en el piso');
}
function doG(k){
 if(!G||G.phase!=='fight'||G.paused||G.mode!=='ground'||G.bar.cd>0)return;
 const p=G.p,r=G.r,q=judge(),bf=clamp(.9+(p.s.bjj-r.s.bjj)/80,.4,1.6);G.bar.cd=.3;
 txt(q===2?'¡PERFECTO!':q===1?'BIEN':'ERRASTE',W/2,110,q===2?'#ffd23f':q===1?'#4fcf6a':'#8b93a5',.6);
 if(G.top==='p'){
  if(k==='gnp'){p.stats.thr++;p.st=Math.max(0,p.st-4);if(q)groundHit(p,r,q===2?7:4.5);else G.esc+=16;ticker(`${p.d.last} castiga desde arriba.`);}
  else if(k==='sub'){if(G.pSub<1){p.stats.subA++;G.pSubName=pick(SUBS);}p.st=Math.max(0,p.st-7);
   if(q){G.pSub+=(q===2?30:14)*bf;ticker(`${p.d.last} busca ${G.pSubName[1]} ${G.pSubName[0]}.`);}else{G.esc+=28;G.pSub=Math.max(0,G.pSub-15);}}
  else if(k==='up'){leaveGround('DE PIE');ticker(`${p.d.last} vuelve a pararse.`);return;}
 }else{
  if(k==='def'){
   if(G.subOn){G.rSub-=q===2?42:q===1?26:6;if(G.rSub<=0){G.subOn=false;G.rSub=0;txt('¡TE ZAFASTE!',W/2,60,'#4fcf6a');ticker(`${p.d.last} se zafa de la ${G.rSubName[0]}.`);}}
   else G.defT=q===2?1.4:q===1?.9:0;
  }else if(k==='esc'){
   if(G.subOn)txt('¡ATRAPADO!',W/2,60,'#ff6b5a');
   else{p.st=Math.max(0,p.st-6);G.pEsc+=(q===2?34:q===1?20:0)*clamp(.9+(p.s.wre-r.s.wre)/80,.4,1.5)*(.6+.4*p.st/100);
    if(G.pEsc>=100){ticker(`${p.d.last} se levanta.`);leaveGround('¡TE PARASTE!');return;}}
  }else if(k==='sub'){if(G.pSub<1){p.stats.subA++;G.pSubName=pick(SUBS);}p.st=Math.max(0,p.st-7);if(q)G.pSub+=(q===2?26:12)*bf;}
 }
 if(G.phase==='fight'&&G.pSub>=100){finish(p,'Sumisión · '+G.pSubName[0]);return;}
 newZone();
}
function updGround(dt){
 const p=G.p,r=G.r,pTop=G.top==='p';
 (pTop?p:r).stats.ctrl+=dt;
 const b=G.bar;b.x+=b.d*dt*1.25*(1+(1-p.st/100)*.4);if(b.x>1){b.x=1;b.d=-1;}if(b.x<0){b.x=0;b.d=1;}
 b.cd=Math.max(0,b.cd-dt);G.defT=Math.max(0,G.defT-dt);G.gAnim=Math.max(0,G.gAnim-dt);
 G.pSub=Math.max(0,G.pSub-dt*10);
 if(pTop){
  G.esc+=dt*Math.max(2,4+((r.s.wre+r.s.bjj)/2-p.s.wre)/6)*(.5+r.st/200);
  if(G.esc>=100){ticker(`${r.d.last} se levanta.`);leaveGround('SE LEVANTÓ');}
 }else{
  G.gT-=dt;
  if(G.subOn){G.subT-=dt;G.rSub+=dt*(16+(r.s.bjj-p.s.bjj)/3);
   if(Math.floor(G.t*4)!==Math.floor((G.t-dt)*4))sfx('tick');
   if(G.rSub>=100){finish(r,'Sumisión · '+G.rSubName[0]);return;}
   if(G.subT<=0){G.subOn=false;G.rSub=0;r.st=Math.max(0,r.st-8);txt('LA SUELTA',W/2,60,'#cfd8e3');}}
  else if(G.gT<=0){
   G.gT=rand(.9,1.5)*(1.15-r.s.spd/300);
   if(rnd()<.12+r.s.bjj/450){G.subOn=true;G.subT=4;G.rSub=12;G.rSubName=pick(SUBS);r.stats.subA++;txt('¡SUMISIÓN!',W/2,60,'#ff6b5a');sfx('alarm');buzz(80);ticker(`¡${r.d.last} te busca ${G.rSubName[1]} ${G.rSubName[0]}! Tocá DEFENDER.`);}
   else{r.stats.thr++;G.gAnim=.25;G.gAtk='r';if(G.defT>0){txt('BLOQUEADO',W/2,96,'#9fb3c8');sfx('block');r.st=Math.max(0,r.st-2);}else groundHit(r,p,5);}
  }
  if(G.phase==='fight'&&r.s.wre<65&&!G.subOn&&rnd()<dt*.06){ticker(`${r.d.last} prefiere pelear parado.`);leaveGround('SE PARA');}
 }
}

/* ---------------- Rounds y final ---------------- */
function regen(dt){for(const f of[G.p,G.r]){f.guard=Math.min(100,f.guard+(f.state==='block'?2:12)*dt);const idle=f.state==='idle'||f.state==='block';f.st=Math.min(100,f.st+(idle?7:3)*(.5+f.s.car/100*.7)*(G.mode==='ground'?.6:1)*dt);}}
function finish(a,method){
 const lo=a===G.p?G.r:G.p;
 G.res={w:a===G.p?'p':'r',method,round:G.round,time:ROUND_LEN-G.time};
 lo.state='ko';G.phase='ko';G.koT=2.2;G.counterT=0;G.subOn=false;sfx('big');sfx('bell');buzz(120);
 txt(method.startsWith('Sumisión')?'¡SE RINDE!':'¡SE TERMINÓ!',W/2,50,'#ffd23f',2);
 ticker(`${a.d.last} gana por ${method.toLowerCase()} en el round ${G.round}.`);
}
function roundPts(f,key){const s=f.stats,o=G.rs[key];return(s.dmg-o.dmg)+(s.td-o.td)*5+(s.ctrl-o.ctrl)*.35+(s.subA-o.subA)*2+(s.land-o.land)*.3;}
function scoreRound(){const pp=roundPts(G.p,'p'),rp=roundPts(G.r,'r');
 G.cards.push([0,1,2].map(()=>{const a=pp*rand(.85,1.15),b=rp*rand(.85,1.15);if(Math.abs(a-b)<1.5)return[10,10];const hi=Math.max(a,b),lo=Math.min(a,b),big=hi>lo*2.2&&hi-lo>28;return a>b?[10,big?8:9]:[big?8:9,10];}));}
function endRound(){
 if(G.mode==='ground')leaveGround();
 sfx('bell');scoreRound();
 if(G.round>=G.rounds){decision();return;}
 G.phase='break';showBreak();
}
function decision(){
 const tot=[0,1,2].map(j=>G.cards.reduce((a,cd)=>[a[0]+cd[j][0],a[1]+cd[j][1]],[0,0]));
 let pw=0,rw=0;tot.forEach(t=>{if(t[0]>t[1])pw++;else if(t[1]>t[0])rw++;});
 const w=pw>=2?'p':rw>=2?'r':'d',n=Math.max(pw,rw);
 const m=w==='d'?'Empate':n===3?'Decisión unánime':(pw+rw===3?'Decisión dividida':'Decisión mayoritaria');
 G.res={w,method:m,round:G.rounds,time:ROUND_LEN,tot};G.phase='end';
 ticker(w==='d'?'Los jueces lo dan empate.':`${(w==='p'?G.p:G.r).d.last} gana por ${m.toLowerCase()}.`);
 showResult();
}
function nextRound(){
 hideOv();G.round++;G.time=ROUND_LEN;
 for(const f of[G.p,G.r]){f.st=Math.min(100,f.st+45);f.hp=Math.min(100,f.hp+4);f.legs=Math.max(0,f.legs-12);f.state='idle';f.act=null;f.t=0;}resetPos();
 G.r.aiT=1;G.counterT=0;G.counterFor=null;G.phase='intro';G.introT=1.6;snapshotRound();setPad('stand');sfx('bell');ticker(`Arranca el round ${G.round}.`);
}

/* ---------------- Overlays ---------------- */
function showOv(html){$('#ovc').innerHTML=html;$('#ov').hidden=false;const b=$('#ovc button');if(b)b.focus({preventScroll:true});}
function hideOv(){$('#ov').hidden=true;}
const pct=s=>s.thr?Math.round(s.land/s.thr*100)+'%':'—';
function statRows(){
 const a=G.p.stats,b=G.r.stats;
 const rows=[['Golpes conectados',a.land,b.land,`${a.land}/${a.thr}`,`${b.land}/${b.thr}`],['Precisión',a.thr?a.land/a.thr:0,b.thr?b.land/b.thr:0,pct(a),pct(b)],
  ['Daño hecho',a.dmg,b.dmg,Math.round(a.dmg),Math.round(b.dmg)],['Derribos',a.td,b.td,`${a.td}/${a.tdA}`,`${b.td}/${b.tdA}`],
  ['Control en el piso',a.ctrl,b.ctrl,fmt(a.ctrl),fmt(b.ctrl)],['Sumisiones intentadas',a.subA,b.subA,a.subA,b.subA]];
 return `<table><thead><tr><th>${G.p.d.last.toUpperCase()}</th><th></th><th>${G.r.d.last.toUpperCase()}</th></tr></thead><tbody>`+
  rows.map(r=>`<tr><td class="${r[1]>r[2]?'hi':''}">${r[3]}</td><td>${r[0]}</td><td class="${r[2]>r[1]?'hi':''}">${r[4]}</td></tr>`).join('')+'</tbody></table>';
}
function advice(){
 const p=G.p,r=G.r,o=G.rs;
 const rLand=r.stats.land-o.r.land,pLand=p.stats.land-o.p.land,rTd=r.stats.td-o.r.td;
 if(rTd>0)return'Te está llevando al piso. Cuando lo veas agacharse en azul, mantené CUBRIRSE: así sprawleás.';
 if(p.st<40)return'Estás sin aire. Tirá menos golpes y movete más: el cardio también gana peleas.';
 if(rLand>pLand)return'Te gana el intercambio. Esperá el brillo amarillo, agachate o alejate y metele la contra.';
 if(p.s.wre>r.s.tdd+8&&p.stats.tdA===0)return'Tenés mejor lucha que él. Probá un DERRIBO justo después de que falle un golpe.';
 if(r.legs<15)return'Vas bien. Sumá patadas bajas: le sacan piernas y aire para los últimos rounds.';
 return'Vas bien. Seguí así y no regales la contra.';
}
function showBreak(){
 showOv(`<h3>FIN DEL ROUND ${G.round}</h3>${statRows()}<div class="tip"><b>TU ESQUINA</b>${advice()}</div><div class="btns"><button class="go" data-act="next">ROUND ${G.round+1} ▶</button></div>`);
}
function showResult(){
 const res=G.res,win=res.w==='p',draw=res.w==='d',wf=win?G.p:G.r;
 let cards='';
 if(res.tot)cards=`<div class="cards">${res.tot.map((t,i)=>`<div>Juez ${i+1}: <b>${t[0]}–${t[1]}</b> ${t[0]>t[1]?G.p.d.last:t[1]>t[0]?G.r.d.last:'empate'}</div>`).join('')}</div>`;
 const when=res.tot?`tras ${G.rounds} rounds`:`round ${res.round}, ${fmt(res.time)}`;
 showOv(`${G.ctx.title?`<div class="eyebrow ctr">${G.ctx.title}</div>`:''}<h3 class="${draw?'':win?'win':'lose'}">${draw?'EMPATE':win?'¡GANASTE!':'PERDISTE'}</h3>
  <div class="sub">${draw?'Nadie se lleva la pelea.':`<b>${wf.d.name}</b> gana por`}<br><b>${res.method}</b> · ${when}</div>${cards}${statRows()}
  <div class="btns">${G.ctx.kind==='quick'?'<button class="go" data-act="rematch">REVANCHA</button><button class="alt" data-act="menu">CAMBIAR PELEADORES</button><button class="alt" data-act="home">MENÚ PRINCIPAL</button>':'<button class="go" data-act="done">CONTINUAR ▶</button>'}</div>`);
}
// Tabla de controles: básicos y avanzados (se ve en la pausa y en "Cómo se pelea")
function controlsHtml(){
 const row=([a,k,pd,t,n])=>`<tr><td>${a}${n?`<small>${n}</small>`:''}</td><td><kbd>${k}</kbd></td><td class="pdc">${pd?badge(pd):'—'}</td><td>${t&&t[0]==='@'&&typeof ICO!=='undefined'?`<span class="ctico">${ICO[t.slice(1)]}</span>`:t}</td></tr>`;
 const basic=[['Jab','Q','□','@jab'],['Recto','W','△','@cross'],['Cross izquierdo','E','L1+□','@hook'],['Cross derecho','R','L1+△','@hookR'],['Low kick','A','○','@low','Le saca piernas y aire'],['High kick','S','✕','@high','Puede noquear, pero si falla quedás expuesto']];
 const adv=[['Caminar','← →','','◀ ▶','Con mando: cruz o stick izquierdo'],['Agacharse / esquivar','↓','','@duck','Los golpes altos pasan por arriba'],['Cubrirse','Espacio','R1','@block','Gasta la barra BLOQUEO: si se vacía, te rompen la guardia'],
  ['Uppercut','F','L2+□','@upper','Castiga al que se agacha'],['Derribo','D','R2','@td','Mejor justo después de que el rival falle'],['Sprawl','Espacio','R1','@block','Mantenelo cuando el rival brilla en azul'],
  ['Piso arriba','Q · W · E','','botones','Golpear · Sumisión · Pararse (mando: □ · △ · ○; celular: los botones grandes cambian de dibujo)'],['Piso abajo','Q · W · E','','botones','Defender · Escapar · Sumisión (mando: □ · △ · ○)'],['Pausa','Esc o P','Options','@pausa']];
 const head='<thead><tr><th>Acción</th><th>Teclado</th><th>Mando</th><th>Celular</th></tr></thead>';
 return`<div class="ctl"><h4>CON MANDO</h4>${mandoSVG()}<h4>CONTROLES BÁSICOS</h4><table class="ctab">${head}<tbody>${basic.map(row).join('')}</tbody></table>
  <h4>CONTROLES AVANZADOS</h4><table class="ctab">${head}<tbody>${adv.map(row).join('')}</tbody></table></div>`;
}
function pause(on){
 if(!G)return;
 if(on){if(G.phase!=='fight'&&G.phase!=='intro')return;G.paused=true;clearInput();
  showOv(`<h3>PAUSA</h3><div class="sub">Round ${G.round} · quedan ${fmt(G.time)}</div>${controlsHtml()}<div class="btns"><button class="go" data-act="resume">SEGUIR</button>${G.ctx.kind==='quick'?'<button class="alt" data-act="menu">SALIR AL MENÚ</button>':'<button class="alt" data-act="forfeit">ABANDONAR (CUENTA COMO DERROTA)</button>'}</div>`);}
 else{G.paused=false;hideOv();}
}
$('#ov').addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const k=a.dataset.act;
 if(k==='next')nextRound();else if(k==='rematch')startFight();else if(k==='menu')leaveFight('quick');else if(k==='home')leaveFight('home');
 else if(k==='resume')pause(false);else if(k==='done')finishCtx();else if(k==='close')hideOv();
 else if(k==='forfeit'){G.res={w:'r',method:'Abandono',round:G.round,time:ROUND_LEN-G.time};finishCtx();}});

/* ---------------- Loop ---------------- */
function update(dt){
 G.t+=dt;
 for(const f of[G.p,G.r])f.hit=Math.max(0,f.hit-dt);
 G.shake=Math.max(0,G.shake-dt);G.flashRed=Math.max(0,G.flashRed-dt*1.6);
 G.parts=G.parts.filter(q=>(q.life-=dt)>0);G.parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=260*dt;});
 G.texts=G.texts.filter(t=>(t.life-=dt)>0);G.texts.forEach(t=>t.y-=12*dt);
 if(G.paused)return;
 if(G.phase==='intro'){G.introT-=dt;if(G.introT<=0)G.phase='fight';return;}
 if(G.phase==='ko'){G.koT-=dt;if(G.koT<=0){G.phase='end';showResult();}return;}
 if(G.phase!=='fight')return;
 if(G.stop>0){G.stop-=dt;return;}
 G.time-=dt;if(G.time<=0){G.time=0;endRound();return;}
 regen(dt);
 if(G.mode==='stand')updStand(dt);else updGround(dt);
}
function poseOf(f){
 const o={act:f.act,hit:f.hit>0,bob:Math.sin(G.t*5+(f===G.p?0:1.7)),walk:f.walk};let pose='guard';
 if((G.phase==='ko'||G.phase==='end')&&G.res&&f.state!=='ko'&&(G.res.w==='p')===(f===G.p)){o.pose='win';return o;}
 const S=spriteOf(f.d),anim=!!(S&&S.plantilla);   // hojas con todos los cuadros: se anima el golpe entero
 o.off=f===G.r?.37:0;
 switch(f.state){
  case'wind':{const m=MOVES[f.act];o.prog=1-f.t/(f.tw||1);if(f===G.r){o.flash=Math.floor(G.t*16)%2===0;if(m.td)o.flashCol='#5aa2ff';}pose=m.td?'shoot':m.leg?'kwind':'pwind';break;}
  case'rec':if(f.act&&!MOVES[f.act].td&&(anim||f.t0-f.t<.16)){pose=f.act;o.ph='rec';o.prog=1-f.t/(f.t0||1);}break;
  case'missed':if(f.act){pose=MOVES[f.act].td?'shoot':f.act;o.lean=3;o.ph='rec';o.prog=1-f.t/(f.t0||1);}break;
  case'block':pose='block';break;
  case'crouch':pose='crouch';break;
  case'hurt':pose='hurt';o.hurt=1;break;
  case'stun':pose='hurt';o.hurt=1;o.wob=Math.round(Math.sin(G.t*7)*2);break;
 }
 if(f.state==='idle'&&Math.abs(f.vx)>1)o.walking=1;
 o.pose=pose;return o;
}
function renderStand(){
 const p=G.p,r=G.r;
 c.drawImage(bgS,0,0);
 for(const f of[p,r]){c.fillStyle='rgba(0,0,0,.3)';c.fillRect(Math.round(f.x-18),GY-1,36,3);}
 const order=(p.state==='wind'||p.state==='rec')?[r,p]:[p,r];
 for(const f of order){
  const o=poseOf(f);let rot=0;
  if(f.state==='ko'){const sk=spriteOf(f.d);rot=sk&&sk.frames.ko?0:-Math.min(1,(2.2-G.koT)/.5)*1.5;o.pose='hurt';o.hurt=1;o.ko=1;}
  blitFighter(f,o,f.x,GY,f.face,rot);
 }
 if(G.phase!=='ko'){const px=Math.round(p.x);R(px-3,GY-106,7,2,'#e0393b');R(px-2,GY-104,5,1,'#e0393b');R(px-1,GY-103,3,1,'#e0393b');}
 if(r.state==='wind'&&G.phase==='fight'&&Math.floor(G.t*10)%2===0){const td=r.act==='td';tDraw(td?'!!':'!',clamp(Math.round(r.x),20,W-20),GY-122,td?'#5aa2ff':'#ffd23f',16);}
 if(G.counterFor===p&&G.counterT>0&&Math.floor(G.t*10)%2===0){R(0,0,W,2,'#ffd23f');R(0,H-2,W,2,'#ffd23f');R(0,0,2,H,'#ffd23f');R(W-2,0,2,H,'#ffd23f');}
}
function meter(y,label,v,col){tDraw(label,6,y,'#eef0f4',8,'left');R(6,y+10,W-12,6,'#05060a');R(7,y+11,(W-14)*clamp(v/100,0,1),4,col);}
function renderGround(){
 c.drawImage(bgS,0,0);
 const pTop=G.top==='p',topF=pTop?G.p:G.r,botF=pTop?G.r:G.p;
 const atkTop=G.gAnim>0&&((G.gAtk==='p')===pTop);
 gcx.clearRect(0,0,76,44);c=gcx;
 drawLying(botF,{def:!pTop&&G.defT>0,hit:botF.hit>0});
 drawMount(topF,{punch:atkTop,sub:pTop?G.pSub>15:G.subOn,hit:topF.hit>0});
 c=ctx;const gx=Math.round((W-152)/2);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(gx+4,125,140,4);c.drawImage(gc,gx,40,152,88);
 if(G.phase==='fight'||G.phase==='ko'){
  if(pTop){meter(4,'ESCAPE RIVAL',G.esc,'#5aa2ff');meter(24,'TU SUMISIÓN',G.pSub,'#f2c14e');}
  else{meter(4,'TU ESCAPE',G.pEsc,'#4fcf6a');
   if(G.subOn)meter(24,Math.floor(G.t*6)%2?'¡SUMISIÓN!':'¡DEFENDÉ!',G.rSub,'#e0393b');else meter(24,'TU SUMISIÓN',G.pSub,'#f2c14e');}
  const b=G.bar,x0=14,bw=W-28;
  R(x0-2,129,bw+4,13,'#07080c');R(x0,131,bw,9,'#1d222c');
  R(x0+bw*(b.zc-b.zw/2),131,bw*b.zw,9,'#3fa457');R(x0+bw*(b.zc-b.zw*.18),131,bw*b.zw*.36,9,'#f2c14e');
  const mx=x0+bw*b.x;R(mx-2,127,5,17,'#07080c');R(mx-1,128,3,15,'#ffffff');
 }
}
function render(){
 c=ctx;ctx.imageSmoothingEnabled=false;
 const s=G.shake>0?Math.round(rand(-2,2)):0;
 ctx.save();ctx.translate(s,s?Math.round(rand(-1,1)):0);
 if(G.mode==='stand')renderStand();else renderGround();
 ctx.restore();
 if(G.flashRed>0){ctx.fillStyle=`rgba(224,57,59,${G.flashRed})`;ctx.fillRect(0,0,W,H);}
 if(G.p.hp<25&&G.phase==='fight'){ctx.fillStyle=`rgba(224,57,59,${.08+.06*Math.sin(G.t*6)})`;ctx.fillRect(0,0,W,H);}
 for(const q of G.parts)R(q.x,q.y,2,2,q.col);
 for(const t of G.texts){ctx.globalAlpha=clamp(t.life/t.max*1.6,0,1);tDraw(t.s,t.x,Math.round(t.y),t.col);ctx.globalAlpha=1;}
 if(G.phase==='intro'){ctx.fillStyle='rgba(5,6,10,.45)';ctx.fillRect(0,40,W,36);tDraw(G.introT>.6?`ROUND ${G.round}`:'¡PELEEN!',W/2,50,G.introT>.6?'#eef0f4':'#ffd23f',16);}
 syncLabels();
}
// Tips de controles que aparecen cada tanto (transparentes, en una esquina)
const TIPS=[['Golpes',[['□','Q','Jab'],['△','W','Recto']]],['Cross',[['L1+□','E','Cross izquierdo'],['L1+△','R','Cross derecho']]],['Patadas',[['○','A','Low kick'],['✕','S','High kick']]],
 ['Defensa',[['R1','Espacio','Cubrirse / sprawl'],['↓','↓','Agacharse']]],['Más golpes',[['R2','D','Derribo'],['L2+□','F','Uppercut']]]];
function showTip(){
 const P=typeof PAD!=='undefined'&&PAD.on,[t,rows]=TIPS[G.tipIdx++%TIPS.length];
 $('#ctlTip').innerHTML=`<b>${t}</b>`+rows.map(([g,k,l])=>`<div>${l}: ${P?badge(g):`<kbd>${k}</kbd>`}</div>`).join('');
}
function updCtl(dt){
 if(G.tipNext===undefined){if(G.ctlShow===undefined)G.ctlShow=5;G.tipNext=14;G.tipShow=0;G.tipIdx=0;}
 if(G.phase==='fight'){G.ctlShow-=dt;G.tipNext-=dt;G.tipShow-=dt;if(G.tipNext<=0&&G.mode==='stand'&&G.ctlShow<=0){showTip();G.tipShow=5;G.tipNext=22;}}
 $('#sideCtl').classList.toggle('show',G.ctlShow>0&&!G.paused);$('#ctlTip').classList.toggle('show',G.tipShow>0&&G.ctlShow<=0&&!G.paused&&G.mode==='stand');
}
function hud(){
 updCtl(1/60);
 const p=G.p,r=G.r,set=(id,v)=>{$(id).style.width=clamp(v,0,100)+'%';};
 set('#stP',p.st);set('#stR',r.st);set('#hdP',p.hp);set('#hdR',r.hp);
 set('#lgP',100-p.legs*1.6);set('#lgR',100-r.legs*1.6);set('#bkP',p.guard);set('#bkR',r.guard);
 $('#hdP').classList.toggle('low',p.hp<30);$('#hdR').classList.toggle('low',r.hp<30);
 $('#bkP').classList.toggle('low',p.guard<35);$('#bkR').classList.toggle('low',r.guard<35);
 $('#clk').textContent=fmt(G.time);$('#rnd').textContent=`ROUND ${G.round} DE ${G.rounds}`;
 const segs=$('#rseg').children,k=(1-G.time/ROUND_LEN)*100;
 for(let i=0;i<segs.length;i++)segs[i].style.background=i<G.round-1?'#3a8bff':i===G.round-1?`linear-gradient(90deg,#3a8bff ${k}%,rgba(255,255,255,.22) ${k}%)`:'';
}
// Controles básicos al costado de la pelea (cambian cuando van al piso)
function renderSide(m){
 if(G)G.ctlShow=5;
 const P=typeof PAD!=='undefined'&&PAD.on;
 const rows=m==='top'?[['Q','□','Golpear'],['W','△','Sumisión'],['E','○','Pararse']]:m==='bottom'?[['Q','□','Defender'],['W','△','Escapar'],['E','○','Sumisión']]:
  [['Q','□','Jab'],['W','△','Recto'],['E','L1+□','Cross izquierdo'],['R','L1+△','Cross derecho'],['A','○','Low kick'],['S','✕','High kick']];
 $('#sideCtl').innerHTML=`<div class="sc hd">${m==='stand'?'CONTROLES':m==='top'?'PISO · ARRIBA':'PISO · ABAJO'}</div>`+rows.map(([k,g,l])=>`<div class="sc">${P?badge(g):`<kbd>${k}</kbd>`}${l}</div>`).join('')+
  `<div class="sc note">${m==='stand'?(P?'Options: pausa y más controles':'Esc: pausa y más controles'):'Tocá en la zona verde'}</div>`;
}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(G){update(dt);if(G){render();hud();}}requestAnimationFrame(frame);}

/* ---------------- Entrada ---------------- */
function resize(){
 const st=$('#stage');if(!st.clientWidth)return;
 const sw=st.clientWidth,sh=st.clientHeight;
 // escala por la altura y ancho interno según la pantalla (sin bandas a los costados)
 let s=sh/H,nw=clamp(Math.round(sw/s),192,360);if(nw*s>sw+1)s=sw/nw;
 if(nw!==W){W=nw;cv.width=W;bgS=buildBg();if(G)for(const f of[G.p,G.r])f.x=clamp(f.x,WALL,W-WALL);}
 const w=Math.round(W*s)+'px',hh=Math.round(H*s)+'px';cv.style.width=w;cv.style.height=hh;const ar=$('#arena');ar.style.width=w;ar.style.height=hh;
}
window.addEventListener('resize',resize);
document.querySelectorAll('[data-k]').forEach(b=>{
 const act=()=>{const k=b.dataset.k;if(b.closest('#padStand'))doP(k);else doG(k);};
 b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();b.classList.add('on');act();});
 const up=()=>b.classList.remove('on');
 b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);
 b.addEventListener('click',e=>{if(e.detail===0)act();});
 b.addEventListener('contextmenu',e=>e.preventDefault());
});
document.querySelectorAll('[data-hold]').forEach(b=>{
 const k=b.dataset.hold;
 b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();try{b.setPointerCapture(e.pointerId);}catch(_){}b.classList.add('on');input[k]=true;});
 const up=()=>{b.classList.remove('on');input[k]=false;};
 b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
 b.addEventListener('contextmenu',e=>e.preventDefault());
});
const KEYS={q:'jab',w:'cross',e:'hook',r:'hookR',f:'upper',a:'low',s:'high',d:'td'},HOLD={arrowleft:'left',arrowright:'right',arrowdown:'down',' ':'block'};
document.addEventListener('keydown',e=>{
 if(!G||$('#fight').hidden)return;const k=e.key.toLowerCase();
 if(k==='escape'||k==='p'){pause(!G.paused);return;}
 if(G.mode==='ground'){const pad=G.top==='p'?'#padTop':'#padBot',i='qwe'.indexOf(k);if(i>=0&&!e.repeat)doG($(pad).querySelectorAll('[data-k]')[i].dataset.k);return;}
 if(HOLD[k]){input[HOLD[k]]=true;e.preventDefault();return;}
 if(KEYS[k]&&!e.repeat){doP(KEYS[k]);e.preventDefault();}
});
document.addEventListener('keyup',e=>{const k=HOLD[e.key.toLowerCase()];if(k)input[k]=false;});
window.addEventListener('blur',clearInput);
$('#pz').addEventListener('click',()=>pause(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&!G.paused)pause(true);});

