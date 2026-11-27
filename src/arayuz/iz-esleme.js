// Vakadaki fiziksel izi olay yeri fotoğrafının iz nesnesine ve mekânın yuvasına eşler. Saf: DOM ve çizim bilmez.
//
//   izEsle(iz)            → {tur, ...parametre, yaklasik?} ya da null (yara: kurbanın örtüsüne dokunularak bulunur)
//   izleriYerlestir({...}) → {izler:[{tur, yuva, kimlik, ...}], yerlesmeyen:[iz.id]}
//
// Eşleme simülasyonun iz anahtarından (src/simulasyon/tablolar.js: ESYA, MEKAN_ALETI, ORTU_IZ) fotoğrafın iz
// türlerine (src/cizim/sahneler/olay-yeri/izler/) gider. Fotoğrafta tam karşılığı olmayan anahtar en yakın nesneyle
// çizilir ve `yaklasik:true` taşır; bu boşluklar yeni iz nesnesi çizilince kapanır (ESLEME_BOSLUKLARI).

import {esyaIzi} from '../simulasyon/tablolar.js';
import {rng} from '../cekirdek/rastgele.js';

const Y={yaklasik:true};

// anahtar → fotoğraf izi. `yuzey`: tercih edilen yuva yüzeyi (ör. unlu ayak izi unda).
export const IZ_ESLEME=Object.freeze({
  // ayak izi
  'carik-izi':{tur:'ayak-izi',cesit:'carik',sayi:3},
  'cizme-izi':{tur:'ayak-izi',cesit:'cizme',sayi:3},
  'postal-izi':{tur:'ayak-izi',cesit:'cizme',sayi:3,...Y},
  'unlu-ayak-izi':{tur:'ayak-izi',cesit:'carik',sayi:2,yuzey:'un',...Y},
  'esek-izi':{tur:'ayak-izi',cesit:'cizme',sayi:4,...Y},
  'baston-izi':{tur:'ayak-izi',cesit:'carik',sayi:2,...Y},
  // lif: takılıp kalan ip
  'kirmizi-yun-ipi':{tur:'ip',renk:'kirmizi'},
  'mor-oya':{tur:'ip',renk:'mor'},
  'aba-tiftigi':{tur:'ip',renk:'kahve'},
  'kaput-yunu':{tur:'ip',renk:'yesil'},
  'onluk-ipligi':{tur:'ip',renk:'kahve'},
  'kece-tuyu':{tur:'ip',renk:'beyaz'},
  'sari-yazma-parcasi':{tur:'ip',renk:'sari',...Y},
  'boz-yun':{tur:'ip',renk:'beyaz',...Y},
  'entari-parcasi':{tur:'ip',renk:'lacivert',...Y},
  'palto-kumasi':{tur:'ip',renk:'lacivert',...Y},
  'cubbe-kumasi':{tur:'ip',renk:'kahve',...Y},
  // kırıntı
  'tutun-kirintisi':{tur:'esya',cesit:'tabaka',...Y},
  'boya-kirintisi':{tur:'un',...Y},
  'kuru-ot':{tur:'un',...Y},
  'sican-otu':{tur:'un',...Y},
  // leke
  'gaz-damlasi':{tur:'devrik',cesit:'lamba',...Y},
  'gaz-yagi-lekesi':{tur:'devrik',cesit:'lamba',...Y},
  'kurum-lekesi':{tur:'kan',buyukluk:'kucuk',...Y},
  'mor-kalem-lekesi':{tur:'kan',buyukluk:'kucuk',...Y},
  'yesil-murekkep':{tur:'kan',buyukluk:'kucuk',...Y},
  // nesne
  'asker-dugmesi':{tur:'esya',cesit:'dugme'},
  'cakmak':{tur:'esya',cesit:'cakmak'},
  'tespih-tanesi':{tur:'esya',cesit:'tespih'},
  'mavi-boncuk':{tur:'esya',cesit:'tespih',...Y},
  'bilezik':{tur:'esya',cesit:'tespih',...Y},
  'cep-saati':{tur:'saat'},
  'durmus-saat':{tur:'saat'},
  'cekic':{tur:'alet',cesit:'cekic'},
  'makas':{tur:'alet',cesit:'makas'},
  'gobek-makasi':{tur:'alet',cesit:'makas'},
  'kama':{tur:'alet',cesit:'kama'},
  'orak':{tur:'alet',cesit:'orak'},
  'sungu':{tur:'alet',cesit:'kama',...Y},
  'bag-bicagi':{tur:'alet',cesit:'orak',...Y},
  'dirgen':{tur:'alet',cesit:'orak',...Y},
  'balta':{tur:'alet',cesit:'cekic',...Y},
  'kazma':{tur:'alet',cesit:'cekic',...Y},
  'kurek':{tur:'alet',cesit:'cekic',...Y},
  'demir-cubuk':{tur:'alet',cesit:'cekic',...Y},
  'masa':{tur:'alet',cesit:'cekic',...Y}, // demirci maşası
  'gugum':{tur:'devrik',cesit:'gugum'},
  'masrapa':{tur:'devrik',cesit:'gugum',...Y},
  'sini':{tur:'devrik',cesit:'gugum',...Y},
  'raki-sisesi':{tur:'devrik',cesit:'lamba',...Y},
  'gozluk-cami':{tur:'devrik',cesit:'lamba',...Y},
  'urgan':{tur:'ip',renk:'kahve',...Y},
  'kirbac':{tur:'ip',renk:'kahve',...Y},
  'bos-kovan':{tur:'esya',cesit:'cakmak',...Y},
  'av-kovani':{tur:'esya',cesit:'cakmak',...Y},
  'anahtar':{tur:'esya',cesit:'cakmak',...Y},
  'muhur':{tur:'esya',cesit:'cakmak',...Y},
  'cingirak':{tur:'esya',cesit:'cakmak',...Y},
  'duduk':{tur:'esya',cesit:'cakmak',...Y},
  'kaval':{tur:'esya',cesit:'tabaka',...Y},
  'muska':{tur:'esya',cesit:'tabaka',...Y},
  'mektup':{tur:'esya',cesit:'tabaka',...Y},
  'defter-yapragi':{tur:'esya',cesit:'tabaka',...Y},
  'kasket':{tur:'esya',cesit:'tabaka',...Y},
});
// Tabloda hiç olmayan (yeni) anahtar için: küçük bir düşmüş eşya.
export const BILINMEYEN_IZ=Object.freeze({tur:'esya',cesit:'dugme',yaklasik:true,bilinmeyen:true});

// Fotoğrafta tam karşılığı olmayan anahtarlar (rapor ve test için).
export const ESLEME_BOSLUKLARI=Object.freeze(Object.entries(IZ_ESLEME).filter(([,e])=>e.yaklasik).map(([a,e])=>({anahtar:a,tur:e.tur,cesit:e.cesit??e.renk??null})));

// Saatin gösterdiği an: dilim → 'SS:DD'
export const DILIM_SAATI=Object.freeze({gece:'23:40',sabah:'07:15',ogle:'12:20',ikindi:'15:50',aksam:'19:10'});

// İzin fotoğraftaki anahtarı. Kurbanın eşyasında anahtar eşyanın kimliğidir; onu eşyanın bıraktığı ize çevir.
export function izAnahtari(iz){
  if(iz.alt==='kurban-esyasi'&&iz.anahtar!=='durmus-saat') return esyaIzi(iz.anahtar).iz;
  return iz.anahtar;
}

// Fiziksel iz → fotoğraf izi tanımı. Yara (cesetteki iz) null: arayüz onu örtülü kurbana bağlar.
// dilimler: vakanın dilim adları (saat için)
export function izEsle(iz,{dilimler=['gece','sabah','ogle','ikindi','aksam']}={}){
  if(!iz||iz.alt==='yara') return null;
  const a=izAnahtari(iz), e=IZ_ESLEME[a]??BILINMEYEN_IZ;
  const sonuc={...e};
  if(e.tur==='saat'){
    const dl=iz.gercek?.gosterdigiDilim??dilimler[((iz.zaman??0)%dilimler.length+dilimler.length)%dilimler.length];
    sonuc.saat=DILIM_SAATI[dl]??DILIM_SAATI.gece;
  }
  return sonuc;
}

const karma=s=>{let h=2166136261; for(const ch of String(s)){h^=ch.charCodeAt(0); h=Math.imul(h,16777619);} return h>>>0;};
const uzaklik=(a,b)=>a&&b?Math.hypot(a[0]-b[0],a[2]-b[2]):0;

/**
 * Bir fotoğrafın izlerini mekânın yuvalarına dağıtır. Belirlenimci: aynı izler ve tohum, aynı yerleşim.
 * @param {object} o
 * @param {Array} o.izler      vakadaki fiziksel izler (bu cinayetin); yara olanlar atlanır
 * @param {object} o.yuvalar   mekân şablonunun yuvaları ({ad:{duzlem, yuzey, konum, uygunsuz?}})
 * @param {object} o.duzlemler iz türü → konabileceği düzlemler (olay yeri IZLER[tur].duzlemler)
 * @param {number} o.tohum
 * @returns {{izler:Array, yerlesmeyen:string[]}}
 */
export function izleriYerlestir({izler,yuvalar,duzlemler,tohum=1,dilimler}){
  const r=rng((karma(Object.keys(yuvalar||{}).join(','))^(tohum*2654435761))>>>0);
  const beden=yuvalar?.beden?.konum;
  const kullanim={}, cikti=[], yerlesmeyen=[];
  const sirali=[...izler].filter(i=>i.alt!=='yara').sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  for(const iz of sirali){
    const e=izEsle(iz,{dilimler});
    const uygun=Object.entries(yuvalar||{}).filter(([ad,y])=>ad!=='beden'
      &&(duzlemler?.[e.tur]??['zemin']).includes(y.duzlem)
      &&!(y.uygunsuz||[]).includes(e.tur));
    if(!uygun.length){yerlesmeyen.push(iz.id); continue;}
    // puan: boş yuva önce; ayak izi yumuşak zemine; tercih edilen yüzey; biraz rastgelelik
    let en=null, enP=-Infinity;
    for(const [ad,y] of uygun){
      let p=-(kullanim[ad]||0)*10+r()*2;
      if(e.yuzey&&y.yuzey===e.yuzey) p+=6;
      if(e.tur==='ayak-izi') p+=({camur:3,un:2.5,toprak:2}[y.yuzey]||0);
      if(e.tur==='kan'||e.tur==='devrik') p+=Math.max(0,3-uzaklik(y.konum,beden)/120);
      if(e.tur==='saat'&&y.duzlem!=='zemin') p+=.5;
      if(p>enP){enP=p; en=ad;}
    }
    kullanim[en]=(kullanim[en]||0)+1;
    const param={...e}; for(const k of ['yaklasik','bilinmeyen','yuzey']) delete param[k];
    cikti.push({...param,yuva:en,kimlik:iz.id});
  }
  return {izler:cikti,yerlesmeyen};
}
