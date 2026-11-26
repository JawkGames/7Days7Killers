import {c} from '../teknik/tuval.js';
import {leke} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {rgba,lerp,bez} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';

export const SAC={
  sol:[[-35,-236,-230,-262,-232,200,-200,430],[-35,-168,-150,-176,-130,170,-158,436]],
  sag:[[-35,-236,246,-280,230,200,202,430],[-35,-168,150,-140,132,150,160,438]]
};
export function bukle(P){const o=new Array(8); for(let k=0;k<4;k++){const y=P[k*2+1]; o[k*2]=P[k*2]+(y>100?poz.sallanti*Math.pow((y-100)/235,2):0); o[k*2+1]=y;} return o;}
export function tutam(A,B,o){
  const a=bukle(A), b=bukle(B);
  c.beginPath(); c.moveTo(a[0],a[1]); c.bezierCurveTo(a[2],a[3],a[4],a[5],a[6],a[7]);
  c.quadraticCurveTo((a[6]+b[6])/2,(a[7]+b[7])/2+18,b[6],b[7]); c.bezierCurveTo(b[4],b[5],b[2],b[3],b[0],b[1]); c.closePath();
  c.fillStyle='#0d0c0e'; c.fill();
  c.save(); c.clip();
  const r=rng(o.seed); c.lineCap='round';
  for(let i=0;i<o.n;i++){
    const t=r(), j=()=>(r()-.5)*12, acik=r()<.22;
    c.strokeStyle=acik?rgba(PAL.sacIsik,.14+r()*.3):rgba(PAL.siyah,.35+r()*.5); c.lineWidth=.7+r()*2.1;
    c.beginPath(); c.moveTo(lerp(a[0],b[0],t),lerp(a[1],b[1],t));
    c.bezierCurveTo(lerp(a[2],b[2],t)+j(),lerp(a[3],b[3],t)+j(),lerp(a[4],b[4],t)+j(),lerp(a[5],b[5],t)+j(),lerp(a[6],b[6],t)+j(),lerp(a[7],b[7],t)+r()*14);
    c.stroke();
  }
  for(const h of o.isik) leke(h[0],h[1],h[2],h[3],h[4],h[5],h[6]);
  c.restore();
  // silüetten taşan dağınık teller
  const u=rng(o.seed+poz.kaynama*3);
  for(let i=0;i<9;i++){
    const t=.12+u()*.8, p=bez(a,t), q=bez(a,Math.min(1,t+.12+u()*.1)), d=o.yon*(6+u()*22);
    c.strokeStyle=`rgba(8,7,9,${.45+u()*.4})`; c.lineWidth=.7+u()*1.1;
    c.beginPath(); c.moveTo(p[0],p[1]); c.quadraticCurveTo((p[0]+q[0])/2+d,(p[1]+q[1])/2,q[0]+d*.5,q[1]+u()*18); c.stroke();
  }
}
export function arkaSac(){
  const s=poz.sallanti;
  c.beginPath(); c.moveTo(0,-240);
  c.bezierCurveTo(96,-246,170,-206,192,-40); c.bezierCurveTo(196,80,216,210,196+s,326);
  c.bezierCurveTo(150+s,356,60+s,338,s,344); c.bezierCurveTo(-60+s,338,-150+s,356,-196+s,326);
  c.bezierCurveTo(-216,210,-196,80,-192,-40); c.bezierCurveTo(-170,-206,-96,-246,0,-240); c.closePath();
  c.fillStyle='#070608'; c.fill();
}
export function onSac(){
  tutam(SAC.sol[0],SAC.sol[1],{seed:11,n:130,yon:-1,isik:[[-150,-200,80,22,PAL.sacIsik,.34,-.55],[-198,50,20,90,PAL.sacIsik,.14]]});
  tutam(SAC.sag[0],SAC.sag[1],{seed:12,n:140,yon:1,isik:[[60,-222,110,20,PAL.sacIsik,.22,.2],[170,120,60,260,PAL.siyah,.55]]});
}
