// Kan lekesi: abartısız, koyu. Toprak emer (kenarı dağınık, mat), taş ve tahtada kuruyup kabuk bağlar (kenarı keskin, hafif parlak).
// p.buyukluk: 'kucuk' | 'orta' (varsayılan) | 'buyuk'
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {RENK} from '../ayar.js';
import {dolgu} from '../kalem.js';

const BOY={kucuk:7, orta:13, buyuk:20};

function bicim(R,r){ // loblu, düzensiz kenar
  const n=40, f=[r()*TAU,r()*TAU,r()*TAU], a=[.16+r()*.1,.08+r()*.06,.05];
  return Array.from({length:n},(_,i)=>{const t=i/n*TAU, w=1+a[0]*Math.sin(2*t+f[0])+a[1]*Math.sin(3*t+f[1])+a[2]*Math.sin(7*t+f[2]); return [Math.cos(t)*R*w*1.25,Math.sin(t)*R*w*.85];});
}
const yolN=n=>()=>{n.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath();};

export default {
  tur:'kan', duzlemler:['zemin','ust','arka','sol','sag'], serbestAci:true,
  kapsam:(p)=>({r:(BOY[p.buyukluk]||BOY.orta)*1.4}),
  kur(p,r){
    const R=BOY[p.buyukluk]||BOY.orta, ana=bicim(R,r), ic=bicim(R*.6,r);
    const damla=[]; const yon=r()*TAU;
    for(let i=0;i<4+r()*4;i++){const a=yon+(r()-.5)*1.1, u=R*(1.5+r()*1.4); damla.push([Math.cos(a)*u,Math.sin(a)*u,.4+r()*1.1,a]);}
    return {R,ana,ic,damla};
  },
  ciz(k,g){
    const emer=k.yuzey==='toprak'||k.yuzey==='camur'||k.yuzey==='un';
    k.duzlem();
    if(emer){
      leke(0,0,g.R*1.5,g.R*1.15,[0,0,0],.32); // toprağa yayılan ıslaklık
      dolgu(yolN(g.ana),[14,10,9],.72);
      c.save(); c.beginPath(); yolN(g.ana)(); c.clip(); leke(0,0,g.R*.9,g.R*.7,[0,0,0],.6); c.restore();
    }else{
      dolgu(yolN(g.ana),[10,7,6],.95);
      dolgu(yolN(g.ic),[4,3,3],.8);
      c.save(); c.beginPath(); yolN(g.ana)(); c.clip();
      leke(-k.golgeYon[0]*g.R*.4,-k.golgeYon[1]*g.R*.4,g.R*.5,g.R*.16,[170,160,150],.14,.4);
      c.restore();
    }
    for(const d of g.damla){ // yöne doğru uzamış damlalar
      c.save(); c.translate(d[0],d[1]); c.rotate(d[3]);
      dolgu(()=>{c.ellipse(0,0,d[2]*1.6,d[2],0,0,TAU);},[10,7,6],.8); c.restore();
    }
  },
  renk(k,g){k.duzlem(); dolgu(yolN(g.ana),RENK.kan,.12); for(const d of g.damla) dolgu(()=>{c.moveTo(d[0]+d[2],d[1]); c.arc(d[0],d[1],d[2],0,TAU);},RENK.kan,.18);}
};
