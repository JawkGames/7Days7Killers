// Un izi: delik bir çuvaldan sürüklenerek dökülen ince, kesiksiz bir sızıntı; sonunda küçük bir yığıntı.
// Sızıntı yer yer incelir, bir iki yerde kopar; kenarına toz savrulmuş, üstünde küçük topaklar var.
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu} from '../kalem.js';

export default {
  tur:'un', duzlemler:['zemin','ust'], serbestAci:true,
  kapsam:()=>({r:30}),
  kur(p,r){
    // orta hat: yavaş kıvrılan yol, 1.5 cm adımla; genişlik akış hızına göre (sona doğru çuval durur, yığılır)
    const yol=[]; let x=-30, y=0, a=(r()-.5)*.4, w=.5+r()*.3;
    while(x<26){a+=(r()-.5)*.18; a*=.92; x+=1.5; y+=Math.sin(a)*1.5; w=Math.max(.25,Math.min(1.6,w+(r()-.5)*.35+.012)); yol.push([x,y,w,r()<.035]);}
    const topak=Array.from({length:16},()=>{const q=yol[(r()*yol.length)|0]; return [q[0]+(r()-.5)*2,q[1]+(r()-.5)*2.4,.3+r()*.5,r()*3];});
    const toz=Array.from({length:46},()=>{const q=yol[(r()*yol.length)|0]; return [q[0]+(r()-.5)*14,q[1]+(r()-.5)*9,.15+r()*.35];});
    const s=yol[yol.length-1];
    return {yol,topak,toz,yigin:[s[0]+3,s[1]]};
  },
  ciz(k,g){
    const acik=k.yuzey!=='un', renk=[196,192,176], A=acik?1:.55;
    k.duzlem();
    // savrulmuş toz: yolun çevresinde soluk bulut
    for(let i=0;i<g.yol.length;i+=4){const q=g.yol[i]; leke(q[0],q[1],3+q[2]*3,2.2+q[2]*2,renk,.12*A);}
    for(const q of g.toz) dolgu(()=>{c.moveTo(q[0]+q[2],q[1]); c.arc(q[0],q[1],q[2],0,TAU);},renk,.3*A);
    // sızıntı: kesiksiz şerit, genişliği değişir; kopma yerlerinde atlar
    c.lineCap='round'; c.lineJoin='round';
    const M=c.getTransform(), px=Math.hypot(M.a,M.b); // 1 cm kaç aygıt pikseli: toz kenarı bulanık
    c.filter=`blur(${Math.max(.4,px*.7).toFixed(2)}px)`;
    for(let i=1;i<g.yol.length;i+=2){const p=g.yol[i-1], q=g.yol[Math.min(g.yol.length-1,i+1)]; c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]); c.strokeStyle=`rgba(${renk},${(.35*A).toFixed(3)})`; c.lineWidth=(p[2]+q[2])*2.2; c.stroke();}
    c.filter='none';
    for(let i=1;i<g.yol.length;i++){
      const p=g.yol[i-1], q=g.yol[i]; if(q[3]) continue;
      c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(q[0],q[1]);
      c.strokeStyle=`rgba(${renk},${(.62*A).toFixed(3)})`; c.lineWidth=(p[2]+q[2])*.9; c.stroke();
    }
    // ortada parlak çekirdek: unun kabarık sırtı ışığı alır
    for(let i=1;i<g.yol.length;i++){
      const p=g.yol[i-1], q=g.yol[i]; if(q[3]) continue;
      c.beginPath(); c.moveTo(p[0]-k.golgeYon[0]*.15,p[1]-k.golgeYon[1]*.15); c.lineTo(q[0]-k.golgeYon[0]*.15,q[1]-k.golgeYon[1]*.15);
      c.strokeStyle=`rgba(236,232,218,${(.3*A).toFixed(3)})`; c.lineWidth=(p[2]+q[2])*.35; c.stroke();
    }
    for(const q of g.topak){
      dolgu(()=>{c.ellipse(q[0]+k.golgeYon[0]*.3,q[1]+k.golgeYon[1]*.3,q[2]*1.2,q[2]*.8,q[3],0,TAU);},[0,0,0],.25*A);
      dolgu(()=>{c.ellipse(q[0],q[1],q[2]*1.2,q[2]*.8,q[3],0,TAU);},[214,210,196],.8*A);
    }
    // yığıntı: küçük tümsek, ışığın tersinde gölgesi
    const [yx,yy]=g.yigin;
    leke(yx+k.golgeYon[0]*3,yy+k.golgeYon[1]*3,7,5,[0,0,0],.45);
    leke(yx,yy,8,6,renk,acik?.6:.32);
    k.duzlem(1.2); leke(yx-k.golgeYon[0]*1.2,yy-k.golgeYon[1]*1.2,4,3,[226,222,208],acik?.65:.38);
  }
};
