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
  c.moveTo(-60,-70); c.quadraticCurveTo(-30,-52,-8,-50); c.quadraticCurveTo(24,-54,56,-74); // kalkık yaka
  c.quadraticCurveTo(72,-20,M.omuzEn,16);           // sağ omuz
  c.quadraticCurveTo(194,150,196,320);              // sağ kol (eli cepte, dirsek dışa)
  c.quadraticCurveTo(194,420,176,474);
  c.quadraticCurveTo(186,700,194,M.etek);           // etek
  c.lineTo(-188,M.etek);
  c.quadraticCurveTo(-180,700,-170,476);
  c.quadraticCurveTo(-186,420,-182,330);            // sol kol
  c.quadraticCurveTo(-178,160,-150,8);
  c.quadraticCurveTo(-92,-24,-60,-70);
  c.closePath();
}
function solKenar(){c.moveTo(-60,-70); c.quadraticCurveTo(-92,-24,-150,8); c.quadraticCurveTo(-178,160,-182,330); c.quadraticCurveTo(-186,420,-170,476); c.quadraticCurveTo(-180,700,-188,M.etek);}
function basYolu(){ // ense: şapkanın altında kalan küçük bir parça; kulak yalnızca bir çıkıntı
  c.moveTo(-44,-48); c.quadraticCurveTo(-60,-84,-50,-118); c.lineTo(40,-120); c.quadraticCurveTo(46,-104,44,-92);
  c.quadraticCurveTo(52,-92,51,-80); c.quadraticCurveTo(49,-68,40,-68); c.quadraticCurveTo(34,-54,26,-46); c.closePath();
}
function kenarYolu(){ c.ellipse(-26,-122,140,21,0,0,Math.PI*2); }
function tepeYolu(){
  c.moveTo(-84,-124); c.quadraticCurveTo(-90,-176,-72,-200); c.quadraticCurveTo(-34,-218,-8,-204);
  c.quadraticCurveTo(22,-220,54,-204); c.quadraticCurveTo(74,-178,70,-124); c.closePath();
}

/* d: {x, y (omuz), s, don (salınım açısı), egil (0..1), irk (taş çarpınca irkilme), isik (0..1), renk} */
export function mufettis(d,kaynama){
  if(d.gorun<=0) return;
  c.save(); c.globalAlpha=d.gorun;
  c.translate(d.x,d.y); c.scale(d.s,d.s);
  // salınım ayak noktasından; irkilme: pencereden geri (sağa) sıçrar, omuzlar kalkar, gövde geriye yatar
  c.translate(0,M.omuzAyak); c.rotate(d.don+d.irk*.035); c.translate(d.irk*26,-M.omuzAyak-d.irk*14);
  const siyah=[6,6,7], L=d.isik;
  // palto
  c.beginPath(); paltoYolu(); c.fillStyle=rgba(siyah,1); c.fill();
  c.save(); c.beginPath(); paltoYolu(); c.clip();
  tara(-200,-60,200,M.etek,1.2,9,[16,15,14],.5,8800,1.2);
  if(L>.01){ // pencere tarafından vuran ışık: sol kenarı ve omzu yalar
    leke(-190,180,70,320,d.renk,.42*L); leke(-150,20,90,60,d.renk,.3*L); leke(-200,520,40,200,d.renk,.16*L);
  }
  leke(40,700,240,380,[0,0,0],.7);
  // alt üçte bir karanlığa gömülür: etek ucu hiç görünmez (bacak, ayak ve etek kenarı yok)
  const kg=c.createLinearGradient(0,470,0,820); kg.addColorStop(0,'rgba(3,3,3,0)'); kg.addColorStop(1,'rgba(3,3,3,1)');
  c.fillStyle=kg; c.fillRect(-260,470,520,M.etek+40-470);
  c.restore();
  titrek(()=>{c.moveTo(6,-30); c.quadraticCurveTo(12,300,6,640);},[24,22,20],.25,1.2,8801+kaynama,2,2); // sırt dikişi
  titrek(()=>{c.moveTo(-176,398); c.quadraticCurveTo(0,412,190,396);},[22,20,18],.22,1.2,8802+kaynama,2,2);   // kemer
  titrek(()=>{c.moveTo(150,40); c.quadraticCurveTo(168,240,160,470);},[20,18,16],.3,1.2,8803+kaynama,2,2);   // kol ayrımı
  c.save(); c.beginPath(); c.rect(-260,-300,520,1060); c.clip(); // dış hat etek ucuna inmez
  titrek(paltoYolu,[2,2,2],.9,2.2,8804+kaynama,2,2.4);
  c.restore();
  if(L>.01){ // kenar ışığı aşağı doğru söner
    c.save(); c.beginPath(); c.rect(-260,-300,520,900); c.clip(); titrek(solKenar,d.renk,.55*L,2.4,8805+kaynama,2,2); c.restore();
  }
  // baş ve şapka: boyundan öne eğilir
  c.save(); c.translate(-6,-40); c.rotate(-.05-d.egil*.2*(1-d.irk*.85)+d.irk*.06); c.translate(6,40);
  c.beginPath(); basYolu(); c.fillStyle=rgba([10,9,9],1); c.fill();
  if(L>.01){c.save(); c.beginPath(); basYolu(); c.clip(); leke(-58,-86,22,36,d.renk,.3*L); c.restore();}
  titrek(basYolu,[2,2,2],.8,1.8,8806+kaynama,2,2);
  c.save(); c.translate(-26,-122); c.rotate(-.08); c.translate(26,122);
  c.beginPath(); tepeYolu(); c.fillStyle=rgba([8,8,9],1); c.fill();
  c.fillStyle='rgba(2,2,2,1)'; c.fillRect(-88,-146,160,18); // şapka bandı
  c.beginPath(); kenarYolu(); c.fillStyle=rgba([5,5,6],1); c.fill();
  if(L>.01){c.save(); c.beginPath(); kenarYolu(); tepeYolu(); c.clip(); leke(-160,-126,60,30,d.renk,.5*L); leke(-84,-170,22,40,d.renk,.25*L); c.restore();}
  titrek(()=>{tepeYolu(); kenarYolu();},[2,2,2],.85,1.8,8807+kaynama,2,2);
  if(L>.01) titrek(()=>{c.moveTo(-164,-118); c.quadraticCurveTo(-130,-104,-60,-101);},d.renk,.5*L,1.6,8808+kaynama,1,1.5);
  c.restore();
  c.restore();
  c.restore();
}
