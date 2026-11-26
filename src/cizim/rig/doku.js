// Rig'in ortak dokuları: saç/sakal teli ve kumaş. teknik/ içindeki leke, tara, titrek üstüne kuruludur.
// Işık her zaman soldan-yukarıdan gelir: sol yan aydınlık, sağ yan (+x) karanlıkta.
import {c} from '../teknik/tuval.js';
import {leke,tara,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {hex,rgba,lerp,clamp} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {karistir} from './gorunus.js';

/* Saç, sakal, bıyık: yolun içini telle doldurur.
   kutu = [x0,y0,x1,y1] (tellerin başlayabileceği alan), o = {renk:'#..', koyu:[r,g,b], isik:[r,g,b], n, boy,
   yon:(x,y)=>açı, dag (açı dağılımı), kivrim, kalin, seed, acik (açık tel oranı), parlak (ışık lekesi gücü)} */
export function lifDoldur(yol,kutu,o){
  const [x0,y0,x1,y1]=kutu, Y=o.yumusak; // yumusak = [cx,cy,r0,r1]: merkeze yakın kenarlar tene karışarak erir
  const sert=Y?(x,y)=>clamp((Math.hypot(x-Y[0],y-Y[1])-Y[2])/(Y[3]-Y[2]),0,1):()=>1;
  c.beginPath(); yol();
  if(Y){const k=hex(o.renk), g=c.createRadialGradient(Y[0],Y[1],Y[2],Y[0],Y[1],Y[3]); g.addColorStop(0,rgba(k,0)); g.addColorStop(1,rgba(k,1)); c.fillStyle=g;}
  else c.fillStyle=o.renk;
  c.fill();
  c.save(); c.clip();
  const r=rng(o.seed); c.lineCap='round';
  const dag=o.dag==null?.3:o.dag, kiv=o.kivrim==null?.3:o.kivrim, acik=o.acik==null?.2:o.acik, kal=o.kalin||1;
  for(let i=0;i<o.n;i++){
    const x=lerp(x0,x1,r()), y=lerp(y0,y1,r()), a=o.yon(x,y)+(r()-.5)*dag, L=o.boy*(.5+r()*.9), b=(r()-.5)*L*kiv;
    const ac=r()<acik, h=sert(x,y);
    c.strokeStyle=ac?rgba(o.isik,(.12+r()*.3)*h):rgba(o.koyu,(.35+r()*.5)*h); c.lineWidth=kal*(.6+r()*1.5);
    const dx=Math.cos(a)*L, dy=Math.sin(a)*L;
    c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+dx/2-dy/L*b,y+dy/2+dx/L*b,x+dx,y+dy); c.stroke();
  }
  const p=o.parlak==null?1:o.parlak, w=x1-x0, h=y1-y0;
  leke(x0+w*.28,y0+h*.22,w*.26,h*.2,o.isik,.3*p*poz.isik,-.4);
  leke(x0+w*.86,y0+h*.55,w*.3,h*.55,PAL.siyah,.55);
  c.restore();
}

/* Silüetten taşan dağınık teller. noktalar = [[x,y,açı],...] */
export function teller(noktalar,renk,seed,boy){
  const u=rng(seed+poz.kaynama*3); c.lineCap='round';
  for(const [x,y,a] of noktalar){
    const L=(boy||18)*(.5+u()), d=(u()-.5)*L*.6;
    c.strokeStyle=rgba(renk,.4+u()*.45); c.lineWidth=.7+u()*1.1;
    const dx=Math.cos(a)*L, dy=Math.sin(a)*L;
    c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+dx/2-dy/L*d,y+dy/2+dx/L*d,x+dx,y+dy); c.stroke();
  }
}

/* Kumaş: çamurlu boya + gölge yanında tarama + titrek kenar.
   o = {renk:[r,g,b], seed, desen:fn (kırpılmış alanda çizilir), tara (gölge taraması gücü), hat (kenar çizilsin mi), golge (0..1 sağ yan kararması)} */
export function kumas(yol,kutu,o){
  const [x0,y0,x1,y1]=kutu, k=poz.kaynama, R=o.renk, s=o.seed||700, w=x1-x0, h=y1-y0;
  c.beginPath(); yol();
  const g=c.createLinearGradient(x0,y0,x1,y1);
  g.addColorStop(0,rgba(karistir(R,'#cfc8a8',.16),1)); g.addColorStop(.42,rgba(R,1)); g.addColorStop(1,rgba(karistir(R,[0,0,0],.78),1));
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  if(o.desen) o.desen();
  leke(x0+w*.24,y0+h*.18,w*.3,h*.22,karistir(R,'#d8d0b0',.3),.32*poz.isik,-.3);
  leke(x1-w*.12,y0+h*.6,w*.34,h*.6,PAL.siyah,.72*(o.golge==null?1:o.golge));
  const t=o.tara==null?1:o.tara;
  if(t>0){ tara(x0+w*.5,y0,x1,y1,1.05,7,PAL.murekkep,.45*t,s+k,1.1); tara(x0,y0,x1,y1,.75,9,PAL.murekkep,.16*t,s+1+k,1.1); }
  c.restore();
  if(o.hat!==false) titrek(yol,PAL.murekkep,.85,1.8,s+2+k,2,2.2);
}
