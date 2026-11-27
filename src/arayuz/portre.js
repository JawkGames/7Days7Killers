// Köylülerin küçük yüz resimleri (çağırma listesi, defter, hüküm). Ortak iskeletle omuzdan yukarı çizilir,
// bir kez üretilip ön bellekte tutulur. Üretim karelere bölünür ki arayüz takılmasın.
import {ana,hedefAyarla} from '../cizim/teknik/tuval.js';
import {leke} from '../cizim/teknik/firca.js';
import {PAL} from '../cizim/teknik/palet.js';
import {poz,karakterSec,etkinGorunus,arkaSac,govde,kafa} from '../cizim/rig/index.js';
import {gorunusBul} from '../icerik/gorunus/index.js';

const KADRAJ={x0:-250,y0:250,w:500,h:560}, KAFA_Y=470;
const NOTR={gx:0,gy:0,hgx:0,hgy:0,goz:.74,kasKaldir:0,kasCat:.25,agiz:-.2,agizAc:0,agizGen:1,nefes:.5,sallanti:0,isik:1,kaynama:0,kam:0};
const BOY={w:132,h:148};
const onBellek=new Map(), bekleyen=new Map(); // id -> dataURL ; id -> [geri çağırma]
let kuyruk=[], calisiyor=false;

function ciz(id){
  const t=document.createElement('canvas'); t.width=BOY.w; t.height=BOY.h;
  const kc=t.getContext('2d'), W=BOY.w, H=BOY.h;
  const eskiPoz={...poz}, eskiG=etkinGorunus();
  try{
    Object.assign(poz,NOTR);
    karakterSec(gorunusBul(id)||null);
    hedefAyarla(kc);
    const s=Math.max(W/KADRAJ.w,H/KADRAJ.h);
    kc.setTransform(s,0,0,s,W/2,-KADRAJ.y0*s+(H-KADRAJ.h*s)/2);
    kc.fillStyle='#121513'; kc.fillRect(KADRAJ.x0-40,KADRAJ.y0-40,KADRAJ.w+80,KADRAJ.h+80);
    leke(-200,280,420,360,PAL.lamba,.12);
    leke(260,700,340,420,PAL.siyah,.55);
    kc.save(); kc.translate(0,KAFA_Y); arkaSac(); kc.restore();
    govde();
    kc.save(); kc.translate(0,KAFA_Y); kafa(); kc.restore();
    kc.setTransform(1,0,0,1,0,0);
    const g=kc.createRadialGradient(W*.5,H*.4,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.7)'); kc.fillStyle=g; kc.fillRect(0,0,W,H);
  }finally{
    Object.assign(poz,eskiPoz); karakterSec(eskiG); hedefAyarla(ana);
  }
  return t.toDataURL('image/png');
}

function isle(){
  if(!kuyruk.length){calisiyor=false; return;}
  calisiyor=true;
  const bas=performance.now();
  while(kuyruk.length&&performance.now()-bas<24){
    const id=kuyruk.shift();
    if(onBellek.has(id)) continue;
    let url='';
    try{url=ciz(id);}catch(e){console.error('portre:',id,e);}
    onBellek.set(id,url);
    for(const f of bekleyen.get(id)||[]) f(url);
    bekleyen.delete(id);
  }
  setTimeout(isle,0);
}

// img öğesine kişinin portresini koyar (hazırsa hemen, değilse üretilince).
export function portreKoy(img,id){
  img.alt=''; img.width=BOY.w; img.height=BOY.h; img.decoding='async';
  img.dataset.kisi=id;
  if(onBellek.has(id)){img.src=onBellek.get(id); return;}
  if(!bekleyen.has(id)) bekleyen.set(id,[]);
  bekleyen.get(id).push(u=>{if(img.dataset.kisi===id&&u) img.src=u;});
  if(!kuyruk.includes(id)) kuyruk.push(id);
  if(!calisiyor) setTimeout(isle,0);
}

// Önceden üretmeye başla (boş zamanda).
export function portreHazirla(idler){
  for(const id of idler) if(!onBellek.has(id)&&!kuyruk.includes(id)) kuyruk.push(id);
  if(!calisiyor&&kuyruk.length) setTimeout(isle,30);
}
