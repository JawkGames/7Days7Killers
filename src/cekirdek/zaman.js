// Oyun zamanı: 7 gün, her gün beş adım, yedinci günün sonunda karar.
// Durum düz veridir (JSON'a yazılıp okunabilir). İşlevler durumu değiştirmez, yenisini döndürür.
// Geçersiz bir geçişte ZamanHatasi atılır; hata `kod` alanıyla ayırt edilir.
//
// Akış (bir gün):
//   gun-basi -> fotograf -> cagirma <-> sorgu   (cagir: cagirma -> sorgu, ilerle: sorgu -> cagirma)
//   cagirma -> gun-sonu -> (ertesi gün) gun-basi
// Son günün gun-sonu'ndan sonra: karar. Kararda iki yol: geriSar (REWIND TIME) ya da hukumVer (FINAL VERDICT) -> bitti.

import {AYARLAR} from './ayarlar.js';

export const ADIMLAR=Object.freeze(['gun-basi','fotograf','cagirma','sorgu','gun-sonu']);
export const KARAR='karar';
export const BITTI='bitti';

export class ZamanHatasi extends Error{
  constructor(kod,mesaj){super(mesaj); this.name='ZamanHatasi'; this.kod=kod;}
}

const tamSayiMi=(v,en=0)=>Number.isInteger(v)&&v>=en;

// Durumun biçimini denetler. Geçerliyse null, değilse sorunu anlatan metin döndürür (kayıt doğrulaması da bunu kullanır).
export function zamanSorunu(d){
  if(!d||typeof d!=='object') return 'durum nesne değil';
  const k=d.kural;
  if(!k||!tamSayiMi(k.gunSayisi,1)||!tamSayiMi(k.gunlukSorguHakki,0)||!tamSayiMi(k.finalSecimSayisi,1)) return 'kural eksik ya da hatalı';
  if(!Number.isFinite(d.tohum)) return 'tohum sayı değil';
  if(!tamSayiMi(d.dongu,1)) return 'döngü 1 ya da daha büyük tam sayı olmalı';
  if(!tamSayiMi(d.gun,1)||d.gun>k.gunSayisi) return `gün 1..${k.gunSayisi} aralığında olmalı`;
  if(!ADIMLAR.includes(d.adim)&&d.adim!==KARAR&&d.adim!==BITTI) return `bilinmeyen adım: ${d.adim}`;
  if((d.adim===KARAR||d.adim===BITTI)&&d.gun!==k.gunSayisi) return 'karar yalnızca son günde olur';
  if(!tamSayiMi(d.sorguKalan,0)||d.sorguKalan>k.gunlukSorguHakki) return 'sorgu hakkı aralık dışında';
  if(!Array.isArray(d.cagrilanlar)) return 'çağrılanlar dizi değil';
  if(d.adim==='sorgu'&&d.sorgudaki==null) return 'sorgu adımında sorgulanan kişi yok';
  if(d.adim===BITTI&&!Array.isArray(d.hukum)) return 'bitmiş oyunda hüküm yok';
  return null;
}

function denetle(d){
  const s=zamanSorunu(d);
  if(s) throw new ZamanHatasi('gecersiz-durum',`Geçersiz zaman durumu: ${s}`);
}

function adimBekle(d,beklenen,islem){
  if(d.adim!==beklenen) throw new ZamanHatasi('gecersiz-gecis',`${islem} yalnızca "${beklenen}" adımında yapılır; şu an "${d.adim}"`);
}

// Yeni oyun (ya da geri sarma sonrası) ilk durum. `ayar` verilmezse AYARLAR kullanılır.
// Kurallar duruma kopyalanır: ayarlar sonraki bir sürümde değişse de kayıtlı oyun kendi kurallarıyla sürer.
export function zamanBaslat({tohum,dongu=1,ayar=AYARLAR}={}){
  if(!Number.isFinite(tohum)) throw new ZamanHatasi('gecersiz-tohum','zamanBaslat: tohum sayı olmalı');
  const kural={gunSayisi:ayar.gunSayisi,gunlukSorguHakki:ayar.gunlukSorguHakki,finalSecimSayisi:ayar.finalSecimSayisi};
  const d={tohum,dongu,gun:1,adim:'gun-basi',sorguKalan:kural.gunlukSorguHakki,cagrilanlar:[],sorgudaki:null,hukum:null,kural};
  denetle(d);
  return d;
}

// Bir sonraki adıma geçer. Çağırma adımında ilerlemek günün sorgularını bitirir (kalan hak yanar).
export function ilerle(d){
  denetle(d);
  switch(d.adim){
    case 'gun-basi': return {...d,adim:'fotograf'};
    case 'fotograf': return {...d,adim:'cagirma'};
    case 'cagirma': return {...d,adim:'gun-sonu',sorguKalan:0};
    case 'sorgu': return {...d,adim:'cagirma',sorgudaki:null};
    case 'gun-sonu':
      if(d.gun<d.kural.gunSayisi) return {...d,gun:d.gun+1,adim:'gun-basi',sorguKalan:d.kural.gunlukSorguHakki,cagrilanlar:[],sorgudaki:null};
      return {...d,adim:KARAR};
    case KARAR: throw new ZamanHatasi('karar-bekliyor','Karar adımında ilerlenmez: geriSar ya da hukumVer');
    default: throw new ZamanHatasi('oyun-bitti','Oyun bitti; ilerlenecek adım yok');
  }
}

// Birini sorguya çağırır: bir hak harcanır, adım "sorgu" olur. Sorgu bitince ilerle ile çağırmaya dönülür.
export function cagir(d,kisi){
  denetle(d);
  adimBekle(d,'cagirma','Çağırma');
  if(kisi==null||kisi==='') throw new ZamanHatasi('kisi-yok','Çağrılacak kişi belirtilmedi');
  if(d.sorguKalan<=0) throw new ZamanHatasi('hak-yok','Bugün sorgu hakkı kalmadı');
  return {...d,adim:'sorgu',sorguKalan:d.sorguKalan-1,cagrilanlar:[...d.cagrilanlar,kisi],sorgudaki:kisi};
}

// REWIND TIME: birinci güne döner. Tohum ve kurallar aynı kalır, döngü sayacı artar.
// Defter zamanın parçası değildir; onu çağıran taraf korur.
export function geriSar(d){
  denetle(d);
  adimBekle(d,KARAR,'Geri sarma');
  return {...d,dongu:d.dongu+1,gun:1,adim:'gun-basi',sorguKalan:d.kural.gunlukSorguHakki,cagrilanlar:[],sorgudaki:null,hukum:null};
}

// FINAL VERDICT: seçilen kişilerle oyun biter. Doğruluk burada hesaplanmaz (oyuncuya söylenmez).
export function hukumVer(d,secilenler){
  denetle(d);
  adimBekle(d,KARAR,'Hüküm');
  const n=d.kural.finalSecimSayisi;
  if(!Array.isArray(secilenler)||secilenler.length!==n) throw new ZamanHatasi('secim-sayisi',`Tam ${n} kişi seçilmeli`);
  if(new Set(secilenler).size!==n) throw new ZamanHatasi('secim-tekrar','Aynı kişi iki kez seçilemez');
  return {...d,adim:BITTI,hukum:[...secilenler]};
}

// Sorgular
export const kalanSorgu=d=>ADIMLAR.includes(d.adim)?d.sorguKalan:0; // bugün kalan sorgu hakkı
export const kararBekliyor=d=>d.adim===KARAR;
export const bittiMi=d=>d.adim===BITTI;
export const sonGunMu=d=>d.gun===d.kural.gunSayisi;
