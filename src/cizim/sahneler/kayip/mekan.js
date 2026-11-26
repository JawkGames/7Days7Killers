// Mekân parçaları: taş duvar, sıva, tahta, kaya, toprak zemin, tavan kirişleri, gök, uzak evler.
// Hepsi (x0,y0,x1,y1) kutusuna çizilir; sahneler bunları üst üste koyarak yer kurar.
import {c} from '../../teknik/tuval.js';
import {karalama} from '../../teknik/firca.js';
import {TAU,rgba,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,hat,leke,tara} from './cizer.js';

const karis=(a,b,t)=>[lerp(a[0],b[0],t)|0,lerp(a[1],b[1],t)|0,lerp(a[2],b[2],t)|0];

// rutubet, is, morluk lekeleri ve akıntı izleri
function lekeler(x0,y0,x1,y1,seed,yogun){
  if(!yogun) return;
  const r=rng(seed+1000), n=Math.round((x1-x0)*(y1-y0)/60000*yogun);
  for(let i=0;i<n;i++) leke(lerp(x0,x1,r()),lerp(y0,y1,r()),70+r()*220,60+r()*200,[R.kirliSari,R.morluk,R.kufYesil,R.siyah][i%4],.07+r()*.12,r()*3);
  for(let i=0;i<n*.8;i++){const x=lerp(x0,x1,r()), y=lerp(y0,y1,r()*.6), u=40+r()*260;
    c.strokeStyle=`rgba(4,5,5,${.12+r()*.25})`; c.lineWidth=1+r()*2.5; c.lineCap='round';
    c.beginPath(); c.moveTo(x,y); c.bezierCurveTo(x+(r()-.5)*8,y+u*.3,x+(r()-.5)*10,y+u*.7,x+(r()-.5)*6,y+u); c.stroke();}
}

// kaba yonu taş duvar: sıra sıra düzensiz taşlar, aralarında kara harç
export function tasDuvar(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||11), renk=o.renk||R.tas, boy=o.boy||44;
  c.fillStyle=rgba(R.tasKoyu,1); c.fillRect(x0,y0,x1-x0,y1-y0);
  c.save(); c.beginPath(); c.rect(x0,y0,x1-x0,y1-y0); c.clip();
  for(let y=y0-boy*.3;y<y1;y+=boy*(.8+r()*.4)){
    const h=boy*(.75+r()*.4);
    for(let x=x0-r()*90;x<x1;){
      const w=h*(1.3+r()*1.6), k=karis(renk,R.kufYesil,r()*.6), d=r()*.35;
      const P=[[x+r()*6,y+r()*5],[x+w-r()*6,y+r()*6],[x+w-r()*4,y+h-r()*5],[x+r()*5,y+h-r()*4]];
      c.fillStyle=rgba(karis(k,R.siyah,d),1);
      c.beginPath(); c.moveTo(P[0][0],P[0][1]); for(let i=1;i<4;i++) c.lineTo(P[i][0],P[i][1]); c.closePath(); c.fill();
      leke(x+w*.3,y+h*.3,w*.4,h*.4,R.kirliSari,.05+r()*.05);
      leke(x+w*.7,y+h*.8,w*.5,h*.4,R.siyah,.25);
      if(r()<.75) hat(()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<4;i++) c.lineTo(P[i][0],P[i][1]); c.closePath();},R.murekkep,.5,1.2,(x*7+y*13)|0,1,1.6);
      x+=w+3+r()*5;
    }
  }
  c.restore();
  lekeler(x0,y0,x1,y1,o.seed||11,o.leke==null?1:o.leke);
}

// kerpiç üstü sıva: lekeler, çatlaklar, dökülen yerlerden görünen taş
export function sivaDuvar(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||21), renk=o.renk||R.siva;
  const g=c.createLinearGradient(0,y0,0,y1); g.addColorStop(0,rgba(karis(renk,R.siyah,.55),1)); g.addColorStop(.6,rgba(renk,1)); g.addColorStop(1,rgba(karis(renk,R.siyah,.4),1));
  c.fillStyle=g; c.fillRect(x0,y0,x1-x0,y1-y0);
  lekeler(x0,y0,x1,y1,o.seed||21,1.3);
  // dökük sıva yamaları
  for(let i=0;i<(o.yama==null?3:o.yama);i++){
    const x=lerp(x0,x1,r()), y=lerp(y0,y1,.2+r()*.7), w=40+r()*90, h=30+r()*60;
    const P=[]; for(let a=0;a<9;a++){const t=a/9*TAU, k=.55+r()*.5; P.push([x+Math.cos(t)*w*k,y+Math.sin(t)*h*k*.7]);}
    const yol=()=>{c.moveTo(P[0][0],P[0][1]); for(let a=1;a<P.length;a++) c.lineTo(P[a][0],P[a][1]); c.closePath();};
    c.save(); c.globalAlpha=.55; c.beginPath(); yol(); c.clip(); tasDuvar(x-w,y-h,x+w,y+h,{seed:(x|0)+7,boy:22,leke:0}); c.restore();
    hat(yol,R.murekkep,.3,1,(x|0)+9,2,3);
  }
  for(let i=0;i<(o.catlak||7);i++){ // çatlaklar
    let x=lerp(x0,x1,r()), y=lerp(y0,y1,r()*.8);
    hat(()=>{c.moveTo(x,y); for(let k=0;k<6;k++){x+=(r()-.5)*40; y+=10+r()*30; c.lineTo(x,y);}},R.murekkep,.5,1.1,300+i,1,1.2);
  }
  tara(x0,y0,x1,y1,.5,12,R.murekkep,.22,(o.seed||21)+5,1.1);
  tara(x0,y0,x1,y1,-1.1,17,R.murekkep,.14,(o.seed||21)+6,1);
}

// dikine tahta: aralarında kara yarıklar; ay ışığı sızan yarıklar ayrıca çizilir
export function tahtaDuvar(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||31), renk=o.renk||R.tahta;
  c.save(); c.beginPath(); c.rect(x0,y0,x1-x0,y1-y0); c.clip();
  for(let x=x0;x<x1;){
    const w=58+r()*44, k=karis(renk,R.siyah,r()*.5);
    c.fillStyle=rgba(k,1); c.fillRect(x,y0,w,y1-y0);
    for(let i=0;i<5;i++){const gx=x+6+r()*(w-12); hat(()=>{c.moveTo(gx,y0); c.bezierCurveTo(gx+(r()-.5)*10,lerp(y0,y1,.3),gx+(r()-.5)*12,lerp(y0,y1,.7),gx+(r()-.5)*8,y1);},R.murekkep,.18,1,(gx|0),1,2);}
    if(r()<.5){const dy=lerp(y0,y1,.2+r()*.6); hat(()=>{c.ellipse(x+w/2,dy,6,9,0,0,TAU);},R.murekkep,.5,1.2,(x|0)+4,2,1);} // budak
    c.fillStyle='rgba(2,2,2,.9)'; c.fillRect(x+w-3,y0,4,y1-y0);
    hat(()=>{c.moveTo(x+w-1,y0); c.lineTo(x+w-1+(r()-.5)*4,y1);},R.murekkep,.8,2,(x|0)+5,2,2);
    x+=w+2;
  }
  c.restore();
  tara(x0,y0,x1,y1,.08,9,R.murekkep,.3,(o.seed||31)+1,1);
  lekeler(x0,y0,x1,y1,o.seed||31,.9);
}

// mağara kayası: yumrulu, ıslak, karanlık
export function kaya(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||41);
  c.fillStyle=rgba(karis(R.tasKoyu,R.siyah,.35),1); c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let i=0;i<46;i++){
    const x=lerp(x0,x1,r()), y=lerp(y0,y1,r()), rx=50+r()*170, ry=40+r()*120, k=[R.tas,R.kufYesil,R.morluk,R.siyah][i%4];
    leke(x,y,rx,ry,k,.18+r()*.2,r()*3);
    if(r()<.6) hat(()=>{c.ellipse(x,y,rx*.6,ry*.5,r()*3,Math.PI*(.9+r()*.3),Math.PI*(1.9+r()*.4));},R.murekkep,.45,1.4,400+i,2,3);
  }
  tara(x0,y0,x1,y1,.7,9,R.murekkep,.35,(o.seed||41)+1,1.2);
  tara(x0,y0,x1,y1,-.9,14,R.murekkep,.2,(o.seed||41)+2,1);
  for(let i=0;i<10;i++) karalama(lerp(x0,x1,r()),lerp(y0,y1,r()),40+r()*50,30+r()*40,R.murekkep,.12,450+i,9);
}

// sıkıştırılmış toprak zemin
export function toprakZemin(y0,y1,G,o){
  o=o||{}; const r=rng(o.seed||51), renk=o.renk||R.toprak;
  const g=c.createLinearGradient(0,y0,0,y1); g.addColorStop(0,rgba(karis(renk,R.siyah,.45),1)); g.addColorStop(.35,rgba(renk,1)); g.addColorStop(1,rgba(karis(renk,R.siyah,.6),1));
  c.fillStyle=g; c.fillRect(-G,y0,G*2,y1-y0);
  for(let i=0;i<22;i++) leke((r()-.5)*G*2,lerp(y0,y1,r()),80+r()*220,14+r()*40,[R.siyah,R.kufYesil,R.kirliSari][i%3],.12+r()*.14);
  tara(-G,y0,G,y1,.03,6,R.murekkep,.35,(o.seed||51)+1,1);
  tara(-G,y0,G,y1,.22,13,R.kirliSari,.05,(o.seed||51)+2,1);
  for(let i=0;i<40;i++){const x=(r()-.5)*G*2, y=lerp(y0,y1,r()), w=2+r()*6; c.fillStyle=`rgba(${r()<.5?'120,110,85':'5,5,4'},${.15+r()*.3})`; c.beginPath(); c.ellipse(x,y,w,w*.45,0,0,TAU); c.fill();}
  hat(()=>{c.moveTo(-G,y0); c.lineTo(G,y0+(r()-.5)*4);},R.murekkep,.6,2.2,(o.seed||51)+3,2,3);
  leke(0,y0,G*1.2,26,R.siyah,.5); // duvar dibi karanlık
}

// toprak dam: kalın kirişler, üstünde hezen (çubuk) örgüsü
export function tavan(yAlt,yUst,G,o){
  o=o||{}; const r=rng(o.seed||61);
  c.fillStyle='#070806'; c.fillRect(-G,yUst,G*2,yAlt-yUst);
  tara(-G,yUst,G,yAlt,.02,5,R.kirliSari,.06,(o.seed||61)+1,1);
  for(let x=-G;x<G;x+=90+r()*60){const xx=x; hat(()=>{c.moveTo(xx,yUst); c.lineTo(xx+(r()-.5)*30,yAlt);},R.tahtaKoyu,.6,3,(xx|0),1,3);}
  for(let i=0;i<(o.kiris||3);i++){
    const y=yAlt-14-i*62-r()*10, k=18+r()*8;
    c.fillStyle=rgba(karis(R.tahta,R.siyah,.45),1); c.beginPath(); c.moveTo(-G,y-k); c.bezierCurveTo(-G*.3,y-k-6,G*.3,y-k+5,G,y-k-3); c.lineTo(G,y+k); c.bezierCurveTo(G*.3,y+k+4,-G*.3,y+k-4,-G,y+k); c.closePath(); c.fill();
    leke(0,y+k*.6,G,k*.7,R.siyah,.5);
    hat(()=>{c.moveTo(-G,y+k); c.bezierCurveTo(-G*.3,y+k-4,G*.3,y+k+4,G,y+k);},R.murekkep,.8,1.8,620+i,2,2);
    hat(()=>{c.moveTo(-G,y-k); c.bezierCurveTo(-G*.3,y-k-6,G*.3,y-k+5,G,y-k-3);},R.murekkep,.6,1.4,630+i,2,2);
  }
  leke(0,yAlt+10,G*1.3,40,R.siyah,.6);
}

// gök: gece ya da şafak; ay isteğe bağlı
export function gok(y0,y1,G,o){
  o=o||{}; const r=rng(o.seed||71), tur=o.tur||'gece';
  const g=c.createLinearGradient(0,y0,0,y1);
  if(tur==='safak'){g.addColorStop(0,'#07090b'); g.addColorStop(.55,'#1a2226'); g.addColorStop(.85,'#3a3f38'); g.addColorStop(1,'#5a5640');}
  else if(tur==='aksam'){g.addColorStop(0,'#080809'); g.addColorStop(.5,'#1d1b22'); g.addColorStop(.85,'#3d3326'); g.addColorStop(1,'#5e4a2a');}
  else if(tur==='bulut'){g.addColorStop(0,'#101312'); g.addColorStop(.7,'#2a302c'); g.addColorStop(1,'#3e4339');}
  else {g.addColorStop(0,'#030405'); g.addColorStop(.6,'#0e1416'); g.addColorStop(1,'#26302f');}
  c.fillStyle=g; c.fillRect(-G,y0,G*2,y1-y0);
  for(let i=0;i<12;i++) leke((r()-.5)*G*2,lerp(y0,y1,r()*.8),200+r()*300,40+r()*60,tur==='gece'?R.kufYesil:R.morluk,.08+r()*.08);
  if(tur==='gece') for(let i=0;i<40;i++){c.fillStyle=`rgba(200,205,190,${.08+r()*.25})`; c.beginPath(); c.arc((r()-.5)*G*2,lerp(y0,y1,r()*.7),.6+r()*1.2,0,TAU); c.fill();}
  if(o.ay){const [ax,ay]=o.ay; leke(ax,ay,160,160,R.ay,.18); leke(ax,ay,50,50,R.ay,.35); c.fillStyle='rgba(190,200,185,.75)'; c.beginPath(); c.arc(ax,ay,15,0,TAU); c.fill(); c.fillStyle='rgba(20,26,26,.6)'; c.beginPath(); c.arc(ax+6,ay-3,13,0,TAU); c.fill();}
  tara(-G,y0,G,y1,.15,14,R.murekkep,.22,(o.seed||71)+1,1);
}

// uzakta toprak damlı evler ve bir iki ağaç: ufuk çizgisinin altında siyah kütle
export function uzakEvler(ufuk,G,o){
  o=o||{}; const r=rng(o.seed||81);
  c.fillStyle='#050606'; c.beginPath(); c.moveTo(-G,ufuk+10);
  for(let x=-G;x<G;){const w=70+r()*140, h=24+r()*50; c.lineTo(x,ufuk-h); c.lineTo(x+w,ufuk-h+(r()-.5)*6); x+=w+r()*30; c.lineTo(x,ufuk+4);}
  c.lineTo(G,ufuk+200); c.lineTo(-G,ufuk+200); c.closePath(); c.fill();
  for(let i=0;i<(o.agac||3);i++){const x=(r()-.5)*G*1.8, h=90+r()*90; leke(x,ufuk-h,40+r()*30,h*.5,R.siyah,.9); c.fillStyle='#050606'; c.fillRect(x-3,ufuk-h*.5,6,h*.5);}
}

// köşelerin ve tepenin karanlığa gömülmesi
export function karart(G,ust,alt){
  leke(-G,(ust+alt)/2,G*.7,(alt-ust)*.8,R.siyah,.7);
  leke(G,(ust+alt)/2,G*.7,(alt-ust)*.8,R.siyah,.7);
  leke(0,ust,G*1.4,260,R.siyah,.6);
}

// üstü yuvarlak duvar oyuğu (niş): içi karanlık
export function nis(x,y,w,h,o){
  o=o||{};
  const yol=()=>{c.moveTo(x-w/2,y); c.lineTo(x-w/2,y-h+w/2); c.arc(x,y-h+w/2,w/2,Math.PI,0); c.lineTo(x+w/2,y); c.closePath();};
  c.fillStyle=o.ic||'#0a0b09'; c.beginPath(); yol(); c.fill();
  c.save(); c.beginPath(); yol(); c.clip(); leke(x,y-h*.3,w*.7,h*.6,R.siyah,.6); tara(x-w/2,y-h,x+w/2,y,.9,7,R.murekkep,.4,(x|0)+3); c.restore();
  hat(yol,R.murekkep,.85,1.8,(x|0)+1,2,2);
  hat(()=>{c.moveTo(x-w/2-4,y+3); c.lineTo(x+w/2+4,y+2);},R.kirliSari,.25,2,(x|0)+2,1,1);
}
