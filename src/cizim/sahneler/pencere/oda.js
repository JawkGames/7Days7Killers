// Karakol odası: sol duvarda büyük pencere, arkada kapı, kamışlı ahşap tavan, önde masa.
// Elektrik yok; odanın tek ışığı pencereden, aşağıdaki kalabalıktan gelir.
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek,karalama} from '../../teknik/firca.js';
import {hex,rgba,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {OLCU,RENK} from './ayar.js';
import {Y,camNokta} from './yerlesim.js';

const H=OLCU.yukseklik;
const yol=(pts)=>{c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); c.closePath();};
export const penYolu=()=>{const P=Y.pen; yol([P.yaUst,P.uzUst,P.uzAlt,P.yaAlt]);};
export const camYolu=()=>{const C=Y.cam; yol([C.yaUst,C.uzUst,C.uzAlt,C.yaAlt]);};
function camDortgen(a0,a1,b0,b1){return [camNokta(a0,b0),camNokta(a1,b0),camNokta(a1,b1),camNokta(a0,b1)];}

/* ───────────── arka katman (ön bellek) ───────────── */
export function odaArka(){
  const G=Y.G+4, r=rng(3100), [kx,ky]=Y.kn, [ax,ay0,ay1]=Y.arka;
  c.fillStyle='#050505'; c.fillRect(-G,Y.ust,G*2,H-Y.ust);
  const sUc=4; // sol duvarın kameraya en yakın görünen ucu
  const solUstUc=Y.ekran(Y.Xd,Y.Ytavan,sUc), solAltUc=Y.ekran(Y.Xd,Y.Ytaban,sUc);
  // tavan: üst kenardan arka duvarın tepesine
  c.fillStyle='#0b0907'; c.beginPath(); yol([[-G,Y.ust-10],[G,Y.ust-10],[G,ay0],[ax,ay0],solUstUc]); c.fill();
  // kamış örtü: kaçış noktasına koşan ince çizgiler
  c.save(); c.beginPath(); yol([[-G,Y.ust-10],[G,Y.ust-10],[G,ay0],[ax,ay0],solUstUc]); c.clip();
  for(let i=0;i<70;i++){const X=Y.Xd+i*48+r()*10; titrek(()=>{const a=Y.ekran(X,Y.Ytavan,Y.sArka), b=Y.ekran(X,Y.Ytavan,3); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#2a2316'),.2+r()*.2,1,3100+i,1,1.5);}
  // kirişler: tavanı enine geçen kalın ağaç gövdeleri, kameraya yaklaştıkça kalınlaşır
  for(const s of[.36,.46,.6,.8,1.08,1.5]){
    const a=Y.ekran(Y.Xd,Y.Ytavan,s), b=Y.ekran(Y.Xd,Y.Ytavan+70,s), y0=a[1], y1=b[1];
    c.fillStyle='#070605'; c.beginPath(); c.moveTo(a[0],y0); c.lineTo(G,y0); c.lineTo(G,y1+6*s); c.lineTo(b[0],y1); c.closePath(); c.fill();
    titrek(()=>{c.moveTo(b[0],y1); c.quadraticCurveTo((b[0]+G)/2,y1+5*s,G,y1+3*s);},hex('#3a2f20'),.4,1.4,3200+s*100|0,2,2);
  }
  c.restore();
  // arka duvar
  c.fillStyle='#11120f'; c.fillRect(ax,ay0,G-ax,ay1-ay0);
  c.save(); c.beginPath(); c.rect(ax,ay0,G-ax,ay1-ay0); c.clip();
  for(let i=0;i<16;i++){const renk=[hex('#2e2a1d'),RENK.morluk,RENK.kufYesil,hex('#050606')][i%4]; leke(ax+r()*(G-ax),ay0+r()*(ay1-ay0),60+r()*160,40+r()*120,renk,.14+r()*.14,r()*3);}
  tara(ax,ay0,G,ay1,.42,10,[8,7,10],.35,3301,1.2); tara(ax,ay0,G,ay1,-1.05,15,[8,7,10],.25,3302,1);
  // taka (duvar oyuğu) ve içinde sönük bir şişe
  const [k0,k1,kUst]=Y.kapi;
  if(k0-ax>140){const tx=ax+(k0-ax)*.45, ty=ay0+(ay1-ay0)*.3; c.fillStyle='#050505'; c.beginPath(); c.moveTo(tx-34,ty+70); c.lineTo(tx-34,ty); c.quadraticCurveTo(tx,ty-34,tx+34,ty); c.lineTo(tx+34,ty+70); c.fill();
    titrek(()=>{c.moveTo(tx-34,ty+70); c.lineTo(tx-34,ty); c.quadraticCurveTo(tx,ty-34,tx+34,ty); c.lineTo(tx+34,ty+70); c.lineTo(tx-34,ty+70);},hex('#4a4432'),.3,1.4,3310,2,2);
    c.fillStyle='#14110c'; c.fillRect(tx-6,ty+40,12,30); c.fillRect(tx-2,ty+30,4,12);}
  // kapı: koridora açık, karanlık
  c.fillStyle='#020202'; c.fillRect(k0,kUst,k1-k0,ay1-kUst);
  leke((k0+k1)/2,ay1-20,(k1-k0)*.6,80,hex('#0d0e0c'),.6);
  titrek(()=>{c.moveTo(k0,ay1); c.lineTo(k0,kUst); c.lineTo(k1,kUst); c.lineTo(k1,ay1);},hex('#3e3828'),.35,3,3320,3,3);
  // aralık kalmış kanat: kapı içe açık, koyu tahta
  c.fillStyle='#0d0a07'; c.beginPath(); c.moveTo(k1,kUst); c.lineTo(k1+(k1-k0)*.32,kUst-14); c.lineTo(k1+(k1-k0)*.32,ay1+16); c.lineTo(k1,ay1); c.fill();
  titrek(()=>{c.moveTo(k1,kUst); c.lineTo(k1+(k1-k0)*.32,kUst-14); c.lineTo(k1+(k1-k0)*.32,ay1+16);},hex('#3a2e1e'),.3,1.4,3321,2,2);
  // duvara asılı bir ilan kâğıdı, yazısı okunmaz
  const ix=k1+(k1-k0)*.55; if(ix+70<G){c.fillStyle='#2a2820'; c.fillRect(ix,ay0+70,64,86); c.save(); c.beginPath(); c.rect(ix,ay0+70,64,86); c.clip(); leke(ix+40,ay0+120,40,50,[0,0,0],.5); for(let i=0;i<6;i++) karalama(ix+32,ay0+90+i*10,24,2,[10,9,8],.5,3330+i,3); c.restore(); titrek(()=>c.rect(ix,ay0+70,64,86),[8,7,6],.6,1.2,3331,2,1.5);}
  c.restore();
  // taban
  c.fillStyle='#060605'; c.beginPath(); yol([[ax,ay1],[G,ay1],[G,H+10],solAltUc]); c.fill();
  // sol duvar: kesme taş sıraları kaçış noktasına koşar
  c.fillStyle='#0e0f0c'; c.beginPath(); yol([[ax,ay0],solUstUc,solAltUc,[ax,ay1]]); c.fill();
  c.save(); c.beginPath(); yol([[ax,ay0],solUstUc,solAltUc,[ax,ay1]]); c.clip();
  for(let i=0;i<14;i++){const renk=[hex('#2e2a1d'),RENK.morluk,RENK.kufYesil,hex('#050606')][i%4], s=.35+r()*1.4, p=Y.ekran(Y.Xd,lerp(Y.Ytavan,Y.Ytaban,r()),s); leke(p[0],p[1],80*s+r()*60,60*s+r()*60,renk,.12+r()*.12,r()*3);}
  for(let Yw=Y.Ytavan+60;Yw<Y.Ytaban;Yw+=78+r()*20){
    titrek(()=>{const a=Y.ekran(Y.Xd,Yw,Y.sArka), b=Y.ekran(Y.Xd,Yw,sUc); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#2c281c'),.35,1.4,3400+Yw|0,2,2);
    for(let s=Y.sArka+r()*.1;s<sUc;s*=1.18+r()*.1){const a=Y.ekran(Y.Xd,Yw,s), b=Y.ekran(Y.Xd,Yw+78,s); titrek(()=>{c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#2c281c'),.22,1.2,3500+s*90+Yw|0,1,1.5);}
  }
  tara(-G,Y.ust,ax,H,-.5,12,[6,6,8],.32,3401,1.2);
  c.restore();
  titrek(()=>{c.moveTo(solUstUc[0],solUstUc[1]); c.lineTo(ax,ay0); c.lineTo(G,ay0);},hex('#2e2a1e'),.4,2,3410,2,3);
  titrek(()=>{c.moveTo(ax,ay0); c.lineTo(ax,ay1); c.lineTo(G,ay1);},hex('#2e2a1e'),.3,2,3411,2,3);
  // pencere boşluğu: önce pervaz yüzeyleri (taş duvarın kalınlığı)
  c.fillStyle='#1a1811'; c.beginPath(); penYolu(); c.fill();
  c.save(); c.beginPath(); penYolu(); c.clip(); tara(Y.kutu.x0,Y.kutu.y0,Y.kutu.x1,Y.kutu.y1,.9,8,[6,5,4],.5,3420,1); c.restore();
  // köşeler karanlığa gömülür
  leke(Y.G,H*.45,Y.G*.9,H*.7,[0,0,0],.55); leke(-Y.G,H,Y.G*.8,300,[0,0,0],.7);
}

/* ───────────── doğrama (ön bellek, saydam) ───────────── */
export function dograma(){
  const kal=.045, orta=.5, yatay=[.24,.62];
  const ahsap=RENK.ahsap;
  const parca=(pts,seed)=>{c.beginPath(); yol(pts); c.fillStyle=rgba(ahsap,1); c.fill(); c.save(); c.clip(); tara(Math.min(...pts.map(p=>p[0]))-4,Math.min(...pts.map(p=>p[1]))-4,Math.max(...pts.map(p=>p[0]))+4,Math.max(...pts.map(p=>p[1]))+4,1.5,4,[6,4,3],.55,seed,1); c.restore(); titrek(()=>yol(pts),[5,4,3],.85,1.4,seed+1,2,1.6);};
  c.save(); c.beginPath(); penYolu(); c.clip();
  // kasa: camın dört kenarı
  parca(camDortgen(0,1,0,kal*1.2),3600); parca(camDortgen(0,1,1-kal*1.3,1),3602);
  parca(camDortgen(0,kal,0,1),3604); parca(camDortgen(1-kal*1.6,1,0,1),3606);
  // iki kanadın birleştiği dikme ve kayıtlar
  parca(camDortgen(orta-kal*.7,orta+kal*.7,0,1),3608);
  for(const b of yatay) parca(camDortgen(kal,1-kal,b-kal*.45,b+kal*.45),3610+b*10|0);
  for(const [a0,a1] of[[kal,orta-kal*.7],[orta+kal*.7,1-kal*1.6]]) for(const b of[.24,.62]){ // kanat içi çıta
    const p=camDortgen(a0,a1,b+kal*.45,b+kal*.62); c.beginPath(); yol(p); c.fillStyle='rgba(4,3,2,.6)'; c.fill();
  }
  // ispanyolet kolu
  const [ix,iy,is]=camNokta(orta+kal*.7,.55); c.fillStyle='#0c0a07'; c.fillRect(ix,iy-18*is,7*is,36*is);
  c.restore();
  // denizlik: taş eşik, önüne biraz taşar
  const a=Y.pen.yaAlt, b=Y.pen.uzAlt, d=10;
  const den=[[a[0]-4,a[1]-2],[b[0]+6,b[1]-1],[b[0]+10,b[1]+d*.5],[a[0]+2,a[1]+d*1.5]];
  c.beginPath(); yol(den); c.fillStyle='#1c1912'; c.fill(); titrek(()=>yol(den),[6,5,4],.7,1.4,3640,2,2);
  titrek(()=>penYolu(),hex('#2c281c'),.5,2,3641,2,2.5);
}

/* ───────────── ön plan masa (ön bellek, saydam) ───────────── */
export function masa(){
  const G=Y.G+4, M=Y.masa, [kx,ky]=Y.kn, r=rng(3700);
  const onX=kx+(M.x0-kx)*(M.on-ky)/(M.arka-ky);
  const ust=[[M.x0,M.arka],[G,M.arka],[G,M.on],[onX,M.on]];
  c.beginPath(); yol(ust); c.fillStyle='#120e0a'; c.fill();
  c.save(); c.beginPath(); yol(ust); c.clip();
  for(let i=0;i<14;i++){const X=(M.x0-kx)+i*150; titrek(()=>{c.moveTo(kx+X,M.arka); c.lineTo(kx+X*(M.on-ky)/(M.arka-ky),M.on);},[4,3,2],.55,1.6,3700+i,2,2);}
  tara(M.x0-200,M.arka,G,M.on,.04,6,[3,3,2],.45,3720,1);
  c.restore();
  c.fillStyle='#070504'; c.beginPath(); yol([[onX,M.on],[G,M.on],[G,H+10],[onX,H+10]]); c.fill();
  c.save(); c.beginPath(); c.rect(onX,M.on,G-onX,H-M.on+10); c.clip(); tara(onX,M.on,G,H,1.4,9,[2,2,1],.5,3730,1.2); c.restore();
  titrek(()=>{c.moveTo(onX,M.on); c.lineTo(G,M.on);},hex('#4a3c28'),.5,2,3740,2,2);
  titrek(()=>{c.moveTo(M.x0,M.arka); c.lineTo(onX,M.on); c.lineTo(onX,H+10);},hex('#3a2e1e'),.45,1.6,3741,2,2);
  // masadakiler: bağlanmış yedi dosya, sönük gaz lambası, kâğıtlar
  const gen=G-M.x0, dx=M.x0+gen*.2, dy=M.arka+(M.on-M.arka)*.45;
  for(let i=0;i<7;i++){const y=dy-i*7, sx=(r()-.5)*8; c.fillStyle=i%2?'#2e2618':'#3a301e'; c.beginPath(); yol([[dx-60+sx,y],[dx+58+sx,y-3],[dx+62+sx,y+6],[dx-58+sx,y+8]]); c.fill(); titrek(()=>{c.moveTo(dx-60+sx,y); c.lineTo(dx+58+sx,y-3);},[4,3,2],.6,1,3750+i,1,1);}
  c.strokeStyle='rgba(90,70,40,.5)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(dx-4,dy-52); c.lineTo(dx-2,dy+8); c.stroke(); // ip
  const lx=M.x0+gen*.62, ly=M.arka+(M.on-M.arka)*.55;
  if(lx+30<G){
    c.fillStyle='#0d0b08'; c.beginPath(); c.ellipse(lx,ly,30,8,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.moveTo(lx-26,ly); c.quadraticCurveTo(lx-30,ly-40,lx-12,ly-52); c.lineTo(lx+12,ly-52); c.quadraticCurveTo(lx+30,ly-40,lx+26,ly); c.fill();
    c.fillStyle='rgba(60,62,52,.35)'; c.beginPath(); c.moveTo(lx-10,ly-52); c.quadraticCurveTo(lx-20,ly-80,lx-9,ly-112); c.lineTo(lx+9,ly-112); c.quadraticCurveTo(lx+20,ly-80,lx+10,ly-52); c.fill();
    titrek(()=>{c.moveTo(lx-10,ly-52); c.quadraticCurveTo(lx-20,ly-80,lx-9,ly-112); c.moveTo(lx+9,ly-112); c.quadraticCurveTo(lx+20,ly-80,lx+10,ly-52);},hex('#5a5a4a'),.4,1,3760,2,1.2);
  }
  leke(G,M.on+60,gen*.4,160,[0,0,0],.6);
}

/* ───────────── dinamik ışık: tavana vuran pencere deseni ve pervazlar ───────────── */
export function odaIsigi(renk,I){
  const P=Y.pencere;
  // ışık aşağıdan gelir: pencere deseni tavana, pencereden odanın içine doğru düşer
  c.save();
  c.beginPath(); const [ax,ay0]=Y.arka; yol([[-Y.G-10,Y.ust-10],[Y.G+10,Y.ust-10],[Y.G+10,ay0],[ax,ay0],Y.ekran(Y.Xd,Y.Ytavan,4)]); c.clip();
  c.globalCompositeOperation='lighter';
  const s0=P.sUzak*.92, s1=Math.min(P.sYakin*1.25,3), X0=Y.Xd, X1=Y.Xd+Math.abs(Y.Xd)*.75;
  const dort=(xa,xb,sa,sb)=>[Y.ekran(xa,Y.Ytavan,sa),Y.ekran(xb,Y.Ytavan,sa),Y.ekran(xb,Y.Ytavan,sb),Y.ekran(xa,Y.Ytavan,sb)];
  const ortaS=(s0+s1)/2, mrk=Y.ekran(X0+(X1-X0)*.35,Y.Ytavan,ortaS);
  // dört cam gözünün izi: kayıtların gölgesiyle bölünmüş
  for(const [xa,xb] of[[0,.36],[.42,1]]) for(const [sa,sb] of[[0,.47],[.53,1]]){
    const p=dort(lerp(X0,X1,xa),lerp(X0,X1,xb),lerp(s0,s1,sa),lerp(s0,s1,sb));
    c.save(); c.beginPath(); yol(p); c.clip();
    leke(mrk[0],mrk[1],Math.abs(p[1][0]-p[0][0])*1.6+200,Math.abs(p[2][1]-p[0][1])*1.4+120,renk,.17*I);
    c.restore();
  }
  c.restore();
  // pervaz yüzeyleri: dışarıdan gelen ışığı yakalar
  c.save(); c.beginPath(); penYolu(); c.clip();
  c.globalCompositeOperation='lighter';
  const u=Y.pen.uzAlt, a=Y.pen.yaAlt;
  leke(u[0],(Y.pen.uzUst[1]+u[1])/2,40,(u[1]-Y.pen.uzUst[1])*.6,renk,.22*I);
  leke((u[0]+a[0])/2,Y.pen.yaUst[1],(u[0]-a[0])*.5,50,renk,.14*I);
  c.restore();
  // odaya taşan genel parıltı
  c.save(); c.globalCompositeOperation='lighter';
  const cx=(Y.kutu.x0+Y.kutu.x1)/2, cy=(Y.kutu.y0+Y.kutu.y1)/2;
  leke(cx+120,cy,(Y.kutu.x1-Y.kutu.x0)*.9,(Y.kutu.y1-Y.kutu.y0)*.6,renk,.06*I);
  c.restore();
}

// masa kenarı ve dosyalar pencereden gelen ışığı ince bir hat olarak yakalar
export function masaIsigi(renk,I){
  const M=Y.masa;
  c.save(); c.globalCompositeOperation='lighter';
  leke(M.x0+80,M.arka+4,260,10,renk,.18*I);
  c.restore();
}
