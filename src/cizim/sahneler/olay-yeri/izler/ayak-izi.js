// Ayak izi. p.cesit: 'cizme' (nallı asker çizmesi) | 'carik' | 'ayak' (çıplak); p.sayi: 1-4 adım.
// Yüzeye göre: çamur ve toprakta çukur, unda koyu baskı, taşta ve tahtada soluk çamur lekesi.
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu,serit} from '../kalem.js';

// Taban çizgileri: burun -y yönünde, topuk +y. Ölçüler cm.
const TABAN={
  cizme:{boy:29, yol(){c.moveTo(0,-14.5); c.bezierCurveTo(4.6,-14.4,5.6,-8,5.3,-3); c.bezierCurveTo(5,1,4.1,3.2,3.9,4.6); c.lineTo(-3.4,4.6); c.bezierCurveTo(-3.8,2,-5.1,-2,-4.9,-6.5); c.bezierCurveTo(-4.6,-12,-3.2,-14.6,0,-14.5); c.closePath();
    c.moveTo(-3.6,7.2); c.lineTo(3.9,7.2); c.bezierCurveTo(4,10.8,3.4,14.5,0,14.6); c.bezierCurveTo(-3.3,14.5,-3.9,11,-3.6,7.2); c.closePath();},
    civi:(()=>{const n=[]; for(let y=-12;y<3;y+=2.3) for(const x of[-3.4,-1.2,1.2,3.4]) if(Math.abs(x)<4.6-(y<-10?2:0)) n.push([x+(y%2)*.3,y]); for(let y=8.5;y<14;y+=2) for(const x of[-2.2,0,2.2]) n.push([x,y]); return n;})()},
  carik:{boy:26, yol(){c.moveTo(.6,-14); c.bezierCurveTo(4.8,-11,5.4,-4,5,1); c.bezierCurveTo(4.6,7,3.8,12.6,0,12.8); c.bezierCurveTo(-3.9,12.6,-4.7,7,-4.8,1); c.bezierCurveTo(-5,-5,-3.4,-11.4,.6,-14); c.closePath();}, civi:[]},
  ayak:{boy:25, yol(){c.moveTo(0,-7.5); c.bezierCurveTo(3.8,-7.4,4.4,-3,3.9,0); c.bezierCurveTo(3.2,4,3.4,8,2.6,10.6); c.bezierCurveTo(1.6,12.6,-2,12.8,-2.9,10.4); c.bezierCurveTo(-3.4,7,-1.2,3.5,-2.6,0); c.bezierCurveTo(-3.8,-3.2,-3.4,-7.4,0,-7.5); c.closePath();
    for(const[x,y,r]of[[-2.4,-9.6,1.5],[.1,-10.6,1.15],[2,-10.1,1],[3.5,-9,.85],[4.6,-7.4,.75]]){c.moveTo(x+r,y); c.ellipse(x,y,r,r*1.25,0,0,TAU);}}, civi:[]}
};

export default {
  tur:'ayak-izi', duzlemler:['zemin'], aciSapma:.35,
  kapsam:(p)=>({r:Math.max(16,(Math.min(4,p.sayi||2)-1)*36+14)}),
  kur(p,r){
    const T=TABAN[p.cesit]||TABAN.cizme, n=Math.max(1,Math.min(4,p.sayi||2)), adim=[];
    for(let i=0;i<n;i++){
      const sol=i%2===0, y=(i-(n-1)/2)*-66+(r()-.5)*6;
      adim.push({x:(sol?-8:8)+(r()-.5)*2, y, aci:(sol?-.09:.09)+(r()-.5)*.12, ayna:sol?-1:1, kayma:r()<.25?(r()-.5)*3:0, derin:.7+r()*.4, tohum:r()*1e5|0});
    }
    return {T,adim};
  },
  ciz(k,g){
    const T=g.T, yz=k.yuzey, cukur=yz==='camur'||yz==='toprak', gx=k.golgeYon[0], gy=k.golgeYon[1];
    for(const a of g.adim){
      const yer=()=>{k.duzlem(); c.translate(a.x,a.y); c.rotate(a.aci); c.scale(a.ayna,1);};
      const yg=[gx*Math.cos(-a.aci)-gy*Math.sin(-a.aci), gx*Math.sin(-a.aci)+gy*Math.cos(-a.aci)]; yg[0]*=a.ayna;
      if(cukur){
        const su=yz==='camur';
        yer(); c.translate(yg[0]*.9,yg[1]*.9); dolgu(T.yol,[150,146,124],.3*a.derin); // ezilip kabaran kenar ışık alır
        yer(); dolgu(T.yol,[4,5,4],.85*a.derin);
        // çukurun dibi: çamurda su birikmiş (göğü yansıtır), toprakta ışığa bakan iç duvar aydınlık
        yer(); c.save(); c.beginPath(); T.yol(); c.clip();
        c.translate(yg[0]*1.1,yg[1]*1.1); dolgu(T.yol,su?[118,120,110]:[84,78,62],su?.55:.8);
        c.translate(yg[0]*.7,yg[1]*.7); dolgu(T.yol,su?[90,92,84]:[52,48,38],.6);
        for(const q of T.civi) dolgu(()=>{c.moveTo(q[0]+.55,q[1]); c.arc(q[0],q[1],.55,0,TAU);},[10,10,8],.7);
        c.restore();
        yer(); serit(T.yol,[8,8,6],.5*a.derin,.7);
      }else if(yz==='un'){
        yer(); dolgu(T.yol,[20,18,14],.75);
        for(const q of T.civi) dolgu(()=>{c.moveTo(q[0]+.5,q[1]); c.arc(q[0],q[1],.5,0,TAU);},[20,18,14],.5);
      }else{
        yer(); c.save(); c.beginPath(); T.yol(); c.clip();
        for(let i=0;i<6;i++) leke((Math.sin(a.tohum+i)*3),(Math.cos(a.tohum*.7+i*2)*9),4,5,[8,7,5],.22);
        c.restore();
      }
      if(a.kayma){yer(); c.translate(a.kayma,-3); dolgu(T.yol,[0,0,0],.12);} // kayan adım
    }
  }
};
