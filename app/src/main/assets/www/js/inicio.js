/* ---------------- Arranque ---------------- */
// Loop de animación de los menús (la pelea tiene su propio loop en juego.js)
function menuLoop(ms){
 const t=ms/1000;
 padPoll(t);
 if(!G){
  if(curScreen==='home')drawHomeArt(t);
  else if(curScreen==='quick'){drawGen(t);drawVS(t);}
  else if(curScreen==='create')drawCreatePrev(t);
  else if(curScreen==='career')drawCareerPrev(t);
 }
 requestAnimationFrame(menuLoop);
{const b=document.getElementById('boot');if(b)b.style.display='none';}   // terminó de cargar
}
// Cuando termina de cargar una hoja de sprites, redibuja los retratos de la pantalla actual
function onSpriteLoad(){if(G)return;if(curScreen==='quick')renderMenu();else if(curScreen==='create'){renderCList();drawHeadBtns();}else if(curScreen==='tourney')renderTourney();else if(curScreen==='career')renderCareer();}
spriteOf({sprite:'zanella'});
$('#qDiv').innerHTML=divOptions(qDiv,true);
$('#qDiv').onchange=e=>{qDiv=e.target.value;selP=selR=null;renderMenu();};
bgS=buildBg();
renderGen();
showScreen('home');
requestAnimationFrame(menuLoop);
const ready=()=>requestAnimationFrame(frame);
(document.fonts&&document.fonts.load?document.fonts.load('800 16px "Barlow Condensed"').catch(()=>{}):Promise.resolve()).then(ready,ready);
// Para pruebas desde la consola del navegador
window.__game={get G(){return G},startFight,doP,doG,input,showScreen};
