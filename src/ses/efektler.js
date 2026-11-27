// Efekt çalıcı: tarif.js'in ürettiği tarifi Web Audio düğümlerine çevirir ve `zaman` anına kurar.
// AudioContext de OfflineAudioContext de olur. Hiçbir düğüm çalmadan önce dışarıdan okunmaz;
// her efekt kendi düğümlerini kurar, bitince çıkışını koparır.
//
// hedef: {kuru, yanki}  (motorun efekt girişi ve yankı gönderimi)
// ortak: {tampon(renk)} (bağlama özel, döngüye uygun gürültü tamponları)

import {rng} from '../cekirdek/rastgele.js';
import {tersTon} from './uretec.js';

const SIFIR=1e-4;

// ---- küçük yardımcılar ----

function cikis(ctx,hedef,{pan=0,yanki=0}={},son){
  const g=ctx.createGain(); g.gain.value=1;
  let dugum=g;
  if(pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner(); p.pan.value=pan; g.connect(p); dugum=p;}
  dugum.connect(hedef.kuru);
  let y=null;
  if(yanki>0&&hedef.yanki){y=ctx.createGain(); y.gain.value=yanki; dugum.connect(y); y.connect(hedef.yanki);}
  // Efektin sonunda çıkış koparılır (yankı kuyruğu motorun yankısında sürer).
  const bitir=()=>{try{g.disconnect(); if(dugum!==g) dugum.disconnect(); y?.disconnect();}catch{/* zaten kopuk */}};
  return {giris:g,son,bitir};
}

// Kaynaklardan en geç biteni çıkışı koparır.
function bitince(kaynaklar,cik){
  if(!kaynaklar.length){cik.bitir(); return;}
  const son=kaynaklar.reduce((a,b)=>(b._bitis??0)>(a._bitis??0)?b:a);
  son.onended=cik.bitir;
}

function baslat(k,t,bitis){k.start(t); k.stop(bitis); k._bitis=bitis; return k;}

function gurultu(ctx,ortak,renk,r,t,sure){
  const s=ctx.createBufferSource(); s.buffer=ortak.tampon(renk); s.loop=true;
  s.start(t,r()*s.buffer.duration*.9); s.stop(t+sure); s._bitis=t+sure;
  return s;
}

function suzgec(ctx,tur,f,q=.7){const b=ctx.createBiquadFilter(); b.type=tur; b.frequency.value=f; b.Q.value=q; return b;}

// Vurmalı zarf: 0 -> tepe (acilis) -> üstel sönüm. Bitişte tam sıfır.
function vurZarf(param,t,tepe,acilis,sure){
  param.setValueAtTime(0,t);
  param.linearRampToValueAtTime(tepe,t+acilis);
  param.exponentialRampToValueAtTime(SIFIR,t+sure);
  param.linearRampToValueAtTime(0,t+sure+.006);
}

function egriyeOlcekle(egri,k){const e=new Float32Array(egri.length); for(let i=0;i<e.length;i++) e[i]=egri[i]*k; return e;}

// ---- yapı taşları (efekt ve ortam olayları paylaşır) ----

function gicirtiKur(ctx,giris,g,t,kaynaklar,{suzgecF}={}){
  const t0=t+g.bas, o=ctx.createOscillator(); o.type='sawtooth';
  o.frequency.value=g.hiz[0];
  o.frequency.setValueCurveAtTime(g.hiz,t0,g.sure);
  const a=ctx.createGain();
  a.gain.setValueAtTime(0,t0);
  a.gain.setValueCurveAtTime(egriyeOlcekle(g.zarf,g.kazanc),t0+.001,g.sure-.002);
  let son=a;
  if(suzgecF){const lp=suzgec(ctx,'lowpass',suzgecF,.5); a.connect(lp); son=lp;}
  son.connect(giris);
  for(const z of g.rez){const b=suzgec(ctx,'bandpass',z.f,z.q), k=ctx.createGain(); k.gain.value=z.g; o.connect(b); b.connect(k); k.connect(a);}
  kaynaklar.push(baslat(o,t0,t0+g.sure));
}

function vurusKur(ctx,ortak,giris,v,t,r,kaynaklar){
  const t0=t+(v.zaman??0);
  const o=ctx.createOscillator(); o.type='sine';
  o.frequency.setValueAtTime(v.f,t0);
  o.frequency.exponentialRampToValueAtTime(v.f*v.dus,t0+v.sure*.5);
  const a=ctx.createGain(); vurZarf(a.gain,t0,v.kazanc,.004,v.sure);
  o.connect(a); a.connect(giris);
  kaynaklar.push(baslat(o,t0,t0+v.sure+.012));
  if(v.gurultuKazanc>0){
    const n=gurultu(ctx,ortak,'pembe',r,t0,v.sure*.6+.01), lp=suzgec(ctx,'lowpass',v.gurultuF,.6), b=ctx.createGain();
    vurZarf(b.gain,t0,v.kazanc*v.gurultuKazanc,.002,v.sure*.6);
    n.connect(lp); lp.connect(b); b.connect(giris);
    kaynaklar.push(n);
  }
}

function patlamaKur(ctx,ortak,giris,{zaman,f,q=2,sure,kazanc,renk='beyaz',acilis=.0008},r,kaynaklar){
  const n=gurultu(ctx,ortak,renk,r,zaman,sure+.01), b=suzgec(ctx,'bandpass',f,q), a=ctx.createGain();
  vurZarf(a.gain,zaman,kazanc,acilis,sure);
  n.connect(b); b.connect(a); a.connect(giris);
  kaynaklar.push(n);
}

function sinusKur(ctx,giris,{zaman,f,kazanc,acilis=.002,sure,dus},kaynaklar){
  const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(f,zaman);
  if(dus) o.frequency.linearRampToValueAtTime(f*dus,zaman+sure);
  const a=ctx.createGain(); vurZarf(a.gain,zaman,kazanc,acilis,sure);
  o.connect(a); a.connect(giris);
  kaynaklar.push(baslat(o,zaman,zaman+sure+.012));
}

// ---- efektler ----

const KUR={
  daktilo(ctx,c,T,t,r,ortak,k){
    patlamaKur(ctx,ortak,c.giris,{zaman:t,f:T.tik.f,q:T.tik.q,sure:T.tik.sure+.012,kazanc:T.kazanc},r,k);
    sinusKur(ctx,c.giris,{zaman:t,f:T.govde.f,kazanc:T.kazanc*T.govde.kazanc,acilis:.001,sure:T.govde.sure,dus:.8},k);
  },
  'kapi-ac'(ctx,c,T,t,r,ortak,k){
    patlamaKur(ctx,ortak,c.giris,{zaman:t+T.mandal.zaman,f:T.mandal.f,q:4,sure:.03,kazanc:T.mandal.kazanc},r,k);
    gicirtiKur(ctx,c.giris,T.gicirti,t,k);
  },
  'kapi-kapa'(ctx,c,T,t,r,ortak,k){
    gicirtiKur(ctx,c.giris,T.gicirti,t,k);
    vurusKur(ctx,ortak,c.giris,T.carpma,t,r,k);
    patlamaKur(ctx,ortak,c.giris,{zaman:t+T.mandal.zaman,f:T.mandal.f,q:4,sure:.03,kazanc:T.mandal.kazanc},r,k);
  },
  sandalye(ctx,c,T,t,r,ortak,k){
    const s=T.surtunme, n=gurultu(ctx,ortak,'pembe',r,t,s.sure+.02), b=suzgec(ctx,'bandpass',s.fEgri[0],s.q), a=ctx.createGain();
    b.frequency.setValueCurveAtTime(s.fEgri,t,s.sure);
    a.gain.setValueAtTime(0,t);
    a.gain.setValueCurveAtTime(egriyeOlcekle(s.zarf,s.kazanc),t+.001,s.sure-.002);
    n.connect(b); b.connect(a); a.connect(c.giris); k.push(n);
    if(T.gicirti) gicirtiKur(ctx,c.giris,T.gicirti,t,k);
    vurusKur(ctx,ortak,c.giris,T.oturma,t,r,k);
  },
  adim(ctx,c,T,t,r,ortak,k){
    for(const v of T.adimlar) vurusKur(ctx,ortak,c.giris,v,t,r,k);
    if(T.gicirti) gicirtiKur(ctx,c.giris,T.gicirti,t,k);
  },
  sayfa(ctx,c,T,t,r,ortak,k){
    const s=T.supurme, d=T.sure0, n=gurultu(ctx,ortak,'pembe',r,t,d+.02), b=suzgec(ctx,'bandpass',s.fEgri[0],s.q), lp=suzgec(ctx,'lowpass',2600,.5), a=ctx.createGain();
    b.frequency.setValueCurveAtTime(s.fEgri,t,d);
    a.gain.setValueAtTime(0,t);
    a.gain.linearRampToValueAtTime(s.kazanc,t+d*.3);
    a.gain.linearRampToValueAtTime(s.kazanc*.6,t+d*.7);
    a.gain.linearRampToValueAtTime(0,t+d);
    n.connect(b); b.connect(lp); lp.connect(a); a.connect(c.giris); k.push(n);
    for(const z of T.citir) patlamaKur(ctx,ortak,c.giris,{zaman:t+z.zaman,f:1700,q:1.5,sure:.012,kazanc:s.kazanc*.5*z.kazanc},r,k);
  },
  kalem(ctx,c,T,t,r,ortak,k){
    const lp=suzgec(ctx,'lowpass',2400,.5); lp.connect(c.giris);
    for(const z of T.cizgiler){
      const t0=t+z.zaman, n=gurultu(ctx,ortak,'beyaz',r,t0,z.sure+.01), b=suzgec(ctx,'bandpass',z.f,T.q), a=ctx.createGain();
      // grafitin kâğıtta takılması: kısa aralıklı pürüz eğrisi
      const m=Math.max(4,Math.round(z.sure*90)), e=new Float32Array(m);
      for(let i=0;i<m;i++) e[i]=T.kazanc*z.kazanc*Math.sin(Math.PI*i/(m-1))*(.55+.45*r());
      e[0]=0; e[m-1]=0;
      a.gain.setValueAtTime(0,t0); a.gain.setValueCurveAtTime(e,t0+.001,z.sure);
      n.connect(b); b.connect(a); a.connect(lp); k.push(n);
    }
  },
  iz(ctx,c,T,t,r,ortak,k){
    const lp=suzgec(ctx,'lowpass',1800,.5); lp.connect(c.giris);
    sinusKur(ctx,lp,{zaman:t,f:T.f,kazanc:T.kazanc,acilis:T.acilis,sure:T.sonum},k);
    sinusKur(ctx,lp,{zaman:t,f:T.f*2.003,kazanc:T.kazanc*T.ikinci,acilis:T.acilis,sure:T.sonum*.5},k);
  },
  gun(ctx,c,T,t,r,ortak,k){
    const lp=suzgec(ctx,'lowpass',1400,.5); lp.connect(c.giris);
    for(const p of T.kismiler) sinusKur(ctx,lp,{zaman:t,f:p.f,kazanc:T.kazanc*p.g,acilis:.008,sure:p.d},k);
    vurusKur(ctx,ortak,c.giris,T.davul,t,r,k);
  },
  'geri-sar'(ctx,c,T,t,r,ortak,k){
    const sr=ctx.sampleRate, veri=tersTon(sr,rng(T.tohum),{sure:T.sure-.1,temel:T.temel});
    const tb=ctx.createBuffer(1,veri.length,sr); tb.getChannelData(0).set(veri);
    const s=ctx.createBufferSource(); s.buffer=tb;
    // çalma hızı sondan başa artar: bant geri sarılıyormuş gibi; süre buna göre kısalır
    const gercek=(T.sure-.1)/((T.hiz[0]+T.hiz[1])/2);
    s.playbackRate.setValueAtTime(T.hiz[0],t);
    s.playbackRate.linearRampToValueAtTime(T.hiz[1],t+gercek);
    const lp=suzgec(ctx,'lowpass',T.suzgec[0],.7), a=ctx.createGain(); a.gain.value=T.kazanc;
    lp.frequency.setValueAtTime(T.suzgec[0],t);
    lp.frequency.exponentialRampToValueAtTime(T.suzgec[1],t+gercek);
    s.connect(lp); lp.connect(a); a.connect(c.giris);
    k.push(baslat(s,t,t+gercek+.05));
  },
  hukum(ctx,c,T,t,r,ortak,k){
    vurusKur(ctx,ortak,c.giris,T.vurus,t,r,k);
    sinusKur(ctx,c.giris,{zaman:t,f:T.alt.f,kazanc:T.alt.kazanc,acilis:.01,sure:T.alt.sure,dus:.9},k);
  },

  // ---- ortam olayları ----
  tahta(ctx,c,T,t,r,ortak,k){gicirtiKur(ctx,c.giris,T.gicirti,t,k,{suzgecF:T.suzgec});},
  havlama(ctx,c,T,t,r,ortak,k){
    const lp=suzgec(ctx,'lowpass',T.suzgec,.5); lp.connect(c.giris);
    for(const h of T.havlamalar){
      const t0=t+h.zaman, o=ctx.createOscillator(); o.type='sawtooth';
      o.frequency.setValueAtTime(h.f,t0); o.frequency.exponentialRampToValueAtTime(h.f*.72,t0+h.sure);
      const b=suzgec(ctx,'bandpass',T.formant,2.5), a=ctx.createGain(); vurZarf(a.gain,t0,T.kazanc,.012,h.sure);
      o.connect(b); b.connect(a); a.connect(lp);
      k.push(baslat(o,t0,t0+h.sure+.01));
      patlamaKur(ctx,ortak,lp,{zaman:t0,f:T.formant,q:1.5,sure:h.sure*.6,kazanc:T.kazanc*.5,renk:'pembe',acilis:.01},r,k);
    }
  },
  baykus(ctx,c,T,t,r,ortak,k){
    const lp=suzgec(ctx,'lowpass',800,.5); lp.connect(c.giris);
    for(const u of T.ulumalar){
      const t0=t+u.zaman, o=ctx.createOscillator(); o.type='sine';
      o.frequency.setValueAtTime(u.f,t0); o.frequency.linearRampToValueAtTime(u.f*u.dus,t0+u.sure);
      const a=ctx.createGain();
      a.gain.setValueAtTime(0,t0);
      a.gain.linearRampToValueAtTime(T.kazanc,t0+u.sure*.35);
      a.gain.linearRampToValueAtTime(T.kazanc*.7,t0+u.sure*.7);
      a.gain.linearRampToValueAtTime(0,t0+u.sure);
      o.connect(a); a.connect(lp);
      k.push(baslat(o,t0,t0+u.sure+.01));
    }
  },
  hisirti(ctx,c,T,t,r,ortak,k){
    const n=gurultu(ctx,ortak,'pembe',r,t,T.sure+.02), b=suzgec(ctx,'bandpass',T.f,T.q), lp=suzgec(ctx,'lowpass',2400,.5), a=ctx.createGain();
    const m=T.parca*6+2, e=new Float32Array(m);
    for(let i=0;i<m;i++) e[i]=T.kazanc*Math.sin(Math.PI*i/(m-1))*Math.pow(r(),.6);
    e[0]=0; e[m-1]=0;
    a.gain.setValueAtTime(0,t); a.gain.setValueCurveAtTime(e,t+.001,T.sure);
    n.connect(b); b.connect(lp); lp.connect(a); a.connect(c.giris); k.push(n);
  },
  tik(ctx,c,T,t,r,ortak,k){
    patlamaKur(ctx,ortak,c.giris,{zaman:t,f:T.f,q:5,sure:.012,kazanc:T.kazanc},r,k);
    sinusKur(ctx,c.giris,{zaman:t,f:T.govde,kazanc:T.kazanc*.35,acilis:.0005,sure:.02},k);
  },
  citirti(ctx,c,T,t,r,ortak,k){patlamaKur(ctx,ortak,c.giris,{zaman:t,f:T.f,q:1.2,sure:.004,kazanc:T.kazanc},r,k);},
  tas(ctx,c,T,t,r,ortak,k){
    vurusKur(ctx,ortak,c.giris,{zaman:0,f:T.vurus.f,dus:.8,sure:T.vurus.sure,gurultuF:900,kazanc:T.vurus.kazanc,gurultuKazanc:.8},t,r,k);
    const lp=suzgec(ctx,'lowpass',2600,.5); lp.connect(c.giris);
    for(const z of T.cinlama) sinusKur(ctx,lp,{zaman:t+.002,f:z.f,kazanc:T.cinlamaKazanc,acilis:.001,sure:z.d},k);
  },
  cam(ctx,c,T,t,r,ortak,k){
    vurusKur(ctx,ortak,c.giris,{zaman:0,f:T.vurus.f,dus:.8,sure:T.vurus.sure,gurultuF:1100,kazanc:T.vurus.kazanc,gurultuKazanc:.9},t,r,k);
    const lp=suzgec(ctx,'lowpass',2800,.5); lp.connect(c.giris);
    patlamaKur(ctx,ortak,lp,{zaman:t+.005,f:T.kirilma.f,q:.8,sure:T.kirilma.sure,kazanc:T.kirilma.kazanc,renk:'pembe',acilis:.002},r,k);
    for(const p of T.parcalar) sinusKur(ctx,lp,{zaman:t+.01+p.zaman,f:p.f,kazanc:T.parcaKazanc*p.kazanc,acilis:.0008,sure:.05+.05*r()},k);
  },
  bagiris(ctx,c,T,t,r,ortak,k){
    const n=gurultu(ctx,ortak,'pembe',r,t,T.sure+.02), lp=suzgec(ctx,'lowpass',1700,.5), a=ctx.createGain();
    for(const [i,f] of T.formantlar.entries()){const b=suzgec(ctx,'bandpass',f,T.q), g=ctx.createGain(); g.gain.value=i?.6:1; n.connect(b); b.connect(g); g.connect(lp);}
    // kabaran, dalgalanan zarf: bir dalga, konuşma hecesi değil
    const m=Math.round(T.sure*12), e=new Float32Array(m);
    for(let i=0;i<m;i++){const x=i/(m-1); e[i]=T.kazanc*Math.pow(Math.sin(Math.PI*Math.pow(x,.6)),1.5)*(.75+.25*r());}
    e[0]=0; e[m-1]=0;
    a.gain.setValueAtTime(0,t); a.gain.setValueCurveAtTime(e,t+.001,T.sure);
    lp.connect(a); a.connect(c.giris); k.push(n);
  },
  tezahurat(ctx,c,T,t,r,ortak,k){
    const n=gurultu(ctx,ortak,'pembe',r,t,T.sure+.02), b=suzgec(ctx,'bandpass',T.f,T.q), lp=suzgec(ctx,'lowpass',2200,.5), a=ctx.createGain();
    b.frequency.setValueAtTime(T.f*.85,t); b.frequency.linearRampToValueAtTime(T.f*1.15,t+T.sure*.5); b.frequency.linearRampToValueAtTime(T.f,t+T.sure);
    a.gain.setValueAtTime(0,t);
    a.gain.linearRampToValueAtTime(T.kazanc,t+T.sure*.35);
    a.gain.linearRampToValueAtTime(T.kazanc*.8,t+T.sure*.6);
    a.gain.linearRampToValueAtTime(0,t+T.sure);
    n.connect(b); b.connect(lp); lp.connect(a); a.connect(c.giris); k.push(n);
  }
};

// Tarifi `zaman` anına kurar. Bitiş zamanını döndürür; tarif tanınmazsa null.
export function efektKur(ctx,hedef,tarif,zaman,r,ortak){
  const kur=KUR[tarif?.ad];
  if(!kur) return null;
  const c=cikis(ctx,hedef,{pan:tarif.pan,yanki:tarif.yanki},zaman+tarif.sure);
  const kaynaklar=[];
  kur(ctx,c,tarif,zaman,r,ortak,kaynaklar);
  bitince(kaynaklar,c);
  return zaman+tarif.sure;
}
