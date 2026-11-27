// Masadaki olay yeri fotoğrafı: vakadaki cinayeti fotoğraf sahnesine (mekân + izler + örtülü kurban) çevirir,
// masaya çizer, dokunulan yerin izini bulur. Yakınlaştırınca sürükleyerek gezilir (telefonda fotoğraf küçük kalıyor).
import {fotografKur,yuvaBilgisi,mekanBul} from '../cizim/sahneler/olay-yeri/sahne.js';
import {IZLER} from '../cizim/sahneler/olay-yeri/kutuphane.js';
import {FOTO} from '../cizim/sahneler/olay-yeri/ayar.js';
import {izleriYerlestir} from './iz-esleme.js';
import {masaCiz} from './sahneler.js';

const DUZLEMLER=Object.fromEntries(Object.entries(IZLER).map(([t,i])=>[t,i.duzlemler||['zemin']]));
const YEDEK_MEKAN='degirmen';

// Cinayetin fotoğraf planı: hangi iz hangi yuvada, hangisi fotoğrafa konamadı, yara hangi izde.
export function fotoPlani(b,c){
  let mekan=c.mekan, yedek=false;
  try{mekanBul(mekan);}catch{mekan=YEDEK_MEKAN; yedek=true;}
  const M=mekanBul(mekan);
  const izler=b.fiziksel.filter(i=>i.cinayet===c.id);
  const yara=izler.filter(i=>i.alt==='yara').map(i=>i.id);
  const {izler:sahneIzleri,yerlesmeyen}=izleriYerlestir({izler,yuvalar:M.yuvalar,duzlemler:DUZLEMLER,tohum:b.tohum,dilimler:b.vaka.ayar.dilimler});
  return {cinayet:c.id,mekan,yedek,yara,sahneIzleri,yerlesmeyen,izIdleri:izler.map(i=>i.id)};
}

export function fotoGorunumu(b){
  const onBellek=new Map(); // `${cinayet}@${R}` -> fotoğraf
  const plan=new Map();
  let durum={zoom:1,panX:0,panY:0}, son=null;

  const planAl=c=>{if(!plan.has(c.id)) plan.set(c.id,fotoPlani(b,c)); return plan.get(c.id);};

  function fotoAl(c,R){
    const p=planAl(c), a=`${c.id}@${R}`;
    if(onBellek.has(a)) return onBellek.get(a);
    // eski çözünürlükteki kopyaları bırak (bellek)
    for(const k of [...onBellek.keys()]) if(k.startsWith(c.id+'@')) onBellek.delete(k);
    const f=fotografKur({mekan:p.mekan,izler:p.sahneIzleri,tohum:(b.tohum*131+Number(String(c.id).replace(/\D/g,''))||1)>>>0,kurban:true,cozunurluk:R});
    // yara: örtülü kurbanın kendisine dokunarak bulunur (oyun: "Örtüyü kaldırdın")
    if(p.yara.length){
      const y=yuvaBilgisi(p.mekan,'beden');
      const r=Math.max(62*y.olcek,58);
      for(const id of p.yara) f.bolgeler.push({kimlik:id,tur:'kurban',sekil:'daire',x:y.x,y:y.y-14*y.olcek,r});
    }
    onBellek.set(a,f);
    return f;
  }

  return {
    planAl,
    get durum(){return durum;},
    sifirla(){durum={zoom:1,panX:0,panY:0};},
    yakinlastir(z){durum={zoom:z,panX:0,panY:0};},
    kaydir(dx,dy){durum.panX+=dx; durum.panY+=dy;},
    // alan: {x,y,w,h} CSS pikseli; bulunanlar: Set(iz id)
    ciz(k,w,h,d,{c,alan,bulunanlar}){
      masaCiz(k,w,h,d);
      if(!c) return;
      const oran=(1000+84)/(750+84);
      const temel=Math.min(alan.w*.97,alan.h*.97*oran);
      const gen=temel*durum.zoom, yuk=gen/oran;
      // sürükleme sınırı: fotoğraf alandan kaçmasın
      const mx=Math.max(0,(gen-alan.w)/2+20), my=Math.max(0,(yuk-alan.h)/2+20);
      durum.panX=Math.max(-mx,Math.min(mx,durum.panX)); durum.panY=Math.max(-my,Math.min(my,durum.panY));
      const R=Math.min(3,Math.max(.5,Math.ceil(gen*d/1084*4)/4));
      const f=fotoAl(c,R);
      for(const id of bulunanlar) f.isaretle(id);
      f.ciz(k,{x:alan.x+alan.w/2+durum.panX,y:alan.y+alan.h/2+durum.panY,genislik:gen});
      son={f,d,x:alan.x+alan.w/2+durum.panX,y:alan.y+alan.h/2+durum.panY,gen};
    },
    // dokunma bölgelerinin canvas'a göre CSS pikseli konumu (sınama ve geliştirici için)
    ekranNoktalari(){
      if(!son) return [];
      const {f,x,y,gen}=son, s=gen/f.genislik, K=FOTO.kenar, ca=Math.cos(f.aci), sa=Math.sin(f.aci);
      return f.bolgeler.map(bg=>{
        const px=(bg.x+K-f.genislik/2)*s, py=(bg.y+K-f.yukseklik/2)*s;
        return {kimlik:bg.kimlik,tur:bg.tur,x:x+px*ca-py*sa,y:y+px*sa+py*ca};
      });
    },
    // canvas'a göre CSS pikseli → iz kimliği (ya da null)
    dokun(x,y){
      if(!son) return null;
      const p=son.f.ekrandanFotoya(x,y,son.d);
      if(!p) return null;
      return son.f.izBul(p[0],p[1]);
    },
  };
}
