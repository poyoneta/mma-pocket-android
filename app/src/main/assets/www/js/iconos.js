/* ---------------- Íconos de los controles táctiles ----------------
   Dibujos propios en SVG (48x48): guantes, piernas y flechas de movimiento, uno por golpe. */
const ICO=(()=>{
 const O='#0b0b0d',SK='#e9c39d';
 // guante mirando a la derecha, centrado en (0,0)
 const guante=(c='#d20a0a',s=1)=>`<g transform="scale(${s})"><rect x="-15" y="-6" width="8" height="12" rx="2" fill="#f2f2f2" stroke="${O}" stroke-width="2.4"/><rect x="-9" y="-9" width="19" height="18" rx="7.5" fill="${c}" stroke="${O}" stroke-width="2.4"/><path d="M-2 -9 q5 0 5 6" fill="none" stroke="${O}" stroke-width="1.6" opacity=".55"/><rect x="-6" y="-6" width="5" height="3" rx="1.5" fill="#fff" opacity=".45"/></g>`;
 const lineas=(x0,x1,ys,w=2.6)=>ys.map(y=>`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#fff" stroke-width="${w}" stroke-linecap="round"/>`).join('');
 const flecha=(d,c='#fff')=>`<path d="${d}" fill="none" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>`;
 const punta=(x,y,a,c='#fff')=>`<path d="M0 -5 L7 0 L0 5 Z" transform="translate(${x} ${y}) rotate(${a})" fill="${c}" stroke="${O}" stroke-width="1.6"/>`;
 const pierna=pts=>{const d='M'+pts.map(p=>p.join(' ')).join(' L');return`<path d="${d}" fill="none" stroke="${O}" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${SK}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;};
 const pie=(x,y,a)=>`<path d="M-3 -4 h9 a4 4 0 0 1 0 8 h-9 z" transform="translate(${x} ${y}) rotate(${a})" fill="${SK}" stroke="${O}" stroke-width="2.2"/>`;
 const short=(x,y)=>`<rect x="${x-7}" y="${y-6}" width="14" height="11" rx="3" fill="#16181d" stroke="${O}" stroke-width="2"/>`;
 const impacto=(x,y,c='#ffd23f')=>`<path d="M${x} ${y-7} l2 5 5 -2 -3 5 5 3 -6 1 1 6 -4 -4 -4 4 1 -6 -6 -1 5 -3 -3 -5 5 2z" fill="${c}" stroke="${O}" stroke-width="1.4"/>`;
 const svg=b=>`<svg viewBox="0 0 48 48" aria-hidden="true">${b}</svg>`;
 return{
  jab:svg(lineas(4,14,[19,29])+`<g transform="translate(30 24)">${guante('#d20a0a',.95)}</g>`),
  cross:svg(lineas(2,16,[16,24,32],3)+`<g transform="translate(31 24)">${guante('#d20a0a',1.15)}</g>`+impacto(44,14)),
  hook:svg(flecha('M10 38 Q4 14 24 10')+punta(25,10,-8)+`<g transform="translate(33 16) rotate(20)">${guante('#2c6bd6',.95)}</g>`),
  hookR:svg(flecha('M38 38 Q44 14 24 10')+punta(23,10,188)+`<g transform="translate(15 16) rotate(160) scale(1 -1)">${guante('#2c6bd6',.95)}</g>`),
  upper:svg(flecha('M14 44 Q14 26 22 20')+punta(23,19,-60)+`<g transform="translate(28 14) rotate(-90)">${guante('#9b59b6',1)}</g>`),
  low:svg(short(12,14)+pierna([[12,18],[20,30],[38,36]])+pie(40,36,8)+lineas(26,34,[44],2.4)+`<path d="M44 26 v18" stroke="#ffd23f" stroke-width="2.4" stroke-dasharray="3 3"/>`),
  high:svg(short(12,34)+pierna([[12,30],[22,20],[36,8]])+pie(38,7,-40)+lineas(20,30,[42],2.4)+impacto(42,20)),
  td:svg(`<circle cx="9" cy="18" r="6" fill="${SK}" stroke="${O}" stroke-width="2.2"/>`+pierna([[14,22],[30,30]])+pierna([[30,30],[40,40]])+pierna([[18,24],[34,20],[44,22]])+flecha('M6 42 H26')+punta(28,42,0)),
  block:svg(`<g transform="translate(16 25) rotate(-90)">${guante('#d20a0a',1.05)}</g><g transform="translate(32 25) rotate(-90)">${guante('#d20a0a',1.05)}</g>`+`<path d="M6 6 Q24 0 42 6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`),
  check:svg(short(20,10)+pierna([[18,15],[16,42]])+pierna([[23,15],[34,24],[30,38]])+pie(31,39,70)+`<path d="M38 20 L46 23 V30 Q46 36 38 39 Q30 36 30 30 V23 Z" fill="#2c6bd6" stroke="${O}" stroke-width="2" opacity=".95"/>`),
  duck:svg(`<circle cx="24" cy="31" r="7" fill="${SK}" stroke="${O}" stroke-width="2.2"/>`+flecha('M6 12 Q24 4 42 12')+punta(43,12,25)+flecha('M24 16 V22',`#ffd23f`)+punta(24,23,90,'#ffd23f')),
  gnp:svg(`<g transform="translate(24 18) rotate(90)">${guante('#d20a0a',1.1)}</g>`+impacto(24,38)+lineas(6,14,[10,18],2.4)),
  sub:svg(`<path d="M12 30 Q8 14 24 14 Q40 14 36 30" fill="none" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M12 30 Q8 14 24 14 Q40 14 36 30" fill="none" stroke="${SK}" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="32" r="7" fill="${SK}" stroke="${O}" stroke-width="2.2"/><path d="M36 30 L14 36" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M36 30 L14 36" stroke="${SK}" stroke-width="5" stroke-linecap="round"/>`),
  up:svg(flecha('M24 42 V12')+punta(24,10,-90)+`<path d="M8 44 H40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`),
  def:svg(`<path d="M24 5 L40 11 V24 Q40 37 24 44 Q8 37 8 24 V11 Z" fill="#2c6bd6" stroke="${O}" stroke-width="2.6"/><path d="M24 11 L34 15 V24 Q34 32 24 37" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7"/>`),
  esc:svg(flecha('M8 34 Q20 34 30 18')+punta(31,16,-55)+`<path d="M34 8 h8 v8" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>`),
  pausa:svg(`<rect x="13" y="10" width="7" height="28" rx="2" fill="#fff"/><rect x="28" y="10" width="7" height="28" rx="2" fill="#fff"/>`)
 };
})();
