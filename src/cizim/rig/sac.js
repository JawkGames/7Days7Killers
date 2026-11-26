// Saç: arkadaki kütle (gövdenin arkasında) ve öndeki tutamlar (yüzün üstünde). Biçim etkin görünüşten gelir:
// uzun (varsayılan kadın), toplu, kisa, kel, dagnik. Yemeni ya da şal saçı örtüyorsa yalnızca başlık çizilir.
import {c} from '../teknik/tuval.js';
import {leke} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {rgba,lerp,bez} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G} from './gorunus.js';
import {lifDoldur,teller} from './doku.js';
import {baslikArka} from './baslik.js';

export const SAC={
  sol:[[-35,-236,-230,-262,-232,200,-200,430],[-35,-168,-150,-176,-130,170,-158,436]],
  sag:[[-35,-236,246,-280,230,200,202,430],[-35,-168,150,-140,132,150,160,438]]
};
// dağınık saç (meczup): omuza düşen, düzensiz tutamlar
const DAGNIK={
  sol:[[-30,-240,-236,-268,-250,120,-226,300],[-30,-176,-150,-186,-142,120,-168,292]],
  sag:[[-30,-240,250,-282,250,120,222,296],[-30,-176,154,-150,140,110,170,300]],
  perce:[[[-6,-226,-40,-200,-76,-150,-96,-96],[14,-214,-10,-170,-40,-130,-58,-104]],
         [[30,-226,52,-196,70,-150,96,-104],[48,-214,74,-170,90,-140,110,-122]],
         [[-60,-230,-110,-206,-128,-160,-140,-112],[-40,-214,-84,-180,-106,-146,-118,-118]]]
};

export function bukle(P){const o=new Array(8); for(let k=0;k<4;k++){const y=P[k*2+1]; o[k*2]=P[k*2]+(y>100?poz.sallanti*Math.pow((y-100)/235,2):0); o[k*2+1]=y;} return o;}
export function tutam(A,B,o){
  const R=G.renk, a=bukle(A), b=bukle(B);
  c.beginPath(); c.moveTo(a[0],a[1]); c.bezierCurveTo(a[2],a[3],a[4],a[5],a[6],a[7]);
  c.quadraticCurveTo((a[6]+b[6])/2,(a[7]+b[7])/2+18,b[6],b[7]); c.bezierCurveTo(b[4],b[5],b[2],b[3],b[0],b[1]); c.closePath();
  c.fillStyle=R.sac; c.fill();
  c.save(); c.clip();
  const r=rng(o.seed); c.lineCap='round';
  for(let i=0;i<o.n;i++){
    const t=r(), j=()=>(r()-.5)*12, acik=r()<.22;
    c.strokeStyle=acik?rgba(R.sacIsik,.14+r()*.3):rgba(PAL.siyah,.35+r()*.5); c.lineWidth=.7+r()*2.1;
    c.beginPath(); c.moveTo(lerp(a[0],b[0],t),lerp(a[1],b[1],t));
    c.bezierCurveTo(lerp(a[2],b[2],t)+j(),lerp(a[3],b[3],t)+j(),lerp(a[4],b[4],t)+j(),lerp(a[5],b[5],t)+j(),lerp(a[6],b[6],t)+j(),lerp(a[7],b[7],t)+r()*14);
    c.stroke();
  }
  for(const h of o.isik) leke(h[0],h[1],h[2],h[3],h[4],h[5],h[6]);
  c.restore();
  // silüetten taşan dağınık teller
  const u=rng(o.seed+poz.kaynama*3), n=o.tel||9;
  for(let i=0;i<n;i++){
    const t=.12+u()*.8, p=bez(a,t), q=bez(a,Math.min(1,t+.12+u()*.1)), d=o.yon*(6+u()*22)*(o.telBoy||1);
    c.strokeStyle=rgba(R.sacKoyu,.45+u()*.4); c.lineWidth=.7+u()*1.1;
    c.beginPath(); c.moveTo(p[0],p[1]); c.quadraticCurveTo((p[0]+q[0])/2+d,(p[1]+q[1])/2,q[0]+d*.5,q[1]+u()*18); c.stroke();
  }
}

/* ───────── arka kütle ───────── */
function uzunArka(){
  const s=poz.sallanti;
  c.beginPath(); c.moveTo(0,-240);
  c.bezierCurveTo(96,-246,170,-206,192,-40); c.bezierCurveTo(196,80,216,210,196+s,326);
  c.bezierCurveTo(150+s,356,60+s,338,s,344); c.bezierCurveTo(-60+s,338,-150+s,356,-196+s,326);
  c.bezierCurveTo(-216,210,-196,80,-192,-40); c.bezierCurveTo(-170,-206,-96,-246,0,-240); c.closePath();
  c.fillStyle=G.renk.sacArka; c.fill();
}
function dagnikNoktalar(){ // düzensiz silüet: sabit tohumlu, yalnızca alt uçlar salınır
  const r=rng(5), e=G.yuz.en, s=poz.sallanti, P=[];
  for(let i=0;i<=22;i++){
    const t=i/22, a=Math.PI*(1.06+t*.88+(-.03)), R=(232+(r()-.5)*44)*e;
    let x=Math.cos(a)*R*1.02, y=-40+Math.sin(a)*R*1.05;
    if(t<.12||t>.88){y+=(t<.12?(.12-t):(t-.88))*1900;}
    P.push([x+(y>100?s*(y-100)/120:0),y]);
  }
  return P;
}
function dagnikArka(){
  const P=dagnikNoktalar(), R=G.renk;
  const yol=()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++){const p=P[i-1],q=P[i]; c.quadraticCurveTo(p[0]+(q[0]-p[0])*.5+(i%2?14:-14),p[1]+(q[1]-p[1])*.5+(i%2?-10:10),q[0],q[1]);}
    c.quadraticCurveTo(0,300,P[0][0],P[0][1]); c.closePath();};
  lifDoldur(yol,[-260,-280,260,320],{renk:R.sacArka,koyu:[0,0,0],isik:R.sacIsik,n:420,boy:60,yon:(x,y)=>Math.atan2(y+120,x*.6),dag:.9,kivrim:.9,seed:41,acik:.18,parlak:.6});
  teller(P.filter((p,i)=>i%1===0).map(p=>[p[0],p[1],Math.atan2(p[1]+40,p[0])]),R.sacKoyu,43,34);
}

/* ───────── ön ───────── */
function kisaSac(){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, h=G.sac.cizgi*u;
  const yol=()=>{
    c.moveTo(-157*e,6); c.bezierCurveTo(-174*e,-80*u,-170*e,-196*u,-92*e,-224*u); c.bezierCurveTo(-40*e,-238*u,40*e,-238*u,92*e,-224*u);
    c.bezierCurveTo(170*e,-196*u,174*e,-80*u,157*e,6);
    c.lineTo(146*e,4); c.bezierCurveTo(148*e,-40*u,146*e,h-4,116*e,h+14); c.quadraticCurveTo(62*e,h-10,0,h);
    c.quadraticCurveTo(-62*e,h-10,-116*e,h+14); c.bezierCurveTo(-146*e,h-4,-148*e,-40*u,-146*e,4); c.closePath();
  };
  lifDoldur(yol,[-176*e,-240*u,176*e,10],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:700,boy:13,yon:(x,y)=>Math.atan2(y+60,x)+Math.PI,dag:.7,kivrim:.4,seed:31,acik:.22});
  teller([[-120*e,-214*u,-2.2],[-60*e,-234*u,-1.9],[10,-238*u,-1.5],[80*e,-230*u,-1.2],[150*e,-180*u,-.6],[-160*e,-150*u,-2.6]],R.sacKoyu,33,10);
  // alın çizgisinin altında hafif gölge: saç alına oturur
  c.save(); c.beginPath(); yuzKirp(); c.clip(); leke(0,h+14,120*e,16,R.tenDerin,.35); c.restore();
}
function kelSac(){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin;
  // tepe parlaklığı ve kafa derisinin gölgesi
  c.save(); c.beginPath(); yuzKirp(); c.clip();
  leke(-46*e,-168*u,62*e,24*u,R.tenIsik,.3*poz.isik,-.3);
  leke(90*e,-160*u,90*e,50*u,R.tenDerin,.5);
  c.restore();
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*136*e,-118*u); c.bezierCurveTo(s*168*e,-96*u,s*174*e,-30*u,s*160*e,24); c.lineTo(s*148*e,14); c.bezierCurveTo(s*152*e,-30*u,s*150*e,-80*u,s*130*e,-112*u); c.closePath();};
    lifDoldur(yol,[s<0?-176*e:126*e,-124*u,s<0?-126*e:176*e,28],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:160,boy:12,yon:()=>Math.PI/2+s*.5,dag:.6,seed:35+s,acik:.25,parlak:s<0?1:.2});
  }
}
function topluSac(){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, h=G.sac.cizgi*u;
  const yol=()=>{
    c.moveTo(-154*e,-10); c.bezierCurveTo(-170*e,-90*u,-162*e,-196*u,-90*e,-220*u); c.bezierCurveTo(-40*e,-232*u,40*e,-232*u,90*e,-220*u);
    c.bezierCurveTo(162*e,-196*u,170*e,-90*u,154*e,-10);
    c.bezierCurveTo(150*e,-60*u,140*e,h+10,96*e,h+6); c.quadraticCurveTo(40*e,h-6,0,h+4);
    c.quadraticCurveTo(-40*e,h-6,-96*e,h+6); c.bezierCurveTo(-140*e,h+10,-150*e,-60*u,-154*e,-10); c.closePath();
  };
  lifDoldur(yol,[-172*e,-236*u,172*e,0],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:420,boy:46,yon:(x,y)=>x<0?Math.PI-.35+y*.002:.35-y*.002,dag:.25,kivrim:.35,seed:37,acik:.24});
  // orta ayrım
  c.strokeStyle=rgba(R.tenGolge,.7); c.lineWidth=1.4; c.beginPath(); c.moveTo(0,-232*u); c.quadraticCurveTo(-2,-200*u,0,h+4); c.stroke();
}
function dagnikOn(){
  const R=G.renk, e=G.yuz.en;
  c.save(); if(e!==1) c.scale(e,1);
  tutam(DAGNIK.sol[0],DAGNIK.sol[1],{seed:51,n:150,yon:-1,tel:16,telBoy:1.6,isik:[[-160,-190,70,22,R.sacIsik,.3,-.55],[-200,60,24,90,R.sacIsik,.12]]});
  tutam(DAGNIK.sag[0],DAGNIK.sag[1],{seed:52,n:150,yon:1,tel:16,telBoy:1.6,isik:[[60,-226,110,20,R.sacIsik,.2,.2],[180,120,60,260,PAL.siyah,.55]]});
  DAGNIK.perce.forEach((p,i)=>tutam(p[0],p[1],{seed:55+i,n:40,yon:i===1?1:-1,tel:6,telBoy:.8,isik:[]}));
  c.restore();
}
// yüz silüeti (kırpma için)
function yuzKirp(){
  const Y=G.yuz, e=Y.en, u=Y.alin;
  c.moveTo(-158*e,-50*u); c.bezierCurveTo(-152*e,-150*u,-95*e,-202*u,0,-200*u); c.bezierCurveTo(95*e,-202*u,152*e,-150*u,158*e,-50*u); c.lineTo(158*e,60); c.lineTo(-158*e,60); c.closePath();
}

export function arkaSac(){
  baslikArka();
  if(G.ortuyor) return;
  const b=G.sac.bicim;
  if(b==='uzun') uzunArka();
  else if(b==='dagnik') dagnikArka();
}
export function onSac(){
  if(G.ortuyor) return; // yemeni ve şal saçı örter; görünen tel başlıkla birlikte çizilir
  const b=G.sac.bicim, R=G.renk;
  if(b==='uzun'){
    tutam(SAC.sol[0],SAC.sol[1],{seed:11,n:130,yon:-1,isik:[[-150,-200,80,22,R.sacIsik,.34,-.55],[-198,50,20,90,R.sacIsik,.14]]});
    tutam(SAC.sag[0],SAC.sag[1],{seed:12,n:140,yon:1,isik:[[60,-222,110,20,R.sacIsik,.22,.2],[170,120,60,260,PAL.siyah,.55]]});
  }
  else if(b==='kisa') kisaSac();
  else if(b==='kel') kelSac();
  else if(b==='toplu') topluSac();
  else if(b==='dagnik') dagnikOn();
}
