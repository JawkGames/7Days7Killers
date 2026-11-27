// Kimlikten söze: kişi, mekân, eşya, iz ve örtü adlarını ek motorunun anlayacağı değerlere çevirir.
// Cümle kurmaz; yalnızca kalıplara konacak değerleri hazırlar. Metinler src/dil/tr/ altındadır.
// Ayrıca belirlenimci rastgelelik için tohum karıştırıcı (rngAl) burada durur.

import trKisiler from '../dil/tr/kisiler.js';
import trTerimler from '../dil/tr/terimler.js';
import trOyun from '../dil/tr/oyun.js';
import trKaliplar,{SORU_KALIPLARI as trSorular} from '../dil/tr/kaliplar.js';
import {kisiAdi,mekanAdi,ekle} from '../dil/tr/ekler.js';
import {rng} from '../cekirdek/rastgele.js';

// Etkin dil paketi. Başka dil eklenince aynı biçimde bir paket kurulup işlevlere `dil` olarak verilir.
export const DIL_TR=Object.freeze({kisiler:trKisiler,terimler:trTerimler,oyun:trOyun,kaliplar:trKaliplar,sorular:trSorular});

// FNV-1a: metin parçalarından 32 bitlik tohum. Aynı parçalar her zaman aynı tohumu verir.
export function karistir(...parcalar){
  let h=0x811c9dc5;
  const s=parcalar.map(p=>typeof p==='object'?JSON.stringify(p):String(p)).join('␟');
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,0x01000193);}
  return h>>>0;
}
export const rngAl=(...parcalar)=>rng(karistir(...parcalar));

export function lakap(id,dil=DIL_TR){
  const t=dil.kisiler[id];
  if(!t) throw new Error('Bilinmeyen kişi: '+id);
  return t.lakap;
}
export const kisiDeger=(id,dil=DIL_TR)=>kisiAdi(lakap(id,dil));
// Cümle başında ya da tek başına (ek almadan) yazılacak ad.
export const kisiYazi=(id,dil=DIL_TR)=>lakap(id,dil);

export function mekanYazi(m,dil=DIL_TR){
  const a=dil.terimler.mekan[m];
  if(!a) throw new Error('Bilinmeyen mekân: '+m);
  return a;
}

/**
 * Mekânı konuşana göre söz değerine çevirir: kendi evi "ev" (evdeydim), konu edilen kişinin evi "evi" (evindeydi),
 * öbürleri mekân adı (su değirmeninde).
 * @param {string} m        mekân kimliği
 * @param {{konusanEv?:string, konuEv?:string}} [s]
 */
export function mekanDeger(m,{konusanEv,konuEv}={},dil=DIL_TR){
  if(m!=null&&m===konusanEv) return {metin:'ev',ozelAd:false,iyelikli:false};
  if(m!=null&&m===konuEv) return {metin:'evi',ozelAd:false,iyelikli:true};
  return mekanAdi(mekanYazi(m,dil));
}

// Birden çok kişiyi "A, B ve C" biçiminde tek değer yapar; ek son ada gelir ("A, B ve C'yi").
export function kimlerDeger(ids,dil=DIL_TR){
  if(!ids.length) throw new Error('kimlerDeger: boş liste');
  const son=kisiDeger(ids[ids.length-1],dil);
  if(ids.length===1) return son;
  const on=ids.slice(0,-1).map(id=>lakap(id,dil));
  const bag=dil.oyun.baglac?.ve??'ve';
  return {...son,metin:on.join(', ')+' '+bag+' '+son.metin};
}
// "A'da da B'de de" gibi tekrar: eşyanın kimlerde olduğunu söylerken.
export function kimlerdeDeger(ids,dil=DIL_TR){
  // "de" bağlacı da ünlü uyumuna uyar: "Hanımağada da", "Elif'te de".
  const bag=s=>(/[aıou][^aıoueiöü]*$/i.test(s)?' da':' de');
  const l=ids.map(id=>{const w=ekle(kisiDeger(id,dil),'de'); return w+bag(w);});
  return {metin:l.join(', '),ozelAd:false,iyelikli:false};
}

// Eşyanın adı: kişinin eşyası, yoksa mekânın aleti, o da yoksa genel ad (kimlik asla metne düşmez).
// Veride bazı eşya adları yer bildiren bir önekle yazılmış ("kuşağında anahtar destesi", "kulağının arkasında
// kopya kalemi"); "{sahip:in} {esya:si}" kalıbında bozulmasın diye önek atılır: "Hanımağanın anahtar destesi".
export function esyaYazi(sahip,esya,dil=DIL_TR){
  const ad=dil.kisiler[sahip]?.esyalar?.[esya]??dil.oyun.iz.ad[esya]??dil.oyun.iz.tur.nesne;
  const k=ad.split(' ');
  let son=-1;
  k.forEach((w,i)=>{if(i<k.length-1&&/n[dt][ae]$/.test(w)) son=i;});
  return son>=0?k.slice(son+1).join(' '):ad;
}
export function ortuYazi(ortu,dil=DIL_TR){
  return dil.terimler.ortu[ortu]??ortu;
}

/**
 * Fiziksel izin oyuncuya görünen adı ("kırmızı yün ipi") ve fotoğraftaki ilk görünüşü ("Çalıya takılmış kırmızı bir şey").
 * Sahibini ele veren ad kullanılmaz: lif ve ayak izi, aynı izi bırakabilecek herkes için aynı adla anılır.
 */
export function izAdi(iz,dil=DIL_TR){
  const O=dil.oyun.iz;
  if(iz.alt==='yara') return O.yara[iz.anahtar]??O.yara.genel;
  if(iz.anahtar==='durmus-saat') return O.durmusSaat;
  if(O.ad[iz.anahtar]&&iz.alt!=='kurban-esyasi') return O.ad[iz.anahtar];
  if((iz.alt==='silah'||iz.alt==='kurban-esyasi'||iz.alt==='esya')&&iz.esya) return esyaYazi(iz.sahip,iz.esya,dil);
  if(iz.ortu) return ortuYazi(iz.ortu,dil)+' '+O.lif;
  return O.tur[iz.iztur]??O.tur.nesne;
}
export function izGorunus(iz,dil=DIL_TR){
  const O=dil.oyun.iz.gorunus;
  if(iz.alt==='yara') return O.yara;
  if(iz.alt==='kurban-esyasi'||iz.alt==='silah') return O.nesne;
  return O[iz.iztur]??O.nesne;
}
