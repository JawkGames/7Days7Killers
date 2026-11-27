// Ortam kurucu: ortamTarifi'ni sürekli katmanlara (döngüye giren gürültü tamponları, alçak tonlar,
// cırcır böceği) ve kendiliğinden çalan olaylara çevirir.
//
// Zamanlama: sürekli katmanlar hemen başlar; esintiler ve olaylar `planla(t0, t1)` ile o aralık için kurulur.
// Gerçek zamanlı bağlamda motor bunu kısa aralıklarla ileriye doğru çağırır; çevrimdışı bağlamda
// (OfflineAudioContext) bütün süre için bir kez çağrılır.

import {efektTarifi,grupKazanci,ilkZaman,olayCalsinMi,sonrakiZaman} from './tarif.js';
import {efektKur} from './efektler.js';

const ara=(r,[a,b])=>a+(b-a)*r();

function suzgecZinciri(ctx,giris,suzgecler){
  let son=giris; const liste=[];
  for(const s of suzgecler??[]){
    const b=ctx.createBiquadFilter(); b.type=s.tur; b.frequency.value=s.f; b.Q.value=s.q??.7;
    son.connect(b); son=b; liste.push(b);
  }
  return {son,liste};
}

function panla(ctx,dugum,pan){
  if(!pan||!ctx.createStereoPanner) return dugum;
  const p=ctx.createStereoPanner(); p.pan.value=pan; dugum.connect(p); return p;
}

// tarif: ortamTarifi(...) sonucu. hedef: {kuru, yanki}. baslangic: bağlam zamanı. gecis: saniye.
export function ortamKur(ctx,hedef,tarif,r,ortak,{baslangic=ctx.currentTime,gecis=1.5}={}){
  const cikis=ctx.createGain();
  cikis.gain.setValueAtTime(0,baslangic);
  // giriş hızlı, çıkış yavaş: iki ortamın toplam gücü geçişte en çok ~1.3 dB çöker
  cikis.gain.setTargetAtTime(1,baslangic,Math.max(.01,gecis/6));
  const seviye=ctx.createGain(); seviye.gain.value=tarif.seviye??1;
  cikis.connect(seviye); seviye.connect(hedef.kuru);

  const gruplar={}, gs=ad=>tarif.grupSeviye?.[ad]??1;
  const grup=ad=>{
    ad=ad??'genel';
    if(!gruplar[ad]){const g=ctx.createGain(); g.gain.value=grupKazanci(ad,tarif.oran)*gs(ad); g.connect(cikis); gruplar[ad]=g;}
    return gruplar[ad];
  };

  const kaynaklar=[], katmanlar=[];
  for(const k of tarif.katmanlar){
    const a=ctx.createGain(); a.gain.value=k.kazanc??1;
    const durum={k,kazanc:a,suzgec:null,sonraki:baslangic};
    if(k.tur==='gurultu'||k.tur==='alkis'){
      const s=ctx.createBufferSource(); s.buffer=k.tur==='alkis'?ortak.alkis():ortak.tampon(k.renk); s.loop=true;
      const z=suzgecZinciri(ctx,s,k.suzgecler);
      durum.suzgec=z.liste[0]??null;
      z.son.connect(a);
      s.start(baslangic,r()*s.buffer.duration);
      kaynaklar.push(s);
    }else if(k.tur==='ton'){
      const toplam=ctx.createGain(); toplam.gain.value=1;
      if(k.acilis){toplam.gain.setValueAtTime(0,baslangic); toplam.gain.linearRampToValueAtTime(1,baslangic+k.acilis);}
      for(const [f,g] of k.kismiler){
        const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=f;
        const og=ctx.createGain(); og.gain.value=g; o.connect(og); og.connect(toplam);
        o.start(baslangic); kaynaklar.push(o);
      }
      const z=suzgecZinciri(ctx,toplam,k.suzgec?[k.suzgec]:[]);
      z.son.connect(a);
    }else if(k.tur==='cirlama'){
      const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=ara(r,k.f);
      const nabiz=ctx.createGain(); nabiz.gain.value=0;
      const z=suzgecZinciri(ctx,nabiz,[{tur:'lowpass',f:k.suzgec,q:.5}]);
      o.connect(nabiz); z.son.connect(a);
      a.gain.value=1; durum.nabiz=nabiz; durum.sonraki=baslangic+r()*.5;
      o.start(baslangic); kaynaklar.push(o);
    }
    panla(ctx,a,k.pan).connect(grup(k.grup));
    katmanlar.push(durum);
  }

  const olaylar=tarif.olaylar.map(o=>({o,sonraki:ilkZaman(r,baslangic,o),tok:false}));
  let oran=tarif.oran, bitti=false;

  function katmaniPlanla(d,t0,t1){
    const {k}=d;
    if(k.tur==='cirlama'){
      while(d.sonraki<t1){
        const t=d.sonraki, n=Math.round(ara(r,k.nabiz));
        if(t>=t0) for(let i=0;i<n;i++){
          const p=t+i*.026;
          d.nabiz.gain.setValueAtTime(0,p);
          d.nabiz.gain.linearRampToValueAtTime(k.kazanc,p+.005);
          d.nabiz.gain.linearRampToValueAtTime(0,p+.018);
        }
        // ara sıra susar
        d.sonraki=t+ara(r,k.aralik)+(r()<.08?ara(r,[1.5,4]):0);
      }
      return;
    }
    const g=k.gezinme;
    if(!g) return;
    while(d.sonraki<t1){
      const t=d.sonraki, aralik=ara(r,g.aralik);
      if(t>=t0){
        d.kazanc.gain.setTargetAtTime((k.kazanc??1)*ara(r,g.kazanc),t,aralik*.35);
        if(g.frekans&&d.suzgec) d.suzgec.frequency.setTargetAtTime(ara(r,g.frekans),t,aralik*.4);
      }
      d.sonraki=t+aralik;
    }
  }

  function planla(t0,t1){
    if(bitti) return;
    for(const d of katmanlar) katmaniPlanla(d,t0,t1);
    for(const e of olaylar){
      while(e.sonraki<t1){
        const t=e.sonraki;
        if(t>=t0&&olayCalsinMi(r,e.o,oran)){
          const tarifO=efektTarifi(e.o.tur,{siddet:e.o.kazanc??1,r,tok:e.tok});
          efektKur(ctx,{kuru:grup(e.o.grup),yanki:hedef.yanki},tarifO,t,r,ortak);
        }
        e.tok=!e.tok;
        e.sonraki=sonrakiZaman(r,t,e.o);
      }
    }
  }

  function oranAyarla(yeni,t=ctx.currentTime,sure=1.5){
    if(!Number.isFinite(yeni)) return;
    oran=Math.min(1,Math.max(0,yeni));
    for(const [ad,g] of Object.entries(gruplar)) g.gain.setTargetAtTime(grupKazanci(ad,oran)*gs(ad),t,Math.max(.01,sure/3));
  }

  function durdur(t=ctx.currentTime,sure=1.5){
    if(bitti) return;
    bitti=true;
    cikis.gain.cancelScheduledValues(t);
    cikis.gain.setTargetAtTime(0,t,Math.max(.01,sure/3));
    const son=t+sure*2.5+.1; // bu anda düzey ~-65 dB
    for(const s of kaynaklar){try{s.stop(son);}catch{/* zaten durdu */}}
    if(kaynaklar[0]) kaynaklar[0].onended=()=>{try{seviye.disconnect();}catch{/* */}};
  }

  return {ad:tarif.ad,temel:tarif.temel,cikis,planla,oranAyarla,durdur,get oran(){return oran;},get bitti(){return bitti;}};
}
