// Un izi: delik bir çuvaldan dökülerek giden damla izi ve sonunda küçük bir yığıntı. Toz biraz çevreye savrulmuş.
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu} from '../kalem.js';

export default {
  tur:'un', duzlemler:['zemin','ust'], serbestAci:true,
  kapsam:()=>({r:30}),
  kur(p,r){
    const damla=[]; let x=-30, y=0, a=(r()-.5)*.4;
    while(x<26){a+=(r()-.5)*.25; x+=1.5+r()*7; y+=Math.sin(a)*3; damla.push([x,y+(r()-.5)*3,.4+r()*1.4*(x+30)/56,r()*3]); if(r()<.3) damla.push([x+r()*2,y+(r()-.5)*6,.3+r()*.4,r()*3]);}
    const toz=Array.from({length:40},()=>[(r()-.5)*70,(r()-.5)*22,.2+r()*.5]);
    return {damla,toz,yigin:[x+3,y]};
  },
  ciz(k,g){
    const acik=k.yuzey!=='un';
    const renk=[188,184,168];
    k.duzlem();
    for(const q of g.toz) dolgu(()=>{c.moveTo(q[0]+q[2],q[1]); c.arc(q[0],q[1],q[2],0,TAU);},renk,acik?.25:.12);
    for(const q of g.damla){
      leke(q[0],q[1],q[2]*2.6,q[2]*2,renk,acik?.3:.15);
      dolgu(()=>{c.ellipse(q[0],q[1],q[2]*(1.1+q[3]*.3),q[2]*(.7+q[3]*.1),q[3],0,TAU);},renk,acik?.7:.4);
    }
    // yığıntı: küçük tümsek, ışığın tersinde gölgesi
    const [yx,yy]=g.yigin;
    leke(yx+k.golgeYon[0]*3,yy+k.golgeYon[1]*3,7,5,[0,0,0],.45);
    leke(yx,yy,8,6,renk,acik?.55:.3);
    k.duzlem(1.2); leke(yx-k.golgeYon[0]*1.2,yy-k.golgeYon[1]*1.2,4,3,[220,216,200],acik?.6:.35);
  }
};
