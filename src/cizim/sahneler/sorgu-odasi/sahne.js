// Sorgu odası: katmanları sırayla çizer, her karede pozu günceller.
import {cv,ana,c,hedefAyarla} from '../../teknik/tuval.js';
import {gor,gorunumOlc,sahneDonusumu,onBellek} from '../../teknik/gorunum.js';
import {leke} from '../../teknik/firca.js';
import {kumOlustur,kaplama} from '../../teknik/kaplama.js';
import {PAL} from '../../teknik/palet.js';
import {lerp,clamp} from '../../../cekirdek/matematik.js';
import {azHareket} from '../../../platform/tercih.js';
import {goruntu} from '../../../platform/goruntu.js';
import {isaretciDinle} from '../../../platform/girdi.js';
import {sozGuncelle} from '../../../diyalog/konusma.js';
import {poz} from '../../rig/poz.js';
import {arkaSac} from '../../rig/sac.js';
import {govde,altGovde} from '../../rig/govde.js';
import {kafa} from '../../rig/yuz.js';
import {OLCU,DERINLIK,GIRIS} from './ayar.js';
import {kisiResmi} from '../../../platform/gorseller.js';

// Sorgudaki kişinin kimliği: üretilmiş portresi varsa rig yerine o çizilir
let sorguKisisi=null;
export const sorguKisiSec=id=>{sorguKisisi=id;};
import {arkaPlan} from './arka-plan.js';
import {ampul} from './ampul.js';
import {masa,duman} from './masa.js';
import {sandalye} from './sandalye.js';
import {giris,girisBaslat,girisGuncelle,kapiIsigi} from './giris.js';

let arkaTuval=null, masaTuval=null, figTuval=null;
function boyutla(){
  if(!gorunumOlc(OLCU)) return;
  arkaTuval=onBellek(arkaPlan); masaTuval=onBellek(masa);
  figTuval=document.createElement('canvas'); figTuval.width=cv.width; figTuval.height=cv.height;
}

/* ───────────── canlılık ───────────── */
// Dışarıdan (oyun arayüzünden) sürülen tepki etkisi. Varsayılanlar etkisizdir: sahne eskisi gibi davranır.
//   bakis: null ya da [x,y] (-1..1): göz kaçırma gibi zorla bakılan yön; imleci ve boşta bakışı ezer.
//   kirpHiz: göz kırpma sıklığı çarpanı (gergin biri daha sık kırpar).
export const sorguEtki={bakis:null,kirpHiz:1};
const durum={imX:0,imY:0,imZaman:-99,hedefX:0,hedefY:0,sonrakiBakis:2,kirpBas:-9,sonrakiKirp:3,cift:false,kesinti:-9,sonrakiKesinti:4};
function isaretci(e){
  const kx=gor.vw/2, ky=gor.vh-(OLCU.yukseklik-OLCU.kafaY)*gor.S;
  durum.imX=clamp((e.clientX-kx)/(gor.vw*.5),-1,1); durum.imY=clamp((e.clientY-ky)/(gor.vh*.5),-1,1); durum.imZaman=performance.now()/1000;
}
function guncelle(t,dt){
  const R=Math.random;
  sozGuncelle(dt);
  // bakış: sizi izler; boşta gözünü neredeyse hiç kaçırmaz
  if(sorguEtki.bakis){durum.hedefX=sorguEtki.bakis[0]; durum.hedefY=sorguEtki.bakis[1];}
  else if(t-durum.imZaman<2.5){durum.hedefX=durum.imX; durum.hedefY=durum.imY;}
  else if(t>durum.sonrakiBakis){
    if(R()<.82){durum.hedefX=0; durum.hedefY=0; durum.sonrakiBakis=t+3+R()*5;}
    else{durum.hedefX=(R()-.5)*.8; durum.hedefY=(R()-.4)*.4; durum.sonrakiBakis=t+.35+R()*.6;}
  }
  const hiz=1-Math.exp(-dt*16), agir=1-Math.exp(-dt*2.6);
  poz.gx+=(durum.hedefX-poz.gx)*hiz; poz.gy+=(durum.hedefY-poz.gy)*hiz;
  poz.hgx+=(durum.hedefX-poz.hgx)*agir; poz.hgy+=(durum.hedefY-poz.hgy)*agir;
  // seyrek göz kırpma
  if(t>durum.sonrakiKirp){durum.kirpBas=t; durum.cift=R()<.12; durum.sonrakiKirp=t+(sorguEtki.kirpHiz===1?4+R()*6:(4+R()*6)/sorguEtki.kirpHiz);}
  let p=(t-durum.kirpBas)/.18, kapali=0;
  if(p>=0&&p<=1) kapali=Math.sin(p*Math.PI);
  else if(durum.cift){p=(t-durum.kirpBas-.27)/.18; if(p>=0&&p<=1) kapali=Math.sin(p*Math.PI);}
  poz.goz=.74*(1-kapali)-poz.gy*.06;
  // ampul: sürekli hafif titreme, ara sıra kısa kesinti
  if(t>durum.sonrakiKesinti){durum.kesinti=t; durum.sonrakiKesinti=t+3+R()*9;}
  girisGuncelle(t);
  poz.kam+=(durum.imX-poz.kam)*(1-Math.exp(-dt*3.2)); // kamera imleci yumuşakça izler
  let I=.94+.05*Math.sin(t*9.1)*Math.sin(t*2.3)+.02*Math.sin(t*31);
  const ks=t-durum.kesinti; if(ks>=0&&ks<.34) I*=(Math.sin(ks*70)>.1?.35:1);
  poz.isik=goruntu.titreme?I:1;
  const g=azHareket?0:1;
  poz.nefes=g*(Math.sin(t*.95)*.5+.5);
  poz.sallanti=g*(Math.sin(t*.8)*2.2+Math.sin(t*1.6+1)*.9)-poz.hgx*5;
  poz.kaynama=goruntu.kaynama?Math.floor(t*OLCU.kaynamaHizi)%64:0;
}

function katman(d,fn){c.save(); c.translate(-poz.kam*d,0); fn(); c.restore();}
function ciz(t){
  hedefAyarla(ana);
  const K=poz.kam, G=giris, px=d=>-gor.payPx-K*d*gor.S*gor.dpr;
  c.setTransform(1,0,0,1,0,0); c.drawImage(arkaTuval,px(DERINLIK.duvar),0);
  sahneDonusumu(c);
  katman(DERINLIK.duvar,kapiIsigi);
  let a; katman(DERINLIK.ampul,()=>{a=ampul(t);});
  // karakterin duvara düşen büyük, bozuk gölgesi: ancak yaklaşıp oturunca belirir
  const ga=(1-G.d)*(1-G.d)*(1-G.ayakta*.7);
  katman(DERINLIK.golge,()=>{const gk=(a.bx+262)*.9; leke(200-gk,520,250,430,PAL.siyah,.6*ga); leke(250-gk,330,170,200,PAL.siyah,.5*ga);});
  const g=azHareket?0:1;
  const hx=g*Math.sin(t*.42)*2+poz.hgx*7, hy=-poz.nefes*2+g*Math.sin(t*.37)*1.1+poz.hgy*4;
  const egim=g*Math.sin(t*.31)*.012+poz.hgx*.024-.012;
  katman(DERINLIK.sandalye,sandalye);
  // figür: derinliğe göre küçülür, ayaktayken yükselir, adımlarla salınır
  const s=1/(1+G.d*GIRIS.uzakOlcek);
  const fx=lerp(0,GIRIS.kapiX,Math.pow(G.d,1.3))+G.sal*GIRIS.adimSalinim*s;
  const fy=OLCU.kafaY-GIRIS.ayaktaFark*s*G.ayakta-G.zip*GIRIS.adimZiplama*s;
  const derin=lerp(DERINLIK.karakter,DERINLIK.golge,G.d);
  const figur=()=>{
    c.save(); c.translate(-poz.kam*derin+fx,fy); c.scale(s,s); c.rotate(G.sal*.012); c.translate(0,-OLCU.kafaY);
    const foto=sorguKisisi&&kisiResmi(sorguKisisi);
    if(foto){ // üretilmiş portre: göz kırpınca göz kapalı, konuşurken ağız açık kare
      const im=poz.goz<.35?foto.gozKapali:poz.agizAc>.3?foto.agizAcik:foto.temel, b=760, y0=OLCU.kafaY-300+hy;
      c.save(); c.translate(hx,0); c.rotate(egim*.5); c.drawImage(im,-b/2,y0,b,b*im.height/im.width); c.restore();
    } else {
      if(G.aktif) altGovde();
      c.save(); c.translate(hx,OLCU.kafaY+hy); c.rotate(egim); arkaSac(); c.restore();
      govde();
      c.save(); c.translate(hx,OLCU.kafaY+hy); c.rotate(egim); kafa(); c.restore();
    }
    c.restore();
  };
  if(!G.aktif) figur();
  else if(G.gorun>.01){ // uzaktayken karanlığa gömülü: ayrı katmana çiz, karart, sonra bindir
    const fc=figTuval.getContext('2d'); hedefAyarla(fc);
    c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation='source-over'; c.clearRect(0,0,figTuval.width,figTuval.height);
    sahneDonusumu(c); figur();
    c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation='source-atop'; c.fillStyle=`rgba(2,3,3,${G.karart})`; c.fillRect(0,0,figTuval.width,figTuval.height);
    c.globalCompositeOperation='source-over';
    hedefAyarla(ana); c.setTransform(1,0,0,1,0,0); c.globalAlpha=G.gorun; c.drawImage(figTuval,0,0); c.globalAlpha=1; sahneDonusumu(c);
  }
  // ışık kesilince her şey kararır
  if(poz.isik<.9){c.fillStyle=`rgba(0,0,0,${(1-poz.isik)*.6})`; c.fillRect(-gor.yarimG-10,gor.ustY,gor.yarimG*2+20,OLCU.yukseklik-gor.ustY);}
  c.setTransform(1,0,0,1,0,0); c.drawImage(masaTuval,px(DERINLIK.masa),0);
  sahneDonusumu(c);
  katman(DERINLIK.masa,()=>duman(t));
  kaplama(t);
}

let once=0, kareNo=0, calisiyor=false, dinleniyor=false;
function kare(ms){
  if(!calisiyor) return;
  const t=ms/1000, dt=Math.min(.05,t-once||.016); once=t;
  if(cv.clientWidth!==gor.vw||cv.clientHeight!==gor.vh) boyutla(); // boyut olayı gelmese de yakala
  if(gor.hazir){guncelle(t,dt); ciz(t);}
  kareNo=requestAnimationFrame(kare);
}
const boyutOlay=()=>{if(calisiyor) boyutla();}; // durmuşken ortak canvas başka sahnenindir: dokunma
// Döngüyü başlatır (ya da durdurulmuşsa yeniden başlatır). Ön bellekler her başlangıçta yeniden kurulur,
// çünkü ortak canvas ve `gor` arada başka bir sahnece değiştirilmiş olabilir.
//   giris: false ise kapıdan giriş oynamaz, karakter doğrudan oturur (kayıttan dönüş için).
export function sorguOdasiBaslat({giris:girisOynat=true}={}){
  if(!dinleniyor){isaretciDinle(isaretci); addEventListener('resize',boyutOlay); dinleniyor=true;}
  cancelAnimationFrame(kareNo); calisiyor=true;
  kumOlustur(); boyutla();
  if(girisOynat) girisBaslat();
  else Object.assign(giris,{aktif:false,bas:null,d:0,ayakta:0,kapi:0,gorun:1,sal:0,zip:0,karart:0});
  if(gor.hazir){guncelle(0,.016); ciz(0);}
  kareNo=requestAnimationFrame(kare);
}
// Döngüyü durdurur (başka sahneye geçerken). Dinleyiciler kalır ama durmuşken bir şey çizmez.
export function sorguOdasiDurdur(){calisiyor=false; cancelAnimationFrame(kareNo);}
export const sorguOdasiCalisiyor=()=>calisiyor;
