/* ---------------- Pantallas de carga ----------------
   Antes de cada pelea aparece una de las imágenes de assets/carga con un consejo.
   Para agregar más: poné la imagen en assets/carga y sumala a la lista CARGAS. */
const CARGAS=['assets/carga/carga1.jpg','assets/carga/carga2.jpg','assets/carga/carga3.jpg'];
const CONSEJOS=['El jab mide la distancia: usalo para entrar y salir.','Si el rival brilla en amarillo, esquivá o cubrite.','La low kick le saca piernas y aire al rival.',
 'No te quedes cubierto: si se vacía la barra BLOQUEO, te rompen la guardia.','Derribá justo después de que el rival falle un golpe.','Con el rival en el piso, golpeá cuando la marca pase por la zona verde.',
 'En la carrera, llegá a la pelea con la forma en la zona verde.','El uppercut castiga al que se agacha.','La high kick puede noquear, pero si fallás quedás expuesto.',
 'El trash talk sube el hype, pero el rival viene más motivado.','Estudiar al rival en el campamento te muestra sus puntos débiles.'];
let cargaUlt=-1;
function pantallaCarga(ms){
 const el=$('#cargaPelea');if(!el||!CARGAS.length)return;
 let i;do{i=Math.floor(Math.random()*CARGAS.length);}while(CARGAS.length>1&&i===cargaUlt);cargaUlt=i;
 el.style.backgroundImage=`url(${CARGAS[i]})`;$('#cpTip').textContent=pick(CONSEJOS);
 el.hidden=false;el.classList.remove('fuera');
 clearTimeout(el._t);clearTimeout(el._t2);
 el._t=setTimeout(()=>{el.classList.add('fuera');el._t2=setTimeout(()=>{el.hidden=true;},350);},ms||1600);
}
// se precargan para que aparezcan al instante
CARGAS.forEach(src=>{const im=new Image();im.src=src;});
