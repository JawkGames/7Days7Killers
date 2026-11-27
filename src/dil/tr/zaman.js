// Zaman deyişleri: simülasyonun tek sayılık zamanını (t = (gün-1)*D + dilim) köy ağzına uygun söze çevirir.
// Saf işlevler; rastgelelik yalnız dışarıdan verilen rng ile (src/cekirdek/rastgele.js). rng yoksa ilk seçenek.
//
//   zamanSozu(t, sorguGunu, {dilimler, rng})  → "dün gece", "evvelsi gece", "dün ikindi vakti", "üç gün evvel sabah"
//   zamanDefter(t, {dilimler})                → "2. gün, gece"   (defterde mutlak zaman)
//   dilimAdi('ikindi')                         → "ikindi"
//
// "gece" günün İLK dilimidir: 3. günün gecesi, 2. günü 3. güne bağlayan gecedir. Sorgu gündüz yapıldığı için
// sorgu gününün gecesi "dün gece" olur.

const DILIMLER=['gece','sabah','ogle','ikindi','aksam'];

const SAYI=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on'];
const SIRA=['','birinci','ikinci','üçüncü','dördüncü','beşinci','altıncı','yedinci','sekizinci','dokuzuncu','onuncu'];

const DILIM_ADI={gece:'gece',sabah:'sabah',ogle:'öğle',ikindi:'ikindi',aksam:'akşam'};

// fark: sorgu günü − olay günü. Her dilim için [bugün, dün, evvelki gün, n gün evvel] söz kalıpları.
// {n}: sayı sözcüğü. Bir yerde birden çok seçenek varsa rng ile biri seçilir.
const SOZ={
  gece:[
    ['dün gece','dün gece','dün gece yatsıdan sonra','dün gece sabaha karşı'],
    ['evvelsi gece','önceki gece','evvelsi gece yatsıdan sonra'],
    ['{n} gece evvel'],
  ],
  sabah:[
    ['bu sabah','bu sabah erkenden','sabah ezanından sonra'],
    ['dün sabah','dün sabah erkenden'],
    ['evvelki gün sabah'],
    ['{n} gün evvel sabah'],
  ],
  ogle:[
    ['bugün öğle vakti','bugün öğleyin'],
    ['dün öğle vakti','dün öğleyin'],
    ['evvelki gün öğle vakti'],
    ['{n} gün evvel öğle vakti'],
  ],
  ikindi:[
    ['bugün ikindi vakti','bu ikindi'],
    ['dün ikindi vakti','dün ikindiye doğru','dün ikindi üstü'],
    ['evvelki gün ikindi vakti'],
    ['{n} gün evvel ikindi vakti'],
  ],
  aksam:[
    ['bu akşam'],
    ['dün akşam','dün akşam karanlığında','dün akşam ezanından sonra'],
    ['evvelki akşam','evvelki gün akşam'],
    ['{n} gün evvel akşam'],
  ],
};

const sec=(l,rng)=>l[rng?Math.floor(rng()*l.length):0];

export function zamanParcala(t,dilimler=DILIMLER){
  const D=dilimler.length;
  if(!Number.isInteger(t)||t<0) throw new Error('Geçersiz zaman: '+t);
  return {gun:Math.floor(t/D)+1,dilim:dilimler[t%D]};
}

export const dilimAdi=d=>{
  const a=DILIM_ADI[d];
  if(!a) throw new Error('Bilinmeyen dilim: '+d);
  return a;
};
export const sayiSozu=n=>SAYI[n]??String(n);
export const siraSozu=n=>SIRA[n]??(n+'.');

/**
 * Sorgu gününe göre göreli zaman sözü ("dün gece", "evvelsi gece").
 * @param {number} t           olayın zamanı
 * @param {number} sorguGunu   konuşmanın yapıldığı gün (1..)
 * @param {{dilimler?:string[], rng?:()=>number}} [s]
 */
export function zamanSozu(t,sorguGunu,{dilimler=DILIMLER,rng}={}){
  const {gun,dilim}=zamanParcala(t,dilimler);
  const fark=sorguGunu-gun;
  const tablo=SOZ[dilim];
  if(!tablo) throw new Error('Bilinmeyen dilim: '+dilim);
  if(fark<0) return zamanDefter(t,{dilimler});            // gelecek: konuşmada geçmez, defter biçimi
  // gece için: 0 dün gece, 1 evvelsi gece, 2+ "{n} gece evvel" (n = fark+1: üç gece evvel)
  // gündüz için: 0 bugün, 1 dün, 2 evvelki gün, 3+ "{n} gün evvel" (n = fark)
  let satir, n;
  if(dilim==='gece'){ satir=Math.min(fark,2); n=fark+1; }
  else{ satir=Math.min(fark,3); n=fark; }
  return sec(tablo[satir],rng).replace('{n}',sayiSozu(n));
}

// Defterde mutlak zaman: "2. gün, gece". Noktadan sonra bölünmez boşluk: kalıp motoru "2. Gün" diye büyütmesin.
export function zamanDefter(t,{dilimler=DILIMLER}={}){
  const {gun,dilim}=zamanParcala(t,dilimler);
  return `${gun}.\u00a0gün, ${dilimAdi(dilim)}`;
}

// Gün başlığı: "Birinci gün", "Yedinci gün".
export function gunBasligi(gun){
  const s=siraSozu(gun);
  return s[0].toLocaleUpperCase('tr')+s.slice(1)+' gün';
}
