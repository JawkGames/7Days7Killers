// Devrilmiş nesne. p.cesit: 'gugum' (bakır su güğümü, dökülmüş su) | 'lamba' (gaz lambası, kırık şişe, gaz lekesi)
// Yan yatmış gövde ekrana paralel (dik çerçeve) çizilir; dökülen sıvı ve cam kırıkları zemin düzleminde.
import {c} from '../../../teknik/tuval.js';
import {leke,tara} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {RENK} from '../ayar.js';
import {dolgu,serit,hat} from '../kalem.js';

// dönel gövde profili: eksen boyunca [x, yarıçap]
const PROFIL={
  gugum:[[-19,0],[-19,7.5],[-16,11],[-9,13.2],[-3,13],[3,10.5],[7,6.2],[10,4.2],[18,3.8],[20,5.6],[21.5,6.2],[22,5.8]],
  lamba:[[-6,0],[-6,6.4],[2,6.6],[3,4],[5.5,2.2],[6.5,2.6],[8,3.2],[13,4.6],[15.5,3.4],[17,2.6]]
};

// profili yan yatırır: eksen yatay, en alt nokta y=0 (zemin); yon ±1 ağız sağa/sola
function yatir(pr,egim,yon){
  const ust=pr.map(([x,r])=>[x,-r]), alt=pr.slice().reverse().map(([x,r])=>[x,r]);
  const cs=Math.cos(egim), sn=Math.sin(egim);
  let n=[...ust,...alt].map(([x,y])=>[(x*cs-y*sn)*yon,x*sn+y*cs]);
  const enAlt=Math.max(...n.map(q=>q[1])); n=n.map(q=>[q[0],q[1]-enAlt]);
  return {n, don:(x,y)=>[(x*cs-y*sn)*yon,x*sn+y*cs-enAlt]};
}
const yolN=n=>()=>{n.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath();};

export default {
  tur:'devrik', duzlemler:['zemin','ust'], aciSapma:.2,
  kapsam:(p)=>p.cesit==='lamba'?{r:16,h:4}:{r:24,h:8},
  kur(p,r){
    const yon=r()<.5?-1:1, lamba=p.cesit==='lamba';
    const egim=lamba?-.18:-.26;
    const g=yatir(PROFIL[lamba?'lamba':'gugum'],egim,yon);
    const sivi=[]; for(let i=0;i<7;i++) sivi.push([(r()*.9+.2)*yon*(lamba?14:22)+(r()-.5)*8,(r()-.5)*12,6+r()*12,4+r()*7,r()*3]);
    const kirik=[]; for(let i=0;i<9;i++) kirik.push([yon*(12+r()*14),(r()-.5)*14,r()*TAU,.6+r()*1.4]);
    return {...g, yon, lamba, sivi, kirik, cukur:Array.from({length:4},()=>[(r()-.5)*24,-4-r()*16,1.5+r()*2.5]), t:r()*1e5|0};
  },
  ciz(k,g){
    const yz=k.yuzey, tas=yz==='tas'||yz==='tahta';
    // dökülen su ya da gaz: toprak emer (koyu, kenarı dağınık), taşta göllenir (ışık yakalar)
    k.duzlem();
    for(const s of g.sivi) leke(s[0],s[1],s[2],s[3],[2,3,2],tas?.42:.34,s[4]);
    if(tas) leke(g.yon*16,0,10,2.2,[200,200,186],.12,.1);
    if(g.lamba) for(const q of g.kirik){ // şişe kırıkları
      k.duzlem(); c.translate(q[0],q[1]); c.rotate(q[2]);
      dolgu(()=>{c.moveTo(0,-q[3]); c.lineTo(q[3]*.7,q[3]*.5); c.lineTo(-q[3]*.5,q[3]*.3); c.closePath();},[160,162,154],.35);
      serit(()=>{c.moveTo(0,-q[3]); c.lineTo(q[3]*.7,q[3]*.5);},[220,222,214],.5,.5);
    }
    // temas gölgesi gövdenin altında
    k.temas(g.yon*2,0,g.lamba?11:20,g.lamba?5:9,.75,.25);
    k.dik();
    const y=yolN(g.n);
    if(g.lamba){
      // teneke hazne + bilezik dolu; şişe kırık, saydam
      c.save(); c.beginPath(); y(); c.clip();
      const ayir=g.don(3,0)[0];
      dolgu(()=>{c.rect(g.yon>0?-20:ayir,-20,g.yon>0?ayir+20:20-ayir,40);},[64,62,56],1);
      leke(0,-9,10,4,[170,168,156],.3);
      c.restore();
      const cam=PROFIL.lamba.slice(5);
      const ust=cam.map(([x,r])=>g.don(x,-r)), alt=cam.slice().reverse().map(([x,r])=>g.don(x,r));
      const kirikUc=g.don(13.5,0);
      serit(()=>{ust.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.lineTo(kirikUc[0],kirikUc[1]-1.5); c.lineTo(kirikUc[0]-g.yon*1.4,kirikUc[1]+1.2); alt.slice(-3).forEach(q=>c.lineTo(q[0],q[1]));},[178,180,172],.55,.9);
      hat(()=>{const a=g.don(-6,-6.4), b=g.don(2,-6.6), e=g.don(2,6.6), f=g.don(-6,6.4); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.lineTo(e[0],e[1]); c.lineTo(f[0],f[1]); c.closePath();},[8,8,8],.8,1,g.t,2,.6);
      serit(()=>{const a=g.don(-4,-6.4), b=g.don(-2,-14), e=g.don(1,-6.6); c.moveTo(a[0],a[1]); c.quadraticCurveTo(b[0],b[1],e[0],e[1]);},[20,20,18],.8,.8); // tel kulp
    }else{
      // bakır güğüm: ışık üst yüzde, altı kararır; birkaç ezik
      dolgu(y,[86,74,62],1);
      c.save(); c.beginPath(); y(); c.clip();
      const m=g.don(-6,0);
      leke(m[0],m[1]-14,22,8,[190,176,150],.32);
      leke(m[0]-g.yon*2,m[1]-9,9,3,[235,226,204],.35);
      leke(m[0],m[1]+4,26,10,[0,0,0],.6);
      for(const q of g.cukur){const p=g.don(q[0],q[1]); leke(p[0],p[1],q[2],q[2]*.7,[0,0,0],.3); leke(p[0]-1,p[1]-1,q[2]*.6,q[2]*.4,[200,190,170],.15);}
      tara(-40,-30,40,2,.5,3,[10,8,6],.25,g.t,.7);
      c.restore();
      hat(y,[8,7,6],.85,1,g.t,2,.7);
      // ağız: yandan bakınca ince elips, içi kapkara
      const a=g.don(21.8,0);
      dolgu(()=>{c.ellipse(a[0],a[1],1.6,5.6,.26*g.yon,0,TAU);},[6,5,4],1);
      serit(()=>{c.ellipse(a[0],a[1],1.6,5.6,.26*g.yon,0,TAU);},[150,136,110],.5,.6);
      // kulp: boyundan omuza kavis
      const b0=g.don(12,-4), b1=g.don(6,-17), b2=g.don(-4,-13);
      serit(()=>{c.moveTo(b0[0],b0[1]); c.bezierCurveTo(b1[0]+g.yon*4,b1[1]-4,b2[0],b2[1]-8,b2[0],b2[1]);},[30,26,22],1,2.2);
      serit(()=>{c.moveTo(b0[0],b0[1]); c.bezierCurveTo(b1[0]+g.yon*4,b1[1]-4,b2[0],b2[1]-8,b2[0],b2[1]);},[150,136,110],.35,.7);
    }
  },
  renk(k,g){
    if(g.lamba) return;
    k.dik(); dolgu(yolN(g.n),RENK.bakir,.4);
  }
};
