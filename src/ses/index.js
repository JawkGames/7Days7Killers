// Ses katmanı: dış arayüz. Ayrıntı ve olay adları: src/ses/README.md
//
//   import {sesBaslat, ortam, efekt, duzey, sustur, sesOlaylaraBagla} from './ses/index.js';
//   sesBaslat();                       // ilk dokunmada bağlamı açar, sayfa gizlenince duraklatır
//   ortam('sorgu-odasi', {gecis: 2});
//   efekt('kapi-ac');
//
// Hiçbir ses dosyası yoktur; her şey Web Audio ile üretilir. Destek yoksa her işlev sessizce boşa düşer.

import {sesMotoru} from './motor.js';
import {EFEKTLER,ORTAMLAR,ORTAM_OLAYLARI} from './tarif.js';

export {sesMotoru,EFEKTLER,ORTAMLAR,ORTAM_OLAYLARI};

let motor=null;
const m=()=>motor??(motor=sesMotoru());

// Ortak motoru kurar (bir kez) ve ilk kullanıcı hareketini bekler. ops: sesMotoru seçenekleri (tohum, duzey ...).
// Bırakıcı döndürür (dinleyicileri kaldırır; motoru kapatmaz).
export function sesBaslat(ops){
  if(!motor) motor=sesMotoru(ops);
  return motor.baslat();
}

export const sesAc=()=>m().ac();
export const ortam=(ad,ops)=>m().ortam(ad,ops);
export const ortamOrani=(o,ops)=>m().oran(o,ops);
export const efekt=(ad,ops)=>m().efekt(ad,ops);
export const duzey=v=>m().duzey(v);
export const sustur=b=>m().sustur(b);
export const kis=(miktar,ops)=>m().kis(miktar,ops);
export const sesDurumu=()=>m().durum();
export const sesMotoruAl=()=>m();

// Oyun sahnesi -> ortam.
export const SAHNE_ORTAM=Object.freeze({
  sorgu:'sorgu-odasi','sorgu-odasi':'sorgu-odasi',cagirma:'sorgu-odasi',
  fotograf:'fotograf-masasi','fotograf-masasi':'fotograf-masasi','gun-basi':'fotograf-masasi',
  'gun-sonu':'gece-koy','gece-koy':'gece-koy',
  kayip:'kayip',karar:'kayip',aciklama:'kayip',
  pencere:'pencere','pencere-cosku':'pencere-cosku','pencere-ofke':'pencere-ofke'
});

// Oyun olayı -> efekt.
export const OLAY_EFEKT=Object.freeze({
  'kapi.acildi':'kapi-ac',
  'kapi.kapandi':'kapi-kapa',
  'sandalye.cekildi':'sandalye',
  'adim':'adim',
  'defter.sayfa':'sayfa',
  'defter.yazildi':'kalem',
  'iz.bulundu':'iz',
  'zaman.gun':'gun',
  'zaman.geriSar':'geri-sar',
  'hukum.verildi':'hukum'
});

const nesne=v=>v&&typeof v==='object'?v:{};
const BOSLUK=/^\s*$/;

// Pencere oranı: {oran} ya da {dogru, toplam=7} -> 0 (hepsi doğru, coşku) .. 1 (hepsi yanlış, öfke).
export function pencereOrani(v){
  const o=nesne(v);
  if(Number.isFinite(o.oran)) return Math.min(1,Math.max(0,o.oran));
  if(Number.isFinite(o.dogru)){const t=Number.isFinite(o.toplam)&&o.toplam>0?o.toplam:7; return Math.min(1,Math.max(0,1-o.dogru/t));}
  return undefined;
}

// Ortak olay kanalına (cekirdek/olay.js) bağlanır. Bırakıcı döndürür.
// ses: sesMotoru() nesnesi (verilmezse ortak motor). Olay adları README'de.
export function sesOlaylaraBagla(olaylar,{ses}={}){
  if(!olaylar||typeof olaylar.abone!=='function') return ()=>{};
  const s=()=>ses??m();
  const birakicilar=[];
  const dinle=(ad,fn)=>birakicilar.push(olaylar.abone(ad,fn));

  // doğrudan denetim
  dinle('ses.ortam',v=>{
    if(typeof v==='string'||v===null) return s().ortam(v);
    const o=nesne(v); s().ortam(o.ad,o);
  });
  dinle('ses.efekt',v=>{
    if(typeof v==='string') return s().efekt(v);
    const o=nesne(v); s().efekt(o.ad,o);
  });
  dinle('ses.duzey',v=>s().duzey(typeof v==='object'?v?.duzey:v));
  dinle('ses.sustur',v=>s().sustur(typeof v==='object'&&v!==null?v.sessiz:v));
  dinle('ses.kis',v=>{if(typeof v==='number') s().kis(v); else {const o=nesne(v); s().kis(o.miktar,o);}});
  dinle('ses.ac',()=>s().ac());

  // oyunun anlamlı olayları
  dinle('sahne.degisti',v=>{
    const o=typeof v==='string'?{sahne:v}:nesne(v);
    const ad=SAHNE_ORTAM[o.sahne];
    if(!ad) return;
    s().ortam(ad,{...o,oran:o.sahne==='pencere'?pencereOrani(o):o.oran});
  });
  dinle('pencere.oran',v=>{const o=pencereOrani(typeof v==='number'?{oran:v}:v); if(o!==undefined) s().oran(o,nesne(v));});
  dinle('konusma.harf',v=>{
    const harf=typeof v==='string'?v:nesne(v).harf;
    if(typeof harf==='string'&&BOSLUK.test(harf)) return;
    s().efekt('daktilo',{siddet:nesne(v).siddet});
  });
  for(const [olay,ad] of Object.entries(OLAY_EFEKT)){
    dinle(olay,v=>{const o=nesne(v); s().efekt(ad,{siddet:o.siddet,tohum:o.tohum,sayi:o.sayi});});
  }

  return ()=>{for(const b of birakicilar.splice(0)) b();};
}
