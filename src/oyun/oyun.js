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
import {vakaUret} from '../simulasyon/index.js';
import {doldur,sec,cumleKur} from '../diyalog/kalip.js';
import {defterYeni,cinayetEkle,izEkle,izBulunduMu,ifadeEkle,bugunSorulan,karsilastir,isaretle,ifadeBul,ogrenilenSirlar} from '../diyalog/defter.js';
import {sorulariUret} from '../diyalog/soru.js';
import {cevapUret,selamUret,sorguZamani} from '../diyalog/cevap.js';
import {DIL_TR,rngAl,kisiDeger,kisiYazi,mekanDeger,mekanYazi,izAdi,izGorunus,ortuYazi} from '../diyalog/adlar.js';
import {zamanSozu,zamanDefter,gunBasligi,dilimAdi,siraSozu} from '../dil/tr/zaman.js';
import {OYUN_AYAR} from './ayar.js';

export const OYUN_SURUMU=1;

/* ---------------- Kurulum ---------------- */

export function baglamKur({tohum,koy,vaka=null,dil=DIL_TR,ayar=AYARLAR}){
  const v=vaka??vakaUret(tohum,koy);
  const fiziksel=v.izler.filter(i=>i.tur==='fiziksel');
  // Herkesin bildiği iz görünüşü: soru üretimi gerçeği değil bunu okur.
  const kamuIzler={};
  for(const i of fiziksel) kamuIzler[i.id]={ad:izAdi(i,dil),cinayet:i.cinayet,
    sorulabilir:i.alt==='esya'||i.alt==='silah'||(i.alt==='yara'&&!!i.sahip),...(i.ortu&&!i.esya?{ortu:i.ortu}:{})};
  return {tohum,vaka:v,dil,ayar,fiziksel,kamuIzler,ids:Object.keys(v.kisiler).sort()};
}

export function oyunBaslat({tohum,ayar=AYARLAR}){
  return {surum:OYUN_SURUMU,tohum,zaman:zamanBaslat({tohum,ayar}),defter:defterYeni()};
}

// Kayıttan dönen veriden durum ({tohum, zaman, defter} yeter).
export const durumKur=({zaman,defter})=>({surum:OYUN_SURUMU,tohum:zaman.tohum,zaman,defter});

/* ---------------- Yardımcılar ---------------- */

const O=b=>b.dil.oyun;
const parca=(tur,metin,ek={})=>({tur,metin,...ek});
const ad=(b,id)=>kisiYazi(id,b.dil);
const S=(b,d)=>sorguZamani(b.vaka,d.zaman.gun);
const canli=(b,id,t)=>{const o=b.vaka.kisiler[id].olum; return o==null||o>t;};
const yasiyor=(b,d,id)=>canli(b,id,S(b,d));
const kimlik=d=>({gun:d.zaman.gun,dongu:d.zaman.dongu});
const r=(b,...p)=>rngAl(b.tohum,'oyun',...p);

// Bugün masada olan cinayetler (fotoğrafı gelmiş, bu zaman çizgisinde işlenmiş).
const masadakiler=(b,d)=>b.vaka.cinayetler.filter(c=>c.fotografGunu<=d.zaman.gun&&c.zaman<S(b,d));
const fotoIzleri=(b,c)=>b.fiziksel.filter(i=>i.cinayet===c.id);

function kamu(b,d){
  const kisiler={};
  for(const id of b.ids) kisiler[id]={ev:b.vaka.kisiler[id].ev,ortu:b.vaka.kisiler[id].ortu};
  return {dilimler:b.vaka.ayar.dilimler,sorguZamani:S(b,d),kisiler,canli:(id,t)=>canli(b,id,t),izler:b.kamuIzler};
}

function sabir(b,kisi){return OYUN_AYAR.sabir[b.vaka.kisiler[kisi].mizac]??5;}

/* ---------------- Ekran parçaları ---------------- */

// Gün başı: yeni fotoğraflar deftere girer.
function gunBasiGir(b,d){
  const g=[parca('baslik',doldur(O(b).akis.gunBaslik,{gun:gunBasligi(d.zaman.gun)}))];
  const yeni=b.vaka.cinayetler.filter(c=>c.fotografGunu===d.zaman.gun&&c.zaman<S(b,d));
  let defter=d.defter;
  for(const c of masadakiler(b,d)) defter=cinayetEkle(defter,{id:c.id,kurban:c.kurban,mekan:c.mekan,zaman:c.zaman,bulan:c.bulunma.bulan,fotografGunu:c.fotografGunu},kimlik(d));
  if(!yeni.length) g.push(parca('anlatim',O(b).akis.yeniCinayetYok));
  for(const c of yeni) g.push(parca('anlatim',doldur(O(b).akis.yeniCinayet,{kurban:kisiDeger(c.kurban,b.dil),yer:mekanDeger(c.mekan,{},b.dil),bulan:kisiDeger(c.bulunma.bulan,b.dil)})));
  if(masadakiler(b,d).length>yeni.length) g.push(parca('anlatim',O(b).akis.eskiFotograflar));
  return {durum:{...d,defter},goster:g};
}

function izMetni(b,iz){
  const c=b.vaka.cinayetler.find(x=>x.id===iz.cinayet);
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
    for(const iz of fotoIzleri(b,c)){
      if(izBulunduMu(d.defter,iz.id)) g.push(parca('sistem',doldur(O(b).akis.fotografBulunan,{iz:izMetni(b,iz)})));
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
      for(const c of masadakiler(b,d).slice().reverse()) for(const iz of fotoIzleri(b,c)) if(!izBulunduMu(d.defter,iz.id))
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
    case 'gun-sonu': s(A.ertesiGun,{tur:'ilerle'}); break;
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
export const hukumAdaylari=(b,d)=>b.ids.filter(id=>canli(b,id,(d.zaman.gun-1)*b.vaka.ayar.dilimler.length+b.vaka.ayar.dilimler.length-1));

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
      const iz=b.fiziksel.find(i=>i.id===eylem.iz);
      if(!iz||!masadakiler(b,d).some(c=>c.id===iz.cinayet)) throw new Error('Bu iz masadaki fotoğraflarda yok: '+eylem.iz);
      if(izBulunduMu(d.defter,iz.id)) return {durum:d,goster:[]};
      const defter=izEkle(d.defter,{iz:iz.id,cinayet:iz.cinayet},kimlik(d));
      const m=doldur(iz.alt==='yara'?A.yaraBulundu:A.izBulundu,{iz:izMetni(b,iz)});
      return {durum:{...d,defter},goster:[parca('anlatim',m)]};
    }
    case 'cagir':{
      if(!yasiyor(b,d,eylem.kisi)) throw new Error('Ölü biri çağrılamaz: '+eylem.kisi);
      if(z.cagrilanlar.includes(eylem.kisi)) throw new Error('Bugün zaten çağrıldı: '+eylem.kisi);
      const zaman=cagir(z,eylem.kisi);
      const sel=selamUret({vaka:b.vaka,kisi:eylem.kisi,gun:z.gun,dil:b.dil});
      return {durum:{...d,zaman},goster:[parca('ayrac',''),parca('anlatim',doldur(A.giris,{kim:kisiDeger(eylem.kisi,b.dil)})),
        parca('soz',sel.metin,{kisi:eylem.kisi,tepki:sel.tepki}),parca('sahne',sel.tepki.not,{kisi:eylem.kisi,tepki:sel.tepki})]};
    }
    case 'sor':{
      if(z.adim!=='sorgu') throw new Error('sor yalnızca sorgu adımında');
      const q=sorular(b,d).find(x=>x.id===eylem.soru);
      if(!q) throw new Error('Bu soru şu an sorulamaz: '+eylem.soru);
      const K=z.sorgudaki;
      const c=cevapUret({vaka:b.vaka,kisi:K,soru:q,gun:z.gun,defter:d.defter,dil:b.dil});
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
    case 'ilerle':{
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
export function sonGoster(b,d){
  const v=b.vaka, S_=O(b).son, secilen=d.zaman.hukum||[];
  const katiller=new Set(v.katiller.map(k=>k.kisi));
  const dogru=secilen.filter(k=>katiller.has(k)).length;
  const rr=r(b,'son',secilen.join(','));
  const g=[parca('baslik',S_.baslik),parca('anlatim',S_.giris),parca('baslik',S_.kayipBaslik)];
  for(const k of secilen){
    const sahne=b.dil.kisiler[k]?.kayip??'';
    g.push(parca('anlatim',doldur(S_.kayipSatiri,{kim:kisiDeger(k,b.dil),sahne})));
    if(katiller.has(k)) g.push(parca('sahne',doldur(sec(S_.kanit,rr),{ortu:ortuYazi(v.kisiler[k].ortu,b.dil)})));
  }
  const n=secilen.length||1, oran=dogru/n;
  const pk=oran===1?'hepsi':oran>=.7?'cogu':oran>=.4?'yarim':oran>0?'azi':'hic';
  g.push(parca('baslik',S_.pencereBaslik),parca('anlatim',S_.pencereGiris),parca('anlatim',S_.pencere[pk]));
  g.push(parca('baslik',S_.gercekBaslik));
  const dl=v.ayar.dilimler;
  for(const c of v.cinayetler){
    g.push(parca('anlatim',doldur(S_.gercekSatiri,{katil:kisiDeger(c.katil,b.dil),kurban:kisiDeger(c.kurban,b.dil),
      zaman:zamanAnlati(b,c.zaman),yer:mekanDeger(c.mekan,{},b.dil),yontem:O(b).yontem[c.yontem]??O(b).yontem.genel,sebep:O(b).sebep[c.sebep.tur]??c.sebep.tur})));
    if(c.yardimci) g.push(parca('anlatim',doldur(S_.yardimciSatiri,{yardimci:kisiDeger(c.yardimci,b.dil)})));
  }
  for(const k of secilen) if(!katiller.has(k)) g.push(parca('anlatim',doldur(S_.masumSatiri,{kim:kisiDeger(k,b.dil)})));
  const kacan=[...katiller].filter(k=>!secilen.includes(k)).sort();
  if(kacan.length){
    g.push(parca('baslik',S_.akibetBaslik));
    const havuz=[...S_.akibet];
    for(const k of kacan){
      const i=Math.floor(rr()*havuz.length), m=havuz.splice(i,1)[0]??S_.akibet[0];
      if(!havuz.length) havuz.push(...S_.akibet);
      const c=v.cinayetler.find(x=>x.katil===k)||v.cinayetler.find(x=>x.yardimci===k);
      g.push(parca('anlatim',doldur(m,{kim:kisiDeger(k,b.dil),kurban:kisiDeger(c.kurban,b.dil)})));
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
    const iz=b.fiziksel.find(i=>i.id===x.iz), c=df.cinayetler.find(y=>y.id===x.cinayet);
    return {id:x.iz,metin:doldur(D.izSatiri,{cinayet:c?ad(b,c.kurban):'?',iz:iz?izMetni(b,iz):x.iz})};
  });
  const ifadeler=df.ifadeler.map(f=>({id:f.id,kisi:f.kisi,gun:f.gun,dongu:f.dongu,
    metin:doldur(D.ifadeSatiri,{gun:f.gun,kim:ad(b,f.kisi),soru:f.soru.etiket??'',metin:f.metin})+(f.dongu>1?' '+doldur(D.dongu,{n:f.dongu}):'')}));
  const celiskiler=df.celiskiler.map(k=>({id:k.id,a:k.a,b:k.b,metin:doldur(D.celiskiSatiri,{a:ozet(b,ifadeBul(df,k.a)),b:ozet(b,ifadeBul(df,k.b))})}));
  const sirlar=ogrenilenSirlar(df).map(s=>({sahip:s.sahip,metin:ad(b,s.sahip)+': '+(b.dil.kisiler[s.sahip]?.sirlar?.[s.sir]??s.sir)}));
  const isaretler=Object.entries(df.isaretler).map(([k,v])=>({kisi:k,metin:ad(b,k)+': '+D[v]}));
  return {cinayetler,izler,ifadeler,celiskiler,sirlar,isaretler};
}
const ozet=(b,f)=>f?`${ad(b,f.kisi)}: «${f.metin.length>70?f.metin.slice(0,68)+'…':f.metin}»`:'?';

// Kişi listesi (defter ve hüküm ekranı için).
export function kisiListesi(b,d){
  return b.ids.map(id=>({id,ad:ad(b,id),canli:yasiyor(b,d,id),isaret:d.defter.isaretler[id]??null}));
}

export {zamanSozu};
