import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {poz} from '../../rig/poz.js';
import {OLCU} from './ayar.js';

export function sandalye(){ // kadının oturacağı boş sandalye: masanın arkasında bekler
  const T=OLCU.masaY;
  const ust=()=>{c.moveTo(-214,818); c.quadraticCurveTo(0,768,214,818); c.lineTo(210,864); c.quadraticCurveTo(0,816,-210,864); c.closePath();};
  c.fillStyle='#120e0a'; for(const s of[-1,1]) c.fillRect(s*196-12,826,24,T-816);
  c.fillStyle='#0d0a08'; for(const x of[-92,0,92]) c.fillRect(x-9,832,18,T-822);
  c.beginPath(); ust(); c.fillStyle='#1b150e'; c.fill();
  c.save(); c.clip(); tara(-214,768,214,866,.2,6,PAL.murekkep,.5,770); leke(-120,812,90,28,PAL.lamba,.12*poz.isik); c.restore();
  titrek(ust,PAL.murekkep,.9,1.8,771,2,2);
  titrek(()=>{for(const s of[-1,1]){c.moveTo(s*196-12,862); c.lineTo(s*196-12,T+4); c.moveTo(s*196+12,856); c.lineTo(s*196+12,T+4);}},PAL.murekkep,.7,1.5,772,2,2);
}
