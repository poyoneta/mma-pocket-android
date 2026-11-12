/* ---------------- Modo torneo ---------------- */
// Llave de 8: cuartos, semis y final. Tus peleas las jugás; las demás se simulan con las estadísticas.
let T=null,tPick=null,tDiv='ligero';
const STAGES=['Cuartos de final','Semifinal','Final'];
// Nivel general de un peleador (para simular y mostrar)
const ovr=f=>{const s=f.s;return(s.str*1.1+s.pow+s.spd*.9+s.wre+s.tdd*.8+s.bjj*.9+s.car*.8+s.chin*.8)/7.3;};
function simFight(a,b){
 const p=1/(1+Math.exp(-(ovr(a)-ovr(b))/5)),w=rnd()<p?a:b,l=w===a?b:a,r=rnd();
 const ko=w.s.pow/260+(100-l.s.chin)/400,sub=w.s.bjj/320;
 const method=r<ko?pick(['KO','TKO']):r<ko+sub?'Sumisión':pick(['Decisión unánime','Decisión unánime','Decisión dividida']);
 return{w,method};
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function newTourney(me,div){
 // Los 7 mejores de la división (sin contarte a vos); si faltan, se completan con generados
 const pool=fightersOf(div).filter(f=>f!==me&&!f.custom).slice(0,7);
 while(pool.length<7){const g=randFighter(null,div);pool.push(g);}
 const ps=[me,...shuffle(pool)];
 T={me,div,stages:[[0,1,2,3].map(i=>({a:ps[i*2],b:ps[i*2+1],w:null,m:''}))],out:false,lostAt:'',champ:null};
}
const curStage=()=>T.stages[T.stages.length-1];
const myMatch=()=>curStage().find(m=>!m.w&&(m.a===T.me||m.b===T.me));
function resolveStage(){
 const st=curStage();
 for(const m of st)if(!m.w){const r=simFight(m.a,m.b);m.w=r.w;m.m=r.method;}
 if(st.length===1){T.champ=st[0].w;return;}
 const nx=[];for(let i=0;i<st.length;i+=2)nx.push({a:st[i].w,b:st[i+1].w,w:null,m:''});T.stages.push(nx);
}
function playTourney(){
 const m=myMatch();if(!m)return;
 const opp=m.a===T.me?m.b:m.a,stage=STAGES[T.stages.length-1];
 startFight(T.me,opp,{kind:'tourney',esc:(escenarioTorneo(stage)||{}).id,rounds:3,title:'TORNEO · '+stage.toUpperCase(),onDone(res){
  let won=res.w==='p',meth=res.method;
  if(res.w==='d'){won=rnd()<.5;meth='Decisión del juez extra';}
  m.w=won?T.me:opp;m.m=meth;
  if(!won){T.out=true;T.lostAt=stage;}
  resolveStage();while(T.out&&!T.champ)resolveStage();
  showScreen('tourney');
 }});
}
// Lista de peleadores para elegir (la usan torneo y carrera)
function pickerHtml(id,list,selected){
 return`<div class="pgrid" id="${id}">`+list.map((f,i)=>`<button class="pcard" data-pi="${i}" aria-pressed="${f===selected}"><canvas width="56" height="48"></canvas><span class="nm">${esc(f.name)}</span><span class="meta">${f.flag} · ${f.style}${rankTxt(f)?` · <b>${rankTxt(f)}</b>`:''}</span><span class="lvl">Nivel ${Math.round(ovr(f))}</span></button>`).join('')+'</div>';
}
function bindPicker(id,list,onPick){
 const el=$('#'+id);el.querySelectorAll('canvas').forEach((cv,i)=>drawPortrait(cv,list[i],1));
 el.addEventListener('click',e=>{const b=e.target.closest('[data-pi]');if(!b)return;el.querySelectorAll('.pcard').forEach(x=>x.setAttribute('aria-pressed',x===b));onPick(list[+b.dataset.pi]);});
}
function matchHtml(m){
 const row=f=>`<div class="mr ${m.w===f?'w':m.w?'l':''} ${f===T.me?'me':''}"><span>${esc(f.name)}</span>${m.w===f?`<small>${m.m}</small>`:''}</div>`;
 return`<div class="match">${row(m.a)}${row(m.b)}</div>`;
}
function renderTourney(){
 const B=$('#tBody');
 if(!T){
  const list=[...new Set([...fightersOf(tDiv),...CUSTOM])];if(!list.includes(tPick))tPick=list.find(f=>f.custom)||list[0];
  B.innerHTML=`<p class="lead">Elegí la división y tu peleador. La llave se arma con los mejores 7 de esa división: ganá cuartos, semis y la final.</p>
   <label class="dsel" for="tDiv"><span>División</span><select id="tDiv">${divOptions(tDiv,false)}</select></label>
   ${pickerHtml('tPicker',list,tPick)}
   <div class="stick"><button class="go" id="tStart">ARMAR TORNEO CON <span id="tName">${esc(tPick.name).toUpperCase()}</span></button></div>`;
  bindPicker('tPicker',list,f=>{tPick=f;$('#tName').textContent=f.name.toUpperCase();});
  $('#tDiv').onchange=e=>{tDiv=e.target.value;renderTourney();};
  $('#tStart').onclick=()=>{newTourney(tPick,tDiv);renderTourney();};
  return;
 }
 const cols=[0,1,2].map(i=>{
  const st=T.stages[i],n=[4,2,1][i];
  const body=st?st.map(matchHtml).join(''):Array.from({length:n},()=>'<div class="match tbd"><div class="mr"><span>Por definir</span></div><div class="mr"><span>Por definir</span></div></div>').join('');
  return`<div class="bcol"><h4>${STAGES[i].toUpperCase()}</h4>${body}</div>`;
 }).join('');
 const champ=`<div class="bcol champ"><h4>CAMPEÓN</h4><div class="belt ${T.champ===T.me?'mine':''}">${T.champ?esc(T.champ.name):'—'}</div></div>`;
 let status;
 if(T.champ===T.me)status=`<div class="banner gold"><b>¡CAMPEÓN DEL TORNEO!</b><span>${esc(T.me.name)} ganó las tres peleas.</span></div>`;
 else if(T.out)status=`<div class="banner"><b>QUEDASTE AFUERA EN ${T.lostAt.toUpperCase()}</b><span>El torneo lo ganó ${esc(T.champ.name)}.</span></div>`;
 else{const m=myMatch(),opp=m.a===T.me?m.b:m.a;status=`<div class="banner next"><span class="eyebrow">TU PRÓXIMA PELEA · ${STAGES[T.stages.length-1].toUpperCase()}</span><b>${esc(T.me.last)} vs ${esc(opp.name)}</b><span>${opp.flag} · ${opp.style} · Nivel ${Math.round(ovr(opp))}</span><button class="go" id="tPlay">PELEAR</button></div>`;}
 B.innerHTML=`<div class="eyebrow">TORNEO · ${divName(T.div||'ligero').toUpperCase()}</div>${status}<div class="bracket">${cols}${champ}</div><div class="row2"><button class="alt" id="tNew">${T.champ?'NUEVO TORNEO':'ABANDONAR Y ARMAR OTRO'}</button></div>`;
 const pb=$('#tPlay');if(pb){pb.onclick=playTourney;pb.focus({preventScroll:true});}
 $('#tNew').onclick=e=>{const b=e.currentTarget;if(!T.champ&&!b.dataset.sure){b.dataset.sure='1';b.textContent='¿SEGURO? SE PIERDE ESTE TORNEO';b.classList.add('danger');return;}T=null;renderTourney();};
}
