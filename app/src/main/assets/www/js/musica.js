/* ---------------- Música de los menús ----------------
   Si ponés un archivo assets/musica/menu.mp3, suena ese (en loop).
   Si no, suena el tema propio del juego: un beat de nu metal / rap generado en el momento
   (guitarra distorsionada con chug, bajo, batería con boom-bap y bombo doble en el estribillo).
   Suena en los menús y se corta en las peleas. Respeta la casilla "Sonido". */
const MUS={on:false,src:null,mp3:null,tryMp3:true,next:0,step:0,bus:null,timer:null};
const MUS_BPM=96,MUS_16=60/MUS_BPM/4;
// Riff en 16avos: número = semitonos sobre Re grave (D2); null = silencio; 'x' = chug apagado
const RIFF_A=[0,'x',0,'x',null,0,'x',null,3,null,0,'x',5,null,3,null];
const RIFF_B=[0,'x',0,null,7,null,6,null,0,'x',0,null,10,null,8,7];
const PARTES=['A','A','B','A','A','B','C','C'];   // C = estribillo con bombo doble
function musBus(){
 if(MUS.bus)return MUS.bus;
 const out=AC.createGain();out.gain.value=0;out.connect(AC.destination);
 const comp=AC.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;comp.connect(out);
 // distorsión para la guitarra
 const dist=AC.createWaveShaper(),n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=Math.tanh(x*9);}dist.curve=c;dist.oversample='4x';
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=90;
 const gg=AC.createGain();gg.gain.value=.16;dist.connect(hp).connect(lp).connect(gg).connect(comp);
 MUS.bus={out,comp,gtr:dist};return MUS.bus;
}
const hz=semi=>73.42*Math.pow(2,semi/12);   // D2
function musGtr(t,semi,len,mute){
 const B=MUS.bus;for(const det of[-7,7,0]){   // tres cuerdas: quinta (power chord) desafinada un poco
  const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=hz(semi)*(det===0?1.5:1)*(1+det/2400);
  const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+(mute?.09:len));
  o.connect(g).connect(B.gtr);o.start(t);o.stop(t+(mute?.1:len)+.02);}
}
function musBass(t,semi,len){const o=AC.createOscillator();o.type='square';o.frequency.value=hz(semi)/2;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=400;
 const g=AC.createGain();g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(f).connect(g).connect(MUS.bus.comp);o.start(t);o.stop(t+len+.02);}
function musKick(t,v=1){const o=AC.createOscillator();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);
 const g=AC.createGain();g.gain.setValueAtTime(.9*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g).connect(MUS.bus.comp);o.start(t);o.stop(t+.26);}
function musNoise(t,dur,freq,vol,type){const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;
 const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(MUS.bus.comp);s.start(t,Math.random()*.3);s.stop(t+dur);}
function musSnare(t){musNoise(t,.18,1800,.5,'bandpass');const o=AC.createOscillator();o.type='triangle';o.frequency.value=190;const g=AC.createGain();g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(g).connect(MUS.bus.comp);o.start(t);o.stop(t+.11);}
function musHat(t,open){musNoise(t,open?.2:.04,8000,open?.12:.08,'highpass');}
// Un paso de 16avo
function musPaso(t,i){
 const bar=Math.floor(i/16),s=i%16,parte=PARTES[bar%PARTES.length],riff=parte==='B'?RIFF_B:RIFF_A;
 // batería: boom-bap en A/B, bombo doble en el estribillo
 if(parte==='C'){if(s%2===0)musKick(t,.8);}
 else if(s===0||s===7||s===10||(s===14&&bar%2))musKick(t);
 if(s===4||s===12)musSnare(t);
 musHat(t,s===14);
 // guitarra y bajo
 const n=parte==='C'?(s%4===0?[0,0,3,5][Math.floor(s/4)]:'x'):riff[s];
 if(n==null)return;
 if(n==='x'){musGtr(t,0,0,true);return;}
 musGtr(t,n,MUS_16*1.8,false);musBass(t,n,MUS_16*1.6);
 // golpe de crash al empezar cada 4 compases
 if(s===0&&bar%4===0)musNoise(t,1.2,5000,.12,'highpass');
}
function musLoop(){
 if(!MUS.on||!AC)return;
 while(MUS.next<AC.currentTime+.25){musPaso(MUS.next,MUS.step++);MUS.next+=MUS_16;}
}
function musArrancar(){
 if(MUS.on||!AC)return;
 // primero intenta con tu MP3
 if(MUS.tryMp3){
  MUS.tryMp3=false;const a=new Audio('assets/musica/menu.mp3');a.loop=true;a.volume=.45;
  a.addEventListener('canplay',()=>{MUS.mp3=a;if(musDebe())a.play().catch(()=>{});},{once:true});
  a.addEventListener('error',()=>{MUS.mp3=false;musArrancar();},{once:true});
  a.load();return;
 }
 if(MUS.mp3){MUS.on=true;MUS.mp3.play().catch(()=>{});return;}
 if(MUS.mp3===null)return;   // todavía averiguando si hay MP3
 musBus();MUS.on=true;MUS.next=AC.currentTime+.1;MUS.step=0;
 MUS.bus.out.gain.cancelScheduledValues(AC.currentTime);MUS.bus.out.gain.setTargetAtTime(.55,AC.currentTime,.3);
 MUS.timer=setInterval(musLoop,60);
}
function musParar(){
 if(!MUS.on)return;MUS.on=false;
 if(MUS.mp3){MUS.mp3.pause();return;}
 clearInterval(MUS.timer);if(MUS.bus)MUS.bus.out.gain.setTargetAtTime(0,AC.currentTime,.15);
}
const musDebe=()=>sound&&curScreen!=='fight'&&!document.hidden;
// se revisa seguido: arranca en los menús, se corta en la pelea o al salir de la app
setInterval(()=>{if(!AC)return;if(musDebe())musArrancar();else musParar();},300);
document.addEventListener('visibilitychange',()=>{if(document.hidden)musParar();});
// el navegador solo deja sonar después del primer toque
document.addEventListener('pointerdown',function m1(){initAudio();document.removeEventListener('pointerdown',m1,true);},true);
document.addEventListener('keydown',function m2(){initAudio();document.removeEventListener('keydown',m2,true);},true);
