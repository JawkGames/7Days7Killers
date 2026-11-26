// Kayıp sahnesi: müfettişin seçtiği kişinin geride bıraktığı yer. Kısa, sessiz, ağır tempolu.
// kayipSahnesi({kisi, katilMi, tohum, tuval, metin, kanit, bekleyenler, yaz, bitti}) => {oynat, durdur, kare, sure}
//   kisi:        src/icerik/kisiler içindeki kişi verisi (id, kayip:{tur, mekan, bekleyenler})
//   katilMi:     true ise sahnede küçük bir kanıt belirir (yazıyla söylenmez)
//   tohum:       taş dizilişi, silüet duruşları gibi ayrıntılar bundan türer
//   tuval:       çizilecek <canvas>
//   metin:       alt yazı cümlesi (dil dosyasından gelir: src/dil/tr/kisiler.js → kisi.kayip)
//   kanit:       {tur, alet, x, y, s}: kişinin varsayılan kanıtının üstüne yazılır
//   bekleyenler: bekleyenlerin kişi verileri (cinsiyete göre silüet); verilmezse sırayla
//   yaz(m):      alt yazının o ana kadar açılan kısmı; bitti(): sahne kararınca bir kez
import {hedefAyarla} from '../../teknik/tuval.js';
import {rgba,lerp,clamp,yumusak} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {azHareket} from '../../../platform/tercih.js';
import {OLCU,DERINLIK,ZAMAN,KAMERA,KAYNAMA} from './ayar.js';
import {gk,olc,onBellek,gorunurKutu} from './gorunum.js';
import {R,DURUM,leke} from './cizer.js';
import {NESNE} from './nesneler.js';
import {oturan,ayakta,kedi,kopek,binek,suru,siluetGolge} from './siluetler.js';
import {kanitCiz,VARSAYILAN_KANIT} from './kanit.js';
import {YERLER} from './yerler.js';
import {SABLON} from './sablonlar.js';
import {ipucuAl} from './kisiler.js';

/* ışık türleri: tek kaynak; ic/dis karanlık maskesinin iç ve dış yarıçapı */
const ISIK={
  lamba:{ic:70,dis:820,renk:R.lamba,titre:.07,derinlik:'orta',alevY:-50},
  fener:{ic:60,dis:780,renk:R.lamba,titre:.05,derinlik:'orta',alevY:-46},
  ocak:{ic:80,dis:860,renk:[226,140,70],titre:.12,derinlik:'orta',alevY:0},
  kor:{ic:40,dis:760,renk:[210,96,44],titre:.1,derinlik:'orta',alevY:0},
  aralik:{ic:50,dis:760,renk:[226,176,96],titre:.06,derinlik:'orta',alevY:0},
  ay:{ic:200,dis:1150,renk:R.ay,titre:0,derinlik:'arka',alevY:0},
  safak:{ic:300,dis:1250,renk:[150,160,150],titre:0,derinlik:'arka',alevY:0},
  aksam:{ic:280,dis:1200,renk:[200,150,92],titre:0,derinlik:'arka',alevY:0},
  gun:{ic:420,dis:1500,renk:[160,166,150],titre:0,derinlik:'arka',alevY:0}
};

// üstüne başka nesne konabilen eşyaların yüksekliği (sıralamada bu kadar geride sayılırlar)
const UST_PAYI={sofra:70,masa:165,dikisMakinesi:140,mangal:50,tasSeki:92,duzTas:50,ors:152,cesme:50,sedir:85,tabure:64,degirmenTasi:130};

export function kayipSahnesi(o){
  const kisi=o.kisi||{id:'?'}, tohum=(o.tohum==null?1:o.tohum)|0, cv=o.tuval, k2=cv.getContext('2d');
  const tur=kisi.kayip&&SABLON[kisi.kayip.tur]?kisi.kayip.tur:'yalniz', sablon=SABLON[tur];
  const ip={...ipucuAl(kisi.id), tohum};
  const yerAdi=ip.yer&&YERLER[ip.yer]?ip.yer:sablon.varsayilanYer, yer=YERLER[yerAdi](ip);
  const kur=sablon.kur({yer,ip,kisi,bekleyenler:o.bekleyenler});

  // ışık
  const Lh={...yer.isik,...(ip.isik||{})}, Lt=ISIK[Lh.tur]||ISIK.lamba;
  const L={...Lt,...Lh, s:Lh.s||1}; L.cx=L.x; L.cy=L.y+(L.alevY||0)*L.s;
  const ton=kur.ton||{karanlik:0,soguk:0};

  // öğeler: yerin sabit eşyası, kişinin nesneleri, şablonun silüetleri, ışığın kendi lambası, kanıt
  const konum=a=>{const p=a.yer&&yer.yer&&yer.yer[a.yer]; return {...a, x:a.x!=null?a.x:(p?p[0]:0), y:a.y!=null?a.y:(p?p[1]:900)};};
  const ogeler=[...(yer.sabit||[]), ...(ip.nesneler||[]).map(konum), ...kur.ogeler];
  if((L.tur==='lamba'||L.tur==='fener')&&!Lh.gizli) ogeler.push({nesne:L.tur,x:L.x,y:L.y,s:L.s,isikKaynagi:true});
  const kanit=o.katilMi?{...VARSAYILAN_KANIT,...(yer.kanit||{}),...(ip.kanit||{}),...(o.kanit||{}),kanit:true}:null;
  if(kanit) ogeler.push(kanit);
  // üstüne nesne konan eşyalar (sofra, masa, seki...) üstündekilerden önce çizilsin diye derinlikleri öne alınır
  for(const a of ogeler) if(a.z==null&&a.nesne&&UST_PAYI[a.nesne]) a.z=a.y-UST_PAYI[a.nesne]*(a.s||1);
  ogeler.sort((a,b)=>(a.z!=null?a.z:a.y)-(b.z!=null?b.z:b.y));
  const canlilar=ogeler.filter(a=>a.nesne&&NESNE[a.nesne]&&NESNE[a.nesne].canli);

  function ogeCiz(a){
    if(a.kanit) return kanitCiz(a);
    if(a.nesne){const N=NESNE[a.nesne]; if(N) N.ciz(a); return;}
    if(a.siluet){siluetGolge(a.x,a.y,(a.siluet==='oturan'?110:70)*a.s); (a.siluet==='oturan'?oturan:ayakta)(a.x,a.y,a.s,a); return;}
    if(a.suru) return suru(a.x0,a.x1,a.y,a.s,{seed:tohum+5});
    if(a.hayvan==='kedi'){leke(a.x,a.y+2,44*a.s,8*a.s,R.siyah,.6); return kedi(a.x,a.y,a.s,a);}
    if(a.hayvan==='kopek'){leke(a.x,a.y+3,170*a.s,16*a.s,R.siyah,.7); return kopek(a.x,a.y,a.s,a);}
    if(a.hayvan==='katir'||a.hayvan==='esek'){leke(a.x,a.y,220*a.s,24*a.s,R.siyah,.8); return binek(a.x,a.y,a.s,{...a,tur:a.hayvan});}
  }

  /* ───── ön bellekler ───── */
  let arka=null, orta=[], on=null;
  function boyutla(){
    if(!olc(cv)) return;
    const G=gk.yarimG+OLCU.pay, ust=gk.ustY, alt=gk.altY;
    DURUM.isikX=L.cx; DURUM.isikY=L.cy; DURUM.isikRenk=L.renk; DURUM.lx=L.cx;
    DURUM.kaynama=0; arka=onBellek(cv,()=>yer.arka(G,ust,alt));
    orta=[]; const n=azHareket?1:KAYNAMA.kopya;
    for(let i=0;i<n;i++){DURUM.kaynama=i; orta.push(onBellek(cv,()=>{if(yer.orta) yer.orta(G); for(const a of ogeler) ogeCiz(a);}));}
    DURUM.kaynama=0;
    on=onBellek(cv,()=>onPlan(G,ust,alt));
    hedefAyarla(k2);
  }
  // ön plan: kadrajın kenarında karanlık kütleler; kamera kayınca en çok bunlar oynar, derinlik verir
  function onPlan(G,ust,alt){
    const r=rng(tohum+3), kx=gk.yarimG;
    leke(-kx-40,alt-120,260,520,R.siyah,.9);
    leke(kx+60,alt-60,300,300,R.siyah,.85);
    leke(0,alt+40,G*1.1,200,R.siyah,.75);
    if(r()<.5) leke(-kx+30,ust+(alt-ust)*.3,120,700,R.siyah,.6);
  }

  /* ───── zaman ───── */
  const metin=o.metin||'', harfler=[...metin];
  const yaziSonu=ZAMAN.yaziBas+harfler.length*ZAMAN.harf;
  const kararBas=clamp(yaziSonu+ZAMAN.yaziSonrasi,ZAMAN.enErkenKararma,ZAMAN.enGecKararma);
  const sure=kararBas+ZAMAN.kararma+ZAMAN.bitisBekle;
  let bas=0, rafNo=0, calisiyor=false, bittiDendi=false, sonYazi=null;

  function kamera(y){
    if(azHareket) return {kam:0,z:1};
    const p=yumusak(0,sure,y);
    return {kam:lerp(-KAMERA.kayma,KAMERA.kayma,p), z:1+KAMERA.yaklas*p};
  }
  function parlaklik(t){
    if(azHareket||!L.titre) return 1;
    let I=1-L.titre*.5+L.titre*.5*Math.sin(t*7.3)*Math.sin(t*2.1)+L.titre*.25*Math.sin(t*23);
    if(L.tur==='lamba'&&Math.sin(t*.9)>.985) I*=.82; // fitil ara sıra çeker
    return I;
  }

  function ciz(y){
    if(!gk.hazir||!arka) return;
    const t=azHareket?1.5:y, {kam,z}=kamera(y), I=parlaklik(t), W=cv.width, H=cv.height;
    const ilerleme=azHareket?.35:clamp(y/sure,0,1);
    hedefAyarla(k2);
    const c=k2;
    const katman=(img,d)=>{c.setTransform(z,0,0,z,(1-z)*W/2,(1-z)*H*.5); c.drawImage(img,-gk.payPx-kam*d*gk.S*gk.dpr,0);};
    const sahneye=d=>{const a=z*gk.dpr*gk.S; c.setTransform(a,0,0,a,z*(gk.vw/2*gk.dpr-kam*d*gk.dpr*gk.S)+(1-z)*W/2,z*(-gk.ustY*gk.S*gk.dpr)+(1-z)*H*.5);};
    c.setTransform(1,0,0,1,0,0); c.fillStyle='#030404'; c.fillRect(0,0,W,H);
    katman(arka,DERINLIK.arka);
    const kop=azHareket?0:Math.floor(t*KAYNAMA.hiz)%orta.length;
    katman(orta[kop],DERINLIK.orta);
    // canlı parçalar: alev, buhar, su, soğuyan nal
    sahneye(DERINLIK.orta);
    DURUM.isikX=L.cx; DURUM.lx=L.cx;
    for(const a of canlilar) NESNE[a.nesne].canli(a,t,I,ilerleme);
    // karanlık: tek ışık kaynağından uzaklaştıkça koyulaşır
    sahneye(DERINLIK[L.derinlik]||DERINLIK.orta);
    const [x0,y0,x1,y1]=gorunurKutu(), k=ton.karanlik||0;
    const g=c.createRadialGradient(L.cx,L.cy,L.ic*I,L.cx,L.cy,L.dis*(.94+.06*I));
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.35,`rgba(0,0,0,${.22+k})`); g.addColorStop(.7,`rgba(0,0,0,${.66+k*.6})`); g.addColorStop(1,`rgba(0,0,0,${Math.min(.95,.9+k)})`);
    c.fillStyle=g; c.fillRect(x0-200,y0-200,x1-x0+400,y1-y0+400);
    c.save(); c.globalCompositeOperation='lighter'; leke(L.cx,L.cy,L.ic*2.6,L.ic*2.4,L.renk,.09*I); c.restore();
    if(ton.soguk){c.save(); c.globalCompositeOperation='multiply'; c.fillStyle=rgba([150,176,172],ton.soguk*.6); c.fillRect(x0-200,y0-200,x1-x0+400,y1-y0+400); c.restore();}
    katman(on,DERINLIK.on);
    kaplama(c,t,W,H);
    // açılış ve kararma
    const acik=yumusak(ZAMAN.acilis[0],ZAMAN.acilis[1],y)*(1-yumusak(kararBas,kararBas+ZAMAN.kararma,y));
    if(acik<1){c.setTransform(1,0,0,1,0,0); c.fillStyle=`rgba(0,0,0,${1-acik})`; c.fillRect(0,0,W,H);}
    // alt yazı: harf harf
    let n=0; if(y>=ZAMAN.yaziBas) n=azHareket?harfler.length:Math.min(harfler.length,Math.floor((y-ZAMAN.yaziBas)/ZAMAN.harf)+1);
    const goster=harfler.slice(0,n).join('');
    if(goster!==sonYazi){sonYazi=goster; if(o.yaz) o.yaz(goster);}
  }

  function dongu(ms){
    if(!calisiyor) return;
    if(cv.clientWidth!==gk.vw||cv.clientHeight!==gk.vh) boyutla();
    const y=ms/1000-bas;
    ciz(y);
    if(y>=sure){calisiyor=false; if(!bittiDendi){bittiDendi=true; if(o.bitti) o.bitti();} return;}
    rafNo=requestAnimationFrame(dongu);
  }
  const boyutOlay=()=>boyutla();
  return {
    sure, sablon:tur, yer:yerAdi,
    oynat(){ // baştan oynat
      this.durdur(); addEventListener('resize',boyutOlay); boyutla(); bas=performance.now()/1000; bittiDendi=false; sonYazi=null; calisiyor=true;
      ciz(0); rafNo=requestAnimationFrame(dongu);
    },
    durdur(){calisiyor=false; cancelAnimationFrame(rafNo); removeEventListener('resize',boyutOlay);},
    kare(y){ // tek kare (durağan kontrol, ekran görüntüsü)
      this.durdur(); boyutla(); sonYazi=null; ciz(y);
    }
  };
}

/* ───── kaplama: kenar kararması, alt yazı bandı, kum, film çizikleri ───── */
let kum=null;
function kumDeseni(c){
  if(kum) return kum;
  const k=document.createElement('canvas'); k.width=k.height=256;
  const kc=k.getContext('2d'), d=kc.createImageData(256,256), r=rng(19);
  for(let i=0;i<d.data.length;i+=4){const v=r()*255|0; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255;}
  kc.putImageData(d,0,0); kum=c.createPattern(k,'repeat'); return kum;
}
function kaplama(c,t,W,H){
  c.setTransform(1,0,0,1,0,0);
  const g=c.createRadialGradient(W*.5,H*.42,Math.min(W,H)*.22,W*.5,H*.5,Math.max(W,H)*.75);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.8)');
  c.fillStyle=g; c.fillRect(0,0,W,H);
  // alt yazı bandı: sahnenin altı zemine doğru kararır
  const b=c.createLinearGradient(0,H*.74,0,H); b.addColorStop(0,'rgba(2,3,3,0)'); b.addColorStop(1,'rgba(2,3,3,.78)');
  c.fillStyle=b; c.fillRect(0,H*.74,W,H*.26);
  if(!azHareket){
    const r=rng(Math.floor(t*11)+700);
    for(let i=0;i<3;i++) if(r()<.5){const x=r()*W; c.strokeStyle=`rgba(210,205,180,${.03+r()*.05})`; c.lineWidth=(.6+r())*gk.dpr; c.beginPath(); c.moveTo(x,r()*H*.3); c.lineTo(x+(r()-.5)*6,H*(.5+r()*.5)); c.stroke();}
    for(let i=0;i<4;i++){c.fillStyle=`rgba(${r()<.5?'220,214,190':'0,0,0'},${.05+r()*.12})`; c.beginPath(); c.arc(r()*W,r()*H,(.6+r()*1.6)*gk.dpr,0,Math.PI*2); c.fill();}
  }
  const kx=azHareket?0:(Math.floor(t*12)*89)%256, ky=azHareket?0:(Math.floor(t*12)*53)%256;
  c.save(); c.globalAlpha=.09; c.globalCompositeOperation='overlay'; c.translate(-kx,-ky); c.fillStyle=kumDeseni(c); c.fillRect(0,0,W+256,H+256); c.restore();
}
