// Kalite eleği: çözücünün (yalnızca oyuncu görünümüyle) bulduğunu vakanın gerçeğiyle karşılaştırır.
// Çözücü gerçeği görmez; elek görür. Kurallar (PLAN "Çözülebilirlik testi", "Zorluk ölçümü"):
//   - her katile (cinayetin asıl failine) en az `enAzZincir` bağımsız ipucu zinciri gider,
//   - hiçbir masuma (katil olmayan) zincir gitmez,
//   - her yanıltıcı izin gösterdiği her masum için en az bir çürütme yolu vardır (ya da iz oyuncuya hiç ulaşmaz),
//   - çok kolay değildir: en az `enAzSorgu` sorgu gerekir; yalnızca fotoğrafla (sorgusuz) çözülen cinayet `fotografEnCok`u,
//     iki zinciri de akla ilk gelen kişilerden kurulan cinayet `acikEnCok`u, tek sahipli eşya iziyle çözülen cinayet
//     `tekSahipliEnCok`u aşmaz,
//   - çok zor değildir: en az sorgu, günlük sorgu hakkıyla 7 güne sığar.

import {oyuncuGorunumu} from './gorunum.js';
import {coz} from './coz.js';

export const KALITE_AYAR=Object.freeze({
  enAzZincir:2,
  enAzSorgu:5, // bundan az sorguyla (iki bağımsız zincirle) çözülen vaka çok kolaydır
  fotografEnCok:1, // hiç sorgusuz, yalnızca fotoğraftan iki zincirle çözülen cinayet sayısı bunu aşarsa vaka çok kolaydır
  acikEnCok:2, // iki zinciri de "akla ilk gelen" kişilerden (cesedi bulan, kurbanın ev halkı, fotoğraftaki izin tek sahibi)
               // ya da fotoğraftan kurulan cinayet sayısı bunu aşarsa vaka çok kolaydır
  tekSahipliEnCok:3, // çözümünde tek sahipli eşya izi zinciri olan cinayet sayısı bunu aşarsa vaka çok kolaydır
  tekTanikEnCok:Infinity, // (eski ölçü; tanık artık genel soruda ad vermediği için kapalı)
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
  // Açık kaynak: oyuncunun ilk soracağı kişiler (cesedi bulan, kurbanın ev halkı, fotoğraftaki izin tek sahibi).
  let acik=0, tekSahipli=0;
  for(const p of s.plan){
    if(!p.zincirler) continue;
    const c=cozC[p.cinayet], f=gorunum.fotograflar().find(x=>x.cinayet===p.cinayet);
    const kurbanEv=gorunum.kisiler[c.kurban].ev;
    const tekler=new Set(f.izler.filter(i=>i.adaylar.length===1&&i.alt!=='kurban-esyasi').flatMap(i=>i.adaylar));
    const tekIz=new Set(f.izler.filter(i=>i.adaylar.length===1).map(i=>'iz:'+i.id));
    const acikKisi=k=>k===f.bulan||gorunum.kisiler[k].ev===kurbanEv||tekler.has(k);
    const zl=p.zincirler.map(id=>c.zincirler.find(z=>z.id===id));
    if(zl.length>=2&&zl.every(z=>z.kaynaklar.every(x=>x.startsWith('iz:')||acikKisi(x.slice(2))))) acik++;
    if(zl.some(z=>z.tur==='iz'&&z.sabit.some(x=>tekIz.has(x)))) tekSahipli++;
  }
  s.acik=acik; s.tekSahipli=tekSahipli;
  if(!s.sigar) nedenler.push({tur:'cok-zor',sorgu:s.sorgu});
  if(s.sorgu<A.enAzSorgu||s.tekTanik>A.tekTanikEnCok||s.fotograf>A.fotografEnCok||acik>A.acikEnCok||tekSahipli>A.tekSahipliEnCok)
    nedenler.push({tur:'cok-kolay',sorgu:s.sorgu,fotograf:s.fotograf,acik,tekSahipli});
  return {
    gecti:!nedenler.length,
    nedenler,
    zorluk:{adim:s.adim,sorgu:s.sorgu,tekTanik:s.tekTanik,fotograf:s.fotograf,acik,tekSahipli,sigar:s.sigar},
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
