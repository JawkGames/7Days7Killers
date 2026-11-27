// Karakol odası: sol duvarda büyük pencere, sağda arka duvarda kapı, tahta tavan ve kirişler, önde masa.
// Elektrik yok; odanın tek ışığı pencereden, aşağıdaki kalabalıktan gelir.
// Teknik sorgu odasıyla aynı: altta çamurlu boya lekeleri (kirli sıva), üstte titrek mürekkep hatları ve tarama.
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek,karalama} from '../../teknik/firca.js';
import {hex,rgba,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {OLCU,RENK} from './ayar.js';
import {Y,camNokta} from './yerlesim.js';

const H=OLCU.yukseklik, MUR=RENK.murekkep;
const yol=(pts)=>{c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); c.closePath();};
const acik=(pts)=>{c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]);};
export const penYolu=()=>{const P=Y.pen; yol([P.yaUst,P.uzUst,P.uzAlt,P.yaAlt]);};
export const camYolu=()=>{const C=Y.cam; yol([C.yaUst,C.uzUst,C.uzAlt,C.yaAlt]);};
function camDortgen(a0,a1,b0,b1){return [camNokta(a0,b0),camNokta(a1,b0),camNokta(a1,b1),camNokta(a0,b1)];}
const E=(X,Yw,s)=>Y.ekran(X,Yw,s);
const kutuOf=pts=>[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];
function kirp(pts){c.beginPath(); yol(pts); c.clip();}
// yüzeyin sınırına göre kırpılmış tarama (ekranın görünen kısmıyla sınırlı)
function yuzTara(pts,aci,aralik,renk,alfa,seed,kalin){
  const [x0,y0,x1,y1]=kutuOf(pts), G=Y.G+20;
  c.save(); kirp(pts); tara(Math.max(x0,-G),Math.max(y0,Y.ust-20),Math.min(x1,G),Math.min(y1,H+20),aci,aralik,renk,alfa,seed,kalin); c.restore();
}

/* yüzeyler (dünya koordinatından) */
const solDuvar=()=>[E(Y.Xd,Y.Ytavan,Y.sArka),E(Y.Xd,Y.Ytavan,Y.sUc),E(Y.Xd,Y.Ytaban,Y.sUc),E(Y.Xd,Y.Ytaban,Y.sArka)];
const tavan=()=>[E(Y.Xd,Y.Ytavan,Y.sArka),E(Y.Xsag,Y.Ytavan,Y.sArka),E(Y.Xsag,Y.Ytavan,Y.sUc),E(Y.Xd,Y.Ytavan,Y.sUc)];
const taban=()=>[E(Y.Xd,Y.Ytaban,Y.sArka),E(Y.Xsag,Y.Ytaban,Y.sArka),E(Y.Xsag,Y.Ytaban,Y.sUc),E(Y.Xd,Y.Ytaban,Y.sUc)];
const arkaDuvar=()=>[E(Y.Xd,Y.Ytavan,Y.sArka),E(Y.Xsag,Y.Ytavan,Y.sArka),E(Y.Xsag,Y.Ytaban,Y.sArka),E(Y.Xd,Y.Ytaban,Y.sArka)];
// pencere boşluğunun iç yüzleri: uzak söve (bize bakar), üst lento altı, alt eşik
const soveYuzu=()=>[Y.pen.uzUst,Y.cam.uzUst,Y.cam.uzAlt,Y.pen.uzAlt];
const lentoYuzu=()=>[Y.pen.yaUst,Y.pen.uzUst,Y.cam.uzUst,Y.cam.yaUst];
const esikYuzu=()=>[Y.pen.yaAlt,Y.pen.uzAlt,Y.cam.uzAlt,Y.cam.yaAlt];

/* ───────────── arka katman (ön bellek) ───────────── */
export function odaArka(){
  const G=Y.G+4, r=rng(3100);
  c.fillStyle='#040404'; c.fillRect(-G-10,Y.ust-10,G*2+20,H-Y.ust+20);
  // tavan: tahta döşeme, kaçış noktasına koşan tahta araları
  const T=tavan();
  c.beginPath(); yol(T); c.fillStyle='#0d0b08'; c.fill();
  c.save(); kirp(T);
  for(let i=0;i<9;i++){const s=lerp(Y.sArka,2,r()), X=lerp(Y.Xd,Y.Xd*.2,r()), p=E(X,Y.Ytavan,s); leke(p[0],p[1],260*s,70*s,i%3?hex('#1a150e'):hex('#020202'),.35);}
  for(let X=Y.Xd+90;X<Y.Xd*.1;X+=Math.abs(Y.Xd)*.045*(.7+r()*.6)){
    titrek(()=>{const a=E(X,Y.Ytavan,Y.sArka), b=E(X,Y.Ytavan,3); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#2c2418'),.32+r()*.2,1.1,3100+X|0,2,1.6);
  }
  yuzTara(T,-.2,9,MUR,.45,3105,1);
  c.restore();
  // arka duvar: dar şerit, kapı ve bir ilan
  const A=arkaDuvar();
  c.beginPath(); yol(A); c.fillStyle='#11120e'; c.fill();
  c.save(); kirp(A);
  const [ax,ay0,ay1]=Y.arka;
  for(let i=0;i<10;i++){const renk=[hex('#2e2a1d'),RENK.morluk,RENK.kufYesil,hex('#050606')][i%4]; leke(ax+r()*400,ay0+r()*(ay1-ay0),40+r()*120,40+r()*100,renk,.16+r()*.14,r()*3);}
  yuzTara(A,.42,9,MUR,.4,3301,1.1); yuzTara(A,-1.05,14,MUR,.28,3302,1);
  const [k0,k1,kU]=Y.kapi, sA=Y.sArka;
  const ku=E(k0,kU,sA), kd=E(k1,Y.Ytaban,sA), kw=kd[0]-ku[0];
  c.fillStyle='#010101'; c.fillRect(ku[0],ku[1],kw,kd[1]-ku[1]);
  leke((ku[0]+kd[0])/2,kd[1]-20,kw*.6,60,hex('#0d0e0c'),.5);
  titrek(()=>{c.moveTo(ku[0],kd[1]); c.lineTo(ku[0],ku[1]); c.lineTo(kd[0],ku[1]); c.lineTo(kd[0],kd[1]);},hex('#3e3828'),.45,2.4,3320,3,2.5);
  // içe açık kanat
  c.fillStyle='#0c0907'; c.beginPath(); c.moveTo(kd[0],ku[1]); c.lineTo(kd[0]+kw*.3,ku[1]-10); c.lineTo(kd[0]+kw*.3,kd[1]+12); c.lineTo(kd[0],kd[1]); c.fill();
  titrek(()=>{c.moveTo(kd[0],ku[1]); c.lineTo(kd[0]+kw*.3,ku[1]-10); c.lineTo(kd[0]+kw*.3,kd[1]+12);},hex('#3a2e1e'),.35,1.4,3321,2,2);
  const ix=ax+(ku[0]-ax)*.25;
  if(ku[0]-ax>90){c.fillStyle='#2a2820'; c.fillRect(ix,ay0+(ay1-ay0)*.22,46,62); c.save(); c.beginPath(); c.rect(ix,ay0+(ay1-ay0)*.22,46,62); c.clip(); leke(ix+28,ay0+(ay1-ay0)*.3,30,40,[0,0,0],.5); for(let i=0;i<5;i++) karalama(ix+23,ay0+(ay1-ay0)*.22+12+i*9,16,2,[10,9,8],.5,3330+i,3); c.restore(); titrek(()=>c.rect(ix,ay0+(ay1-ay0)*.22,46,62),[8,7,6],.6,1.2,3331,2,1.5);}
  c.restore();
  // taban: dövme toprak üstüne tahta, aralar kaçış noktasına koşar
  const B=taban();
  c.beginPath(); yol(B); c.fillStyle='#0a0907'; c.fill();
  c.save(); kirp(B);
  for(let X=Y.Xd+60;X<0;X+=Math.abs(Y.Xd)*.07*(.8+r()*.4)) titrek(()=>{const a=E(X,Y.Ytaban,Y.sArka), b=E(X,Y.Ytaban,3); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#211b12'),.4,1.2,3350+X|0,2,1.6);
  yuzTara(B,.08,7,MUR,.5,3351,1);
  c.restore();
  // sol duvar: kirli sıva. Lekeler, dökülmüş sıvanın altından taş, nem izleri, çatlaklar, tarama
  const S=solDuvar();
  c.beginPath(); yol(S); c.fillStyle=rgba(RENK.siva,1); c.fill();
  c.save(); kirp(S);
  const duvar=(s,Yw)=>E(Y.Xd,Yw,s);
  for(let i=0;i<26;i++){
    const renk=[hex('#2e2a1d'),RENK.morluk,RENK.kufYesil,hex('#050606'),hex('#3a3322')][i%5], s=lerp(Y.sArka,1.6,r()), p=duvar(s,lerp(Y.Ytavan,Y.Ytaban,r()));
    leke(p[0],p[1],(120+r()*160)*s,(80+r()*140)*s,renk,.14+r()*.16,r()*3);
  }
  // nemden kararmış dip
  for(let s=Y.sArka;s<2;s*=1.25){const p=duvar(s,Y.Ytaban-60); leke(p[0],p[1],240*s,150*s,hex('#050504'),.5);}
  // sıvası dökülmüş yamalar: altındaki taş sıraları görünür
  for(let i=0;i<3;i++){
    const s=lerp(Y.pencere.sYakin*1.1,Y.sArka*1.4,i/2.2+r()*.1), Yw=lerp(Y.Ytavan*.6,Y.Ytaban*.8,r()), w=(90+r()*80), h=(60+r()*50);
    const pts=[duvar(s*1.06,Yw-h),duvar(s*.94,Yw-h*.8),duvar(s*.92,Yw+h),duvar(s*1.05,Yw+h*.9)];
    c.beginPath(); yol(pts); c.fillStyle='rgba(8,8,6,.55)'; c.fill();
    c.save(); kirp(pts); for(let k=0;k<5;k++){const yy=Yw-h+k*h*.45; titrek(()=>{const a=duvar(s*1.1,yy), b=duvar(s*.9,yy); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#2c281c'),.5,1.3,3460+i*10+k,2,1.5);} c.restore();
    titrek(()=>yol(pts),hex('#2e2a1e'),.45,1.2,3470+i,2,1.5); void w;
  }
  // çatlaklar
  for(let i=0;i<5;i++){
    let s=lerp(Y.sArka*1.2,1.4,r()), Yw=lerp(Y.Ytavan,Y.Ytaban*.5,r());
    const pts=[duvar(s,Yw)]; for(let k=0;k<6;k++){s*=1+(r()-.5)*.06; Yw+=40+r()*60; pts.push(duvar(s,Yw));}
    titrek(()=>acik(pts),MUR,.55,1.1,3480+i,2,1);
  }
  yuzTara(S,-.55,8,MUR,.42,3401,1.1); yuzTara(S,.9,13,MUR,.22,3402,1);
  // duvarın tavanla ve tabanla birleştiği köşe
  titrek(()=>{const a=duvar(Y.sArka,Y.Ytavan), b=duvar(4,Y.Ytavan); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},MUR,.7,2.2,3410,2,2.5);
  c.restore();
  titrek(()=>{const a=E(Y.Xd,Y.Ytavan,Y.sArka), b=E(Y.Xd,Y.Ytaban,Y.sArka); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},hex('#2e2a1e'),.45,2,3411,2,2.5);
  titrek(()=>{const a=E(Y.Xd,Y.Ytaban,Y.sArka), b=E(Y.Xd,Y.Ytaban,3); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},MUR,.7,2,3412,2,2.5);
  // pencere boşluğu: taş duvarın kalınlığı (söve, lento altı, eşik)
  for(const [yz,renk,seed] of[[soveYuzu(),'#1e1b13',3420],[lentoYuzu(),'#100e0a',3421],[esikYuzu(),'#191610',3422]]){
    c.beginPath(); yol(yz); c.fillStyle=renk; c.fill(); yuzTara(yz,.9,7,MUR,.5,seed,1);
    titrek(()=>yol(yz),MUR,.6,1.4,seed+5,2,1.6);
  }
  // eşikten aşağı akmış nem izleri
  for(let i=0;i<7;i++){const a=.1+r()*.8, [x,y]=lerp2(Y.pen.yaAlt,Y.pen.uzAlt,a), s=lerp(Y.pencere.sYakin,Y.pencere.sUzak,a), u=(80+r()*220)*s;
    titrek(()=>{c.moveTo(x,y+6); c.quadraticCurveTo(x+(r()-.5)*8,y+u*.5,x+(r()-.5)*6,y+u);},hex('#0a0a07'),.5,(3+r()*5)*s,3490+i,2,1);}
  // köşeler karanlığa gömülür (vinyet ayrıca pencere merkezli uygulanır)
  leke(Y.G,Y.ust+80,Y.G*.7,300,[0,0,0],.5);
}
function lerp2(a,b,t){return [lerp(a[0],b[0],t),lerp(a[1],b[1],t)];}

/* ───────────── kirişler (ön bellek, saydam): tavandaki ışık deseninin üstüne gelir, ona karışmaz ───────────── */
export function kirisler(){
  const G=Y.G+4;
  c.save(); kirp(tavan());
  for(const s of[.4,.52,.68,.9,1.2,1.65]){
    const a=E(Y.Xd,Y.Ytavan,s), b=E(Y.Xd,Y.Ytavan+64,s), sag=Math.max(G+10,E(Y.Xsag,0,s)[0]);
    const pts=[[a[0],a[1]],[sag,a[1]],[sag,b[1]+5*s],[b[0],b[1]]];
    c.beginPath(); yol(pts); c.fillStyle='#070605'; c.fill();
    c.save(); kirp(pts); tara(Math.max(a[0],-G),a[1]-2,G,b[1]+8*s,.04,4,[20,16,11],.55,3200+s*100|0,1); c.restore();
    titrek(()=>{c.moveTo(b[0],b[1]); c.quadraticCurveTo((b[0]+G)/2,b[1]+4*s,G,b[1]+3*s);},hex('#3a2f20'),.5,1.4,3210+s*100|0,2,2);
    titrek(()=>{c.moveTo(a[0],a[1]); c.lineTo(G,a[1]);},MUR,.7,1.2,3220+s*100|0,1,1.5);
  }
  c.restore();
}

/* ───────────── doğrama (ön bellek, saydam) ───────────── */
export function dograma(){
  const kal=.03, orta=.5, yatay=[.3,.66];
  const parca=(pts,seed,isikli)=>{
    c.beginPath(); yol(pts); c.fillStyle=rgba(RENK.ahsap,1); c.fill();
    c.save(); c.clip(); const [x0,y0,x1,y1]=kutuOf(pts); tara(x0-4,y0-4,x1+4,y1+4,1.5,4,[6,4,3],.6,seed,1);
    if(isikli) leke((x0+x1)/2,(y0+y1)/2,(x1-x0)*.7+6,(y1-y0)*.7+6,RENK.ahsapIsik,.18);
    c.restore(); titrek(()=>yol(pts),MUR,.9,1.5,seed+1,2,1.6);
  };
  c.save(); c.beginPath(); penYolu(); c.clip();
  // kasa: camın dört kenarı
  parca(camDortgen(0,1,0,kal*1.3),3600); parca(camDortgen(0,1,1-kal*1.4,1),3602,true);
  parca(camDortgen(0,kal,0,1),3604); parca(camDortgen(1-kal*1.6,1,0,1),3606,true);
  // iki kanadın birleştiği dikme ve kayıtlar
  parca(camDortgen(orta-kal*.7,orta+kal*.7,0,1),3608,true);
  for(const b of yatay) parca(camDortgen(kal,1-kal,b-kal*.5,b+kal*.5),3610+b*10|0,true);
  for(const [a0,a1] of[[kal,orta-kal*.7],[orta+kal*.7,1-kal*1.6]]) for(const b of yatay){ // kanat içi çıta gölgesi
    const p=camDortgen(a0,a1,b+kal*.5,b+kal*.7); c.beginPath(); yol(p); c.fillStyle='rgba(4,3,2,.6)'; c.fill();
  }
  // ispanyolet kolu
  const [ix,iy,is]=camNokta(orta+kal*.7,.5); c.fillStyle='#0c0a07'; c.fillRect(ix,iy-22*is,8*is,44*is);
  titrek(()=>c.rect(ix,iy-22*is,8*is,44*is),MUR,.8,1,3630,1,1);
  c.restore();
  // denizlik: taş eşik, odaya biraz taşar
  const a=Y.pen.yaAlt, b=Y.pen.uzAlt, d=14;
  const den=[[a[0]-6,a[1]-2],[b[0]+6,b[1]-1],[b[0]+10,b[1]+d*.55],[a[0]+2,a[1]+d*1.6]];
  c.beginPath(); yol(den); c.fillStyle='#1c1912'; c.fill(); titrek(()=>yol(den),MUR,.8,1.6,3640,2,2);
  titrek(()=>penYolu(),MUR,.7,2.2,3641,2,2.5);
  titrek(()=>penYolu(),hex('#3a3426'),.35,1.2,3642,1,3);
}

/* ───────────── ön plan masa (ön bellek, saydam) ───────────── */
export function masa(){
  const G=Y.G+4, M=Y.masa, [kx,ky]=Y.kn, r=rng(3700);
  const onX=kx+(M.x0-kx)*(M.on-ky)/(M.arka-ky); // sol kenar kaçış noktasına koşar
  const ust=[[M.x0,M.arka],[G,M.arka],[G,M.on],[onX,M.on]];
  c.beginPath(); yol(ust); c.fillStyle='#1a140d'; c.fill();
  c.save(); c.beginPath(); yol(ust); c.clip();
  for(let i=0;i<12;i++){const X=(M.x0-kx)+i*120+(r()-.5)*20; titrek(()=>{c.moveTo(kx+X,M.arka); c.lineTo(kx+X*(M.on-ky)/(M.arka-ky),M.on);},MUR,.6,1.4,3700+i,2,1.6);}
  tara(Math.min(M.x0,onX)-20,M.arka,G,M.on,.04,5,MUR,.5,3720,1);
  for(let i=0;i<5;i++) leke(M.x0+r()*(G-M.x0),lerp(M.arka,M.on,r()),40+r()*60,8+r()*10,[4,3,2],.4);
  c.restore();
  // ön yüz: kısa, çekmeceli; tamamen kara değil
  const onYuz=[[onX,M.on],[G,M.on],[G,H+10],[onX,H+10]];
  c.beginPath(); yol(onYuz); c.fillStyle='#0d0a07'; c.fill();
  c.save(); c.beginPath(); yol(onYuz); c.clip(); tara(onX,M.on,G,H+10,1.45,6,MUR,.6,3730,1.1);
  const cw=Math.min(220,(G-onX)*.35), cx=onX+(G-onX)*.45;
  titrek(()=>{c.rect(cx-cw/2,M.on+18,cw,46);},hex('#2a2116'),.6,1.3,3731,2,1.4);
  c.fillStyle='#050403'; c.fillRect(cx-10,M.on+38,20,6);
  leke(onX+(G-onX)*.5,H,(G-onX)*.6,(H-M.on)*.8,[0,0,0],.5);
  c.restore();
  titrek(()=>{c.moveTo(onX,M.on); c.lineTo(G,M.on);},hex('#5a4a32'),.55,2,3740,2,2);
  titrek(()=>{c.moveTo(M.x0,M.arka); c.lineTo(onX,M.on); c.lineTo(onX,H+10);},hex('#3a2e1e'),.55,1.6,3741,2,2);
  titrek(()=>{c.moveTo(M.x0,M.arka); c.lineTo(G,M.arka);},MUR,.7,1.4,3742,2,1.5);
  // masadakiler: bağlanmış yedi dosya, sönük gaz lambası
  const gen=G-M.x0, dx=M.x0+gen*.3, dy=M.arka+(M.on-M.arka)*.5;
  for(let i=0;i<7;i++){const y=dy-i*6, sx=(r()-.5)*8; const p=[[dx-56+sx,y],[dx+54+sx,y-3],[dx+58+sx,y+6],[dx-54+sx,y+8]]; c.fillStyle=i%2?'#2e2618':'#3a301e'; c.beginPath(); yol(p); c.fill(); titrek(()=>{c.moveTo(p[0][0],p[0][1]); c.lineTo(p[1][0],p[1][1]);},MUR,.7,1,3750+i,1,1);}
  c.strokeStyle='rgba(90,70,40,.55)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(dx-4,dy-46); c.lineTo(dx-2,dy+8); c.stroke(); // ip
  const lx=M.x0+gen*.72, ly=M.arka+(M.on-M.arka)*.55;
  if(lx+30<G){
    c.fillStyle='#0d0b08'; c.beginPath(); c.ellipse(lx,ly,26,7,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.moveTo(lx-22,ly); c.quadraticCurveTo(lx-26,ly-34,lx-10,ly-44); c.lineTo(lx+10,ly-44); c.quadraticCurveTo(lx+26,ly-34,lx+22,ly); c.fill();
    c.fillStyle='rgba(60,62,52,.35)'; c.beginPath(); c.moveTo(lx-8,ly-44); c.quadraticCurveTo(lx-17,ly-68,lx-8,ly-94); c.lineTo(lx+8,ly-94); c.quadraticCurveTo(lx+17,ly-68,lx+8,ly-44); c.fill();
    titrek(()=>{c.moveTo(lx-8,ly-44); c.quadraticCurveTo(lx-17,ly-68,lx-8,ly-94); c.moveTo(lx+8,ly-94); c.quadraticCurveTo(lx+17,ly-68,lx+8,ly-44);},hex('#5a5a4a'),.45,1,3760,2,1.2);
  }
}

/* ───────────── dinamik ışık: tavana vuran pencere deseni, pencere çevresi ───────────── */
export function odaIsigi(renk,I){
  const P=Y.pencere;
  // ışık aşağıdan gelir: pencere deseni tavana, pencereden odanın içine doğru düşer (kirişler sonra üstüne çizilir)
  c.save(); kirp(tavan());
  c.globalCompositeOperation='lighter';
  const s0=P.sUzak*.9, s1=P.sYakin*1.2, X0=Y.Xd, X1=Y.Xd*.45;
  const dort=(xa,xb,sa,sb)=>[E(xa,Y.Ytavan,sa),E(xb,Y.Ytavan,sa),E(xb,Y.Ytavan,sb),E(xa,Y.Ytavan,sb)];
  const ortaS=(s0+s1)/2, mrk=E(lerp(X0,X1,.35),Y.Ytavan,ortaS);
  const genX=Math.abs(E(X1,0,ortaS)[0]-E(X0,0,ortaS)[0]), genY=Math.abs(E(0,Y.Ytavan,s1)[1]-E(0,Y.Ytavan,s0)[1]);
  leke(mrk[0],mrk[1],genX*.8+80,genY*.9+60,renk,.12*I);
  for(const [xa,xb] of[[.04,.47],[.53,.96]]) for(const [sa,sb] of[[.03,.48],[.52,.97]]){
    const p=dort(lerp(X0,X1,xa),lerp(X0,X1,xb),lerp(s0,s1,sa),lerp(s0,s1,sb));
    const cx=(p[0][0]+p[1][0]+p[2][0]+p[3][0])/4, cy=(p[0][1]+p[1][1]+p[2][1]+p[3][1])/4;
    c.save(); kirp(p);
    leke(cx,cy,Math.abs(p[1][0]-p[0][0])*.7+40,Math.abs(p[2][1]-p[0][1])*.9+30,renk,.15*I);
    c.restore();
  }
  c.restore();
  // pencere boşluğunun iç yüzleri dışarıdan gelen ışığı yakalar
  c.save(); c.globalCompositeOperation='lighter';
  c.save(); kirp(soveYuzu()); const u=Y.pen.uzUst, ua=Y.pen.uzAlt; leke(u[0],(u[1]+ua[1])*.5+(ua[1]-u[1])*.2,(Y.cam.uzUst[0]-u[0])*1.4+20,(ua[1]-u[1])*.6,renk,.3*I); c.restore();
  c.save(); kirp(lentoYuzu()); leke((Y.pen.yaUst[0]+Y.pen.uzUst[0])/2,(Y.pen.yaUst[1]+Y.pen.uzUst[1])/2,(Y.pen.uzUst[0]-Y.pen.yaUst[0])*.55,90,renk,.22*I); c.restore();
  // duvarın pencere çevresi ve odaya taşan genel parıltı
  const [cx,cy]=Y.penOrta, w=Y.kutu.x1-Y.kutu.x0, h=Y.kutu.y1-Y.kutu.y0;
  leke(cx+w*.15,cy,w*.75,h*.65,renk,.07*I);
  leke(Y.kutu.x1,cy-h*.1,w*.25,h*.55,renk,.06*I);
  c.restore();
}

// masa kenarı ve dosyalar pencereden gelen ışığı yakalar
export function masaIsigi(renk,I){
  const M=Y.masa, G=Y.G;
  c.save(); c.globalCompositeOperation='lighter';
  leke(M.x0+(G-M.x0)*.25,M.arka+(M.on-M.arka)*.4,(G-M.x0)*.45,(M.on-M.arka)*.6,renk,.1*I);
  leke(M.x0+120,M.arka+3,260,7,renk,.2*I);
  c.restore();
}
