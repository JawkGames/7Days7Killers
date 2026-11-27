// Sakal ve bıyık. Kafa çizilirken, burundan sonra (sakal) ve ağızdan sonra (bıyık) çağrılır.
// Ağız mekaniği değişmez: sakal alt dudağın altından başlar, bıyık üst dudağı örter; açılan ağız ikisinin arasında kalır.
import {c} from '../teknik/tuval.js';
import {leke,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {rgba} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir,hexYaz} from './gorunus.js';
import {lifDoldur,lifKutle,teller} from './doku.js';
import {clamp} from '../../cekirdek/matematik.js';
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
  if(G.ozel) return sakalOzel(mx,dy);
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

/* yeni yol: sakal yüze oturur. Yanakta teller seyrekleşerek erir, çene hattını izler (teller çeneye doğru döner),
   alt kenar tel uçlarıyla düzensiz biter; kütlenin gölge yanı ve çene altı koyu, ışık yanı tel tel seçilir. */
function sakalOzel(mx,dy){
  const Y=G.yuz, R=G.renk, S=G.sakal, k=poz.kaynama;
  const e=Y.en, m=e*Y.elmacik, j=e*Y.cene, ju=e*Y.ceneUc, b=Y.boy;
  if(S.bicim==='kirli') return kirliOzel(mx,dy);
  const L=SARKMA[S.bicim]*S.boy, dg=S.bicim==='dagnik', kisa=S.bicim==='kisa';
  const alt=215*b+L, dar=kisa?1:.62;
  const yol=p=>{
    p.moveTo(-150*e,-6);
    p.bezierCurveTo(-166*m,30*b,-152*m,96*b,-126*j,146*b);
    if(kisa){ p.bezierCurveTo(-106*j,190*b,-74*ju,220*b+L*.6,-34*ju,alt-4); p.quadraticCurveTo(0,alt+8,34*ju,alt-4); p.bezierCurveTo(74*ju,220*b+L*.6,106*j,190*b,126*j,146*b); }
    else { p.bezierCurveTo(-118*j,200*b,-110*dar*e,alt-L*.45,-56*dar*e,alt-L*.08); p.quadraticCurveTo(0,alt+(dg?20:12),56*dar*e,alt-L*.08); p.bezierCurveTo(110*dar*e,alt-L*.45,118*j,200*b,126*j,146*b); }
    p.bezierCurveTo(152*m,96*b,166*m,30*b,150*e,-6);
    p.lineTo(132*e,-6); p.bezierCurveTo(124*e,50*b,100*e,104*b,58+mx,148+dy);
    p.quadraticCurveTo(30+mx,188+dy,mx,190+dy); p.quadraticCurveTo(-30+mx,188+dy,-58+mx,148+dy);
    p.bezierCurveTo(-100*e,104*b,-124*e,50*b,-132*e,-6); p.closePath();
  };
  // yanakta erime: üstte seyrek, çene hattında ve altta sık; ağzın çevresi kısa
  const yogun=(x,y)=>clamp((y-10)/110,.12,1);
  // teller çene hattını izler: yanakta aşağı, çenede ortaya ve aşağı, uzun sakalda aşağı akar
  const yon=(x,y)=>Math.PI/2-x*(y>150*b?.006:.0025);
  // tabanın altına koyu bir gölge: sakal yüzün üstünde kalkık durmasın, çene altına gömülsün
  c.save(); c.beginPath(); yol(c); c.clip(); leke(30*e,alt-30,170*e,60+L*.4,PAL.siyah,.45); c.restore();
  lifKutle(yol,[-170*e,-10,170*e,alt+10],{renk:hexYaz(karistir(R.sac,[0,0,0],.3)),koyu:karistir(R.sacKoyu,[0,0,0],.3),isik:R.sacIsik,
    n:dg?1300:(L>60?1100:900),boy:L>60?34:22,yon,dag:dg?1.0:.38,kivrim:dg?1.1:.55,seed:71,acik:.36,parlak:.8,taban:.75,yogun});
  // çene hattını izleyen kopuk mürekkep: kütlenin biçimi
  c.setLineDash([26,12,40,18]);
  titrek(()=>{c.moveTo(-120*j,170*b); c.bezierCurveTo(-90*j,alt-L*.3,-40*ju,alt+4,0,alt+6); c.bezierCurveTo(40*ju,alt+4,90*j,alt-L*.3,120*j,170*b);},PAL.murekkep,.5,1.4,740+k,2,2.4);
  c.setLineDash([]);
  // dudak altında kısa teller (keçi sakalı başlangıcı) ve silüetten taşan teller
  const uc=[];
  for(let i=0;i<=16;i++){const t=i/16, x=(-1+2*t)*(kisa?110:86)*e, y=alt-Math.abs(x)*(kisa?.42:.8)*(L>60?1:.5); uc.push([x,y-4,Math.PI/2+x*.005]);}
  for(const s of[-1,1]) for(let i=0;i<6;i++) uc.push([s*(150-i*4)*m,(20+i*26)*b,s>0?.35:Math.PI-.35]);
  teller(uc,R.sacKoyu,75,dg?32:(L>60?24:14));
  teller(uc.filter((_,i)=>i%3===0).map(([x,y,a])=>[x,y,a+.3]),R.sacIsik,76,dg?22:12);
}
// tıraşsız yüz: kıl dipleri, çene hattında yoğun, yanağa doğru erir (düz gri leke değil)
function kirliOzel(mx,dy){
  const Y=G.yuz, R=G.renk, e=Y.en, b=Y.boy;
  c.save(); c.beginPath(); yuzYolu(); c.clip();
  leke(mx,196+dy,70,24,R.sacKoyu,.3); leke(mx,128+dy,48,12,R.sacKoyu,.28);
  for(const s of[-1,1]) leke(s*100*e,150*b,50*e,70,R.sacKoyu,s>0?.28:.18);
  const r=rng(91); c.lineCap='round';
  for(let i=0;i<1400;i++){
    const x=(r()*2-1)*150*e, y=40+r()*190*b, d=clamp((y-50)/120,0,1)*(Math.abs(x-mx)<50&&y>120+dy&&y<186+dy?.2:1);
    if(r()>d) continue;
    c.strokeStyle=rgba(R.sacKoyu,.2+r()*.35); c.lineWidth=.8+r()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+(r()-.5)*2.4,y+1.6+r()*2); c.stroke();
  }
  c.restore();
}

const DUSME={ince:0, kalin:6, pala:34};
export function biyik(mx,yUst){
  const Y=G.yuz, R=G.renk, B=G.biyik, k=poz.kaynama;
  const ince=B.bicim==='ince', d=DUSME[B.bicim]||0, cy=152-poz.agiz*5;
  const burunAlti=(Y.burunBoy===1?112:-14+126*Y.burunBoy)-(Y.boy-1)*152-(Y.burunBoy-1)*60-Y.agizY;
  if(G.ozel&&yUst!=null&&(ince||B.yukseklik!=null||B.kalin!=null)) return biyikAyarli(mx,yUst,cy,burunAlti,d);
  const ust=ince?cy-11:Math.min(burunAlti+3,cy-12), W=(ince?50:60)*Y.dudakEn, alt=ince?cy-1:cy+3;
  const yol=()=>{
    c.moveTo(mx,ust+3); c.bezierCurveTo(mx-26,ust-3,mx-W*.8,ust+4,mx-W,alt+d-2);
    c.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1);
    c.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2);
    c.bezierCurveTo(mx+W*.8,ust+4,mx+26,ust-3,mx,ust+3); c.closePath();
  };
  if(G.ozel){ // yeni yol: teller burun altındaki ortadan iki yana ve aşağı tarar, uçlar kenardan taşar
    const yolP=p=>{p.moveTo(mx,ust+3); p.bezierCurveTo(mx-26,ust-3,mx-W*.8,ust+4,mx-W,alt+d-2); p.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1);
      p.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2); p.bezierCurveTo(mx+W*.8,ust+4,mx+26,ust-3,mx,ust+3); p.closePath();};
    lifKutle(yolP,[mx-W,ust-4,mx+W,alt+d],{renk:R.sac,koyu:karistir(R.sacKoyu,[0,0,0],.3),isik:R.sacIsik,n:ince?140:340,boy:ince?10:17,
      yon:x=>x<mx?Math.PI*.5+.85:Math.PI*.5-.85,dag:.45,kivrim:.35,seed:81,acik:.24,parlak:.7,taban:1.1});
  } else
  lifDoldur(yol,[mx-W,ust-4,mx+W,alt+d],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:ince?90:220,boy:ince?9:15,
    yon:x=>x<mx?Math.PI*.5+.75:Math.PI*.5-.75,dag:.4,kivrim:.3,seed:81,acik:.22,parlak:.7});
  titrek(()=>{c.moveTo(mx-W,alt+d-2); c.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1); c.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2);},PAL.murekkep,.55,1.3,730+k,2,1.6);
  leke(mx,alt+4,W*.8,5,PAL.siyah,.35); // bıyığın dudağa düşen gölgesi
}

/* yeni yol: dudaktan yüksekliği ve kalınlığı ayarlanan bıyık. yUst: üst dudağın en açık ağızdaki üst kenarı.
   ince: kalem bıyık. Üst dudağın üstünde, arada ten görünür; ortada filtrum boşluğu, uçlar incelir.
   kalin/pala: biyik.yukseklik verilirse alt kenar dudağın o kadar üstünde biter; biyik.kalin dikey kalınlığı çarpar. */
function biyikAyarli(mx,yUst,cy,burunAlti,d){
  const Y=G.yuz, R=G.renk, B=G.biyik, k=poz.kaynama, kal=B.kalin==null?1:B.kalin, ince=B.bicim==='ince';
  if(ince){
    const alt=yUst-(B.yukseklik==null?5:B.yukseklik), ust=Math.max(alt-7*kal,burunAlti+2), W=44*Y.dudakEn;
    const yarim=(p,s)=>{p.moveTo(mx+s*3.5,ust+1.5); p.quadraticCurveTo(mx+s*W*.45,ust-1,mx+s*W,alt-1+d*.3);
      p.quadraticCurveTo(mx+s*W*.6,alt+.5,mx+s*3.5,alt); p.closePath();};
    const yol=p=>{yarim(p,-1); yarim(p,1);};
    c.save(); c.translate(1,3); c.fillStyle=rgba(R.tenDerin,.3); c.beginPath(); yol(c); c.fill(); c.restore(); // dudağa düşen ince gölge
    c.fillStyle=rgba(karistir(R.sacKoyu,R.sac,.3),.82); c.beginPath(); yol(c); c.fill();
    lifKutle(yol,[mx-W,ust-2,mx+W,alt+1],{renk:R.sac,koyu:karistir(R.sacKoyu,[0,0,0],.3),isik:R.sacIsik,n:150,boy:6,
      yon:x=>x<mx?Math.PI*.5+1.15:Math.PI*.5-1.15,dag:.3,kivrim:.2,seed:83,acik:.2,parlak:.5,taban:.6});
    titrek(()=>{for(const s of[-1,1]){c.moveTo(mx+s*W,alt-1+d*.3); c.quadraticCurveTo(mx+s*W*.6,alt+.5,mx+s*3.5,alt);}},PAL.murekkep,.5,1.1,732+k,2,1);
    return;
  }
  let alt=B.yukseklik==null?cy+3:yUst-B.yukseklik, ust=Math.min(burunAlti+3,cy-12);
  ust=Math.max(alt-(alt-ust)*kal,burunAlti-4);
  const W=60*Y.dudakEn;
  const yolP=p=>{p.moveTo(mx,ust+3); p.bezierCurveTo(mx-26,ust-3,mx-W*.8,ust+4,mx-W,alt+d-2); p.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1);
    p.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2); p.bezierCurveTo(mx+W*.8,ust+4,mx+26,ust-3,mx,ust+3); p.closePath();};
  lifKutle(yolP,[mx-W,ust-4,mx+W,alt+d],{renk:R.sac,koyu:karistir(R.sacKoyu,[0,0,0],.3),isik:R.sacIsik,n:Math.round(340*Math.min(1.4,kal)),boy:17,
    yon:x=>x<mx?Math.PI*.5+.85:Math.PI*.5-.85,dag:.45,kivrim:.35,seed:81,acik:.24,parlak:.7,taban:1.1});
  titrek(()=>{c.moveTo(mx-W,alt+d-2); c.bezierCurveTo(mx-W*.9,alt+d*.5,mx-W*.5,alt,mx,alt-1); c.bezierCurveTo(mx+W*.5,alt,mx+W*.9,alt+d*.5,mx+W,alt+d-2);},PAL.murekkep,.55,1.3,730+k,2,1.6);
  leke(mx,alt+4,W*.8,5,PAL.siyah,.35);
}
