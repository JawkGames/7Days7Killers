// Yüz: boya katmanı, gölge taraması, hatlar, burun, ağız, göz, kaş. Ölçüler etkin görünüşten (G) gelir.
// Bütün çarpanlar 1 olduğunda (varsayılan kadın) sayılar prototiptekiyle birebir aynıdır; bu yüzden
// dönüşümler yalnızca çarpan 1'den farklıyken uygulanır.
import {c} from '../teknik/tuval.js';
import {leke,tara,titrek,karalama} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,rgba,lerp,clamp} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G} from './gorunus.js';
import {onSac} from './sac.js';
import {sakal,biyik} from './sakal.js';
import {baslikOn,baslikGolge} from './baslik.js';
import {yuzYoluOzel,yapiBoya,yapiHat,gozAki,figurDonusumu,basDonusumu} from './yapi.js';
import {gozluk,izler,izBoya,gulumseme,kirikBurun,perdeliGoz,tozSac} from './ayrinti.js';

export function yuzYolu(){
  if(G.ozel){yuzYoluOzel(); return;}
  const Y=G.yuz, e=Y.en, m=e*Y.elmacik, j=e*Y.cene, ju=e*Y.ceneUc, b=Y.boy, u=Y.alin;
  c.moveTo(0,-200*u);
  c.bezierCurveTo(95*e,-202*u,152*e,-150*u,158*e,-50*u); c.bezierCurveTo(161*m,20*b,146*m,88*b,118*j,140*b);
  c.bezierCurveTo(100*j,178*b,64*ju,206*b,32*ju,215*b); c.bezierCurveTo(13*ju,220*b,-13*ju,220*b,-32*ju,215*b);
  c.bezierCurveTo(-64*ju,206*b,-100*j,178*b,-118*j,140*b); c.bezierCurveTo(-146*m,88*b,-161*m,20*b,-158*e,-50*u);
  c.bezierCurveTo(-152*e,-150*u,-95*e,-202*u,0,-200*u); c.closePath();
}
// ağzın dikey kayması: yüz uzadıkça, burun uzadıkça ağız aşağı iner
export function agizKaymasi(){const Y=G.yuz; return (Y.boy-1)*152+(Y.burunBoy-1)*60+Y.agizY;}

export function goz(yon,fx){
  const Y=G.yuz, R=G.renk, oz=G.ozel, I=G.ifade;
  // yeni yol: tek göze özel perde (sütlü iris, düşük kapak) ve kalıcı bakış (yere bakan kapaklar biraz iner)
  const perde=oz&&G.gozFarki&&((G.gozFarki.perde==='sol')===(yon<0));
  let o=clamp(poz.goz,0,1); const k=poz.kaynama;
  if(oz&&I.bakisY>0) o*=1-.2*I.bakisY;
  const kp=perde?Y.gozKapak+G.gozFarki.kapak:Y.gozKapak;
  const gul=oz?Math.max(0,I.agizKose)*5:0; // gülen yüzde alt kapak kalkar, göz kısılır
  const ust=lerp(9,-19+kp*12,o), alt=gul?lerp(9,11-gul,o):lerp(9,11,o), U=[-31,5,-18,ust,12,ust-2,31,-4];
  c.save(); c.translate(yon*Y.gozAralik+fx,0); c.scale(yon*Y.gozEn,Y.gozBoy);
  c.save();
  c.beginPath(); c.moveTo(-31,5); c.bezierCurveTo(U[2],U[3],U[4],U[5],U[6],U[7]); c.bezierCurveTo(16,alt,-12,alt+2,-31,5); c.closePath(); c.clip();
  let g=c.createRadialGradient(0,2,2,0,2,36);
  if(G.ozel){const [a1,a2,a3]=gozAki(); g.addColorStop(0,rgba(a1,1)); g.addColorStop(.6,rgba(a2,1)); g.addColorStop(1,rgba(a3,1));}
  else{g.addColorStop(0,'#9b9886'); g.addColorStop(.6,'#5f5d55'); g.addColorStop(1,'#26252a');}
  c.fillStyle=g; c.fillRect(-36,-26,72,48);
  let ix=clamp(oz?poz.gx+I.bakisX:poz.gx,-1,1)*10*yon, iy=clamp(oz?poz.gy+I.bakisY:poz.gy,-1,1)*4.5-2;
  if(perde){ ix=ix*.35+3; perdeliGoz(ix,iy,ust); }
  else{
  g=c.createRadialGradient(ix,iy+1,1,ix,iy,12.5); g.addColorStop(0,rgba(R.iris,1)); g.addColorStop(.62,rgba(R.irisOrta,1)); g.addColorStop(.9,rgba(R.irisKenar,1)); g.addColorStop(1,'rgba(6,7,7,1)');
  c.fillStyle=g; c.beginPath(); c.arc(ix,iy,12.5,0,TAU); c.fill();
  c.fillStyle='#030303'; c.beginPath(); c.arc(ix,iy,3.6,0,TAU); c.fill(); // küçük, iğne ucu gözbebeği
  g=c.createLinearGradient(0,ust-4,0,ust+20); g.addColorStop(0,'rgba(6,5,8,.92)'); g.addColorStop(1,'rgba(6,5,8,0)');
  c.fillStyle=g; c.fillRect(-36,-26,72,48);
  c.fillStyle=rgba([255,240,205],.85*poz.isik); c.beginPath(); c.ellipse(ix-4*yon,iy-4,1.9,2.3,0,0,TAU); c.fill();
  }
  c.restore();
  // kapak hatları: titrek mürekkep
  titrek(()=>{c.moveTo(-33,6); c.bezierCurveTo(U[2],U[3]-1,U[4],U[5]-1,36,-7);},PAL.murekkep,.95,3.2,400+yon+k,2,1.6);
  titrek(()=>{c.moveTo(31,-4); c.bezierCurveTo(16,alt,-12,alt+2,-31,5);},PAL.murekkep,.55,1.3,410+yon+k,2,1.4);
  titrek(()=>{c.moveTo(-30,-3); c.bezierCurveTo(-17,ust-9,12,ust-12,34,-12);},PAL.murekkep,.6,1.4,420+yon+k,2,1.6);
  titrek(()=>{c.moveTo(-24,22); c.quadraticCurveTo(0,30,26,20);},PAL.murekkep,.35*G.yasIzi.gozAlti,1.2,430+yon+k,2,2); // göz altı torbası
  if(G.yasIzi.gozAlti>1.05) titrek(()=>{c.moveTo(-18,34); c.quadraticCurveTo(4,44,30,30);},PAL.murekkep,.3*(G.yasIzi.gozAlti-1),1.1,432+yon+k,2,2);
  if(kp>0) titrek(()=>{c.moveTo(-28,-14); c.bezierCurveTo(-12,-24-kp*4,14,-26-kp*4,38,-10);},PAL.murekkep,.45*kp+.15,1.3,434+yon+k,2,1.6); // ağır kapak kıvrımı
  c.restore();
}
export function kas(yon,fx){
  const Y=G.yuz, kk=Y.kasKalin, eg=Y.kasEgim;
  const ic=poz.kasCat*7-poz.kasKaldir*3, k=poz.kaynama, r=rng(yon>0?21:22);
  const tek=G.ozel?(yon<0?G.ifade.kasSol:G.ifade.kasSag):0; // tek kaş yüksek (artı = aşağı, eksi = yukarı)
  c.save(); c.translate(yon*Y.gozAralik+fx*.8,-43+Y.kasY-poz.kasKaldir*6+tek); c.scale(yon,1);
  if(tek<0) c.rotate(tek*.006); // kalkık kaşın dış ucu biraz iner: kemerli, sorgulayan kaş
  if(kk!==1){ // gür kaş: tellerin altında koyu, dışa doğru incelen bir leke
    const ust=x=>lerp(8+ic,-1,Math.sin((x+36)/80*Math.PI*.6))-6.5*Math.sin((x+36)/80*Math.PI)+eg*(x-4);
    c.beginPath(); for(let x=-38;x<=46;x+=6) c.lineTo(x,ust(x)-3.5*kk*(1-(x+38)/84*.5));
    for(let x=46;x>=-38;x-=6) c.lineTo(x,ust(x)+3*kk*(1-(x+38)/84*.6));
    c.closePath(); c.fillStyle=rgba(G.renk.kas,clamp(.25+(kk-1)*.4,0,.7)); c.fill();
  }
  c.strokeStyle=rgba(G.renk.kas,.8); c.lineCap='round';
  const n=kk===1?54:Math.round(54*kk);
  for(let i=0;i<n;i++){const t=r(), x=lerp(-36,44,t), y=lerp(8+ic*(1-t),-1,Math.sin(t*Math.PI*.6))-6.5*Math.sin(t*Math.PI)+eg*(x-4); c.lineWidth=(.7+r()*1.1)*kk; c.beginPath();
    if(kk===1){c.moveTo(x,y+3); c.lineTo(x+5+r()*5,y-3-r()*2+t*3);}
    else{const h=kk*(1-t*.45); c.moveTo(x,y+3*h); c.lineTo(x+5+r()*5,y-(3+r()*2)*h+t*3);} // kalın kaş: iç uçta gür, dışa doğru incelir
    c.stroke();}
  titrek(()=>{c.moveTo(-36,7+ic-eg*40); c.bezierCurveTo(-18,-6+ic*.5-eg*22,6,-12+eg*2,18,-10+eg*14); c.bezierCurveTo(30,-8+eg*26,39,-3+eg*35,46,4+eg*42);},PAL.murekkep,.6,1.5,440+yon+k,2,1.8);
  c.restore();
}
function kulak(s){ // kısa saçta, kelde, kasketin altında görünür; yüzün arkasına çizilir
  const Y=G.yuz, R=G.renk, k=poz.kaynama, x=s*150*Y.en, b=Y.boy;
  if(G.ozel) return kulakOzel(s);
  const yol=()=>{c.moveTo(x,-40); c.bezierCurveTo(x+s*30,-58,x+s*44,-14,x+s*36,24*b); c.bezierCurveTo(x+s*30,62*b,x+s*22,96*b,x+s*2,100*b); c.closePath();};
  c.beginPath(); yol(); c.fillStyle=rgba(s<0?R.tenOrta:R.tenGolge,1); c.fill();
  c.save(); c.clip();
  leke(x+s*16,10,22,44,s<0?R.tenDerin:PAL.siyah,s<0?.55:.75);
  if(s<0) leke(x-26,-14,10,26,R.tenIsik,.3*poz.isik);
  c.restore();
  titrek(yol,PAL.murekkep,.7,1.5,560+s+k,2,1.8);
  titrek(()=>{c.moveTo(x+s*10,-18); c.bezierCurveTo(x+s*28,-30,x+s*30,10,x+s*20,40*b);},PAL.murekkep,.45,1.2,562+s+k,2,1.6);
}
// yeni yol: yaşla büyüyen, gölgede taranmış, kıkırdak hatları olan kulak; kafaya birleştiği yerde koyu gölge
function kulakOzel(s){
  const Y=G.yuz, R=G.renk, k=poz.kaynama, x=s*146*Y.en, b=Y.boy, q=G.yapi.kulak;
  c.save(); c.translate(x,-40); c.scale(q*.84,q); c.translate(-x,40); // kulak dar: yandan değil, önden görülüyor
  const yol=()=>{c.moveTo(x-s*4,-46); c.bezierCurveTo(x+s*26,-66,x+s*46,-30,x+s*40,10*b); c.bezierCurveTo(x+s*36,52*b,x+s*24,86*b,x+s*14,100*b);
    c.bezierCurveTo(x+s*6,112*b,x-s*6,106*b,x-s*4,88*b); c.closePath();};
  c.beginPath(); yol();
  const g=c.createLinearGradient(x-s*10,-60,x+s*40,100); g.addColorStop(0,rgba(s<0?R.ten:R.tenOrta,1)); g.addColorStop(1,rgba(s<0?R.tenGolge:R.tenDerin,1));
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  leke(x+s*18,20,16,40,R.tenDerin,s<0?.6:.85); // kulak çukuru
  leke(x,30,14,70,PAL.siyah,.6); // kafaya birleşme gölgesi
  leke(x+s*20,20,30,80,R.tenDerin,s<0?.3:.6); // kulak yüzden geride: daha karanlık
  if(s<0) leke(x-26,-30,8,22,R.tenIsik,.28*poz.isik);
  tara(x-60,-70,x+60,110,1.05,5,PAL.murekkep,s<0?.3:.5,566+s+k,1);
  c.restore();
  titrek(yol,PAL.murekkep,.8,1.6,560+s+k,2,1.8);
  titrek(()=>{c.moveTo(x+s*6,-30); c.bezierCurveTo(x+s*30,-42,x+s*32,6,x+s*24,44*b); c.quadraticCurveTo(x+s*18,64*b,x+s*10,70*b);},PAL.murekkep,.55,1.2,562+s+k,2,1.6);
  titrek(()=>{c.moveTo(x+s*14,0); c.quadraticCurveTo(x+s*22,24,x+s*12,40*b);},PAL.murekkep,.45,1.1,564+s+k,2,1.4);
  c.restore();
}
function yasIzleri(fx,fy,mx,dy){
  const A=G.yasIzi, Y=G.yuz, e=Y.en, b=Y.boy, u=Y.alin, k=poz.kaynama, a=A.kirisik;
  if(A.lekeler>0){ const r=rng(77); for(let i=0;i<7;i++){ const x=(-120+r()*200)*e, y=(-150+r()*260)*b; leke(x,y,4+r()*7,3+r()*6,G.renk.tenGolge,.35*A.lekeler); } }
  if(a<=0) return;
  // alın çizgileri: yalnızca alının orta bandında
  for(let i=0;i<3;i++){ const y=(-104-i*20)*u, w=(70-i*6)*e;
    titrek(()=>{c.moveTo(-w,y+4); c.bezierCurveTo(-w*.4,y-5,w*.3,y+4,w,y-2);},PAL.murekkep,.42*a,1.1,600+i+k,2,1.6); }
  // kaz ayağı: göz dış köşelerinde
  for(const s of[-1,1]){ const x=s*(Y.gozAralik+38)+fx;
    titrek(()=>{for(let i=0;i<3;i++){c.moveTo(x,-4+i*9); c.lineTo(x+s*(14+i*3),-10+i*13);}},PAL.murekkep,.55*a,1.1,610+s+k,2,1.4); }
  // derin burun-dudak oluğu ve ağız köşesinden inen çizgiler
  titrek(()=>{c.moveTo((-36+mx)*e,116); c.bezierCurveTo((-52+mx)*e,136,(-62+mx)*e,160+dy,(-60+mx)*e,184+dy); c.moveTo((36+mx)*e,116); c.bezierCurveTo((52+mx)*e,136,(62+mx)*e,160+dy,(60+mx)*e,184+dy);},PAL.murekkep,.55*a,1.4,620+k,2,2);
  titrek(()=>{c.moveTo(mx-50,160+dy); c.quadraticCurveTo(mx-58,180+dy,mx-56,200*b); c.moveTo(mx+50,160+dy); c.quadraticCurveTo(mx+58,180+dy,mx+56,200*b);},PAL.murekkep,.5*a,1.2,622+k,2,1.6);
  // yanakta çöküntü çizgisi
  if(a>.6){ // çok yaşlı: sarkan çene hattı ve üst dudakta dikey çizgiler
    const ja=(a-.6)*2.5;
    titrek(()=>{for(const s of[-1,1]){c.moveTo(s*112*e,120*b); c.quadraticCurveTo(s*92*e,190*b,s*48,212*b);}},PAL.murekkep,.45*ja,1.2,626+k,2,1.8);
    titrek(()=>{for(let i=-2;i<=2;i++){if(!i) continue; c.moveTo(mx+i*11,130+dy); c.lineTo(mx+i*12,141+dy);}},PAL.murekkep,.4*ja,1,628+k,2,1.2);
  }
  if(a>.5) titrek(()=>{c.moveTo(-118*e+fx*.4,40); c.quadraticCurveTo(-112*e,90,-96*e,130*b); c.moveTo(118*e+fx*.4,40); c.quadraticCurveTo(112*e,90,96*e,130*b);},PAL.murekkep,.45*(a-.5)*2,1.2,624+k,2,1.8);
}

export function kafa(){
  const D=figurDonusumu(false), B=basDonusumu(); kafaCiz(); if(B) c.restore(); if(D) c.restore();
}
function kafaCiz(){
  const Y=G.yuz, R=G.renk, A=G.yasIzi, e=Y.en, b=Y.boy, u=Y.alin, ga=Y.gozAralik;
  const fx=poz.hgx*7, fy=poz.hgy*4, k=poz.kaynama, I=poz.isik;
  const dyA=agizKaymasi(), NB=Y.burunBoy, NE=Y.burunEn, ny=y=>NB===1?y:-14+(y+14)*NB;
  if(G.kulak){kulak(-1); kulak(1);}
  // ── boya katmanı
  c.beginPath(); yuzYolu();
  let g=c.createLinearGradient(-140*e,-200*u,130*e,220*b); g.addColorStop(0,rgba(R.tenIsik,1)); g.addColorStop(.38,rgba(R.ten,1)); g.addColorStop(.7,rgba(R.tenOrta,1)); g.addColorStop(1,rgba(R.tenGolge,1));
  c.fillStyle=g; c.fill();
  c.save(); c.clip();
  leke(150*e,30*b,175*e,310*b,R.tenDerin,.94); leke(118*e,20*b,110*e,300*b,R.tenDerin,.8); // yüzün yarısı karanlıkta
  leke(-210*e,70*b,84*e,240*b,R.tenGolge,.6);
  leke(-40*e,-118*u,116*e,66*u,R.alinIsik,.26*I);
  leke(60*e,-128*u,150*e,54*u,R.tenDerin,.6); leke(-104*e,-150*u,70*e,50*u,R.tenDerin,.5);
  const cu=G.ozel?clamp(.5+.38*G.yapi.cukur,.6,1.05):1; // yeni yolda göz çukuru derinliği yapıdan gelir
  for(const s of[-1,1]){
    leke(s*ga+fx,-6+fy,62,40,R.tenDerin,cu===1?(s>0?.92:.84):(s>0?.92:.84)*cu);  // çökük göz çukurları
    leke(s*ga+fx,22+fy,34,12,PAL.morluk,.5*A.gozAlti);
    leke(s*96*e+fx*.4,118*b,40,46,R.tenGolge,(s>0?.5:.42)*A.cokukYanak);  // çökük yanak
    leke(s*100*e+fx*.5,74*b,50,34,PAL.morluk,.16);
  }
  leke(-100*e+fx*.5,44*b,42,20,R.tenIsik,.24*I);
  if(G.cinsiyet==='E'){ // erkek yüzü: kaş kemeri ve çene kemiği altında koyu gölge
    leke(fx*.6,-40,150*e,22,R.tenDerin,.3);
    for(const s of[-1,1]) leke(s*112*e,176*b,46*e,30,R.tenDerin,s>0?.6:.35);
  }
  const nx=fx*1.5, mx=fx*1.15;
  if(G.ozel){ yapiBoya(fx,fy,mx,dyA); izBoya(fx,fy,mx,dyA); }
  leke(-4*NE+nx,ny(28)+fy,7*NE,60*NB,R.tenIsik,.34*I); leke(15*NE+nx,ny(44)+fy,12*NE,60*NB,R.tenDerin,.55);
  leke(-3*NE+nx,ny(88)+fy,13*NE,10,R.tenIsik,.3*I); leke(nx,ny(120)+fy,38*NE,13,R.tenDerin,.75);
  leke(mx,194+fy+dyA+poz.agizAc*17,38,11,R.tenDerin,.6); leke(0,246*b,160*e,44,R.tenDerin,.8);
  // ── mürekkep taraması: yalnızca gölge yanı ve çukurlar (yüzün tamamını kaplamaz)
  tara(10*e,-210*u,175*e,230*b,1.05,6,PAL.murekkep,.55,500+k,1.1);
  tara(60*e,-210*u,175*e,230*b,-.5,8,PAL.murekkep,.4,501+k,1.1);
  tara(-165*e,40*b,-80*e,200*b,.9,7,PAL.murekkep,.3,502+k);
  for(const s of[-1,1]) tara(s*ga-44+fx,-40+fy,s*ga+44+fx,34+fy,s*.5,5,PAL.murekkep,.4,503+s+k);
  tara(-60,200+dyA,60,222+dyA,.1,5,PAL.murekkep,.35,505+k);
  c.restore();
  // ── hatlar
  if(G.ozel) yapiHat(fx,mx,dyA); else titrek(()=>{yuzYolu();},PAL.murekkep,.75,1.8,510+k,2,2.6);
  c.save(); c.translate(0,fy);
  yasIzleri(fx,fy,mx,dyA);
  // burun: tek yanı çizgi, delikler
  const burunDon=NB!==1||NE!==1;
  if(burunDon){c.save(); c.translate(0,-14); c.scale(NE,NB); c.translate(0,14);}
  const kirik=G.ozel&&G.iz.find(z=>z.tur==='kirikBurun');
  if(kirik) kirikBurun(nx,kirik);
  else titrek(()=>{c.moveTo(12+nx,-14); c.bezierCurveTo(16+nx,30,22+nx,70,27+nx,96); c.bezierCurveTo(30+nx,108,22+nx,114,12+nx,112);},PAL.murekkep,.7,1.5,520+k,2,1.8);
  titrek(()=>{c.moveTo(-26+nx,100); c.bezierCurveTo(-30+nx,110,-22+nx,114,-13+nx,111); c.moveTo(-9+nx,112); c.quadraticCurveTo(nx,118,9+nx,112);},PAL.murekkep,.6,1.4,521+k,2,1.6);
  for(const s of[-1,1]){c.fillStyle='rgba(6,5,7,.9)'; c.beginPath(); c.ellipse(nx+s*15,108.5,7.6,3.6,s*-.28,0,TAU); c.fill();}
  if(burunDon) c.restore();
  if(G.sakal.bicim!=='yok') sakal(mx,dyA);
  // ağız: köşeler sabit kalır, dudaklar esneyerek açılır (alt dudak yüzden kopmaz)
  if(dyA!==0){c.save(); c.translate(0,dyA);}
  const dk=Y.dudakKalin, a=poz.agiz, cy=152-a*5, ac=poz.agizAc, W=45*Y.dudakEn*poz.agizGen*(1-ac*.08)*(G.ozel&&G.ifade.agizKose>0?1+G.ifade.agizKose*.12:1);
  const yUst=(dk===1?137:152-15*dk)-ac*2, yUi=153-ac*3, yLi=154+ac*17, yLb=(dk===1?175:152+23*dk)+ac*19;
  // dinlenme ifadesi (yeni yol): köşeler kalıcı olarak yukarı/aşağı; konuşurken de yerinde kalır, dudaklar esner
  const IF=G.ifade, kose=G.ozel?IF.agizKose*15:0, yan=G.ozel?IF.agizYan*12:0;
  const cL=kose||yan?cy-kose+yan:cy, cR=kose||yan?cy-kose-yan:cy; // cL: ekranda sol köşe, cR: sağ köşe
  const orta=cL===cR?T=>(T-cy/4)/.75:T=>(T-(cL+cR)/8)/.75; // köşeden köşeye eğrinin ortası T yüksekliğine gelsin
  const kavis=(T,ters)=>{const y=orta(T); if(ters) c.bezierCurveTo(mx+W*.6,y,mx-W*.6,y,mx-W,cL); else c.bezierCurveTo(mx-W*.6,y,mx+W*.6,y,mx+W,cR);};
  const ustD=()=>{c.moveTo(mx-W,cL); c.bezierCurveTo(mx-W*.67,cL-7,mx-W*.47,yUst,mx-W*.24,yUst); c.quadraticCurveTo(mx-W*.09,yUst,mx,yUst+4.5); c.quadraticCurveTo(mx+W*.09,yUst,mx+W*.24,yUst); c.bezierCurveTo(mx+W*.47,yUst,mx+W*.67,cR-7,mx+W,cR); kavis(yUi,true); c.closePath();};
  const altD=()=>{c.moveTo(mx-W,cL); kavis(yLi,false); kavis(yLb,true); c.closePath();};
  if(ac>.02){ // ağız içi karanlığı ve hafif diş izi
    c.beginPath(); c.moveTo(mx-W,cL); kavis(yUi,false); kavis(yLi,true); c.closePath(); c.fillStyle='#040304'; c.fill();
    if(ac>.32){c.save(); c.clip(); c.fillStyle='rgba(120,116,98,.4)'; c.fillRect(mx-W*.55,yUi-2,W*1.1,5+ac*5); c.restore();}
  }
  const de=45*Y.dudakEn;
  c.beginPath(); ustD(); c.fillStyle=rgba(R.dudakGolge,1); c.fill();
  c.beginPath(); altD(); g=c.createLinearGradient(mx-de,0,mx+de,0); g.addColorStop(0,rgba(R.dudak,1)); g.addColorStop(.6,rgba(R.dudakGolge,1)); g.addColorStop(1,'#120a0e'); c.fillStyle=g; c.fill();
  titrek(()=>{c.moveTo(mx-W,cL); kavis(yUi,false);},PAL.murekkep,.9,2,530+k,2,1.4);
  if(ac>.05) titrek(()=>{c.moveTo(mx-W,cL); kavis(yLi,false);},PAL.murekkep,.5,1.2,533+k,2,1.2);
  titrek(()=>{c.moveTo(mx+W,cR); kavis(yLb,true);},PAL.murekkep,.4,1.1,531+k,2,1.5);
  if(G.ozel&&(kose||yan)) gulumseme(mx,W,cL,cR);
  if(G.biyik.bicim!=='yok') biyik(mx,152-15*dk-2);
  if(dyA!==0) c.restore();
  titrek(()=>{c.moveTo(-34*e+mx,112); c.bezierCurveTo(-48*e+mx,130,-56*e+mx,150+dyA,-56*e+mx,170+dyA); c.moveTo(34*e+mx,112); c.bezierCurveTo(48*e+mx,130,56*e+mx,150+dyA,56*e+mx,170+dyA);},PAL.murekkep,G.ozel?.3*(1-.75*G.yapi.dolgun):.3,1.2,532+k,2,2.2);
  goz(-1,fx); goz(1,fx); kas(-1,fx); kas(1,fx);
  if(G.ozel){ izler(fx,mx,dyA); if(G.gozluk) gozluk(fx); }
  c.restore();
  if(G.ozel) baslikGolge(); // başlığın ve saçın yüze düşen gölgesi: saçtan ve başlıktan önce
  onSac();
  if(G.ozel&&G.toz) tozSac();
  baslikOn();
  // yüzün çevresinde kaotik karalamalar
  karalama(196*e,-150*u,26,60,PAL.murekkep,.35,540+k,7); karalama(-214*e,210*b,22,70,PAL.murekkep,.3,541+k,7);
}
