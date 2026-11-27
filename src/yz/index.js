// Yapay zekâ katmanının tek giriş noktası. Oyun katmanı (src/oyun) bunu bilmez; arayüz çağırır.
//
//   const yz = yzKur({arkaUc, dil, zamanAsimi, kisiler});   // arkaUc null → her şey kalıplara düşer
//   await yz.soyle({kisi, soru, kalip, tavir, gerginlik, tepki, oyuncuSorusu, anahtar})
//        → {metin, kaynak:'yz'|'kalip'|'onbellek', neden?, ham?, sure}
//   await yz.soruEsle({metin, adaylar:[{id, etiket}], kisi})
//        → {id: adaylardan biri ya da 'yok', kaynak, neden?, ham?, sure}
//   await yz.kacamak({kisi, metin, gerginlik, anahtar})
//        → {metin, kaynak, neden?}  (serbest soru hiçbir hazır soruya denk gelmediğinde; bilgi taşımaz, deftere girmez)
//
// Güvenlik: soyle'nin cümlesi dogrula.js'ten geçmezse, model zaman aşımına uğrarsa ya da hata verirse motorun kalıp cümlesi
// kullanılır. soruEsle yalnızca listedeki bir soruyu seçebilir; seçilen sorunun cevabını yine motor verir.
// Önbellek: aynı (anahtar, kalıp) için aynı sonuç (anahtar: tohum, kişi, soru kimliği, döngü). Zaman aşımı ve hata
// önbelleğe girmez (sonra yeniden denenir); denetimden geçmeyen cevabın kalıbı girer (aynı soru hep aynı söylenir).

import {DIL_TR,karistir} from '../diyalog/adlar.js';
import {istemKur,eslemeIstemiKur,eslemeSemasi,eslemeKodu,kacamakIstemiKur,CEVAP_SEMASI} from './istem.js';
import {cevapDenetle,adListesi} from './dogrula.js';
import {cevapAyikla} from './arka-uc.js';

export {yerelSunucu,sahte,cevapAyikla} from './arka-uc.js';
export {cevapDenetle,adGeciyor,adListesi} from './dogrula.js';

const ESLEME_EN_COK=40;
const simdi=()=>(globalThis.performance?.now?.()??Date.now());

// İsteği zaman aşımıyla yarıştırır; süre dolunca sinyali keser (arka uç dinlemese de söz biter).
function zamanli(fn,ms){
  const ac=typeof AbortController!=='undefined'?new AbortController():null;
  let z;
  const sure=new Promise((_,rej)=>{z=setTimeout(()=>{ac?.abort(); rej(Object.assign(new Error('zaman aşımı'),{zamanAsimi:true}));},ms);});
  return Promise.race([Promise.resolve().then(()=>fn(ac?.signal)),sure]).finally(()=>clearTimeout(z));
}

/**
 * @param {{arkaUc?:?Object, dil?:Object, zamanAsimi?:number, kisiler?:Object, onbellekBoyu?:number}} s
 *   kisiler: köy verisi (yaş, meslek, mizaç için; koy.kisiler). Verilmezse istemde yalnızca lakap geçer.
 */
export function yzKur({arkaUc=null,dil=DIL_TR,zamanAsimi=6000,kisiler=null,onbellekBoyu=600}={}){
  const onbellek=new Map();
  const adlar=adListesi(dil);
  const kacamakListe=dil.oyun?.yz?.kacamak||['...'];

  function bellekAl(k){ return onbellek.get(k); }
  function bellekKoy(k,v){
    onbellek.set(k,v);
    if(onbellek.size>onbellekBoyu) onbellek.delete(onbellek.keys().next().value);
  }
  // Aynı anda aynı istek gelirse tek istek gider (sorgu ekranı sözü önceden ister).
  const yolda=new Map();
  async function bellekli(k,fn){
    if(onbellek.has(k)) return {...bellekAl(k),kaynak:bellekAl(k).kaynak==='yz'?'onbellek':bellekAl(k).kaynak};
    if(yolda.has(k)) return yolda.get(k);
    const p=(async()=>{
      const r=await fn();
      if(r.sakla) bellekKoy(k,r.sonuc);
      return r.sonuc;
    })().finally(()=>yolda.delete(k));
    yolda.set(k,p);
    return p;
  }
  const kisiVeriAl=(kisi,v)=>v??kisiler?.[kisi]??null;

  async function iste(mesajlar,secenek){
    const ham=await zamanli(sinyal=>arkaUc.soyle(mesajlar,{...secenek,sinyal}),zamanAsimi);
    return ham;
  }

  /** Kalıp cümleyi karakterin ağzından söyletir. */
  async function soyle({kisi,kisiVeri=null,soru=null,oyuncuSorusu=null,kalip,tavir='dogru',gerginlik=.2,tepki=null,anahtar=null}){
    const t0=simdi();
    const kalipSonuc=(neden,ham)=>({metin:kalip,kaynak:'kalip',...(neden?{neden}:{}),...(ham!=null?{ham}:{}),sure:Math.round(simdi()-t0)});
    if(!arkaUc||!kalip) return kalipSonuc(arkaUc?'kalıp boş':null);
    const k=JSON.stringify(['soz',anahtar??null,kisi,soru,oyuncuSorusu,kalip]);
    return bellekli(k,async()=>{
      let ham;
      try{
        ham=await iste(istemKur({kisi,kisiVeri:kisiVeriAl(kisi,kisiVeri),soru,oyuncuSorusu,kalip,tavir,gerginlik,tepki,dil}),{sema:CEVAP_SEMASI,semaAdi:'cevap'});
      }catch(e){
        return {sakla:false,sonuc:kalipSonuc(e.zamanAsimi?'zaman aşımı':'hata: '+(e.message||e))};
      }
      const cevap=cevapAyikla(ham,'cevap');
      // Denetimde soru olarak motorun sorusu kullanılır: oyuncunun yazdığı adlar modele söyleme hakkı vermez.
      const den=cevapDenetle({cevap,kalip,soru,kisi,dil,adlar});
      if(!den.tamam) return {sakla:true,sonuc:kalipSonuc('denetim: '+den.neden,cevap??ham)};
      return {sakla:true,sonuc:{metin:cevap,kaynak:'yz',ham:cevap,sure:Math.round(simdi()-t0)}};
    });
  }

  /** Oyuncunun yazdığı soruyu o an sorulabilen hazır sorulardan birine eşler. */
  async function soruEsle({metin,adaylar,kisi=null}){
    const t0=simdi();
    const yok=(neden,ham)=>({id:'yok',kaynak:'yok',...(neden?{neden}:{}),...(ham!=null?{ham}:{}),sure:Math.round(simdi()-t0)});
    const m=(metin||'').trim();
    if(!arkaUc) return yok('yapay zekâ kapalı');
    if(!m||!adaylar?.length) return yok('boş');
    const liste=adaylar.slice(0,ESLEME_EN_COK);
    const k=JSON.stringify(['esle',kisi,m.toLocaleLowerCase('tr'),liste.map(a=>a.id)]);
    return bellekli(k,async()=>{
      let ham;
      try{
        ham=await iste(eslemeIstemiKur({metin:m,adaylar:liste,kisi,dil}),{sema:eslemeSemasi(liste.length),semaAdi:'esleme',sicaklik:0,enCokToken:40});
      }catch(e){
        return {sakla:false,sonuc:yok(e.zamanAsimi?'zaman aşımı':'hata: '+(e.message||e))};
      }
      const kod=(cevapAyikla(ham,'soru')||'').trim().toLocaleLowerCase('tr');
      if(kod==='yok') return {sakla:true,sonuc:yok(null,ham)};
      const i=liste.findIndex((_,j)=>eslemeKodu(j)===kod);
      // Model kısa kod yerine gerçek kimliği yazmış olabilir.
      const a=i>=0?liste[i]:liste.find(x=>x.id===kod);
      if(!a) return {sakla:true,sonuc:yok('listede yok: '+kod,ham)};
      return {sakla:true,sonuc:{id:a.id,etiket:a.etiket,kaynak:'yz',ham,sure:Math.round(simdi()-t0)}};
    });
  }

  /** Hazır sorulara denk gelmeyen serbest soruya kısa, bilgi vermeyen cevap. */
  async function kacamak({kisi,kisiVeri=null,metin,gerginlik=.2,anahtar=null}){
    const t0=simdi();
    const yedek=neden=>({metin:kacamakListe[karistir(kisi,metin||'',anahtar??'')%kacamakListe.length],kaynak:'kalip',...(neden?{neden}:{}),sure:Math.round(simdi()-t0)});
    if(!arkaUc) return yedek(null);
    const k=JSON.stringify(['kacamak',anahtar??null,kisi,(metin||'').trim().toLocaleLowerCase('tr')]);
    return bellekli(k,async()=>{
      let ham;
      try{ ham=await iste(kacamakIstemiKur({kisi,kisiVeri:kisiVeriAl(kisi,kisiVeri),metin,gerginlik,dil}),{sema:CEVAP_SEMASI,semaAdi:'cevap'}); }
      catch(e){ return {sakla:false,sonuc:yedek(e.zamanAsimi?'zaman aşımı':'hata: '+(e.message||e))}; }
      const cevap=cevapAyikla(ham,'cevap');
      // Kaçamakta anlam boştur: hiçbir ad, zaman, sayı ya da suçlama geçemez.
      const den=cevapDenetle({cevap,kalip:'',soru:null,kisi,dil,adlar});
      if(!den.tamam) return {sakla:true,sonuc:{...yedek('denetim: '+den.neden),ham:cevap??ham}};
      return {sakla:true,sonuc:{metin:cevap,kaynak:'yz',ham:cevap,sure:Math.round(simdi()-t0)}};
    });
  }

  return {acik:!!arkaUc,arkaUc,zamanAsimi,soyle,soruEsle,kacamak,onbellekTemizle:()=>onbellek.clear()};
}
