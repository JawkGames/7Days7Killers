// Sürüm numaralı kayıt. Depoya şu zarf yazılır: {surum, kayitZamani, veri}.
// Eski sürümden kalan kayıt `gocler` tablosuyla adım adım bugünkü sürüme taşınır.
// Hiçbir işlev hata atmaz: sonuç her zaman {tamam:true, ...} ya da {tamam:false, neden, ...} olur.
//
// Depo bağdaştırıcısı: {oku(anahtar), yaz(anahtar, metin), sil(anahtar)}. Eşzamanlı (localStorage)
// ya da Promise döndüren (Capacitor Preferences) olabilir; bu yüzden kaydet/yukle/sil hep Promise döndürür.

import {AYARLAR} from '../cekirdek/ayarlar.js';
import {zamanSorunu} from '../cekirdek/zaman.js';

export const KAYIT_SURUMU=1;

// gocler[n]: n sürümündeki veriyi alır, n+1 sürümündeki veriyi döndürür. Saf işlev olmalı.
// Örnek (ileride): 1: v=>({...v, tercihler:{...v.tercihler, yaziBoyu:'orta'}}),
export const gocler=Object.freeze({});

// Sürüm 1 şeması:
// {
//   tohum: sayı,                 // kasabanın tohumu (zaman.tohum ile aynı)
//   dongu: tam sayı >= 1,        // kaçıncı döngü (zaman.dongu ile aynı)
//   zaman: cekirdek/zaman.js durumu,
//   defter: nesne,               // şimdilik opak; diyalog/defter belirleyecek
//   tercihler: {dil: metin, azHareket: true|false|null}
// }
export function kayitSorunu(v){
  if(!v||typeof v!=='object'||Array.isArray(v)) return 'veri nesne değil';
  const z=zamanSorunu(v.zaman);
  if(z) return `zaman: ${z}`;
  if(v.tohum!==v.zaman.tohum) return 'tohum zamanla uyuşmuyor';
  if(v.dongu!==v.zaman.dongu) return 'döngü zamanla uyuşmuyor';
  if(!v.defter||typeof v.defter!=='object') return 'defter nesne değil';
  const t=v.tercihler;
  if(!t||typeof t!=='object') return 'tercihler nesne değil';
  if(typeof t.dil!=='string'||!t.dil) return 'dil metin değil';
  if(t.azHareket!==null&&typeof t.azHareket!=='boolean') return 'azHareket true, false ya da null olmalı';
  return null;
}

// Zaman durumundan kayıt verisi kurar (tohum ve döngü zamandan alınır, uyumsuzluk olmasın).
export function kayitVerisi({zaman,defter={},tercihler=AYARLAR.tercihler}){
  return {tohum:zaman.tohum,dongu:zaman.dongu,zaman,defter,tercihler:{...AYARLAR.tercihler,...tercihler}};
}

// Bellek içi depo (testler ve depolamanın hiç olmadığı ortamlar için).
export function bellekDepo(ilk={}){
  const m=new Map(Object.entries(ilk));
  return {
    oku:k=>m.has(k)?m.get(k):null,
    yaz:(k,v)=>{m.set(k,String(v));},
    sil:k=>{m.delete(k);},
    ham:m,
  };
}

// localStorage bağdaştırıcısı. localStorage'a erişmek bile hata atabilir (gizli pencere,
// engellenmiş site verisi); bu yüzden her işlemde ayrı ayrı alınır.
export function localStorageDepo(al=()=>globalThis.localStorage){
  const ls=()=>{const d=al(); if(!d) throw new Error('localStorage yok'); return d;};
  return {
    oku:k=>ls().getItem(k),
    yaz:(k,v)=>ls().setItem(k,v),
    sil:k=>ls().removeItem(k),
  };
}

// Capacitor Preferences için (Android'e geçilince):
//   const depo={oku:k=>Preferences.get({key:k}).then(r=>r.value), yaz:(k,v)=>Preferences.set({key:k,value:v}), sil:k=>Preferences.remove({key:k})};

function doluMu(e){
  if(!e) return false;
  const ad=String(e.name||''), kod=e.code;
  return /quota/i.test(ad)||kod===22||kod===1014||ad==='NS_ERROR_DOM_QUOTA_REACHED';
}

export function kayitKur({
  depo=localStorageDepo(),
  anahtar=AYARLAR.kayit.anahtar,
  saat=()=>Date.now(),
  surum=KAYIT_SURUMU,
  gocTablosu=gocler,
  dogrula=kayitSorunu, // null ya da sorun metni döndürür
}={}){

  async function kaydet(veri,{kayitZamani=saat()}={}){
    const sorun=dogrula(veri);
    if(sorun) return {tamam:false,neden:'gecersiz-veri',ayrinti:sorun};
    let metin;
    try{metin=JSON.stringify({surum,kayitZamani,veri});}
    catch(e){return {tamam:false,neden:'gecersiz-veri',ayrinti:String(e?.message||e)};}
    try{await depo.yaz(anahtar,metin);}
    catch(e){return {tamam:false,neden:doluMu(e)?'depo-dolu':'depo-erisilemez',hata:e};}
    return {tamam:true,surum,kayitZamani};
  }

  async function yukle(){
    let metin;
    try{metin=await depo.oku(anahtar);}
    catch(e){return {tamam:false,neden:'depo-erisilemez',hata:e};}
    if(metin==null) return {tamam:false,neden:'kayit-yok'};

    let zarf;
    try{zarf=JSON.parse(metin);}
    catch{return {tamam:false,neden:'bozuk',ayrinti:'JSON okunamadı',ham:metin};}
    if(!zarf||typeof zarf!=='object'||!Number.isInteger(zarf.surum)||zarf.surum<1||!('veri' in zarf))
      return {tamam:false,neden:'bozuk',ayrinti:'zarf biçimi hatalı',ham:metin};
    if(zarf.surum>surum) return {tamam:false,neden:'gelecek-surum',surum:zarf.surum,beklenen:surum};

    let veri=zarf.veri;
    for(let s=zarf.surum;s<surum;s++){
      const goc=gocTablosu[s];
      if(typeof goc!=='function') return {tamam:false,neden:'goc-yok',surum:s};
      try{veri=goc(veri);}
      catch(e){return {tamam:false,neden:'goc-hatasi',surum:s,hata:e};}
    }
    const sorun=dogrula(veri);
    if(sorun) return {tamam:false,neden:'sema-hatasi',ayrinti:sorun,surum:zarf.surum};
    return {tamam:true,veri,surum,eskiSurum:zarf.surum,gocEdildi:zarf.surum!==surum,kayitZamani:zarf.kayitZamani??null};
  }

  async function sil(){
    try{await depo.sil(anahtar);}
    catch(e){return {tamam:false,neden:'depo-erisilemez',hata:e};}
    return {tamam:true};
  }

  return {kaydet,yukle,sil};
}

// Varsayılan kayıt (localStorage, AYARLAR.kayit.anahtar). Depoya ilk işlemde erişilir, içe aktarmak güvenlidir.
export const {kaydet,yukle,sil}=kayitKur();
