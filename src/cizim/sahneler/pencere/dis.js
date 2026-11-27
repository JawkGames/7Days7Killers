// Pencereden görünen gece köy meydanı: gök, karşı sıradaki toprak damlı taş evler, minare, dut ağacı, kuyu, zemin
// (ön belleğe bir kez çizilir). Kalabalık ve ışıklar her karede bunun üstüne, cam şekline kırpılarak çizilir.
// Evlerin cephesi ve kuyu, kalabalığın meşale ve fener ışığıyla her karede hafifçe aydınlanır (disIsik).
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {hex,rgba,TAU,clamp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {KALABALIK,RENK} from './ayar.js';
import {zemin,titre,Z_EV,Z_KUYU} from './kalabalik.js';
import {Y} from './yerlesim.js';

const K=KALABALIK;
export function disDonusum(){c.translate(Y.dis.x,Y.dis.y); c.scale(Y.dis.o,Y.dis.o);}

let evler=[], kuyu=null; // disArka kurar, disIsik okur (aynı tohum, aynı meydan)
const MUR=[5,5,4];

export function disArka(tohum){
  const [W,H]=K.resim, r=rng(4400+(tohum|0)), yEv=zemin(.5,Z_EV)[1], sk=1/Z_EV;
  c.save(); disDonusum();
  // gök: is ve dumanla bulanık
  const g=c.createLinearGradient(0,-700,0,yEv); g.addColorStop(0,'#040506'); g.addColorStop(.75,'#0b0c0c'); g.addColorStop(1,'#17150f');
  c.fillStyle=g; c.fillRect(-700,-1200,W+1400,yEv+1200);
  for(let i=0;i<12;i++) leke(-200+r()*(W+400),yEv-120-r()*320,140+r()*180,40+r()*50,hex('#1c1a14'),.25);
  // uzakta minare: köyün camisi, evlerin arkasından yükselir
  const mx=W*(r()<.5?.2+r()*.15:.65+r()*.15), mh=330*sk*3.2, mw=13;
  c.fillStyle='#0a0a09'; c.fillRect(mx-mw/2,yEv-mh,mw,mh);
  c.beginPath(); c.moveTo(mx-mw/2-3,yEv-mh); c.lineTo(mx,yEv-mh-46); c.lineTo(mx+mw/2+3,yEv-mh); c.fill(); // külah
  c.fillRect(mx-mw/2-5,yEv-mh*.72,mw+10,5); // şerefe
  titrek(()=>{c.moveTo(mx-mw/2,yEv); c.lineTo(mx-mw/2,yEv-mh); c.lineTo(mx,yEv-mh-46); c.lineTo(mx+mw/2,yEv-mh); c.lineTo(mx+mw/2,yEv);},hex('#3a3628'),.35,1,4410,2,1);
  // karşı sıradaki evler: düz toprak dam, kalın taş duvar, küçük pencereler, dam altında hatıl uçları
  evler=[];
  let x=-420;
  while(x<W+420){
    const w=80+r()*110, h=(66+r()*60)*(r()<.25?1.45:1), ust=yEv-h, yuz=rgba([34+r()*10|0,30+r()*8|0,22],1);
    const ev={x,w,ust,h,pencereler:[]};
    c.fillStyle=yuz; c.fillRect(x,ust,w+1,h+4);
    c.save(); c.beginPath(); c.rect(x,ust,w+1,h+4); c.clip();
    for(let i=0;i<3;i++) leke(x+r()*w,ust+r()*h,20+r()*40,14+r()*20,i%2?hex('#3c3626'):hex('#0c0b08'),.4);
    for(let yy=ust+10;yy<yEv;yy+=9+r()*3) titrek(()=>{c.moveTo(x,yy); c.lineTo(x+w,yy+(r()-.5)*2);},MUR,.25,.8,600+yy+x|0,1,.8); // taş sıraları
    tara(x,ust,x+w,yEv+4,.3,4,MUR,.45,600+x|0,1); leke(x+w/2,ust,w*.6,h*.4,[0,0,0],.45);
    c.restore();
    c.fillStyle='#0a0908'; c.fillRect(x-4,ust-7,w+8,9); // dam kenarı
    for(let k=x+6;k<x+w-4;k+=9+r()*5){c.fillStyle='rgba(4,4,3,.9)'; c.fillRect(k,ust+2,3,4);}
    const pn=1+Math.floor(r()*2);
    for(let i=0;i<pn;i++){const px=x+12+r()*(w-34), py=ust+14+r()*Math.max(4,h*.3), yan=r()<.22; c.fillStyle=yan?'#3a2a14':'#050505'; c.fillRect(px,py,12,15); c.strokeStyle='#0a0908'; c.lineWidth=2; c.strokeRect(px,py,12,15); ev.pencereler.push([px+6,py+7.5,yan]);}
    if(r()<.55){const kx=x+10+r()*(w-34); c.fillStyle='#040404'; c.beginPath(); c.moveTo(kx,yEv+3); c.lineTo(kx,yEv-30); c.quadraticCurveTo(kx+10,yEv-40,kx+20,yEv-30); c.lineTo(kx+20,yEv+3); c.fill(); titrek(()=>{c.moveTo(kx,yEv+3); c.lineTo(kx,yEv-30); c.quadraticCurveTo(kx+10,yEv-40,kx+20,yEv-30); c.lineTo(kx+20,yEv+3);},hex('#2a2619'),.45,1,620+x|0,1,1);}
    if(r()<.3){const bx=x+w*(.2+r()*.6); c.fillStyle='#0b0a08'; c.fillRect(bx,ust-24,9,18);} // baca
    titrek(()=>{c.moveTo(x-4,ust-7); c.lineTo(x+w+4,ust-7); c.moveTo(x,ust); c.lineTo(x,yEv);},hex('#3e392a'),.4,1,500+x|0,2,1);
    evler.push(ev);
    x+=w+(r()<.35?16+r()*30:0);
  }
  // evlerin önü: duvar dibi karanlık
  tara(-420,yEv-30,W+420,yEv+6,.5,5,MUR,.4,4501,1);
  // dut ağacı: bir kenarda koyu yaprak kütlesi
  const ax=r()<.5?60+r()*80:W-60-r()*80, [, ayy]=zemin(.5,Z_EV*.94);
  c.fillStyle='#070807'; c.fillRect(ax-5,ayy-80,10,84);
  for(let i=0;i<11;i++) leke(ax+(r()-.5)*110,ayy-120+(r()-.5)*60,44+r()*34,32+r()*22,hex('#060706'),.95);
  // zemin: dövülmüş toprak, araba izleri, taşlar
  const zg=c.createLinearGradient(0,yEv,0,H+400); zg.addColorStop(0,'#16130e'); zg.addColorStop(1,'#1e1a13');
  c.fillStyle=zg; c.fillRect(-700,yEv,W+1400,H+600);
  for(let i=0;i<20;i++){const z=.8+r()*3,[px,py]=zemin(r()*1.4-.2,z); leke(px,py,90/z,22/z,i%2?hex('#0a0907'):hex('#2a2418'),.4);}
  tara(-700,yEv,W+700,H+400,.05,7,MUR,.35,4502,1);
  for(let i=0;i<90;i++){const z=.7+r()*3.1,[px,py]=zemin(r()*1.4-.2,z); c.fillStyle=`rgba(${r()<.5?'60,54,40':'4,4,3'},${.3+r()*.4})`; c.beginPath(); c.ellipse(px,py,(2+r()*3)/z,(1+r()*1.5)/z,0,0,TAU); c.fill();}
  for(const s of[-1,1]){ // araba izleri evlere doğru daralır
    titrek(()=>{const [a,b]=zemin(.5+s*.12,.8); const [e,f]=zemin(.5+s*.05,Z_EV); c.moveTo(a,b); c.lineTo(e,f);},[6,5,4],.35,2.4,4510+s,2,2);
  }
  // kuyu: meydanın arka yarısında; taş bilezik, iki direk ve çıkrık
  const ku=.5+(r()-.5)*.36, [kx,ky]=zemin(ku,Z_KUYU), ks=1/Z_KUYU*1.15;
  kuyu={x:kx,y:ky,s:ks};
  c.fillStyle='#1c1812'; c.fillRect(kx-48*ks,ky-46*ks,96*ks,46*ks);
  c.save(); c.beginPath(); c.rect(kx-48*ks,ky-46*ks,96*ks,46*ks); c.clip(); tara(kx-50*ks,ky-50*ks,kx+50*ks,ky,.8,3,MUR,.5,4519,.8); c.restore();
  c.fillStyle='#0b0a08'; c.beginPath(); c.ellipse(kx,ky-46*ks,48*ks,13*ks,0,0,TAU); c.fill();
  c.fillStyle='#030303'; c.beginPath(); c.ellipse(kx,ky-46*ks,36*ks,9*ks,0,0,TAU); c.fill();
  titrek(()=>{c.rect(kx-48*ks,ky-46*ks,96*ks,46*ks);},hex('#4a4232'),.45,1,4520,2,1);
  titrek(()=>{for(let i=1;i<3;i++){c.moveTo(kx-48*ks,ky-46*ks+i*15*ks); c.lineTo(kx+48*ks,ky-46*ks+i*15*ks);} c.moveTo(kx,ky-46*ks); c.lineTo(kx,ky-31*ks);},hex('#3a3426'),.4,.8,4521,1,1);
  c.strokeStyle='#080706'; c.lineWidth=6*ks; c.beginPath(); c.moveTo(kx-42*ks,ky-46*ks); c.lineTo(kx-40*ks,ky-128*ks); c.moveTo(kx+42*ks,ky-46*ks); c.lineTo(kx+40*ks,ky-128*ks); c.moveTo(kx-50*ks,ky-118*ks); c.lineTo(kx+50*ks,ky-118*ks); c.stroke();
  c.fillStyle='#080706'; c.beginPath(); c.ellipse(kx,ky-118*ks,10*ks,8*ks,0,0,TAU); c.fill(); // çıkrık
  c.strokeStyle='#14110c'; c.lineWidth=1.5*ks; c.beginPath(); c.moveTo(kx+4*ks,ky-114*ks); c.lineTo(kx+4*ks,ky-62*ks); c.stroke(); // ip
  // meydanın yanları ev duvarlarının gölgesinde
  leke(-300,H*.6,320,H*.8,[0,0,0],.85); leke(W+300,H*.6,320,H*.8,[0,0,0],.85);
  c.restore();
}

// dinamik: evlerin cephesine, kuyuya ve gökteki dumana vuran kalabalık ışığı
export function disIsik(ortalama,t,f,ofkePay,KL){
  const [W]=K.resim, yEv=zemin(.5,Z_EV)[1];
  c.save(); disDonusum();
  c.globalCompositeOperation='lighter';
  leke(W/2,yEv-30,W*.9,90,ortalama,.16*f);
  leke(W/2,yEv-220,W*.9,170,ortalama,(.04+.05*ofkePay)*f);
  // cepheler: her ışık önündeki evleri, yakınlığına göre yalar. Yalnızca ev yüzeyine (pencere dışı) düşer.
  c.save(); c.beginPath(); for(const e of evler) c.rect(e.x,e.ust,e.w,e.h+4); c.clip();
  for(const s of KL.isiklar){
    const [x]=zemin(s.u,s.z), uz=Z_EV-s.z, g=clamp(1.4/(uz+.4),0,1.4), fl=titre(t,s.faz,s.grup==='c');
    leke(x,yEv-34,70+50*uz,60+10*uz,s.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik,.16*g*fl*f);
  }
  c.restore();
  // birkaç evde içeride yanan lamba: titrek, sıcak
  for(const e of evler) for(const [px,py,yan] of e.pencereler) if(yan) leke(px,py,10,10,RENK.coskuAlev,.18+.05*Math.sin(t*1.7+px));
  // kuyu: yakındaki ışıklardan bileziği ve direkleri aydınlanır
  if(kuyu){
    let g=0, yon=0; for(const s of KL.isiklar){const [x]=zemin(s.u,s.z), d=Math.abs(x-kuyu.x)/(180/s.z), m=Math.max(0,1-d)*Math.max(0,1-Math.abs(Z_KUYU-s.z)/1.6); g+=m; yon+=m*Math.sign(x-kuyu.x);}
    g=clamp(g,0,1.2);
    if(g>.02){c.save(); c.beginPath(); c.rect(kuyu.x-50*kuyu.s,kuyu.y-130*kuyu.s,100*kuyu.s,130*kuyu.s); c.clip(); leke(kuyu.x+Math.sign(yon||1)*30*kuyu.s,kuyu.y-40*kuyu.s,60*kuyu.s,40*kuyu.s,ortalama,.4*g*f); c.restore();}
  }
  c.globalCompositeOperation='source-over';
  // öfkede gökte dumanlar yükselir
  if(ofkePay>.05){
    for(let i=0;i<8;i++){
      const ph=i*1.7, p=((t*14+i*60)%340)/340, y=yEv-60-p*340, x=W*(.1+.8*((i*.37)%1))+Math.sin(t*.3+ph)*30;
      leke(x,y,70+p*80,40+p*20,RENK.ofkeDuman,.24*ofkePay*Math.sin(p*Math.PI)); // doğar, yükselir, söner: başa sararken sıçramaz
    }
  }
  c.restore();
}
