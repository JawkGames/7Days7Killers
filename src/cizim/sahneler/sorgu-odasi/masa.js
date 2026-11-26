// Ön plan: masa (ön belleğe bir kez çizilir) ve kül tablasından yükselen duman.
import {c} from '../../teknik/tuval.js';
import {gor} from '../../teknik/gorunum.js';
import {leke,tara,titrek,karalama} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {TAU,hex} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {azHareket} from '../../../platform/tercih.js';
import {OLCU} from './ayar.js';

export function masa(){
  const T=OLCU.masaY, H=OLCU.yukseklik, G=gor.yarimG+OLCU.pay, r=rng(601);
  leke(10,T+2,360,34,PAL.siyah,.8);
  let g=c.createLinearGradient(0,T,0,H); g.addColorStop(0,'#17120d'); g.addColorStop(.5,'#241b13'); g.addColorStop(1,'#0b0806');
  c.fillStyle=g; c.fillRect(-G,T,G*2,H-T+2);
  c.save(); c.beginPath(); c.rect(-G,T,G*2,H-T+2); c.clip();
  // tahta aralıkları: ufuk noktasına doğru daralır
  for(let i=-8;i<=8;i++){const xa=i*150+ (r()-.5)*10; titrek(()=>{c.moveTo(xa*.62,T); c.lineTo(xa,H+4);},PAL.murekkep,.7,2,610+i,2,3);}
  tara(-G,T,G,H,.04,6,PAL.murekkep,.4,620,1.1);
  tara(-G,T,G,H,.3,13,hex('#8a6f48'),.07,621,1);
  for(let i=0;i<40;i++){const x=(r()-.5)*G*2,y=T+r()*(H-T),u=10+r()*70,a=(r()-.5)*1.2; c.strokeStyle=r()<.5?`rgba(150,128,92,${.05+r()*.1})`:`rgba(3,3,3,${.3+r()*.4})`; c.lineWidth=.8+r()*1.6; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*u,y+Math.sin(a)*u*.4); c.stroke();}
  leke(-150,T+70,300,60,PAL.lamba,.14);
  leke(-G,T+90,G*.6,150,PAL.siyah,.7); leke(G,T+80,G*.8,160,PAL.siyah,.85);
  // bardak izleri
  for(const[x,y,rr]of[[250,T+62,26],[236,T+70,26],[-330,T+120,22]]) titrek(()=>{c.ellipse(x,y,rr,rr*.34,0,0,TAU);},PAL.murekkep,.4,1.6,630+x,2,2);
  c.restore();
  titrek(()=>{c.moveTo(-G,T); c.lineTo(G,T+2);},hex('#6a5a40'),.35,2,640,3,2.5);

  // açık defter
  c.save(); c.translate(-150,T+108); c.rotate(-.1);
  const sayfa=(yon)=>{c.moveTo(0,-38); c.lineTo(yon*118,-44); c.lineTo(yon*132,34); c.lineTo(0,44); c.closePath();};
  for(const yon of[-1,1]){
    c.beginPath(); sayfa(yon); c.fillStyle=yon<0?'#7b765f':'#5f5b4b'; c.fill();
    c.save(); c.clip(); leke(yon*90,10,70,60,PAL.siyah,yon<0?.2:.5);
    const q=rng(650+yon);
    for(let i=0;i<7;i++){const y=-28+i*10; titrek(()=>{c.moveTo(yon*12,y+(q()-.5)*2); for(let x=20;x<110;x+=8+q()*10) c.lineTo(yon*x,y+(q()-.5)*5);},PAL.murekkep,.55,1,660+i+yon*10,1,1);}
    c.restore();
    titrek(()=>{sayfa(yon);},PAL.murekkep,.85,1.5,670+yon,2,2);
  }
  karalama(60,-6,26,18,PAL.murekkep,.6,680,9); // üstü karalanmış bir not
  titrek(()=>{c.moveTo(-104,48); c.lineTo(24,66);},hex('#3a2f1c'),.95,4,681,1,0); titrek(()=>{c.moveTo(24,66); c.lineTo(36,68);},PAL.murekkep,.9,2,682,1,0); // kalem
  c.restore();
  // dosya
  c.save(); c.translate(196,T+104); c.rotate(.07);
  const dosya=()=>{c.moveTo(-96,-40); c.lineTo(-30,-44); c.lineTo(-22,-54); c.lineTo(40,-56); c.lineTo(46,-46); c.lineTo(104,-48); c.lineTo(120,44); c.lineTo(-110,52); c.closePath();};
  c.beginPath(); dosya(); c.fillStyle='#4a3d27'; c.fill();
  c.save(); c.clip(); leke(80,10,90,70,PAL.siyah,.6); tara(-110,-56,120,52,.6,7,PAL.murekkep,.35,690); c.restore();
  titrek(dosya,PAL.murekkep,.85,1.6,691,2,2.2);
  titrek(()=>{c.rect(-58,-16,74,22);},PAL.murekkep,.5,1.1,692,2,1.6);
  c.restore();
  // ters çevrilmiş fotoğraflar
  for(const[x,y,a,s]of[[20,T+62,.22,700],[-12,T+74,-.16,701],[58,T+84,.5,702]]){
    c.save(); c.translate(x,y); c.rotate(a);
    c.fillStyle='#36342c'; c.fillRect(-30,-13,60,26); titrek(()=>{c.rect(-30,-13,60,26);},PAL.murekkep,.8,1.3,s,2,1.6); c.restore();
  }
  // teneke kül tablası
  c.fillStyle='#1b1a18'; c.beginPath(); c.ellipse(318,T+52,44,13,0,0,TAU); c.fill();
  c.fillStyle='#070707'; c.beginPath(); c.ellipse(318,T+54,34,8.5,0,0,TAU); c.fill();
  titrek(()=>{c.ellipse(318,T+52,44,13,0,0,TAU);},hex('#6f6a58'),.5,1.5,710,2,1.6);
  titrek(()=>{c.moveTo(296,T+50); c.lineTo(330,T+41);},hex('#9a947e'),.8,3.2,711,1,0);
}
const DUMAN={x:333,y:OLCU.masaY+40};
export function duman(t){ // kül tablasından yükselen ince duman
  if(azHareket) return;
  c.lineCap='round';
  for(let i=0;i<3;i++){
    c.beginPath(); c.moveTo(DUMAN.x,DUMAN.y);
    for(let y=0;y<230;y+=10){const s=y/230, x=DUMAN.x+Math.sin(y*.035+t*1.1+i*1.9)*(6+s*34)+s*18*(i-1); c.lineTo(x,DUMAN.y-y);}
    c.strokeStyle=`rgba(150,148,132,${.05+i*.015})`; c.lineWidth=2.5+i*2.5; c.stroke();
  }
}
