// Irgat İsmail'in evi: yedi nüfusun yattığı, yediği tek alçak oda. Arka duvarda yamalı bezle yarı örtülü küçük
// pencere; sağda yedi kişilik yer yatağı ve yorgan üst üste yığılmış; solda yer sofrası (iki tas, kaşıklar);
// sağ önde örtülü ahşap beşik; sağ duvarda kapalı tahta kapı. Eşya az, her şey eski. Tek ışık: pencere.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,silindir,cokgen3,hat3,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,zemin,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {RENK_EV,odaDuvarlari,odaKenarlari,tavanCiz,bosluk,duvarBoslugu,isikDusmesi,huzme,yuzDoku,tabanGolgesi,
  yumusakKutu,yatakYigini,tas,gugum,agacCivi} from './halil-evi.js';

const SOL=-250, SAG=250, ARKA=420, TAVAN=226, ON=60;
const PEN={x0:-176, x1:-112, y0:108, y1:164};
const SOFRA={x:-140, z:390, r:34, h:14};
const BESIK={x:-186, z:296};
const KAPI={z0:300, z1:384, y1:168};                   // sağ duvarda kapalı kapı
const isik={konum:[-144,136,ARKA+44], guc:2, menzil:320, ortam:.32};
const {toprak:TOPRAK, ahsap:AHSAP}=RENK_EV;
const KIRLI=[164,154,132];

// Beşik: boyu derine doğru, iki kavisli sallanma ayağı üstünde tahta sandukça; iki ucunda yuvarlak başlı tahta,
// üstü katlı bir örtüyle kapalı (içi görünmez).
function besik(P,R){
  const {x,z}=BESIK, w=17, L=34, Y0=10, Y1=36, ARD=golgele(AHSAP,1.1);
  tabanGolgesi(P,isik,x-w-8,x+w+8,z-L,z+L,.6,.8);
  for(const zz of[z+L-4,z-L+4]){
    const n=Array.from({length:9},(_,i)=>{const f=i/8, xx=x-w-9+f*(2*w+18); return [xx,1+12*(2*f-1)**2,zz];});
    hat3(P,n,golgele(AHSAP,.85),.95,4*P.olcek(x,0,zz),9301+zz,1,0); hat3(P,n.map(q=>[q[0],q[1]-2,q[2]]),MUREKKEP,.6,1,9303+zz,1,.4);
    hat3(P,[[x,Y0,zz],[x,4,zz]],golgele(AHSAP,.8),.95,4*P.olcek(x,0,zz),9305+zz,1,0);
  }
  kutu(P,isik,[x-w,x+w],[Y0,Y1],[z-L,z+L],ARD,9310,{cizgi:.65,ust:false});
  yuzDoku(P,[[x+w,Y0,z-L],[x+w,Y0,z+L],[x+w,Y1,z+L],[x+w,Y1,z-L]],R,{sik:3,alfa:.35,lek:2});
  yumusakKutu(P,isik,R,[x-w+1,x+w+3],[Y1-2,Y1+8],[z-L+5,z+L-5],[150,132,116],9313,{yuvarlak:.4,cizgi:.6}); // örtü
  for(const zz of[z+L,z-L]){ // başlıklar: yuvarlak tepeli tahta
    const bas=[[-w-1,-Y0],[w+1,-Y0],[w+1,-(Y1+8)]]; for(let i=1;i<10;i++){const a=i/10*Math.PI; bas.push([Math.cos(a)*(w+1),-(Y1+8)-Math.sin(a)*9]);} bas.push([-w-1,-(Y1+8)]);
    const O=[x,0,zz-(zz<z?1:0)];
    tabana(); c.beginPath(); duzlemYol(P,O,DUZLEM.arka,bas); c.fillStyle=rgba(golgele(AHSAP,zz<z?1.15:.75),1); c.fill();
    if(zz<z){c.save(); c.clip(); const m=P.n(x,30,zz), o=P.olcek(x,30,zz); leke(m[0]+6*o,m[1],10*o,26*o,[230,210,170],.3); leke(m[0]-8*o,m[1]+8*o,10*o,24*o,[0,0,0],.3); c.restore();
      for(let i=1;i<3;i++) hat3(P,[[x-w+i*11,Y0+2,zz-1.2],[x-w+i*11,Y1+12,zz-1.2]],[60,46,34],.5,.8,9316+i,1,.3);}
    titrek(()=>duzlemYol(P,O,DUZLEM.arka,bas),MUREKKEP,.8,1.1,9314+zz,2,.6);
  }
}

export default {
  id:'irgat-evi',
  kamera:{odak:720, yukseklik:150, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[70,0,234], yuzey:'toprak', alan:16},
    'zemin-orta': {duzlem:'zemin', konum:[-40,0,396], yuzey:'toprak', alan:8},
    'zemin-kose': {duzlem:'zemin', konum:[-222,0,408], yuzey:'toprak', alan:4},
    'duvar':      {duzlem:'arka', konum:[-36,124,ARKA], yuzey:'siva', alan:5},
    'esik':       {duzlem:'zemin', konum:[SAG-16,0,342], yuzey:'tas', alan:3},
    'sofra-ustu': {duzlem:'ust', konum:[SOFRA.x+10,SOFRA.h,SOFRA.z+8], yuzey:'tahta', alan:6},
    'besik-dibi': {duzlem:'zemin', konum:[-120,0,268], yuzey:'toprak', alan:5},
    'beden':      {duzlem:'zemin', konum:[0,0,322], aci:.24, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(9303), S=SOFRA, K=KAPI;
    c.fillStyle='#0b0c0a'; c.fillRect(0,0,1000,750);
    odaDuvarlari(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON,renk:KIRLI,is:.35,catlak:6,
      yama:{sol:[[330,-150,30,22]]}, delik:{arka:[bosluk(PEN.x0,PEN.x1,PEN.y0,PEN.y1)]}});
    tavanCiz(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,on:ON,y:TAVAN,kirisX:[-150,-20,110,220],renk:[88,74,56]});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:9320,doku:1});
    odaKenarlari(P,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON});
    // pencere: yamalı bez perde çiviye takılı, yarısını örter
    duvarBoslugu(P,isik,R,{duvar:'arka',duz:ARKA,a0:PEN.x0,a1:PEN.x1,y0:PEN.y0,y1:PEN.y1,kalin:44,renk:KIRLI});
    kutu(P,{...isik,ortam:.15},[-146,-142],[PEN.y0,PEN.y1],[ARKA+18,ARKA+21],[56,46,36],9321,{cizgi:.4,ust:false});
    duzlemde(P,[0,0,ARKA-2],DUZLEM.arka,()=>{
      agacCivi(PEN.x0-6,-PEN.y1-6); agacCivi(PEN.x1+6,-PEN.y1-6);
      const pr=()=>{c.moveTo(PEN.x0-6,-PEN.y1-5); c.quadraticCurveTo(-150,-PEN.y1+2,-136,-PEN.y1-4); c.lineTo(-134,-PEN.y1+20); c.quadraticCurveTo(-140,-PEN.y0+8,-150,-PEN.y0+2); c.quadraticCurveTo(-166,-PEN.y0,-180,-PEN.y0+4); c.lineTo(PEN.x0-6,-PEN.y1-5); c.closePath();};
      c.beginPath(); pr(); c.fillStyle='rgb(120,108,92)'; c.fill();
      c.save(); c.clip(); leke(-150,-138,14,24,[230,226,210],.35); c.fillStyle='rgba(60,52,44,.6)'; c.fillRect(-172,-150,14,12); c.strokeStyle='rgba(30,26,22,.6)'; c.lineWidth=.5; c.strokeRect(-172,-150,14,12); for(let i=0;i<4;i++) titrek(()=>{c.moveTo(-176+i*9,-PEN.y1); c.lineTo(-174+i*8,-PEN.y0);},[40,34,28],.4,.6,9322+i,1,.3); c.restore();
      titrek(pr,MUREKKEP,.7,.9,9326,2,.5);
    });
    isikDusmesi(P,[[PEN.x0+10,0,ARKA-4],[-136,0,ARKA-4],[-40,0,260],[-180,0,260]],[-150,0,ARKA-10],[-110,0,270],.7);
    // sağ duvarda kapalı tahta kapı (kanatlar, kuşaklar, demir halka)
    { const O=[SAG,0,0], D=DUZLEM.sag, kp=bosluk(-K.z1,-K.z0,0,K.y1);
      tabana(); c.save(); c.beginPath(); duzlemYol(P,O,D,kp); c.clip(); c.fillStyle=rgba(golgele(AHSAP,.6),1); c.fillRect(0,0,1000,750);
      for(let i=1;i<5;i++){const zz=K.z0+(K.z1-K.z0)*i/5; hat3(P,[[SAG,0,zz],[SAG,K.y1,zz]],[20,16,12],.75,1.2,9330+i,1,.4);}
      for(const y of[30,K.y1-30]) hat3(P,[[SAG-1,y,K.z0],[SAG-1,y,K.z1]],golgele(AHSAP,.85),.95,5*P.olcek(SAG,y,(K.z0+K.z1)/2),9336+y,1,0);
      yuzDoku(P,[[SAG,0,K.z0],[SAG,0,K.z1],[SAG,K.y1,K.z1],[SAG,K.y1,K.z0]],R,{sik:10,alfa:.3,lek:4});
      c.restore(); titrek(()=>duzlemYol(P,O,D,kp,false),MUREKKEP,.8,1.3,9339,2,1);
      const h=P.n(SAG-2,90,K.z0+14), ho=P.olcek(SAG,90,K.z0+14); tabana(); c.strokeStyle='rgb(40,38,34)'; c.lineWidth=1.4; c.beginPath(); c.ellipse(h[0],h[1],3*ho,4.5*ho,0,0,TAU); c.stroke(); }
    // yüklük: arka duvar dibinde yedi döşek, üstünde yorganlar ve yastıklar
    const ust=yatakYigini(P,isik,R,100,ARKA-44,[
      {h:11,renk:[112,96,84],desen:'serit'},{h:10,renk:[130,116,100],desen:'dikis'},{h:11,renk:[100,88,78],desen:'serit'},
      {h:10,renk:[140,128,110]},{h:11,renk:[118,96,86],desen:'serit'},{h:10,renk:[126,118,104],desen:'dikis'},{h:11,renk:[108,94,84],desen:'serit'},
      {h:16,renk:[150,130,112],desen:'dikis',en:132},{h:15,renk:[132,104,92],desen:'dikis',en:128}],{en:140,boy:76,tohum:9340});
    for(const [i,x] of[40,96,152].entries()) yumusakKutu(P,isik,R,[x-24,x+22],[ust-1,ust+14+(i%2)*2],[ARKA-60,ARKA-34],[176,168,150],9360+i,{yuvarlak:.45,cizgi:.6}); // yastıklar
    // yer sofrası: hasır üstünde alçak yuvarlak tahta; iki tas, kaşıklar
    const H=[[-236,0,334],[-70,0,340],[-74,0,ARKA-4],[-240,0,ARKA-8]]; cokgen3(P,H,[108,96,70]);
    yuzDoku(P,H,R,{sik:26,renk:[44,38,26],alfa:.6,kalin:1,lek:4}); hat3(P,H,MUREKKEP,.5,1.1,9380,2,1,true);
    duzlemde(P,[-96,0,360],DUZLEM.zemin,()=>{leke(0,0,22,14,[30,24,18],.6);}); // hasırda delik
    tabanGolgesi(P,isik,S.x-S.r,S.x+S.r,S.z-S.r,S.z+S.r,.65);
    silindir(P,isik,S.x,S.z,S.r,0,S.h,golgele(AHSAP,1.1),9381,{ustRenk:golgele(AHSAP,1.35),dilim:36});
    duzlemde(P,[S.x,S.h,S.z],DUZLEM.ust,()=>{for(let i=0;i<5;i++){c.strokeStyle='rgba(40,30,20,.3)'; c.lineWidth=.6; c.beginPath(); c.moveTo(-S.r+4,-24+i*12); c.quadraticCurveTo(0,-22+i*12+(i%2?2:-2),S.r-4,-24+i*12); c.stroke();} leke(8,-6,16,10,[0,0,0],.18);});
    tas(P,isik,S.x-14,S.h,S.z-6,{r:9,h:5,ic:[70,62,50],tohum:9382,renk:[150,148,140]});
    tas(P,isik,S.x+14,S.h,S.z+12,{r:8,h:4.5,tohum:9383,renk:[150,148,140]});
    for(let i=0;i<3;i++){const x=S.x-26+i*4, z=S.z+16; hat3(P,[[x,S.h+.4,z],[x+16,S.h+.4,z-10+i*2]],[120,100,72],.95,1.6,9384+i,1,.2); const e=P.n(x,S.h+.4,z); tabana(); c.fillStyle='rgb(110,92,66)'; c.beginPath(); c.ellipse(e[0],e[1],3.4,1.6,-.3,0,TAU); c.fill();}
    // kapının yanında güğüm, solda köşede su testisi yerine boş bakraç
    gugum(P,SAG-34,K.z1+20,{tohum:9390,isikSol:true});
    tas(P,isik,-228,0,316,{r:12,h:10,tohum:9391,renk:[110,100,86]});
    besik(P,R);
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.09,leke:.1});
    huzme(P,r,[[PEN.x0,PEN.y1,ARKA],[-136,PEN.y1,ARKA],[-40,0,270],[-180,0,270]],[-150,150,ARKA],[-110,0,280],.13,120);
    karanlik([[1000,520,240,300,.55],[1000,60,300,180,.5],[0,60,240,160,.45],[1000,750,300,140,.45],[0,750,240,120,.35]]);
  }
};
