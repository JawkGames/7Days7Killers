import {c} from '../teknik/tuval.js';
import {leke,tara,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,hex} from '../../cekirdek/matematik.js';
import {poz} from './poz.js';

export function yaka(yon,koyu,k){
  c.save(); c.scale(-yon,1);
  const yol=()=>{c.moveTo(-90,782); c.lineTo(-158,800); c.lineTo(-192,884); c.lineTo(-150,896); c.lineTo(-198,918); c.bezierCurveTo(-152,1000,-82,1072,-14,1112); c.lineTo(-4,1092); c.bezierCurveTo(-52,1000,-100,900,-112,822); c.closePath();};
  c.beginPath(); yol();
  c.save(); c.shadowColor='rgba(0,0,0,.8)'; c.shadowBlur=20; c.shadowOffsetY=6; c.fillStyle=koyu?'#0b0f0e':'#1a211e'; c.fill(); c.restore();
  c.save(); c.clip(); tara(-200,780,0,1110,.9,7,PAL.murekkep,koyu?.5:.38,300+k,1.1); if(!koyu) leke(-150,830,70,60,hex('#4a5548'),.3); c.restore();
  titrek(yol,PAL.murekkep,.85,1.7,310+k,2,2.2);
  titrek(()=>{c.moveTo(-150,896); c.lineTo(-108,852);},PAL.murekkep,.8,1.6,320+k,2,2);
  c.restore();
}
export function gomlekYaka(yon,koyu,k){
  c.save(); c.scale(-yon,1);
  const yol=()=>{c.moveTo(-98,780); c.bezierCurveTo(-78,812,-52,842,-28,866); c.bezierCurveTo(-50,878,-84,880,-112,872); c.bezierCurveTo(-112,842,-108,808,-98,780); c.closePath();};
  c.beginPath(); yol(); c.fillStyle=koyu?'#3d3b33':'#8b8571'; c.fill();
  c.save(); c.clip(); tara(-115,778,-25,882,-.5,6,PAL.murekkep,koyu?.5:.28,330+k); c.restore();
  titrek(yol,PAL.murekkep,.8,1.4,340+k,2,1.8);
  c.restore();
}
export function govde(){
  const k=poz.kaynama;
  c.save(); c.translate(0,-38-poz.nefes*3.2);
  const ceket=()=>{c.moveTo(-84,786); c.bezierCurveTo(-150,800,-262,822,-312,872); c.bezierCurveTo(-352,914,-366,1010,-372,1300); c.lineTo(372,1300); c.bezierCurveTo(366,1010,352,914,312,872); c.bezierCurveTo(262,822,150,800,84,786); c.closePath();};
  c.beginPath(); ceket();
  let g=c.createLinearGradient(-300,780,300,1200); g.addColorStop(0,'#1c2420'); g.addColorStop(.4,'#101513'); g.addColorStop(1,'#050606');
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  leke(-220,846,170,40,hex('#4d5a4c'),.42*poz.isik,-.2);
  leke(250,940,190,260,PAL.siyah,.8);
  tara(-372,786,372,1080,.75,8,PAL.murekkep,.5,350+k,1.2);
  tara(-60,786,372,1080,-.6,10,PAL.murekkep,.45,351+k,1.2);
  // alt kenar palto etek rengine eriyerek biter: ayaktayken birleşim çizgisi görünmez
  g=c.createLinearGradient(0,1130,0,1300); g.addColorStop(0,'rgba(7,9,9,0)'); g.addColorStop(1,'rgba(7,9,9,1)'); c.fillStyle=g; c.fillRect(-380,1130,760,180);
  c.restore();
  titrek(()=>{c.moveTo(-372,1300); c.bezierCurveTo(-366,1010,-352,914,-312,872); c.bezierCurveTo(-262,822,-150,800,-84,786); c.moveTo(84,786); c.bezierCurveTo(150,800,262,822,312,872); c.bezierCurveTo(352,914,366,1010,372,1300);},PAL.murekkep,.9,2,352+k,3,3);
  // bluz
  c.beginPath(); c.moveTo(-150,790); c.lineTo(150,790); c.lineTo(10,1110); c.lineTo(-10,1110); c.closePath();
  g=c.createLinearGradient(-80,800,90,1100); g.addColorStop(0,'#7d7866'); g.addColorStop(.5,'#514e44'); g.addColorStop(1,'#25241f');
  c.fillStyle=g; c.fill();
  c.save(); c.clip(); leke(40,900,120,130,PAL.siyah,.55); tara(-150,790,150,1120,1.2,7,PAL.murekkep,.3,353+k); c.restore();
  titrek(()=>{c.moveTo(0,902); c.lineTo(1,1104);},PAL.murekkep,.7,1.4,354+k,2,2);
  for(const y of[944,996]){c.fillStyle='#2a2822'; c.beginPath(); c.arc(0,y,5.5,0,TAU); c.fill(); titrek(()=>{c.arc(0,y,5.5,0,TAU);},PAL.murekkep,.8,1.1,355+y+k,2,1.4);}
  // boyun
  const boyun=()=>{c.moveTo(-72,620); c.bezierCurveTo(-70,700,-72,752,-94,788); c.lineTo(-58,800); c.lineTo(0,906); c.lineTo(58,800); c.lineTo(94,788); c.bezierCurveTo(72,752,70,700,72,620); c.closePath();};
  c.beginPath(); boyun();
  g=c.createLinearGradient(0,640,0,905); g.addColorStop(0,'#1a181c'); g.addColorStop(.5,'#59554b'); g.addColorStop(1,'#7c7767');
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  leke(8+poz.hgx*6,736,132,70,PAL.tenDerin,.9);
  leke(70,740,60,130,PAL.tenDerin,.75);
  leke(-44,806,48,26,PAL.tenIsik,.18*poz.isik);
  tara(-10,640,100,900,1.05,6,PAL.murekkep,.45,356+k);
  tara(-95,690,95,790,.2,7,PAL.murekkep,.3,357+k);
  c.restore();
  titrek(()=>{c.moveTo(-26,730); c.quadraticCurveTo(-18,780,-6,806); c.moveTo(-58,800); c.lineTo(0,906); c.lineTo(58,800);},PAL.murekkep,.6,1.3,358+k,2,2);
  gomlekYaka(-1,false,k); gomlekYaka(1,true,k);
  yaka(-1,false,k); yaka(1,true,k);
  c.restore();
}

export function altGovde(){ // yere kadar inen palto ve yanlarda sarkan eller: yalnızca ayaktayken görünür, bacak çizilmez
  const k=poz.kaynama;
  c.save(); c.translate(0,-38);
  const etek=()=>{c.moveTo(-372,1280); c.lineTo(-420,2780); c.lineTo(420,2780); c.lineTo(372,1280); c.closePath();};
  c.beginPath(); etek();
  const g=c.createLinearGradient(-300,1280,300,2780); g.addColorStop(0,'#070909'); g.addColorStop(1,'#030404'); c.fillStyle=g; c.fill();
  c.save(); c.clip(); tara(-420,1280,420,2780,.75,10,PAL.murekkep,.5,760+k,1.3); leke(280,2050,220,760,PAL.siyah,.7); c.restore();
  titrek(()=>{c.moveTo(-372,1280); c.lineTo(-420,2780); c.moveTo(420,2780); c.lineTo(372,1280);},PAL.murekkep,.9,2.2,761+k,2,3);
  titrek(()=>{c.moveTo(-2,1150); c.lineTo(5,2780);},PAL.murekkep,.8,2,762+k,2,3);
  for(const s of[-1,1]){
    c.fillStyle=s<0?'#77725f':'#3c3a36'; c.beginPath(); c.ellipse(s*388,2010,36,74,s*.08,0,TAU); c.fill();
    titrek(()=>{c.ellipse(s*388,2010,36,74,s*.08,0,TAU);},PAL.murekkep,.85,1.8,763+s+k,2,2);
  }
  c.restore();
}
