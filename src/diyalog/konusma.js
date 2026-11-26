// Konuşma: ses yok; ağız oynar, alt yazı harf harf açılır.
import {poz} from '../cizim/rig/poz.js';
import {agizTablosu} from '../dil/index.js';
import {cizelgeKur} from './agiz-cizelgesi.js';

/* şekil = [açıklık 0..1, genişlik çarpanı] */
export const KONUSMA={
  sekiller:{kapali:[0,1], ince:[.16,1], yarim:[.5,1], yuvarlak:[.62,.62], buzuk:[.22,.5], genis:[1,1.04]},
  sure:{unlu:130, unsuz:72, dudak:88, bosluk:90, nokta:240}, gecis:42
};
export const konusmaOlay={basla:null,yaz:null,bit:null}; // arayüz buraya bağlanır
const soz={cizelge:null,bas:0,metin:'',gosterilen:''};

export function konus(metin){
  soz.metin=metin; soz.cizelge=cizelgeKur(metin,KONUSMA,agizTablosu()); soz.bas=performance.now(); soz.gosterilen='';
  if(konusmaOlay.basla) konusmaOlay.basla();
}
export function sus(){soz.cizelge=null; soz.gosterilen='';}
export function sozGuncelle(dt){
  let sekil='kapali';
  if(soz.cizelge){
    const g=performance.now()-soz.bas, C=soz.cizelge; let harf=0, bitti=false;
    for(const a of C.adimlar){ if(a.bas<=g){sekil=a.sekil; harf=a.harf;} else break; }
    if(g>=C.bitis){sekil='kapali'; harf=[...soz.metin].length; soz.cizelge=null; bitti=true;}
    const goster=[...soz.metin].slice(0,harf).join('');
    if(soz.gosterilen!==goster){soz.gosterilen=goster; if(konusmaOlay.yaz) konusmaOlay.yaz(goster);}
    if(bitti&&konusmaOlay.bit) konusmaOlay.bit();
  }
  const h=KONUSMA.sekiller[sekil], k=1-Math.exp(-dt*1000/KONUSMA.gecis);
  poz.agizAc+=(h[0]-poz.agizAc)*k; poz.agizGen+=(h[1]-poz.agizGen)*k;
}
