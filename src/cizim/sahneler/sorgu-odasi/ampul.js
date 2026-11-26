// Çıplak ampul: sallanır, cızırdar.
import {c} from '../../teknik/tuval.js';
import {gor} from '../../teknik/gorunum.js';
import {leke} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {TAU,hex,rgba} from '../../../cekirdek/matematik.js';
import {azHareket} from '../../../platform/tercih.js';
import {poz} from '../../rig/poz.js';

export function ampul(t){
  const ax=-262, ay=gor.ustY-10, boy=188, aci=azHareket?0:Math.sin(t*.8)*.05+Math.sin(t*1.9)*.012;
  const bx=ax+Math.sin(aci)*boy, by=ay+Math.cos(aci)*boy, f=poz.isik;
  leke(bx+60,by+260,560,640,PAL.lamba,.24*f);
  leke(bx,by,150,150,PAL.lamba,.30*f);
  c.strokeStyle='rgba(5,5,5,.9)'; c.lineWidth=2.4; c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by-22); c.stroke();
  c.fillStyle='#0a0908'; c.fillRect(bx-7,by-26,14,14);
  const g=c.createRadialGradient(bx,by,1,bx,by,17); g.addColorStop(0,rgba([255,244,214],.95*f)); g.addColorStop(.6,rgba(PAL.lamba,.8*f)); g.addColorStop(1,rgba(hex('#6b5220'),.5));
  c.fillStyle=g; c.beginPath(); c.ellipse(bx,by,12,16,aci,0,TAU); c.fill();
  return {bx,by};
}
