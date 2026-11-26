// Pencere sahnesi: müfettiş karanlık odada pencereye yürür, aşağıda meydandaki kalabalığa bakar.
// Kalabalığın tavrı doğru bulunan katil sayısına bağlıdır; sayı hiçbir yerde yazmaz.
import {cv,ana,c,tuvalKur,hedefAyarla} from '../../teknik/tuval.js';
import {gor,gorunumOlc,sahneDonusumu,onBellek} from '../../teknik/gorunum.js';
import {leke} from '../../teknik/firca.js';
import {kumOlustur,kaplama} from '../../teknik/kaplama.js';
import {lerp,clamp,yumusak} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {azHareket} from '../../../platform/tercih.js';
import {OLCU,ZAMAN,MUFETTIS,RENK} from './ayar.js';
import {Y,yerlesimKur,camNokta} from './yerlesim.js';
import {kalabalikKur,kalabalikCiz,zeminIsigi,alevler,titre,ortalamaIsik} from './kalabalik.js';
import {disArka,disIsik,disDonusum} from './dis.js';
import {odaArka,dograma,masa,odaIsigi,masaIsigi,penYolu,camYolu} from './oda.js';
import {mufettis} from './mufettis.js';
import {tasPlani,sonCarpma,camIzleri,ucanlar,irkilme} from './tas.js';

/* Müfettişin t anındaki durumu (saf işlev). */
function mufettisDurumu(t,plan,isik,renk){
  const Z=ZAMAN, M=Y.muf, [kx,ky]=Y.kn;
  const y=clamp((t-Z.yuru[0])/(Z.yuru[1]-Z.yuru[0]),0,1), yy=.5-.5*Math.cos(y*Math.PI), d=1-yy;
  const s=1/(1+d*(1/M.sBas-1));
  const genlik=Math.min(1,y*5,(1-y)*5);
  const faz=yy*MUFETTIS.yuruAdim, sal=Math.sin(faz*Math.PI)*genlik, zip=Math.abs(sal);
  const x=kx+lerp(M.Xbas,M.Xson,yy)*s+sal*14*s;
  const yo=ky+M.Yomuz*s-zip*MUFETTIS.ziplama*s;
  return {x,y:yo,s,don:sal*MUFETTIS.salinim,gorun:yumusak(Z.belir[0],Z.belir[1],t),egil:yumusak(Z.egil[0],Z.egil[1],t),
    irk:irkilme(plan,t),isik:isik*Math.pow(1-d,1.6),renk};
}

/* dogru: 0..7, tohum: sayı, tuval: canvas (verilmezse tuvalKur önceden yapılmış olmalı),
   bitince: sahne son durumuna varınca bir kez çağrılır, zaman: sınamada kareyi sabitlemek için () => saniye.
   Döner: {durdur, bitis} */
export function pencereBaslat({dogru=7,tohum=1,tuval=null,bitince=null,zaman=null}={}){
  if(tuval) tuvalKur(tuval);
  if(!cv) throw new Error('pencereBaslat: tuval yok');
  dogru=clamp(Math.round(dogru),0,7);
  const KL=kalabalikKur(dogru,tohum), plan=tasPlani(KL,dogru,tohum), ort=ortalamaIsik(KL);
  const bitis=plan.length?Math.max(ZAMAN.bitisEnAz,sonCarpma(plan)+ZAMAN.bitisBekle):ZAMAN.bitisEnAz;
  const isikRenk=[0,1,2].map(i=>lerp(ort.renk[i],RENK.kirliSari[i],.25));
  const kir=(()=>{const r=rng(tohum*17+3), l=[]; for(let i=0;i<14;i++) l.push([r(),r(),.04+r()*.12,.03+r()*.1,.05+r()*.1,r()<.6]); return l;})();
  let odaT=null, disT=null, dogT=null, masaT=null;
  function boyutla(){
    if(!gorunumOlc(OLCU)) return;
    yerlesimKur();
    odaT=onBellek(odaArka); disT=onBellek(()=>disArka(tohum)); dogT=onBellek(dograma); masaT=onBellek(masa);
  }
  function ciz(t){
    const hareket=!azHareket, tt=hareket?t:0, kaynama=hareket?Math.floor(t*OLCU.kaynamaHizi)%64:0;
    hedefAyarla(ana);
    c.setTransform(1,0,0,1,0,0); c.drawImage(odaT,0,0);
    sahneDonusumu(c);
    const cakma=plan.reduce((m,A)=>{const g=t-A.t; return g>=0&&g<.25?Math.max(m,1-g/.25):m;},0);
    const I=ort.guc*lerp(titre(tt,1.3,true),titre(tt,1.3,false),ort.ofkePay)*(1+cakma*.35);
    odaIsigi(isikRenk,I);
    // dışarısı: cam şekline kırpılır
    c.save(); c.beginPath(); penYolu(); c.clip(); c.beginPath(); camYolu(); c.clip();
    c.setTransform(1,0,0,1,0,0); c.drawImage(disT,0,0); sahneDonusumu(c);
    disIsik(ort.renk,tt,I,ort.ofkePay);
    c.save(); disDonusum(); zeminIsigi(KL,tt,1); kalabalikCiz(KL,tt,hareket,kaynama,1); alevler(KL,tt,hareket,1); c.restore();
    if(hareket) ucanlar(plan,t);
    // eski cam: yeşilimsi, kirli, yer yer bulanık
    c.beginPath(); camYolu(); c.fillStyle='rgba(60,70,58,.07)'; c.fill();
    for(const [a,b,rx,ry,al,koyu] of kir){const [x,y,s]=camNokta(a,b), B=(Y.pen.yaAlt[1]-Y.pen.yaUst[1])*s/Y.pencere.sYakin; leke(x,y,rx*B*.6,ry*B,koyu?RENK.camKir:RENK.cam,al);}
    c.restore();
    camIzleri(plan,t,kaynama);
    c.setTransform(1,0,0,1,0,0); c.drawImage(dogT,0,0); sahneDonusumu(c);
    mufettis(mufettisDurumu(t,plan,I,isikRenk),kaynama);
    c.setTransform(1,0,0,1,0,0); c.drawImage(masaT,0,0); sahneDonusumu(c);
    masaIsigi(isikRenk,I);
    const ac=hareket?yumusak(ZAMAN.acilis[0],ZAMAN.acilis[1],t):1;
    if(ac<1){c.fillStyle=`rgba(0,0,0,${1-ac})`; c.fillRect(-Y.G-10,Y.ust-10,Y.G*2+20,OLCU.yukseklik-Y.ust+20);}
    kaplama(t);
  }

  let bas=null, kareNo=0, bitti=false, durdu=false, zamanlayici=null;
  const haber=()=>{if(!bitti){bitti=true; if(bitince) bitince();}};
  function kare(ms){
    if(durdu) return;
    if(cv.clientWidth!==gor.vw||cv.clientHeight!==gor.vh) boyutla();
    if(bas==null) bas=ms;
    let t=zaman?zaman():(ms-bas)/1000;
    if(azHareket) t=Math.max(t,bitis); // yürüyüş ve taşlar atlanır: son durum
    if(gor.hazir&&odaT){ciz(t); if(!azHareket&&t>=bitis) haber();}
    kareNo=requestAnimationFrame(kare);
  }
  addEventListener('resize',boyutla);
  kumOlustur(); boyutla();
  if(azHareket) zamanlayici=setTimeout(haber,ZAMAN.azHareketBekle*1000);
  kareNo=requestAnimationFrame(kare);
  return {
    bitis,
    durdur(){durdu=true; cancelAnimationFrame(kareNo); clearTimeout(zamanlayici); removeEventListener('resize',boyutla);}
  };
}
export {Y as pencereYerlesimi};
