// Yerde yün ip parçası. p.renk: 'kirmizi' | 'lacivert' | 'yesil' | 'sari' | 'kahve' | 'beyaz' | 'mor' (ya da [r,g,b])
import {RENK} from '../ayar.js';
import {serit} from '../kalem.js';
import {c} from '../../../teknik/tuval.js';

const yolKur=(g)=>()=>g.n.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));

export default {
  tur:'ip', duzlemler:['zemin','ust'], serbestAci:true,
  kapsam:()=>({r:11}),
  kur(p,r){
    const L=15+r()*10, n=[]; let x=0, y=0, a=r()*6.3, da=0;
    for(let s=0;s<L;s+=.7){n.push([x,y]); da+=(r()-.5)*.5; da*=.86; a+=da; x+=Math.cos(a)*.7; y+=Math.sin(a)*.7;}
    const mx=n.reduce((s,q)=>s+q[0],0)/n.length, my=n.reduce((s,q)=>s+q[1],0)/n.length;
    n.forEach(q=>{q[0]-=mx; q[1]-=my;});
    // uçlardan ve gövdeden kopmuş kıl
    const kil=[]; for(let i=0;i<9;i++){const q=n[r()*n.length|0], b=r()*6.3, u=.4+r()*1.1; kil.push([q[0],q[1],q[0]+Math.cos(b)*u,q[1]+Math.sin(b)*u]);}
    return {n,kil};
  },
  ciz(k,g){
    const w=k.olcek;
    k.temas(0,0,9,9,.35,.2);
    k.duzlem(); c.translate(k.golgeYon[0]*.45,k.golgeYon[1]*.45);
    serit(yolKur(g),[0,0,0],.55,1.05*w);
    k.duzlem();
    serit(yolKur(g),[96,92,86],1,.72*w);
    // büküm: kısa çapraz çentikler
    serit(()=>{for(let i=1;i<g.n.length-1;i+=1){const a=g.n[i-1], b=g.n[i+1], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1, q=g.n[i]; c.moveTo(q[0]-dy/l*.3+dx/l*.15,q[1]+dx/l*.3+dy/l*.15); c.lineTo(q[0]+dy/l*.3-dx/l*.15,q[1]-dx/l*.3-dy/l*.15);}},[40,36,34],.55,.35*w);
    serit(yolKur(g),[150,146,136],.35,.22*w); // ışık alan sırt
    serit(()=>g.kil.forEach(q=>{c.moveTo(q[0],q[1]); c.lineTo(q[2],q[3]);}),[110,106,98],.5,.16*w);
  },
  renk(k,g,p){
    const renk=Array.isArray(p.renk)?p.renk:(RENK[p.renk]||RENK.kirmizi);
    k.duzlem(); serit(yolKur(g),renk,.42,.8*k.olcek);
    serit(()=>g.kil.forEach(q=>{c.moveTo(q[0],q[1]); c.lineTo(q[2],q[3]);}),renk,.6,.2*k.olcek);
  }
};
