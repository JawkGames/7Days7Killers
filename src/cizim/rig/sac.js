// Saç: arkadaki kütle (gövdenin arkasında) ve öndeki tutamlar (yüzün üstünde). Biçim etkin görünüşten gelir:
// uzun (varsayılan kadın), toplu, kisa, kel, dagnik. Yemeni ya da şal saçı örtüyorsa yalnızca başlık çizilir.
import {c} from '../teknik/tuval.js';
import {leke} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,rgba,lerp,bez} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G} from './gorunus.js';
import {lifDoldur,lifKutle,teller} from './doku.js';
import {titrek} from '../teknik/firca.js';
import {baslikArka} from './baslik.js';
import {figurDonusumu,basDonusumu,basPozDonusumu} from './yapi.js';

export const SAC={
  sol:[[-35,-236,-230,-262,-232,200,-200,430],[-35,-168,-150,-176,-130,170,-158,436]],
  sag:[[-35,-236,246,-280,230,200,202,430],[-35,-168,150,-140,132,150,160,438]]
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
// dağınık saç (meczup): sabit tohumlu düzensiz uçlar; yalnızca uçlar salınır
function puskul(x0,x1,y,derin,seed,s){ // sağdan sola tırtıklı alt kenar
  const r=rng(seed), n=9;
  for(let i=1;i<=n;i++){const t=i/n, x=x0+(x1-x0)*t, yy=y+(i%2?derin*(.6+r()*.8):-derin*.3*r()); c.lineTo(x+s*(.4+r()*.6),yy);}
}
/* ───────── yeni yol: dağınık saç tutam tutam ───────── */
// düzensiz kütle: merkez etrafında titreyen yarıçaplı kapalı eğri (orta noktalardan geçen ikinci derece eğriler)
function kutleYolu(p,cx,cy,rx,ry,a0,a1,n,sert,seed,alt){
  const r=rng(seed), P=[];
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n, q=1+(r()-.5)*sert*(i%2?1.6:.6); P.push([cx+Math.cos(a)*rx*q,cy+Math.sin(a)*ry*q]);}
  p.moveTo(P[0][0],P[0][1]);
  for(let i=1;i<P.length-1;i++) p.quadraticCurveTo(P[i][0],P[i][1],(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2);
  p.lineTo(P[P.length-1][0],P[P.length-1][1]);
  if(alt) alt(p); p.closePath();
}
function dagnikArkaOzel(){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, s=poz.sallanti;
  const yol=p=>kutleYolu(p,s*.5,-10,226*e,262*u,Math.PI*.98,Math.PI*2.02,18,.16,44,q=>{
    // alt kenar: omuz üstünde düzensiz uçlarla biter
    const r=rng(46); q.lineTo(216*e+s,250); for(let i=1;i<=10;i++){const x=216*e+s-(432*e)*i/10; q.lineTo(x+(r()-.5)*14,250+(i%2?40+r()*40:-r()*16));}
    q.quadraticCurveTo(-250*e+s,120,-236*e,40); q.quadraticCurveTo(-214*e,10,-226*e*1.02,-14);});
  lifKutle(yol,[-240*e,-280*u,240*e,300],{renk:R.sacArka,koyu:[0,0,0],isik:R.sacIsik,n:700,boy:60,yon:x=>Math.PI/2+x*.0022,dag:.5,kivrim:1,seed:41,acik:.18,parlak:.4,taban:.9,dolu:.92});
}
// tek bir tutam: kökten uca incelen kavisli kilit; uç sivri ve biraz yana kaçar
function tutamYolu(p,x0,y0,x1,y1,gen,kay){
  const mx=(x0+x1)/2+kay, my=(y0+y1)/2;
  p.moveTo(x0,y0-gen); p.bezierCurveTo(x0-gen*1.3,y0,mx-gen*.9,my,x1,y1); p.bezierCurveTo(mx+gen*.9,my,x0+gen*1.3,y0,x0,y0-gen); p.closePath();
}
function dagnikOnOzel(){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, s=poz.sallanti, k=poz.kaynama;
  // yanlardan omuza düşen tutamlar: her yanda dört, boyları ve eğimleri farklı
  const r=rng(53);
  for(const y of[-1,1]) for(let i=0;i<4;i++){
    const x0=y*(150+i*14)*e, y0=(-150+i*34)*u, x1=y*(176+i*10+r()*30)*e+s, y1=150+i*30+r()*80, gen=(26-i*3)*e, kay=y*(8+r()*16);
    lifKutle(p=>tutamYolu(p,x0,y0,x1,y1,gen,kay),[Math.min(x0,x1)-gen-20,y0,Math.max(x0,x1)+gen+20,y1],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:150,boy:40,
      yon:(x,yy)=>Math.atan2(y1-y0,x1-x0)+(yy-y0)*.001*y,dag:.35,kivrim:.8,seed:60+i+(y>0?10:0),acik:.26,parlak:y<0?.9:.2,taban:1,dolu:.55});
    titrek(p=>{c.moveTo(x0+y*gen,y0+10); c.quadraticCurveTo((x0+x1)/2+kay+y*gen*.6,(y0+y1)/2,x1,y1);},PAL.murekkep,.35,1.1,70+i+(y>0?10:0)+k,2,1.6);
  }
  // tepe ve alna düşen perçem: kilitlerin uçları farklı boyda, sivri
  const uclar=[];
  for(let i=0;i<=10;i++){const x=(150-i*30)*e; uclar.push([x+(r()-.5)*14,(-118+(i%3===1?24:i%2?10:-6)+r()*20)*u]);}
  const tepe=p=>{p.moveTo(-158*e,-70*u); p.bezierCurveTo(-170*e,-236*u,-60*e,-272*u,0,-270*u); p.bezierCurveTo(60*e,-272*u,170*e,-236*u,158*e,-70*u);
    let px=158*e, py=-70*u;
    for(const [x,yy] of uclar){const kx=(px+x)/2, ky=Math.min(py,yy)-30*u; p.quadraticCurveTo(kx+8,ky+6,x,yy); p.lineTo(x-8*e,yy-26*u); px=x-8*e; py=yy-26*u;}
    p.lineTo(-158*e,-70*u); p.closePath();};
  lifKutle(tepe,[-170*e,-272*u,170*e,-90*u],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:900,boy:34,yon:(x,yy)=>Math.PI/2+x*.0045,dag:.6,kivrim:.9,seed:49,acik:.26,taban:1,dolu:.9});
  // perçem kilitlerinin hattı: kopuk mürekkep
  titrek(()=>{for(const [x,yy] of uclar){c.moveTo(x,yy); c.quadraticCurveTo(x+6,yy-30*u,x+2,yy-60*u);}},PAL.murekkep,.3,1.1,75+k,2,1.6);
  const dis=[];
  for(let i=0;i<=18;i++){const a=Math.PI*(1.02+i/18*.96); dis.push([Math.cos(a)*200*e,-70+Math.sin(a)*206*u,a+(r()-.5)*.6]);}
  teller(dis,R.sacKoyu,51,34);
  teller(dis.filter((_,i)=>i%2).map(([x,yy,a])=>[x,yy,a+.5]),R.sacIsik,52,26);
  teller(uclar.map(([x,yy])=>[x,yy-4,Math.PI/2+(r()-.5)*.8]),R.sacKoyu,54,22);
}
function dagnikArka(){
  if(G.ozel) return dagnikArkaOzel();
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, s=poz.sallanti;
  const yol=()=>{c.moveTo(0,-256*u); c.bezierCurveTo(120*e,-262*u,214*e,-200*u,214*e,-60); c.bezierCurveTo(222*e,60,226*e+s,170,214*e+s,246);
    puskul(214*e+s,-214*e+s,252,60,45,s); c.bezierCurveTo(-226*e+s,170,-222*e,60,-214*e,-60); c.bezierCurveTo(-214*e,-200*u,-120*e,-262*u,0,-256*u); c.closePath();};
  lifDoldur(yol,[-226*e,-262*u,226*e,290],{renk:R.sacArka,koyu:[0,0,0],isik:R.sacIsik,n:380,boy:56,yon:x=>Math.PI/2+x*.002,dag:.6,kivrim:1,seed:41,acik:.2,parlak:.5});
}
function dagnikOn(){
  if(G.ozel) return dagnikOnOzel();
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, s=poz.sallanti;
  // yanlardan omuza düşen iki tutam: yüzün kenarını örter
  for(const y of[-1,1]){
    const yol=()=>{c.moveTo(y*-20,-246*u); c.bezierCurveTo(y*150*e,-252*u,y*212*e,-150*u,y*208*e,-20); c.bezierCurveTo(y*206*e,80,y*202*e+s,170,y*192*e+s,236);
      puskul(y*192*e+s,y*146*e+s,236,52,47+y,s); c.bezierCurveTo(y*148*e,140,y*154*e,40,y*148*e,-60); c.bezierCurveTo(y*142*e,-150*u,y*90*e,-200*u,y*-20,-212*u); c.closePath();};
    lifDoldur(yol,y<0?[-212*e,-252*u,-140*e,260]:[140*e,-252*u,212*e,260],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:420,boy:44,yon:()=>Math.PI/2,dag:.5,kivrim:1.1,seed:48+y,acik:.26,parlak:y<0?1:.25});
  }
  // tepe ve alna düşen düzensiz saç çizgisi
  const cizgi=[[120,-140],[96,-128],[70,-142],[44,-126],[16,-144],[-12,-124],[-40,-142],[-68,-122],[-96,-140],[-124,-126]];
  const tepe=()=>{c.moveTo(-150*e,-120*u); c.bezierCurveTo(-160*e,-232*u,-60*e,-264*u,0,-264*u); c.bezierCurveTo(60*e,-264*u,160*e,-232*u,150*e,-120*u);
    for(const [x,yy] of cizgi) c.lineTo(x*e,yy*u); c.closePath();};
  lifDoldur(tepe,[-160*e,-264*u,160*e,-120*u],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:420,boy:30,yon:x=>Math.PI/2+x*.006,dag:.8,kivrim:1,seed:49,acik:.26,yumusak:[0,-10,96*e,150*e]});
  // alna düşen tek tük teller ve silüetten taşanlar
  teller(cizgi.map(([x,yy])=>[x*e,yy*u,Math.PI/2+(x>0?-.3:.3)]),R.sacKoyu,50,26);
  const dis=[];
  for(let i=0;i<=16;i++){const a=Math.PI*(1.02+i/16*.96), x=Math.cos(a)*214*e, yy=-60+Math.sin(a)*200*u; dis.push([x,yy,a]);}
  for(let i=0;i<8;i++){const y=i%2?1:-1; dis.push([y*(206*e),-20+i*30,y>0?.2:Math.PI-.2]);}
  teller(dis,R.sacKoyu,51,30);
  teller(dis.slice(0,12).map(([x,yy,a])=>[x,yy,a+.4]),R.sacIsik,52,22);
}
/* ───────── ön ───────── */
function kisaSacOzel(){ // yeni yol: kenarlar kesik değil; şakakta favori sivrilir, ense ve kulak üstü tel tel
  const tur=G.sac.tur||'duz';
  if(tur!=='duz') return kisaTurlu(tur);
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, h=G.sac.cizgi*u, k=poz.kaynama;
  const yol=p=>{
    p.moveTo(-150*e,26); p.bezierCurveTo(-176*e,-60*u,-172*e,-196*u,-92*e,-226*u); p.bezierCurveTo(-40*e,-240*u,40*e,-240*u,92*e,-226*u);
    p.bezierCurveTo(172*e,-196*u,176*e,-60*u,150*e,26);
    p.quadraticCurveTo(144*e,-10,140*e,-30); p.bezierCurveTo(146*e,-70*u,144*e,h-4,116*e,h+14); p.quadraticCurveTo(62*e,h-12,0,h);
    p.quadraticCurveTo(-62*e,h-12,-116*e,h+14); p.bezierCurveTo(-144*e,h-4,-146*e,-70*u,-140*e,-30); p.quadraticCurveTo(-144*e,-10,-150*e,26); p.closePath();
  };
  lifKutle(yol,[-178*e,-242*u,178*e,30],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:900,boy:13,yon:(x,y)=>Math.atan2(y+40,x)+Math.PI+(y>-120?.5*Math.sign(x):0),dag:.7,kivrim:.4,seed:31,acik:.24,taban:1,dolu:.75});
  const t=[]; const r=rng(34);
  for(let i=0;i<10;i++){const y=-120+i*15; for(const s of[-1,1]) t.push([s*(168-i*1.5)*e,y,s>0?.2+r()*.6:Math.PI-.2-r()*.6]);}
  for(let i=0;i<8;i++){const x=(-110+i*31)*e; t.push([x,h+6+(r()-.5)*6,Math.PI/2+(r()-.5)*.9]);}
  teller(t,R.sacKoyu,33,9);
  titrek(()=>{c.moveTo(-138*e,-30); c.quadraticCurveTo(-144*e,-4,-150*e,24); c.moveTo(138*e,-30); c.quadraticCurveTo(144*e,-4,150*e,24);},PAL.murekkep,.35,1.1,36+k,2,1.4);
  c.save(); c.beginPath(); yuzKirp(); c.clip(); leke(0,h+16,120*e,16,R.tenDerin,.4); c.restore();
}
function kisaSac(){
  if(G.ozel) return kisaSacOzel();
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, h=G.sac.cizgi*u;
  const yol=()=>{
    c.moveTo(-157*e,-22); c.bezierCurveTo(-174*e,-90*u,-170*e,-196*u,-92*e,-224*u); c.bezierCurveTo(-40*e,-238*u,40*e,-238*u,92*e,-224*u);
    c.bezierCurveTo(170*e,-196*u,174*e,-90*u,157*e,-22);
    c.lineTo(146*e,-26); c.bezierCurveTo(148*e,-60*u,146*e,h-4,116*e,h+14); c.quadraticCurveTo(62*e,h-10,0,h);
    c.quadraticCurveTo(-62*e,h-10,-116*e,h+14); c.bezierCurveTo(-146*e,h-4,-148*e,-60*u,-146*e,-26); c.closePath();
  };
  lifDoldur(yol,[-176*e,-240*u,176*e,-20],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:700,boy:13,yon:(x,y)=>Math.atan2(y+60,x)+Math.PI,dag:.7,kivrim:.4,seed:31,acik:.22});
  teller([[-120*e,-214*u,-2.2],[-60*e,-234*u,-1.9],[10,-238*u,-1.5],[80*e,-230*u,-1.2],[150*e,-180*u,-.6],[-160*e,-150*u,-2.6]],R.sacKoyu,33,10);
  // alın çizgisinin altında hafif gölge: saç alına oturur
  c.save(); c.beginPath(); yuzKirp(); c.clip(); leke(0,h+14,120*e,16,R.tenDerin,.35); c.restore();
}
function kelSac(){
  if(G.ozel) return kelSacOzel();
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
/* ───────── kısa erkek saçının çeşitleri (yeni yol) ─────────
   acik: alnı açılmış (şakaklar geri çekilmiş, tepe seyrek, saç dibinden kafa derisi görünür)
   kabarik: dağınık, kabarık; düzensiz silüet, alna düşen perçemler
   yana: yandan ayrılmış, ayrımın öbür yanına taranmış; alnın bir yanına kavisli kâkül
   geri: geriye taranmış; yüksek, düzgün saç çizgisi, tepeye doğru uzun parlak teller */
function kisaTurlu(tur){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, h=G.sac.cizgi*u, k=poz.kaynama, r=rng(301);
  // dış silüet ortak: favoriden tepeye, öbür favoriye
  const dis=(p,tepe)=>{p.moveTo(-150*e,26); p.bezierCurveTo(-176*e,-60*u,-174*e,(tepe+40)*u,-92*e,(tepe+14)*u); p.bezierCurveTo(-40*e,tepe*u,40*e,tepe*u,92*e,(tepe+14)*u);
    p.bezierCurveTo(174*e,(tepe+40)*u,176*e,-60*u,150*e,26); p.quadraticCurveTo(144*e,-10,140*e,-30);};
  let yol, yon, ops, uclar=[];
  if(tur==='acik'){
    const d=-36*u; // şakak girintisinin derinliği
    yol=p=>{dis(p,-226); p.bezierCurveTo(146*e,-70*u,142*e,-104*u,126*e,-112*u);
      p.quadraticCurveTo(110*e,h+d+4,80*e,h+d); p.quadraticCurveTo(44*e,h+d+6,22*e,h-6); p.quadraticCurveTo(0,h+8,-22*e,h-6);
      p.quadraticCurveTo(-44*e,h+d+6,-80*e,h+d); p.quadraticCurveTo(-110*e,h+d+4,-126*e,-112*u);
      p.bezierCurveTo(-142*e,-104*u,-146*e,-70*u,-140*e,-30); p.quadraticCurveTo(-144*e,-10,-150*e,26); p.closePath();};
    yon=(x,y)=>Math.atan2(y+40,x)+Math.PI+(y>-120?.5*Math.sign(x):0);
    ops={n:760,boy:12,dag:.8,kivrim:.5,acik:.26,dolu:.8,taban:.8};
    // saç dibinde kafa derisi: çizginin üstünde ten rengi, açık şakaklar
    c.save(); c.beginPath(); c.ellipse(0,-150*u,150*e,100*u,0,0,TAU); c.clip();
    for(const s of[-1,1]) leke(s*84*e,h+d-16,34*e,30,R.tenIsik,(s<0?.22:.06)*poz.isik);
    c.restore();
    for(let i=0;i<14;i++){const x=(-120+i*18.5)*e; const y=Math.abs(x)>60*e&&Math.abs(x)<110*e?h+d:h; uclar.push([x,y+4,Math.PI/2+(r()-.5)*1.2]);}
  } else if(tur==='kabarik'){
    const P=[]; const n=16;
    for(let i=0;i<=n;i++){const a=Math.PI*(1.02+i/n*.96), q=1+(r()-.5)*.12*(i%2?1.6:.5); P.push([Math.cos(a)*186*e*q,-74*u+Math.sin(a)*184*u*q]);}
    const alt=[]; for(let i=0;i<=11;i++){const x=(134-i*24.4)*e; alt.push([x+(r()-.5)*10,h+(i%3===1?26:i%2?12:-4)+r()*14]);}
    yol=p=>{p.moveTo(-150*e,26); p.quadraticCurveTo(-178*e,-30,P[0][0],P[0][1]);
      for(let i=1;i<P.length-1;i++) p.quadraticCurveTo(P[i][0],P[i][1],(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2);
      p.quadraticCurveTo(178*e,-30,150*e,26); p.quadraticCurveTo(144*e,-10,140*e,-30); p.bezierCurveTo(146*e,-70*u,146*e,h,alt[0][0],alt[0][1]);
      let px=alt[0][0], py=alt[0][1];
      for(const [x,y] of alt.slice(1)){p.quadraticCurveTo((px+x)/2,Math.min(py,y)-22*u,x,y); px=x; py=y;}
      p.bezierCurveTo(-146*e,h,-146*e,-70*u,-140*e,-30); p.quadraticCurveTo(-144*e,-10,-150*e,26); p.closePath();};
    yon=(x,y)=>y<h-30?Math.atan2(y+80,x)+Math.PI*.5+Math.sign(x)*.9:Math.PI/2+x*.004;
    ops={n:1200,boy:22,dag:1.1,kivrim:1,acik:.24,dolu:.85,taban:1};
    for(const [x,y] of alt) uclar.push([x,y-3,Math.PI/2+(r()-.5)*.9]);
    for(const [x,y] of P) uclar.push([x,y,Math.atan2(y+74*u,x)+(r()-.5)*.6]);
  } else if(tur==='yana'){
    const ax=-58*e; // ayrım çizgisi
    yol=p=>{dis(p,-246); p.bezierCurveTo(146*e,-70*u,148*e,h+8,120*e,h+22);
      p.bezierCurveTo(70*e,h+30,10*e,h+18,ax+30*e,h-4); p.quadraticCurveTo(ax+6*e,h-12,ax-14*e,h-2);
      p.quadraticCurveTo(-96*e,h-6,-118*e,h+12); p.bezierCurveTo(-144*e,h,-146*e,-70*u,-140*e,-30); p.quadraticCurveTo(-144*e,-10,-150*e,26); p.closePath();};
    yon=(x,y)=>x>ax?(y<h-20?-.15+(x-ax)*.0016:.35):Math.PI+.5-(ax-x)*.004;
    ops={n:900,boy:20,dag:.35,kivrim:.5,acik:.36,dolu:.8,taban:1};
    for(let i=0;i<9;i++){const x=(110-i*18)*e; uclar.push([x,h+20-Math.abs(i-3)*2,.4+(r()-.5)*.4]);}
  } else { // geri
    yol=p=>{dis(p,-242); p.bezierCurveTo(146*e,-70*u,144*e,h-4,118*e,h+6); p.quadraticCurveTo(60*e,h-10,8*e,h+2); p.quadraticCurveTo(0,h+10,-8*e,h+2);
      p.quadraticCurveTo(-60*e,h-10,-118*e,h+6); p.bezierCurveTo(-144*e,h-4,-146*e,-70*u,-140*e,-30); p.quadraticCurveTo(-144*e,-10,-150*e,26); p.closePath();};
    yon=(x,y)=>Math.atan2(-(y+300*u),-x*1.6)+Math.PI*1.0+Math.sign(x)*.15;
    ops={n:900,boy:24,dag:.25,kivrim:.35,acik:.32,dolu:.85,taban:1};
    for(let i=0;i<9;i++){const x=(-100+i*25)*e; uclar.push([x,h+2,-Math.PI/2+x*.003+(r()-.5)*.3]);}
  }
  lifKutle(yol,[-188*e,-262*u,188*e,30],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,yon,seed:31,parlak:tur==='acik'?.6:1,...ops});
  if(tur==='geri'||tur==='yana'){ // taranmış saçta uzun, parlak kavisli teller (yağlı, perdahlı)
    const P=new Path2D(); yol(P); c.save(); c.clip(P); c.lineCap='round';
    for(let i=0;i<16;i++){const x0=(-120+r()*240)*e, y0=h-6-r()*20, L=60+r()*80;
      const a=tur==='geri'?-Math.PI/2+x0*.0035:(x0>-58*e?-.35:Math.PI+.3);
      c.strokeStyle=rgba(R.sacIsik,(.18+r()*.25)*poz.isik*(x0<0?1:.45)); c.lineWidth=1+r()*1.4;
      c.beginPath(); c.moveTo(x0,y0); c.quadraticCurveTo(x0+Math.cos(a)*L*.5+(tur==='geri'?x0*.15:0),y0+Math.sin(a)*L*.5-14,x0+Math.cos(a)*L+(tur==='geri'?x0*.3:0),y0+Math.sin(a)*L-(tur==='yana'?40:0)); c.stroke();}
    c.restore();
    if(tur==='yana'){ // ayrım: ince ten çizgisi
      c.strokeStyle=rgba(R.tenGolge,.75); c.lineWidth=1.6; c.beginPath(); c.moveTo(-58*e,h-6); c.quadraticCurveTo(-62*e,-180*u,-56*e,-236*u); c.stroke(); }
  }
  // favoriler ve kulak üstü: dağınık tel uçları
  const t=[];
  for(let i=0;i<10;i++){const y=-120+i*15; for(const s of[-1,1]) t.push([s*(168-i*1.5)*e,y,s>0?.2+r()*.6:Math.PI-.2-r()*.6]);}
  teller(t,R.sacKoyu,33,tur==='kabarik'?16:9);
  teller(uclar,R.sacKoyu,37,tur==='kabarik'?20:tur==='acik'?6:10);
  if(tur==='kabarik') teller(uclar.filter((_,i)=>i%3===0).map(([x,y,a])=>[x,y,a+.4]),R.sacIsik,38,16);
  titrek(()=>{c.moveTo(-138*e,-30); c.quadraticCurveTo(-144*e,-4,-150*e,24); c.moveTo(138*e,-30); c.quadraticCurveTo(144*e,-4,150*e,24);},PAL.murekkep,.35,1.1,36+k,2,1.4);
  c.save(); c.beginPath(); yuzKirp(); c.clip(); leke(0,h+(tur==='yana'?26:16),120*e,16,R.tenDerin,tur==='acik'?.2:.42); c.restore();
}
/* kel (yeni yol): yanlarda ve ensede tel tel seyrek saç; üst kenarı düzensiz, kafa derisine erir; tepede birkaç tel */
function kelSacOzel(){
  const Y=G.yuz, R=G.renk, e=Y.en, u=Y.alin, k=poz.kaynama, r=rng(351);
  c.save(); c.beginPath(); yuzKirp(); c.clip();
  leke(-46*e,-168*u,62*e,24*u,R.tenIsik,.3*poz.isik,-.3);
  leke(90*e,-160*u,90*e,50*u,R.tenDerin,.5);
  c.restore();
  for(const s of[-1,1]){
    const yol=p=>{p.moveTo(s*124*e,-124*u); p.bezierCurveTo(s*156*e,-112*u,s*178*e,-40*u,s*162*e,26); p.lineTo(s*146*e,18);
      p.bezierCurveTo(s*150*e,-24*u,s*148*e,-70*u,s*132*e,-100*u); p.quadraticCurveTo(s*126*e,-112*u,s*124*e,-124*u); p.closePath();};
    // kafa derisine erime: bandın üstünde kısa kıl dipleri
    for(let i=0;i<120;i++){const t=r(), x=s*(128+t*44)*e+(r()-.5)*10, y=(-132+t*60)*u-r()*22*u;
      c.fillStyle=rgba(R.sacKoyu,.12+r()*.22); c.fillRect(x,y,.9+r(),.9+r()*1.4);}
    lifKutle(yol,[s<0?-180*e:120*e,-130*u,s<0?-120*e:180*e,30],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:340,boy:15,
      yon:(x,y)=>Math.PI/2+s*(.55-(y+120)*.002),dag:.55,kivrim:.7,seed:35+s,acik:.36,parlak:s<0?1:.2,taban:.55});
    teller(Array.from({length:12},(_,i)=>[s*(130+i*3.4)*e,(-118+i*12)*u,s>0?-.4+r()*.4:Math.PI+.4-r()*.4]),R.sacIsik,357+s,12);
    teller(Array.from({length:10},(_,i)=>[s*(154+i*1.4)*e,(-90+i*12)*u,s>0?.3:Math.PI-.3]),R.sacKoyu,359+s,10);
  }
  // tepede tek tük, uçuşan ince kır teller
  c.lineCap='round';
  for(let i=0;i<9;i++){const x=(-70+i*18)*e+(r()-.5)*8, y=(-200-r()*10)*u, a=-Math.PI/2+(r()-.5)*1.4, L=14+r()*16;
    c.strokeStyle=rgba(R.sacIsik,.25+r()*.2); c.lineWidth=.7; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+Math.cos(a)*L*.5+4,y+Math.sin(a)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L); c.stroke();}
  void k;
}
// yüz silüeti (kırpma için)
function yuzKirp(){
  const Y=G.yuz, e=Y.en, u=Y.alin;
  c.moveTo(-158*e,-50*u); c.bezierCurveTo(-152*e,-150*u,-95*e,-202*u,0,-200*u); c.bezierCurveTo(95*e,-202*u,152*e,-150*u,158*e,-50*u); c.lineTo(158*e,60); c.lineTo(-158*e,60); c.closePath();
}

export function arkaSac(){
  const D=figurDonusumu(false), B=basDonusumu(), P=basPozDonusumu(); arkaSacCiz(); if(P) c.restore(); if(B) c.restore(); if(D) c.restore();
}
function arkaSacCiz(){
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
