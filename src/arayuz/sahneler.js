// Sahne bağdaştırıcıları: her çizim modülünü sahne yöneticisinin anladığı {baslat, durdur} biçimine sokar.
// Hepsi tek ortak canvas'a (tuval.js `cv`) çizer.
import {cv,ana,hedefAyarla} from '../cizim/teknik/tuval.js';
import {masaZemini} from '../cizim/sahneler/olay-yeri/masa-zemini.js';
import {sorguOdasiBaslat,sorguOdasiDurdur} from '../cizim/sahneler/sorgu-odasi/sahne.js';

export const dprAl=()=>Math.min(globalThis.devicePixelRatio||1,2.5);

// Canvas'ı CSS boyutuna ve aygıt oranına göre kurar. Çizilemezse (gizli, sıfır boy) false.
export function tuvalOlc(){
  const w=cv.clientWidth, h=cv.clientHeight, d=dprAl();
  if(w<8||h<8) return null;
  const W=Math.round(w*d), H=Math.round(h*d);
  if(cv.width!==W) cv.width=W;
  if(cv.height!==H) cv.height=H;
  return {w,h,d};
}

// Masa zemini ön belleği: boyut değişmedikçe yeniden çizilmez.
let masaOn=null;
export function masaCiz(k,w,h,d){
  const anahtar=`${w}x${h}@${d}`;
  if(!masaOn||masaOn.anahtar!==anahtar){
    const t=document.createElement('canvas'); t.width=Math.round(w*d); t.height=Math.round(h*d);
    const kc=t.getContext('2d'); kc.setTransform(d,0,0,d,0,0);
    masaZemini(kc,w,h,7);
    masaOn={anahtar,t};
    hedefAyarla(ana);
  }
  k.save(); k.setTransform(1,0,0,1,0,0); k.drawImage(masaOn.t,0,0); k.restore();
}

// Durağan sahne: döngü yok; yalnızca başlarken, boyut değişince ve `yenile()` çağrılınca çizer.
//   ciz(k, w, h, d): k CSS pikseli biriminde kurulmuş bağlam
export function durganSahne(ciz){
  let istek=0, acik=false;
  const boya=()=>{
    istek=0; if(!acik) return;
    const o=tuvalOlc(); if(!o) return;
    const k=ana; hedefAyarla(ana);
    k.setTransform(o.d,0,0,o.d,0,0); k.globalAlpha=1; k.globalCompositeOperation='source-over';
    ciz(k,o.w,o.h,o.d);
  };
  const iste=()=>{if(!istek) istek=requestAnimationFrame(boya);};
  return {
    baslat(){acik=true; addEventListener('resize',iste); boya();},
    durdur(){acik=false; removeEventListener('resize',iste); cancelAnimationFrame(istek); istek=0;},
    yenile:iste,
    hemen:boya,
  };
}

export const masaSahnesi=(ust=null)=>durganSahne((k,w,h,d)=>{masaCiz(k,w,h,d); if(ust) ust(k,w,h,d);});
export const karanlikSahne=()=>durganSahne((k,w,h)=>{k.fillStyle='#050606'; k.fillRect(0,0,w,h);});

export const sorguSahnesi=({giris=true}={})=>({
  baslat(){sorguOdasiBaslat({giris});},
  durdur(){sorguOdasiDurdur();},
});

// Son sahneleri (kayıp, pencere) oyunun sonunda gerekir: ayrı parça olarak, ilk kullanımda yüklenir.
const kayipModul=()=>import('../cizim/sahneler/kayip/sahne.js');
const pencereModul=()=>import('../cizim/sahneler/pencere/sahne.js');

// Kayıp sahnesi: o = kayipSahnesi seçenekleri (kisi, katilMi, tohum, metin, bekleyenler, yaz, bitti)
// Not: kayipSahnesi başlangıcı performance.now() ile, kareleri rAF zaman damgasıyla ölçer; ilk karenin damgası
// başlangıçtan önce kalırsa zaman eksiye düşer ve boş ön belleğe çizmeye çalışır. Bir kare içinde başlatınca
// sonraki karenin damgası hep sonra gelir.
export function kayipSahne(o){
  let s=null, istek=0, acik=false;
  return {
    baslat(){
      acik=true;
      kayipModul().then(m=>{
        if(!acik) return;
        istek=requestAnimationFrame(()=>{istek=0; if(!acik) return; s=m.kayipSahnesi({...o,tuval:cv}); s.oynat();});
      },e=>console.error(e));
    },
    durdur(){acik=false; cancelAnimationFrame(istek); istek=0; s?.durdur(); s=null;},
  };
}

export function pencereSahne(o){
  let s=null, acik=false;
  return {
    baslat(){acik=true; pencereModul().then(m=>{if(acik) s=m.pencereBaslat({...o});},e=>console.error(e));},
    durdur(){acik=false; s?.durdur(); s=null;},
  };
}

// Sona yaklaşınca (karar ekranı) önceden yükle.
export function sonSahneleriHazirla(){kayipModul(); pencereModul();}
