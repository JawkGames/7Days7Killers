// Katil farkı: aynı sahnede küçük, göze batmayan bir kanıt. Oyuncuya yazıyla söylenmez.
// kanit = {tur, x, y, s, alet, don}. tur: 'kanli-bez' | 'sandik' | 'alet'.
import {c} from '../../teknik/tuval.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,hat,leke,yerel,sekil,tabanGolge,parilti} from './cizer.js';

export const KANIT_TURLERI=['kanli-bez','sandik','alet'];
export const VARSAYILAN_KANIT={tur:'kanli-bez'};

// buruşuk bez; kurumuş kan lekesi kenara doğru kararır
function kanliBez(o){
  const r=rng(o.seed||901);
  tabanGolge(0,2,40,7,.6);
  const yol=()=>{c.moveTo(-34,0); c.bezierCurveTo(-42,-14,-26,-26,-12,-22); c.bezierCurveTo(-4,-34,18,-30,22,-18); c.bezierCurveTo(38,-20,44,-6,34,0); c.closePath();};
  sekil(yol,R.bez,[-42,-34,44,0],{seed:902,isik:.25,aralik:4,aci:.8,taraA:.25});
  c.save(); c.beginPath(); yol(); c.clip();
  leke(6+(r()-.5)*6,-12,20,12,R.kan,.95,r()); leke(14,-6,14,8,R.kanKoyu,.8); leke(-10,-16,9,6,R.kan,.7);
  c.restore();
  for(let i=0;i<4;i++) hat(()=>{c.moveTo(-20+i*12,-18+i*2); c.quadraticCurveTo(-14+i*12,-10,-18+i*12,-2);},R.murekkep,.45,1,903+i,1,1); // kırışık
}

// yarı açık küçük sandık: aralıktan kanlı bir bezin ucu sarkar, içeride bir bıçak ağzı parlar
function sandikKanit(o){
  tabanGolge(0,3,70,10,.8);
  const w=110, h=62;
  sekil(()=>{c.rect(-w/2,-h,w,h);},[56,38,24],[-w/2,-h,w/2,0],{seed:911,aralik:5});
  c.fillStyle='rgba(14,12,10,.95)'; c.fillRect(-w/2,-h+10,w,6); hat(()=>{c.rect(-w/2,-h+10,w,6);},R.murekkep,.6,1,912,1,1);
  // kapak hafif aralık: altında karanlık yarık
  c.fillStyle='#030202'; c.beginPath(); c.moveTo(-w/2,-h); c.lineTo(w/2,-h); c.lineTo(w/2-2,-h-12); c.lineTo(-w/2+2,-h-7); c.closePath(); c.fill();
  sekil(()=>{c.moveTo(-w/2-3,-h-6); c.lineTo(w/2+3,-h-12); c.lineTo(w/2+3,-h-26); c.lineTo(-w/2-3,-h-20); c.closePath();},[50,34,22],[-w/2-3,-h-26,w/2+3,-h-6],{seed:913,aralik:4});
  // yarıktan sarkan bez ucu
  const bez=()=>{c.moveTo(-10,-h-4); c.bezierCurveTo(-14,-h+10,-6,-h+26,-12,-h+38); c.lineTo(4,-h+36); c.bezierCurveTo(6,-h+20,8,-h+8,8,-h-6); c.closePath();};
  sekil(bez,R.bez,[-14,-h-6,8,-h+38],{seed:914,tara:false,kalin:1});
  c.save(); c.beginPath(); bez(); c.clip(); leke(-4,-h+22,10,18,R.kan,.95); c.restore();
  // içeride bıçak ağzı: yarıkta ince bir parıltı
  parilti(()=>{c.moveTo(18,-h-6); c.lineTo(44,-h-9);},.55,1.4);
}

// saklanmış alet: yarısı bir bezin ya da samanın altında, ağzında kararmış kan
const ALETLER={
  kama:()=>{c.moveTo(-40,-3); c.lineTo(-6,-4); c.lineTo(-6,4); c.lineTo(-40,3); c.closePath(); c.moveTo(-6,-6); c.lineTo(42,-1); c.lineTo(-6,6); c.closePath();},
  bicak:()=>{c.moveTo(-34,-3); c.lineTo(-4,-3); c.lineTo(-4,3); c.lineTo(-34,3); c.closePath(); c.moveTo(-4,-5); c.lineTo(34,-3); c.quadraticCurveTo(40,2,30,5); c.lineTo(-4,4); c.closePath();},
  orak:()=>{c.moveTo(-50,-3); c.lineTo(-14,-3); c.lineTo(-14,3); c.lineTo(-50,3); c.closePath(); c.moveTo(-14,-2); c.bezierCurveTo(10,-30,48,-24,54,0); c.bezierCurveTo(40,-14,14,-16,-14,4); c.closePath();},
  makas:()=>{c.ellipse(-30,-6,8,6,0,0,Math.PI*2); c.ellipse(-30,8,8,6,0,0,Math.PI*2); c.moveTo(-22,-4); c.lineTo(36,4); c.lineTo(-22,2); c.closePath(); c.moveTo(-22,6); c.lineTo(36,2); c.lineTo(-22,10); c.closePath();},
  cekic:()=>{c.moveTo(-46,-3); c.lineTo(20,-3); c.lineTo(20,3); c.lineTo(-46,3); c.closePath(); c.rect(18,-14,22,28);},
  balta:()=>{c.moveTo(-50,-3); c.lineTo(14,-3); c.lineTo(14,3); c.lineTo(-50,3); c.closePath(); c.moveTo(8,-8); c.lineTo(22,-8); c.bezierCurveTo(34,-18,40,-6,40,4); c.bezierCurveTo(40,14,34,22,22,12); c.lineTo(8,8); c.closePath();}
};
function aletKanit(o){
  const ad=ALETLER[o.alet]?o.alet:'bicak';
  tabanGolge(0,3,56,8,.7);
  c.save(); c.translate(0,-6);
  sekil(ALETLER[ad],[64,64,60],[-50,-30,54,22],{seed:921,isik:.35,tara:false,kalin:1.2,hatA:.9});
  c.save(); c.beginPath(); ALETLER[ad](); c.clip(); leke(24,0,18,10,R.kan,.95); leke(34,0,10,8,R.kanKoyu,.9); c.restore();
  parilti(()=>{c.moveTo(0,-3); c.lineTo(16,-2);},.45,1.2);
  c.restore();
  // üstünü örten kirli bez: aletin sapını gizler
  if(o.ortu!==false){
    const ort=()=>{c.moveTo(-60,2); c.bezierCurveTo(-64,-16,-40,-22,-20,-16); c.bezierCurveTo(-8,-22,4,-14,0,2); c.closePath();};
    sekil(ort,[58,52,40],[-64,-22,4,2],{seed:922,aralik:4,aci:.7});
  }
}

export function kanitCiz(k){
  if(!k) return;
  yerel(k.x||0,k.y||0,k.s||1,()=>{
    if(k.tur==='sandik') sandikKanit(k);
    else if(k.tur==='alet') aletKanit(k);
    else kanliBez(k);
  },k.don);
  // kanıt kendi küçük ışığını almaz; yalnızca kanın üstünde çok hafif bir ıslaklık
  leke(k.x||0,(k.y||0)-10,22*(k.s||1),8*(k.s||1),[90,20,16],.08);
}
