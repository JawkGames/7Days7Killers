// Duvarda boş çivi; çevresinde uzun süre asılı kalmış bir şeyin soluk izi (is ve toz o şeklin dışında birikmiş).
// p.sekil: 'cekic' | 'orak' | 'masa' (maşa) | 'cerceve' | 'tufek' | 'yok' (yalnızca çivi)
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu,serit} from '../kalem.js';

// çivi (0,0); şekil çivinin altında asılı dururdu. Ölçüler cm, y aşağı.
const IZ={
  cekic:{r:20, yol(){c.moveTo(-6.5,-1.2); c.lineTo(5.5,-1.2); c.lineTo(5.6,2.4); c.lineTo(1.4,2.6); c.lineTo(1.4,31); c.quadraticCurveTo(0,32.4,-1.4,31); c.lineTo(-1.4,2.6); c.lineTo(-6.4,2.4); c.closePath();}},
  orak:{r:22, yol(){c.moveTo(-1,-1); c.bezierCurveTo(-14,-1,-17,16,-6,22); c.bezierCurveTo(-12,14,-9,3,0,2.2); c.lineTo(1.4,2.4); c.lineTo(1.6,34); c.quadraticCurveTo(0,35.4,-1.4,34); c.lineTo(-1.2,2.4); c.closePath();}},
  masa:{r:26, yol(){c.moveTo(-1.6,-1.6); c.arc(0,0,2,Math.PI,0); c.lineTo(3.4,44); c.lineTo(2.2,44); c.lineTo(.6,3); c.lineTo(-.6,3); c.lineTo(-2.2,44); c.lineTo(-3.4,44); c.closePath();}},
  cerceve:{r:22, yol(){c.moveTo(-12,5); c.lineTo(12,5); c.lineTo(12,36); c.lineTo(-12,36); c.closePath();}, ip:true},
  tufek:{r:38, yol(){c.moveTo(-2,-1); c.lineTo(2,-1); c.lineTo(1.6,52); c.lineTo(4.6,58); c.lineTo(5.6,72); c.lineTo(-1.8,72); c.lineTo(-2.6,58); c.lineTo(-1.4,52); c.closePath();}},
  yok:{r:6, yol(){}}
};

export default {
  tur:'civi', duzlemler:['arka','sol','sag'], aciSapma:.04,
  kapsam:(p)=>{const S=IZ[p.sekil]||IZ.cekic; return {r:S.r, dy:S===IZ.yok?0:S.r*.7};},
  kur(p,r){return {S:IZ[p.sekil]||IZ.cekic, t:r()*1e5|0};},
  ciz(k,g){
    const S=g.S, gx=k.golgeYon[0], gy=k.golgeYon[1];
    k.duzlem();
    if(S!==IZ.yok){
      // şeklin çevresi isli, içi temiz kalmış: önce çevre koyulaşır, sonra şekil açık ve kenarı yumuşak
      leke(0,S.r*.7,S.r*1.15,S.r*1.35,[6,6,5],.32);
      c.save(); c.beginPath(); c.rect(-200,-200,400,400); S.yol(); c.clip('evenodd'); leke(0,S.r*.7,S.r*.7,S.r*1.0,[0,0,0],.18); c.restore();
      for(let i=3;i>=0;i--){c.save(); c.lineJoin='round'; c.beginPath(); S.yol(); c.fillStyle=`rgba(150,146,126,${i?.05:.13})`; c.fill(); if(i){c.lineWidth=i*1.1; c.strokeStyle='rgba(150,146,126,.05)'; c.stroke();} c.restore();}
      if(S.ip) serit(()=>{c.moveTo(-9,5); c.lineTo(0,0); c.lineTo(9,5);},[140,136,116],.16,.8);
    }
    // çivinin duvara düşen gölgesi ve kendisi (hafifçe dışarı çıkmış, aşağı eğik)
    serit(()=>{c.moveTo(0,0); c.lineTo(gx*3.2,gy*3.2+.6);},[0,0,0],.45,1.6);
    serit(()=>{c.moveTo(0,0); c.lineTo(-.4,1.4);},[30,30,28],1,1.5);
    dolgu(()=>{c.moveTo(.75,-.5); c.arc(-.4,1.4,.8,0,TAU);},[44,44,40],1);
    dolgu(()=>{c.moveTo(.1,1); c.arc(-.6,1.1,.3,0,TAU);},[150,148,136],.6);
  }
};
