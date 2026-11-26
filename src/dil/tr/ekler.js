// Türkçe ek motoru. Bir ada ya da ad öbeğine hâl, çoğul, iyelik ve ek-eylem ekleri getirir.
// Saf işlevler; bağımlılık yok. Kurallar ve istisna tablosunun kullanımı: src/dil/tr/README.md
//
//   ekle('Antep', 'de')                        → yanlış: düz metin cins addır → "Antepte"
//   ekle(ozelAd('Antep'), 'de')                → "Antep'te"
//   ekle(mekanAdi('Muhtarın evi'), 'de')       → "muhtarın evinde"
//   ekle('22:40', 'de')                        → "22:40'ta"
//   ekle(mekanAdi('Ağa konağı'), 'de', 'dim')  → "ağa konağındaydım"

const TR='tr';
const kucuk=s=>s.toLocaleLowerCase(TR);
const buyuk=s=>s.toLocaleUpperCase(TR);

const UNLULER='aeıioöuüâîû';
const INCE_UNLU='eiöüî';
const YUVARLAK_UNLU='oöuüû';
const SERT='fstkçşhp'; // "fıstıkçı şahap": -de/-di → -te/-ti

/* ---------------- İstisna tabloları (anahtarlar küçük harf, şapkasız) ---------------- */

// Son hecesi ince okunan (ünlü uyumuna uymayan) sözcükler: ekin ünlüsü buradaki ünlüye göre seçilir.
// Çoğu Arapça/Farsça kökenli ve ince "l", "k" ya da "t" ile biten sözcüklerdir.
export const INCE_OKUNAN={
  saat:'e', dikkat:'e', seyahat:'e',
  hal:'e', kalp:'e', harf:'e', misal:'e', hayal:'e', ihtimal:'e', sual:'e', istiklal:'e', idrak:'e', ihtiyat:'e',
  rol:'ö', gol:'ö', alkol:'ö', petrol:'ö', kontrol:'ö', protokol:'ö', futbol:'ö',
  kabul:'ü', usul:'ü', meşgul:'ü', mahsul:'ü', nüzul:'ü',
  kemal:'e', celal:'e', cemal:'e', bilal:'e', hilal:'e', nihal:'e', iclal:'e', // özel adlar da buradan bakılır
};

// Ünlüyle başlayan ek gelince son hecedeki ünlüsü düşen sözcükler (yalnız cins adlarda).
export const UNLU_DUSMESI={
  'oğul':'oğl', 'ağız':'ağz', 'burun':'burn', 'boyun':'boyn', 'alın':'aln', 'gönül':'gönl', 'akıl':'akl',
  'şehir':'şehr', 'isim':'ism', 'resim':'resm', 'fikir':'fikr', 'ömür':'ömr', 'sabır':'sabr', 'emir':'emr',
  'beyin':'beyn', 'göğüs':'göğs', 'nehir':'nehr', 'zehir':'zehr', 'hüküm':'hükm', 'kahır':'kahr', 'zihin':'zihn',
  'kayıp':'kayb', 'kayıt':'kayd', 'vakit':'vakt', 'kısım':'kısm', 'metin':'metn', 'nesil':'nesl', 'asıl':'asl',
};

// Ünlüyle başlayan ek gelince son ünsüzü ikileşen tek heceli sözcükler.
export const IKILESME={
  'sır':'sırr', 'hak':'hakk', 'his':'hiss', 'zan':'zann', 'af':'aff', 'had':'hadd', 'tıp':'tıbb',
  'hat':'hatt', 'ret':'redd', 'şer':'şerr', 'zıt':'zıdd', 'hac':'hacc', 'muhik':'muhikk',
};

// Kurala aykırı olarak yumuşayan sözcükler: tek heceli olup yumuşayanlar ve -t ile bitip yumuşayanlar.
// (Çok heceli -p, -ç, -k sözcükleri zaten yumuşar; -t ile bitenler ancak bu listedeyse yumuşar.)
export const YUMUSAR=new Set([
  'dip','kap','uç','güç','taç','renk','denk','cenk','kalp','harp','çok','gök',
  'dört','yurt','kurt','dert','tat',
  'kanat','kağıt','yoğurt','armut','kilit','umut','ağıt','öğüt','yiğit','söğüt','geçit','damat',
]);
// Çok heceli olduğu hâlde yumuşamayan sözcükler.
export const YUMUSAMAZ=new Set(['ahlak','ittifak','iştirak','infilak','istimlak','evrak','merak','tank','park','bank','kroket','kasket','sepet','bulut','tabut','hukuk','sükût']);

// Son sözcüğü ı/i/u/ü ile bittiği hâlde iyelik eki almamış kök sözcükler (otomatik iyelik sezgisini durdurur).
export const IYELIKSIZ=new Set([
  'kapı','kuyu','köprü','kutu','sürü','ordu','kuzu','kedi','keçi','halı','sini','tepsi','yemeni','ütü','kazı',
  'ölçü','çini','kuru','deli','sarı','kırmızı','mavi','gri','koyu','ninni','dayı',
  'cami','hacı','kadı','tilki','türkü','örtü','sargı','yolcu','kömürcü','demirci','değirmenci','çerçi','bekçi',
]);

// Ünlüyle biten ama belirtme/tamlayan/iyelikte -n-/-s- yerine -y- alan sözcükler (suyu, suyun).
const KAYNASTIRMA_Y=new Set(['su']);

// Ad yerine kullanılan unvan lakaplar: cins ad gibi yazılır, kesme almaz ("Hocaya", "Muhtarın").
export const UNVAN_LAKAPLAR=new Set(['hoca','muhtar','muallim','onbaşı','değirmenci','kâhya','kahya','çerçi','hanımağa','ağa','imam']);

/* ---------------- Yardımcılar ---------------- */

const sapkasiz=s=>s.replace(/â/g,'a').replace(/î/g,'i').replace(/û/g,'u');
const unluMu=h=>UNLULER.includes(h);
function sonUnlu(s){for(let i=s.length-1;i>=0;i--) if(unluMu(s[i])) return s[i]; return null;}
function heceSayisi(s){let n=0; for(const h of s) if(unluMu(h)) n++; return n;}
const uyum2=u=>INCE_UNLU.includes(u)?'e':'a';
const uyum4=u=>INCE_UNLU.includes(u)?(YUVARLAK_UNLU.includes(u)?'ü':'i'):(YUVARLAK_UNLU.includes(u)?'u':'ı');

const BIRLER=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz'];
const ONLAR=['','on','yirmi','otuz','kırk','elli','altmış','yetmiş','seksen','doksan'];
const BUYUKLER=['bin','milyon','milyar','trilyon','katrilyon'];
// Bir tam sayının okunuşundaki son sözcük: 1943 → "üç", 40 → "kırk", 2000 → "bin".
export function sayiSonSozcuk(n){
  if(!Number.isInteger(n)||n<0) throw new Error('Sayı okunamıyor: '+n);
  if(n===0) return 'sıfır';
  if(n%10) return BIRLER[n%10];
  if(Math.floor(n/10)%10) return ONLAR[Math.floor(n/10)%10];
  if(Math.floor(n/100)%10) return 'yüz';
  let k=0; n=Math.floor(n/1000);
  while(n%1000===0){n=Math.floor(n/1000); k++;}
  return BUYUKLER[k];
}
// "22:40" → "kırk", "22:00" → "iki", "3,5" → "beş", "1943" → "üç"
function sayiOkunusu(t){
  const p=t.split(/[:.,]/);
  let son=p[p.length-1];
  if(p.length>1&&/^0+$/.test(son)&&(t.includes(':')||t.includes('.'))) son=p[p.length-2]; // 22:00 → yirmi iki
  return sayiSonSozcuk(parseInt(son,10));
}
const HARF_ADI={a:'a',b:'be',c:'ce','ç':'çe',d:'de',e:'e',f:'fe',g:'ge','ğ':'yumuşak ge',h:'he','ı':'ı',i:'i',j:'je',k:'ke',l:'le',m:'me',n:'ne',o:'o','ö':'ö',p:'pe',r:'re',s:'se','ş':'şe',t:'te',u:'u','ü':'ü',v:'ve',y:'ye',z:'ze'};

/* ---------------- Değer çözümleme ---------------- */

const SAYI_RE=/^\d+([:.,]\d+)?$/;
const KISALTMA_RE=/^[A-ZÇĞİÖŞÜ]{2,}$/; // yalnız büyük ünsüzlerden oluşan kısaltma (TBMM, PTT) için aşağıda ünlü denetimi de var
const kelimeler=m=>m.trim().split(/\s+/);

// İyelikli ad öbeği sezgisi. Özel adlarda yalnız "-in + -(s)I" kalıbı ("Muhtarın Kızı"), cins adlarda
// birden çok sözcüklü ve son sözcüğü ı/i/u/ü ile biten öbekler ("Çeşme başı", "Köy odası") iyelikli sayılır.
export function iyelikliMi(metin,ozel=false){
  const k=kelimeler(kucuk(metin)).map(s=>s.replace(/['’]/g,''));
  if(k.length<2) return false;
  const son=k[k.length-1], onceki=k[k.length-2];
  if(!/[ıiuü]$/.test(son)||IYELIKSIZ.has(son)) return false;
  if(/(ın|in|un|ün)$/.test(onceki)&&heceSayisi(onceki)>1) return true;
  return !ozel&&!SAYI_RE.test(son);
}

// Düz metin, sayı ya da {metin, ozelAd, iyelikli} nesnesini ortak biçime getirir.
export function degerCoz(d){
  if(typeof d==='number') d=String(d);
  if(typeof d==='string') d={metin:d};
  if(!d||typeof d.metin!=='string'||!d.metin.trim()) throw new Error('Ek getirilecek değer boş ya da geçersiz: '+JSON.stringify(d));
  const metin=d.metin.trim();
  const sayi=SAYI_RE.test(kelimeler(metin).pop());
  const sonK=kelimeler(metin).pop();
  const kisaltma=!sayi&&KISALTMA_RE.test(sonK)&&!/[AEIİOÖUÜÂÎÛ]/.test(sonK);
  const ozel=d.ozelAd!=null?!!d.ozelAd:(sayi||kisaltma);
  const iyelikli=d.iyelikli!=null?!!d.iyelikli:iyelikliMi(metin,ozel);
  return {metin,ozelAd:ozel,iyelikli};
}

// Kolaylık kurucuları.
export const ozelAd=metin=>({metin,ozelAd:true,iyelikli:iyelikliMi(metin,true)});
// Kişi adı ya da lakabı: unvan lakaplar ("Hoca", "Muhtar") cins ad gibi, öbürleri özel ad gibi çekilir.
export function kisiAdi(metin){
  const ozel=!UNVAN_LAKAPLAR.has(kucuk(metin.trim()));
  return {metin,ozelAd:ozel,iyelikli:iyelikliMi(metin,ozel)};
}
// Mekân adı (src/dil/tr/terimler.js): cins ad öbeğidir; cümle içinde kullanılsın diye ilk sözcüğü küçültülür,
// ama ikinci sözcük büyük harfle başlıyorsa ("Kör Halil'in evi", "Ebe Ana'nın evi") ilk sözcük adın parçasıdır, dokunulmaz.
export function mekanAdi(metin){
  const k=metin.trim().split(/\s+/);
  const ikinciBuyuk=k.length>1&&k[1][0]!==kucuk(k[1][0]);
  if(!ikinciBuyuk) k[0]=kucuk(k[0][0])+k[0].slice(1);
  const m=k.join(' ');
  return {metin:m,ozelAd:false,iyelikli:iyelikliMi(m,false)};
}

/* ---------------- Ekler ---------------- */

// Kanonik ek adları ve yazımda kullanılabilecek takma adlar.
export const EK_ADLARI={
  de:['de','da','te','ta','bulunma'],
  den:['den','dan','ten','tan','ayrilma','ayrılma'],
  e:['e','a','ye','ya','yonelme','yönelme'],
  i:['i','ı','u','ü','yi','yı','yu','yü','belirtme'],
  in:['in','ın','un','ün','nin','nın','nun','nün','tamlayan'],
  le:['le','la','yle','yla','ile'],
  ler:['ler','lar','cogul','çoğul'],
  si:['si','sı','su','sü','iyelik'],
  ki:['ki'],
  di:['di','dı','du','dü','ydi','ydı','ydu','ydü','idi'],
  dim:['dim','dım','dum','düm','ydim','ydım','ydum','ydüm','idim'],
  mis:['mis','mış','muş','müş','ymis','ymiş','ymış','ymuş','ymüş','miş','imiş'],
  dir:['dir','dır','dur','dür'],
  ken:['ken','yken','iken'],
  mi:['mi','mı','mu','mü','soru'], // soru eki: ayrı yazılır, kesme almaz ("Halil mi", "o gece mi")
};
const TAKMA={};
for(const [k,l] of Object.entries(EK_ADLARI)) for(const t of l) TAKMA[t]=k;
export function ekAdiCoz(ad){
  const k=TAKMA[kucuk(String(ad).trim())];
  if(!k) throw new Error('Bilinmeyen ek: "'+ad+'" (bilinenler: '+Object.keys(EK_ADLARI).join(', ')+')');
  return k;
}

// Cins adın gövdesinde ünlüyle başlayan ek öncesi olan değişimler (ikileşme, ünlü düşmesi, yumuşama).
function govdeDegisimi(w){
  const a=sapkasiz(w);
  if(IKILESME[a]) return IKILESME[a];
  if(UNLU_DUSMESI[w]) return UNLU_DUSMESI[w];
  if(YUMUSAMAZ.has(a)||YUMUSAMAZ.has(w)) return w;
  const c=w[w.length-1], o=w[w.length-2]||'';
  const cok=heceSayisi(w)>1, liste=YUMUSAR.has(w)||YUMUSAR.has(a);
  if(c==='k'){ if(!(cok||liste)) return w; if(o==='n') return w.slice(0,-1)+'g'; if(unluMu(o)) return w.slice(0,-1)+'ğ'; return w; }
  if(c==='p'&&(cok||liste)) return w.slice(0,-1)+'b';
  if(c==='ç'&&(cok||liste)) return w.slice(0,-1)+'c';
  if(c==='t'&&liste) return w.slice(0,-1)+'d';
  return w;
}

// Bir eki sesbilgisel duruma göre yazıya döker. d: durum {ses, unlu, iyelikli, su}
function ekYaz(ek,d){
  const u=d.unlu, son=d.ses[d.ses.length-1], unluyle=unluMu(son), sert=SERT.includes(son);
  const h2=uyum2(u), h4=uyum4(u), D=sert?'t':'d', n=d.iyelikli&&unluyle?'n':''; // n: zamir n'si (evi-n-de)
  switch(ek){
    case 'de': return n+(n?'d':D)+h2;
    case 'den': return n+(n?'d':D)+h2+'n';
    case 'e': return unluyle?(n||'y')+h2:h2;
    case 'i': return unluyle?(n||'y')+h4:h4;
    case 'in': return unluyle?(d.su?'y':'n')+h4+'n':h4+'n';
    case 'le': return (unluyle?'y':'')+'l'+h2;
    case 'ler': return 'l'+h2+'r';
    case 'si': return unluyle?(d.su?'y':'s')+h4:h4;
    case 'ki': return /(gün|dün)$/.test(d.ses)?'kü':'ki'; // dünkü, o günkü
    case 'di': return (unluyle?'yd':D)+h4;
    case 'dim': return (unluyle?'yd':D)+h4+'m';
    case 'mis': return (unluyle?'y':'')+'m'+h4+'ş';
    case 'dir': return D+h4+'r';
    case 'ken': return (unluyle?'y':'')+'ken';
    case 'mi': return ' m'+h4;
  }
  throw new Error('Bilinmeyen ek: '+ek);
}
const UNLUYLE_BASLAYAN=new Set(['e','i','in','si']); // ünsüzden sonra ünlüyle başlayan ekler

/**
 * Değere sırayla ekleri getirir. ekle(deger, 'si', 'de') gibi; ek adları EK_ADLARI'ndan (takma adlar da olur).
 * @param {string|number|{metin:string,ozelAd?:boolean,iyelikli?:boolean}} deger
 * @param {...string} ekler
 * @returns {string}
 */
export function ekle(deger,...ekler){
  const v=degerCoz(deger);
  const liste=ekler.flatMap(e=>String(e).split('+')).filter(e=>e.trim()).map(ekAdiCoz);
  const tumKelime=kelimeler(v.metin), sonKelimeYazi=tumKelime[tumKelime.length-1];
  const sonTemiz=kucuk(sonKelimeYazi).replace(/['’]/g,'');
  const harfler=sonTemiz.replace(/[^a-zçğıöşüâîû0-9:.,]/g,'');
  if(!harfler) throw new Error('Ek getirilecek sözcük okunamıyor: "'+v.metin+'"');
  // Tümü büyük harfli sözcükte (başlık) ek de büyük yazılır; ünlüsüz kısaltmada (TBMM'ye) küçük kalır.
  const buyukYazi=sonKelimeYazi.length>1&&sonKelimeYazi===buyuk(sonKelimeYazi)&&sonKelimeYazi!==kucuk(sonKelimeYazi)&&!!sonUnlu(harfler);
  const sayi=SAYI_RE.test(sonKelimeYazi);

  // Sesbilgisel başlangıç: okunuş ve uyumu belirleyen ünlü
  let ses, unlu;
  if(sayi){ses=sayiOkunusu(sonKelimeYazi);}
  else if(!sonUnlu(harfler)){
    if(sonKelimeYazi!==buyuk(sonKelimeYazi)) throw new Error('Ünlüsüz sözcüğe ek getirilemez: "'+v.metin+'"');
    ses=HARF_ADI[harfler[harfler.length-1]]; // kısaltma: TBMM → "me"
  } else ses=harfler;
  const istisna=INCE_OKUNAN[sapkasiz(ses)];
  unlu=istisna||sonUnlu(ses);

  let yazi=v.metin, ilk=true, iyelikli=v.iyelikli;
  const durum=()=>({ses,unlu,iyelikli,su:ilk&&!v.ozelAd&&KAYNASTIRMA_Y.has(ses)});
  for(const ek of liste){
    if(ek==='ler'&&iyelikli) throw new Error('İyelikli ad öbeğine çoğul eki getirilemez: "'+v.metin+'" (kökü verin)');
    if(ek==='si'&&iyelikli) continue; // "Halil'in cep saati": zaten iyelikli
    // Gövde değişimi: yalnız ilk ekte, cins adda, ünlüyle başlayan ek ünsüzden sonra gelince
    if(ilk&&!v.ozelAd&&!sayi&&UNLUYLE_BASLAYAN.has(ek)&&!unluMu(ses[ses.length-1])&&!iyelikli){
      const yeni=govdeDegisimi(ses);
      if(yeni!==ses){
        let ortak=0; while(ortak<ses.length&&ses[ortak]===yeni[ortak]) ortak++;
        let ekPar=yeni.slice(ortak); if(buyukYazi) ekPar=buyuk(ekPar);
        yazi=yazi.slice(0,yazi.length-(ses.length-ortak))+ekPar;
        ses=yeni;
        if(!istisna) unlu=sonUnlu(ses);
      }
    }
    let parca=ekYaz(ek,durum());
    if(buyukYazi) parca=buyuk(parca);
    if(ilk&&v.ozelAd&&ek!=='mi') yazi+="'";
    yazi+=parca;
    ses=ek==='mi'?kucuk(parca).trim():ses+kucuk(parca);
    unlu=sonUnlu(ses)||unlu;
    iyelikli=ek==='si';
    ilk=false;
  }
  return yazi;
}

// Kısa adlar: bulunma('Antep') yerine ekle(ozelAd('Antep'),'de') da yazılabilir.
export const bulunma=d=>ekle(d,'de');
export const ayrilma=d=>ekle(d,'den');
export const yonelme=d=>ekle(d,'e');
export const belirtme=d=>ekle(d,'i');
export const tamlayan=d=>ekle(d,'in');
export const ile=d=>ekle(d,'le');
export const cogul=d=>ekle(d,'ler');
export const iyelik=d=>ekle(d,'si');
