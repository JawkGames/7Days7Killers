// Çizim tekniği: çamurlu boya lekesi + cızırtılı mürekkep. Bütün sahneler bu dört aracı kullanır.
import {c} from './tuval.js';
import {TAU,rgba} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';

export function leke(x,y,rx,ry,renk,a,don){ // boya: kenara doğru eriyen eliptik leke
  c.save(); c.translate(x,y); if(don)c.rotate(don); c.scale(rx,ry);
  const g=c.createRadialGradient(0,0,0,0,0,1);
  g.addColorStop(0,rgba(renk,a)); g.addColorStop(.5,rgba(renk,a*.55)); g.addColorStop(1,rgba(renk,0));
  c.fillStyle=g; c.beginPath(); c.arc(0,0,1,0,TAU); c.fill(); c.restore();
}
export function tara(x0,y0,x1,y1,aci,aralik,renk,alfa,seed,kalin){ // tarama: kırık, titrek paralel çizgiler
  const r=rng(seed), R=Math.hypot(x1-x0,y1-y0)/2; kalin=kalin||1;
  c.save(); c.beginPath(); c.rect(x0,y0,x1-x0,y1-y0); c.clip(); // tarama yalnızca verilen kutuda kalır
  c.translate((x0+x1)/2,(y0+y1)/2); c.rotate(aci); c.lineCap='round';
  for(let y=-R;y<R;y+=aralik*(.55+r()*.9)){
    let x=-R+r()*40;
    while(x<R){
      const u=18+r()*95;
      c.strokeStyle=rgba(renk,alfa*(.35+r()*.65)); c.lineWidth=kalin*(.5+r());
      c.beginPath(); c.moveTo(x,y+(r()-.5)*3); c.quadraticCurveTo(x+u/2,y+(r()-.5)*6,x+u,y+(r()-.5)*3); c.stroke();
      x+=u+r()*30;
    }
  }
  c.restore();
}
export function titrek(yol,renk,alfa,kalin,seed,kat,oynama){ // el titremesi: aynı hat birkaç kez, hafif kaymış
  const r=rng(seed); kat=kat||2; oynama=oynama==null?2.4:oynama; c.lineCap='round'; c.lineJoin='round';
  for(let i=0;i<kat;i++){
    c.save(); c.translate((r()-.5)*oynama,(r()-.5)*oynama); c.rotate((r()-.5)*oynama*.0016);
    c.strokeStyle=rgba(renk,alfa*(.55+r()*.45)); c.lineWidth=kalin*(.6+r()*.8);
    c.beginPath(); yol(); c.stroke(); c.restore();
  }
}
export function karalama(x,y,rx,ry,renk,alfa,seed,tur){ // kaotik karalama yumağı
  const r=rng(seed); c.strokeStyle=rgba(renk,alfa); c.lineWidth=.8+r(); c.lineCap='round';
  c.beginPath(); c.moveTo(x+(r()-.5)*rx,y+(r()-.5)*ry);
  for(let i=0;i<(tur||10);i++) c.quadraticCurveTo(x+(r()-.5)*rx*2,y+(r()-.5)*ry*2,x+(r()-.5)*rx*1.6,y+(r()-.5)*ry*1.6);
  c.stroke();
}
