// Olay üretim motorunun tek giriş noktası.
//   vakaUret(tohum, koy, ayar) -> vaka (düz veri, JSON'a çevrilebilir; biçimi README.md'de)
// Saf ve belirlenimci: aynı tohum, aynı köy ve aynı ayar birebir aynı vakayı verir.
// koy: src/icerik/index.js'teki `koy` (ya da kur.js koyKur sonucu). Olay çekirdekleri
// koy.cekirdekler ya da ayar.cekirdekler olarak verilir; verilmezse vaka çekirdeksiz kurulur.

import {ayarKur} from './ayar.js';
import {zar,UretimHatasi} from './zar.js';
import {dunyaKur} from './dunya.js';
import {haritaKur} from './harita.js';
import {sebepAdaylari,rolleriSec} from './roller.js';
import {rutinKur} from './cizelge.js';
import {cinayetleriYerlestir} from './cinayet.js';
import {izleriKur} from './izler.js';
import {cekirdekSec} from './cekirdek.js';
import {onemliIfadeler} from './yalan.js';

export {ifade,ifadeMotoru} from './yalan.js';
export {sebepAdaylari} from './roller.js';
export {cekirdekDogrula} from './cekirdek.js';
export {vakaDenetle} from './denetim.js';
export {SIM_AYAR,ayarKur} from './ayar.js';

export function vakaUret(tohum,koy,ayarEk={}){
  const ayar=ayarKur(ayarEk);
  if(tohum==null||(typeof tohum!=='number'&&typeof tohum!=='string')) throw new TypeError('vakaUret: tohum sayı ya da metin olmalı');
  if(!koy||!koy.kisiler||!koy.mekanlar) throw new TypeError('vakaUret: koy nesnesi eksik');
  let son=null;
  for(let deneme=0;deneme<ayar.azamiDeneme;deneme++){
    try{return kur(tohum,deneme,koy,ayar);}
    catch(e){if(!(e instanceof UretimHatasi)) throw e; son=e;}
  }
  throw new Error(`vakaUret: ${ayar.azamiDeneme} denemede vaka kurulamadı (${son&&son.message})`);
}

function kur(tohum,deneme,koy,ayar){
  const d=dunyaKur(koy,ayar);
  d.harita=haritaKur(koy.mekanlar);
  const cekirdekListesi=koy.cekirdekler||ayar.cekirdekler||[];
  const cekirdekler=cekirdekSec(zar(tohum,deneme,'cekirdek'),cekirdekListesi,koy,ayar.cekirdekSayisi);
  const ciftler=sebepAdaylari(d);
  const roller=rolleriSec(d,zar(tohum,deneme,'roller'),ciftler,cekirdekler);
  // Oyun günleri: her katile bir gün; katil günden fazlaysa günler sırayla paylaşılır.
  zar(tohum,deneme,'gunler').karistir(roller.katiller).forEach((k,i)=>{k.gun=i%ayar.gunSayisi+1;});
  const cz=rutinKur(d,zar(tohum,deneme,'cizelge'));
  const sonuc=cinayetleriYerlestir(d,zar(tohum,deneme,'cinayet'),cz,roller);
  const {izler,yanilticilar}=izleriKur(d,zar(tohum,deneme,'izler'),cz,sonuc);
  const {cinayetler,olaylar}=sonuc;
  olaylar.sort((a,b)=>a.zaman-b.zaman||(a.id<b.id?-1:1));

  const rol={}, olum={};
  for(const c of cinayetler){rol[c.katil]='katil'; if(c.yardimci) rol[c.yardimci]='katil'; rol[c.kurban]='kurban'; olum[c.kurban]=c.zaman;}
  const kisiler={};
  for(const id of d.ids){
    const k=d.kisi(id);
    kisiler[id]={ev:k.ev,is:k.is??null,mizac:k.mizac,cinsiyet:k.cinsiyet,yas:k.yas,ortu:k.ortu,esyalar:[...(k.esyalar||[])],
      rol:rol[id]||'masum',olum:olum[id]??null};
  }
  const vaka={
    surum:ayar.surum,tohum,deneme,
    ayar:{katilSayisi:ayar.katilSayisi,gunSayisi:ayar.gunSayisi,dilimler:[...ayar.dilimler],dilimSaatleri:{...ayar.dilimSaatleri},bulunmaDilimi:ayar.bulunmaDilimi},
    cekirdekler:cekirdekler.map(c=>c.id),
    kisiler,
    iliskiler:d.ids.flatMap(a=>d.iliskiler[a].map(i=>({kimden:a,kime:i.kime,tur:i.tur}))),
    sirlar:d.sirlar.map(s=>({sahip:s.sahip,id:s.id,tur:s.tur,rol:s.rol,kimler:[...s.kimler]})),
    harita:d.harita,
    katiller:cinayetler.map(c=>({kisi:c.katil,cinayet:c.id,yardimEttigi:cinayetler.find(x=>x.yardimci===c.katil)?.id??null})),
    cinayetler,
    baglar:roller.baglar.map(b=>({...b,cinayet:cinayetler.find(c=>c.katil===(b.zorlanan||b.ortulen||b.katil))?.id??null})),
    olaylar,izler,yanilticilar,
    cizelge:cz.yer,neden:cz.neden,
    ifadeler:[],
  };
  vaka.ifadeler=onemliIfadeler(vaka);
  return JSON.parse(JSON.stringify(vaka)); // düz veri olduğunu garanti eder (undefined alan kalmaz)
}
