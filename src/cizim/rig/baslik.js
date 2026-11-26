// Başlık: kasket, kep, yemeni (yazma), takke, sarık, şal.
// baslikArka: başın arkasına düşen kumaş (gövdeden önce çizilir). baslikOn: yüzün üstüne oturan kısım.
// baslikGovde: şalın omuzlara düşen kısmı (gövdenin en üstüne çizilir; baş oynasa da omuzda sabit kalır).
import {c} from '../teknik/tuval.js';
import {leke,tara,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,hex,rgba} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir} from './gorunus.js';
import {kumas,lifDoldur} from './doku.js';
import {yuzYolu} from './yuz.js';

const RENK={kasket:'#2e2b25', kep:'#4a4a35', yemeni:'#7d7458', takke:'#8c8672', sarik:'#9a947e', sal:'#585145'};
const renkAl=()=>hex(G.baslik.renk||RENK[G.baslik.tur]);

/* desen: yazmadaki küçük çiçek benekleri */
function benek(x0,y0,x1,y1,seed){
  const D=G.baslik.desenRenk?hex(G.baslik.desenRenk):karistir(renkAl(),'#3a1c20',.55), r=rng(seed);
  for(let i=0;i<150;i++){
    const x=x0+r()*(x1-x0), y=y0+r()*(y1-y0), s=2+r()*2.2;
    c.fillStyle=rgba(D,.38+r()*.25);
    for(let p=0;p<4;p++){const a=p/4*TAU+r(); c.beginPath(); c.arc(x+Math.cos(a)*s,y+Math.sin(a)*s,s*.6,0,TAU); c.fill();}
  }
}

/* ───────── yemeni / şal: yüzü çerçeveleyen örtü ───────── */
function ortuOlcu(){
  const sal=G.baslik.tur==='sal', Y=G.yuz, e=Y.en, u=Y.alin, b=Y.boy;
  return {sal, e, u, b, m:e*Y.elmacik, j:e*Y.cene, ju:e*Y.ceneUc,
    w:(sal?208:186)*e, ust:(sal?-268:-254)*u, alin:(sal?-128:-146)*u, alt:sal?380:330};
}
function ortuDis(O){ // başın ve yanlara düşen kumaşın dış silüeti
  const s=poz.sallanti*.4;
  c.moveTo(0,O.ust); c.bezierCurveTo(O.w*.62,O.ust,O.w*1.02,O.ust*.72,O.w,-90*O.u);
  c.bezierCurveTo(O.w*1.02,40,O.w*.92+s,170,O.w*.7+s,O.alt-60); c.quadraticCurveTo(O.w*.4+s,O.alt,s,O.alt+6);
  c.quadraticCurveTo(-O.w*.4+s,O.alt,-O.w*.7+s,O.alt-60); c.bezierCurveTo(-O.w*.92+s,170,-O.w*1.02,40,-O.w,-90*O.u);
  c.bezierCurveTo(-O.w*1.02,O.ust*.72,-O.w*.62,O.ust,0,O.ust); c.closePath();
}
function ortuPencere(O){ // yüzün açıkta kalan kısmı (ters yönde çizilir: evenodd ile delik olur)
  const {e,b,m,j,ju}=O, a=O.alin, yan=O.sal?136:146;
  c.moveTo(0,a); c.bezierCurveTo(-70*e,a-2,-122*e,a+14,-yan*e,a+70);
  c.bezierCurveTo(-(yan+4)*m,10,-142*m,80*b,-114*j,140*b); c.bezierCurveTo(-96*j,176*b,-62*ju,204*b,-30*ju,212*b);
  c.quadraticCurveTo(0,218*b,30*ju,212*b); c.bezierCurveTo(62*ju,204*b,96*j,176*b,114*j,140*b);
  c.bezierCurveTo(142*m,80*b,(yan+4)*m,10,yan*e,a+70); c.bezierCurveTo(122*e,a+14,70*e,a-2,0,a); c.closePath();
}
function ortuOn(){
  const O=ortuOlcu(), R=renkAl(), k=poz.kaynama;
  // yemeninin altından görünen saç: alında ince bir bant
  if(!O.sal){
    const a=O.alin;
    const bant=()=>{c.moveTo(-120*O.e,a+18); c.quadraticCurveTo(0,a-10,120*O.e,a+18); c.quadraticCurveTo(0,a+8,-120*O.e,a+18); c.closePath();};
    c.save(); c.beginPath(); yuzYolu(); c.clip();
    lifDoldur(bant,[-120*O.e,a-6,120*O.e,a+20],{renk:G.renk.sac,koyu:G.renk.sacKoyu,isik:G.renk.sacIsik,n:80,boy:30,yon:x=>x<0?Math.PI+.15:-.15,dag:.2,seed:61,parlak:.5});
    c.restore();
  }
  const yol=()=>{ortuDis(O); ortuPencere(O);};
  c.save();
  // kumaşın yüze düşen gölgesi
  c.save(); c.beginPath(); yuzYolu(); c.clip(); leke(0,O.alin+6,150*O.e,22,PAL.siyah,.55); leke(150*O.e,40,40,200,PAL.siyah,.5); leke(-150*O.e,40,30,180,PAL.siyah,.35); c.restore();
  c.beginPath(); yol(); c.save(); c.clip('evenodd');
  const g=c.createLinearGradient(-O.w,O.ust,O.w,O.alt);
  g.addColorStop(0,rgba(karistir(R,'#cfc8a8',.18),1)); g.addColorStop(.4,rgba(R,1)); g.addColorStop(1,rgba(karistir(R,[0,0,0],.8),1));
  c.fillStyle=g; c.fillRect(-O.w-20,O.ust-10,O.w*2+40,O.alt-O.ust+30);
  if(!O.sal&&G.baslik.desen!=='duz') benek(-O.w,O.ust,O.w,O.alt,63);
  leke(-O.w*.55,O.ust+70,O.w*.45,70,karistir(R,'#ddd4b4',.3),.3*poz.isik,-.4);
  leke(O.w*.8,60,O.w*.5,300,PAL.siyah,.75);
  leke(0,O.alt-20,O.w*.8,80,PAL.siyah,.45);
  tara(O.w*.15,O.ust,O.w+10,O.alt,1.05,7,PAL.murekkep,.42,640+k,1.1);
  tara(-O.w,140,O.w,O.alt,.4,9,PAL.murekkep,.22,641+k,1);
  // kıvrımlar
  c.strokeStyle=rgba(PAL.murekkep,.45); c.lineWidth=1.4;
  for(const s of[-1,1]){ c.beginPath(); c.moveTo(s*O.w*.86,-60); c.quadraticCurveTo(s*O.w*.9,120,s*O.w*.6,O.alt-40); c.stroke();
    c.beginPath(); c.moveTo(s*O.w*.7,O.ust*.6); c.quadraticCurveTo(s*O.w*.98,-120,s*O.w*.94,-10); c.stroke(); }
  c.restore();
  titrek(()=>{ortuDis(O);},PAL.murekkep,.85,1.8,642+k,2,2.2);
  titrek(()=>{ortuPencere(O);},PAL.murekkep,.8,1.6,643+k,2,1.8);
  if(!O.sal){ // oya: alın kenarında küçük dişler
    const a=O.alin, r=rng(64); c.fillStyle=rgba(karistir(R,'#e0d6b0',.35),.6);
    for(let i=0;i<15;i++){const t=-1+i/7, x=t*118*O.e, y=a+14*t*t-1; c.beginPath(); c.arc(x,y+2,2.4+r(),0,TAU); c.fill();}
  } else { // şalın çenenin altından çapraz geçen ucu
    const kat=()=>{c.moveTo(-120*O.j,150); c.bezierCurveTo(-70,250,40,262,170,300); c.lineTo(200,350); c.bezierCurveTo(80,330,-60,320,-150,250); c.closePath();};
    kumas(kat,[-160,150,210,350],{renk:karistir(R,[0,0,0],.12),seed:650,tara:.8});
  }
  // düğüm
  if(!O.sal){
    const yy=232*O.b, dugum=()=>{c.moveTo(-26,yy-6); c.quadraticCurveTo(0,yy-16,26,yy-6); c.quadraticCurveTo(36,yy+14,18,yy+26); c.quadraticCurveTo(0,yy+34,-18,yy+26); c.quadraticCurveTo(-36,yy+14,-26,yy-6); c.closePath();};
    kumas(dugum,[-36,yy-16,36,yy+34],{renk:karistir(R,[0,0,0],.2),seed:660,tara:.6});
  }
  c.restore();
}
function ortuArka(){
  const O=ortuOlcu(), R=karistir(renkAl(),[0,0,0],.45), s=poz.sallanti*.5;
  const yol=()=>{c.moveTo(-O.w*.9,-100); c.bezierCurveTo(-O.w*1.05,100,-O.w*1.2+s,300,-O.w*1.25+s,470); c.lineTo(O.w*1.25+s,470); c.bezierCurveTo(O.w*1.2+s,300,O.w*1.05,100,O.w*.9,-100); c.closePath();};
  kumas(yol,[-O.w*1.25,-100,O.w*1.25,470],{renk:R,seed:670,tara:.9,golge:1});
}

/* ───────── şapkalar ───────── */
function kasket(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-132*u;
  // siperliğin alına düşen gölgesi
  c.save(); c.beginPath(); yuzYolu(); c.clip(); leke(0,alt+30,190*e,52,PAL.siyah,.78); leke(0,-20,200*e,40,PAL.siyah,.22); c.restore();
  const tepe=()=>{c.moveTo(-178*e,alt-4); c.bezierCurveTo(-200*e,-196*u,-160*e,-262*u,-30*e,-272*u); c.bezierCurveTo(100*e,-276*u,206*e,-236*u,190*e,alt-6); c.quadraticCurveTo(0,alt+8,-178*e,alt-4); c.closePath();};
  kumas(tepe,[-200*e,-276*u,206*e,alt+8],{renk:R,seed:680,tara:1});
  // dikiş hatları ve düğme
  titrek(()=>{c.moveTo(-30*e,-270*u); c.quadraticCurveTo(-90*e,-210*u,-150*e,alt-6); c.moveTo(-30*e,-270*u); c.quadraticCurveTo(60*e,-210*u,120*e,alt);},PAL.murekkep,.4,1.1,681+k,2,1.6);
  const siper=()=>{c.moveTo(-150*e,alt); c.quadraticCurveTo(0,alt+14,150*e,alt); c.quadraticCurveTo(0,alt+36,-150*e,alt); c.closePath();};
  c.beginPath(); siper(); c.fillStyle='#0d0c0b'; c.fill();
  c.save(); c.clip(); leke(-60*e,alt+10,90*e,8,karistir(R,'#d0c8a8',.2),.35*poz.isik); c.restore();
  titrek(siper,PAL.murekkep,.85,1.6,682+k,2,1.8);
}
function kep(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-134*u, bant=-186*u;
  c.save(); c.beginPath(); yuzYolu(); c.clip(); leke(0,alt+32,190*e,56,PAL.siyah,.8); leke(0,-18,200*e,40,PAL.siyah,.25); c.restore();
  const tepe=()=>{c.moveTo(-156*e,bant+4); c.bezierCurveTo(-196*e,-214*u,-196*e,-252*u,-120*e,-260*u); c.quadraticCurveTo(0,-272*u,120*e,-260*u); c.bezierCurveTo(196*e,-252*u,196*e,-214*u,156*e,bant+4); c.quadraticCurveTo(0,bant+12,-156*e,bant+4); c.closePath();};
  kumas(tepe,[-196*e,-272*u,196*e,bant+12],{renk:R,seed:690,tara:1});
  const serit=()=>{c.moveTo(-156*e,bant+4); c.quadraticCurveTo(0,bant+12,156*e,bant+4); c.lineTo(152*e,alt-2); c.quadraticCurveTo(0,alt+8,-152*e,alt-2); c.closePath();};
  kumas(serit,[-156*e,bant,156*e,alt+8],{renk:karistir(R,[0,0,0],.45),seed:691,tara:.7});
  // çene kayışı ve arma
  titrek(()=>{c.moveTo(-140*e,alt-12); c.quadraticCurveTo(0,alt-2,140*e,alt-12);},hex('#1c1712'),.9,3,692+k,2,1.4);
  c.fillStyle='#6e5d32'; c.beginPath(); c.arc(0,bant-14,11,0,TAU); c.fill();
  c.fillStyle='#2a2412'; c.beginPath(); c.arc(2,bant-14,7,0,TAU); c.fill(); c.fillStyle='#6e5d32'; c.beginPath(); c.arc(5,bant-14,5.5,0,TAU); c.fill();
  leke(-4,bant-18,6,4,hex('#d8c48a'),.5*poz.isik);
  titrek(()=>{c.arc(0,bant-14,11,0,TAU);},PAL.murekkep,.6,1.2,693+k,2,1);
  const siper=()=>{c.moveTo(-156*e,alt-2); c.quadraticCurveTo(0,alt+10,156*e,alt-2); c.quadraticCurveTo(0,alt+40,-156*e,alt-2); c.closePath();};
  c.beginPath(); siper(); c.fillStyle='#060606'; c.fill();
  c.save(); c.clip(); leke(-50*e,alt+12,100*e,7,hex('#b8b4a0'),.45*poz.isik); c.restore();
  titrek(siper,PAL.murekkep,.9,1.6,694+k,2,1.8);
}
function takke(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=G.baslik.tur==='sarik'?-170*u:-150*u;
  const yol=()=>{c.moveTo(-132*e,alt); c.bezierCurveTo(-140*e,-236*u,-60*e,-250*u,0,-250*u); c.bezierCurveTo(60*e,-250*u,140*e,-236*u,132*e,alt); c.quadraticCurveTo(0,alt+10,-132*e,alt); c.closePath();};
  kumas(yol,[-140*e,-250*u,140*e,alt+10],{renk:R,seed:700,tara:.7,desen:()=>{const r=rng(701); c.fillStyle=rgba(karistir(R,[0,0,0],.4),.5); for(let i=0;i<220;i++) c.fillRect(-140*e+r()*280*e,-250*u+r()*(alt+250*u),1.6,1.6);}});
  titrek(()=>{c.moveTo(-128*e,alt-8); c.quadraticCurveTo(0,alt+2,128*e,alt-8);},PAL.murekkep,.4,1.1,702+k,2,1.4);
}
function sarik(){
  takke();
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama;
  const yol=()=>{c.moveTo(-176*e,-132*u); c.bezierCurveTo(-206*e,-168*u,-190*e,-214*u,-120*e,-218*u); c.quadraticCurveTo(0,-226*u,120*e,-218*u); c.bezierCurveTo(190*e,-214*u,206*e,-168*u,176*e,-132*u); c.quadraticCurveTo(0,-112*u,-176*e,-132*u); c.closePath();};
  c.save(); c.beginPath(); yuzYolu(); c.clip(); leke(0,-100*u,180*e,34,PAL.siyah,.6); c.restore();
  kumas(yol,[-206*e,-226*u,206*e,-112*u],{renk:R,seed:710,tara:.8});
  // sargı katları
  for(let i=0;i<4;i++){ titrek(()=>{c.moveTo(-170*e,(-140-i*20)*u); c.bezierCurveTo(-90*e,(-178-i*14)*u,60*e,(-128-i*20)*u,180*e,(-170-i*12)*u);},PAL.murekkep,.45,1.2,711+i+k,2,1.6); }
}

export function baslikArka(){
  const t=G.baslik.tur;
  if(t==='yemeni'||t==='sal') ortuArka();
}
export function baslikOn(){
  const t=G.baslik.tur;
  if(t==='yok') return;
  if(t==='yemeni'||t==='sal') ortuOn();
  else if(t==='kasket') kasket();
  else if(t==='kep') kep();
  else if(t==='takke') takke();
  else if(t==='sarik') sarik();
}
export function baslikGovde(X){ // X: omuz eşlemesi (govde.js)
  if(G.baslik.tur!=='sal') return;
  const R=renkAl();
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*70,748); c.bezierCurveTo(s*170,756,X(s*300),800,X(s*350),880); c.bezierCurveTo(X(s*390),960,X(s*396),1100,X(s*400),1300);
      c.lineTo(s*150,1300); c.bezierCurveTo(s*170,1100,s*150,940,s*96,850); c.quadraticCurveTo(s*70,800,s*70,748); c.closePath();};
    kumas(yol,[s<0?X(-400):40,740,s<0?-40:X(400),1300],{renk:s>0?karistir(R,[0,0,0],.15):R,seed:720+s,tara:1,golge:s>0?1:.6});
    c.strokeStyle=rgba(PAL.murekkep,.4); c.lineWidth=1.3;
    for(let i=0;i<3;i++){c.beginPath(); c.moveTo(s*(110+i*50),800+i*14); c.quadraticCurveTo(X(s*(200+i*50)),950,X(s*(180+i*60)),1200); c.stroke();}
  }
}
