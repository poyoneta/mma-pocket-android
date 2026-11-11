/* ---------------- Sonido ---------------- */
let AC=null,NB=null,sound=true;
function initAudio(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;}}catch(e){AC=null;}}
function noise(dur,freq,vol,type){const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=type||'lowpass';f.frequency.value=freq;const g=AC.createGain(),t=AC.currentTime;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(AC.destination);s.start(t);s.stop(t+dur);}
function tone(fr,dur,vol,type){const o=AC.createOscillator();o.type=type||'sine';o.frequency.value=fr;const g=AC.createGain(),t=AC.currentTime;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur);}
function sfx(k){if(!sound||!AC)return;try{switch(k){
 case'hit':noise(.12,900,.5);tone(90,.12,.4,'triangle');break;
 case'big':noise(.25,700,.7);tone(60,.25,.6,'triangle');break;
 case'block':noise(.07,2500,.25,'bandpass');break;
 case'whoosh':noise(.14,1800,.15,'bandpass');break;
 case'slam':noise(.3,400,.7);tone(50,.3,.6);break;
 case'bell':tone(1250,1.2,.22);tone(1870,.9,.1);break;
 case'alarm':tone(440,.12,.15,'square');break;
 case'tick':tone(880,.05,.06,'square');break;
}}catch(e){}}
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}

