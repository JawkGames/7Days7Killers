// Kayıp sahnelerinin ortak fırça yardımcıları. Teknik aynı: leke + titrek hat + tarama.
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {hex,rgba} from '../../../cekirdek/matematik.js';

/* sahnenin renkleri: küflü yeşil, morluk moru, kirli sarı; çizgi mürekkebi neredeyse siyah */
export const R={
  kufYesil:hex('#26302a'), kufAcik:hex('#3d4a3c'), morluk:PAL.morluk, kirliSari:hex('#8a7a48'),
  lamba:PAL.lamba, soguk:PAL.soguk, ay:hex('#9fb0aa'), murekkep:PAL.murekkep, siyah:PAL.siyah,
  tas:hex('#4a473a'), tasKoyu:hex('#2a2a22'), toprak:hex('#2e271c'), siva:hex('#57513f'),
  tahta:hex('#3a2c1d'), tahtaKoyu:hex('#1f170f'), bakir:hex('#7a4a26'), bakirIsik:hex('#c08a4a'),
  demir:hex('#26282a'), kumas:hex('#6e6650'), bez:hex('#9a937a'), kan:hex('#4e1210'), kanKoyu:hex('#2a0807'),
  kirmizi:hex('#6a1f1a'), siluet:hex('#060707')
};

/* çizim sırasında geçerli durum: ışığın yeri (gölgelerin yönü) ve kaynama kopyası */
export const DURUM={kaynama:0, isikX:0, isikY:300, lx:0, isikRenk:PAL.lamba};

// titrek tohumu: her ön bellek kopyasında değişir, hatlar saniyede birkaç kez oynar
export const ks=n=>n+DURUM.kaynama*7919;
export function hat(yol,renk,alfa,kalin,seed,kat,oyn){titrek(yol,renk||R.murekkep,alfa,kalin,ks(seed),kat||2,oyn==null?1.8:oyn);}

// yerel çizim: (x,y) tabanına taşı, ölçekle; gölge yönü yerel ışığa göre hesaplanır
export function yerel(x,y,s,fn,don){
  c.save(); c.translate(x,y); if(don)c.rotate(don); c.scale(s,s);
  const eski=DURUM.lx; DURUM.lx=(DURUM.isikX-x)/s; fn(); DURUM.lx=eski; c.restore();
}
export function isikYonu(x){return Math.sign(DURUM.lx-x)||1;} // ışık sağdaysa +1

/* boyalı biçim: dolgu, içinde ışığa göre leke ve tarama, üstte titrek kontur.
   kutu=[x0,y0,x1,y1] gölge ve taramanın alanı */
export function sekil(yol,renk,kutu,o){
  o=o||{};
  c.beginPath(); yol(); c.fillStyle=typeof renk==='string'?renk:rgba(renk,o.dolguA==null?1:o.dolguA); c.fill();
  if(kutu){
    const [x0,y0,x1,y1]=kutu, w=x1-x0, h=y1-y0, yon=isikYonu((x0+x1)/2);
    c.save(); c.beginPath(); yol(); c.clip();
    leke(yon>0?x0:x1,(y0+y1)/2+h*.1,w*.85,h*.95,R.siyah,o.koyu==null?.55:o.koyu);
    if(o.isik!==0) leke(yon>0?x1-w*.2:x0+w*.2,y0+h*.3,w*.55,h*.6,o.isikRenk||DURUM.isikRenk,o.isik==null?.12:o.isik);
    if(o.tara!==false) tara(x0-4,y0-4,x1+4,y1+4,o.aci==null?.6:o.aci,o.aralik||7,R.murekkep,o.taraA==null?.32:o.taraA,o.seed||1,o.taraK||1);
    c.restore();
  }
  if(o.hat!==false) hat(yol,o.hatRenk,o.hatA==null?.8:o.hatA,o.kalin||1.5,o.seed||1,2,o.oyn);
}

// elips yolu (canvas ellipse sarmalayıcısı)
export const elips=(x,y,rx,ry,d)=>()=>{c.ellipse(x,y,rx,ry,d||0,0,Math.PI*2);};
// çokgen yolu
export const cokgen=P=>()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++) c.lineTo(P[i][0],P[i][1]); c.closePath();};
// köşeleri yumuşak dörtgen
export const yuvarlak=(x,y,w,h,r)=>()=>{c.roundRect(x,y,w,h,r);};

// zemine düşen gölge (nesnenin altı)
export function tabanGolge(x,y,rx,ry,a){leke(x,y,rx,ry,R.siyah,a==null?.7:a);}

// ışığın nesneye vurduğu parlak kenar
export function parilti(yol,a,kalin){c.save(); c.strokeStyle=rgba(DURUM.isikRenk,a); c.lineWidth=kalin||1.4; c.beginPath(); yol(); c.stroke(); c.restore();}

export {leke,tara,titrek};
