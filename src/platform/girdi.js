// Oyuncu girdisi: imleç, dokunma ve telefonu eğme.
// Her dinleme işlevi, dinleyicileri kaldıran bir işlev döndürür.
// `pencere` parametresi testte sahte bir nesne vermek içindir; tarayıcıda varsayılanı kullanın.

import {AYARLAR} from '../cekirdek/ayarlar.js';
import {clamp} from '../cekirdek/matematik.js';

// İmleç ve dokunma tek olay olarak gelir.
export function isaretciDinle(fn,pencere=globalThis){
  const s={passive:true};
  pencere.addEventListener('pointermove',fn,s);
  pencere.addEventListener('pointerdown',fn,s);
  return ()=>{
    pencere.removeEventListener('pointermove',fn,s);
    pencere.removeEventListener('pointerdown',fn,s);
  };
}

const bos=()=>{};

export const egimDestekleniyor=(pencere=globalThis)=>typeof pencere?.DeviceOrientationEvent!=='undefined'&&typeof pencere.addEventListener==='function';

// iOS 13+ eğme verisi için izin ister. Bir kullanıcı hareketinin (dokunma, tıklama) işleyicisinden
// doğrudan çağrılmalıdır; öncesinde başka bir await olmamalı, yoksa Safari isteği reddeder.
// Sonuç: 'izin' | 'red' | 'gerekmiyor' (izin istemeyen tarayıcı) | 'desteklenmiyor'. Hata atmaz.
export async function egimIzniIste(pencere=globalThis){
  if(!egimDestekleniyor(pencere)) return 'desteklenmiyor';
  const iste=pencere.DeviceOrientationEvent.requestPermission;
  if(typeof iste!=='function') return 'gerekmiyor';
  try{return (await iste.call(pencere.DeviceOrientationEvent))==='granted'?'izin':'red';}
  catch{return 'red';}
}

// Ekranın dönüş açısı (0, 90, 180, 270). Bilinmiyorsa 0.
function ekranAcisi(p){
  const a=p.screen?.orientation?.angle??p.orientation??0;
  return ((Math.round(a/90)*90)%360+360)%360;
}

// Kullanıcının gördüğü yatay eksendeki eğimi derece olarak verir (sağa eğince artı).
// Dikeyde bu gamma'dır; ekran yatay döndürülünce beta'ya geçer.
function yatayAci(o,aci){
  switch(aci){
    case 90: return o.beta;
    case 180: return -o.gamma;
    case 270: return -o.beta;
    default: return o.gamma;
  }
}

// Telefonu sağa sola eğmeyi -1..1 arası yatay değere çevirip fn({x}) ile bildirir.
// İlk okunan duruş merkez kabul edilir (telefon nasıl tutuluyorsa orası 0); ekran dönünce merkez yeniden alınır.
// Dönen işlev dinleyicileri kaldırır; üstündeki `merkezle()` bir sonraki okumayı yeni merkez yapar.
// Destek yoksa hiçbir şey yapmaz ve boş bir kaldırıcı döndürür.
export function egimDinle(fn,{pencere=globalThis,azamiAci=AYARLAR.egim.azamiAci,oluBolge=AYARLAR.egim.oluBolge}={}){
  if(!egimDestekleniyor(pencere)){const k=()=>{}; k.merkezle=bos; return k;}
  let merkez=null, sonAci=null;
  const yonDegisti=()=>{merkez=null;};
  const oku=o=>{
    if(o==null||o.gamma==null||o.beta==null) return; // masaüstü tarayıcılar boş olay gönderebilir
    const aci=ekranAcisi(pencere);
    if(aci!==sonAci){sonAci=aci; merkez=null;}
    const a=yatayAci(o,aci);
    if(!Number.isFinite(a)) return;
    if(merkez===null) merkez=a;
    let fark=a-merkez;
    if(fark>180) fark-=360; else if(fark<-180) fark+=360;
    let x=clamp(fark/azamiAci,-1,1);
    if(Math.abs(x)<oluBolge) x=0;
    fn({x});
  };
  pencere.addEventListener('deviceorientation',oku);
  pencere.addEventListener('orientationchange',yonDegisti);
  const kaldir=()=>{
    pencere.removeEventListener('deviceorientation',oku);
    pencere.removeEventListener('orientationchange',yonDegisti);
  };
  kaldir.merkezle=yonDegisti;
  return kaldir;
}
