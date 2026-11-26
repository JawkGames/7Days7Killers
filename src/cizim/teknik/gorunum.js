// Görünüm: ekran boyutu, ölçek ve sahne dönüşümü. Sahne alttan sabit, üstte duvar uzar.
import {cv,c,hedefAyarla} from './tuval.js';

export const gor={vw:0,vh:0,dpr:1,S:1,ustY:0,yarimG:0,payPx:0,yukseklik:1200,hazir:false};

// olcu = {yukseklik, enAzGenislik, pay}. Çizilebilir durumdaysa true döner.
export function gorunumOlc(olcu){
  // pano gizliyken ya da henüz açılmamışken boyut 0 gelir: o hâlde çizme (yoksa ölçek 0 olur, döngüler sonsuza gider)
  if(cv.clientWidth<8||cv.clientHeight<8){gor.hazir=false; gor.vw=cv.clientWidth; gor.vh=cv.clientHeight; return false;}
  gor.hazir=true;
  gor.yukseklik=olcu.yukseklik;
  gor.dpr=Math.min(window.devicePixelRatio||1,2.5);
  gor.vw=cv.clientWidth; gor.vh=cv.clientHeight;
  cv.width=Math.max(1,Math.round(gor.vw*gor.dpr)); cv.height=Math.max(1,Math.round(gor.vh*gor.dpr));
  gor.S=Math.min(gor.vh/olcu.yukseklik, gor.vw/olcu.enAzGenislik);
  gor.yarimG=gor.vw/2/gor.S; gor.ustY=olcu.yukseklik-gor.vh/gor.S; gor.payPx=Math.ceil(olcu.pay*gor.S*gor.dpr);
  return true;
}
export function sahneDonusumu(k){k.setTransform(gor.dpr*gor.S,0,0,gor.dpr*gor.S,gor.vw/2*gor.dpr,(gor.vh-gor.yukseklik*gor.S)*gor.dpr);}
export function onBellek(fn){ // kamera kayınca kenar açılmasın diye iki yandan paylı çizilir
  const k=document.createElement('canvas'); k.width=cv.width+gor.payPx*2; k.height=cv.height;
  const eski=c, kc=k.getContext('2d'); hedefAyarla(kc);
  kc.setTransform(gor.dpr*gor.S,0,0,gor.dpr*gor.S,gor.vw/2*gor.dpr+gor.payPx,(gor.vh-gor.yukseklik*gor.S)*gor.dpr); fn(); hedefAyarla(eski); return k;
}
