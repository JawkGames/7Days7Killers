import {c} from '../teknik/tuval.js';
import {leke,tara,titrek,karalama} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,hex,rgba,lerp,clamp} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz,YUZ} from './poz.js';
import {onSac} from './sac.js';

export function yuzYolu(){
  c.moveTo(0,-200);
  c.bezierCurveTo(95,-202,152,-150,158,-50); c.bezierCurveTo(161,20,146,88,118,140);
  c.bezierCurveTo(100,178,64,206,32,215); c.bezierCurveTo(13,220,-13,220,-32,215);
  c.bezierCurveTo(-64,206,-100,178,-118,140); c.bezierCurveTo(-146,88,-161,20,-158,-50);
  c.bezierCurveTo(-152,-150,-95,-202,0,-200); c.closePath();
}
export function goz(yon,fx){
  const o=clamp(poz.goz,0,1), k=poz.kaynama;
  const ust=lerp(9,-19,o), alt=lerp(9,11,o), U=[-31,5,-18,ust,12,ust-2,31,-4];
  c.save(); c.translate(yon*YUZ.gozAralik+fx,0); c.scale(yon,1);
  c.save();
  c.beginPath(); c.moveTo(-31,5); c.bezierCurveTo(U[2],U[3],U[4],U[5],U[6],U[7]); c.bezierCurveTo(16,alt,-12,alt+2,-31,5); c.closePath(); c.clip();
  let g=c.createRadialGradient(0,2,2,0,2,36); g.addColorStop(0,'#9b9886'); g.addColorStop(.6,'#5f5d55'); g.addColorStop(1,'#26252a');
  c.fillStyle=g; c.fillRect(-36,-26,72,48);
  const ix=clamp(poz.gx,-1,1)*10*yon, iy=clamp(poz.gy,-1,1)*4.5-2;
  g=c.createRadialGradient(ix,iy+1,1,ix,iy,12.5); g.addColorStop(0,rgba(PAL.iris,1)); g.addColorStop(.62,rgba(hex('#6f786b'),1)); g.addColorStop(.9,rgba(PAL.irisKenar,1)); g.addColorStop(1,'rgba(6,7,7,1)');
  c.fillStyle=g; c.beginPath(); c.arc(ix,iy,12.5,0,TAU); c.fill();
  c.fillStyle='#030303'; c.beginPath(); c.arc(ix,iy,3.6,0,TAU); c.fill(); // küçük, iğne ucu gözbebeği
  g=c.createLinearGradient(0,ust-4,0,ust+20); g.addColorStop(0,'rgba(6,5,8,.92)'); g.addColorStop(1,'rgba(6,5,8,0)');
  c.fillStyle=g; c.fillRect(-36,-26,72,48);
  c.fillStyle=rgba([255,240,205],.85*poz.isik); c.beginPath(); c.ellipse(ix-4*yon,iy-4,1.9,2.3,0,0,TAU); c.fill();
  c.restore();
  // kapak hatları: titrek mürekkep
  titrek(()=>{c.moveTo(-33,6); c.bezierCurveTo(U[2],U[3]-1,U[4],U[5]-1,36,-7);},PAL.murekkep,.95,3.2,400+yon+k,2,1.6);
  titrek(()=>{c.moveTo(31,-4); c.bezierCurveTo(16,alt,-12,alt+2,-31,5);},PAL.murekkep,.55,1.3,410+yon+k,2,1.4);
  titrek(()=>{c.moveTo(-30,-3); c.bezierCurveTo(-17,ust-9,12,ust-12,34,-12);},PAL.murekkep,.6,1.4,420+yon+k,2,1.6);
  titrek(()=>{c.moveTo(-24,22); c.quadraticCurveTo(0,30,26,20);},PAL.murekkep,.35,1.2,430+yon+k,2,2); // göz altı torbası
  c.restore();
}
export function kas(yon,fx){
  const ic=poz.kasCat*7-poz.kasKaldir*3, k=poz.kaynama, r=rng(yon>0?21:22);
  c.save(); c.translate(yon*YUZ.gozAralik+fx*.8,-43-poz.kasKaldir*6); c.scale(yon,1);
  c.strokeStyle=rgba(PAL.murekkep,.8); c.lineCap='round';
  for(let i=0;i<54;i++){const t=r(), x=lerp(-36,44,t), y=lerp(8+ic*(1-t),-1,Math.sin(t*Math.PI*.6))-6.5*Math.sin(t*Math.PI); c.lineWidth=.7+r()*1.1; c.beginPath(); c.moveTo(x,y+3); c.lineTo(x+5+r()*5,y-3-r()*2+t*3); c.stroke();}
  titrek(()=>{c.moveTo(-36,7+ic); c.bezierCurveTo(-18,-6+ic*.5,6,-12,18,-10); c.bezierCurveTo(30,-8,39,-3,46,4);},PAL.murekkep,.6,1.5,440+yon+k,2,1.8);
  c.restore();
}
export function kafa(){
  const fx=poz.hgx*7, fy=poz.hgy*4, k=poz.kaynama, I=poz.isik;
  // ── boya katmanı
  c.beginPath(); yuzYolu();
  let g=c.createLinearGradient(-140,-200,130,220); g.addColorStop(0,rgba(PAL.tenIsik,1)); g.addColorStop(.38,rgba(PAL.ten,1)); g.addColorStop(.7,rgba(PAL.tenOrta,1)); g.addColorStop(1,rgba(PAL.tenGolge,1));
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  leke(150,30,175,310,PAL.tenDerin,.94); leke(118,20,110,300,PAL.tenDerin,.8); // yüzün yarısı karanlıkta
  leke(-210,70,84,240,PAL.tenGolge,.6);
  leke(-40,-118,116,66,hex('#d6cfb4'),.26*I);
  leke(60,-128,150,54,PAL.tenDerin,.6); leke(-104,-150,70,50,PAL.tenDerin,.5);
  for(const s of[-1,1]){
    leke(s*66+fx,-6+fy,62,40,PAL.tenDerin,s>0?.92:.84);  // çökük göz çukurları
    leke(s*66+fx,22+fy,34,12,PAL.morluk,.5);
    leke(s*96+fx*.4,118,40,46,PAL.tenGolge,s>0?.5:.42);  // çökük yanak
    leke(s*100+fx*.5,74,50,34,PAL.morluk,.16);
  }
  leke(-100+fx*.5,44,42,20,PAL.tenIsik,.24*I);
  const nx=fx*1.5, mx=fx*1.15;
  leke(-4+nx,28+fy,7,60,PAL.tenIsik,.34*I); leke(15+nx,44+fy,12,60,PAL.tenDerin,.55);
  leke(-3+nx,88+fy,13,10,PAL.tenIsik,.3*I); leke(nx,120+fy,38,13,PAL.tenDerin,.75);
  leke(mx,194+fy+poz.agizAc*17,38,11,PAL.tenDerin,.6); leke(0,246,160,44,PAL.tenDerin,.8);
  // ── mürekkep taraması: gölge yanı ve çukurlar
  tara(10,-210,175,230,1.05,6,PAL.murekkep,.55,500+k,1.1);
  tara(60,-210,175,230,-.5,8,PAL.murekkep,.4,501+k,1.1);
  tara(-165,40,-80,200,.9,7,PAL.murekkep,.3,502+k);
  for(const s of[-1,1]) tara(s*66-44+fx,-40+fy,s*66+44+fx,34+fy,s*.5,5,PAL.murekkep,.4,503+s+k);
  tara(-60,200,60,222,.1,5,PAL.murekkep,.35,505+k);
  c.restore();
  // ── hatlar
  titrek(()=>{yuzYolu();},PAL.murekkep,.75,1.8,510+k,2,2.6);
  c.save(); c.translate(0,fy);
  // burun: tek yanı çizgi, delikler
  titrek(()=>{c.moveTo(12+nx,-14); c.bezierCurveTo(16+nx,30,22+nx,70,27+nx,96); c.bezierCurveTo(30+nx,108,22+nx,114,12+nx,112);},PAL.murekkep,.7,1.5,520+k,2,1.8);
  titrek(()=>{c.moveTo(-26+nx,100); c.bezierCurveTo(-30+nx,110,-22+nx,114,-13+nx,111); c.moveTo(-9+nx,112); c.quadraticCurveTo(nx,118,9+nx,112);},PAL.murekkep,.6,1.4,521+k,2,1.6);
  for(const s of[-1,1]){c.fillStyle='rgba(6,5,7,.9)'; c.beginPath(); c.ellipse(nx+s*15,108.5,7.6,3.6,s*-.28,0,TAU); c.fill();}
  // ağız: ince, soluk, aşağı dönük
  // ağız: köşeler sabit kalır, dudaklar esneyerek açılır (alt dudak yüzden kopmaz)
  const a=poz.agiz, cy=152-a*5, ac=poz.agizAc, W=45*poz.agizGen*(1-ac*.08);
  const yUst=137-ac*2, yUi=153-ac*3, yLi=154+ac*17, yLb=175+ac*19;
  const orta=T=>(T-cy/4)/.75; // köşeden köşeye eğrinin ortası T yüksekliğine gelsin
  const kavis=(T,ters)=>{const y=orta(T); if(ters) c.bezierCurveTo(mx+W*.6,y,mx-W*.6,y,mx-W,cy); else c.bezierCurveTo(mx-W*.6,y,mx+W*.6,y,mx+W,cy);};
  const ustD=()=>{c.moveTo(mx-W,cy); c.bezierCurveTo(mx-W*.67,cy-7,mx-W*.47,yUst,mx-W*.24,yUst); c.quadraticCurveTo(mx-W*.09,yUst,mx,yUst+4.5); c.quadraticCurveTo(mx+W*.09,yUst,mx+W*.24,yUst); c.bezierCurveTo(mx+W*.47,yUst,mx+W*.67,cy-7,mx+W,cy); kavis(yUi,true); c.closePath();};
  const altD=()=>{c.moveTo(mx-W,cy); kavis(yLi,false); kavis(yLb,true); c.closePath();};
  if(ac>.02){ // ağız içi karanlığı ve hafif diş izi
    c.beginPath(); c.moveTo(mx-W,cy); kavis(yUi,false); kavis(yLi,true); c.closePath(); c.fillStyle='#040304'; c.fill();
    if(ac>.32){c.save(); c.clip(); c.fillStyle='rgba(120,116,98,.4)'; c.fillRect(mx-W*.55,yUi-2,W*1.1,5+ac*5); c.restore();}
  }
  c.beginPath(); ustD(); c.fillStyle=rgba(PAL.dudakGolge,1); c.fill();
  c.beginPath(); altD(); g=c.createLinearGradient(mx-45,0,mx+45,0); g.addColorStop(0,rgba(PAL.dudak,1)); g.addColorStop(.6,rgba(PAL.dudakGolge,1)); g.addColorStop(1,'#120a0e'); c.fillStyle=g; c.fill();
  titrek(()=>{c.moveTo(mx-W,cy); kavis(yUi,false);},PAL.murekkep,.9,2,530+k,2,1.4);
  if(ac>.05) titrek(()=>{c.moveTo(mx-W,cy); kavis(yLi,false);},PAL.murekkep,.5,1.2,533+k,2,1.2);
  titrek(()=>{c.moveTo(mx+W,cy); kavis(yLb,true);},PAL.murekkep,.4,1.1,531+k,2,1.5);
  titrek(()=>{c.moveTo(-34+mx,112); c.bezierCurveTo(-48+mx,130,-56+mx,150,-56+mx,170); c.moveTo(34+mx,112); c.bezierCurveTo(48+mx,130,56+mx,150,56+mx,170);},PAL.murekkep,.3,1.2,532+k,2,2.2);
  goz(-1,fx); goz(1,fx); kas(-1,fx); kas(1,fx);
  c.restore();
  onSac();
  // yüzün çevresinde kaotik karalamalar
  karalama(196,-150,26,60,PAL.murekkep,.35,540+k,7); karalama(-214,210,22,70,PAL.murekkep,.3,541+k,7);
}
