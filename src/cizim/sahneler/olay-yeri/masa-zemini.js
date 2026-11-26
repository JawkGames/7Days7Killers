// Fotoğrafın durduğu masa: koyu tahta, tek masa lambasının ışığı üst soldan. k: hedef bağlam, (w,h) bağlam biriminde.
import {c,hedefAyarla} from '../../teknik/tuval.js';
import {leke,tara} from '../../teknik/firca.js';
import {rng} from '../../../cekirdek/rastgele.js';

export function masaZemini(k,w,h,tohum=1){
  const eski=c, r=rng(tohum*3+1); hedefAyarla(k);
  try{
    k.save();
    const g=k.createLinearGradient(0,0,w,h); g.addColorStop(0,'#1d1610'); g.addColorStop(1,'#070605');
    k.fillStyle=g; k.fillRect(0,0,w,h);
    const s=Math.max(w,h);
    // tahta damarları ve aralıklar
    for(let i=0;i<Math.ceil(w/(s*.16))+1;i++){const x=i*s*.16+r()*8; k.strokeStyle='rgba(0,0,0,.55)'; k.lineWidth=2; k.beginPath(); k.moveTo(x,0); k.lineTo(x+s*.02,h); k.stroke();}
    tara(0,0,w,h,Math.PI/2+.02,5,[0,0,0],.35,tohum+7,1);
    tara(0,0,w,h,Math.PI/2-.01,11,[120,96,64],.06,tohum+8,1);
    leke(w*.3,h*.25,s*.55,s*.45,[176,140,84],.2);
    leke(w*.92,h*.95,s*.5,s*.4,[0,0,0],.75);
    leke(w*.02,h*.9,s*.35,s*.35,[0,0,0],.5);
    k.restore();
  }finally{hedefAyarla(eski);}
}
