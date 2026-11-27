// Kalite eleği: çözücünün (yalnızca oyuncu görünümüyle) bulduğunu vakanın gerçeğiyle karşılaştırır.
// Çözücü gerçeği görmez; elek görür. Kurallar (PLAN "Çözülebilirlik testi", "Zorluk ölçümü"):
//   - her katile (cinayetin asıl failine) en az `enAzZincir` bağımsız ipucu zinciri gider,
//   - hiçbir masuma (katil olmayan) zincir gitmez,
//   - her yanıltıcı izin gösterdiği her masum için en az bir çürütme yolu vardır (ya da iz oyuncuya hiç ulaşmaz),
//   - çok kolay değildir: en az `enAzSorgu` sorgu gerekir, tek tanıkla çözülen cinayet `tekTanikEnCok`u, yalnızca
//     fotoğrafla (sorgusuz) çözülen cinayet `fotografEnCok`u aşmaz,
//   - çok zor değildir: en az sorgu, günlük sorgu hakkıyla 7 güne sığar.

import {oyuncuGorunumu} from './gorunum.js';
import {coz} from './coz.js';

export const KALITE_AYAR=Object.freeze({
  enAzZincir:2,
  enAzSorgu:3, // bundan az sorguyla (iki bağımsız zincirle) çözülen vaka çok kolaydır
  tekTanikEnCok:4, // tek bir tanığın tek ifadesiyle çözülebilen cinayet sayısı bunu aşarsa vaka çok kolaydır
  fotografEnCok:3, // hiç sorgusuz, yalnızca fotoğraftan iki zincirle çözülen cinayet sayısı bunu aşarsa vaka çok kolaydır
});

// Döner: {gecti, nedenler:[...], zorluk, katiller, yanilticilar, celiskiler, enAzSorgu, cozum}
export function kaliteRaporu(vaka,ayar={}){
  const A={...KALITE_AYAR,...(vaka.ayar&&vaka.ayar.kalite||{}),...ayar};
  const {gorunum,eslem}=oyuncuGorunumu(vaka,{gunlukSorguHakki:A.gunlukSorguHakki});
  const cz=coz(gorunum);
  const nedenler=[];
  const rol=k=>vaka.kisiler[k].rol;
  const cozC=Object.fromEntries(cz.cinayetler.map(c=>[c.cinayet,c]));

  const katiller=vaka.cinayetler.map(c=>{
    const sc=cozC[c.id], s=sc.supheliler.find(x=>x.kisi===c.katil);
    const n=s?s.bagimsizSayisi:0;
    if(n<A.enAzZincir) nedenler.push({tur:'zincir-eksik',cinayet:c.id,kisi:c.katil,zincir:n});
    for(const x of sc.supheliler) if(rol(x.kisi)!=='katil') nedenler.push({tur:'masum-zincir',cinayet:c.id,kisi:x.kisi});
    return {kisi:c.katil,cinayet:c.id,yardimci:c.yardimci,zincirSayisi:n,bagimsiz:s?s.bagimsiz:[],ilkSupheli:sc.supheliler[0]?.kisi??null,
      zincirler:s?sc.zincirler.filter(z=>z.kisi===c.katil):[]};
  });

  const yanilticilar=vaka.yanilticilar.map(y=>{
    const sc=cozC[y.cinayet], curutme=[];
    let tamam=true;
    for(const P of y.isaret){
      // Başka bir cinayetin katiliyse yanıltıcı iz oyuncuyu yine bir katile götürür: zararsız.
      if(rol(P)==='katil'&&sc.supheliler.some(s=>s.kisi===P)){curutme.push({kisi:P,yol:[{tur:'baska-cinayetin-katili'}]}); continue;}
      if(sc.supheliler.some(s=>s.kisi===P)){tamam=false; curutme.push({kisi:P,yol:null}); continue;}
      const l=sc.aciklamalar[P];
      if(l===undefined){curutme.push({kisi:P,yol:[{tur:'gorunmedi'}]}); continue;} // iz oyuncuya ulaşmadı (fark eden sustu)
      if(!l.length){tamam=false; curutme.push({kisi:P,yol:null}); continue;}
      curutme.push({kisi:P,yol:l.map(a=>({tur:a.tur,kaynaklar:a.kaynaklar}))});
    }
    if(!tamam) nedenler.push({tur:'curutulemeyen-yaniltici',yaniltici:y.id,cinayet:y.cinayet,aciklama:y.aciklama});
    return {id:y.id,cinayet:y.cinayet,aciklama:y.aciklama,isaret:y.isaret,curutuldu:tamam,curutme,izler:y.izler.map(i=>eslem.fizikselId(i)??eslem.dolayliId(i))};
  });

  const s=cz.enAzSorgu;
  if(!s.sigar) nedenler.push({tur:'cok-zor',sorgu:s.sorgu});
  if(s.sorgu<A.enAzSorgu||s.tekTanik>A.tekTanikEnCok||s.fotograf>A.fotografEnCok) nedenler.push({tur:'cok-kolay',sorgu:s.sorgu,tekTanik:s.tekTanik,fotograf:s.fotograf});
  return {
    gecti:!nedenler.length,
    nedenler,
    zorluk:{adim:s.adim,sorgu:s.sorgu,tekTanik:s.tekTanik,fotograf:s.fotograf,sigar:s.sigar},
    katiller,yanilticilar,
    celiskiler:cz.celiskiler,
    enAzSorgu:s,
    cozum:cz,
  };
}

// Vakaya yazılan kısa özet (düz veri).
export function kaliteOzeti(r){
  return {gecti:r.gecti,nedenler:r.nedenler.map(n=>n.tur),zorluk:{...r.zorluk},
    zincirler:Object.fromEntries(r.katiller.map(k=>[k.kisi,k.zincirSayisi])),
    celiski:r.celiskiler.length};
}
