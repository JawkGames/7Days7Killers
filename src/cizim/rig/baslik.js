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
import {kumas} from './doku.js';
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
    w:(sal?196:178)*e, ust:(sal?-240:-236)*u, alin:(sal?-120:-134)*u, alt:sal?330:300};
}
function ortuDis(O){ // başın ve yanlara düşen kumaşın dış silüeti
  const s=poz.sallanti*.4, w=O.w;
  c.moveTo(0,O.ust); c.bezierCurveTo(w*.74,O.ust,w*1.02,O.ust*.66,w,-70*O.u);
  c.bezierCurveTo(w*.99,40,w*.92+s,130,w*.7+s,210); c.bezierCurveTo(w*.56+s,250,w*.56+s,O.alt-20,w*.5+s,O.alt); c.quadraticCurveTo(s,O.alt+14,-w*.5+s,O.alt);
  c.bezierCurveTo(-w*.56+s,O.alt-20,-w*.56+s,250,-w*.7+s,210); c.bezierCurveTo(-w*.92+s,130,-w*.99,40,-w,-70*O.u);
  c.bezierCurveTo(-w*1.02,O.ust*.66,-w*.74,O.ust,0,O.ust); c.closePath();
}
function ortuPencere(O){ // yüzün açıkta kalan kısmı: yüz silüetinin biraz içinde kalır, kumaş yüzün kenarını örter
  const {e,b,m,j,ju}=O, a=O.alin, k=O.sal?.93:.92;
  c.moveTo(0,a); c.bezierCurveTo(-74*e,a-2,-128*e*k,a+18,-150*e*k,a+76);
  c.bezierCurveTo(-158*m*k,10,-146*m*k,84*b,-118*j*k,140*b); c.bezierCurveTo(-100*j*k,178*b,-64*ju,206*b,-32*ju,215*b);
  c.bezierCurveTo(-13*ju,220*b,13*ju,220*b,32*ju,215*b); c.bezierCurveTo(64*ju,206*b,100*j*k,178*b,118*j*k,140*b);
  c.bezierCurveTo(146*m*k,84*b,158*m*k,10,150*e*k,a+76); c.bezierCurveTo(128*e*k,a+18,74*e,a-2,0,a); c.closePath();
}
function ortuOn(){
  const O=ortuOlcu(), R=renkAl(), k=poz.kaynama;
  // kumaşın yüze düşen gölgesi: alında ve iki yanda
  c.save(); c.beginPath(); yuzYolu(); c.clip();
  leke(0,O.alin+8,160*O.e,30,PAL.siyah,.6); leke(140*O.e,40,50,220,PAL.siyah,.55); leke(-140*O.e,40,34,200,PAL.siyah,.4);
  c.restore();
  const yol=()=>{ortuDis(O); ortuPencere(O);};
  c.beginPath(); yol(); c.save(); c.clip('evenodd');
  const g=c.createLinearGradient(-O.w,O.ust,O.w,O.alt);
  g.addColorStop(0,rgba(karistir(R,'#cfc8a8',.18),1)); g.addColorStop(.4,rgba(R,1)); g.addColorStop(1,rgba(karistir(R,[0,0,0],.8),1));
  c.fillStyle=g; c.fillRect(-O.w-20,O.ust-10,O.w*2+40,O.alt-O.ust+30);
  if(!O.sal&&G.baslik.desen!=='duz') benek(-O.w,O.ust,O.w,O.alt,63);
  if(O.sal){ // kaba yün: kısa lifler
    const r=rng(66); for(let i=0;i<700;i++){const x=-O.w+r()*O.w*2, y=O.ust+r()*(O.alt-O.ust), a=r()*TAU, L=3+r()*6; c.strokeStyle=rgba(r()<.5?karistir(R,'#d0c6a6',.3):karistir(R,[0,0,0],.5),.22+r()*.2); c.lineWidth=1+r(); c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L); c.stroke();}
  }
  leke(-O.w*.5,O.ust+80,O.w*.42,80,karistir(R,'#ddd4b4',.3),.3*poz.isik,-.4);
  leke(O.w*.8,60,O.w*.5,300,PAL.siyah,.75);
  leke(0,O.alt-10,O.w*.9,110,PAL.siyah,.55);
  leke(0,250*O.b,120,50,PAL.siyah,.5); // çenenin altındaki gölge
  tara(O.w*.15,O.ust,O.w+10,O.alt,1.05,7,PAL.murekkep,.42,640+k,1.1);
  tara(-O.w,150,O.w,O.alt,.4,9,PAL.murekkep,.22,641+k,1);
  // kıvrımlar: yanlarda düşen ve çenenin altında toplanan
  c.strokeStyle=rgba(PAL.murekkep,.45); c.lineWidth=1.4;
  for(const s of[-1,1]){ c.beginPath(); c.moveTo(s*O.w*.84,-40); c.quadraticCurveTo(s*O.w*.86,120,s*O.w*.58,O.alt-50); c.stroke();
    c.beginPath(); c.moveTo(s*O.w*.66,O.ust*.62); c.quadraticCurveTo(s*O.w*.96,-120,s*O.w*.92,0); c.stroke();
    c.beginPath(); c.moveTo(s*70,236*O.b); c.quadraticCurveTo(s*30,262*O.b,-s*10,O.alt-30); c.stroke(); }
  c.restore();
  titrek(()=>{ortuDis(O);},PAL.murekkep,.85,1.8,642+k,2,2.2);
  titrek(()=>{ortuPencere(O);},PAL.murekkep,.75,1.5,643+k,2,1.8);
  if(!O.sal){ // oya: alın kenarında küçük dişler
    const a=O.alin, r=rng(64); c.fillStyle=rgba(karistir(R,'#e0d6b0',.3),.55);
    for(let i=0;i<15;i++){const t=-1+i/7, x=t*112*O.e, y=a+16*t*t-1; c.beginPath(); c.arc(x,y+1,2.2+r()*.8,0,TAU); c.fill();}
  }
}
function ortuArka(){
  const O=ortuOlcu(), R=karistir(renkAl(),[0,0,0],.45), s=poz.sallanti*.5;
  const yol=()=>{c.moveTo(-O.w*.9,-100); c.bezierCurveTo(-O.w*1.05,100,-O.w*1.2+s,300,-O.w*1.25+s,470); c.lineTo(O.w*1.25+s,470); c.bezierCurveTo(O.w*1.2+s,300,O.w*1.05,100,O.w*.9,-100); c.closePath();};
  kumas(yol,[-O.w*1.25,-100,O.w*1.25,470],{renk:R,seed:670,tara:.9,golge:1});
}

/* ───────── şapkalar ───────── */
function siperGolgesi(alt,e){ // siperin alına ve gözlere düşen gölgesi
  c.save(); c.beginPath(); yuzYolu(); c.clip();
  const g=c.createLinearGradient(0,alt,0,alt+124); g.addColorStop(0,'rgba(4,3,5,.95)'); g.addColorStop(.5,'rgba(4,3,5,.72)'); g.addColorStop(1,'rgba(4,3,5,0)');
  c.fillStyle=g; c.fillRect(-200*e,alt-10,400*e,140);
  leke(0,-6,190*e,44,PAL.siyah,.2);
  c.restore();
}
function kasket(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-128*u;
  siperGolgesi(alt,e);
  const tepe=()=>{c.moveTo(-168*e,alt-2); c.bezierCurveTo(-190*e,-168*u,-176*e,-226*u,-60*e,-236*u); c.bezierCurveTo(70*e,-246*u,196*e,-224*u,190*e,alt-6); c.quadraticCurveTo(0,alt+14,-168*e,alt-2); c.closePath();};
  kumas(tepe,[-190*e,-246*u,196*e,alt+14],{renk:R,seed:680,tara:1,desen:()=>{ // tüvit: küçük benekler
    const r=rng(683); for(let i=0;i<500;i++){c.fillStyle=rgba(r()<.5?karistir(R,'#cfc6a4',.35):[0,0,0],.25+r()*.25); c.fillRect(-190*e+r()*386*e,-246*u+r()*130,1.5,1.5);}}});
  // dikiş hatları
  titrek(()=>{c.moveTo(-60*e,-236*u); c.quadraticCurveTo(-110*e,-190*u,-140*e,alt-4); c.moveTo(-60*e,-236*u); c.quadraticCurveTo(40*e,-190*u,100*e,alt+4);},PAL.murekkep,.4,1.1,681+k,2,1.6);
  const siper=()=>{c.moveTo(-150*e,alt+2); c.quadraticCurveTo(0,alt+16,150*e,alt+2); c.quadraticCurveTo(0,alt+62,-150*e,alt+2); c.closePath();};
  c.beginPath(); siper(); c.fillStyle='#0b0a09'; c.fill();
  c.save(); c.clip(); leke(-60*e,alt+14,90*e,8,karistir(R,'#d0c8a8',.25),.4*poz.isik); c.restore();
  titrek(siper,PAL.murekkep,.85,1.6,682+k,2,1.8);
}
function kep(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-134*u, bant=-186*u;
  siperGolgesi(alt,e);
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
  const siper=()=>{c.moveTo(-156*e,alt-2); c.quadraticCurveTo(0,alt+10,156*e,alt-2); c.quadraticCurveTo(0,alt+66,-156*e,alt-2); c.closePath();};
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
