// Cümle kalıbı motoru: simülasyon verisini dil dosyasındaki kalıplarla cümleye döker.
// Saf işlevler. Rastgelelik yalnız dışarıdan verilen rng ile (src/cekirdek/rastgele.js), Math.random yok.
//
// Kalıp sözdizimi (ayrıntı: src/dil/tr/README.md):
//   {ad}               değeri olduğu gibi koyar
//   {ad:de}            ek getirir  → "değirmende", "Antep'te"
//   {ad:si+de}         ekleri sırayla getirir → "başında"
//   [a|b|c]            satır içi seçenek; rng ile biri seçilir ("[|]" boş seçenek de olur)
// Cümle başı ve ". ", "! ", "? " sonrası büyük harfe çevrilir ("..." sonrası çevrilmez).
import {ekle} from '../dil/tr/ekler.js';
import {MIZACLAR} from '../icerik/kur.js';

const TR='tr';

// Bir mizacın kendi varyantı yoksa sırayla bakılacak yedekler; zincir 'genel'de biter.
export const MIZAC_YEDEGI={
  ofkeli:'sert', gururlu:'sert', sert:'genel',
  kurnaz:'genel', saf:'genel', sakin:'genel', korkak:'genel', dedikoducu:'genel',
};

// rng verilmezse ilk seçenek alınır (belirlenimci). rng: rastgele.js'teki rng(tohum)'un döndürdüğü işlev.
export function sec(liste,rng){
  if(!Array.isArray(liste)||!liste.length) throw new Error('Seçilecek liste boş');
  if(!rng) return liste[0];
  const r=rng();
  if(!(r>=0&&r<1)) throw new Error('rng [0,1) aralığında değer vermeli');
  return liste[Math.floor(r*liste.length)];
}

const SECENEK_RE=/\[([^[\]]*)\]/;
const YER_RE=/\{([^{}]*)\}/g;

// Satır içi seçenekleri çözer (iç içe olanlar içten dışa).
function secenekleriCoz(kalip,rng){
  let s=kalip, m;
  while((m=SECENEK_RE.exec(s))){
    const parca=sec(m[1].split('|'),rng);
    s=s.slice(0,m.index)+parca+s.slice(m.index+m[0].length);
  }
  if(/[[\]]/.test(s)) throw new Error('Kalıpta eşleşmeyen köşeli ayraç: "'+kalip+'"');
  return s;
}

// Kalıptaki yer tutucuları listeler: [{ad, ekler:[...] }]
export function yerTutucular(kalip){
  const tum=kalip.replace(/[[\]|]/g,' ');
  const out=[];
  for(const m of tum.matchAll(YER_RE)){
    const [ad,ekYazi]=m[1].split(':');
    if(!ad||!ad.trim()) throw new Error('Kalıpta adsız yer tutucu: "'+kalip+'"');
    out.push({ad:ad.trim(),ekler:ekYazi?ekYazi.split('+').map(e=>e.trim()).filter(Boolean):[]});
  }
  return out;
}

function duzelt(s){
  s=s.replace(/[ \t]+/g,' ').replace(/ +([,.;:!?…])/g,'$1').trim();
  // Cümle başlarını büyüt; "..." ve "…" sonrası cümle sürüyor sayılır.
  s=s.replace(/(^|[^.][.!?] +)(\p{Ll})/gu,(t,on,h)=>on+h.toLocaleUpperCase(TR));
  return s;
}

/**
 * Tek bir kalıbı doldurur.
 * @param {string} kalip
 * @param {Object<string,string|number|{metin:string,ozelAd?:boolean,iyelikli?:boolean}>} degerler
 * @param {()=>number} [rng]
 */
export function doldur(kalip,degerler={},rng){
  if(typeof kalip!=='string') throw new Error('Kalıp metin olmalı');
  const s=secenekleriCoz(kalip,rng).replace(YER_RE,(t,ic)=>{
    const [ad,ekYazi]=ic.split(':').map(x=>x.trim());
    if(!(ad in degerler)||degerler[ad]==null) throw new Error('Kalıpta eksik değer: {'+ad+'} — "'+kalip+'"');
    const d=degerler[ad];
    if(!ekYazi) return typeof d==='object'?d.metin:String(d);
    try{ return ekle(d,...ekYazi.split('+')); }
    catch(e){ throw new Error(e.message+' — kalıp: "'+kalip+'"',{cause:e}); }
  });
  return duzelt(s);
}

// Mizaca göre kalıp listesini bulur: kendi varyantı → yedek zinciri → genel.
export function varyantBul(tur,mizac){
  if(mizac!=null&&mizac!=='genel'&&!MIZACLAR.includes(mizac)) throw new Error('Bilinmeyen mizaç: '+mizac);
  let m=mizac||'genel';
  const gorulen=new Set();
  while(m&&!gorulen.has(m)){
    gorulen.add(m);
    if(Array.isArray(tur[m])&&tur[m].length) return {mizac:m,kaliplar:tur[m]};
    m=m==='genel'?null:(MIZAC_YEDEGI[m]||'genel');
  }
  throw new Error('Bu bilgi türünde "'+(mizac||'genel')+'" için de "genel" için de kalıp yok');
}

/**
 * Bir bilgi türü için cümle üretir.
 * @param {Object} kume   kalıp kümesi (src/dil/tr/kaliplar.js)
 * @param {string} bilgiTuru  kümedeki anahtar ('yer-zaman', 'gordum'...)
 * @param {{mizac?:string, degerler?:Object, rng?:()=>number}} secenekler
 */
export function cumleKur(kume,bilgiTuru,{mizac,degerler={},rng}={}){
  const tur=kume[bilgiTuru];
  if(!tur) throw new Error('Bilinmeyen bilgi türü: '+bilgiTuru+' (bilinenler: '+Object.keys(kume).join(', ')+')');
  for(const g of tur.degiskenler||[]) if(!(g in degerler)||degerler[g]==null) throw new Error('"'+bilgiTuru+'" için eksik değer: '+g);
  const {kaliplar}=varyantBul(tur,mizac);
  return doldur(sec(kaliplar,rng),degerler,rng);
}

// Bir kalıp kümesini denetler: her kalıp ayrıştırılabiliyor mu, yalnız bildirilen değişkenleri
// ve bilinen ekleri mi kullanıyor, bilinmeyen mizaç anahtarı var mı. Hata listesi döner (boşsa temiz).
export function kumeDenetle(kume,ornekDegerler){
  const hatalar=[];
  for(const [ad,tur] of Object.entries(kume)){
    const izinli=new Set(tur.degiskenler||[]);
    for(const [m,liste] of Object.entries(tur)){
      if(m==='degiskenler') continue;
      if(m!=='genel'&&!MIZACLAR.includes(m)){hatalar.push(ad+': bilinmeyen mizaç anahtarı '+m); continue;}
      if(!Array.isArray(liste)||!liste.length){hatalar.push(ad+'.'+m+': kalıp listesi boş'); continue;}
      for(const k of liste){
        try{
          for(const y of yerTutucular(k)) if(!izinli.has(y.ad)) hatalar.push(ad+'.'+m+': bildirilmemiş değişken {'+y.ad+'} — "'+k+'"');
          if(ornekDegerler) doldur(k,ornekDegerler);
        }catch(e){hatalar.push(ad+'.'+m+': '+e.message);}
      }
    }
    if(!tur.genel) hatalar.push(ad+': "genel" varyantı yok');
  }
  return hatalar;
}
