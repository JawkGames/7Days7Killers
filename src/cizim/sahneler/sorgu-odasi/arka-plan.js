// Arka plan: ne odası olduğu anlaşılmayan loş yer (ön belleğe bir kez çizilir).
import {c} from '../../teknik/tuval.js';
import {gor} from '../../teknik/gorunum.js';
import {leke,tara,titrek,karalama} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {hex} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {OLCU,GIRIS} from './ayar.js';
import {resim} from '../../../platform/gorseller.js';

// Üretilmiş oda resmi (aynalanmış: kapı sağda, karakterin girdiği yerde). Kapı boşluğu GIRIS.kapi ile çakışacak biçimde yerleşir.
const ODA={yukseklik:1216, ust:67, kaydir:-40};
export const odaResmiVar=()=>!!resim('oda/arka-plan');

export function arkaPlan(){
  const oda=resim('oda/arka-plan');
  if(oda){
    const H=OLCU.yukseklik, G=gor.yarimG+OLCU.pay, h=ODA.yukseklik, w=oda.width*h/oda.height;
    c.fillStyle='#060707'; c.fillRect(-G,gor.ustY,G*2,H-gor.ustY);
    c.save(); c.translate(ODA.kaydir,ODA.ust); c.scale(-1,1); c.drawImage(oda,-w/2,0,w,h); c.restore();
    c.fillStyle='rgba(6,8,7,.35)'; c.fillRect(-G,gor.ustY,G*2,H-gor.ustY); // loşlaştır: oyunun ışığı üstüne biner
    leke(-G,H*.5,G*.9,H*.9,PAL.siyah,.6); leke(G,H*.45,G*.95,H*.9,PAL.siyah,.6);
    return;
  }
  const H=OLCU.yukseklik, G=gor.yarimG+OLCU.pay, r=rng(101);
  let g=c.createLinearGradient(0,gor.ustY,0,H); g.addColorStop(0,'#0c100e'); g.addColorStop(.45,'#161b17'); g.addColorStop(1,'#060707');
  c.fillStyle=g; c.fillRect(-G,gor.ustY,G*2,H-gor.ustY);
  // çamurlu boya lekeleri: rutubet, is, morluk
  for(let i=0;i<26;i++){
    const renk=[hex('#3a3524'),PAL.morluk,hex('#243029'),hex('#050606')][i%4];
    leke((r()-.5)*G*2.2,gor.ustY+r()*(H-gor.ustY),90+r()*260,70+r()*240,renk,.10+r()*.16,r()*3);
  }
  tara(-G,gor.ustY,G,H,.42,11,PAL.murekkep,.30,201,1.3);
  tara(-G,gor.ustY,G,H,-1.05,15,PAL.murekkep,.22,202,1.1);
  tara(-G,gor.ustY,G,H*.7,1.3,22,hex('#8a8468'),.05,203,1);
  // belirsiz şekiller: kapı mı dolap mı, borular, boş çerçeve
  const KP=GIRIS.kapi; c.fillStyle='rgba(3,4,4,.72)'; c.beginPath(); c.moveTo(KP[0][0],KP[0][1]); for(let i=1;i<4;i++) c.lineTo(KP[i][0],KP[i][1]); c.closePath(); c.fill();
  titrek(()=>{c.moveTo(KP[3][0],KP[3][1]); c.lineTo(KP[0][0],KP[0][1]); c.lineTo(KP[1][0],KP[1][1]); c.lineTo(KP[2][0],KP[2][1]);},hex('#6f6a55'),.22,1.6,211,3,5);
  leke(420,520,60,260,PAL.siyah,.6);
  titrek(()=>{c.moveTo(-G,206); c.lineTo(-300,214); c.lineTo(-296,gor.ustY); c.moveTo(-G,232); c.lineTo(-318,240); c.lineTo(-322,H);},hex('#5a5644'),.26,2.2,212,3,4);
  titrek(()=>{c.rect(-560,330,150,196);},hex('#6f6a55'),.2,1.8,213,3,6);
  c.fillStyle='rgba(2,3,3,.6)'; c.fillRect(-552,338,134,180);
  karalama(-485,428,46,64,hex('#7a745c'),.10,214,14);
  // akıntı izleri
  for(let i=0;i<34;i++){
    const x=(r()-.5)*G*2, y=gor.ustY+r()*500, u=60+r()*420;
    c.strokeStyle=`rgba(4,5,5,${.18+r()*.3})`; c.lineWidth=1+r()*3; c.lineCap='round';
    c.beginPath(); c.moveTo(x,y); c.bezierCurveTo(x+(r()-.5)*8,y+u*.3,x+(r()-.5)*10,y+u*.7,x+(r()-.5)*6,y+u); c.stroke();
  }
  // duvara kazınmış karalamalar ve çentikler
  for(let i=0;i<9;i++) karalama((r()-.5)*G*1.8,gor.ustY+80+r()*700,30+r()*50,18+r()*36,hex('#8a8468'),.05+r()*.06,220+i,8+r()*10|0);
  for(let i=0;i<7;i++){const x=-250+i*13+r()*4, y=640+r()*8; c.strokeStyle='rgba(138,132,104,.16)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(x,y); c.lineTo(x+3,y+34+r()*8); c.stroke();}
  c.strokeStyle='rgba(138,132,104,.16)'; c.beginPath(); c.moveTo(-258,668); c.lineTo(-166,650); c.stroke();
  // köşeler karanlığa gömülür
  leke(-G,H*.5,G*.9,H*.9,PAL.siyah,.75); leke(G,H*.45,G*.95,H*.9,PAL.siyah,.82); leke(0,H+40,G*1.4,330,PAL.siyah,.85);
}
