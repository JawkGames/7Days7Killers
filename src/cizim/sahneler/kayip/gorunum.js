// Kayıp sahnesinin görünümü. Sorgu odasındakinden farkı: dikey ekranda fazla yükseklik
// yalnızca üste değil, bir kısmı alta da verilir; alt yazı sahnenin altındaki karanlık zemine oturur.
import {hedefAyarla} from '../../teknik/tuval.js';
import {OLCU} from './ayar.js';

export const gk={vw:0,vh:0,dpr:1,S:1,ustY:0,altY:1200,yarimG:0,payPx:0,hazir:false};

export function olc(cv){
  if(cv.clientWidth<8||cv.clientHeight<8){gk.hazir=false; gk.vw=cv.clientWidth; gk.vh=cv.clientHeight; return false;}
  gk.hazir=true;
  gk.dpr=Math.min(window.devicePixelRatio||1,2.5);
  gk.vw=cv.clientWidth; gk.vh=cv.clientHeight;
  cv.width=Math.max(1,Math.round(gk.vw*gk.dpr)); cv.height=Math.max(1,Math.round(gk.vh*gk.dpr));
  const B=OLCU.kadrajBoy, U=OLCU.kadrajUst;
  gk.S=Math.min(gk.vh/B, gk.vw/OLCU.enAzGenislik);
  const fazla=Math.max(0,gk.vh/gk.S-B);
  gk.ustY=U-fazla*OLCU.ustPay; gk.altY=U+B+fazla*(1-OLCU.ustPay);
  gk.yarimG=gk.vw/2/gk.S; gk.payPx=Math.ceil(OLCU.pay*gk.S*gk.dpr);
  return true;
}

// sahne birimlerinden aygıt pikseline; pay: ön bellek kenar payı (piksel)
export function donusum(k,payPx){k.setTransform(gk.dpr*gk.S,0,0,gk.dpr*gk.S,gk.vw/2*gk.dpr+(payPx||0),-gk.ustY*gk.S*gk.dpr);}

// kamera kayınca kenar açılmasın diye iki yandan paylı ön bellek
export function onBellek(cv,fn){
  const k=document.createElement('canvas'); k.width=cv.width+gk.payPx*2; k.height=cv.height;
  const kc=k.getContext('2d'); hedefAyarla(kc); donusum(kc,gk.payPx); fn(); return k;
}

// görünen alanın sahne birimlerindeki kutusu (pay dahil)
export function gorunurKutu(){const G=gk.yarimG+OLCU.pay; return [-G,gk.ustY,G,gk.altY];}
