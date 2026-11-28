// Kukla: Gemini'nin parça sayfasından kesilmiş köylü (baş, kapalı göz, göz beyazı maskesi, iris, ağızlar, boyunlu gövde).
// Parçalar araclar/kukla-kes.py ile kesilir; ölçüler src/icerik/kukla/<kimlik>.json içindedir.
// Kod: göz bebeği bakışı izler, göz kırpar, konuşurken ağız açılır (kenarları yüze eriyerek), nefesle gövde oynar.
import {c} from '../../teknik/tuval.js';
import {poz} from '../../rig/poz.js';
import {resim} from '../../../platform/gorseller.js';

const AYARLAR=Object.fromEntries(Object.values(import.meta.glob('../../../icerik/kukla/*.json',{eager:true,import:'default'})).map(a=>[a.kimlik,a]));

// sahne birimiyle: başın genişliği, boyunun başa oranı, boyunun çenenin ne kadar altına girdiği
const OLC={basGenislik:330, boyunOran:.52, boyunBindir:.1};

function parcalar(id){
  const a=AYARLAR[id]; if(!a) return null;
  const p=ad=>resim(`kukla-parca/${id}/${ad}`);
  const r={a,bas:p('bas'),kapali:p('bas-kapali'),goz:p('goz'),bebek:p('bebek'),yarim:p('agiz-yarim'),acik:p('agiz-acik'),govde:p('govde')};
  return Object.values(r).every(Boolean)?r:null;
}
export const kuklaVar=id=>!!(id&&parcalar(id));

const goz=document.createElement('canvas'), gc=goz.getContext('2d');
const agizT=document.createElement('canvas'), ac=agizT.getContext('2d');

// Kafa merkezi (0, kafaY) etrafında çizer. hx, hy: baş salınımı; egim: baş eğimi; nefes 0..1
export function kuklaCiz(id,{kafaY,hx=0,hy=0,egim=0,nefes=0}){
  const P=parcalar(id); if(!P) return false;
  const {a}=P, s=OLC.basGenislik/a.bas.w, bw=a.bas.w*s, bh=a.bas.h*s;
  const ust=kafaY-bh*.5, cene=ust+bh;
  // gövde: boyun genişliği başa oranlanır; boyun ucu çenenin biraz yukarısına girer
  const sg=OLC.basGenislik*OLC.boyunOran/a.govde.boyun, gw=a.govde.w*sg, gh=a.govde.h*sg;
  const gy=cene-bh*OLC.boyunBindir;
  c.save(); c.translate(0,gy); c.scale(1,1+nefes*.008); c.drawImage(P.govde,-gw/2,0,gw,gh); c.restore();
  // baş
  c.save(); c.translate(hx,cene+hy); c.rotate(egim); c.translate(-bw/2,-bh);
  const kapali=poz.goz<.35;
  c.drawImage(kapali?P.kapali:P.bas,0,0,bw,bh);
  if(!kapali){
    if(goz.width!==a.bas.w||goz.height!==a.bas.h){goz.width=a.bas.w; goz.height=a.bas.h;}
    for(const g of a.gozler){
      gc.globalCompositeOperation='source-over'; gc.clearRect(0,0,goz.width,goz.height);
      gc.save(); gc.beginPath(); gc.ellipse(g.x,g.y,g.rx+5,g.ry+5,0,0,7); gc.clip(); gc.drawImage(P.goz,0,0); gc.restore();
      gc.globalCompositeOperation='source-in';
      const d=g.ry*1.9, bx=g.x+(poz.gx+poz.bakisX)*g.rx*.5, by=g.y+(poz.gy+poz.bakisY)*g.ry*.3-g.ry*.1;
      gc.drawImage(P.bebek,bx-d/2,by-d/2,d,d);
      gc.globalCompositeOperation='source-atop'; // üst kapağın gölgesi
      const lg=gc.createLinearGradient(0,g.y-g.ry,0,g.y+g.ry*.3); lg.addColorStop(0,'rgba(20,14,16,.7)'); lg.addColorStop(1,'rgba(20,14,16,0)');
      gc.fillStyle=lg; gc.fillRect(g.x-g.rx-6,g.y-g.ry-6,g.rx*2+12,g.ry*1.7);
      c.drawImage(goz,0,0,goz.width,goz.height,0,0,bw,bh);
    }
  }
  const acik=Math.max(poz.agizAc||0,poz.agizAralik||0);
  if(acik>.18){
    const m=acik>.55?P.acik:P.yarim, o=a.agiz.olcek*s, mw=m.width*o, mh=m.height*o;
    agizT.width=Math.ceil(mw); agizT.height=Math.ceil(mh);
    ac.drawImage(m,0,0,mw,mh);
    ac.globalCompositeOperation='destination-in'; ac.save(); ac.translate(mw*.5,mh*.55); ac.scale(mw*.5,mh*.5);
    const fg=ac.createRadialGradient(0,0,0,0,0,1); fg.addColorStop(0,'#000'); fg.addColorStop(.5,'#000'); fg.addColorStop(1,'rgba(0,0,0,0)');
    ac.fillStyle=fg; ac.fillRect(-1,-1.2,2,2.4); ac.restore(); ac.globalCompositeOperation='source-over';
    c.drawImage(agizT,bw*a.agiz.x-mw/2,bh*a.agiz.y);
  }
  c.restore();
  return true;
}
