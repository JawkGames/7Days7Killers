// Ekran genişliğine göre oda yerleşimi: telefon dikey ile PC yatay ayarları arasından okunur.
import {gor} from '../../teknik/gorunum.js';
import {lerp,clamp} from '../../../cekirdek/matematik.js';
import {YERLESIM,MUFETTIS,KALABALIK} from './ayar.js';
import {zemin,Z_EV} from './kalabalik.js';

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
  Y.G=gor.yarimG; Y.ust=gor.ustY; Y.dar=1-t;
  const [kx,ky]=L.kn;
  Y.ekran=(X,Yw,s)=>[kx+X*s,ky+Yw*s];
  // müfettiş yolu: s kapıda küçük, pencerede sSon; ayak hizası odanın tabanıdır
  const M=L.muf;
  Y.muf={sBas:M.sBas, sSon:M.sSon, Xbas:(M.xBas-kx)/M.sBas, Xson:(M.xSon-kx)/M.sSon, Yomuz:(M.omuzSon-ky)/M.sSon};
  Y.Ytaban=Y.muf.Yomuz+MUFETTIS.omuzAyak;
  Y.Xsag=6000;                           // sağ duvar kameranın sağında, hiç görünmez
  Y.sUc=6;                               // sol duvarın kameraya en yakın ucu (ekranın çok dışında)
  Y.arka=[kx+Y.Xd*Y.sArka, ky+Y.Ytavan*Y.sArka, ky+Y.Ytaban*Y.sArka]; // arka duvarın sol kenarı, üst ve alt y
  // pencere: sol duvarda, uzak ve yakın kenar
  const P=L.pencere;
  Y.pen={
    uzUst:Y.ekran(Y.Xd,P.ust,P.sUzak), uzAlt:Y.ekran(Y.Xd,P.alt,P.sUzak),
    yaUst:Y.ekran(Y.Xd,P.ust,P.sYakin), yaAlt:Y.ekran(Y.Xd,P.alt,P.sYakin)
  };
  // camın durduğu düzlem duvarın içinde: uzak kenarda pervaz (yan yüz), altta eşik görünür
  const derin=Y.Xd*.08;
  Y.cam={
    uzUst:Y.ekran(Y.Xd+derin,P.ust,P.sUzak), uzAlt:Y.ekran(Y.Xd+derin,P.alt,P.sUzak),
    yaUst:Y.ekran(Y.Xd+derin,P.ust,P.sYakin), yaAlt:Y.ekran(Y.Xd+derin,P.alt,P.sYakin)
  };
  // pencere boşluğunu saran kutu
  const xs=[Y.pen.uzUst[0],Y.pen.yaUst[0],Y.cam.yaUst[0],Y.cam.uzUst[0]], ys=[Y.pen.yaUst[1],Y.pen.yaAlt[1]];
  Y.kutu={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};
  Y.penOrta=[(Y.cam.yaUst[0]+Y.cam.uzUst[0])/2,(Y.cam.yaUst[1]+Y.cam.yaAlt[1]+Y.cam.uzUst[1]+Y.cam.uzAlt[1])/4];
  // dış resim: uzaktaki manzara pencerenin açısından etkilenmez, düz bir resim olarak camın arkasında durur.
  // Dikeyde yerleşir: karşı evlerin dibi camın uzak kenarının üstten ~%40'ına, ön sıranın ayağı pencere altının biraz
  // altına düşer (en öndekileri eşik keser). Telefonda en az kalabalığın ortası (u .3-.7) görünecek kadar küçültülür.
  const yEv=zemin(.5,Z_EV)[1], uz=Y.cam.uzUst[1], uh=Y.cam.uzAlt[1]-uz;
  const evEkran=uz+uh*lerp(.36,.3,t), onEkran=lerp(Y.cam.uzAlt[1],Y.cam.yaAlt[1],.55)+uh*.06;
  const gorunurG=Y.cam.uzUst[0]-Y.cam.yaUst[0];
  const o=Math.min((onEkran-evEkran)/(KALABALIK.onY-yEv), gorunurG/(KALABALIK.yayilim*.28));
  const ortaX=(Y.cam.uzUst[0]+Y.cam.yaUst[0])/2;
  Y.dis={o, x:ortaX-KALABALIK.resim[0]/2*o, y:evEkran-yEv*o};
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
