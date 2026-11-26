// Pencereden görünen gece meydanı: gök, toprak damlı taş evler, kuyu, zemin (ön belleğe bir kez çizilir).
// Kalabalık ve ışıklar her karede bunun üstüne, cam şekline kırpılarak çizilir.
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {hex,rgba,TAU} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {KALABALIK,RENK} from './ayar.js';
import {zemin} from './kalabalik.js';
import {Y} from './yerlesim.js';

const K=KALABALIK;
export function disDonusum(){c.translate(Y.dis.x,Y.dis.y); c.scale(Y.dis.o,Y.dis.o);}

export function disArka(tohum){
  const [W,H]=K.resim, r=rng(4400+(tohum|0));
  c.save(); disDonusum();
  // gök: is ve dumanla bulanık, yıldız yok denecek kadar az
  const g=c.createLinearGradient(0,-500,0,K.ufuk); g.addColorStop(0,'#050607'); g.addColorStop(.7,'#0b0c0c'); g.addColorStop(1,'#16140f');
  c.fillStyle=g; c.fillRect(-300,-900,W+600,K.ufuk+900);
  for(let i=0;i<10;i++) leke(r()*W,K.ufuk-60-r()*260,120+r()*160,40+r()*50,hex('#1c1a14'),.25);
  // karşı sıradaki evler: düz toprak dam, kalın taş duvar, küçük karanlık pencereler, dam altında hatıl uçları
  let x=-80;
  while(x<W+80){
    const w=70+r()*90, h=50+r()*48, ust=K.ufuk-h;
    c.fillStyle=rgba([30+r()*10|0,27+r()*8|0,20],1); c.fillRect(x,ust,w+1,h+4);
    c.save(); c.beginPath(); c.rect(x,ust,w+1,h+4); c.clip(); tara(x,ust,x+w,K.ufuk+4,.3,5,[6,5,4],.4,600+x|0,1); leke(x+w/2,ust,w*.6,h*.5,[0,0,0],.5); c.restore();
    c.fillStyle='#0a0908'; c.fillRect(x-3,ust-6,w+6,8); // dam kenarı
    for(let k=x+6;k<x+w-4;k+=9+r()*5){c.fillStyle='rgba(4,4,3,.9)'; c.fillRect(k,ust+3,3,3);}
    if(r()<.7){const px=x+10+r()*(w-30); c.fillStyle='#050505'; c.fillRect(px,ust+18+r()*8,10,13);}
    if(r()<.45){const kx=x+10+r()*(w-30); c.fillStyle='#040404'; c.beginPath(); c.moveTo(kx,K.ufuk+3); c.lineTo(kx,ust+h*.45); c.quadraticCurveTo(kx+9,ust+h*.3,kx+18,ust+h*.45); c.lineTo(kx+18,K.ufuk+3); c.fill();}
    titrek(()=>{c.moveTo(x-3,ust-6); c.lineTo(x+w+3,ust-6);},hex('#3a3628'),.35,1,500+x|0,2,1);
    x+=w+(r()<.3?14+r()*20:0);
  }
  tara(-20,K.ufuk-110,W+20,K.ufuk+4,.5,6,[3,3,3],.5,4501,1);
  // dut ağacı: bir kenarda koyu yaprak kütlesi
  const ax=r()<.5?40+r()*60:W-40-r()*60;
  c.fillStyle='#070807'; c.fillRect(ax-4,K.ufuk-60,8,64);
  for(let i=0;i<9;i++) leke(ax+(r()-.5)*90,K.ufuk-95+(r()-.5)*50,40+r()*30,30+r()*20,hex('#060706'),.95);
  // zemin: dövülmüş toprak, araba izleri, taşlar
  const zg=c.createLinearGradient(0,K.ufuk,0,H+60); zg.addColorStop(0,'#14120d'); zg.addColorStop(1,'#1e1a13');
  c.fillStyle=zg; c.fillRect(-300,K.ufuk,W+600,H-K.ufuk+300);
  for(let i=0;i<16;i++){const z=1+r()*2.3,[px,py]=zemin(r(),z); leke(px,py,90/z,22/z,i%2?hex('#0a0907'):hex('#2a2418'),.4);}
  tara(-300,K.ufuk,W+300,H+80,.05,7,[3,3,2],.35,4502,1);
  for(let i=0;i<70;i++){const z=1+r()*2.4,[px,py]=zemin(r()*1.2-.1,z); c.fillStyle=`rgba(${r()<.5?'60,54,40':'4,4,3'},${.3+r()*.4})`; c.beginPath(); c.ellipse(px,py,(2+r()*3)/z,(1+r()*1.5)/z,0,0,TAU); c.fill();}
  for(const s of[-1,1]){ // araba izleri ufka doğru daralır
    titrek(()=>{const [a,b]=zemin(.5+s*.12,1); const [e,f]=zemin(.5+s*.05,3.3); c.moveTo(a,b); c.lineTo(e,f);},[6,5,4],.35,2.4,4510+s,2,2);
  }
  // kuyu: Sarıkuyu'nun kuyusu, meydanın arka ortasında; taş bilezik ve ahşap çıkrık
  const [kx,ky]=zemin(.52,3.0), ks=1/3.0;
  c.fillStyle='#16130e'; c.fillRect(kx-48*ks,ky-46*ks,96*ks,46*ks);
  c.fillStyle='#0b0a08'; c.beginPath(); c.ellipse(kx,ky-46*ks,48*ks,13*ks,0,0,TAU); c.fill();
  c.fillStyle='#030303'; c.beginPath(); c.ellipse(kx,ky-46*ks,36*ks,9*ks,0,0,TAU); c.fill();
  titrek(()=>{c.rect(kx-48*ks,ky-46*ks,96*ks,46*ks);},hex('#4a4232'),.4,1,4520,2,1);
  titrek(()=>{for(let i=1;i<3;i++){c.moveTo(kx-48*ks,ky-46*ks+i*15*ks); c.lineTo(kx+48*ks,ky-46*ks+i*15*ks);} c.moveTo(kx,ky-46*ks); c.lineTo(kx,ky-31*ks);},hex('#3a3426'),.35,.8,4521,1,1);
  c.strokeStyle='#080706'; c.lineWidth=5*ks; c.beginPath(); c.moveTo(kx-42*ks,ky-46*ks); c.lineTo(kx-40*ks,ky-120*ks); c.moveTo(kx+42*ks,ky-46*ks); c.lineTo(kx+40*ks,ky-120*ks); c.moveTo(kx-48*ks,ky-112*ks); c.lineTo(kx+48*ks,ky-112*ks); c.stroke();
  // meydanın yanları ev duvarlarının gölgesinde
  leke(-40,H*.6,160,H*.7,[0,0,0],.9); leke(W+40,H*.6,160,H*.7,[0,0,0],.9);
  leke(W/2,K.ufuk+40,W*.7,60,[0,0,0],.35);
  c.restore();
}

// dinamik: evlerin cephesine ve gökteki dumana vuran kalabalık ışığı
export function disIsik(ortalama,t,f,ofkePay){
  const [W]=K.resim;
  c.save(); disDonusum();
  c.globalCompositeOperation='lighter';
  leke(W/2,K.ufuk-20,W*.75,80,ortalama,.2*f);
  leke(W/2,K.ufuk-150,W*.8,150,ortalama,(.05+.06*ofkePay)*f);
  c.globalCompositeOperation='source-over';
  // öfkede gökte dumanlar yükselir
  if(ofkePay>.05){
    for(let i=0;i<7;i++){
      const ph=i*1.7, y=K.ufuk-40-((t*14+i*60)%300), x=W*(.15+.7*((i*.37)%1))+Math.sin(t*.3+ph)*30;
      leke(x,y,70+((t*6+i*40)%80),40,RENK.ofkeDuman,.22*ofkePay*Math.min(1,(K.ufuk-y)/80));
    }
  }
  c.restore();
}
