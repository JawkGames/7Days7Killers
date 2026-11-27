// İkircikli ayrıntı: HER kayıp sahnesinde, masum da olsa, iki türlü okunabilecek bir ayrıntı bulunur.
//   sandik     yarı açık küçük sandık; aralıktan koyu lekeli bir bez sarkar
//   yanik-bez  ocakta, mangalda ya da yerde külün içinde yarı yanmış bez
//   alet       duvara / kapı arkasına dayalı alet; başına sarılı lekeli bez
//   leke       yerde koyu, kurumuş leke ve sürtünme izi
// Katilde aynı ayrıntı gerçek kanıttır ama görüntüsü masumunkinden kesin ayrılmaz: biçim, yer, boyut ve ışık aynıdır.
// Değişen yalnız iki şeydir: lekenin tonu kana birkaç derece yakındır ve ayrıntının ucunda duran küçük nesne
// (`uc`) kişinin kendi eşyasıdır (Kör Halil'de boynuz saplı kama), masumda ise aynı boyda, aynı kütlede
// sıradan bir şeydir (tahta kaşık sapı). Kaç kişinin katil olduğu hiçbir aşamada söylenmez; bu ayrıntı da söylemez.
import {c} from '../../teknik/tuval.js';
import {TAU,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,hat,leke,yerel,sekil,tabanGolge,parilti,tara} from './cizer.js';

export const KANIT_TURLERI=['sandik','yanik-bez','alet','leke'];
export const VARSAYILAN_KANIT={tur:'leke'};
// eski adlar (önceki sürümün `kanit` parametresi) yeni türlere düşer
const ESKI={'kanli-bez':'yanik-bez'};

// lekenin tonu: masumda is, yağ, pas; katilde kurumuş kan. Aradaki fark loş ışıkta seçilmeyecek kadar küçük
const TON={masum:[36,24,17], katil:[44,17,13]};

/* ───── uçtaki küçük nesneler: her kişinin eşyası ve masumdaki aynı kütleli karşılığı ───── */
const UC={
  // masum karşılıklar
  kasik:()=>{sekil(()=>{c.moveTo(-22,-2); c.lineTo(16,-4); c.quadraticCurveTo(22,-3,22,0); c.lineTo(-22,2); c.closePath();},[96,72,44],[-22,-4,22,2],{seed:1101,tara:false,kalin:1});},
  ip:()=>{hat(()=>{c.moveTo(-22,0); c.bezierCurveTo(-10,-8,4,6,16,-2); c.lineTo(22,2);},[96,84,60],.9,2.6,1102,2,1); c.fillStyle='rgba(96,84,60,.9)'; c.beginPath(); c.arc(16,-2,3.4,0,TAU); c.fill();},
  kibrit:()=>{hat(()=>{c.moveTo(-10,0); c.lineTo(10,-2);},[120,100,64],.9,2.2,1103,1,0); c.fillStyle='#1a120c'; c.beginPath(); c.ellipse(11,-2,3,2.4,0,0,TAU); c.fill();},
  cul:()=>{sekil(()=>{c.moveTo(-18,0); c.lineTo(-4,-14); c.lineTo(18,-6); c.lineTo(12,2); c.closePath();},[80,76,64],[-18,-14,18,2],{seed:1104,tara:false,kalin:1});},
  tas:()=>{sekil(()=>{c.ellipse(0,-5,9,6,.2,0,TAU);},[70,68,58],[-9,-11,9,1],{seed:1105,tara:false,kalin:1});},
  civi:()=>{hat(()=>{c.moveTo(-12,0); c.lineTo(12,-2);},[60,58,54],.95,2.2,1106,1,0); hat(()=>{c.moveTo(-12,-4); c.lineTo(-12,4);},[60,58,54],.95,2.6,1107,1,0);},
  halka:()=>{hat(()=>{c.ellipse(0,-4,9,5,0,0,TAU);},[58,56,52],.95,2.6,1108,2,0);},
  kutu:()=>{sekil(()=>{c.rect(-11,-8,22,8);},[74,60,40],[-11,-8,11,0],{seed:1109,tara:false,kalin:1});},
  dal:()=>{hat(()=>{c.moveTo(-24,0); c.lineTo(4,-3); c.lineTo(22,-1); c.moveTo(4,-3); c.lineTo(12,-10);},[70,56,38],.9,2.2,1110,1,0);},
  dugmeKemik:()=>{c.fillStyle='rgba(140,132,110,.95)'; c.beginPath(); c.ellipse(0,-3,6,3.4,0,0,TAU); c.fill(); c.fillStyle='#0a0a08'; for(const d of[-1.6,1.6]){c.beginPath(); c.arc(d,-3,.9,0,TAU); c.fill();}},
  // kişinin eşyası
  kama:()=>{hat(()=>{c.moveTo(-22,1); c.quadraticCurveTo(0,-8,20,-3);},[150,138,108],.95,4,1121,2,0); hat(()=>{c.moveTo(14,-6); c.lineTo(14,1);},[120,96,40],.9,1.6,1122,1,0);}, // boynuz sap, pirinç bilezik
  muska:()=>{sekil(()=>{c.moveTo(-8,0); c.lineTo(0,-12); c.lineTo(8,0); c.closePath();},[70,48,30],[-8,-12,8,0],{seed:1123,tara:false,kalin:1}); hat(()=>{c.moveTo(0,-12); c.bezierCurveTo(-10,-14,-20,-6,-24,2);},[86,70,48],.85,1.6,1124,1,0);},
  kopyaKalemi:()=>{hat(()=>{c.moveTo(-10,0); c.lineTo(9,-2);},[72,62,84],.95,3,1125,1,0); hat(()=>{c.moveTo(9,-2); c.lineTo(13,-2.4);},[30,24,40],.95,1.6,1126,1,0);},
  deri:()=>{sekil(()=>{c.moveTo(-18,0); c.lineTo(-6,-13); c.lineTo(17,-7); c.lineTo(12,2); c.closePath();},[78,52,32],[-18,-13,17,2],{seed:1127,tara:false,kalin:1}); leke(2,-6,6,4,R.siyah,.6);},
  kurdele:()=>{hat(()=>{c.moveTo(-22,0); c.bezierCurveTo(-10,-8,4,6,16,-2); c.lineTo(22,2);},[104,44,38],.9,2.6,1128,2,1);},
  yazma:()=>{sekil(()=>{c.moveTo(-18,0); c.lineTo(-4,-14); c.lineTo(18,-6); c.lineTo(12,2); c.closePath();},[118,100,46],[-18,-14,18,2],{seed:1129,tara:false,kalin:1}); for(let i=0;i<3;i++){c.fillStyle='rgba(60,46,20,.8)'; c.beginPath(); c.arc(-8+i*8,1,1.3,0,TAU); c.fill();}},
  kostek:()=>{for(let i=0;i<6;i++) hat(()=>{c.ellipse(-12+i*5,-2+Math.sin(i)*1.5,2.6,1.6,i*.5,0,TAU);},[130,132,128],.9,1.1,1130+i,1,0);},
  dugme:()=>{c.fillStyle='rgba(118,96,44,.95)'; c.beginPath(); c.ellipse(0,-3,6,3.4,0,0,TAU); c.fill(); c.fillStyle='#0a0a08'; for(const d of[-1.6,1.6]){c.beginPath(); c.arc(d,-3,.9,0,TAU); c.fill();}},
  cingirak:()=>{sekil(()=>{c.moveTo(-7,0); c.quadraticCurveTo(-7,-12,0,-13); c.quadraticCurveTo(7,-12,7,0); c.closePath();},[64,60,50],[-7,-13,7,0],{seed:1136,tara:false,kalin:1}); c.fillStyle='#0a0a08'; c.beginPath(); c.arc(0,1,1.8,0,TAU); c.fill();},
  boncuk:()=>{sekil(()=>{c.ellipse(0,-5,7,5.4,.2,0,TAU);},[58,72,96],[-7,-10,7,0],{seed:1137,tara:false,kalin:1}); c.fillStyle='rgba(8,10,12,.9)'; c.beginPath(); c.arc(1,-5,1.4,0,TAU); c.fill();},
  anahtar:()=>{hat(()=>{c.ellipse(-12,-3,4.5,3.4,0,0,TAU); c.moveTo(-7,-3); c.lineTo(12,-2); c.moveTo(8,-2); c.lineTo(8,2); c.moveTo(12,-2); c.lineTo(12,2);},[66,62,56],.95,2,1138,2,0);},
  bilezik:()=>{hat(()=>{c.ellipse(0,-4,9,5,0,0,TAU);},[120,98,46],.95,2.6,1139,2,0); for(let i=0;i<5;i++) hat(()=>{const a=i/5*TAU; c.moveTo(Math.cos(a)*9,-4+Math.sin(a)*5); c.lineTo(Math.cos(a+.3)*9,-4+Math.sin(a+.3)*5);},[40,30,12],.7,1,1140+i,1,0);},
  cakmak:()=>{sekil(()=>{c.roundRect(-11,-8,22,8,2);},[128,124,112],[-11,-8,11,0],{seed:1145,tara:false,kalin:1}); hat(()=>{c.moveTo(-6,-4); c.lineTo(6,-5);},[170,170,160],.4,1,1146,1,0);},
  makas:()=>{hat(()=>{c.ellipse(-14,-3,4.5,3,0,0,TAU); c.moveTo(-10,-2); c.lineTo(16,-1);},[60,60,58],.95,2,1147,2,0);},
  duduk:()=>{sekil(()=>{c.rect(-10,-6,18,6);},[110,90,44],[-10,-6,8,0],{seed:1148,tara:false,kalin:1}); hat(()=>{c.moveTo(8,-4); c.lineTo(14,-1);},[110,90,44],.9,2,1149,1,0);},
  sal:()=>{sekil(()=>{c.moveTo(-18,0); c.lineTo(-4,-14); c.lineTo(18,-6); c.lineTo(12,2); c.closePath();},[80,76,64],[-18,-14,18,2],{seed:1150,tara:false,kalin:1}); for(let i=0;i<5;i++) hat(()=>{c.moveTo(-14+i*6,1); c.lineTo(-15+i*6,6);},[80,76,64],.7,1,1151+i,1,0);},
  kepenek:()=>{sekil(()=>{c.moveTo(-18,0); c.lineTo(-4,-14); c.lineTo(18,-6); c.lineTo(12,2); c.closePath();},[72,64,50],[-18,-14,18,2],{seed:1156,tara:false,kalin:1.6});},
  carik:()=>{hat(()=>{c.moveTo(-22,0); c.bezierCurveTo(-10,-8,4,6,16,-2); c.lineTo(22,2);},[86,62,40],.9,2.4,1157,2,1); hat(()=>{c.moveTo(-4,-2); c.lineTo(-2,2); c.moveTo(4,0); c.lineTo(6,4);},[40,26,14],.7,1,1158,1,0);},
  kirbac:()=>{hat(()=>{c.moveTo(-22,0); c.bezierCurveTo(-10,-8,4,6,16,-2); c.lineTo(22,2);},[70,50,30],.9,2.6,1159,2,1); for(let i=0;i<5;i++) hat(()=>{c.moveTo(-16+i*7,-3); c.lineTo(-13+i*7,1);},[30,20,10],.7,1,1160+i,1,0);},
  kalem:()=>{hat(()=>{c.moveTo(-24,0); c.lineTo(10,-3);},[42,64,46],.95,3.4,1165,1,0); hat(()=>{c.moveTo(10,-3); c.lineTo(18,-3.5);},[120,110,70],.9,1.6,1166,1,0);},
  kasket:()=>{sekil(()=>{c.moveTo(-18,0); c.lineTo(-4,-14); c.lineTo(18,-6); c.lineTo(12,2); c.closePath();},[78,76,66],[-18,-14,18,2],{seed:1167,tara:false,kalin:1}); hat(()=>{c.moveTo(-12,-2); c.quadraticCurveTo(0,-8,12,-3);},[30,30,26],.6,1,1168,1,0);} // siperliğin dikişi
};
function ucCiz(ad,x,y,s,don){const f=UC[ad]; if(f) yerel(x,y,s||1,f,don||0);}

/* ───── ayrıntının kendisi: masumda ve katilde aynı çizim ───── */

// yarı açık küçük sandık: aralıktan koyu lekeli bez sarkar, ucu yerde; uçta küçük nesne
function sandik(o,ton){
  tabanGolge(0,3,76,11,.8);
  const w=112, h=64;
  sekil(()=>{c.rect(-w/2,-h,w,h);},[60,42,26],[-w/2,-h,w/2,0],{seed:911,aralik:5});
  c.fillStyle='rgba(16,14,11,.95)'; c.fillRect(-w/2,-h+12,w,7); hat(()=>{c.rect(-w/2,-h+12,w,7);},R.murekkep,.7,1,912,1,1); // demir kuşak
  c.fillStyle='#030202'; c.beginPath(); c.moveTo(-w/2,-h); c.lineTo(w/2,-h); c.lineTo(w/2-2,-h-14); c.lineTo(-w/2+2,-h-8); c.closePath(); c.fill(); // karanlık aralık
  sekil(()=>{c.moveTo(-w/2-3,-h-7); c.lineTo(w/2+3,-h-14); c.lineTo(w/2+3,-h-28); c.lineTo(-w/2-3,-h-21); c.closePath();},[52,36,22],[-w/2-3,-h-28,w/2+3,-h-7],{seed:913,aralik:4});
  // aralıktan sarkan bez: sandığın önünden yere iner
  const bez=()=>{c.moveTo(-18,-h-6); c.bezierCurveTo(-24,-h+14,-12,-h+34,-20,-8); c.bezierCurveTo(-14,4,8,6,14,-2); c.bezierCurveTo(2,-20,4,-h+18,2,-h-8); c.closePath();};
  sekil(bez,[84,78,64],[-24,-h-8,14,6],{seed:914,aralik:4,taraA:.35});
  c.save(); c.beginPath(); bez(); c.clip(); leke(-8,-h+36,12,20,ton,.92); leke(-4,-8,10,6,ton,.7); c.restore();
}

// külün içinde yarı yanmış bez: kömürleşmiş kıvrımlar, kenarında yanmamış bir köşe (uc) kalır
function yanikBez(o){
  const r=rng(931);
  leke(0,-2,70,15,[64,62,56],.55); leke(0,-4,46,9,[90,88,80],.35); // kül
  const bez=()=>{c.moveTo(-40,0); c.bezierCurveTo(-46,-14,-30,-22,-14,-18); c.bezierCurveTo(-6,-28,14,-26,20,-16); c.bezierCurveTo(34,-18,40,-6,32,0); c.closePath();};
  sekil(bez,[22,18,14],[-46,-28,40,0],{seed:932,aralik:4,taraA:.45,isik:.08});
  c.save(); c.beginPath(); bez(); c.clip();
  for(let i=0;i<5;i++) leke(-30+i*15+(r()-.5)*6,-8-r()*8,10,6,[70,40,22],.35); // kavrulmuş kahverengi
  c.restore();
  for(let i=0;i<4;i++) hat(()=>{c.moveTo(-26+i*14,-16+i*2); c.quadraticCurveTo(-20+i*14,-8,-24+i*14,-1);},[60,50,40],.5,1,933+i,1,1); // kırışık
  // kenarda kıvrılmış kül tozu
  for(let i=0;i<10;i++){c.fillStyle=`rgba(110,106,96,${.2+r()*.3})`; c.beginPath(); c.arc((r()-.5)*80,-r()*6,1+r()*2,0,TAU); c.fill();}
}

// duvara dayalı alet; başına koyu lekeli bir bez sarılı
const ALET={
  orak:()=>{c.moveTo(-3,0); c.lineTo(3,0); c.lineTo(3,-120); c.lineTo(-3,-120); c.closePath(); c.moveTo(-2,-118); c.bezierCurveTo(-46,-150,-20,-200,30,-190); c.bezierCurveTo(-6,-180,-22,-152,4,-126); c.closePath();},
  balta:()=>{c.moveTo(-4,0); c.lineTo(4,0); c.lineTo(4,-250); c.lineTo(-4,-250); c.closePath(); c.moveTo(-6,-232); c.lineTo(-6,-262); c.lineTo(10,-264); c.bezierCurveTo(30,-280,44,-262,44,-246); c.bezierCurveTo(44,-232,30,-216,10,-228); c.closePath();},
  kurek:()=>{c.moveTo(-4,0); c.lineTo(4,0); c.lineTo(4,-220); c.lineTo(-4,-220); c.closePath(); c.moveTo(-26,-214); c.lineTo(26,-214); c.lineTo(22,-300); c.quadraticCurveTo(0,-312,-22,-300); c.closePath();},
  sopa:()=>{c.moveTo(-4,0); c.lineTo(4,0); c.lineTo(5,-280); c.bezierCurveTo(6,-300,26,-310,30,-292); c.lineTo(24,-290); c.bezierCurveTo(22,-298,12,-294,-3,-280); c.closePath();}
};
const ALET_BAS={orak:-160,balta:-238,kurek:-232,sopa:-262};
function alet(o,ton){
  const ad=ALET[o.alet]?o.alet:'kurek', by=ALET_BAS[ad];
  tabanGolge(0,2,30,6,.7);
  leke(28,by*.55,26,-by*.5,R.siyah,.45); // duvara düşen gölge
  c.save(); c.rotate(.12);
  sekil(ALET[ad],[60,50,36],[-30,by-60,46,0],{seed:941,isik:.18,aralik:4,taraA:.35,kalin:1.4});
  // başa sarılı bez
  const bez=()=>{c.moveTo(-14,by+20); c.bezierCurveTo(-20,by+4,-12,by-12,0,by-10); c.bezierCurveTo(14,by-12,20,by+2,14,by+22); c.bezierCurveTo(10,by+46,-4,by+52,-10,by+40); c.closePath();};
  sekil(bez,[78,72,58],[-20,by-12,20,by+52],{seed:942,aralik:4,taraA:.4});
  c.save(); c.beginPath(); bez(); c.clip(); leke(2,by+18,12,16,ton,.9); c.restore();
  c.restore();
}

// yerde kurumuş koyu leke: düzensiz kenar, birkaç damla ve bir yana çekilmiş sürtünme izi
function lekeCiz(o,ton){
  const r=rng(951);
  c.save(); c.scale(1,.32);
  const P=[]; for(let i=0;i<12;i++){const a=i/12*TAU, k=.65+r()*.45; P.push([Math.cos(a)*52*k,Math.sin(a)*52*k-30]);}
  const yol=()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<=P.length;i++){const p=P[i%P.length], q=P[(i-1)%P.length]; c.quadraticCurveTo(q[0],q[1],(p[0]+q[0])/2,(p[1]+q[1])/2);} c.closePath();};
  c.fillStyle=rgba(ton,.72); c.beginPath(); yol(); c.fill();
  c.save(); c.beginPath(); yol(); c.clip(); leke(-10,-34,40,30,R.siyah,.5); leke(14,-24,24,18,[ton[0]+20,ton[1]+6,ton[2]+4],.3); tara(-60,-90,60,30,.5,5,R.murekkep,.35,952); c.restore();
  hat(yol,R.murekkep,.5,1.4,953,2,1);
  for(let i=0;i<5;i++){const x=50+r()*60, y=-30+(r()-.5)*50; c.fillStyle=rgba(ton,.8); c.beginPath(); c.arc(x,y,2+r()*4,0,TAU); c.fill();} // damlalar
  c.restore();
  // sürtünme izi: lekeden bir yana çekilmiş iki silik çizgi
  for(let i=0;i<2;i++) hat(()=>{c.moveTo(-40,-8+i*6); c.bezierCurveTo(-80,-10+i*6,-120,-6+i*5,-150,-12+i*4);},ton,.4,3,954+i,1,2);
}

/* sahneye göre öğeyi kurar. Öncelik: çağıranın `kanit`ı > kişinin `ikircik`i > eski `kanit` konumu > yerin noktası */
export function ikircikKur({yer,ip,katilMi,kanit}){
  const ki=ip.ikircik||{}, eski=ip.kanit||{}, ust=kanit||{};
  const a={...VARSAYILAN_KANIT,...(yer.kanit||{}),...pick(eski),...ki,...ust};
  a.tur=ESKI[a.tur]||a.tur; if(!KANIT_TURLERI.includes(a.tur)) a.tur='leke';
  if(ust.tur==='alet'&&ust.alet&&!ALET[ust.alet]) a.alet='kurek';
  return {...a, kanit:true, katil:!!katilMi, uc:katilMi?(a.katil||a.uc):(a.masum||a.uc)};
}
const pick=o=>{const r={}; for(const k of['x','y','s']) if(o[k]!=null) r[k]=o[k]; return r;};

// ucun konumu her türde aynı yerdedir (masumda da katilde de)
const UC_YERI={sandik:[-6,4,.9],'yanik-bez':[36,-2,1],alet:[34,4,1],leke:[60,-4,1]};

export function kanitCiz(k){
  if(!k) return;
  const ton=k.katil?TON.katil:TON.masum;
  yerel(k.x||0,k.y||0,k.s||1,()=>{
    if(k.tur==='sandik') sandik(k,ton);
    else if(k.tur==='yanik-bez') yanikBez(k);
    else if(k.tur==='alet') alet(k,ton);
    else lekeCiz(k,ton);
    const [ux,uy,us]=UC_YERI[k.tur]||[0,0,1];
    if(k.uc) ucCiz(k.uc,ux,uy,us,k.tur==='yanik-bez'?-.2:0);
    if(k.tur==='yanik-bez') parilti(()=>{c.moveTo(-30,-18); c.lineTo(10,-24);},.12,1);
  },k.don);
}
