// Fotoğraf makinesi: iğne deliği izdüşümü. Dünya birimi santimetre.
// X sağa, Y yukarı (zeminde 0), Z ileri (makineden uzaklaşır). Makine (0, yukseklik, 0) noktasında,
// `egim` radyan kadar aşağı bakar; bu yüzden dikey hatlar aşağıya doğru hafifçe birleşir (gerçek olay yeri fotoğrafı gibi).
import {FOTO} from './ayar.js';

export function kameraKur({odak=880, yukseklik=155, egim=.3, kx=FOTO.genislik/2, ky=FOTO.yukseklik/2}={}){
  const cs=Math.cos(egim), sn=Math.sin(egim), hc=yukseklik;
  const derinlik=(X,Y,Z)=>-(Y-hc)*sn+Z*cs;
  const n=(X,Y,Z)=>{const yc=(Y-hc)*cs+Z*sn, zc=-(Y-hc)*sn+Z*cs; return [kx+odak*X/zc, ky-odak*yc/zc];};
  const P={
    odak, yukseklik:hc, egim,
    ufuk:ky-odak*Math.tan(egim), // sonsuzdaki zeminin çizgisi (kaçış noktasının yüksekliği)
    n, derinlik,
    olcek:(X,Y,Z)=>odak/derinlik(X,Y,Z), // o noktada 1 cm kaç birim
    // O noktasında u ve v yönlü düzlemin yerel afin dönüşümü [a,b,c,d,e,f] (1 yerel birim = 1 cm)
    matris(O,u,v){
      const o=n(O[0],O[1],O[2]), a=n(O[0]+u[0],O[1]+u[1],O[2]+u[2]), b=n(O[0]+v[0],O[1]+v[1],O[2]+v[2]);
      return [a[0]-o[0],a[1]-o[1],b[0]-o[0],b[1]-o[1],o[0],o[1]];
    },
    // ekrandaki noktanın altındaki zemin noktası (Y yüksekliğindeki yatay düzlemde)
    zemindeki(sx,sy,Y=0){
      const xc=(sx-kx)/odak, yc=-(sy-ky)/odak; // yön: (xc, yc, 1) kamera ekseninde
      const dy=yc*cs-sn, dz=yc*sn+cs; // dünya yönü (x, y, z) = (xc, dy, dz)
      const t=(Y-hc)/dy; return [xc*t, Y, dz*t];
    }
  };
  return P;
}

// Düzlem yönleri: u yerel x (sağ), v yerel y (aşağı / makineye doğru)
export const DUZLEM={
  zemin:{u:[1,0,0], v:[0,0,-1]},
  ust:{u:[1,0,0], v:[0,0,-1]},
  arka:{u:[1,0,0], v:[0,-1,0]},  // makineye bakan duvar
  sol:{u:[0,0,-1], v:[0,-1,0]},  // soldaki duvar (yüzü sağa)
  sag:{u:[0,0,1], v:[0,-1,0]}    // sağdaki duvar (yüzü sola)
};
