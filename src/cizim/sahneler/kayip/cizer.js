// Kayıp sahnelerinin ortak fırça yardımcıları. Teknik sorgu odasıyla aynı: çamurlu leke + titrek mürekkep hattı + tarama.
// Tarama yalnızca gölgede kalır (ışığa bakan yüz temiz bırakılır); yoksa "çatlak porselen" gibi durur (NOTLAR.md).
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek,karalama} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {hex,rgba,TAU} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';

/* sahnenin renkleri: küflü yeşil, morluk moru, kirli sarı; çizgi mürekkebi neredeyse siyah */
export const R={
  kufYesil:hex('#26302a'), kufAcik:hex('#3d4a3c'), morluk:PAL.morluk, kirliSari:hex('#8a7a48'),
  lamba:PAL.lamba, soguk:PAL.soguk, ay:hex('#9fb0aa'), murekkep:PAL.murekkep, siyah:PAL.siyah,
  tas:hex('#4a473a'), tasKoyu:hex('#2a2a22'), toprak:hex('#2e271c'), siva:hex('#57513f'),
  tahta:hex('#3a2c1d'), tahtaKoyu:hex('#1f170f'), bakir:hex('#7a4a26'), bakirIsik:hex('#c08a4a'),
  demir:hex('#26282a'), kumas:hex('#6e6650'), bez:hex('#9a937a'), kan:hex('#6a1812'), kanKoyu:hex('#3a0a08'),
  kirmizi:hex('#6a1f1a'), siluet:hex('#060707'), sicakAcik:hex('#8a8468')
};
const CAMUR=[R.kufYesil,R.morluk,R.kirliSari,R.siyah];

/* çizim sırasında geçerli durum: ışığın yeri (gölgelerin yönü), ışığın iç yarıçapı ve kaynama kopyası */
export const DURUM={kaynama:0, isikX:0, isikY:300, isikIc:80, lx:0, isikRenk:PAL.lamba};

// titrek tohumu: her ön bellek kopyasında değişir, hatlar saniyede birkaç kez oynar
export const ks=n=>n+DURUM.kaynama*7919;
export function hat(yol,renk,alfa,kalin,seed,kat,oyn){titrek(yol,renk||R.murekkep,alfa,kalin,ks(seed),kat||2,oyn==null?2.4:oyn);}

// yerel çizim: (x,y) tabanına taşı, ölçekle; gölge yönü yerel ışığa göre hesaplanır
export function yerel(x,y,s,fn,don){
  c.save(); c.translate(x,y); if(don)c.rotate(don); c.scale(s,s);
  const eski=DURUM.lx; DURUM.lx=(DURUM.isikX-x)/s; fn(); DURUM.lx=eski; c.restore();
}
export function isikYonu(x){return Math.sign(DURUM.lx-x)||1;} // ışık sağdaysa +1

/* boyalı biçim: dolgu, içinde çamurlu leke, ışığa göre gölge ve parıltı, YALNIZCA gölgeli yarıda tarama,
   üstte titrek mürekkep kontur. kutu=[x0,y0,x1,y1] gölge ve taramanın alanı */
export function sekil(yol,renk,kutu,o){
  o=o||{};
  c.beginPath(); yol(); c.fillStyle=typeof renk==='string'?renk:rgba(renk,o.dolguA==null?1:o.dolguA); c.fill();
  if(kutu){
    const [x0,y0,x1,y1]=kutu, w=x1-x0, h=y1-y0, yon=isikYonu((x0+x1)/2), r=rng((o.seed||1)*31+7);
    c.save(); c.beginPath(); yol(); c.clip();
    // çamur: boya düz kalmasın
    if(o.camur!==false) for(let i=0;i<2;i++) leke(x0+w*r(),y0+h*r(),w*(.3+r()*.4),h*(.3+r()*.4),CAMUR[(r()*4)|0],.08+r()*.1,r()*3);
    leke(yon>0?x0:x1,(y0+y1)/2+h*.15,w*.9,h*1.0,R.siyah,o.koyu==null?.45:o.koyu);
    if(o.isik!==0) leke(yon>0?x1-w*.22:x0+w*.22,y0+h*.28,w*.5,h*.55,o.isikRenk||DURUM.isikRenk,o.isik==null?.16:o.isik);
    if(o.tara!==false){
      const a=(o.taraA==null?.4:o.taraA)*1.35, ara=o.aralik||6, aci=o.aci==null?.6:o.aci, sd=o.seed||1;
      // ışık yanında seyrek, açık renkli fırça izi: boya dokusu
      tara(x0,y0,x1,y1,aci-.9,ara*2,o.isikRenk||DURUM.isikRenk,.15,sd+2,1.3);
      const golge=(k,d)=>{ // ışıktan uzak kenardan k oranında içeri, eğik sınırlı bölge
        const sx=yon>0?x0-6:x1+6, m=yon>0?x0+w*k:x1-w*k, e=w*.14*yon;
        c.beginPath(); c.moveTo(sx,y0-6); c.lineTo(m-e,y0-6); c.lineTo(m+e,y1+6); c.lineTo(sx,y1+6); c.closePath();
        if(d) c.rect(x0-6,y0+h*d,w+12,h*(1-d)+6); // alt kenar da gölgede
      };
      c.save(); golge(o.golgeK||.58,.78); c.clip(); tara(x0-4,y0-4,x1+4,y1+4,aci,ara,R.murekkep,a,sd,o.taraK||1.3); c.restore();
      c.save(); golge((o.golgeK||.58)*.45,0); c.clip(); tara(x0-4,y0-4,x1+4,y1+4,aci+1.25,ara*1.25,R.murekkep,a*.75,sd+1,o.taraK||1.3); c.restore();
    }
    c.restore();
  }
  if(o.hat!==false) hat(yol,o.hatRenk,o.hatA==null?.85:o.hatA,o.kalin||1.7,o.seed||1,o.kat||3,o.oyn);
}

/* büyük yüzeyler için ışığa göre tonlu tarama: ışığın çevresi temiz, uzaklaştıkça kat kat çapraz tarama.
   katlar: [[yarıçap çarpanı, açı, aralık, alfa], ...] yarıçap DURUM.isikIc'e göre */
export function golgeTara(x0,y0,x1,y1,seed,o){
  o=o||{}; const lx=DURUM.isikX, ly=DURUM.isikY, r0=(DURUM.isikIc+60)*(o.olcek||1);
  const katlar=o.katlar||[[1.4,.45,10,.30],[2.6,-1.05,13,.26],[3.8,1.25,16,.22]];
  for(let i=0;i<katlar.length;i++){
    const [k,aci,ara,a]=katlar[i];
    c.save(); c.beginPath(); c.rect(x0,y0,x1-x0,y1-y0); c.ellipse(lx,ly,r0*k,r0*k*(o.basik||.8),0,0,TAU); c.clip('evenodd');
    tara(x0,y0,x1,y1,aci,ara,o.renk||R.murekkep,a*(o.alfa||1),seed+i*13,o.kalin||1.2);
    c.restore();
  }
}

/* akıntı izleri: duvarın üstünden aşağı süzülen rutubet ve is (sorgu odasındaki gibi) */
export function akinti(x0,y0,x1,y1,seed,n,o){
  o=o||{}; const r=rng(seed);
  c.lineCap='round';
  for(let i=0;i<n;i++){
    const x=x0+r()*(x1-x0), y=y0+r()*(y1-y0)*(o.ust||.5), u=60+r()*(o.boy||420);
    c.strokeStyle=`rgba(4,5,5,${.16+r()*.3})`; c.lineWidth=1+r()*3;
    c.beginPath(); c.moveTo(x,y); c.bezierCurveTo(x+(r()-.5)*8,y+u*.3,x+(r()-.5)*10,y+u*.7,x+(r()-.5)*6,y+u); c.stroke();
    if(r()<.35){c.fillStyle=`rgba(4,5,5,${.2+r()*.2})`; c.beginPath(); c.ellipse(x,y+u,1.5+r()*2,2+r()*3,0,0,TAU); c.fill();} // damla ucu
  }
}

// kazınmış karalamalar, çentikler
export function kazinti(x0,y0,x1,y1,seed,n,renk){
  const r=rng(seed);
  for(let i=0;i<n;i++) karalama(x0+r()*(x1-x0),y0+r()*(y1-y0),24+r()*50,16+r()*36,renk||R.sicakAcik,.05+r()*.07,seed+i,8+(r()*10|0));
}

// elips yolu (canvas ellipse sarmalayıcısı)
export const elips=(x,y,rx,ry,d)=>()=>{c.ellipse(x,y,rx,ry,d||0,0,Math.PI*2);};
// çokgen yolu
export const cokgen=P=>()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++) c.lineTo(P[i][0],P[i][1]); c.closePath();};
// köşeleri yumuşak dörtgen
export const yuvarlak=(x,y,w,h,r)=>()=>{c.roundRect(x,y,w,h,r);};

// zemine düşen gölge (nesnenin altı)
export function tabanGolge(x,y,rx,ry,a){leke(x,y,rx,ry,R.siyah,a==null?.75:a);}

// ışığın nesneye vurduğu parlak kenar
export function parilti(yol,a,kalin){c.save(); c.strokeStyle=rgba(DURUM.isikRenk,a); c.lineWidth=kalin||1.4; c.beginPath(); yol(); c.stroke(); c.restore();}

export {leke,tara,titrek,karalama};
