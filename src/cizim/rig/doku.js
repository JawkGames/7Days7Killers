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

/* Tel kütlesi (yeni yol: sakal, bıyık, dağınık saç). lifDoldur'dan farkı: kenar kesik değil.
   Taban boyası yolun içinde yumuşak lekelerle verilir (o.taban gücü); teller yolun içinden başlar ama kırpılmaz,
   uçları silüetten taşar. o.yogun(x,y) 0..1: tel sıklığı (sakalın yanakta erimesi için). Diğer alanlar lifDoldur gibi. */
export function lifKutle(yol,kutu,o){
  const [x0,y0,x1,y1]=kutu, w=x1-x0, h=y1-y0, M=c.getTransform();
  const P=new Path2D(); yol(P); // yol(p): yolu verilen hedefe (Path2D) çizer
  const ic=(x,y)=>{const p=M.transformPoint(new DOMPoint(x,y)); return c.isPointInPath(P,p.x,p.y);}; // yol geçerli dönüşümle, nokta tuval biriminde
  c.save(); c.clip(P);
  const t=o.taban==null?.8:o.taban, yog=o.yogun||(()=>1);
  if(o.dolu){c.fillStyle=rgba(hex(o.renk),o.dolu); c.fill(P);} // saç kütlesi: alttan dolu boya (teller kenarı örter)
  for(let i=0;i<14;i++){const r0=rng(o.seed+300+i), x=lerp(x0,x1,r0()), y=lerp(y0,y1,r0()); leke(x,y,w*.22,h*.22,hex(o.renk),t*.5*yog(x,y));}
  leke(x0+w*.8,y0+h*.6,w*.35,h*.5,PAL.siyah,.5*t);
  c.restore();
  const r=rng(o.seed); c.lineCap='round';
  const dag=o.dag==null?.3:o.dag, kiv=o.kivrim==null?.3:o.kivrim, acik=o.acik==null?.2:o.acik, kal=o.kalin||1;
  let n=0, deneme=0;
  while(n<o.n&&deneme<o.n*4){
    deneme++;
    const x=lerp(x0,x1,r()), y=lerp(y0,y1,r()), q=r();
    if(!ic(x,y)||q>yog(x,y)) continue;
    n++;
    const a=o.yon(x,y)+(r()-.5)*dag, L=o.boy*(.5+r()*.9), b=(r()-.5)*L*kiv, ac=r()<acik;
    c.strokeStyle=ac?rgba(o.isik,.14+r()*.32):rgba(o.koyu,.3+r()*.5); c.lineWidth=kal*(.5+r()*1.3);
    const dx=Math.cos(a)*L, dy=Math.sin(a)*L;
    c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+dx/2-dy/L*b,y+dy/2+dx/L*b,x+dx,y+dy); c.stroke();
  }
  const p=o.parlak==null?1:o.parlak;
  c.save(); c.clip(P); leke(x0+w*.28,y0+h*.3,w*.26,h*.2,o.isik,.25*p*poz.isik,-.4); c.restore();
}

/* Kumaş kıvrımı (yeni yol): her kıvrım bir bezier [x0,y0,x1,y1,x2,y2,x3,y3]; g: gölgenin düştüğü yan (+1 sağ, -1 sol).
   Kıvrımın bir yanı koyu lekelerle çöker, öbür yanı soluk ışık alır; hat kopuk, titrek mürekkeple çekilir.
   Kumaşın yolu kırpılmışken çağrılmalı (lekeler kumaştan taşmasın). */
export function kivrimlar(liste,renk,seed,guc){
  const r=rng(seed), k=poz.kaynama, gc=guc==null?1:guc, R=typeof renk==='string'?hex(renk):renk;
  liste.forEach(([P,g,gen],i)=>{
    gen=gen||1;
    for(let t=.1;t<.95;t+=.16){const q=1-t, x=q*q*q*P[0]+3*q*q*t*P[2]+3*q*t*t*P[4]+t*t*t*P[6], y=q*q*q*P[1]+3*q*q*t*P[3]+3*q*t*t*P[5]+t*t*t*P[7];
      const ince=Math.sin(t*Math.PI); // kıvrım uçlarda incelir
      leke(x+g*10*gen,y,(9+r()*6)*gen*ince+3,(26+r()*14)*gen,PAL.siyah,(.22+r()*.14)*gc);
      leke(x-g*8*gen,y,6*gen*ince+2,20*gen,karistir(R,'#ddd4b4',.35),.1*gc*poz.isik);}
    c.setLineDash([36+(i*13)%30,12+(i*7)%16,60,20]);
    titrek(()=>{c.moveTo(P[0],P[1]); c.bezierCurveTo(P[2],P[3],P[4],P[5],P[6],P[7]);},PAL.murekkep,(.34+(g>0?.12:0))*gc,1.2,seed+20+i+k,2,1.8);
    c.setLineDash([]);
  });
}
