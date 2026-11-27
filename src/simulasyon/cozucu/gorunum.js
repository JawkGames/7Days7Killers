// Oyuncu görünümü: vakanın yalnızca oyuncunun ulaşabildiği yüzü.
// Çözücü vakanın kendisini hiç görmez, yalnızca bu nesneyi alır. Görünüm şunları verir:
//   - köyün herkesçe bilinen hâli (kişilerin evi, işi, örtüsü, eşyaları, mizacı; komşuluk haritası),
//   - her günün fotoğrafı (cinayet anı, yer, kurban, cesedi bulan ve fotoğraftaki fiziksel izler; izin sahibi YOK),
//   - sorgu: ifade() motorunun ağızdan çıkan cevabı (`soylenen`), asla gerçeği, tavrı ya da kuralı değil.
// Gerçek (katil, sahip, yanıltıcı, gercek.neden, izin bırakıldığı an) görünümde bulunmaz. İz kimlikleri de
// vakadakiler değildir: sıraları izin türünü ele vermesin diye tohumla karıştırılmış opak kimliklerdir.
// Opak kimliklerin vakadaki karşılığı ayrı dönen `eslem` nesnesindedir; onu yalnızca kalite eleği kullanır.

import {ifadeMotoru} from '../yalan.js';
import {karma} from '../zar.js';
import {esyaIzi} from '../tablolar.js';
import {AYARLAR} from '../../cekirdek/ayarlar.js';

const kopya=x=>x==null?x:JSON.parse(JSON.stringify(x));
const dondur=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x)) dondur(v); Object.freeze(x);} return x;};

// Döner: {gorunum, eslem}. gorunum çözücüye verilir; eslem kalite eleğinde kalır.
export function oyuncuGorunumu(vaka,secenek={}){
  const mt=ifadeMotoru(vaka);
  const D=vaka.ayar.dilimler.length, G=vaka.ayar.gunSayisi;
  const sabah=Math.max(0,vaka.ayar.dilimler.indexOf('sabah'));
  const sorguAni=gun=>(gun-1)*D+sabah;
  const ids=Object.keys(vaka.kisiler).sort();
  const tohum=[vaka.tohum,vaka.deneme];

  // Opak iz kimlikleri: fiziksel izler 'f', dolaylı izler 'd'.
  const opak=(onek,l)=>{
    const s=[...l].sort((a,b)=>karma(...tohum,onek,a.id)-karma(...tohum,onek,b.id)||(a.id<b.id?-1:1));
    const ileri={}, geri={};
    s.forEach((i,n)=>{ileri[i.id]=onek+(n+1); geri[onek+(n+1)]=i.id;});
    return {ileri,geri};
  };
  const fiz=opak('f',vaka.izler.filter(i=>i.tur==='fiziksel'));
  const dol=opak('d',vaka.izler.filter(i=>i.tur==='dolayli'));
  const izById=Object.fromEntries(vaka.izler.map(i=>[i.id,i]));

  // Fotoğraflar: her cinayet kendi fotoğraf gününde masaya gelir.
  const fotograflar=vaka.cinayetler.map(c=>({
    cinayet:c.id, gun:c.fotografGunu, zaman:c.zaman, mekan:c.mekan, kurban:c.kurban,
    bulan:c.bulunma.bulan, bulunmaZamani:c.bulunma.zaman,
    izler:c.izler.map(id=>izById[id]).filter(i=>i.tur==='fiziksel').map(i=>({
      id:fiz.ileri[i.id], alt:i.alt, anahtar:i.anahtar, ...(i.iztur?{iztur:i.iztur}:{}),
      adaylar:i.alt==='kurban-esyasi'?[c.kurban]:[...(i.adaylar||[])],
      ...(i.alt==='yara'?{kisi:c.kurban}:{}),
      ...(i.gercek&&i.gercek.gosterdigiDilim?{saat:i.gercek.gosterdigiDilim}:{}), // durmuş saatin gösterdiği dilim
    })).sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1))),
  })).sort((a,b)=>a.gun-b.gun||a.zaman-b.zaman);
  dondur(fotograflar);
  const bilinen=gun=>fotograflar.filter(f=>f.gun<=gun);

  const kisiler={};
  for(const id of ids){
    const k=vaka.kisiler[id];
    kisiler[id]={ev:k.ev,is:k.is,cinsiyet:k.cinsiyet,yas:k.yas,mizac:k.mizac,ortu:k.ortu,esyalar:[...k.esyalar]};
  }
  dondur(kisiler);
  // Aile bağları (eş, ana-baba, çocuk) köyde herkesçe bilinir; öteki ilişkiler (sevda, borç, korku) bilinmez.
  const aile={};
  for(const id of ids) aile[id]=[];
  for(const i of vaka.iliskiler) if(['es','ebeveyn','cocuk'].includes(i.tur)&&aile[i.kimden]&&!aile[i.kimden].includes(i.kime)) aile[i.kimden].push(i.kime);
  for(const id of ids) aile[id].sort();
  dondur(aile);

  // Ağızdan çıkanı temizler: silüetin kim olduğu söylenmez (yalnızca örtüsü), dolaylı izin kimliği opaklaşır.
  const temizle=(o,s)=>{
    if(s==null) return null;
    if(o.tur==='gorulen') return {deger:s.deger.map(e=>{
      if(e.ses) return {kisi:null,mekan:e.mekan,ses:e.ses};
      if(e.kesinlik==='siluet') return {kisi:null,mekan:e.mekan,kesinlik:'siluet',ortu:e.ortu??null,...(e.abarti?.tahmin?{tahmin:e.abarti.tahmin}:{}),...(e.abarti?{abarti:true}:{})};
      return {kisi:e.kisi,mekan:e.mekan,kesinlik:'yuz',...(e.abarti?{abarti:true}:{})};
    })};
    if(o.tur==='fark') return {deger:s.deger.map(e=>({
      id:dol.ileri[e.iz], alt:e.alt, kisi:e.kisi, zaman:e.zaman, mekan:e.mekan,
      ...(e.esya?{esya:e.esya,anahtar:esyaIzi(e.esya).iz}:{}), ...(e.ortu?{ortu:e.ortu}:{}), ...(e.abarti?{abarti:true}:{}),
    }))};
    const r={};
    if('deger' in s) r.deger=s.deger;
    if(s.degil) r.degil=s.degil;
    if(s.adaylar) r.adaylar=[...s.adaylar];
    if(s.abarti) r.abarti=true;
    return r;
  };
  const CEVAP={dogru:'soyledi',yalan:'soyledi',abarti:'soyledi',susar:'sustu',bilmez:'bilmiyor',olu:'olu'};

  // Oyuncunun o gün sorabileceği bir olgu mu? (bilmediği cinayet, görmediği iz sorulamaz)
  function olguDenetle(o,gun){
    const f=bilinen(gun);
    switch(o&&o.tur){
      case 'konum': if(!ids.includes(o.kisi)) return 'bilinmeyen kişi'; // düşer
      // eslint-disable-next-line no-fallthrough
      case 'gorulen': return f.some(x=>o.zaman===x.zaman||o.zaman===x.zaman-1)?null:'bu an için bilinen bir olay yok';
      case 'fail': case 'fark': return f.some(x=>x.cinayet===o.cinayet)?null:'bu cinayet henüz bilinmiyor';
      case 'esya': return f.some(x=>x.izler.some(i=>i.id===o.iz))?null:'bu iz henüz görülmedi';
    }
    return 'bu soru sorulamaz';
  }

  // Sorgu: konusan'a gun günü olgu sorulur. Olgu opak kimliklerle verilir ({tur:'esya', iz:'f3'}).
  // Döner: {konusan, olgu, gun, cevap:'soyledi'|'sustu'|'bilmiyor'|'olu', soylenen}
  function sorgula(konusan,olgu,gun){
    if(!ids.includes(konusan)) throw new Error(`sorgula: bilinmeyen kişi ${konusan}`);
    if(!(gun>=1&&gun<=G)) throw new Error(`sorgula: gün 1-${G} olmalı`);
    const hata=olguDenetle(olgu,gun);
    if(hata) throw new Error(`sorgula: ${hata} (${JSON.stringify(olgu)}, ${gun}. gün)`);
    const ic=olgu.tur==='esya'?{tur:'esya',iz:fiz.geri[olgu.iz]}:olgu;
    const f=mt.ifade(konusan,ic,{gun});
    let cevap=CEVAP[f.tavir]??'bilmiyor', soylenen=cevap==='soyledi'?temizle(olgu,f.soylenen):null;
    // "Bilmiyorum" ile "kimseyi söylemedi" oyuncu için aynı cümledir.
    if(soylenen&&'deger' in soylenen&&soylenen.deger===null&&(olgu.tur==='fail'||olgu.tur==='esya')){cevap='bilmiyor'; soylenen=null;}
    return dondur({konusan,olgu:kopya(olgu),gun,cevap,soylenen});
  }

  const gorunum=dondur({
    ayar:{gunSayisi:G,dilimler:[...vaka.ayar.dilimler],gunlukSorguHakki:secenek.gunlukSorguHakki??AYARLAR.gunlukSorguHakki,sorguAni:[...Array(G)].map((_,i)=>sorguAni(i+1))},
    kisiIdleri:[...ids],
    kisiler,
    aile,
    harita:kopya(vaka.harita),
    // Herkesçe bilinen kural: eşya olay yerinde hangi izi bırakır ("kırmızı yün ipi").
    esyaIzi:e=>esyaIzi(e).iz,
    fotograflar:gun=>bilinen(gun??G),
    sorgula,
  });
  const eslem=Object.freeze({fizikselIz:id=>fiz.geri[id]??null,dolayliIz:id=>dol.geri[id]??null,fizikselId:id=>fiz.ileri[id]??null,dolayliId:id=>dol.ileri[id]??null});
  return {gorunum,eslem};
}
