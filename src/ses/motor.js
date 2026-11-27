// Ses motoru: AudioContext'in yaşamı, ana karışım, ortam geçişleri, efektler.
//
// - Tarayıcı kuralı: bağlam ilk kullanıcı hareketinde açılır (`baslat()` dinleyicileri kurar; `ac()` bir
//   dokunma işleyicisinin içinden doğrudan da çağrılabilir). Açılmadan istenen ortam saklanır, açılınca çalar.
//   Açılmadan istenen efekt atılır (geç çalan efekt yanlış yerde çalar).
// - Sayfa gizlenince bağlam askıya alınır, geri gelince sürer.
// - Destek yoksa (Node, eski tarayıcı) her işlev sessizce hiçbir şey yapmaz; hata atmaz.
// - Dışarıdan bağlam verilebilir: `sesMotoru({baglam: new OfflineAudioContext(2, 48000*10, 48000)})`.
//   Çevrimdışı bağlamda ortam, bağlamın bütün süresi için baştan planlanır.
//
// Karışım:  ortamlar -> ortamYolu -> kisma ─┐
//           efektler -> efektYolu ──────────┼-> ana(düzey) -> sessiz -> alçak geçiren -> DC kesici -> sınırlayıcı -> çıkış
//           yankı gönderimleri -> yankı ────┘

import {rng} from '../cekirdek/rastgele.js';
import {gorunurlukDinle} from '../platform/ekran.js';
import {alkisDokusu,gurultu,sinirlayiciEgrisi,yankiDarbesi} from './uretec.js';
import {EFEKTLER,ORTAM_OLAYLARI,efektTarifi,ortamTarifi} from './tarif.js';
import {efektKur} from './efektler.js';
import {ortamKur} from './ortamlar.js';

const UFUK=1.2;          // gerçek zamanlıda ne kadar ileriye planlanır (sn)
const TIK=.25;           // planlayıcının çalışma aralığı (sn)
const DAKTILO_ARA=.022;  // iki daktilo harfi arasında en az bu kadar
const sinirla=(x,a,b)=>Math.min(b,Math.max(a,x));
// Düzey kaydırıcısı algıya göre: 0..1 -> kazanç (karesi).
export const duzeyKazanci=d=>{const x=sinirla(Number(d)||0,0,1); return x*x;};

function varsayilanUretec(){
  const AC=globalThis.AudioContext??globalThis.webkitAudioContext;
  return typeof AC==='function'?()=>new AC({latencyHint:'interactive'}):null;
}

const GURULTU_SURESI={beyaz:5.3,pembe:7.9,kahverengi:11.3}; // farklı uzunluklar: döngüler aynı anda dönmez

export function sesMotoru({baglam=null,baglamUret,tohum=1943,duzey:ilkDuzey=.8,pencere=globalThis,belge}={}){
  const uret=baglam?null:(baglamUret===undefined?varsayilanUretec():baglamUret);
  const destek=!!baglam||typeof uret==='function';
  const anaRng=rng(tohum>>>0);
  let ctx=null, d=null, ortak=null, aktif=null, istenen=null, planlandi=0, zamanlayici=null;
  let duzey=sinirla(Number.isFinite(ilkDuzey)?ilkDuzey:.8,0,1), sessiz=false, gizli=false, kisma=0, sonDaktilo=-1, analizci=null;

  const cevrimdisi=()=>!!ctx&&typeof ctx.startRendering==='function';
  const simdi=()=>ctx?ctx.currentTime:0;
  const altTohum=()=>Math.floor(anaRng()*2**31);

  function ortakKur(){
    const sr=ctx.sampleRate, onbellek={}, r=rng(tohum^0x5e5);
    const tampon=veri=>{const b=ctx.createBuffer(1,veri.length,sr); b.getChannelData(0).set(veri); return b;};
    ortak={
      tampon(renk='beyaz'){
        if(!onbellek[renk]) onbellek[renk]=tampon(gurultu(renk,Math.round(sr*(GURULTU_SURESI[renk]??6)),r));
        return onbellek[renk];
      },
      alkis(){
        if(!onbellek.alkis) onbellek.alkis=tampon(alkisDokusu(sr,Math.round(sr*6.7),r));
        return onbellek.alkis;
      }
    };
  }

  function karisimKur(){
    const g=v=>{const x=ctx.createGain(); x.gain.value=v; return x;};
    d={ortamYolu:g(1),kisma:g(1),efektYolu:g(1),yankiGiris:g(1),yankiDonus:g(.5),ana:g(duzeyKazanci(duzey)),sessiz:g(sessiz?0:1)};
    const yanki=ctx.createConvolver();
    const [sol,sag]=yankiDarbesi(ctx.sampleRate,rng(tohum^0x7a7),{sure:1.8,parlaklik:.3});
    const b=ctx.createBuffer(2,sol.length,ctx.sampleRate); b.getChannelData(0).set(sol); b.getChannelData(1).set(sag);
    yanki.buffer=b;
    const karart=ctx.createBiquadFilter(); karart.type='lowpass'; karart.frequency.value=6500; karart.Q.value=.5;
    const dc=ctx.createBiquadFilter(); dc.type='highpass'; dc.frequency.value=24; dc.Q.value=.5;
    // WaveShaper girişi [-1, 1]; eğri bu alanı gerçek [-2, 2]'ye karşılık gelecek biçimde üretildi, bu yüzden önce yarıya inilir.
    // Eğrinin çıktısı doğrudan çıkış ölçeğindedir (|y| < 0.5 değişmeden geçer).
    const on=g(.5), sinir=ctx.createWaveShaper(); sinir.curve=sinirlayiciEgrisi(); sinir.oversample='none';
    d.ortamYolu.connect(d.kisma); d.kisma.connect(d.ana);
    d.efektYolu.connect(d.ana);
    d.yankiGiris.connect(yanki); yanki.connect(d.yankiDonus); d.yankiDonus.connect(d.ana);
    d.ana.connect(d.sessiz); d.sessiz.connect(karart); karart.connect(dc); dc.connect(on); on.connect(sinir);
    sinir.connect(ctx.destination);
    d.cikis=sinir;
  }

  function hazirla(){
    if(ctx) return true;
    if(!destek) return false;
    try{ctx=baglam??uret();}catch{ctx=null;}
    if(!ctx) return false;
    try{
      ortakKur(); karisimKur();
    }catch{ctx=null; return false;}
    if(!cevrimdisi()){
      const kur=pencere?.setInterval?pencere:globalThis;
      zamanlayici=kur.setInterval(tik,TIK*1000);
    }
    if(istenen){const [ad,ops]=istenen; istenen=null; ortam(ad,ops);}
    return true;
  }

  function tik(){
    if(!ctx||ctx.state!=='running') return;
    const t=ctx.currentTime, ufuk=t+UFUK;
    if(aktif&&ufuk>planlandi){aktif.planla(Math.max(planlandi,t),ufuk); planlandi=ufuk;}
  }

  // Bağlamı açar ya da askıdan alır. Kullanıcı hareketinin içinden çağrılmalı. Açıksa true.
  function ac(){
    if(!hazirla()) return false;
    if(ctx.state==='suspended'&&!gizli&&!cevrimdisi()){try{ctx.resume()?.catch?.(()=>{});}catch{/* */}}
    return true;
  }

  // İlk kullanıcı hareketini ve sayfa görünürlüğünü dinler. Bırakıcı döndürür.
  function baslat({pencere:p=pencere,belge:b=belge}={}){
    if(!destek||baglam) {if(baglam) hazirla(); return ()=>{};}
    const olaylar=['pointerdown','keydown','touchend','mousedown'];
    const hareket=()=>{
      if(ac()&&ctx.state!=='suspended') kaldir();
      else if(ctx) ctx.onstatechange=()=>{if(ctx.state==='running') kaldir();};
    };
    let takili=true;
    const kaldir=()=>{if(!takili) return; takili=false; for(const o of olaylar) p?.removeEventListener?.(o,hareket,true);};
    for(const o of olaylar) p?.addEventListener?.(o,hareket,true);
    const gorunurBirak=gorunurlukDinle(g=>{
      gizli=g;
      if(!ctx||cevrimdisi()) return;
      try{(g?ctx.suspend():ctx.resume())?.catch?.(()=>{});}catch{/* */}
    },b);
    return ()=>{kaldir(); gorunurBirak();};
  }

  // ad: ORTAMLAR'dan biri; null / 'yok' susturur. ops: {gecis (sn), oran (pencere), isik, tohum}
  // Aynı pencere ailesinde geçişte yeniden kurulmaz, yalnızca oran kayar.
  function ortam(ad,ops={}){
    const gecis=Number.isFinite(ops.gecis)?Math.max(0,ops.gecis):2;
    if(!ctx){
      if(!destek) return false;
      istenen=[ad,ops]; return false;
    }
    if(!ad||ad==='yok'){
      if(aktif){aktif.durdur(simdi(),gecis); aktif=null;}
      return true;
    }
    const tarif=ortamTarifi(ad,ops);
    if(!tarif) return false;
    if(aktif&&aktif.temel===tarif.temel&&!ops.tohum){
      if(aktif.temel==='pencere'){aktif.oranAyarla(tarif.oran,simdi(),gecis); aktif.ad=tarif.ad;}
      return true;
    }
    if(aktif) aktif.durdur(simdi(),gecis);
    const t=simdi()+(cevrimdisi()?0:.03);
    aktif=ortamKur(ctx,{kuru:d.ortamYolu,yanki:d.yankiGiris},tarif,rng(ops.tohum??altTohum()),ortak,{baslangic:t,gecis});
    if(cevrimdisi()){aktif.planla(t,ctx.length/ctx.sampleRate); planlandi=Infinity;}
    else{planlandi=t; tik();}
    return true;
  }

  // Pencere ortamında coşku/öfke oranını kaydırır.
  function oran(o,{gecis=1.5}={}){
    if(aktif?.temel!=='pencere') return false;
    aktif.oranAyarla(o,simdi(),gecis); return true;
  }

  // ad: EFEKTLER (ya da ORTAM_OLAYLARI). ops: {siddet 0..1.5, tohum, gecikme sn, zaman (bağlam zamanı), sayi (adım)}.
  // Bitiş zamanını (bağlam saniyesi) döndürür; çalmadıysa null.
  function efekt(ad,{siddet=1,tohum:t,gecikme=0,zaman,...ek}={}){
    if(!ctx||(ctx.state!=='running'&&!cevrimdisi())) return null;
    if(sessiz&&!cevrimdisi()) return null;
    const r=rng(t??altTohum());
    const tarif=efektTarifi(ad,{siddet,r,...ek});
    if(!tarif) return null;
    const an=Number.isFinite(zaman)?zaman:simdi()+.005+Math.max(0,gecikme);
    if(ad==='daktilo'){if(an-sonDaktilo<DAKTILO_ARA) return null; sonDaktilo=an;}
    try{return efektKur(ctx,{kuru:d.efektYolu,yanki:d.yankiGiris},tarif,an,r,ortak);}catch{return null;}
  }

  function duzeyAyarla(v){
    if(v===undefined) return duzey;
    if(!Number.isFinite(Number(v))) return duzey;
    duzey=sinirla(Number(v),0,1);
    if(d) d.ana.gain.setTargetAtTime(duzeyKazanci(duzey),simdi(),.05);
    return duzey;
  }

  function sustur(b){
    if(b===undefined) return sessiz;
    sessiz=!!b;
    if(d) d.sessiz.gain.setTargetAtTime(sessiz?0:1,simdi(),.08);
    return sessiz;
  }

  // Ortamı kısar (konuşma, Rewind gibi anlarda): miktar 0 (kısma yok) .. 1 (tam).
  function kis(miktar=.5,{sure=.6}={}){
    kisma=sinirla(Number(miktar)||0,0,1);
    if(d) d.kisma.gain.setTargetAtTime(1-kisma,simdi(),Math.max(.01,sure/3));
    return kisma;
  }

  // Gösterge için: son kattan dinleyen AnalyserNode (ilk çağrıda kurulur).
  function analizciAl(){
    if(!ctx) return null;
    if(!analizci){analizci=ctx.createAnalyser(); analizci.fftSize=2048; analizci.smoothingTimeConstant=.6; d.cikis.connect(analizci);}
    return analizci;
  }

  async function kapat(){
    if(zamanlayici!==null){(pencere?.clearInterval?pencere:globalThis).clearInterval(zamanlayici); zamanlayici=null;}
    aktif=null;
    if(ctx&&!cevrimdisi()){try{await ctx.close();}catch{/* */}}
    ctx=null; d=null; ortak=null; analizci=null;
  }

  const durum=()=>({destek,acik:!!ctx,baglamDurumu:ctx?.state??null,ortam:aktif?.ad??istenen?.[0]??null,oran:aktif?.oran??null,duzey,sessiz,kisma,gizli});

  return {
    destek,ac,baslat,ortam,oran,efekt,duzey:duzeyAyarla,sustur,kis,durum,kapat,
    analizci:analizciAl,
    get baglam(){return ctx;},
    efektler:EFEKTLER,ortamOlaylari:ORTAM_OLAYLARI
  };
}
