// Gövde: boyun, iç giysi, dış örtü (veri alanı `ortu`), yakalar. altGovde: yalnızca ayaktayken görünen uzun etek.
// Bacak ve el yakından çizilmez: alt gövde örtüyle gizlenir, eller etekte koyu birer leke olarak kalır.
// Varsayılan kadın (palto + bluz, omuz 1) prototiptekiyle birebir aynı sayılarla çizilir.
import {c} from '../teknik/tuval.js';
import {leke,tara,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,hex,rgba} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir,hexYaz} from './gorunus.js';
import {kumas} from './doku.js';
import {baslikGovde} from './baslik.js';

/* omuz eşlemesi: boyun çevresi (|x|<=90) sabit kalır, dışı omuz çarpanıyla genişler */
function omuzEsle(){
  const om=G.omuz;
  return om===1?(x=>x):(x=>{const a=Math.abs(x); return a<=90?x:Math.sign(x)*(90+(a-90)*om);});
}

/* örtülerin varsayılan renkleri ve silüetleri (omuz noktası, kol inişi) */
const ORTU={
  palto:{renk:'#101513', boyun:84, sil:[[-150,800,-262,822,-312,872],[-352,914,-366,1010,-372,1300]], y:786},
  aba:{renk:'#3e3426', boyun:96, sil:[[-176,782,-300,800,-348,850],[-384,892,-394,1000,-400,1300]], y:776},
  kaput:{renk:'#3f4030', boyun:86, sil:[[-160,778,-282,798,-334,848],[-370,890,-380,1000,-386,1300]], y:772},
  entari:{renk:'#4e4636', boyun:80, sil:[[-140,806,-240,830,-292,878],[-330,922,-346,1010,-352,1300]], y:790},
  cubbe:{renk:'#1f1d1a', boyun:92, sil:[[-162,790,-292,812,-340,862],[-378,904,-390,1010,-396,1300]], y:780},
  onluk:{renk:'#4b3a28', boyun:84, sil:[[-150,796,-270,816,-322,866],[-358,910,-370,1010,-376,1300]], y:786},
  kepenek:{renk:'#5e5544', boyun:100, sil:[[-196,770,-360,790,-404,862],[-434,926,-444,1040,-448,1300]], y:768}
};
const IC_RENK={bluz:'#7d7866', gomlek:'#77715d', yelek:'#77715d', entari:'#5a5240'};

// paltonun prototipteki tonları; başka renk verilirse bu tonlar ana renkten türetilir
const PALTO_TON={acik:'#1c2420', ana:'#101513', koyu:'#050606', leke:hex('#4d5a4c'), yakaKoyu:'#0b0f0e', yaka:'#1a211e', yakaLeke:hex('#4a5548'),
  sis:['rgba(7,9,9,0)','rgba(7,9,9,1)'], etek:['#070909','#030404']};
function tonlar(renk){
  const a=hex(renk), k=karistir(a,[0,0,0],.62);
  return {acik:hexYaz(karistir(a,'#d8d0b8',.1)), ana:renk, koyu:hexYaz(karistir(a,[0,0,0],.7)), leke:karistir(a,'#c8c4ac',.28),
    yakaKoyu:hexYaz(karistir(a,[0,0,0],.4)), yaka:hexYaz(karistir(a,'#c8c4ac',.06)), yakaLeke:karistir(a,'#c8c4ac',.3),
    sis:[rgba(k,0),rgba(k,1)], etek:[hexYaz(karistir(a,[0,0,0],.55)),hexYaz(karistir(a,[0,0,0],.75))]};
}
function ortuTon(){
  const o=G.ortu, r=G.giysi.renk;
  if(o==='palto'&&!r) return PALTO_TON;
  return tonlar(r||(ORTU[o]||ORTU.palto).renk);
}

export function yaka(yon,koyu,k,T){
  T=T||PALTO_TON;
  c.save(); c.scale(-yon,1);
  const yol=()=>{c.moveTo(-90,782); c.lineTo(-158,800); c.lineTo(-192,884); c.lineTo(-150,896); c.lineTo(-198,918); c.bezierCurveTo(-152,1000,-82,1072,-14,1112); c.lineTo(-4,1092); c.bezierCurveTo(-52,1000,-100,900,-112,822); c.closePath();};
  c.beginPath(); yol();
  c.save(); c.shadowColor='rgba(0,0,0,.8)'; c.shadowBlur=20; c.shadowOffsetY=6; c.fillStyle=koyu?T.yakaKoyu:T.yaka; c.fill(); c.restore();
  c.save(); c.clip(); tara(-200,780,0,1110,.9,7,PAL.murekkep,koyu?.5:.38,300+k,1.1); if(!koyu) leke(-150,830,70,60,T.yakaLeke,.3); c.restore();
  titrek(yol,PAL.murekkep,.85,1.7,310+k,2,2.2);
  titrek(()=>{c.moveTo(-150,896); c.lineTo(-108,852);},PAL.murekkep,.8,1.6,320+k,2,2);
  c.restore();
}
export function gomlekYaka(yon,koyu,k){
  c.save(); c.scale(-yon,1);
  const yol=()=>{c.moveTo(-98,780); c.bezierCurveTo(-78,812,-52,842,-28,866); c.bezierCurveTo(-50,878,-84,880,-112,872); c.bezierCurveTo(-112,842,-108,808,-98,780); c.closePath();};
  c.beginPath(); yol(); c.fillStyle=koyu?'#3d3b33':'#8b8571'; c.fill();
  c.save(); c.clip(); tara(-115,778,-25,882,-.5,6,PAL.murekkep,koyu?.5:.28,330+k); c.restore();
  titrek(yol,PAL.murekkep,.8,1.4,340+k,2,1.8);
  c.restore();
}

/* boyun: genişlik yuz.boyun ile, alt kenarı iç giysinin yakasına göre (V ya da yuvarlak) */
function boyun(k,dek,v){
  const R=G.renk, w=G.yuz.boyun, A=G.yasIzi;
  const yol=w===1&&v?()=>{c.moveTo(-72,620); c.bezierCurveTo(-70,700,-72,752,-94,788); c.lineTo(-58,800); c.lineTo(0,906); c.lineTo(58,800); c.lineTo(94,788); c.bezierCurveTo(72,752,70,700,72,620); c.closePath();}
    :()=>{c.moveTo(-72*w,620); c.bezierCurveTo(-70*w,700,-72*w,752,-94*w,788); c.lineTo(-58*w,800);
      if(v) c.lineTo(0,dek); else c.quadraticCurveTo(0,dek*2-800,58*w,800);
      c.lineTo(58*w,800); c.lineTo(94*w,788); c.bezierCurveTo(72*w,752,70*w,700,72*w,620); c.closePath();};
  c.beginPath(); yol();
  const g=c.createLinearGradient(0,640,0,905); g.addColorStop(0,R.boyun[0]); g.addColorStop(.5,R.boyun[1]); g.addColorStop(1,R.boyun[2]);
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  leke(8+poz.hgx*6,736,132*w,70,R.tenDerin,.9);
  leke(70*w,740,60*w,130,R.tenDerin,.75);
  leke(-44*w,806,48,26,R.tenIsik,.18*poz.isik);
  tara(-10*w,640,100*w,900,1.05,6,PAL.murekkep,.45,356+k);
  tara(-95*w,690,95*w,790,.2,7,PAL.murekkep,.3,357+k);
  c.restore();
  if(w===1&&v) titrek(()=>{c.moveTo(-26,730); c.quadraticCurveTo(-18,780,-6,806); c.moveTo(-58,800); c.lineTo(0,906); c.lineTo(58,800);},PAL.murekkep,.6,1.3,358+k,2,2);
  else titrek(()=>{c.moveTo(-26*w,730); c.quadraticCurveTo(-18*w,780,-6*w,806);},PAL.murekkep,.6,1.3,358+k,2,2);
  if(A.kirisik>.3){ // yaşlı boyun: yatay kıvrımlar, gerilmiş kirişler
    const a=A.kirisik;
    titrek(()=>{for(let i=0;i<3;i++){const y=700+i*30; c.moveTo(-54*w,y); c.quadraticCurveTo(-10*w,y+8,40*w,y-2);}},PAL.murekkep,.3*a,1.1,359+k,2,1.6);
    titrek(()=>{c.moveTo(-40*w,690); c.quadraticCurveTo(-30*w,760,-12*w,800); c.moveTo(40*w,690); c.quadraticCurveTo(30*w,760,12*w,800);},PAL.murekkep,.35*a,1.2,360+k,2,1.8);
  }
  if(G.cinsiyet==='E') titrek(()=>{c.moveTo(-6,748); c.quadraticCurveTo(4,758,-2,770);},PAL.murekkep,.4,1.2,361+k,2,1.4); // gırtlak
}

/* dış örtü silüeti */
function silYol(X,o){
  const [a,b]=o.sil, n=o.boyun, y=o.y;
  c.moveTo(-n,y); c.bezierCurveTo(X(a[0]),a[1],X(a[2]),a[3],X(a[4]),a[5]); c.bezierCurveTo(X(b[0]),b[1],X(b[2]),b[3],X(b[4]),b[5]);
  c.lineTo(X(-b[4]),b[5]); c.bezierCurveTo(X(-b[2]),b[3],X(-b[0]),b[1],X(-a[4]),a[5]); c.bezierCurveTo(X(-a[2]),a[3],X(-a[0]),a[1],n,y); c.closePath();
}
function silKenar(X,o){
  const [a,b]=o.sil, n=o.boyun, y=o.y;
  c.moveTo(X(b[4]),b[5]); c.bezierCurveTo(X(b[2]),b[3],X(b[0]),b[1],X(a[4]),a[5]); c.bezierCurveTo(X(a[2]),a[3],X(a[0]),a[1],-n,y);
  c.moveTo(n,y); c.bezierCurveTo(X(-a[0]),a[1],X(-a[2]),a[3],X(-a[4]),a[5]); c.bezierCurveTo(X(-b[0]),b[1],X(-b[2]),b[3],X(-b[4]),b[5]);
}
// paltonun kaba boyası: koyu gradyan, omuzda soluk ışık, sağda karanlık, tarama, alta doğru erime
function disBoya(yol,T,k,X,desen){
  c.beginPath(); yol();
  let g=c.createLinearGradient(X(-300),780,X(300),1200); g.addColorStop(0,T.acik); g.addColorStop(.4,T.ana); g.addColorStop(1,T.koyu);
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  if(desen) desen();
  leke(X(-220),846,170,40,T.leke,.42*poz.isik,-.2);
  leke(X(250),940,190,260,PAL.siyah,.8);
  tara(X(-372),786,X(372),1080,.75,8,PAL.murekkep,.5,350+k,1.2);
  tara(-60,786,X(372),1080,-.6,10,PAL.murekkep,.45,351+k,1.2);
  // alt kenar palto etek rengine eriyerek biter: ayaktayken birleşim çizgisi görünmez
  g=c.createLinearGradient(0,1130,0,1300); g.addColorStop(0,T.sis[0]); g.addColorStop(1,T.sis[1]); c.fillStyle=g; c.fillRect(X(-380),1130,X(380)-X(-380),180);
  c.restore();
}

// alt kenarı etek rengine erit: ayaktayken gövde ile altGovde arasında çizgi görünmesin
export function erime(yol,T){
  c.save(); c.beginPath(); yol(); c.clip();
  const g=c.createLinearGradient(0,1130,0,1300); g.addColorStop(0,T.sis[0]); g.addColorStop(1,T.sis[1]); c.fillStyle=g; c.fillRect(-500,1130,1000,180);
  c.restore();
}

/* ───────── iç giysiler (dış örtünün önünden görünen) ───────── */
function bluz(k){
  c.beginPath(); c.moveTo(-150,790); c.lineTo(150,790); c.lineTo(10,1110); c.lineTo(-10,1110); c.closePath();
  const icR=G.giysi.icRenk;
  const g=c.createLinearGradient(-80,800,90,1100);
  if(icR){const a=hex(icR); g.addColorStop(0,icR); g.addColorStop(.5,hexYaz(karistir(a,[0,0,0],.35))); g.addColorStop(1,hexYaz(karistir(a,[0,0,0],.7)));}
  else{g.addColorStop(0,'#7d7866'); g.addColorStop(.5,'#514e44'); g.addColorStop(1,'#25241f');}
  c.fillStyle=g; c.fill();
  c.save(); c.clip(); leke(40,900,120,130,PAL.siyah,.55); tara(-150,790,150,1120,1.2,7,PAL.murekkep,.3,353+k); c.restore();
  titrek(()=>{c.moveTo(0,902); c.lineTo(1,1104);},PAL.murekkep,.7,1.4,354+k,2,2);
  for(const y of[944,996]){c.fillStyle='#2a2822'; c.beginPath(); c.arc(0,y,5.5,0,TAU); c.fill(); titrek(()=>{c.arc(0,y,5.5,0,TAU);},PAL.murekkep,.8,1.1,355+y+k,2,1.4);}
}
function dugme(x,y,r,k,renk){c.fillStyle=renk||'#2a2822'; c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); titrek(()=>{c.arc(x,y,r,0,TAU);},PAL.murekkep,.8,1.1,355+Math.round(y)+k,2,1.2);}
// yakasız köy gömleği: önü düğmeli patlı, boynu bantlı
function gomlek(k,acik){
  const R=hex(G.giysi.icRenk||IC_RENK.gomlek);
  kumas(acik,[-160,770,160,1300],{renk:R,seed:380,tara:.8,hat:false});
  titrek(()=>{c.moveTo(-14,826); c.lineTo(-12,1300); c.moveTo(14,826); c.lineTo(15,1300);},PAL.murekkep,.5,1.2,381+k,2,1.8);
  dugme(0,872,4.5,k); dugme(0,950,4.5,k);
}
function yelek(k,acik){
  gomlek(k,acik);
  const R=hex(G.giysi.yelekRenk||'#23201b');
  c.save(); c.beginPath(); acik(); c.clip();
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*96,780); c.bezierCurveTo(s*64,840,s*30,900,s*24,980); c.lineTo(s*26,1300); c.lineTo(s*260,1300); c.lineTo(s*260,780); c.closePath();};
    kumas(yol,[s<0?-260:20,780,s<0?-20:260,1300],{renk:s>0?karistir(R,[0,0,0],.3):R,seed:390+s,tara:.9});
  }
  c.restore();
  for(const y of[1000,1060]) dugme(-30,y,4,k,'#4a4030');
}
function entariIc(k,acik){
  const R=hex(G.giysi.icRenk||IC_RENK.entari), D=karistir(R,'#2a1a18',.5), r=rng(395);
  kumas(acik,[-160,770,160,1300],{renk:R,seed:396,tara:.7,hat:false,desen:()=>{
    for(let i=0;i<170;i++){const x=-170+r()*340, y=780+r()*520, s=2+r()*2; c.fillStyle=rgba(D,.4+r()*.2); for(let p=0;p<3;p++){c.beginPath(); c.arc(x+Math.cos(p*2.1)*s,y+Math.sin(p*2.1)*s,s*.7,0,TAU); c.fill();}}
  }});
}
function icCiz(k,acik){
  const ic=G.giysi.ic;
  if(ic==='yelek') yelek(k,acik); else if(ic==='entari') entariIc(k,acik); else gomlek(k,acik);
}
// yuvarlak yaka bandı (boynun dibinde)
function yakaBandi(k,w,dek,renk){
  const R=hex(renk);
  const yol=()=>{c.moveTo(-96*w,784); c.quadraticCurveTo(0,dek*2-794,96*w,784); c.lineTo(92*w,800); c.quadraticCurveTo(0,dek*2-776,-92*w,800); c.closePath();};
  kumas(yol,[-96*w,780,96*w,dek+14],{renk:R,seed:385,tara:.6});
}

/* ───────── örtüler ───────── */
function palto(k,X,T){
  const o=ORTU.palto;
  disBoya(()=>silYol(X,o),T,k,X);
  titrek(()=>silKenar(X,o),PAL.murekkep,.9,2,352+k,3,3);
  if(G.giysi.ic==='bluz'){
    bluz(k); boyun(k,906,true);
    gomlekYaka(-1,false,k); gomlekYaka(1,true,k);
  } else {
    const acik=()=>{c.moveTo(-150,790); c.lineTo(150,790); c.lineTo(10,1110); c.lineTo(-10,1110); c.closePath();};
    icCiz(k,acik); boyun(k,836,false); yakaBandi(k,G.yuz.boyun,834,G.giysi.icRenk||IC_RENK.gomlek);
  }
  yaka(-1,false,k,T); yaka(1,true,k,T);
}
// aba ve cübbe: önü açık, omuzdan düşen kalın örtü; içte gömlek/yelek
function acikOrtu(k,X,T,cubbe){
  const o=ORTU[cubbe?'cubbe':'aba'], R=hex(T.ana), kenar=G.giysi.kenar?hex(G.giysi.kenar):null;
  const desen=cubbe?null:()=>{ // abanın dokuma çizgileri
    const r=rng(410); for(let x=-420;x<420;x+=26+r()*18){c.strokeStyle=rgba(karistir(R,'#cbbf9a',.35),.12+r()*.1); c.lineWidth=2+r()*3; c.beginPath(); c.moveTo(x,770); c.lineTo(x+(r()-.5)*20,1300); c.stroke();}
  };
  disBoya(()=>silYol(X,o),T,k,X,desen);
  titrek(()=>silKenar(X,o),PAL.murekkep,.9,2,352+k,3,3);
  const acik=()=>{c.moveTo(-o.boyun,o.y); c.bezierCurveTo(-120,880,-140,1000,-150,1300); c.lineTo(150,1300); c.bezierCurveTo(140,1000,120,880,o.boyun,o.y); c.closePath();};
  icCiz(k,acik);
  boyun(k,836,false);
  yakaBandi(k,G.yuz.boyun,834,G.giysi.icRenk||IC_RENK.gomlek);
  // önün kalın kenarı: içe dönen kumaş
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*o.boyun,o.y); c.bezierCurveTo(s*120,880,s*140,1000,s*150,1300); c.lineTo(s*(cubbe?196:186),1300); c.bezierCurveTo(s*176,1000,s*150,880,s*(o.boyun+30),o.y+4); c.closePath();};
    const kr=karistir(R,s>0?[0,0,0]:'#c8c0a0',s>0?.45:.08);
    kumas(yol,[s<0?-196:o.boyun-10,o.y,s<0?-o.boyun+10:196,1300],{renk:kr,seed:420+s,tara:s>0?1:.5,hat:false});
    titrek(()=>{c.moveTo(s*o.boyun,o.y); c.bezierCurveTo(s*120,880,s*140,1000,s*150,1300);},PAL.murekkep,.85,1.8,423+s+k,2,2);
    if(kenar){ // işlemeli kenar: kumaşa gömülü, soluk sırma çizgisi
      c.save(); c.setLineDash([5,4]);
      titrek(()=>{c.moveTo(s*(o.boyun+12),o.y+6); c.bezierCurveTo(s*134,880,s*154,1000,s*164,1300);},s>0?karistir(kenar,[0,0,0],.55):kenar,.6,2.2,425+s+k,2,1.2);
      c.restore();
    }
  }
}
function kaput(k,X,T){
  const o=ORTU.kaput, R=hex(T.ana);
  disBoya(()=>silYol(X,o),T,k,X);
  titrek(()=>silKenar(X,o),PAL.murekkep,.9,2,352+k,3,3);
  // içte haki gömlek yakası
  const acik=()=>{c.moveTo(-96,772); c.lineTo(96,772); c.lineTo(0,900); c.closePath();};
  kumas(acik,[-96,772,96,900],{renk:hex(G.giysi.icRenk||'#4f4c38'),seed:430,tara:.8,hat:false});
  boyun(k,826,false);
  for(const s of[-1,1]){ // gömlek yakası uçları
    const yol=()=>{c.moveTo(s*70,800); c.lineTo(s*20,846); c.lineTo(s*64,852); c.lineTo(s*92,806); c.closePath();};
    kumas(yol,[s<0?-92:20,800,s<0?-20:92,852],{renk:karistir(hex(G.giysi.icRenk||'#4f4c38'),s>0?[0,0,0]:'#c8c0a0',.15),seed:431+s,tara:.6});
  }
  // kaputun geniş, kapalı yakası
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*92,770); c.lineTo(s*170,790); c.lineTo(s*214,880); c.lineTo(s*168,892); c.lineTo(s*200,930); c.bezierCurveTo(s*150,960,s*70,960,s*4,948); c.bezierCurveTo(s*50,900,s*88,840,s*92,770); c.closePath();};
    c.save(); c.shadowColor='rgba(0,0,0,.8)'; c.shadowBlur=18; c.shadowOffsetY=6; c.beginPath(); yol(); c.fillStyle=rgba(karistir(R,[0,0,0],s>0?.45:.1),1); c.fill(); c.restore();
    kumas(yol,[s<0?-214:0,770,s<0?0:214,960],{renk:karistir(R,[0,0,0],s>0?.4:0),seed:440+s,tara:s>0?1:.6});
    titrek(()=>{c.moveTo(s*168,892); c.lineTo(s*126,850);},PAL.murekkep,.8,1.5,445+s+k,2,2);
  }
  // iki sıra düğme ve omuz apoletleri
  for(const s of[-1,1]) for(const y of[1000,1090]) dugme(s*70,y,7,k,'#3a3420');
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*176,796); c.lineTo(X(s*296),830); c.lineTo(X(s*290),850); c.lineTo(s*172,816); c.closePath();};
    kumas(yol,[s<0?X(-296):172,796,s<0?-172:X(296),850],{renk:karistir(R,[0,0,0],s>0?.35:.05),seed:450+s,tara:.6});
    dugme(s*190,808,4.5,k,'#3a3420');
  }
}
function entari(k,X,T){
  const o=ORTU.entari, h=G.giysi.hirka;
  if(h){ // hırka dışta, entari içte
    const HT=tonlar(h);
    const desen=()=>{const r=rng(460); for(let x=-380;x<380;x+=7){c.strokeStyle=rgba(karistir(hex(h),[0,0,0],.5),.18+r()*.12); c.lineWidth=1.2; c.beginPath(); c.moveTo(x,780); c.lineTo(x+(r()-.5)*4,1300); c.stroke();}};
    disBoya(()=>silYol(X,o),HT,k,X,desen);
    titrek(()=>silKenar(X,o),PAL.murekkep,.9,2,352+k,3,3);
    const acik=()=>{c.moveTo(-o.boyun,o.y); c.bezierCurveTo(-100,900,-96,1000,-92,1300); c.lineTo(92,1300); c.bezierCurveTo(96,1000,100,900,o.boyun,o.y); c.closePath();};
    entariIc(k,acik);
    boyun(k,830,false);
    yakaBandi(k,G.yuz.boyun,826,hexYaz(karistir(hex(G.giysi.icRenk||IC_RENK.entari),[0,0,0],.2)));
    for(const s of[-1,1]) titrek(()=>{c.moveTo(s*o.boyun,o.y); c.bezierCurveTo(s*100,900,s*96,1000,s*92,1300);},PAL.murekkep,.8,1.6,465+s+k,2,2);
  } else {
    const R=hex(T.ana), D=karistir(R,'#2a1a18',.5), r=rng(470);
    disBoya(()=>silYol(X,o),T,k,X,()=>{for(let i=0;i<500;i++){const x=-400+r()*800, y=780+r()*520, s=2+r()*2; c.fillStyle=rgba(D,.35+r()*.2); c.beginPath(); c.arc(x,y,s,0,TAU); c.fill();}});
    titrek(()=>silKenar(X,o),PAL.murekkep,.9,2,352+k,3,3);
    boyun(k,830,false);
    yakaBandi(k,G.yuz.boyun,826,hexYaz(karistir(R,[0,0,0],.25)));
  }
}
function onluk(k,X,T){
  // gövde: gömlek (ya da yelek), üstünde boyna asılı önlük
  const o=ORTU.onluk, IR=hex(G.giysi.icRenk||IC_RENK.gomlek);
  disBoya(()=>silYol(X,o),tonlar(hexYaz(IR)),k,X);
  titrek(()=>silKenar(X,o),PAL.murekkep,.9,2,352+k,3,3);
  if(G.giysi.ic==='yelek'){
    for(const s of[-1,1]){
      const yol=()=>{c.moveTo(s*86,786); c.bezierCurveTo(s*60,850,s*34,910,s*28,990); c.lineTo(s*30,1300); c.lineTo(X(s*330),1300); c.bezierCurveTo(X(s*330),1000,X(s*300),880,X(s*250),830); c.quadraticCurveTo(s*160,790,s*86,786); c.closePath();};
      kumas(yol,[s<0?X(-330):28,786,s<0?-28:X(330),1300],{renk:karistir(hex(G.giysi.yelekRenk||'#23201b'),[0,0,0],s>0?.3:0),seed:480+s,tara:.9});
    }
  }
  boyun(k,836,false);
  yakaBandi(k,G.yuz.boyun,834,hexYaz(IR));
  const A=hex(T.ana);
  const govdeYol=()=>{c.moveTo(-130,930); c.quadraticCurveTo(0,918,130,930); c.lineTo(150,1300); c.lineTo(-150,1300); c.closePath();};
  kumas(govdeYol,[-150,918,150,1300],{renk:A,seed:490,tara:1});
  for(const s of[-1,1]) titrek(()=>{c.moveTo(s*62,790); c.quadraticCurveTo(s*90,860,s*122,932);},karistir(A,[0,0,0],.3),.95,5,495+s+k,2,1.6);
}
function kepenek(k,X,T){
  const o=ORTU.kepenek, R=hex(T.ana);
  const desen=()=>{const r=rng(500); for(let i=0;i<900;i++){const x=-460+r()*920, y=770+r()*530, a=r()*TAU, L=3+r()*6; c.strokeStyle=rgba(r()<.5?karistir(R,'#d0c6a6',.3):karistir(R,[0,0,0],.5),.25+r()*.2); c.lineWidth=1+r(); c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L); c.stroke();}};
  disBoya(()=>silYol(X,o),T,k,X,desen);
  titrek(()=>silKenar(X,o),PAL.murekkep,.9,2.4,352+k,3,3.4);
  boyun(k,820,false);
  // keçenin kalın yakası ve önde yarık
  const yol=()=>{c.moveTo(-110,768); c.quadraticCurveTo(0,840,110,768); c.lineTo(120,800); c.quadraticCurveTo(0,876,-120,800); c.closePath();};
  kumas(yol,[-120,768,120,876],{renk:karistir(R,[0,0,0],.15),seed:505,tara:.8});
  titrek(()=>{c.moveTo(4,846); c.lineTo(8,1300);},PAL.murekkep,.8,2,506+k,2,2);
}

export function govde(){
  const k=poz.kaynama, X=omuzEsle(), T=ortuTon();
  c.save(); c.translate(0,-38-poz.nefes*3.2);
  const o=G.ortu;
  if(o==='aba'||o==='cubbe') acikOrtu(k,X,T,o==='cubbe');
  else if(o==='kaput') kaput(k,X,T);
  else if(o==='entari') entari(k,X,T);
  else if(o==='onluk') onluk(k,X,T);
  else if(o==='kepenek') kepenek(k,X,T);
  else palto(k,X,T);
  const ET=etekTon();
  if(!(o==='palto'&&G.giysi.ic==='bluz')) erime(()=>silYol(X,ORTU[o]||ORTU.palto),ET);
  baslikGovde(X,yol=>erime(yol,ET));
  c.restore();
}

const etekTon=()=>G.ortu==='entari'&&G.giysi.hirka?tonlar(G.giysi.icRenk||IC_RENK.entari):ortuTon();
export function altGovde(){ // yere kadar inen örtü ve yanlarda sarkan eller: yalnızca ayaktayken görünür, bacak çizilmez
  const k=poz.kaynama, X=omuzEsle(), T=etekTon(), R=G.renk;
  c.save(); c.translate(0,-38);
  // etek, örtünün alt kenarıyla aynı genişlikte başlar (palto: 372)
  const u0=Math.max(-(ORTU[G.ortu]||ORTU.palto).sil[1][4],G.baslik.tur==='sal'?400:0), u1=u0+48;
  const etek=()=>{c.moveTo(X(-u0),1280); c.lineTo(X(-u1),2780); c.lineTo(X(u1),2780); c.lineTo(X(u0),1280); c.closePath();};
  c.beginPath(); etek();
  const g=c.createLinearGradient(X(-300),1280,X(300),2780); g.addColorStop(0,T.etek[0]); g.addColorStop(1,T.etek[1]); c.fillStyle=g; c.fill();
  c.save(); c.clip(); tara(X(-u1),1280,X(u1),2780,.75,10,PAL.murekkep,.5,760+k,1.3); leke(X(280),2050,220,760,PAL.siyah,.7); c.restore();
  titrek(()=>{c.moveTo(X(-u0),1280); c.lineTo(X(-u1),2780); c.moveTo(X(u1),2780); c.lineTo(X(u0),1280);},PAL.murekkep,.9,2.2,761+k,2,3);
  titrek(()=>{c.moveTo(-2,1150); c.lineTo(5,2780);},PAL.murekkep,.8,2,762+k,2,3);
  for(const s of[-1,1]){
    c.fillStyle=s<0?R.el[0]:R.el[1]; c.beginPath(); c.ellipse(X(s*388),2010,36,74,s*.08,0,TAU); c.fill();
    titrek(()=>{c.ellipse(X(s*388),2010,36,74,s*.08,0,TAU);},PAL.murekkep,.85,1.8,763+s+k,2,2);
  }
  c.restore();
}
