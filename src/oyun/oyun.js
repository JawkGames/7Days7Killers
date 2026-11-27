// Oyun akışı: zaman durum makinesi (cekirdek/zaman.js) + vaka (simulasyon) + defter (diyalog/defter.js).
// Saf katman: "oyun durumu + eylem → yeni durum + gösterilecekler". Ekran, girdi ve kayıt bilmez;
// terminal (araclar/oyna.js) ve tarayıcı (prototip/metin-oyunu) aynı katmanı kullanır.
//
//   const b = baglamKur({tohum, koy});              // ağır kısım (vaka); durumun dışında tutulur
//   let d = oyunBaslat({tohum});                   // {surum, tohum, zaman, defter}: düz veri, kayda olduğu gibi girer
//   let g = acilis(b, d);                          // ilk ekranın gösterilecekleri
//   secenekler(b, d)                               // [{etiket, eylem}] şu an yapılabilecekler
//   ({durum:d, goster:g} = uygula(b, d, eylem));   // eylem: secenekler'den biri ya da defter eylemi
//   defterGorunumu(b, d)                           // defter paneli için hazır satırlar
//
// Gösterilecek parça: {tur:'baslik'|'anlatim'|'soru'|'soz'|'sahne'|'sistem'|'ayrac', metin, kisi?, tepki?}
// Defter eylemleri her adımda geçerlidir: {tur:'karsilastir', a, b}, {tur:'isaretle', kisi, isaret}.

import {zamanBaslat,ilerle,cagir,geriSar,hukumVer,kalanSorgu} from '../cekirdek/zaman.js';
import {AYARLAR} from '../cekirdek/ayarlar.js';
import {vakaUret,MUDAHALE_TURLERI} from '../simulasyon/index.js';
import {doldur,sec,cumleKur} from '../diyalog/kalip.js';
import {defterYeni,cinayetEkle,izEkle,izBulunduMu,ifadeEkle,bugunSorulan,karsilastir,isaretle,ifadeBul,ogrenilenSirlar,gozlemEkle,tedbirEkle} from '../diyalog/defter.js';
import {sorulariUret} from '../diyalog/soru.js';
import {cevapUret,selamUret,sorguZamani} from '../diyalog/cevap.js';
import {DIL_TR,rngAl,kisiDeger,kisiYazi,mekanDeger,mekanYazi,izAdi,izGorunus,ortuYazi} from '../diyalog/adlar.js';
import {zamanSozu,zamanDefter,gunBasligi,dilimAdi,siraSozu} from '../dil/tr/zaman.js';
import {OYUN_AYAR} from './ayar.js';

export const OYUN_SURUMU=1;

/* ---------------- Kurulum ---------------- */

export function baglamKur({tohum,koy=null,vaka=null,dil=DIL_TR,ayar=AYARLAR}){
  const v=vaka??vakaUret(tohum,koy);
  const g=gorunusKur(v,dil);
  // Müdahaleli vakalar (tedbirler) bu önbellekte; durumun dışında tutulur (durumdan yeniden kurulabilir).
  const vakalar=new Map([['',g]]);
  return {tohum,vaka:v,dil,ayar,koy,fiziksel:g.fiziksel,kamuIzler:g.kamuIzler,ids:Object.keys(v.kisiler).sort(),vakalar,izKayit:new Map(g.fiziksel.map(i=>[i.id,i]))};
}

// Bir vakanın oyuncuya dönük yüzü: fiziksel izler ve herkesin bildiği iz görünüşü (soru üretimi gerçeği değil bunu okur).
function gorunusKur(v,dil){
  const fiziksel=v.izler.filter(i=>i.tur==='fiziksel');
  const kamuIzler={};
  for(const i of fiziksel) kamuIzler[i.id]={ad:izAdi(i,dil),cinayet:i.cinayet,
    sorulabilir:i.alt==='esya'||i.alt==='silah'||(i.alt==='yara'&&!!i.sahip),...(i.ortu&&!i.esya?{ortu:i.ortu}:{})};
  return {vaka:v,fiziksel,kamuIzler,cinayetler:new Set(v.cinayetler.map(c=>c.id))};
}

// Bu döngüde alınmış tedbirler (defterde, döngüsüyle).
export const tedbirler=d=>(d.defter.tedbirler||[]).filter(t=>t.dongu===d.zaman.dongu);
const tedbirAnahtari=l=>JSON.stringify(l.map(t=>[t.tur,t.kisi??t.mekan,t.gun]));

// Durumun zaman çizgisi: bu döngünün tedbirleriyle yeniden koşulmuş vaka (tedbir yoksa temel vaka).
function gorunusAl(b,d){
  const l=tedbirler(d);
  if(!l.length||!b.koy) return b.vakalar.get('');
  const k=tedbirAnahtari(l);
  if(!b.vakalar.has(k)){
    const v=vakaUret(b.tohum,b.koy,{mudahaleler:l.map(t=>({tur:t.tur,gun:t.gun,...(t.tur==='nobet'?{mekan:t.mekan}:{kisi:t.kisi})})),taban:b.vaka});
    const g=gorunusKur(v,b.dil);
    b.vakalar.set(k,g);
    for(const i of g.fiziksel) if(!b.izKayit.has(i.id)) b.izKayit.set(i.id,i);
  }
  return b.vakalar.get(k);
}
export const vakaAl=(b,d)=>gorunusAl(b,d).vaka;

export function oyunBaslat({tohum,ayar=AYARLAR}){
  return {surum:OYUN_SURUMU,tohum,zaman:zamanBaslat({tohum,ayar}),defter:defterYeni()};
}

// Kayıttan dönen veriden durum ({tohum, zaman, defter} yeter).
export const durumKur=({zaman,defter})=>({surum:OYUN_SURUMU,tohum:zaman.tohum,zaman,defter});

/* ---------------- Yardımcılar ---------------- */

const O=b=>b.dil.oyun;
const parca=(tur,metin,ek={})=>({tur,metin,...ek});
const ad=(b,id)=>kisiYazi(id,b.dil);
const V=(b,d)=>vakaAl(b,d);
const S=(b,d)=>sorguZamani(b.vaka,d.zaman.gun);
const canli=(v,id,t)=>{const o=v.kisiler[id].olum; return o==null||o>t;};
const yasiyor=(b,d,id)=>canli(V(b,d),id,S(b,d));
const kimlik=d=>({gun:d.zaman.gun,dongu:d.zaman.dongu});
const r=(b,...p)=>rngAl(b.tohum,'oyun',...p);

// Bugün masada olan cinayetler (fotoğrafı gelmiş, bu zaman çizgisinde işlenmiş).
const masadakiler=(b,d)=>V(b,d).cinayetler.filter(c=>c.fotografGunu<=d.zaman.gun&&c.zaman<S(b,d));
const fotoIzleri=(b,d,c)=>gorunusAl(b,d).fiziksel.filter(i=>i.cinayet===c.id);
const izBul=(b,d,id)=>gorunusAl(b,d).fiziksel.find(i=>i.id===id)??b.izKayit.get(id)??null;

function kamu(b,d){
  const v=V(b,d), g=gorunusAl(b,d), kisiler={};
  for(const id of b.ids) kisiler[id]={ev:v.kisiler[id].ev,ortu:v.kisiler[id].ortu};
  return {dilimler:v.ayar.dilimler,sorguZamani:S(b,d),kisiler,canli:(id,t)=>canli(v,id,t),izler:g.kamuIzler,cinayetler:g.cinayetler};
}

// Gün sonunda, bu gün için henüz tedbir alınmadıysa ve son gün değilse bir tedbir alınabilir (müdahale vakayı yeniden kurar).
export function tedbirAlinabilir(b,d){
  return !!b.koy&&d.zaman.adim==='gun-sonu'&&d.zaman.gun<d.zaman.kural.gunSayisi&&!tedbirler(d).some(t=>t.gun===d.zaman.gun);
}
function tedbirSozu(b,t,tablo){
  return doldur(tablo[t.tur],t.tur==='nobet'?{yer:mekanDeger(t.mekan,{},b.dil)}:{kim:kisiDeger(t.kisi,b.dil)});
}

function sabir(b,kisi){return OYUN_AYAR.sabir[b.vaka.kisiler[kisi].mizac]??5;}

/* ---------------- Ekran parçaları ---------------- */

// Gün başı: yeni fotoğraflar deftere girer.
function gunBasiGir(b,d){
  const g=[parca('baslik',doldur(O(b).akis.gunBaslik,{gun:gunBasligi(d.zaman.gun)}))];
  const yeni=V(b,d).cinayetler.filter(c=>c.fotografGunu===d.zaman.gun&&c.zaman<S(b,d));
  let defter=d.defter;
  for(const c of masadakiler(b,d)){
    defter=cinayetEkle(defter,{id:c.id,kurban:c.kurban,mekan:c.mekan,zaman:c.zaman,bulan:c.bulunma.bulan,fotografGunu:c.fotografGunu},kimlik(d));
    defter=gozlemEkle(defter,c.id,kimlik(d));
  }
  for(const t of tedbirler(d).filter(t=>t.gun===d.zaman.gun-1)) g.push(parca('anlatim',tedbirSozu(b,t,O(b).akis.tedbirSonrasi)));
  if(!yeni.length) g.push(parca('anlatim',O(b).akis.yeniCinayetYok));
  for(const c of yeni) g.push(parca('anlatim',doldur(O(b).akis.yeniCinayet,{kurban:kisiDeger(c.kurban,b.dil),yer:mekanDeger(c.mekan,{},b.dil),bulan:kisiDeger(c.bulunma.bulan,b.dil)})));
  if(masadakiler(b,d).length>yeni.length) g.push(parca('anlatim',O(b).akis.eskiFotograflar));
  return {durum:{...d,defter},goster:g};
}

function izMetni(b,iz,d){
  const c=(d?V(b,d).cinayetler.find(x=>x.id===iz.cinayet):null)??[...b.vakalar.values()].map(g=>g.vaka.cinayetler.find(x=>x.id===iz.cinayet)).find(Boolean);
  const a=izAdi(iz,b.dil);
  if(iz.anahtar==='durmus-saat'){
    const dl=iz.gercek?.gosterdigiDilim;
    return a+(dl?`, ${dilimAdi(dl)} vaktinde durmuş`:'');
  }
  if(iz.alt==='kurban-esyasi') return doldur('{k:in} {e:si}',{k:kisiDeger(c.kurban,b.dil),e:a});
  return a;
}

function fotografGoster(b,d){
  const g=[];
  for(const c of masadakiler(b,d).slice().reverse()){
    g.push(parca('baslik',doldur(O(b).akis.fotografBaslik,{kurban:ad(b,c.kurban),yer:mekanYazi(c.mekan,b.dil),zaman:zamanDefter(c.zaman,{dilimler:b.vaka.ayar.dilimler})})));
    for(const iz of fotoIzleri(b,d,c)){
      if(izBulunduMu(d.defter,iz.id)) g.push(parca('sistem',doldur(O(b).akis.fotografBulunan,{iz:izMetni(b,iz,d)})));
      else g.push(parca('anlatim',izGorunus(iz,b.dil)+'.'));
    }
  }
  return g;
}

function cagirmaGoster(b,d){
  const n=kalanSorgu(d.zaman);
  return [parca('sistem',n>0?doldur(O(b).akis.cagirmaBaslik,{n}):O(b).akis.cagirmaHakYok)];
}

/* ---------------- Seçenekler ---------------- */

export function secenekler(b,d){
  const z=d.zaman, A=O(b).akis, l=[];
  const s=(etiket,eylem)=>l.push({etiket,eylem});
  switch(z.adim){
    case 'gun-basi': s(A.fotograflaraBak,{tur:'ilerle'}); break;
    case 'fotograf':
      for(const c of masadakiler(b,d).slice().reverse()) for(const iz of fotoIzleri(b,d,c)) if(!izBulunduMu(d.defter,iz.id))
        s(doldur(A.incele,{gorunus:izGorunus(iz,b.dil),kurban:ad(b,c.kurban)}),{tur:'incele',iz:iz.id});
      s(A.fotografKaldir,{tur:'ilerle'});
      break;
    case 'cagirma':
      if(z.sorguKalan>0) for(const id of b.ids){
        if(!yasiyor(b,d,id)||z.cagrilanlar.includes(id)) continue;
        const is=d.defter.isaretler[id];
        s(is?doldur(A.cagirIsaret,{kim:ad(b,id),isaret:O(b).defter[is]}):doldur(A.cagir,{kim:ad(b,id)}),{tur:'cagir',kisi:id});
      }
      s(A.gunuBitir,{tur:'ilerle'});
      break;
    case 'sorgu':
      for(const q of sorular(b,d)) s(q.etiket,{tur:'sor',soru:q.id});
      s(A.gonder,{tur:'ilerle'});
      break;
    case 'gun-sonu':
      if(tedbirAlinabilir(b,d)){
        if(d.tedbirSecimi){
          if(d.tedbirSecimi==='nobet') for(const m of Object.keys(b.vaka.harita).sort()) s(doldur(A.tedbirSec.nobet,{yer:mekanDeger(m,{},b.dil)}),{tur:'tedbir',tedbir:'nobet',mekan:m});
          else for(const id of b.ids) if(yasiyor(b,d,id)) s(doldur(A.tedbirSec[d.tedbirSecimi],{kim:kisiDeger(id,b.dil)}),{tur:'tedbir',tedbir:d.tedbirSecimi,kisi:id});
          s(A.tedbirVazgec,{tur:'tedbirSec',tedbir:null});
          break;
        }
        for(const t of MUDAHALE_TURLERI) s(A.tedbir[t],{tur:'tedbirSec',tedbir:t});
      }
      s(A.ertesiGun,{tur:'ilerle'}); break;
    case 'karar':
      s(A.rewind,{tur:'geriSar'});
      s(A.verdict,{tur:'hukum',kisiler:null});
      break;
  }
  return l;
}

export function sorular(b,d){
  if(d.zaman.adim!=='sorgu') return [];
  return sorulariUret({defter:d.defter,kisi:d.zaman.sorgudaki,gun:d.zaman.gun,tohum:b.tohum,kamu:kamu(b,d),dil:b.dil});
}

// Hükümde seçilebilecekler: o an yaşayanlar.
export const hukumAdaylari=(b,d)=>b.ids.filter(id=>canli(V(b,d),id,(d.zaman.gun-1)*b.vaka.ayar.dilimler.length+b.vaka.ayar.dilimler.length-1));

/* ---------------- Eylemler ---------------- */

export function acilis(b,d){
  if(d.zaman.adim==='gun-basi'&&d.zaman.gun===1&&d.zaman.dongu===1&&!d.defter.cinayetler.length){
    const {durum,goster}=gunBasiGir(b,d);
    return {durum,goster:[...O(b).akis.acilis.map(m=>parca('anlatim',m)),parca('ayrac',''),...goster]};
  }
  return {durum:d,goster:ekran(b,d)};
}

// Kayıttan dönünce ya da yeniden çizerken bulunulan adımın ekranı.
export function ekran(b,d){
  const z=d.zaman;
  switch(z.adim){
    case 'gun-basi': return gunBasiGir(b,d).goster;
    case 'fotograf': return fotografGoster(b,d);
    case 'cagirma': return cagirmaGoster(b,d);
    case 'sorgu': return [parca('anlatim',doldur(O(b).akis.giris,{kim:kisiDeger(z.sorgudaki,b.dil)}))];
    case 'gun-sonu': return [parca('anlatim',gunSonuMetni(b,d))];
    case 'karar': return [parca('baslik',O(b).akis.karar)];
    case 'bitti': return sonGoster(b,d);
  }
  return [];
}

function gunSonuMetni(b,d){
  if(d.zaman.gun===d.zaman.kural.gunSayisi) return O(b).akis.gunSonuSon;
  return sec(O(b).akis.gunSonu,r(b,'gece',d.zaman.gun,d.zaman.dongu));
}

export function uygula(b,d,eylem){
  if(!eylem||!eylem.tur) throw new Error('uygula: eylem gerekli');
  const z=d.zaman, A=O(b).akis;
  switch(eylem.tur){
    case 'karsilastir':{
      const k=karsilastir(d.defter,eylem.a,eylem.b,kimlik(d));
      const m=!k.celiski?A.karsilastirTutarli:k.yeni?A.karsilastirCeliski:A.karsilastirEski;
      return {durum:{...d,defter:k.defter},goster:[parca('sistem',m)],celiski:k.celiski};
    }
    case 'isaretle':{
      const defter=isaretle(d.defter,eylem.kisi,eylem.isaret??null);
      const m=eylem.isaret?doldur(A.isaretlendi,{kim:kisiDeger(eylem.kisi,b.dil),isaret:O(b).defter[eylem.isaret]}):doldur(A.isaretKaldirildi,{kim:kisiDeger(eylem.kisi,b.dil)});
      return {durum:{...d,defter},goster:[parca('sistem',m)]};
    }
    case 'incele':{
      if(z.adim!=='fotograf') throw new Error('incele yalnızca fotoğraf adımında');
      const iz=gorunusAl(b,d).fiziksel.find(i=>i.id===eylem.iz);
      if(!iz||!masadakiler(b,d).some(c=>c.id===iz.cinayet)) throw new Error('Bu iz masadaki fotoğraflarda yok: '+eylem.iz);
      if(izBulunduMu(d.defter,iz.id)) return {durum:d,goster:[]};
      const defter=izEkle(d.defter,{iz:iz.id,cinayet:iz.cinayet},kimlik(d));
      const m=doldur(iz.alt==='yara'?A.yaraBulundu:A.izBulundu,{iz:izMetni(b,iz,d)});
      return {durum:{...d,defter},goster:[parca('anlatim',m)]};
    }
    case 'cagir':{
      if(!yasiyor(b,d,eylem.kisi)) throw new Error('Ölü biri çağrılamaz: '+eylem.kisi);
      if(z.cagrilanlar.includes(eylem.kisi)) throw new Error('Bugün zaten çağrıldı: '+eylem.kisi);
      const zaman=cagir(z,eylem.kisi);
      const sel=selamUret({vaka:V(b,d),kisi:eylem.kisi,gun:z.gun,dil:b.dil});
      return {durum:{...d,zaman},goster:[parca('ayrac',''),parca('anlatim',doldur(A.giris,{kim:kisiDeger(eylem.kisi,b.dil)})),
        parca('soz',sel.metin,{kisi:eylem.kisi,tepki:sel.tepki}),parca('sahne',sel.tepki.not,{kisi:eylem.kisi,tepki:sel.tepki})]};
    }
    case 'sor':{
      if(z.adim!=='sorgu') throw new Error('sor yalnızca sorgu adımında');
      const q=sorular(b,d).find(x=>x.id===eylem.soru);
      if(!q) throw new Error('Bu soru şu an sorulamaz: '+eylem.soru);
      const K=z.sorgudaki;
      const c=cevapUret({vaka:V(b,d),kisi:K,soru:q,gun:z.gun,defter:d.defter,dil:b.dil});
      const soru={id:q.id,tur:q.tur,etiket:q.etiket};
      for(const k of ['kisi','zaman','iz','cinayet','celiski']) if(q[k]!=null) soru[k]=q[k];
      const tepki={gerginlik:c.tepki.gerginlik,duzey:c.tepki.duzey,gozKacirma:c.tepki.gozKacirma,duraksama:c.tepki.duraksama,not:c.tepki.not};
      const {defter}=ifadeEkle(d.defter,{kisi:K,soru,olgu:c.olgu,iddialar:c.iddialar,metin:c.metin,tepki},kimlik(d));
      const g=[parca('soru',q.etiket),parca('soz',c.metin,{kisi:K,tepki}),parca('sahne',tepki.not,{kisi:K,tepki}),...c.notlar.map(n=>parca('sistem',n))];
      let yeni={...d,defter};
      const kalan=sabir(b,K)-bugunSorulan(defter,K,kimlik(d));
      if(kalan<=0){
        const mz=b.vaka.kisiler[K].mizac;
        g.push(parca('soz',cumleKur(b.dil.kaliplar,'sabir-bitti',{mizac:mz,rng:r(b,'sabir',K,z.gun,z.dongu)}),{kisi:K}));
        g.push(parca('anlatim',doldur(A.sabirBitti,{kim:kisiDeger(K,b.dil)})));
        yeni={...yeni,zaman:ilerle(yeni.zaman)};
        g.push(...cagirmaGoster(b,yeni));
      }else if(kalan<=2) g.push(parca('sistem',doldur(A.sabirKaldi,{n:kalan})));
      return {durum:yeni,goster:g};
    }
    case 'tedbirSec':{
      if(z.adim!=='gun-sonu'||!tedbirAlinabilir(b,d)) throw new Error('Şu an tedbir alınamaz');
      if(eylem.tedbir!=null&&!MUDAHALE_TURLERI.includes(eylem.tedbir)) throw new Error('Bilinmeyen tedbir: '+eylem.tedbir);
      const {tedbirSecimi:_,...temiz}=d;
      return {durum:eylem.tedbir?{...temiz,tedbirSecimi:eylem.tedbir}:temiz,goster:eylem.tedbir?[parca('sistem',A.tedbirSoru[eylem.tedbir])]:[]};
    }
    case 'tedbir':{
      if(z.adim!=='gun-sonu'||!tedbirAlinabilir(b,d)) throw new Error('Şu an tedbir alınamaz');
      const tur=eylem.tedbir;
      if(!MUDAHALE_TURLERI.includes(tur)) throw new Error('Bilinmeyen tedbir: '+tur);
      if(tur==='nobet'){ if(!b.vaka.harita[eylem.mekan]) throw new Error('Bilinmeyen mekân: '+eylem.mekan); }
      else if(!b.vaka.kisiler[eylem.kisi]||!yasiyor(b,d,eylem.kisi)) throw new Error('Bu kişiye tedbir alınamaz: '+eylem.kisi);
      const t={tur,...(tur==='nobet'?{mekan:eylem.mekan}:{kisi:eylem.kisi}),gun:z.gun};
      const {tedbirSecimi:_,...temiz}=d;
      return {durum:{...temiz,defter:tedbirEkle(d.defter,t,kimlik(d))},goster:[parca('anlatim',tedbirSozu(b,t,A.tedbirAlindi))]};
    }
    case 'ilerle':{
      if(d.tedbirSecimi){const {tedbirSecimi:_,...temiz}=d; d=temiz;}
      if(z.adim==='sorgu'){
        const zaman=ilerle(z), yeni={...d,zaman};
        return {durum:yeni,goster:[parca('anlatim',doldur(A.cikis,{kim:kisiDeger(z.sorgudaki,b.dil)})),...cagirmaGoster(b,yeni)]};
      }
      const zaman=ilerle(z), yeni={...d,zaman};
      if(zaman.adim==='fotograf') return {durum:yeni,goster:fotografGoster(b,yeni)};
      if(zaman.adim==='cagirma') return {durum:yeni,goster:cagirmaGoster(b,yeni)};
      if(zaman.adim==='gun-sonu') return {durum:yeni,goster:[parca('ayrac',''),parca('anlatim',gunSonuMetni(b,yeni))]};
      if(zaman.adim==='gun-basi'){ const x=gunBasiGir(b,yeni); return {durum:x.durum,goster:[parca('ayrac',''),...x.goster]}; }
      if(zaman.adim==='karar') return {durum:yeni,goster:[parca('baslik',A.karar)]};
      return {durum:yeni,goster:[]};
    }
    case 'geriSar':{
      const zaman=geriSar(z), yeni={...d,zaman};
      const x=gunBasiGir(b,yeni);
      return {durum:x.durum,goster:[...A.rewindOldu.map(m=>parca('anlatim',m)),parca('ayrac',''),...x.goster]};
    }
    case 'hukum':{
      const l=eylem.kisiler;
      if(!Array.isArray(l)) throw new Error('hukum: kisiler listesi gerekli');
      const aday=new Set(hukumAdaylari(b,d));
      for(const k of l) if(!aday.has(k)) throw new Error('Seçilemez: '+k);
      const zaman=hukumVer(z,l), yeni={...d,zaman};
      return {durum:yeni,goster:sonGoster(b,yeni)};
    }
  }
  throw new Error('Bilinmeyen eylem: '+eylem.tur);
}

/* ---------------- Son ---------------- */

// Kaç doğru olduğu söylenmez; kayıp sahneleri, pencere ve gerçek sırayla gösterilir.
// Kayıp sahnesinde götürülen HER kişinin evinde ikircikli bir ayrıntı görülür (kan mı pekmez mi belli olmayan bir leke,
// sandıkta sarılı bir şey, külde kumaş): katilinki yöntemine, masumunki sırrına ya da gündelik hâline göre seçilir;
// aynı cümleler ikisinde de çıkabilir. Satırlar sayılarak kaç kişinin katil olduğu çıkarılamaz.
const AYRINTI_KATIL={bicak:{kan:3,yikanmis:2,kul:2},darbe:{kan:3,yikanmis:2,kul:2},bogma:{ip:3,kul:2,yikanmis:1},asma:{ip:3,kul:2,yikanmis:1},
  itme:{camur:3,yikanmis:2},'suda-bogma':{camur:3,yikanmis:2},zehir:{sandik:2,kilit:2,kul:1},tufek:{sandik:2,kilit:2,kul:1}};
function ayrintiSec(v,k,katil,rr){
  const c=v.cinayetler.find(x=>x.katil===k)||v.cinayetler.find(x=>x.yardimci===k);
  const sirli=v.sirlar.some(x=>x.sahip===k);
  const w={kan:.35,sandik:.6,kul:.6,camur:.6,mektup:.6,ip:.35,kilit:.6,yikanmis:.6,bos:.6};
  const ek=katil?(AYRINTI_KATIL[c?.yontem]??{kul:2,sandik:2}):sirli?{mektup:2,sandik:2,kilit:2}:{camur:1.5,yikanmis:1,bos:2,kul:1};
  for(const [x,n] of Object.entries(ek)) w[x]+=n;
  let top=Object.values(w).reduce((a,x)=>a+x,0), u=rr()*top;
  for(const [x,n] of Object.entries(w)){u-=n; if(u<0) return x;}
  return 'bos';
}

export function sonGoster(b,d){
  const v=V(b,d), S_=O(b).son, secilen=d.zaman.hukum||[];
  const katiller=new Set(v.katiller.map(k=>k.kisi));
  const dogru=secilen.filter(k=>katiller.has(k)).length;
  const rr=r(b,'son',secilen.join(','));
  const g=[parca('baslik',S_.baslik),parca('anlatim',S_.giris),parca('baslik',S_.kayipBaslik)];
  for(const k of secilen){
    const sahne=b.dil.kisiler[k]?.kayip??'';
    g.push(parca('anlatim',doldur(S_.kayipSatiri,{kim:kisiDeger(k,b.dil),sahne})));
    const tur=ayrintiSec(v,k,katiller.has(k),rr);
    g.push(parca('sahne',doldur(sec(S_.ayrinti[tur],rr),{ortu:ortuYazi(v.kisiler[k].ortu,b.dil)}),{kisi:k}));
  }
  const n=secilen.length||1, oran=dogru/n;
  const pk=oran===1?'hepsi':oran>=.7?'cogu':oran>=.4?'yarim':oran>0?'azi':'hic';
  g.push(parca('baslik',S_.pencereBaslik),parca('anlatim',S_.pencereGiris),parca('anlatim',S_.pencere[pk]));
  g.push(parca('baslik',S_.gercekBaslik));
  for(const c of v.cinayetler){
    g.push(parca('anlatim',doldur(S_.gercekSatiri,{katil:kisiDeger(c.katil,b.dil),kurban:kisiDeger(c.kurban,b.dil),
      zaman:zamanAnlati(b,c.zaman),yer:mekanDeger(c.mekan,{},b.dil),yontem:O(b).yontem[c.yontem]??O(b).yontem.genel,sebep:O(b).sebep[c.sebep.tur]??c.sebep.tur})));
    if(c.yardimci) g.push(parca('anlatim',doldur(S_.yardimciSatiri,{yardimci:kisiDeger(c.yardimci,b.dil)})));
    if(c.yonelme) g.push(parca('anlatim',doldur(S_.yonelmeSatiri,{eski:kisiDeger(c.yonelme.eski,b.dil)})));
  }
  for(const e of v.engellenen||[]) g.push(parca('anlatim',doldur(S_.engelSatiri,{katil:kisiDeger(e.katil,b.dil),kurban:kisiDeger(e.kurban,b.dil)})));
  for(const k of secilen) if(!katiller.has(k)) g.push(parca('anlatim',doldur(S_.masumSatiri,{kim:kisiDeger(k,b.dil)})));
  const kacan=[...katiller].filter(k=>!secilen.includes(k)).sort();
  if(kacan.length){
    g.push(parca('baslik',S_.akibetBaslik));
    const havuz=[...S_.akibet];
    for(const k of kacan){
      const i=Math.floor(rr()*havuz.length), m=havuz.splice(i,1)[0]??S_.akibet[0];
      if(!havuz.length) havuz.push(...S_.akibet);
      const c=v.cinayetler.find(x=>x.katil===k)||v.cinayetler.find(x=>x.yardimci===k);
      const kurban=c?c.kurban:(v.engellenen||[]).find(e=>e.katil===k)?.kurban;
      g.push(parca('anlatim',doldur(m,{kim:kisiDeger(k,b.dil),kurban:kisiDeger(kurban,b.dil)})));
    }
  }
  g.push(parca('sistem',doldur(S_.bitti,{tohum:String(b.tohum)})));
  return g;
}

function zamanAnlati(b,t){
  const dl=b.vaka.ayar.dilimler, gun=Math.floor(t/dl.length)+1, dilim=dl[t%dl.length], S_=O(b).son;
  const sira=siraSozu(gun);
  return doldur(dilim==='gece'?S_.zamanGece:(S_.zamanGunduz[dilim]??S_.zamanGece),{sira}).toLocaleLowerCase('tr');
}

/* ---------------- Defter görünümü ---------------- */

export function defterGorunumu(b,d){
  const D=O(b).defter, dl=b.vaka.ayar.dilimler, df=d.defter;
  const cinayetler=df.cinayetler.map(c=>({id:c.id,metin:doldur(D.cinayetSatiri,{zaman:zamanDefter(c.zaman,{dilimler:dl}),kurban:kisiDeger(c.kurban,b.dil),yer:mekanDeger(c.mekan,{},b.dil),bulan:kisiDeger(c.bulan,b.dil)})}));
  const izler=df.izler.map(x=>{
    const iz=izBul(b,d,x.iz), c=df.cinayetler.find(y=>y.id===x.cinayet);
    return {id:x.iz,metin:doldur(D.izSatiri,{cinayet:c?ad(b,c.kurban):'?',iz:iz?izMetni(b,iz,d):x.iz})};
  });
  const ifadeler=df.ifadeler.map(f=>({id:f.id,kisi:f.kisi,gun:f.gun,dongu:f.dongu,
    metin:doldur(D.ifadeSatiri,{gun:f.gun,kim:ad(b,f.kisi),soru:f.soru.etiket??'',metin:f.metin})+(f.dongu>1?' '+doldur(D.dongu,{n:f.dongu}):'')}));
  const celiskiler=df.celiskiler.map(k=>({id:k.id,a:k.a,b:k.b,metin:doldur(D.celiskiSatiri,{a:ozet(b,ifadeBul(df,k.a)),b:ozet(b,ifadeBul(df,k.b))})}));
  const sirlar=ogrenilenSirlar(df).map(s=>({sahip:s.sahip,metin:ad(b,s.sahip)+': '+(b.dil.kisiler[s.sahip]?.sirlar?.[s.sir]??s.sir)}));
  const isaretler=Object.entries(df.isaretler).map(([k,v])=>({kisi:k,metin:ad(b,k)+': '+D[v]}));
  const tedbirSatirlari=(df.tedbirler||[]).map(t=>({gun:t.gun,dongu:t.dongu,metin:doldur(D.tedbirSatiri,{gun:t.gun,metin:tedbirSozu(b,t,O(b).akis.tedbirAlindi)})+(t.dongu>1?' '+doldur(D.dongu,{n:t.dongu}):'')}));
  return {cinayetler,izler,ifadeler,celiskiler,sirlar,isaretler,tedbirler:tedbirSatirlari};
}
const ozet=(b,f)=>f?`${ad(b,f.kisi)}: «${f.metin.length>70?f.metin.slice(0,68)+'…':f.metin}»`:'?';

// Kişi listesi (defter ve hüküm ekranı için).
export function kisiListesi(b,d){
  return b.ids.map(id=>({id,ad:ad(b,id),canli:yasiyor(b,d,id),isaret:d.defter.isaretler[id]??null}));
}

export {zamanSozu};
