// İfade panosu: her köylünün her duygudaki durağan karesi yan yana (ifade katmanını denemek için).
import {hedefAyarla} from '/src/cizim/teknik/tuval.js';
import {leke} from '/src/cizim/teknik/firca.js';
import {PAL} from '/src/cizim/teknik/palet.js';
import {poz,POZ_NOTR,karakterSec,arkaSac,govde,kafa,ifadeKur,DURUMLAR,DURUM_ADLARI} from '/src/cizim/rig/index.js';
import {gorunusBul} from '/src/icerik/gorunus/index.js';
import {altGovde,cikisKaresi} from '/src/cizim/rig/index.js';
import {GIRIS} from '/src/cizim/sahneler/sorgu-odasi/ayar.js';

const kisiler=Object.values(import.meta.glob('/src/icerik/kisiler/*.js',{eager:true})).map(m=>m.default);
const mizacBul=id=>(kisiler.find(k=>k&&k.id===id)||{}).mizac||null;
const q=new URLSearchParams(location.search);
const kimler=(q.get('kim')||'varsayilan,elif,mahmut,nihat,halil,fadime').split(',');
const durumlar=(q.get('durum')||DURUMLAR.join(',')).split(',');
const siddet=+(q.get('siddet')||.8), etiket=q.get('etiket')!=='0', govdeli=q.get('kadraj')==='govde';
const KADRAJ=govdeli?{x0:-380,y0:130,w:760,h:900}:{x0:-190,y0:330,w:380,h:400}, KAFA_Y=470;
document.documentElement.style.setProperty('--oran',`${KADRAJ.w}/${KADRAJ.h}`);
if(q.get('hucre')) document.documentElement.style.setProperty('--hucre',q.get('hucre')+'px');
const NOTR={...poz};

export function ciz(kc,W,H){
  hedefAyarla(kc);
  const s=Math.min(W/KADRAJ.w,H/KADRAJ.h);
  kc.setTransform(s,0,0,s,W/2-(KADRAJ.x0+KADRAJ.w/2)*s,-KADRAJ.y0*s);
  kc.fillStyle='#121513'; kc.fillRect(KADRAJ.x0-20,KADRAJ.y0-20,KADRAJ.w+40,KADRAJ.h+40);
  leke(-240,260,460,380,PAL.lamba,.1); leke(320,760,380,520,PAL.siyah,.55);
  kc.save(); kc.translate(0,KAFA_Y); arkaSac(); kc.restore();
  govde();
  kc.save(); kc.translate(0,KAFA_Y); kafa(); kc.restore();
}
const tablo=document.getElementById('pano');
// ?gecis=sakin:0@0,ofkeli:1@.5,tepki@3&kim=elif&kare=40: tek köylü, 10 fps kare dizisi (sıçrama denetimi için).
// 'tepki' adımı çok gergin, göz kaçıran, duraksayan bir tepki oynatır; 'konus' adımı 1.2 sn ağzı açıp kapar.
const gecis=q.get('gecis');
if(gecis){
  const id=kimler[0], v=gorunusBul(id), mizac=q.get('mizac')||mizacBul(id), kare=+(q.get('kare')||40);
  const adimlar=gecis.split(',').map(a=>{const [ne,z]=a.split('@'); const [d,s]=ne.split(':'); return {d,s:+(s||.8),z:+z,yapildi:false};});
  karakterSec(v===null?undefined:v);
  Object.assign(poz,NOTR,POZ_NOTR,{nefes:.5,sallanti:0,kaynama:0,isik:1});
  const f=ifadeKur({mizac,tohum:+(q.get('tohum')||7)});
  let tr=null, konusBas=-9;
  for(let i=0;i<kare;i++){
    const z=i*.1;
    for(const a of adimlar) if(!a.yapildi&&z>=a.z-1e-9){a.yapildi=true;
      if(a.d==='tepki') f.tepkiOyna({gerginlik:.85,duzey:'cok-gergin',gozKacirma:true,duraksama:true});
      else if(a.d==='konus') konusBas=z;
      else if(a.d==='kalk') f.kalk();
      else f.hedefle(a.d,a.s);}
    for(let j=0;j<6;j++){ const zz=z+j/60; poz.agizAc=zz-konusBas>0&&zz-konusBas<1.2?.45+.35*Math.sin(zz*23):0; f.guncelle(1/60,poz); }
    if(i%10===0){tr=document.createElement('tr'); tablo.append(tr);}
    const td=document.createElement('td'), cv=document.createElement('canvas'); td.append(cv); tr.append(td);
    if(etiket){const p=document.createElement('div'); p.textContent=z.toFixed(1); td.append(p);}
    const W=Math.round(KADRAJ.w*.8), H=Math.round(KADRAJ.h*.8); cv.width=W; cv.height=H;
    ciz(cv.getContext('2d'),W,H);
  }
}
else if(q.get('cikis')!=null) cikisCiz();
else panoCiz();
// ?cikis&kim=elif: kalkıp gitmenin kareleri, sorgu odasının figür dönüşümüyle (sahne dosyası değişmeden önce denemek için)
function cikisCiz(){
  const id=kimler[0], v=gorunusBul(id), f=ifadeKur({mizac:mizacBul(id),tohum:7});
  karakterSec(v===null?undefined:v); Object.assign(poz,NOTR,POZ_NOTR,{nefes:.5,sallanti:0,kaynama:0,isik:1});
  f.hedefle('uzgun',.6); f.yerles(poz); f.kalk();
  let tr=null;
  for(let i=0;i<36;i++){
    for(let j=0;j<12;j++) f.guncelle(1/60,poz);
    const Gi=f.cikis, z=(i+1)*.2;
    if(i%9===0){tr=document.createElement('tr'); tablo.append(tr);}
    const td=document.createElement('td'), cv=document.createElement('canvas'); td.append(cv); tr.append(td);
    const p=document.createElement('div'); p.textContent=z.toFixed(1); td.append(p);
    cv.width=300; cv.height=300; cv.style.width='190px'; cv.style.aspectRatio='1';
    const kc=cv.getContext('2d'); hedefAyarla(kc);
    const sc=300/1200; kc.setTransform(sc,0,0,sc,150,0);
    kc.fillStyle='#121513'; kc.fillRect(-700,0,1400,1200);
    const s=1/(1+Gi.d*GIRIS.uzakOlcek), fx=GIRIS.kapiX*Math.pow(Gi.d,1.3)+Gi.sal*GIRIS.adimSalinim*s, fy=KAFA_Y-GIRIS.ayaktaFark*s*Gi.ayakta-Gi.zip*GIRIS.adimZiplama*s;
    if(Gi.gorun>.01){
      kc.save(); kc.globalAlpha=Gi.gorun; kc.translate(fx,fy); kc.scale(s,s); kc.translate(0,-KAFA_Y);
      altGovde(); kc.save(); kc.translate(0,KAFA_Y); arkaSac(); kc.restore(); govde(); kc.save(); kc.translate(0,KAFA_Y); kafa(); kc.restore();
      kc.restore();
      kc.fillStyle=`rgba(2,3,3,${Gi.karart*Gi.gorun})`; kc.fillRect(-700,0,1400,1200); // kabaca: sahne yalnızca figürü karartır
    }
    kc.fillStyle='#2a2118'; kc.fillRect(-700,940,1400,260); // masa
  }
  void cikisKaresi;
}
function panoCiz(){
if(etiket){const tr=document.createElement('tr'); tr.append(document.createElement('th')); for(const d of durumlar){const th=document.createElement('th'); th.textContent=DURUM_ADLARI[d]||d; tr.append(th);} tablo.append(tr);}
for(const id of kimler){
  const v=gorunusBul(id)||gorunusBul('varsayilan'); const mizac=q.get('mizac')||mizacBul(id);
  const tr=document.createElement('tr');
  if(etiket){const th=document.createElement('th'); th.textContent=`${id} (${mizac||'-'})`; tr.append(th);}
  for(const d of durumlar){
    const td=document.createElement('td'), cv=document.createElement('canvas'); td.append(cv); tr.append(td);
    const W=Math.round(KADRAJ.w*1.2), H=Math.round(KADRAJ.h*1.2); cv.width=W; cv.height=H;
    karakterSec(v===null?undefined:v);
    Object.assign(poz,NOTR,POZ_NOTR,{nefes:.5,sallanti:0,kaynama:0,isik:1});
    const f=ifadeKur({mizac,tohum:7}); f.hedefle(d,siddet); f.yerles(poz);
    ciz(cv.getContext('2d'),W,H);
  }
  tablo.append(tr);
}
}
document.body.dataset.hazir='1';
