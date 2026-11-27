// İfade ve beden dili: sorguda yüzün ve gövdenin duyguya göre oynaması. Çizmez; yalnızca poz alanlarını sürer.
// Ayrıntı ve kullanım: README.md "İfade ve beden dili".
//
//   const ifade=ifadeKur({mizac:'korkak', tohum:42});
//   ifade.hedefle('gergin',.7);       // duruma geçer (kritik sönümlü, sıçramasız)
//   ifade.tepkiOyna(cevap.tepki);     // cevap.js'in tepki nesnesi (ya da cevabın kendisi); {durum,siddet,bekle} döner
//   ifade.guncelle(dt,poz);           // her karede, sahnenin kendi guncelle'sinden sonra ya da önce (ayrı alanlar yazar)
//
// İlke: oyun karanlık ve ölçülü; ifade okunur ama incedir. Hiçbir değer abartılı bir çizgi film yüzüne varmaz (SINIR).
// Rastgelelik yalnızca tohumlu rng ile gelir: aynı tohum, aynı çağrılar ve aynı kare süreleri aynı oyunculuğu verir.
// Karakterin kalıcı dinlenme ifadesi (görünüşteki `ifade`) çizimde ayrıca uygulanır; buradaki değerler onun üstüne biner.
import {rng as rngKur} from '../../cekirdek/rastgele.js';
import {POZ_NOTR} from './poz.js';
import {cikisKaresi} from './cikis.js';

export const DURUMLAR=['sakin','gergin','korkmus','ofkeli','uzgun','kucumseyen','saskin','tutan'];
export const DURUM_ADLARI={sakin:'sakin',gergin:'gergin',korkmus:'korkmuş',ofkeli:'öfkeli',uzgun:'üzgün',kucumseyen:'küçümseyen',saskin:'şaşkın',tutan:'kendini tutan'};

// İfadenin sürdüğü poz alanları ve güvenli sınırları (bunun dışı abartılı ya da falso durur).
export const SINIR={
  kasKaldir:[-.8,1.8], kasCat:[-1.4,1.9], kasEgim:[-.1,.1], kasSol:[-9,5], kasSag:[-9,5],
  gozAc:[-.85,.9], kirp:[0,1], gozSegir:[0,1], bakisX:[-.9,.9], bakisY:[-.5,.9],
  agizKose:[-.8,.5], agizYan:[-.5,.5], dudakSik:[0,1], agizGer:[-.6,.8], agizAralik:[0,.8], burunAc:[0,1], kizar:[0,.8], yutkun:[0,1],
  basEgim:[-.09,.09], basEg:[-.7,.8], basDon:[-.6,.6], egil:[-.7,.7], omuzKalk:[-.8,.9], nefesEk:[-1,1]
};
export const KANALLAR=Object.keys(SINIR);

/* Durumlar: tam şiddette nötrden sapma (poz alanları) ve davranış.
   davranış: kirpHiz (göz kırpma çarpanı; sahnenin kendi kırpması 1), kacirma (saniyede bakış kaçırma), kacirmaYon ('asagi'|'yan'),
   flik (bakışın bir an kaçıp dönmesi, saniyede), segir, yutkun, islat (dudak ıslatma), salla (baş sallama), ikiYana, ic (iç çekme),
   titreme (başın ince titremesi), mikro (kaşta canlılık), nefesHiz (Hz), nefesDerin (0-1). */
export const PROFIL={
  sakin:{poz:{}, dav:{}},
  gergin:{poz:{kasCat:.6, kasKaldir:.6, kasEgim:.03, gozAc:.25, dudakSik:.55, agizKose:-.15, omuzKalk:.55, basEg:.12, egil:-.15},
    dav:{kirpHiz:2.3, kacirma:.1, flik:.12, segir:.04, yutkun:.06, islat:.05, titreme:.25, mikro:1.2, nefesHiz:.42, nefesDerin:.3}},
  korkmus:{poz:{kasKaldir:1.45, kasCat:-.55, kasEgim:.04, gozAc:.85, dudakSik:.1, agizKose:-.25, agizGer:.7, agizAralik:.1, omuzKalk:.8, egil:-.5, basEg:.2, bakisY:.06},
    dav:{kirpHiz:1.5, kacirma:.2, flik:.3, segir:.05, yutkun:.1, titreme:.75, mikro:1.4, nefesHiz:.62, nefesDerin:.32}},
  ofkeli:{poz:{kasCat:1.75, kasKaldir:-.6, kasEgim:-.05, gozAc:-.5, burunAc:.8, dudakSik:.7, agizKose:-.35, kizar:.5, basEg:-.12, egil:.35, omuzKalk:.25},
    dav:{kacirma:.01, ikiYana:.03, titreme:.15, mikro:.6, nefesHiz:.36, nefesDerin:.7}},
  uzgun:{poz:{kasCat:-1.3, kasKaldir:.35, kasEgim:.07, gozAc:-.4, bakisY:.55, agizKose:-.7, basEg:.45, basEgim:.035, omuzKalk:-.6, egil:.08},
    dav:{kirpHiz:.8, agirKirp:.06, kacirma:.04, ic:.07, mikro:.5, nefesHiz:.22, nefesDerin:.2}},
  kucumseyen:{poz:{agizYan:.48, agizKose:-.08, gozAc:-.5, basEg:-.45, basEgim:-.025, kasKaldir:.15, kasSag:-4, egil:-.3},
    dav:{kacirma:.04, kacirmaYon:'yan', mikro:.3, nefesHiz:.2, nefesDerin:.15}},
  saskin:{poz:{kasKaldir:1.7, kasCat:-.3, gozAc:.85, agizAralik:.8, agizGer:-.35, basEg:-.14, egil:-.25, omuzKalk:.2},
    dav:{kacirma:.02, flik:.1, mikro:.6}},
  tutan:{poz:{dudakSik:.85, agizKose:-.06, agizYan:.12, kasCat:.5, kasKaldir:-.2, gozAc:-.2, omuzKalk:.2, basEg:-.04},
    dav:{kirpHiz:1.9, kacirma:.02, flik:.16, segir:.06, yutkun:.1, islat:.08, titreme:.08, mikro:.4, nefesHiz:.2, nefesDerin:.12}}
};
const DAV_NOTR={kirpHiz:1, agirKirp:0, kacirma:.02, kacirmaYon:'asagi', flik:.03, segir:0, yutkun:.01, islat:.01, salla:0, ikiYana:0, ic:0, titreme:0, mikro:.5, nefesHiz:0, nefesDerin:0};

/* Mizaç süzgeci: aynı duygu mizaca göre farklı oynanır.
   olcek: yüz ve beden sapmalarının genel çarpanı; ek: mizacın kendi izi (şiddetle büyür); dav: davranış çarpanları. */
export const MIZAC_SUZGEC={
  korkak:{olcek:1.1, ek:{omuzKalk:-.35, bakisY:.22, basEg:.18, egil:-.12, kasKaldir:.1}, dav:{kacirma:2, flik:1.5, kirpHiz:1.25, titreme:1.4, yutkun:1.4}},
  sert:{olcek:.7, ek:{gozAc:-.3, basEg:-.12, kasCat:.15, dudakSik:.15}, dav:{kacirma:.2, flik:.3, titreme:.2, mikro:.3, kirpHiz:.6, yutkun:.5, segir:.5, islat:.4}},
  kurnaz:{olcek:.85, ek:{agizYan:.28, kasSol:-3, gozAc:-.2}, dav:{kacirma:.6, kacirmaYon:'yan', flik:1.6, mikro:1.2}},
  gururlu:{olcek:.85, ek:{basEg:-.32, gozAc:-.32, egil:-.2, kasKaldir:.08}, dav:{kacirma:.4, kacirmaYon:'yan', kirpHiz:.7, flik:.5}},
  saf:{olcek:1.1, ek:{gozAc:.28, kasKaldir:.28, kasCat:-.12}, dav:{flik:1.2, mikro:1.2}},
  dedikoducu:{olcek:1.12, ek:{egil:.35, kasKaldir:.18, basEgim:.025}, dav:{mikro:1.7, salla:1, kacirma:1.2, kacirmaYon:'yan', flik:1.6}},
  ofkeli:{olcek:1.05, ek:{burunAc:.3, kasCat:.25, gozAc:-.1}, dav:{ikiYana:1.5, titreme:.6, kirpHiz:.85}},
  sakin:{olcek:.6, ek:{}, dav:{mikro:.4, kacirma:.5, flik:.5, titreme:.3, kirpHiz:.85, nefesHiz:.85}}
};
// mizacın kendi izi: dedikoducu sakinken de arada başını sallar
const MIZAC_DAV_EK={dedikoducu:{salla:.06}};

const sinirla=(k,v)=>{const s=SINIR[k]; return v<s[0]?s[0]:v>s[1]?s[1]:v;};

/* Saf: durum + şiddet + mizaç → hedef poz (nötr + sapma, sınırlanmış) ve davranış. */
export function hedefHesapla(durum,siddet=.6,mizac=null){
  const P=PROFIL[durum]||PROFIL.sakin, s=Math.max(0,Math.min(1,siddet)), M=MIZAC_SUZGEC[mizac]||null;
  const olcek=M?M.olcek:1, ekGuc=durum==='sakin'?.3:s;
  const poz={};
  for(const k of KANALLAR){
    if(k==='kirp'||k==='gozSegir'||k==='yutkun'||k==='nefesEk') continue; // bunlar olaylarla sürülür
    let d=(P.poz[k]||0)*s*olcek;
    if(M&&M.ek[k]) d+=M.ek[k]*ekGuc;
    poz[k]=sinirla(k,(POZ_NOTR[k]||0)+d);
  }
  const dav={...DAV_NOTR};
  for(const k in P.dav){
    const v=P.dav[k];
    dav[k]=typeof v==='string'?(s>.2?v:dav[k]):DAV_NOTR[k]+(v-DAV_NOTR[k])*s; // şiddet davranışı da nötrden durumuna taşır
  }
  if(M) for(const k in M.dav){const v=M.dav[k]; if(typeof v==='string') dav[k]=v; else dav[k]*=v;}
  if(mizac&&MIZAC_DAV_EK[mizac]) for(const k in MIZAC_DAV_EK[mizac]) dav[k]+=MIZAC_DAV_EK[mizac][k];
  return {poz,dav};
}

/* Saf: cevap.js'in tepki nesnesinden duruma (tepkiKur'un not seçimiyle aynı sıra). */
export function tepkidenDurum(tepki,mizac){
  const t=tepki&&tepki.tepki?tepki.tepki:tepki||{};
  const g=typeof t.gerginlik==='number'?t.gerginlik:0;
  const duzey=t.duzey||(g<.25?'sakin':g<.45?'tedirgin':g<.65?'gergin':'cok-gergin');
  if(mizac==='ofkeli'&&g>=.4) return {durum:'ofkeli',siddet:Math.min(1,.35+g*.65)};
  if(duzey==='cok-gergin') return {durum:mizac==='korkak'||mizac==='saf'?'korkmus':'gergin',siddet:Math.min(1,.6+g*.4)};
  if(duzey==='gergin') return {durum:mizac==='kurnaz'||mizac==='sert'||mizac==='gururlu'?'tutan':'gergin',siddet:.35+g*.5};
  if(duzey==='tedirgin') return {durum:mizac==='kurnaz'||mizac==='gururlu'||mizac==='sert'?'tutan':'gergin',siddet:.2+g*.5};
  if(mizac==='gururlu') return {durum:'kucumseyen',siddet:.35};
  return {durum:'sakin',siddet:.5};
}

/* Olay eğrileri (0→1→0) */
const tepe=p=>p<=0||p>=1?0:Math.sin(p*Math.PI);
const tepe2=p=>{const v=tepe(p); return v*v;};
const yukselDus=(p,a)=>p<=0||p>=1?0:p<a?Math.sin(p/a*Math.PI/2):Math.cos((p-a)/(1-a)*Math.PI/2);

// kritik sönümlü yay: hedefe sıçramadan, salınmadan varır. w büyük = hızlı.
const W={bakisX:24, bakisY:24, basDon:5.5, basEg:4.2, basEgim:4, egil:3.2, omuzKalk:3.8, kizar:1.4, agizKose:7, agizYan:7, dudakSik:9, agizAralik:7, burunAc:6};
const W_YUZ=7.5;

export function ifadeKur({mizac=null,tohum=1,azHareket=false}={}){
  const r=rngKur((tohum|0)^0x5bd1e995);
  const durum={ad:'sakin',siddet:0};
  let hedef=hedefHesapla('sakin',0,mizac);
  const x={}, v={};
  for(const k of KANALLAR){x[k]=POZ_NOTR[k]||0; v[k]=0;}
  let t=0, nefesFaz=0, nefesHiz=0, nefesDerin=0, konusmaSon=-9;
  const olaylar=[]; // {tur,bas,sure,a,b}
  const sonraki={};
  const gurultu={}; // titreme ve canlılık için düğümlü değer gürültüsü (tohumlu)
  let cikisBas=null;
  const api={cikis:null};

  const ustel=hiz=>hiz>0?-Math.log(1-r()*.999)/hiz:1e9;
  function zamanla(tur,hiz,simdi){sonraki[tur]=simdi+ustel(hiz);}
  function hepsiniZamanla(){
    const D=hedef.dav;
    zamanla('kirp',Math.max(0,D.kirpHiz-1)*.14,t); zamanla('agirKirp',D.agirKirp,t);
    zamanla('kacir',D.kacirma,t); zamanla('flik',D.flik,t); zamanla('segir',D.segir,t); zamanla('yutkun',D.yutkun,t);
    zamanla('islat',D.islat,t); zamanla('salla',D.salla,t); zamanla('ikiYana',D.ikiYana,t); zamanla('ic',D.ic,t);
  }
  function olayEkle(tur,gecikme=0){
    const bas=t+gecikme;
    let sure=.2, a=0, b=0;
    if(tur==='kirp'){sure=.17; a=r()<.15?1:0;}            // a: çift kırpma
    else if(tur==='agirKirp') sure=.55;
    else if(tur==='kacir'){
      sure=.55+r()*.9;
      const yan=hedef.dav.kacirmaYon==='yan';
      a=(r()<.5?-1:1)*(yan?.6+r()*.25:.3+r()*.35); b=yan?(r()-.3)*.25:.45+r()*.35; // yön: aşağı-yana ya da yana
    }
    else if(tur==='flik'){sure=.14+r()*.14; a=(r()<.5?-1:1)*(.25+r()*.25); b=(r()-.3)*.3;}
    else if(tur==='segir') sure=.42;
    else if(tur==='yutkun') sure=.8;
    else if(tur==='islat') sure=.62;
    else if(tur==='salla') sure=.95;
    else if(tur==='ikiYana') sure=1.05;
    else if(tur==='ic') sure=2.8;
    else if(tur==='duraksa') sure=.75;
    olaylar.push({tur,bas,sure,a,b});
  }
  // gürültü: her kanal için 0.15 s aralıklı düğümler arasında yumuşak geçiş (aynı tohum = aynı titreme)
  function gur(ad,aralik=.15){
    let g=gurultu[ad]; if(!g){g=gurultu[ad]={t0:t,a:r()*2-1,b:r()*2-1};}
    while(t-g.t0>=aralik){g.t0+=aralik; g.a=g.b; g.b=r()*2-1;}
    const p=(t-g.t0)/aralik, s=p*p*(3-2*p); return g.a+(g.b-g.a)*s;
  }

  api.hedefle=(ad,siddet=.6)=>{
    if(!PROFIL[ad]) ad='sakin';
    durum.ad=ad; durum.siddet=siddet;
    hedef=hedefHesapla(ad,siddet,mizac);
    hepsiniZamanla();
    return api;
  };
  // tepki: cevap.js'in döndürdüğü tepki ({gerginlik,duzey,gozKacirma,duraksama,not,tavirIpucu}) ya da cevabın kendisi.
  // Döner: {durum, siddet, bekle}: bekle saniye kadar konuşmayı geciktirmek duraksamayı okunur kılar.
  api.tepkiOyna=tepki=>{
    const T=tepki&&tepki.tepki?tepki.tepki:tepki;
    if(!T) return {durum:durum.ad,siddet:durum.siddet,bekle:0};
    const {durum:ad,siddet}=tepkidenDurum(T,mizac);
    api.hedefle(ad,siddet);
    let bekle=0;
    if(T.duraksama){ // söze başlamadan: dudak sıkılır, bakış iner, yutkunur
      olayEkle('duraksa'); olayEkle('flik',.05); olayEkle('yutkun',.22); bekle=.75;
    }
    if(T.gozKacirma){olayEkle('kacir',T.duraksama?.4:.1); olaylar[olaylar.length-1].sure+=.8;}
    if(T.tavirIpucu==='susar'){olayEkle('islat',.1); olayEkle('kacir',.5);}
    return {durum:ad,siddet,bekle};
  };
  // tek bir hareketi hemen oynat: 'kirp','agirKirp','kacir','flik','segir','yutkun','islat','salla','ikiYana','ic','duraksa'
  api.oynat=(tur,gecikme=0)=>{olayEkle(tur,gecikme); return api;};
  // hedefe hemen otur (durağan kare, karakter değişimi); olayları siler
  api.yerles=pozHedef=>{
    for(const k of KANALLAR){x[k]=k in hedef.poz?hedef.poz[k]:(POZ_NOTR[k]||0); v[k]=0;}
    olaylar.length=0;
    if(pozHedef) yaz(pozHedef,false);
    return api;
  };
  api.sifirla=pozHedef=>{api.hedefle('sakin',0); cikisBas=null; cikisEk=null; api.cikis=null; api.cikisBitti=false; api.yerles(pozHedef); return api;};
  // sorgu bitince: sandalyeden kalkar, başı önde, karanlığa çekilir (cikis.js). guncelle her karede api.cikis'i doldurur.
  api.kalk=()=>{cikisBas=t; api.hedefle(durum.ad==='sakin'?'sakin':durum.ad,Math.min(durum.siddet,.5)); return api;};
  api.durum=()=>({...durum});

  let cikisEk=null; // kalkarken öne eğilme ve yere bakış: yayların üstüne yalnızca çıktıda eklenir
  function yaz(P,canli){
    for(const k of KANALLAR) P[k]=sinirla(k,cikisEk&&cikisEk[k]?x[k]+cikisEk[k]:x[k]);
    if(!canli){P.kirp=0; P.gozSegir=0; P.yutkun=0; P.nefesEk=0;}
  }

  api.guncelle=(dt,P)=>{
    dt=Math.max(0,Math.min(.1,dt||0));
    t+=dt;
    const konusuyor=P&&P.agizAc>.02;
    if(konusuyor) konusmaSon=t;
    const agizKilit=t-konusmaSon<.3; // konuşurken ve hemen ardından ağız köşesi yerinden oynamaz
    const D=hedef.dav, H=hedef.poz;
    // olay zamanlaması
    if(!azHareket) for(const tur in sonraki) if(t>=sonraki[tur]){
      const agizli=tur==='yutkun'||tur==='islat';
      if(agizli&&agizKilit){sonraki[tur]=t+.6; continue;} // konuşurken yutkunmaz, dudak ıslatmaz: sonra
      if(!olaylar.some(o=>o.tur===tur)) olayEkle(tur);
      const hiz={kirp:Math.max(0,D.kirpHiz-1)*.14,agirKirp:D.agirKirp,kacir:D.kacirma,flik:D.flik,segir:D.segir,yutkun:D.yutkun,islat:D.islat,salla:D.salla,ikiYana:D.ikiYana,ic:D.ic}[tur];
      zamanla(tur,hiz,t+1);
    }
    // olayların katkıları
    const ek={}; let kirp=0, segir=0, yutkun=0, nefes=0;
    const ekle=(k,d)=>{ek[k]=(ek[k]||0)+d;};
    for(let i=olaylar.length-1;i>=0;i--){
      const o=olaylar[i], p=(t-o.bas)/o.sure;
      if(p<0) continue;
      if(p>=1){olaylar.splice(i,1); continue;}
      if(o.tur==='kirp'){kirp=Math.max(kirp,tepe(p*(o.a?1.75:1))); if(o.a&&p>.6) kirp=Math.max(kirp,tepe((p-.6)/.4));}
      else if(o.tur==='agirKirp') kirp=Math.max(kirp,.92*yukselDus(p,.35));
      else if(o.tur==='kacir'){const e=p<.15?p/.15:p>.8?(1-p)/.2:1, s=e*e*(3-2*e); ekle('bakisX',o.a*s); ekle('bakisY',o.b*s); ekle('basDon',o.a*.3*s); ekle('basEg',Math.max(0,o.b)*.12*s);}
      else if(o.tur==='flik'){const s=tepe(p); ekle('bakisX',o.a*s); ekle('bakisY',o.b*s);}
      else if(o.tur==='segir') segir=Math.max(segir,Math.max(0,Math.sin(p*Math.PI*6))*(1-p));
      else if(o.tur==='yutkun'){const s=tepe2(p); yutkun=Math.max(yutkun,s); ekle('basEg',.1*s); ekle('dudakSik',.45*tepe(Math.min(1,p*1.2)));}
      else if(o.tur==='islat'){const s=tepe(p); ekle('dudakSik',.6*s); ekle('agizKose',-.04*s);}
      else if(o.tur==='salla') ekle('basEg',.16*Math.sin(p*Math.PI*4)*(1-p));
      else if(o.tur==='ikiYana') ekle('basDon',.22*Math.sin(p*Math.PI*4.4)*(1-p*.7)*Math.min(1,p*6));
      else if(o.tur==='ic'){const s=yukselDus(p,.38); nefes=Math.max(nefes,s); ekle('omuzKalk',.3*s-.15*tepe(Math.max(0,(p-.5)*2)));}
      else if(o.tur==='duraksa'){const s=yukselDus(p,.2); ekle('dudakSik',.5*s); ekle('bakisY',.25*s);}
    }
    // canlılık: kaşta ve başta küçük, tohumlu kıpırtı; korkuda ince titreme
    if(!azHareket){
      const m=D.mikro, tr=D.titreme;
      ekle('kasKaldir',.05*m*gur('kas',.9)); ekle('basEgim',.004*m*gur('egim',1.3)+.006*tr*gur('tegim',.11));
      ekle('basDon',.03*tr*gur('tdon',.13)); ekle('basEg',.03*m*gur('eg',1.6));
    }
    // kritik sönümlü geçiş (alt adımlarla kararlı)
    const n=Math.max(1,Math.ceil(dt/(1/120))), h=dt/n;
    for(const k of KANALLAR){
      if(k==='kirp'||k==='gozSegir'||k==='yutkun'||k==='nefesEk') continue;
      let hd=(k in H?H[k]:(POZ_NOTR[k]||0))+(ek[k]||0);
      let w=W[k]||W_YUZ;
      if(agizKilit&&(k==='agizKose'||k==='agizYan')) continue; // köşe sabit: konuşma bitince kaldığı yerden sürer
      if(agizKilit&&(k==='dudakSik'||k==='agizAralik'||k==='agizGer')){hd=0; w=22;} // konuşurken dudak sıkılmaz (dudak esneyerek açılır)
      if(azHareket){x[k]=hd; v[k]=0; continue;}
      for(let i=0;i<n;i++){const a=w*w*(hd-x[k])-2*w*v[k]; v[k]+=a*h; x[k]+=v[k]*h;}
    }
    // nefes: duruma göre hız ve derinlik (yumuşak geçiş), iç çekme üstüne biner
    const nk=1-Math.exp(-dt*1.5);
    nefesHiz+=(D.nefesHiz-nefesHiz)*nk; nefesDerin+=(D.nefesDerin-nefesDerin)*nk;
    nefesFaz+=dt*Math.PI*2*nefesHiz;
    x.nefesEk=azHareket?0:nefesDerin*Math.sin(nefesFaz)+nefes;
    x.kirp=kirp; x.gozSegir=segir; x.yutkun=yutkun;
    // kalkıp gitme
    if(cikisBas!=null){
      const K=cikisKaresi(t-cikisBas);
      api.cikis=K.giris;
      cikisEk=K.poz; api.cikisBitti=K.bitti;
    }
    if(P) yaz(P,!azHareket);
    return api;
  };
  api.hedefle('sakin',0);
  return api;
}
