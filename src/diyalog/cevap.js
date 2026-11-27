// Cevap üretimi: bir sorunun simülasyondaki karşılığını (ifade) kişinin mizacına göre cümleye çevirir.
// Saf ve belirlenimci: aynı vaka + aynı kişi + aynı soru (+ aynı defter) her zaman aynı cevabı verir.
// Rastgelelik yalnızca rngAl(tohum, kişi, soru) ile gelir (kalıp ve zaman deyişi seçimi).
//
//   cevapUret({vaka, kisi, soru, gun, defter}) →
//     {olgu, tavir, kural, gerginlik, iddialar:[...], metin, notlar:[...], tepki:{...}}
//
// - tavir/kural/gerginlik motorun iç bilgisidir; oyuncuya gösterilmez, deftere yazılmaz.
// - iddialar: konuşanın ağzından çıkan önermeler (defter.js biçimi); çelişki bunlardan bulunur.
// - notlar: konuşmanın dışında defterine düşen anlatım satırları (açılan bir sır gibi).
// - tepki: çizim katmanı için veri (göz kaçırma, duraksama, gerginlik düzeyi) ve kısa sahne notu.
//   Tepki ipucudur, kanıt değildir: masumlar da gerilir.

import {cumleKur,doldur,sec} from './kalip.js';
import {ifade,ifadeMotoru} from '../simulasyon/index.js';
import {zamanSozu} from '../dil/tr/zaman.js';
import {DIL_TR,rngAl,kisiDeger,mekanDeger,izAdi,esyaYazi,ortuYazi,kimlerDeger,kimlerdeDeger} from './adlar.js';
import {ifadeBul,ogrenilenSirlar} from './defter.js';

export const sorguZamani=(vaka,gun)=>{
  const dl=vaka.ayar.dilimler;
  return (gun-1)*dl.length+Math.max(0,dl.indexOf('sabah'));
};

const iliskiTurleri=(vaka,a,b)=>vaka.iliskiler.filter(i=>i.kimden===a&&i.kime===b).map(i=>i.tur);
const katilMi=(vaka,k)=>vaka.cinayetler.some(c=>c.katil===k||c.yardimci===k);

// Motorun gerginlik hesabına benzer; motorun soramadığımız olgular için (dolaylı izler, ilişkiler, selam).
function gerginlikHesap(vaka,k,tavir,ek=0){
  let g=.1+ek;
  if(katilMi(vaka,k)) g+=.35;
  if(tavir==='yalan') g+=.25; else if(tavir==='susar') g+=.15; else if(tavir==='abarti') g+=.05;
  const mz=vaka.kisiler[k].mizac;
  if(mz==='korkak') g+=.1;
  if(mz==='sakin'||mz==='gururlu') g-=.05;
  return Math.round(Math.max(0,Math.min(1,g))*100)/100;
}

/* ---------------- Tepki ---------------- */

export function tepkiKur({gerginlik,mizac,tavir},r,dil=DIL_TR){
  const T=dil.oyun.tepki;
  const g=gerginlik;
  const duzey=g<.25?'sakin':g<.45?'tedirgin':g<.65?'gergin':'cok-gergin';
  const gozKacirma=g>=.4&&r()<g;
  const duraksama=r()<g*.8+(mizac==='korkak'?.2:0);
  let liste;
  if(mizac==='ofkeli'&&g>=.4) liste=T.ofke;
  else if(gozKacirma) liste=T.gozKacirma;
  else if(duraksama&&g>=.3) liste=T.duraksama;
  else if(duzey==='cok-gergin'||duzey==='gergin') liste=T.gergin;
  else if(mizac==='gururlu') liste=T.gurur;
  else if(mizac==='kurnaz') liste=T.kurnaz;
  else if(mizac==='korkak') liste=T.korkak;
  else if(duzey==='tedirgin') liste=T.tedirgin;
  else liste=T.sakin;
  return {gerginlik:g,duzey,gozKacirma,duraksama,not:sec(liste,r),tavirIpucu:tavir==='susar'?'susar':null};
}

/* ---------------- Yardımcılar ---------------- */

function baglam({vaka,kisi,soru,gun,defter,dil=DIL_TR}){
  const r=rngAl(vaka.tohum,'cevap',kisi,soru.id);
  const mizac=vaka.kisiler[kisi].mizac;
  const ev=vaka.kisiler[kisi].ev;
  const K=dil.kaliplar;
  const kur=(tur,degerler={})=>cumleKur(K,tur,{mizac,degerler,rng:r});
  const zs=t=>zamanSozu(t,gun,{dilimler:vaka.ayar.dilimler,rng:r});
  const yer=(m,konu)=>mekanDeger(m,{konusanEv:ev,konuEv:konu&&konu!==kisi?vaka.kisiler[konu]?.ev:undefined},dil);
  return {vaka,kisi,soru,gun,defter,dil,r,mizac,ev,kur,zs,yer,kd:id=>kisiDeger(id,dil),S:sorguZamani(vaka,gun)};
}

const izBul=(vaka,id)=>vaka.izler.find(i=>i.id===id);
const cinBul=(vaka,id)=>vaka.cinayetler.find(c=>c.id===id);

// Ek motoru için eşya adı: kalıplarda "{sahip:in} {esya:si}" → "Muhtarın Kızı'nın kırmızı yün hırkası".
function esyaDeger(iz,sahip,dil){
  if(iz.esya&&sahip===iz.sahip) return esyaYazi(sahip,iz.esya,dil);
  if(iz.ortu) return ortuYazi(iz.ortu,dil);
  return izAdi(iz,dil);
}

function sonuc(c,{olgu=null,tavir,kural=null,gerginlik,iddialar=[],metin,notlar=[]}){
  const tepki=tepkiKur({gerginlik,mizac:c.mizac,tavir},c.r,c.dil);
  return {olgu,tavir,kural,gerginlik,iddialar,metin:metin.replace(/\s+/g,' ').trim(),notlar,tepki};
}

// Açılan sırrın defter satırı.
function sirNotu(c,sahip,sir){
  const metin=c.dil.kisiler[sahip]?.sirlar?.[sir];
  if(!metin) return null;
  return doldur(c.dil.oyun.defter.sirNotu,{kim:c.kd(sahip),sir:metin});
}

/* ---------------- Soru türleri ---------------- */

function yerCevabi(c){
  const t=c.soru.zaman, olgu={tur:'konum',kisi:c.kisi,zaman:t};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  const P=f.soylenen?.deger;
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('kendi-susar',{zaman:c.zs(t)})});
  if(P==null) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('bilmem')});
  const metin=P===c.ev?c.kur('yer-ev',{zaman:c.zs(t)}):c.kur('yer-zaman',{zaman:c.zs(t),yer:c.yer(P)});
  return sonuc(c,{olgu,...f,iddialar:[{tur:'konum',kisi:c.kisi,zaman:t,mekan:P}],metin});
}

function gorduCevabi(c){
  const t=c.soru.zaman, olgu={tur:'gorulen',zaman:t};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('gordu-susar',{zaman:c.zs(t)})});
  const liste=(f.soylenen?.deger||[]).filter(e=>e.kisi!==c.kisi);
  if(!liste.length) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('gormedim',{zaman:c.zs(t)})});
  const kendiYeri=c.vaka.cizelge[c.kisi][t];
  const parcalar=[], iddialar=[];
  const yuzler=liste.filter(e=>e.kisi&&e.kesinlik==='yuz');
  const yaninda=yuzler.filter(e=>e.mekan===kendiYeri), uzakta=yuzler.filter(e=>e.mekan!==kendiYeri);
  if(yaninda.length){
    parcalar.push(c.kur('gordum-yaninda',{zaman:c.zs(t),yer:c.yer(kendiYeri),kimler:kimlerDeger(yaninda.map(e=>e.kisi),c.dil)}));
    iddialar.push({tur:'konum',kisi:c.kisi,zaman:t,mekan:kendiYeri});
  }
  for(const e of uzakta) parcalar.push(c.kur('gordum',{zaman:c.zs(t),kim:c.kd(e.kisi),yer:c.yer(e.mekan,e.kisi)}));
  for(const e of yuzler) iddialar.push({tur:'konum',kisi:e.kisi,zaman:t,mekan:e.mekan});
  for(const e of liste.filter(e=>e.kisi&&e.kesinlik==='siluet')){
    const ortu=ortuYazi(e.ortu,c.dil), yer=c.yer(e.mekan);
    const tahmin=e.abarti?.tahmin;
    parcalar.push(tahmin?c.kur('gordum-siluet-tahmin',{ortu,yer,zaman:c.zs(t),kim:c.kd(tahmin)}):c.kur('gordum-siluet',{ortu,yer,zaman:c.zs(t)}));
    iddialar.push({tur:'siluet',zaman:t,mekan:e.mekan,ortu:e.ortu,...(tahmin?{tahmin}:{})});
  }
  for(const e of liste.filter(e=>e.ses)){
    parcalar.push(c.kur('duydum',{ses:c.dil.oyun.ses[e.ses]??e.ses,yer:c.yer(e.mekan),zaman:c.zs(t)}));
    iddialar.push({tur:'ses',zaman:t,mekan:e.mekan,ses:e.ses});
  }
  if(yuzler.some(e=>e.abarti?.tur==='ek-ayrinti')) parcalar.push(c.kur('abarti-ek',{kim:c.kd(yuzler.find(e=>e.abarti).kisi)}));
  return sonuc(c,{olgu,...f,iddialar,metin:parcalar.join(' ')});
}

function baskasiCevabi(c){
  const X=c.soru.kisi, t=c.soru.zaman, olgu={tur:'konum',kisi:X,zaman:t};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  const kim=c.kd(X), zaman=c.zs(t);
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('susma',{kim})});
  const s=f.soylenen;
  if(!s) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('baskasi-bilmez',{kim,zaman})});
  if(s.degil!=null){
    const metin=s.degil===c.ev?c.kur('baskasi-yatak-bos',{kim,zaman}):c.kur('baskasi-degil',{kim,zaman,yer:c.yer(s.degil,X)});
    return sonuc(c,{olgu,...f,iddialar:[{tur:'degil',kisi:X,zaman:t,mekan:s.degil}],metin});
  }
  const P=s.deger;
  let metin=P===c.ev?c.kur('baskasi-evde',{kim,zaman}):c.kur('baskasi-yer',{kim,zaman,yer:c.yer(P,X)});
  if(f.tavir==='abarti') metin+=' '+c.kur('abarti-ek',{kim});
  return sonuc(c,{olgu,...f,iddialar:[{tur:'konum',kisi:X,zaman:t,mekan:P}],metin});
}

// Sahibin kendi eşyası için masum açıklaması (konuşan kendi gerçeğini bilir).
function aciklama(c,iz){
  const v=c.vaka, cin=cinBul(v,iz.cinayet), n=iz.gercek?.neden;
  if(n==='onceden-gecti') return {metin:c.kur('aciklama-gecti',{zaman:c.zs(iz.zaman),yer:c.yer(iz.mekan)}),iddialar:[{tur:'konum',kisi:c.kisi,zaman:iz.zaman,mekan:iz.mekan}]};
  if(n==='tanik-kacarken') return {metin:c.kur('aciklama-kacti',{zaman:c.zs(cin.zaman),yer:c.yer(cin.mekan)}),iddialar:[{tur:'konum',kisi:c.kisi,zaman:cin.zaman,mekan:cin.mekan}]};
  if(n==='calinti-silah'||(iz.alt==='silah'&&cin?.silah?.calinti)){
    const o=v.olaylar.find(x=>x.id===cin?.silah?.olay);
    return {metin:c.kur('aciklama-calindi',{zaman:o&&o.zaman<c.S?c.zs(o.zaman):c.dil.oyun.belirsizZaman}),iddialar:[]};
  }
  if(n==='zehir-kaynagi') return {metin:c.kur('aciklama-ot'),iddialar:[]};
  return {metin:c.kur('aciklama-bilmem'),iddialar:[]};
}

function izCevabi(c){
  const iz=izBul(c.vaka,c.soru.iz), olgu={tur:'esya',iz:iz.id};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  const ad=izAdi(iz,c.dil);
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('esya-susar',{esya:ad})});
  const b=f.bilgi;
  if(!b) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('esya-bilmem',{esya:ad})});
  if(b.deger===c.kisi){ // sahibi konuşuyor
    if(f.tavir==='yalan'){
      const s=f.soylenen?.deger;
      if(s) return sonuc(c,{olgu,...f,iddialar:[{tur:'sahip-degil',iz:iz.id,kisi:c.kisi},{tur:'sahip',iz:iz.id,kisi:s}],metin:c.kur('esya-baskasinin',{esya:ad,kim:c.kd(s)})});
      return sonuc(c,{olgu,...f,iddialar:[{tur:'sahip-degil',iz:iz.id,kisi:c.kisi}],metin:c.kur('esya-benim-degil',{esya:ad})});
    }
    const a=aciklama(c,iz);
    return sonuc(c,{olgu,...f,iddialar:[{tur:'sahip',iz:iz.id,kisi:c.kisi},...a.iddialar],metin:c.kur('esya-benim',{esya:ad})+' '+a.metin});
  }
  const L=b.adaylar||[];
  if(f.tavir==='yalan'){
    const s=f.soylenen?.deger;
    if(s) return sonuc(c,{olgu,...f,iddialar:[{tur:'sahip',iz:iz.id,kisi:s}],metin:c.kur('esya-tanima',{sahip:c.kd(s),esya:esyaDeger(iz,s,c.dil)})});
    return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('esya-bilmem',{esya:ad})});
  }
  if(f.tavir==='abarti'&&L.length>1){
    const x=L.find(k=>iliskiTurleri(c.vaka,c.kisi,k).includes('hasim'))??L.find(k=>k!==c.kisi)??L[0];
    return sonuc(c,{olgu,...f,iddialar:[{tur:'sahip',iz:iz.id,kisi:x}],metin:c.kur('esya-tanima-kesin',{sahip:c.kd(x),esya:esyaDeger(iz,x,c.dil)})});
  }
  if(L.length===1) return sonuc(c,{olgu,...f,iddialar:[{tur:'sahip',iz:iz.id,kisi:L[0]}],metin:c.kur('esya-tanima',{sahip:c.kd(L[0]),esya:esyaDeger(iz,L[0],c.dil)})});
  const digerleri=L.filter(k=>k!==c.kisi);
  if(L.includes(c.kisi)) return sonuc(c,{olgu,...f,iddialar:[{tur:'adaylar',iz:iz.id,kisiler:[...L]},{tur:'sahip-degil',iz:iz.id,kisi:c.kisi}],
    metin:c.kur('esya-adaylar-ben',{esya:ad,kimler:kimlerdeDeger(digerleri,c.dil)})});
  return sonuc(c,{olgu,...f,iddialar:[{tur:'adaylar',iz:iz.id,kisiler:[...L]}],metin:c.kur('esya-adaylar',{esya:ad,kimler:kimlerdeDeger(L,c.dil)})});
}

function failCevabi(c){
  const cin=cinBul(c.vaka,c.soru.cinayet), olgu={tur:'fail',cinayet:cin.id};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  const kurban=c.kd(cin.kurban);
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('fail-susar',{kim:kurban})});
  const X=f.soylenen?.deger;
  if(!X) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('fail-bilmem',{kim:kurban})});
  const tur=f.tavir==='yalan'?'fail-suclama':'fail-bilirim';
  return sonuc(c,{olgu,...f,iddialar:[{tur:'fail',cinayet:cin.id,kisi:X}],metin:c.kur(tur,{kim:c.kd(X),sahip:kurban})});
}

// Dolaylı izler (yırtık giysi, kanlı yen, gece boş yatak...): motorun "fark" olgusu. Konuşan, o cinayetten
// sonra fark ettiklerini söyler; koruduğu kişiyi listeden çıkarır (yalan da susma da "bir şey görmedim" olur).
function farkCevabi(c){
  const v=c.vaka, cin=cinBul(v,c.soru.cinayet), olgu={tur:'fark',cinayet:cin.id};
  const f=ifade(v,c.kisi,olgu,{gun:c.gun});
  const liste=f.soylenen?.deger||[];
  if(!liste.length) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('tuhaf-yok',{kim:c.kd(cin.kurban)})});
  const parcalar=[], iddialar=[];
  for(const e of liste){
    const kim=c.kd(e.kisi), zaman=c.zs(e.zaman);
    const ortu=ortuYazi(e.ortu??v.kisiler[e.kisi].ortu,c.dil);
    const esya=e.esya?esyaYazi(e.kisi,e.esya,c.dil):null;
    iddialar.push({tur:'dolayli',alt:e.alt,kisi:e.kisi,zaman:e.zaman,iz:e.iz,...(e.esya?{esya:e.esya}:{}),...(e.ortu?{ortu:e.ortu}:{})});
    let m;
    switch(e.alt){
      case 'gece-yoklugu': m=c.kur('tuhaf-yokluk',{kim,zaman}); iddialar.push({tur:'degil',kisi:e.kisi,zaman:e.zaman,mekan:e.mekan}); break;
      case 'kanli-giysi': m=c.kur('tuhaf-kanli',{kim,ortu,zaman}); break;
      case 'tirmik': m=c.kur('tuhaf-tirmik',{kim,zaman}); break;
      case 'yirtik-giysi': m=c.kur('tuhaf-yirtik',{kim,ortu,zaman}); break;
      case 'eksik-alet': m=e.kisi===c.kisi?c.kur('tuhaf-eksik-alet',{esya:esya??ortu,zaman}):c.kur('tuhaf-eksik-esya',{kim,esya:esya??ortu,zaman}); break;
      case 'eksik-esya': m=c.kur('tuhaf-eksik-esya',{kim,esya:esya??ortu,zaman}); break;
      default: continue;
    }
    if(e.abarti) m+=' '+c.kur('abarti-ek',{kim});
    parcalar.push(m);
  }
  if(!parcalar.length) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('tuhaf-yok',{kim:c.kd(cin.kurban)})});
  return sonuc(c,{olgu,...f,iddialar,metin:parcalar.join(' ')});
}

// Bir kişi hakkında sorulduğunda konuşanın bildiği, henüz açılmamış ilk sır.
export function sirHedefi(vaka,k,X,defter){
  const acik=new Set((defter?ogrenilenSirlar(defter):[]).map(s=>s.sahip+'/'+s.sir));
  const l=X===k?vaka.sirlar.filter(s=>s.sahip===k)
    :[...vaka.sirlar.filter(s=>s.sahip===X&&s.kimler.includes(k)),...vaka.sirlar.filter(s=>s.sahip===k&&s.kimler.includes(X))];
  return l.find(s=>!acik.has(s.sahip+'/'+s.id))||null;
}

function sirCevabi(c){
  const X=c.soru.kisi, kim=c.kd(X);
  const s=sirHedefi(c.vaka,c.kisi,X,c.defter);
  if(!s) return sonuc(c,{tavir:'bilmez',gerginlik:gerginlikHesap(c.vaka,c.kisi,'dogru'),iddialar:[{tur:'bilmez'}],metin:c.kur('sir-bilmez',{kim})});
  const olgu={tur:'sir',sahip:s.sahip,sir:s.id};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('susma',{kim})});
  if(f.tavir==='yalan'||f.tavir==='bilmez'||!f.soylenen?.deger) return sonuc(c,{olgu,...f,iddialar:[{tur:'bilmez'}],metin:c.kur('sir-yok',{kim})});
  const sirMetni=c.dil.kisiler[s.sahip]?.sirlar?.[s.id]??'';
  let metin, notlar=[];
  if(s.sahip===X){ metin=c.kur('sir-anlatir',{kim})+' '+sirMetni; }
  else{ metin=c.kur('sir-kendi-anlatir',{kim}); const n=sirNotu(c,s.sahip,s.id); if(n) notlar.push(n); }
  if(f.tavir==='abarti') metin+=' '+c.kur('abarti-ek',{kim});
  return sonuc(c,{olgu,...f,iddialar:[{tur:'sir',sahip:s.sahip,sir:s.id}],metin,notlar});
}

function sirKendiCevabi(c){
  const s=sirHedefi(c.vaka,c.kisi,c.kisi,c.defter);
  if(!s) return sonuc(c,{tavir:'bilmez',gerginlik:gerginlikHesap(c.vaka,c.kisi,'dogru'),iddialar:[{tur:'bilmez'}],metin:c.kur('sir-kendi-yok')});
  const olgu={tur:'sir',sahip:c.kisi,sir:s.id};
  const f=ifade(c.vaka,c.kisi,olgu,{gun:c.gun});
  if(f.tavir==='susar') return sonuc(c,{olgu,...f,iddialar:[{tur:'susar'}],metin:c.kur('kendi-susar-sir')});
  if(f.tavir==='yalan'||!f.soylenen?.deger) return sonuc(c,{olgu,...f,iddialar:[{tur:'sir-yok',sahip:c.kisi}],metin:c.kur('sir-kendi-yok')});
  const n=sirNotu(c,c.kisi,s.id);
  return sonuc(c,{olgu,...f,iddialar:[{tur:'sir',sahip:c.kisi,sir:s.id}],metin:c.kur('sir-kendi-itiraf'),notlar:n?[n]:[]});
}

// İlişki sorusu: köy verisinden. Gizli ilişkiyi (sevgili, sevda, suç ortaklığı) yalnızca saf olan söyler;
// kurbanını öldüren, aralarındaki husumeti, borcu ve korkuyu saklar.
const ILISKI_SIRASI=['es','ebeveyn','cocuk','sozlu','sevgili','sever','sevilen','korur','korunan','hasim','borclu','alacakli','korkar','korkulan','isveren','calisan','ortak','dost'];
const GIZLI_ILISKI=['sevgili','sever','ortak'];
const OLUMSUZ_ILISKI=['hasim','borclu','korkar','alacakli'];
function iliskiCevabi(c){
  const X=c.soru.kisi, kim=c.kd(X), v=c.vaka;
  const turler=iliskiTurleri(v,c.kisi,X).sort((a,b)=>ILISKI_SIRASI.indexOf(a)-ILISKI_SIRASI.indexOf(b));
  const oldurdu=v.cinayetler.some(x=>(x.katil===c.kisi||x.yardimci===c.kisi)&&x.kurban===X);
  const soylenen=turler.filter(t=>!(GIZLI_ILISKI.includes(t)&&c.mizac!=='saf')&&!(oldurdu&&OLUMSUZ_ILISKI.includes(t)));
  if(!turler.length) return sonuc(c,{tavir:'dogru',gerginlik:gerginlikHesap(v,c.kisi,'dogru'),iddialar:[{tur:'iliski',kisi:c.kisi,hedef:X,iliskiler:[]}],metin:c.kur('iliski-yok',{kim})});
  const sakladi=soylenen.length<turler.length;
  const tavir=sakladi?'yalan':'dogru';
  const gerginlik=gerginlikHesap(v,c.kisi,tavir);
  if(!soylenen.length) return sonuc(c,{tavir,gerginlik,iddialar:[{tur:'iliski',kisi:c.kisi,hedef:X,iliskiler:['iyi']}],metin:c.kur('iliski-iyi',{kim})});
  const tur=soylenen[0], tablo=c.dil.oyun.iliskiSoz[tur];
  const cins=v.kisiler[X].cinsiyet;
  const yuklem=typeof tablo==='string'?tablo:tablo[cins]??tablo.E;
  const iliski=doldur(sec(Array.isArray(yuklem)?yuklem:[yuklem],c.r),{kim});
  return sonuc(c,{tavir,gerginlik,iddialar:[{tur:'iliski',kisi:c.kisi,hedef:X,iliskiler:[tur]}],metin:c.kur('iliski',{kim,iliski})});
}

/* ---------------- Yüzleştirme ---------------- */

// Konuşanın çelişkideki kendi ifadesine motorun ne dediğini yeniden sorar ve ona göre direnir ya da çözülür.
function yuzlesmeCevabi(c){
  const k=c.defter?.celiskiler.find(x=>x.id===c.soru.celiski);
  if(!k) throw new Error('yuzlesme: çelişki defterde yok: '+c.soru.celiski);
  const fa=ifadeBul(c.defter,k.a), fb=ifadeBul(c.defter,k.b);
  const kendi=[fa,fb].filter(f=>f.kisi===c.kisi).sort((x,y)=>y.id.localeCompare(x.id,undefined,{numeric:true}))[0];
  const diger=kendi===fa?fb:fa;
  const digerAd=c.kd(diger.kisi);
  const v=c.vaka;
  // Kendi ifadesi motorun sorabildiği bir olguya dayanıyorsa yeniden sor; yoksa (dolaylı, ilişki) doğru saymaz, direnir.
  const f=kendi?.olgu?ifade(v,c.kisi,kendi.olgu,{gun:c.gun}):null;
  if(!f||f.tavir==='dogru'||f.tavir==='abarti'||f.tavir==='bilmez'){
    let metin=c.kur('yuzlesme-israr-dogru',{diger:digerAd});
    // Aynı sözü yinelemek yeni önerme değildir (yeniden yazılırsa aynı çelişki sonsuza dek çoğalır).
    const iddialar=[];
    // Kendi yeri soruluyorsa yanında olan birini tanık gösterir.
    if(kendi?.olgu?.tur==='konum'&&kendi.olgu.kisi===c.kisi){
      const t=kendi.olgu.zaman, P=v.cizelge[c.kisi][t];
      const W=Object.keys(v.cizelge).sort().find(x=>x!==c.kisi&&v.cizelge[x][t]===P&&P!=null&&(v.kisiler[x].olum==null||v.kisiler[x].olum>=c.S));
      if(W){ metin+=' '+c.kur('yuzlesme-tanik',{kim:c.kd(W)}); iddialar.push({tur:'konum',kisi:W,zaman:t,mekan:P}); }
    }
    return sonuc(c,{olgu:kendi?.olgu??null,tavir:'dogru',kural:f?.kural??null,gerginlik:Math.min(1,(f?.gerginlik??.2)+.05),iddialar,metin});
  }
  const g=Math.min(1,f.gerginlik+.15);
  if(f.tavir==='susar') return sonuc(c,{olgu:kendi.olgu,tavir:'susar',kural:f.kural,gerginlik:g,iddialar:[{tur:'susar'}],metin:c.kur('kendi-susar-sir')});
  const o=kendi.olgu, b=f.bilgi;
  // Masum, sırrı yüzünden yalan söylemişti: gerçek yeri ve sırrı açılır.
  if(f.kural==='sir-saklama'){
    if(o.tur==='konum'&&b?.deger){
      const n=v.neden[c.kisi][o.zaman]||'';
      const notlar=[], iddialar=[{tur:'konum',kisi:c.kisi,zaman:o.zaman,mekan:b.deger}];
      if(n.startsWith('sir:')){
        const id=n.slice(4), s=v.sirlar.find(x=>x.id===id&&(x.sahip===c.kisi||x.kimler.includes(c.kisi)));
        if(s){ const sn=sirNotu(c,s.sahip,s.id); if(sn) notlar.push(sn); iddialar.push({tur:'sir',sahip:s.sahip,sir:s.id}); }
      }
      return sonuc(c,{olgu:o,tavir:'dogru',kural:'itiraf',gerginlik:g,iddialar,notlar,metin:c.kur('yuzlesme-itiraf-yer',{zaman:c.zs(o.zaman),yer:c.yer(b.deger)})});
    }
    if(o.tur==='sir'){
      const sn=sirNotu(c,o.sahip,o.sir);
      return sonuc(c,{olgu:o,tavir:'dogru',kural:'itiraf',gerginlik:g,iddialar:[{tur:'sir',sahip:o.sahip,sir:o.sir}],notlar:sn?[sn]:[],metin:c.kur('yuzlesme-itiraf-sir')});
    }
  }
  // Seven korur ama çelişki karşısında çözülür: bildiği gerçeği söyler.
  if(f.kural==='seven-korur'&&o.tur==='konum'&&b){
    const kim=c.kd(o.kisi), zaman=c.zs(o.zaman);
    const bas=c.kur('yuzlesme-cozulme',{kim});
    if(b.degil!=null) return sonuc(c,{olgu:o,tavir:'dogru',kural:'cozulme',gerginlik:g,iddialar:[{tur:'degil',kisi:o.kisi,zaman:o.zaman,mekan:b.degil}],
      metin:bas+' '+(b.degil===c.ev?c.kur('baskasi-yatak-bos',{kim,zaman}):c.kur('baskasi-degil',{kim,zaman,yer:c.yer(b.degil,o.kisi)}))});
    return sonuc(c,{olgu:o,tavir:'dogru',kural:'cozulme',gerginlik:g,iddialar:[{tur:'konum',kisi:o.kisi,zaman:o.zaman,mekan:b.deger}],
      metin:bas+' '+(b.deger===c.ev?c.kur('baskasi-evde',{kim,zaman}):c.kur('baskasi-yer',{kim,zaman,yer:c.yer(b.deger,o.kisi)}))});
  }
  // Kendi eşyasını inkâr eden masum kabul eder ve açıklar.
  if(f.kural==='masum-esya'&&o.tur==='esya'){
    const iz=izBul(v,o.iz), a=aciklama(c,iz);
    return sonuc(c,{olgu:o,tavir:'dogru',kural:'itiraf',gerginlik:g,iddialar:[{tur:'sahip',iz:iz.id,kisi:c.kisi},...a.iddialar],
      metin:c.kur('yuzlesme-itiraf-esya',{esya:izAdi(iz,c.dil)})+' '+a.metin});
  }
  // Katil, suç ortağı, örten: direnir.
  return sonuc(c,{olgu:o,tavir:'yalan',kural:f.kural,gerginlik:g,iddialar:[],metin:c.kur('yuzlesme-israr-yalan',{diger:digerAd})});
}

/* ---------------- Selam ---------------- */

// Kapıdan girerken. Gerginlik: katil olmak, bilinen bir cinayet anında gizli bir işi olmak (masumlar da gerilir).
export function selamUret({vaka,kisi,gun,dil=DIL_TR}){
  const c=baglam({vaka,kisi,soru:{id:'selam@'+gun,tur:'selam'},gun,dil});
  const mt=ifadeMotoru(vaka);
  const gizli=vaka.cinayetler.some(x=>x.zaman<c.S&&mt.konumSucu(kisi,x.zaman));
  const g=gerginlikHesap(vaka,kisi,'dogru',gizli?.15:0)-(katilMi(vaka,kisi)?.15:0);
  return sonuc(c,{tavir:'dogru',gerginlik:Math.max(0,g),metin:c.kur('selam')});
}

const ISLEYICI={yer:yerCevabi,gordu:gorduCevabi,baskasi:baskasiCevabi,iz:izCevabi,fail:failCevabi,fark:farkCevabi,
  sir:sirCevabi,'sir-kendi':sirKendiCevabi,iliski:iliskiCevabi,yuzlesme:yuzlesmeCevabi};

export const CEVAP_TURLERI=Object.keys(ISLEYICI);

/**
 * @param {{vaka:Object, kisi:string, soru:{id:string,tur:string}, gun:number, defter?:Object, dil?:Object}} g
 */
export function cevapUret(g){
  const f=ISLEYICI[g.soru?.tur];
  if(!f) throw new Error('Bilinmeyen soru türü: '+g.soru?.tur);
  if(!g.vaka.kisiler[g.kisi]) throw new Error('Bilinmeyen kişi: '+g.kisi);
  return f(baglam(g));
}

// Motorun ham ifadesini dışarıya da açar (araçlar ve testler için).
export {ifade};
