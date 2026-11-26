// Düşmüş küçük eşya. p.cesit: 'dugme' | 'tespih' | 'cakmak' (fitilli pirinç çakmak) | 'tabaka' (tütün tabakası)
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {RENK} from '../ayar.js';
import {dolgu,serit,hat} from '../kalem.js';

const KAPSAM={dugme:9, tespih:11, cakmak:9, tabaka:10};
const yuvarlakDortgen=(x,y,w,h,r)=>()=>{c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();};

export default {
  tur:'esya', duzlemler:['zemin','ust'], serbestAci:true,
  kapsam:(p)=>({r:KAPSAM[p.cesit]||9}),
  kur(p,r){
    const g={cesit:KAPSAM[p.cesit]?p.cesit:'dugme', t:r()*1e5|0};
    if(g.cesit==='tespih'){ // gevşek, kendi üstüne düşmüş bir halka; imame ve püskül
      const n=33, taneler=[]; let a=0;
      const rx=5.5+r()*1.5, ry=3+r()*1.5, b=r()*.8;
      for(let i=0;i<n;i++){a=i/n*TAU; const w=1+Math.sin(a*2+b)*.18+(r()-.5)*.05; taneler.push([Math.cos(a)*rx*w,Math.sin(a)*ry*w+Math.sin(a*3)*.6]);}
      g.taneler=taneler; g.puskul=Array.from({length:9},()=>[(r()-.5)*1.6,r()*.5]);
    }
    return g;
  },
  ciz(k,g){
    const C=g.cesit;
    if(C==='dugme'){
      k.temas(0,0,1.6,1.6,.7,.3); k.duzlem(.3);
      dolgu(()=>{c.moveTo(1.2,0); c.arc(0,0,1.2,0,TAU);},[44,40,34],1);
      serit(()=>{c.arc(0,0,1.2,0,TAU);},[130,124,108],.5,.5);
      for(const[x,y]of[[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]]) dolgu(()=>{c.moveTo(x+.17,y); c.arc(x,y,.17,0,TAU);},[4,4,4],1);
      serit(()=>{c.moveTo(.35,.35); c.quadraticCurveTo(1.6,1.2,2.6,.9);},[120,116,100],.6,.4); // kopuk iplik
    }else if(C==='tespih'){
      k.temas(0,0,8,5,.45,.2); k.duzlem(.4);
      serit(()=>g.taneler.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])),[30,28,24],.7,.4);
      for(const q of g.taneler){
        dolgu(()=>{c.moveTo(q[0]+.55,q[1]); c.arc(q[0],q[1],.55,0,TAU);},[60,48,34],1);
        dolgu(()=>{c.moveTo(q[0]-.1,q[1]-.18); c.arc(q[0]-.2,q[1]-.2,.18,0,TAU);},[190,176,140],.6);
      }
      const s=g.taneler[0]; // imame ve püskül
      dolgu(()=>{c.ellipse(s[0]+1.6,s[1]+.2,1.3,.55,0,0,TAU);},[54,44,32],1);
      serit(()=>g.puskul.forEach(q=>{c.moveTo(s[0]+2.8,s[1]+.2); c.lineTo(s[0]+5.4,s[1]+q[0]*1.4+q[1]);}),[70,64,54],.8,.35);
    }else if(C==='cakmak'){
      k.temas(0,0,3.4,2.4,.7,.3);
      for(let h=0;h<1.2;h+=.3){k.duzlem(h); dolgu(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),[16,15,13],1);}
      k.duzlem(1.2);
      dolgu(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),[108,98,74],1);
      leke(-1,-.6,2.4,1.2,[210,196,150],.3); leke(1.4,1,2.2,1.4,[0,0,0],.3);
      serit(()=>{c.moveTo(.9,-1.7); c.lineTo(.9,1.7);},[20,18,14],.7,.35);
      dolgu(()=>{c.moveTo(3.4,0); c.arc(2.9,0,.55,0,TAU);},[60,56,48],1); // tekerlek
      serit(()=>{c.moveTo(-2.6,.4); c.bezierCurveTo(-4.5,.8,-5.2,2.6,-7.8,2.2);},[30,26,20],.9,.8); // fitil
      hat(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),[8,8,8],.7,.6,g.t,2,.3);
    }else{
      k.temas(0,0,5.6,4.6,.7,.3);
      for(let h=0;h<1.4;h+=.35){k.duzlem(h); dolgu(yuvarlakDortgen(-4.5,-3.6,9,7.2,.9),[16,15,13],1);}
      k.duzlem(1.4);
      dolgu(yuvarlakDortgen(-4.5,-3.6,9,7.2,.9),[112,110,100],1);
      leke(-1.8,-1.4,4,2.6,[220,218,204],.3); leke(2.4,2,4.6,3,[0,0,0],.35);
      serit(yuvarlakDortgen(-3.7,-2.8,7.4,5.6,.6),[30,30,26],.5,.4);
      serit(()=>{for(let i=0;i<5;i++){const a=i/5*TAU; c.moveTo(0,0); c.quadraticCurveTo(Math.cos(a)*1.6+.6,Math.sin(a)*1.6,Math.cos(a+.6)*2.2,Math.sin(a+.6)*1.7);}},[34,32,28],.5,.35); // kazıma süs
      hat(yuvarlakDortgen(-4.5,-3.6,9,7.2,.9),[8,8,8],.75,.7,g.t,2,.3);
      // aralıktan dökülen tütün kırıntısı
      k.duzlem(); for(let i=0;i<14;i++){const x=4.6+((g.t>>i)&7)*.45, y=-2+((g.t>>(i+3))&7)*.6; serit(()=>{c.moveTo(x,y); c.lineTo(x+.6,y+.2);},[40,32,22],.8,.5);}
    }
  },
  renk(k,g){
    if(g.cesit==='tespih'){k.duzlem(.4); for(const q of g.taneler) dolgu(()=>{c.moveTo(q[0]+.55,q[1]); c.arc(q[0],q[1],.55,0,TAU);},RENK.kehribar,.45);}
    if(g.cesit==='cakmak'){k.duzlem(1.2); dolgu(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),RENK.sari,.25);}
  }
};
