// Yerde alet. p.cesit: 'cekic' | 'orak' | 'kama' (boynuz saplı) | 'makas' (terzi makası)
// Önce yan yüz (kalınlık) koyu, sonra üst yüz çizilir: alet yere yatmış görünür.
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu,serit,hat} from '../kalem.js';

const AHSAP=[92,84,70], DEMIR=[58,60,58], BOYNUZ=[52,46,40], CELIK=[104,106,102], MUREKKEP=[8,8,9];

const SEKIL={
  cekic:{r:20, kalin:2.6, parca:[
    {yol(){c.moveTo(-17,-1.1); c.quadraticCurveTo(-18.4,0,-17,1.3); c.lineTo(12.6,1.05); c.lineTo(12.6,-.95); c.closePath();}, renk:AHSAP, damar:true},
    {yol(){c.moveTo(12.2,-6.2); c.lineTo(16.2,-5.8); c.lineTo(16.4,4.6); c.lineTo(15.4,5.6); c.lineTo(12.4,5.4); c.closePath();}, renk:DEMIR, metal:true, h:1}
  ]},
  orak:{r:20, kalin:1.6, parca:[
    {yol(){c.moveTo(-17,-1.3); c.quadraticCurveTo(-18.2,0,-17,1.5); c.lineTo(-4.6,1.3); c.lineTo(-4.6,-1.2); c.closePath();}, renk:AHSAP, damar:true, h:.8},
    {yol(){c.moveTo(-4.8,-.7); c.bezierCurveTo(2,-1.5,14,-4,14.6,-14); c.bezierCurveTo(15,-21,7,-23.4,2.4,-21); c.bezierCurveTo(8.8,-20.2,11.4,-16,10.6,-11.4); c.bezierCurveTo(9.6,-5,2,-2.4,-4.6,1.2); c.closePath();}, renk:DEMIR, metal:true, dis:true}
  ]},
  kama:{r:18, kalin:1.5, parca:[
    {yol(){c.moveTo(-12,-1.1); c.quadraticCurveTo(-13.2,.2,-12,1.6); c.quadraticCurveTo(-6,1.9,-.6,1.4); c.lineTo(-.6,-1.3); c.quadraticCurveTo(-6,-1.9,-12,-1.1); c.closePath();}, renk:BOYNUZ, boynuz:true, h:.6},
    {yol(){c.moveTo(-.9,-2.6); c.lineTo(.5,-2.6); c.lineTo(.5,2.7); c.lineTo(-.9,2.7); c.closePath();}, renk:DEMIR, h:.9},
    {yol(){c.moveTo(.5,-1.6); c.quadraticCurveTo(12,-1.4,21,0); c.quadraticCurveTo(12,1.5,.5,1.7); c.closePath();}, renk:CELIK, metal:true, sirt:true}
  ]},
  makas:{r:18, kalin:1.1, parca:[
    {yol(){c.moveTo(0,-.4); c.lineTo(15.5,-2.9); c.lineTo(15.8,-2.2); c.lineTo(0,.9); c.closePath();}, renk:CELIK, metal:true},
    {yol(){c.moveTo(0,.4); c.lineTo(15,2.9); c.lineTo(14.7,3.6); c.lineTo(0,-.9); c.closePath();}, renk:CELIK, metal:true, h:.5},
    {yol(){c.moveTo(0,-.6); c.lineTo(-5.5,-1.8); c.ellipse(-8,-2.4,2.6,1.9,.2,-.3,TAU-.6); c.lineTo(-5.4,-.6); c.closePath(); c.moveTo(-6.4,-2.3); c.ellipse(-8,-2.4,1.4,.9,.2,0,TAU,true);}, renk:CELIK, metal:true, oyuk:true},
    {yol(){c.moveTo(0,.6); c.lineTo(-5.6,2); c.ellipse(-9.6,3,4.2,2.4,-.15,-.5,TAU-.9); c.lineTo(-5.4,.7); c.closePath(); c.moveTo(-7.2,3); c.ellipse(-9.6,3,2.8,1.3,-.15,0,TAU,true);}, renk:CELIK, metal:true, oyuk:true, h:.5}
  ]}
};

export default {
  tur:'alet', duzlemler:['zemin','ust'], serbestAci:true,
  kapsam:(p)=>({r:(SEKIL[p.cesit]||SEKIL.cekic).r}),
  kur(p,r){return {S:SEKIL[p.cesit]||SEKIL.cekic, tohum:r()*1e5|0, pas:Array.from({length:5},()=>[r()*28-14,(r()-.5)*4,.6+r()*1.4])};},
  ciz(k,g){
    const S=g.S, H=S.kalin;
    k.temas(0,0,S.r*.85,S.r*.32,.55,.35);
    for(const p of S.parca){
      const h=H+(p.h||0);
      // yan yüz: düzlem üstünde 0..h arasında koyu gövde
      for(let s=0;s<=h;s+=Math.max(.35,h/5)){k.duzlem(s); dolgu(p.yol,[14,13,12],.9);}
      k.duzlem(h);
      dolgu(p.yol,p.renk,1);
      c.save(); c.beginPath(); p.yol(); c.clip('evenodd');
      if(p.damar) for(let i=0;i<4;i++) serit(()=>{c.moveTo(-18,-.8+i*.55); c.lineTo(13,-.6+i*.5);},[40,34,26],.35,.35);
      if(p.boynuz) for(let i=0;i<3;i++) serit(()=>{c.moveTo(-12,-.6+i*.6); c.quadraticCurveTo(-6,-.2+i*.5,-1,-.4+i*.6);},[120,110,96],.28,.4);
      if(p.metal){ // ışığı yakalayan kenar ve pas lekeleri
        c.translate(-k.golgeYon[0]*.7,-k.golgeYon[1]*.7); dolgu(p.yol,[150,152,146],.22); c.translate(k.golgeYon[0]*.7,k.golgeYon[1]*.7);
        for(const q of g.pas) leke(q[0],q[1],q[2],q[2]*.7,[30,24,18],.35);
      }
      if(p.sirt) serit(()=>{c.moveTo(1,0); c.lineTo(19,0);},[170,172,166],.4,.5);
      c.restore();
      hat(p.yol,MUREKKEP,.7,.9,g.tohum+h*10|0,2,.7);
      if(p.dis) serit(()=>{c.moveTo(2.4,-21); c.bezierCurveTo(8.8,-20.2,11.4,-16,10.6,-11.4); c.bezierCurveTo(9.6,-5,2,-2.4,-4.6,1.2);},[176,176,168],.45,.45);
    }
    if(S===SEKIL.makas){k.duzlem(H+.5); dolgu(()=>{c.moveTo(.9,0); c.arc(0,0,.9,0,TAU);},[30,30,30],1); dolgu(()=>{c.moveTo(.35,-.2); c.arc(-.1,-.2,.35,0,TAU);},[170,170,160],.6);}
  }
};
