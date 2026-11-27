// Düşmüş küçük eşya. p.cesit: 'dugme' | 'tespih' | 'cakmak' (fitilli pirinç çakmak) | 'tabaka' (tütün tabakası)
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {RENK} from '../ayar.js';
import {dolgu,serit,hat} from '../kalem.js';

const KAPSAM={dugme:10, tespih:12, cakmak:10, tabaka:10};
// Küçük ışık parıltısı: metal ya da cilalı yüzeyde göz alan tek nokta (dikkatli bakan bulsun diye)
const parilti=(x,y,r)=>{leke(x,y,r*3,r*2.4,[255,250,226],.35); dolgu(()=>{c.moveTo(x+r,y); c.arc(x,y,r,0,TAU);},[250,244,220],.85);};
const yuvarlakDortgen=(x,y,w,h,r)=>()=>{c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();};

export default {
  tur:'esya', duzlemler:['zemin','ust'], serbestAci:true,
  kapsam:(p)=>({r:KAPSAM[p.cesit]||9}),
  kur(p,r){
    const g={cesit:KAPSAM[p.cesit]?p.cesit:'dugme', t:r()*1e5|0};
    if(g.cesit==='tespih'){ // gevşek, kendi üstüne düşmüş bir halka; imame ve püskül
      const n=33, taneler=[];
      const rx=5.5+r()*1.5, ry=3+r()*1.5, b=r()*.8;
      for(let i=0;i<n;i++){const a=i/n*TAU; const w=1+Math.sin(a*2+b)*.18+(r()-.5)*.05; taneler.push([Math.cos(a)*rx*w,Math.sin(a)*ry*w+Math.sin(a*3)*.6]);}
      g.taneler=taneler; g.puskul=Array.from({length:9},()=>[(r()-.5)*1.6,r()*.5]);
    }
    return g;
  },
  ciz(k,g){
    const C=g.cesit;
    if(C==='dugme'){ // kemik düğme: gerçeğinden biraz büyük, açık yüzlü; ışığa bakan kenarda parıltı, öbür yanda gölge
      const R0=1.55, gy=k.golgeYon;
      k.temas(gy[0]*.5,gy[1]*.5,2.3,2.1,.85,.35);
      k.duzlem(.35);
      dolgu(()=>{c.moveTo(R0,0); c.arc(0,0,R0,0,TAU);},[96,88,72],1);
      dolgu(()=>{c.moveTo(R0*.72,0); c.arc(0,0,R0*.72,0,TAU);},[70,64,52],1); // çukur orta
      leke(-gy[0]*R0*.5,-gy[1]*R0*.5,R0*.7,R0*.5,[236,226,196],.55);          // ışık yanı
      serit(()=>{c.arc(0,0,R0,0,TAU);},[20,18,14],.8,.6);
      for(const[x,y]of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]) dolgu(()=>{c.moveTo(x+.2,y); c.arc(x,y,.2,0,TAU);},[4,4,4],1);
      serit(()=>{c.moveTo(.4,.4); c.quadraticCurveTo(1.9,1.4,3.1,1);},[150,144,124],.7,.5); // kopuk iplik
      parilti(-gy[0]*R0*.55,-gy[1]*R0*.55,.35);
    }else if(C==='tespih'){
      k.temas(0,0,8.5,5.5,.6,.2); k.duzlem(.4);
      serit(()=>g.taneler.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])),[30,28,24],.7,.4);
      for(const q of g.taneler){
        dolgu(()=>{c.moveTo(q[0]+.68,q[1]); c.arc(q[0],q[1],.68,0,TAU);},[104,84,58],1);
        dolgu(()=>{c.moveTo(q[0]-.1,q[1]-.2); c.arc(q[0]-.22,q[1]-.22,.22,0,TAU);},[214,198,158],.75);
      }
      const s=g.taneler[0]; // imame ve püskül
      dolgu(()=>{c.ellipse(s[0]+1.7,s[1]+.2,1.5,.65,0,0,TAU);},[54,44,32],1); parilti(s[0]+1.2,s[1]-.1,.3);
      serit(()=>g.puskul.forEach(q=>{c.moveTo(s[0]+2.8,s[1]+.2); c.lineTo(s[0]+5.4,s[1]+q[0]*1.4+q[1]);}),[70,64,54],.8,.35);
    }else if(C==='cakmak'){
      k.temas(0,0,4.4,3.2,.85,.3);
      const d=h=>{k.duzlem(h); c.scale(1.22,1.22);}; // gerçeğinden biraz büyük: bu ölçekte seçilsin
      for(let h=0;h<1.2;h+=.3){d(h); dolgu(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),[16,15,13],1);}
      d(1.2);
      dolgu(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),[108,98,74],1);
      leke(-1,-.6,2.4,1.2,[230,214,160],.5); leke(1.4,1,2.2,1.4,[0,0,0],.35);
      serit(()=>{c.moveTo(.9,-1.7); c.lineTo(.9,1.7);},[20,18,14],.7,.35);
      dolgu(()=>{c.moveTo(3.4,0); c.arc(2.9,0,.55,0,TAU);},[60,56,48],1); // tekerlek
      serit(()=>{c.moveTo(-2.6,.4); c.bezierCurveTo(-4.5,.8,-5.2,2.6,-7.8,2.2);},[30,26,20],.9,.8); // fitil
      hat(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),[8,8,8],.8,.7,g.t,2,.3);
      parilti(-1.4,-.9,.35);
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
    if(g.cesit==='tespih'){k.duzlem(.4); for(const q of g.taneler) dolgu(()=>{c.moveTo(q[0]+.68,q[1]); c.arc(q[0],q[1],.68,0,TAU);},RENK.kehribar,.45);}
    if(g.cesit==='cakmak'){k.duzlem(1.2); c.scale(1.22,1.22); dolgu(yuvarlakDortgen(-2.6,-1.7,5.2,3.4,.6),RENK.sari,.25);}
  }
};
