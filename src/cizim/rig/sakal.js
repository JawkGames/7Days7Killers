// Sakal ve bıyık. Kafa çizilirken, burundan sonra (sakal) ve ağızdan sonra (bıyık) çağrılır.
// Ağız mekaniği değişmez: sakal alt dudağın altından başlar, bıyık üst dudağı örter; açılan ağız ikisinin arasında kalır.
import {c} from '../teknik/tuval.js';
import {leke,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {rgba} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir,hexYaz} from './gorunus.js';
import {lifDoldur,teller} from './doku.js';
import {yuzYolu} from './yuz.js';

// sakalın çene altından ne kadar sarktığı (birim); sakal.boy bununla çarpılır
const SARKMA={kirli:0, kisa:26, uzun:120, dagnik:140};

export function sakal(mx,dy){
  const Y=G.yuz, R=G.renk, S=G.sakal;
  const e=Y.en, m=e*Y.elmacik, j=e*Y.cene, ju=e*Y.ceneUc, b=Y.boy;
  if(S.bicim==='kirli'){ // kirli sakal: çenede ve yanakta koyu benekler
    c.save(); c.beginPath(); yuzYolu(); c.clip();
    const bolge=()=>{c.moveTo(-150*e,30); c.bezierCurveTo(-120*e,90*b,-70+mx,150+dy,mx,190+dy); c.bezierCurveTo(70+mx,150+dy,120*e,90*b,150*e,30); c.lineTo(160*e,260*b); c.lineTo(-160*e,260*b); c.closePath();};
    c.beginPath(); bolge(); c.clip();
    leke(-40,190*b,150*e,80,R.sacKoyu,.42); leke(80*e,150*b,90*e,110,R.sacKoyu,.4); leke(mx,150+dy,70,26,R.sacKoyu,.32);
    const r=rng(91);
    for(let i=0;i<1600;i++){const x=(r()*2-1)*150*e, y=30+r()*200*b; c.fillStyle=rgba(R.sacKoyu,.18+r()*.3); c.fillRect(x,y,.8+r()*.6,.8+r()*.6);}
    c.restore(); return;
  }
  const L=SARKMA[S.bicim]*S.boy, dg=S.bicim==='dagnik';
  const alt=215*b+L, dar=S.bicim==='kisa'?1:.62; // uzun sakal aşağıda daralır
  const yol=()=>{
    c.moveTo(-154*e,-16);
    c.bezierCurveTo(-170*m,30*b,-154*m,96*b,-126*j,146*b);
    if(S.bicim==='kisa'){ c.bezierCurveTo(-106*j,190*b,-70*ju,222*b+L*.6,-30*ju,alt-2); c.quadraticCurveTo(0,alt+6,30*ju,alt-2); c.bezierCurveTo(70*ju,222*b+L*.6,106*j,190*b,126*j,146*b); }
    else { c.bezierCurveTo(-118*j,200*b,-110*dar*e,alt-L*.45,-56*dar*e,alt-L*.08); c.quadraticCurveTo(0,alt+(dg?20:12),56*dar*e,alt-L*.08); c.bezierCurveTo(110*dar*e,alt-L*.45,118*j,200*b,126*j,146*b); }
    c.bezierCurveTo(154*m,96*b,170*m,30*b,154*e,-16);
    c.lineTo(138*e,-16); c.bezierCurveTo(132*e,40*b,108*e,100*b,62+mx,150+dy);
    c.quadraticCurveTo(30+mx,184+dy,mx,186+dy); c.quadraticCurveTo(-30+mx,184+dy,-62+mx,150+dy);
    c.bezierCurveTo(-108*e,100*b,-132*e,40*b,-138*e,-16); c.closePath();
  };
  lifDoldur(yol,[-172*e,-20,172*e,alt],{renk:hexYaz(karistir(R.sac,[0,0,0],.22)),koyu:R.sacKoyu,isik:R.sacIsik,n:dg?900:(L>60?760:560),boy:L>60?30:16,
    yon:x=>Math.PI/2-x*.0035,dag:dg?1.1:.45,kivrim:dg?1.2:.5,seed:71,acik:.34,parlak:.8,yumusak:[mx,60+dy*.5,72*e,150*e]});
  const uc=[];
  for(let i=0;i<=12;i++){const t=i/12, x=(-1+2*t)*(S.bicim==='kisa'?120:90)*e, y=alt-Math.abs(x)*(S.bicim==='kisa'?.5:.9)*(L>60?1:.4); uc.push([x,y,Math.PI/2+x*.004]);}
  for(const s of[-1,1]) for(let i=0;i<5;i++) uc.push([s*(156-i*4)*m,(10+i*30)*b,s>0?.3:Math.PI-.3]);
  teller(uc,R.sacKoyu,75,dg?30:(L>60?20:10));
}

const DUSME={ince:0, kalin:6, pala:34};
export function biyik(mx){
  const Y=G.yuz, R=G.renk, B=G.biyik, k=poz.kaynama;
  const ince=B.bicim==='ince', d=DUSME[B.bicim]||0, cy=152-poz.agiz*5;
  const burunAlti=(Y.burunBoy===1?112:-14+126*Y.burunBoy)-(Y.boy-1)*152-(Y.burunBoy-1)*60-Y.agizY;
  const ust=ince?cy-11:Math.min(burunAlti+3,cy-12), W=(ince?50:60)*Y.dudakEn, alt=ince?cy-1:cy+3;
  const yol=()=>{
    c.moveTo(mx,ust+3); c.bezierCurveTo(mx-26,ust-3,mx-W*.8,ust+4,mx-W,alt+d-2);
    c.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1);
    c.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2);
    c.bezierCurveTo(mx+W*.8,ust+4,mx+26,ust-3,mx,ust+3); c.closePath();
  };
  lifDoldur(yol,[mx-W,ust-4,mx+W,alt+d],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:ince?90:220,boy:ince?9:15,
    yon:x=>x<mx?Math.PI*.5+.75:Math.PI*.5-.75,dag:.4,kivrim:.3,seed:81,acik:.22,parlak:.7});
  titrek(()=>{c.moveTo(mx-W,alt+d-2); c.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1); c.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2);},PAL.murekkep,.55,1.3,730+k,2,1.6);
  leke(mx,alt+4,W*.8,5,PAL.siyah,.35); // bıyığın dudağa düşen gölgesi
}
