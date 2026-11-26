// Müfettiş: sırtı bize dönük, pencereye bakan karanlık siluet. Fötr şapka, yakası kalkık uzun palto, eller cepte.
// Bacak çizilmez: palto ayak bileğine iner, alt gövdeyi masa ve kadraj alt kenarı gizler.
// Bilerek ortak iskelete bağlanmadı; sahne kendi silüetini çizer.
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {rgba} from '../../../cekirdek/matematik.js';
import {MUFETTIS} from './ayar.js';

const M=MUFETTIS;
// palto: omuz ortası (0,0). Sol kenar pencereye bakar.
function paltoYolu(){
  c.moveTo(-58,-52); c.quadraticCurveTo(-30,-40,-8,-36); c.quadraticCurveTo(24,-40,58,-58); // kalkık yaka
  c.quadraticCurveTo(70,-20,M.omuzEn,16);           // sağ omuz
  c.quadraticCurveTo(194,150,196,320);              // sağ kol (eli cepte, dirsek dışa)
  c.quadraticCurveTo(194,420,176,474);
  c.quadraticCurveTo(186,700,194,M.etek);           // etek
  c.lineTo(-188,M.etek);
  c.quadraticCurveTo(-180,700,-170,476);
  c.quadraticCurveTo(-186,420,-182,330);            // sol kol
  c.quadraticCurveTo(-178,160,-150,8);
  c.quadraticCurveTo(-90,-20,-58,-52);
  c.closePath();
}
function solKenar(){c.moveTo(-58,-52); c.quadraticCurveTo(-90,-20,-150,8); c.quadraticCurveTo(-178,160,-182,330); c.quadraticCurveTo(-186,420,-170,476); c.quadraticCurveTo(-180,700,-188,M.etek);}
function basYolu(){ // ense ve kulak; çoğu şapkanın altında
  c.moveTo(-50,-40); c.quadraticCurveTo(-78,-90,-60,-140); c.lineTo(48,-142); c.quadraticCurveTo(54,-118,50,-100);
  c.quadraticCurveTo(62,-104,62,-88); c.quadraticCurveTo(60,-70,46,-70); c.quadraticCurveTo(40,-50,30,-40); c.closePath();
}
function kenarYolu(){ c.ellipse(-22,-150,128,22,0,0,Math.PI*2); }
function tepeYolu(){
  c.moveTo(-78,-152); c.quadraticCurveTo(-82,-200,-66,-222); c.quadraticCurveTo(-30,-240,-6,-226);
  c.quadraticCurveTo(22,-242,52,-226); c.quadraticCurveTo(70,-200,66,-152); c.closePath();
}

/* d: {x, y (omuz), s, don (salınım açısı), egil (0..1), irk (taş çarpınca irkilme), isik (0..1), renk} */
export function mufettis(d,kaynama){
  if(d.gorun<=0) return;
  c.save(); c.globalAlpha=d.gorun;
  c.translate(d.x,d.y); c.scale(d.s,d.s);
  c.translate(0,M.omuzAyak); c.rotate(d.don); c.translate(-d.irk*8,-M.omuzAyak); // salınım ayak noktasından
  const siyah=[6,6,7], L=d.isik;
  // palto
  c.beginPath(); paltoYolu(); c.fillStyle=rgba(siyah,1); c.fill();
  c.save(); c.beginPath(); paltoYolu(); c.clip();
  tara(-200,-60,200,M.etek,1.2,9,[16,15,14],.5,8800,1.2);
  if(L>.01){ // pencere tarafından vuran ışık: sol kenarı ve omzu yalar
    leke(-190,180,70,320,d.renk,.42*L); leke(-150,20,90,60,d.renk,.3*L); leke(-200,520,40,200,d.renk,.16*L);
  }
  leke(40,700,240,380,[0,0,0],.7);
  c.restore();
  titrek(()=>{c.moveTo(6,-30); c.quadraticCurveTo(12,300,4,M.etek);},[24,22,20],.25,1.2,8801+kaynama,2,2); // sırt dikişi
  titrek(()=>{c.moveTo(-176,398); c.quadraticCurveTo(0,412,190,396);},[22,20,18],.22,1.2,8802+kaynama,2,2);   // kemer
  titrek(()=>{c.moveTo(150,40); c.quadraticCurveTo(168,240,160,470);},[20,18,16],.3,1.2,8803+kaynama,2,2);   // kol ayrımı
  titrek(paltoYolu,[2,2,2],.9,2.2,8804+kaynama,2,2.4);
  if(L>.01) titrek(solKenar,d.renk,.55*L,2.4,8805+kaynama,2,2);
  // baş ve şapka: boyundan öne eğilir
  c.save(); c.translate(-6,-40); c.rotate(-.05-d.egil*.2); c.translate(6,40);
  c.beginPath(); basYolu(); c.fillStyle=rgba([10,9,9],1); c.fill();
  if(L>.01){c.save(); c.beginPath(); basYolu(); c.clip(); leke(-70,-100,30,50,d.renk,.35*L); c.restore();}
  titrek(basYolu,[2,2,2],.8,1.8,8806+kaynama,2,2);
  c.save(); c.translate(-22,-150); c.rotate(-.1); c.translate(22,150);
  c.beginPath(); tepeYolu(); c.fillStyle=rgba([8,8,9],1); c.fill();
  c.fillStyle='rgba(2,2,2,1)'; c.fillRect(-80,-170,150,16); // şapka bandı
  c.beginPath(); kenarYolu(); c.fillStyle=rgba([5,5,6],1); c.fill();
  if(L>.01){c.save(); c.beginPath(); kenarYolu(); tepeYolu(); c.clip(); leke(-140,-160,60,40,d.renk,.5*L); leke(-76,-200,24,40,d.renk,.25*L); c.restore();}
  titrek(()=>{tepeYolu(); kenarYolu();},[2,2,2],.85,1.8,8807+kaynama,2,2);
  if(L>.01) titrek(()=>{c.moveTo(-150,-146); c.quadraticCurveTo(-120,-132,-60,-129);},d.renk,.5*L,1.6,8808+kaynama,1,1.5);
  c.restore();
  c.restore();
  c.restore();
}
