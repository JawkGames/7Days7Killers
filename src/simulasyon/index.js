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
import {izleriKur,izTamamla} from './izler.js';
import {kaliteRaporu,kaliteOzeti} from './cozucu/kalite.js';
import {cekirdekSec} from './cekirdek.js';
import {onemliIfadeler} from './yalan.js';

export {ifade,ifadeMotoru} from './yalan.js';
export {sebepAdaylari} from './roller.js';
export {cekirdekDogrula} from './cekirdek.js';
export {vakaDenetle} from './denetim.js';
export {SIM_AYAR,ayarKur} from './ayar.js';
export {kaliteRaporu,KALITE_AYAR} from './cozucu/kalite.js';
export {oyuncuGorunumu} from './cozucu/gorunum.js';
export {coz} from './cozucu/coz.js';

export function vakaUret(tohum,koy,ayarEk={}){
  const ayar=ayarKur(ayarEk);
  if(tohum==null||(typeof tohum!=='number'&&typeof tohum!=='string')) throw new TypeError('vakaUret: tohum sayı ya da metin olmalı');
  if(!koy||!koy.kisiler||!koy.mekanlar) throw new TypeError('vakaUret: koy nesnesi eksik');
  // Kurulamayan (UretimHatasi) ya da kalite eleğinden geçemeyen deneme, türetilmiş akışla yeniden denenir.
  // Elekten geçen ilk deneme döner; hiçbiri geçmezse en az kusurlu olan (vaka.kalite.gecti === false).
  let son=null, en=null, elenen=[];
  const kusur=v=>v.kalite.nedenler.length;
  for(let deneme=0;deneme<ayar.azamiDeneme;deneme++){
    let v;
    try{v=kur(tohum,deneme,koy,ayar);}
    catch(e){if(!(e instanceof UretimHatasi)) throw e; son=e; continue;}
    if(ayar.elek===false||v.kalite.gecti){v.kalite.elenenDenemeler=elenen; return v;}
    elenen.push({deneme,nedenler:v.kalite.nedenler});
    if(!en||kusur(v)<kusur(en)) en=v;
    if(elenen.length>=ayar.elekDeneme) break;
  }
  if(en){en.kalite.elenenDenemeler=elenen; return en;}
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
  // Tamamlama: çözücü bir katile iki bağımsız zincir bulamazsa olay yerine o katilin bir izi daha eklenir
  // (en çok ayar.tamamlamaTuru tur). Sonra kalite eleği vakanın tamamına bakar.
  let v=vaka, rapor=null;
  for(let tur=0;tur<=ayar.tamamlamaTuru;tur++){
    rapor=kaliteRaporu(v,ayar.kalite);
    if(tur===ayar.tamamlamaTuru) break;
    const eksik=rapor.katiller.filter(k=>k.zincirSayisi<(ayar.kalite?.enAzZincir??2));
    let eklendi=0;
    for(const k of eksik) if(izTamamla(v,k.cinayet)) eklendi++;
    if(!eklendi) break;
    v={...v,izler:[...v.izler]}; // yeni nesne: ifade motorunun önbelleği eski izleri tutmasın
  }
  v.kalite=kaliteOzeti(rapor);
  v.ifadeler=onemliIfadeler(v);
  return JSON.parse(JSON.stringify(v)); // düz veri olduğunu garanti eder (undefined alan kalmaz)
}
