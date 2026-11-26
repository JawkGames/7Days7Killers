// Ekran genişliğine göre oda yerleşimi: telefon dikey ile PC yatay ayarları arasından okunur.
import {gor} from '../../teknik/gorunum.js';
import {lerp,clamp} from '../../../cekirdek/matematik.js';
import {YERLESIM,MUFETTIS,KALABALIK} from './ayar.js';

export const Y={}; // her boyutlanmada yeniden kurulur; çizim modülleri buradan okur

function karistir(a,b,t){
  if(typeof a==='number') return lerp(a,b,t);
  if(Array.isArray(a)) return a.map((v,i)=>karistir(v,b[i],t));
  const o={}; for(const k in a) o[k]=karistir(a[k],b[k],t); return o;
}

export function yerlesimKur(){
  const D=YERLESIM.dar, W=YERLESIM.genis, t=clamp((gor.yarimG-D.G)/(W.G-D.G),0,1);
  const L=karistir(D,W,t);
  Object.assign(Y,L);
  Y.G=gor.yarimG; Y.ust=gor.ustY;
  const [kx,ky]=L.kn;
  // dünya ölçüleri: sol duvar X'i, tavan ve taban Y'si
  Y.Xd=(L.arka[0]-kx)/L.sArka; Y.Ytavan=(L.arka[1]-ky)/L.sArka; Y.Ytaban=(L.arka[2]-ky)/L.sArka;
  Y.ekran=(X,Yw,s)=>[kx+X*s,ky+Yw*s];
  // pencere: sol duvarda, uzak ve yakın kenar
  const P=L.pencere;
  Y.pen={
    uzUst:Y.ekran(Y.Xd,P.ust,P.sUzak), uzAlt:Y.ekran(Y.Xd,P.alt,P.sUzak),
    yaUst:Y.ekran(Y.Xd,P.ust,P.sYakin), yaAlt:Y.ekran(Y.Xd,P.alt,P.sYakin)
  };
  // camın durduğu düzlem duvarın içinde: uzak kenarda pervaz (yan yüz) görünür
  const derin=Y.Xd*.11;
  Y.cam={
    uzUst:Y.ekran(Y.Xd+derin,P.ust,P.sUzak), uzAlt:Y.ekran(Y.Xd+derin,P.alt,P.sUzak),
    yaUst:Y.ekran(Y.Xd+derin,P.ust,P.sYakin), yaAlt:Y.ekran(Y.Xd+derin,P.alt,P.sYakin)
  };
  // pencere boşluğunu saran kutu: dış resim buna yerleşir
  const xs=[Y.pen.uzUst[0],Y.pen.yaUst[0],Y.cam.yaUst[0]], ys=[Y.pen.yaUst[1],Y.pen.yaAlt[1]];
  Y.kutu={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};
  // dış resim: genişlikte kalabalığın tamamı (u .2-.8) görünecek, yükseklikte meydan boşluğun ~%80'ini dolduracak kadar büyütülür.
  // ufuk pencerenin üstten ~%20'sine oturur; resmin altından taşan yer binanın dibindeki boş zemindir.
  const [rw]=KALABALIK.resim, gorunurG=Y.pen.uzUst[0]-Y.pen.yaUst[0], bh=Y.kutu.y1-Y.kutu.y0;
  const o=Math.min(gorunurG/(rw*.62),bh*.82/(KALABALIK.onY-KALABALIK.ufuk));
  const ortaX=(Y.pen.uzUst[0]+Y.pen.yaUst[0])/2;
  Y.dis={o, x:ortaX-rw/2*o, y:Y.kutu.y0+bh*.2-KALABALIK.ufuk*o};
  // müfettiş yolu: s kapıda küçük, pencerede 1
  const M=L.muf;
  Y.muf={
    sBas:(L.arka[2]-ky)/((M.omuzSon-ky)+MUFETTIS.omuzAyak),
    Xbas:0, Xson:(M.xSon-kx), Yomuz:M.omuzSon-ky
  };
  Y.muf.Xbas=(M.xBas-kx)/Y.muf.sBas;
  return Y;
}

// cam üzerinde (a: 0 yakın kenar, 1 uzak kenar; b: 0 üst, 1 alt) noktayı ekrana taşır; perspektif doğru bölünür
export function camNokta(a,b){
  const P=Y.pencere, C=Y.cam;
  const s=1/((1-a)/P.sYakin+a/P.sUzak); // 1/s doğrusal
  const k=(s-P.sYakin)/(P.sUzak-P.sYakin);
  const ux=lerp(C.yaUst[0],C.uzUst[0],k), ust=lerp(C.yaUst[1],C.uzUst[1],k), alt=lerp(C.yaAlt[1],C.uzAlt[1],k);
  return [ux,lerp(ust,alt,b),s];
}
