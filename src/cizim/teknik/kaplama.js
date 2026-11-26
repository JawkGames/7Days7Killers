// Bütün sahnenin üstüne binen kaplamalar: kararma, film çizikleri, kum.
import {ana,cv} from './tuval.js';
import {gor} from './gorunum.js';
import {TAU} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {azHareket} from '../../platform/tercih.js';

let kumDesen=null;

export function kumOlustur(){
  const k=document.createElement('canvas'); k.width=k.height=256;
  const kc=k.getContext('2d'), d=kc.createImageData(256,256), r=rng(9);
  for(let i=0;i<d.data.length;i+=4){const v=r()*255|0; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255;}
  kc.putImageData(d,0,0); kumDesen=ana.createPattern(k,'repeat');
}

export function kaplama(t){
  ana.setTransform(gor.dpr,0,0,gor.dpr,0,0);
  const g=ana.createRadialGradient(gor.vw*.46,gor.vh*.4,Math.min(gor.vw,gor.vh)*.2,gor.vw/2,gor.vh*.5,Math.max(gor.vw,gor.vh)*.74);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.82)');
  ana.fillStyle=g; ana.fillRect(0,0,gor.vw,gor.vh);
  if(!azHareket){
    // eski film çizikleri ve lekeleri
    const r=rng(Math.floor(t*11)+900);
    for(let i=0;i<3;i++){ if(r()<.55){const x=r()*gor.vw; ana.strokeStyle=`rgba(210,205,180,${.03+r()*.06})`; ana.lineWidth=.6+r(); ana.beginPath(); ana.moveTo(x,r()*gor.vh*.3); ana.lineTo(x+(r()-.5)*6,gor.vh*(.5+r()*.5)); ana.stroke();} }
    for(let i=0;i<5;i++){ana.fillStyle=`rgba(${r()<.5?'220,214,190':'0,0,0'},${.06+r()*.14})`; ana.beginPath(); ana.arc(r()*gor.vw,r()*gor.vh,.6+r()*1.8,0,TAU); ana.fill();}
    // yavaşça kayan soluk bant
    const by=((t*46)%(gor.vh+160))-80; const bg=ana.createLinearGradient(0,by-40,0,by+40);
    bg.addColorStop(0,'rgba(200,205,190,0)'); bg.addColorStop(.5,'rgba(200,205,190,.022)'); bg.addColorStop(1,'rgba(200,205,190,0)');
    ana.fillStyle=bg; ana.fillRect(0,by-40,gor.vw,80);
  }
  ana.setTransform(1,0,0,1,0,0);
  const kx=azHareket?0:(Math.floor(t*12)*89)%256, ky=azHareket?0:(Math.floor(t*12)*53)%256;
  ana.save(); ana.globalAlpha=.085; ana.globalCompositeOperation='overlay'; ana.translate(-kx,-ky); ana.fillStyle=kumDesen; ana.fillRect(0,0,cv.width+256,cv.height+256); ana.restore();
}
