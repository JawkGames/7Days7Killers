// Cama atılan taşlar ve kesekler: atış çizelgesi tohumdan çıkar, her çarpma camda kalıcı iz bırakır (çatlak ya da çamur).
// Her şey zamanın saf işlevidir: aynı t, aynı kare.
import {c} from '../../teknik/tuval.js';
import {leke,titrek} from '../../teknik/firca.js';
import {TAU,lerp,clamp,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {ZAMAN,KALABALIK} from './ayar.js';
import {zemin} from './kalabalik.js';
import {Y,camNokta} from './yerlesim.js';
import {camYolu,penYolu} from './oda.js';

const BOS=[[.44,.56],[.19,.29],[.57,.67]]; // dikme ve kayıt çevresine isabet yazılmaz

export function tasPlani(KL,dogru,tohum){
  const r=rng((tohum|0)*131+dogru*7+5), oran=KL.oran;
  if(oran<=0) return [];
  const atanlar=KL.kisiler.filter(k=>k.grup==='o'&&k.z<1.7&&!k.seyirci);
  if(!atanlar.length) return [];
  const n=Math.max(1,Math.round(oran*5+(dogru===0?3:0)+r()*.8));
  const atislar=[]; let t=ZAMAN.tas.bas;
  for(let i=0;i<n;i++){
    let a,b,dene=0;
    do{a=.07+r()*.86; b=.07+r()*.86; dene++;}
    while(dene<20&&((a>BOS[0][0]&&a<BOS[0][1])||(b>BOS[1][0]&&b<BOS[1][1])||(b>BOS[2][0]&&b<BOS[2][1])));
    const atan=atanlar[Math.floor(r()*atanlar.length)];
    const isin=[];
    const ray=6+Math.floor(r()*5);
    for(let j=0;j<ray;j++){
      const aci=j/ray*TAU+(r()-.5)*.5, boy=.35+r()*.75, adim=3+Math.floor(r()*3), noktalar=[[0,0]];
      let x=0,y=0,yon=aci;
      for(let s=0;s<adim;s++){yon+=(r()-.5)*.5; const u=boy/adim*(.7+r()*.6); x+=Math.cos(yon)*u; y+=Math.sin(yon)*u; noktalar.push([x,y]);}
      const dal=r()<.45?{i:1+Math.floor(r()*(adim-1)),aci:yon+(r()<.5?-1:1)*(.5+r()*.5),boy:boy*.35*(.6+r()*.6)}:null;
      isin.push({noktalar,dal});
    }
    const halka=[.18+r()*.1,.42+r()*.15].map(rr=>({r:rr,bas:r()*TAU,yay:1.2+r()*2.4}));
    atislar.push({t,tur:r()<.72?'tas':'kesek',a,b,atan,isin,halka,tohum:Math.floor(r()*1e5),don:r()*TAU});
    t+=lerp(ZAMAN.tas.aralik[0],ZAMAN.tas.aralik[1],r())/(1+oran*.35);
  }
  return atislar;
}
export function sonCarpma(plan){return plan.length?plan[plan.length-1].t:0;}

function boyut(s){return (Y.pen.yaAlt[1]-Y.pen.yaUst[1])*.17*(s/Y.pencere.sYakin);}
const BASIK=.62; // cam yan durduğu için çatlak yatayda basık görünür

// cama yapışmış izler: çatlaklar ve çamur
export function camIzleri(plan,t,kaynama){
  c.save(); c.beginPath(); penYolu(); c.clip(); c.beginPath(); camYolu(); c.clip();
  for(const A of plan){
    if(t<A.t) continue;
    const [x,y,s]=camNokta(A.a,A.b), B=boyut(s), gec=t-A.t;
    if(A.tur==='tas'){
      const buyu=clamp(gec/.12,0,1); // çatlak bir anda yayılır
      const yolla=()=>{
        for(const I of A.isin){
          const P=I.noktalar, m=Math.max(2,Math.ceil(P.length*buyu));
          c.moveTo(x,y); for(let i=1;i<m;i++) c.lineTo(x+P[i][0]*B*BASIK,y+P[i][1]*B);
          if(I.dal&&buyu>=1){const p=P[I.dal.i]; c.moveTo(x+p[0]*B*BASIK,y+p[1]*B); c.lineTo(x+(p[0]+Math.cos(I.dal.aci)*I.dal.boy)*B*BASIK,y+(p[1]+Math.sin(I.dal.aci)*I.dal.boy)*B);}
        }
        if(buyu>=1) for(const h of A.halka){
          const n=10; for(let i=0;i<=n;i++){const a=h.bas+h.yay*i/n, rr=h.r*(1+Math.sin(i*2.3+A.tohum)*.12); const px=x+Math.cos(a)*rr*B*BASIK, py=y+Math.sin(a)*rr*B; if(i) c.lineTo(px,py); else c.moveTo(px,py);}
        }
      };
      titrek(yolla,[4,4,3],.75,2.2,A.tohum+kaynama,1,.8);
      titrek(yolla,[206,200,178],.55,1.1,A.tohum+7+kaynama,2,.8);
      leke(x,y,B*.12,B*.14,[220,214,190],.35); // ezilmiş cam
      c.fillStyle='rgba(3,3,3,.8)'; c.beginPath(); c.ellipse(x,y,B*.035,B*.045,0,0,TAU); c.fill();
    }else{ // kesek: çamur sıçrar, aşağı süzülür
      const q=rng(A.tohum), ak=clamp(gec/3,0,1);
      leke(x,y,B*.32*BASIK,B*.28,[40,30,18],.9,A.don);
      for(let i=0;i<9;i++){const a=q()*TAU, d=(.15+q()*.4)*B; leke(x+Math.cos(a)*d*BASIK,y+Math.sin(a)*d,B*(.03+q()*.05),B*(.03+q()*.05),[34,26,16],.85);}
      c.strokeStyle='rgba(30,22,14,.8)'; c.lineCap='round';
      for(let i=0;i<3;i++){const dx=(q()-.5)*B*.3, u=(.2+q()*.5)*B*ak; c.lineWidth=B*(.02+q()*.02); c.beginPath(); c.moveTo(x+dx,y); c.lineTo(x+dx+(q()-.5)*3,y+B*.15+u); c.stroke();}
    }
    if(gec<.2){c.save(); c.globalCompositeOperation='lighter'; leke(x,y,B*.6,B*.6,[230,220,190],.35*(1-gec/.2)); c.restore();}
  }
  c.restore();
}

// havada giden taşlar: dışarıda kalır, cam şekline kırpılmış katmanda çizilir
export function ucanlar(plan,t){
  const U=ZAMAN.tas.ucus;
  for(const A of plan){
    const k=(t-(A.t-U))/U; if(k<0||k>=1) continue;
    const [ux,uy]=zemin(A.atan.u,A.atan.z), hb=KALABALIK.boy/A.atan.z;
    const bx=Y.dis.x+ux*Y.dis.o, by=Y.dis.y+(uy-hb*1.05)*Y.dis.o;
    const [ex,ey,s]=camNokta(A.a,A.b), B=boyut(s);
    const e=k*k;
    const x=lerp(bx,ex,e), y=lerp(by,ey,e)-Math.sin(k*Math.PI)*B*1.2, rr=lerp(.012,.075,e*e)*B;
    c.save(); c.translate(x,y); c.rotate(A.don+k*6);
    c.fillStyle=A.tur==='tas'?'#1a1813':'#2a1f13';
    c.beginPath(); for(let i=0;i<7;i++){const a=i/7*TAU, d=rr*(.75+((A.tohum>>i)&3)*.1); if(i) c.lineTo(Math.cos(a)*d,Math.sin(a)*d*.85); else c.moveTo(d,0);} c.closePath(); c.fill();
    c.strokeStyle=rgba([150,120,80],.4); c.lineWidth=Math.max(.8,rr*.15); c.beginPath(); c.arc(0,0,rr*.8,-2.4,-1); c.stroke();
    c.restore();
  }
}

// en son çarpmadan beri geçen süreye göre irkilme (0..1)
export function irkilme(plan,t){
  let m=0; for(const A of plan){const g=t-A.t; if(g>=0&&g<.45) m=Math.max(m,Math.sin(g/.45*Math.PI)*(1-g/.45*.4));} return m;
}
