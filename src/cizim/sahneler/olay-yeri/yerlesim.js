// Bir nesnenin (iz ya da kurban) yuvadaki yerleşimi: düzlem dönüşümü, dik çizim çerçevesi, temas gölgesi.
import {c} from '../../teknik/tuval.js';
import {leke} from '../../teknik/firca.js';
import {tabana} from './kalem.js';
import {DUZLEM} from './perspektif.js';

// yuva: {duzlem:'zemin'|'ust'|'arka'|'sol'|'sag', konum:[X,Y,Z], yuzey, alan, aci}
// sapma: {du, dv (cm, düzlemde), aci (radyan)} tohumlu küçük kaydırma
export function yerlestir(P,isik,yuva,sapma={du:0,dv:0,aci:0}){
  const D=DUZLEM[yuva.duzlem]||DUZLEM.zemin, u=D.u, v=D.v, k0=yuva.konum;
  const O=[k0[0]+u[0]*sapma.du+v[0]*sapma.dv, k0[1]+u[1]*sapma.du+v[1]*sapma.dv, k0[2]+u[2]*sapma.du+v[2]*sapma.dv];
  const M=P.matris(O,u,v), s=P.n(O[0],O[1],O[2]), yk=P.n(O[0],O[1]+1,O[2]);
  const aci=(yuva.aci||0)+(sapma.aci||0);
  const yukari=[yk[0]-s[0],yk[1]-s[1]]; // dünyada 1 cm yukarının fotoğraftaki karşılığı
  // ışığın tersine düşen gölge yönü, düzlemin yerel ekseninde (dönüş sonrası)
  const d=[O[0]-isik.konum[0],O[1]-isik.konum[1],O[2]-isik.konum[2]];
  let gx=d[0]*u[0]+d[1]*u[1]+d[2]*u[2], gy=d[0]*v[0]+d[1]*v[1]+d[2]*v[2];
  const gu=Math.hypot(gx,gy)||1; gx/=gu; gy/=gu;
  const ca=Math.cos(-aci), sa=Math.sin(-aci);
  const k={
    P, yuva, O, aci, ekran:s, yukari, yuzey:yuva.yuzey||'toprak', duzlemAdi:yuva.duzlem,
    olcek:P.olcek(O[0],O[1],O[2]),
    golgeYon:[gx*ca-gy*sa, gx*sa+gy*ca],
    // yerel düzlem çerçevesi (cm). h: düzlemin h cm üstü (yalnızca yatay düzlemde anlamlı)
    duzlem(h=0){tabana(); c.translate(yukari[0]*h,yukari[1]*h); c.transform(M[0],M[1],M[2],M[3],M[4],M[5]); c.rotate(aci);},
    // dik çerçeve: ekrana paralel, 1 birim = 1 cm, yukarı eksi y
    dik(){tabana(); c.translate(s[0],s[1]); c.scale(k.olcek,k.olcek);},
    // temas gölgesi: düzlem çerçevesinde, ışığın tersine hafif kaymış yumuşak leke
    temas(x,y,rx,ry,alfa=.6,kayma=.25,don=0){
      k.duzlem(); leke(x+k.golgeYon[0]*rx*kayma,y+k.golgeYon[1]*ry*kayma,rx,ry,[0,0,0],alfa,don);
    },
    // düzlemdeki yerel noktanın fotoğraf koordinatı
    nokta(lx,ly,h=0){
      const cr=Math.cos(aci), sr=Math.sin(aci), x=lx*cr-ly*sr, y=lx*sr+ly*cr;
      return [M[0]*x+M[2]*y+M[4]+yukari[0]*h, M[1]*x+M[3]*y+M[5]+yukari[1]*h];
    }
  };
  return k;
}
