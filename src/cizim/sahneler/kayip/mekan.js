// Mekân parçaları: taş duvar, sıva, tahta, kaya, toprak zemin, tavan kirişleri, gök, uzak evler.
// Hepsi (x0,y0,x1,y1) kutusuna çizilir; sahneler bunları üst üste koyarak yer kurar.
// Dil sorgu odasıyla aynı: düz renk zemin + çamurlu lekeler + ışıktan uzaklaştıkça koyulaşan çapraz tarama
// + akıntı izleri + kazıntılar. Düz gradyanlı yüzey bırakılmaz.
import {c} from '../../teknik/tuval.js';
import {TAU,rgba,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,DURUM,hat,leke,tara,golgeTara,akinti,kazinti,karalama} from './cizer.js';

const karis=(a,b,t)=>[lerp(a[0],b[0],t)|0,lerp(a[1],b[1],t)|0,lerp(a[2],b[2],t)|0];

// rutubet, is, morluk lekeleri
function lekeler(x0,y0,x1,y1,seed,yogun){
  if(!yogun) return;
  const r=rng(seed+1000), n=Math.round((x1-x0)*(y1-y0)/50000*yogun);
  for(let i=0;i<n;i++) leke(lerp(x0,x1,r()),lerp(y0,y1,r()),70+r()*240,60+r()*220,[R.kirliSari,R.morluk,R.kufYesil,R.siyah][i%4],.09+r()*.14,r()*3);
}
// duvarın ortak kiri: lekeler, tonlu tarama, sıcak açık tarama (ışık tarafında), akıntılar, kazıntılar
function kir(x0,y0,x1,y1,seed,o){
  o=o||{};
  lekeler(x0,y0,x1,y1,seed,o.leke==null?1:o.leke);
  tara(x0,y0,x1,y1,.42,12,R.murekkep,o.zemin==null?.13:o.zemin,seed+40,1.1); // her yerde ince bir kat
  if(o.yerel) tara(x0,y0,x1,y1,-1.05,13,R.murekkep,.22,seed+50,1.2); // eşya içinde: ışık yerel değil, düz kat
  else golgeTara(x0,y0,x1,y1,seed+50,{alfa:o.golge||1});
  tara(x0,y0,x1,y0+(y1-y0)*.85,1.3,22,R.sicakAcik,.05,seed+60,1);
  akinti(x0,y0,x1,y1,seed+70,Math.round((x1-x0)/60*(o.akinti==null?1:o.akinti)));
  kazinti(x0,y0+(y1-y0)*.15,x1,y1,seed+80,Math.round((x1-x0)/220));
}

// kaba yonu taş duvar: düzensiz taşlar, aralarında kara harç; taşın yalnız üst ve ışık kenarı mürekkeple çizilir
export function tasDuvar(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||11), renk=o.renk||R.tas, boy=o.boy||46;
  c.fillStyle=rgba(karis(R.tasKoyu,R.siyah,.2),1); c.fillRect(x0,y0,x1-x0,y1-y0);
  c.save(); c.beginPath(); c.rect(x0,y0,x1-x0,y1-y0); c.clip();
  // moloz taş: sıra yüksekliği ve taş boyu çok değişir, kenarlar yamuk; harç taştan az koyu (ızgara gibi durmasın)
  for(let y=y0-boy*.3;y<y1;y+=boy*(.6+r()*.5)){
    const h0=boy*(.55+r()*.6);
    for(let x=x0-r()*90;x<x1;){
      const h=h0*(.7+r()*.6), w=boy*(.7+r()*1.9), k=karis(renk,R.kufYesil,r()*.6), d=.08+r()*.5, j=()=>(r()-.5)*14;
      const P=[[x+r()*10,y+r()*10],[x+w*.5+j(),y-r()*6],[x+w-r()*10,y+r()*10],[x+w+j()*.5,y+h*.5+j()],[x+w-r()*10,y+h-r()*8],[x+w*.5+j(),y+h+r()*4],[x+r()*8,y+h-r()*8],[x-r()*4,y+h*.5+j()]];
      const yol=()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++) c.lineTo(P[i][0],P[i][1]); c.closePath();};
      c.fillStyle=rgba(karis(k,R.siyah,d),.55); c.beginPath(); yol(); c.fill(); // yarı saydam: harçla kaynaşır
      leke(x+w*.35,y+h*.3,w*.4,h*.35,R.kirliSari,.04+r()*.05);
      leke(x+w*.6,y+h*.85,w*.55,h*.45,R.siyah,.3);
      // açık uçlu kontur: üst kenar ve bir yan; kapalı kutu çizilmez (fayans gibi durmasın)
      if(r()<.55) hat(()=>{c.moveTo(P[6][0],P[6][1]); c.lineTo(P[7][0],P[7][1]); c.lineTo(P[0][0],P[0][1]); c.lineTo(P[1][0],P[1][1]); c.lineTo(P[2][0],P[2][1]);},R.murekkep,.42,1.3,(x*7+y*13)|0,1,2.2);
      if(r()<.35) hat(()=>{c.moveTo(P[3][0],P[3][1]); c.lineTo(P[4][0],P[4][1]); c.lineTo(P[5][0],P[5][1]);},R.murekkep,.4,1.1,(x*5+y*3)|0,1,1.6);
      x+=w+3+r()*6;
    }
  }
  c.restore();
  kir(x0,y0,x1,y1,o.seed||11,{leke:o.leke==null?1.2:o.leke,zemin:.16,golge:1.3,akinti:1,yerel:o.yerel});
}

// kerpiç üstü sıva: lekeler, çatlaklar, dökülen yerlerden görünen taş
export function sivaDuvar(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||21), renk=o.renk||R.siva;
  c.fillStyle=rgba(karis(renk,R.siyah,.22),1); c.fillRect(x0,y0,x1-x0,y1-y0);
  // sıvanın altta kirlenmiş bandı ve tepedeki is: düz gradyan yerine leke sıraları
  for(let x=x0;x<x1;x+=140) {leke(x+r()*60,y1-40,160,120,R.siyah,.22+r()*.12); leke(x+r()*60,y0+30,170,140,R.siyah,.25+r()*.15);}
  // dökük sıva yamaları
  for(let i=0;i<(o.yama==null?3:o.yama);i++){
    const x=lerp(x0,x1,r()), y=lerp(y0,y1,.3+r()*.6), w=40+r()*80, h=34+r()*60;
    const P=[]; for(let a=0;a<16;a++){const t=a/16*TAU, k=a%2?.45+r()*.3:.8+r()*.35; P.push([x+Math.cos(t)*w*k,y+Math.sin(t)*h*k*(t>Math.PI?1.1:.6)]);} // kırık, dişli kenar
    const yol=()=>{c.moveTo(P[0][0],P[0][1]); for(let a=1;a<P.length;a++) c.lineTo(P[a][0],P[a][1]); c.closePath();};
    c.save(); c.globalAlpha=.45; c.beginPath(); yol(); c.clip(); taslar(x-w,y-h,x+w,y+h,(x|0)+7); c.restore();
    hat(yol,R.murekkep,.35,1.1,(x|0)+9,1,3);
  }
  for(let i=0;i<(o.catlak||8);i++){ // çatlaklar
    let x=lerp(x0,x1,r()), y=lerp(y0,y1,r()*.8);
    hat(()=>{c.moveTo(x,y); for(let k=0;k<6;k++){x+=(r()-.5)*40; y+=10+r()*30; c.lineTo(x,y);}},R.murekkep,.55,1.1,300+i,1,1.2);
  }
  kir(x0,y0,x1,y1,o.seed||21,{leke:1.3,akinti:1.2,yerel:o.yerel});
}
// sıva yamasının altındaki kaba taşlar (kontursuz, hızlı)
function taslar(x0,y0,x1,y1,seed){
  const r=rng(seed);
  c.fillStyle='#16150f'; c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let y=y0;y<y1;y+=22) for(let x=x0-r()*20;x<x1;){const w=26+r()*30; c.fillStyle=rgba(karis(R.tas,R.siyah,r()*.5),1); c.fillRect(x,y,w-3,19); x+=w;}
}

// dikine tahta: aralarında kara yarıklar; ay ışığı sızan yarıklar ayrıca çizilir
export function tahtaDuvar(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||31), renk=o.renk||R.tahta;
  c.save(); c.beginPath(); c.rect(x0,y0,x1-x0,y1-y0); c.clip();
  for(let x=x0;x<x1;){
    const w=58+r()*44, k=karis(renk,R.siyah,.15+r()*.45);
    c.fillStyle=rgba(k,1); c.fillRect(x,y0,w,y1-y0);
    for(let i=0;i<5;i++){const gx=x+6+r()*(w-12); hat(()=>{c.moveTo(gx,y0); c.bezierCurveTo(gx+(r()-.5)*10,lerp(y0,y1,.3),gx+(r()-.5)*12,lerp(y0,y1,.7),gx+(r()-.5)*8,y1);},R.murekkep,.22,1,(gx|0),1,2);}
    if(r()<.5){const dy=lerp(y0,y1,.2+r()*.6); hat(()=>{c.ellipse(x+w/2,dy,6,9,0,0,TAU);},R.murekkep,.5,1.2,(x|0)+4,2,1);} // budak
    c.fillStyle='rgba(2,2,2,.9)'; c.fillRect(x+w-3,y0,4,y1-y0);
    hat(()=>{c.moveTo(x+w-1,y0); c.lineTo(x+w-1+(r()-.5)*4,y1);},R.murekkep,.85,2,(x|0)+5,2,2);
    x+=w+2;
  }
  c.restore();
  kir(x0,y0,x1,y1,o.seed||31,{leke:.9,zemin:.16,akinti:.6});
}

// mağara kayası: yumrulu, ıslak, karanlık
export function kaya(x0,y0,x1,y1,o){
  o=o||{}; const r=rng(o.seed||41);
  c.fillStyle=rgba(karis(R.tasKoyu,R.siyah,.4),1); c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let i=0;i<54;i++){
    const x=lerp(x0,x1,r()), y=lerp(y0,y1,r()), rx=50+r()*170, ry=40+r()*120, k=[R.tas,R.kufYesil,R.morluk,R.siyah][i%4];
    leke(x,y,rx,ry,k,.18+r()*.2,r()*3);
    if(r()<.65) hat(()=>{c.ellipse(x,y,rx*.6,ry*.5,r()*3,Math.PI*(.9+r()*.3),Math.PI*(1.9+r()*.4));},R.murekkep,.55,1.6,400+i,2,3);
  }
  tara(x0,y0,x1,y1,.7,10,R.murekkep,.2,(o.seed||41)+1,1.2);
  golgeTara(x0,y0,x1,y1,(o.seed||41)+2,{alfa:1.2});
  akinti(x0,y0,x1,y1,(o.seed||41)+3,Math.round((x1-x0)/50),{boy:300});
  for(let i=0;i<12;i++) karalama(lerp(x0,x1,r()),lerp(y0,y1,r()),40+r()*50,30+r()*40,R.murekkep,.16,450+i,9);
}

// sıkıştırılmış toprak zemin: yatay kazıntılar, ufka doğru daralan izler, ışığın altında soluk havuz
export function toprakZemin(y0,y1,G,o){
  o=o||{}; const r=rng(o.seed||51), renk=o.renk||R.toprak;
  c.fillStyle=rgba(karis(renk,R.siyah,.12),1); c.fillRect(-G,y0,G*2,y1-y0);
  for(let i=0;i<26;i++) leke((r()-.5)*G*2,lerp(y0,y1,r()),80+r()*240,14+r()*44,[R.siyah,R.kufYesil,R.kirliSari,R.morluk][i%4],.12+r()*.16);
  leke(0,y0+10,G*1.3,70,R.siyah,.35); // duvar dibi
  // ufka doğru daralan izler (oda derinliği)
  for(let i=-9;i<=9;i++){const xa=i*170+(r()-.5)*30; hat(()=>{c.moveTo(xa*.55,y0); c.lineTo(xa*1.4,y1);},R.murekkep,.22,1.4,(o.seed||51)+200+i,1,3);}
  tara(-G,y0,G,y1,.03,6,R.murekkep,.3,(o.seed||51)+1,1);
  golgeTara(-G,y0,G,y1,(o.seed||51)+4,{basik:.45,katlar:[[1.2,.2,9,.3],[2.4,-.5,12,.26],[3.6,.9,15,.22]]});
  tara(-G,y0,G,y1,.22,14,R.kirliSari,.05,(o.seed||51)+2,1);
  for(let i=0;i<60;i++){const x=(r()-.5)*G*2,y=lerp(y0,y1,r()),u=10+r()*70,a=(r()-.5)*.5; c.strokeStyle=r()<.4?`rgba(150,128,92,${.04+r()*.08})`:`rgba(3,3,3,${.3+r()*.4})`; c.lineWidth=.8+r()*1.6; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*u,y+Math.sin(a)*u*.3); c.stroke();}
  for(let i=0;i<40;i++){const x=(r()-.5)*G*2, y=lerp(y0,y1,r()), w=2+r()*6; c.fillStyle=`rgba(${r()<.5?'120,110,85':'5,5,4'},${.15+r()*.3})`; c.beginPath(); c.ellipse(x,y,w,w*.45,0,0,TAU); c.fill();}
  // ışığın zemindeki havuzu
  if(o.havuz!==false) leke(DURUM.isikX,y0+70,DURUM.isikIc*3.2,60,DURUM.isikRenk,.07);
  hat(()=>{c.moveTo(-G,y0); c.lineTo(G,y0+(r()-.5)*4);},R.murekkep,.7,2.4,(o.seed||51)+3,2,3);
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
    hat(()=>{c.moveTo(-G,y+k); c.bezierCurveTo(-G*.3,y+k-4,G*.3,y+k+4,G,y+k);},R.murekkep,.85,2,620+i,2,2);
    hat(()=>{c.moveTo(-G,y-k); c.bezierCurveTo(-G*.3,y-k-6,G*.3,y-k+5,G,y-k-3);},R.murekkep,.6,1.4,630+i,2,2);
  }
  leke(0,yAlt+10,G*1.3,40,R.siyah,.6);
}

// gök: gece, şafak, akşam ya da bulutlu; ay isteğe bağlı. Gök de taranır: düz gradyan kalmaz
export function gok(y0,y1,G,o){
  o=o||{}; const r=rng(o.seed||71), tur=o.tur||'gece';
  const g=c.createLinearGradient(0,y0,0,y1);
  if(tur==='safak'){g.addColorStop(0,'#07090b'); g.addColorStop(.55,'#1a2226'); g.addColorStop(.85,'#3a3f38'); g.addColorStop(1,'#5a5640');}
  else if(tur==='aksam'){g.addColorStop(0,'#080809'); g.addColorStop(.5,'#1d1b22'); g.addColorStop(.85,'#3d3326'); g.addColorStop(1,'#5e4a2a');}
  else if(tur==='bulut'){g.addColorStop(0,'#101312'); g.addColorStop(.7,'#2a302c'); g.addColorStop(1,'#3e4339');}
  else {g.addColorStop(0,'#030405'); g.addColorStop(.5,'#0d1315'); g.addColorStop(1,'#2c3836');}
  c.fillStyle=g; c.fillRect(-G,y0,G*2,y1-y0);
  for(let i=0;i<16;i++) leke((r()-.5)*G*2,lerp(y0,y1,r()*.85),200+r()*300,40+r()*70,[R.kufYesil,R.morluk,R.siyah][i%3],.1+r()*.1);
  if(tur==='gece') for(let i=0;i<40;i++){c.fillStyle=`rgba(200,205,190,${.08+r()*.25})`; c.beginPath(); c.arc((r()-.5)*G*2,lerp(y0,y1,r()*.7),.6+r()*1.2,0,TAU); c.fill();}
  if(o.ay){const [ax,ay]=o.ay; leke(ax,ay,260,220,R.ay,.16); leke(ax,ay,70,70,R.ay,.4); c.fillStyle='rgba(196,206,190,.85)'; c.beginPath(); c.arc(ax,ay,17,0,TAU); c.fill(); c.fillStyle='rgba(20,26,26,.6)'; c.beginPath(); c.arc(ax+7,ay-3,14,0,TAU); c.fill();}
  // bulut sıraları: titrek yatay hatlar
  for(let i=0;i<7;i++){const y=lerp(y0,y1,.2+r()*.7), x=(r()-.5)*G*1.6, w=200+r()*400; hat(()=>{c.moveTo(x-w/2,y); c.bezierCurveTo(x-w/4,y-8-r()*10,x+w/4,y+6,x+w/2,y-2);},R.murekkep,.35,1.4,(o.seed||71)+20+i,2,3);}
  tara(-G,y0,G,y1,.15,11,R.murekkep,.28,(o.seed||71)+1,1);
  tara(-G,y0,G,lerp(y0,y1,.6),-1.2,15,R.murekkep,.2,(o.seed||71)+2,1);
}

// uzakta toprak damlı evler ve bir iki ağaç: ufuk çizgisinin altında siyah kütle, üst kenarı mürekkepli
export function uzakEvler(ufuk,G,o){
  o=o||{}; const r=rng(o.seed||81), P=[[-G,ufuk+10]];
  for(let x=-G;x<G;){const w=70+r()*140, h=24+r()*50; P.push([x,ufuk-h],[x+w,ufuk-h+(r()-.5)*6]); x+=w+r()*30; P.push([x,ufuk+4]);}
  const yol=()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++) c.lineTo(P[i][0],P[i][1]); c.lineTo(G,ufuk+200); c.lineTo(-G,ufuk+200); c.closePath();};
  c.fillStyle='#050606'; c.beginPath(); yol(); c.fill();
  hat(()=>{c.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++) c.lineTo(P[i][0],P[i][1]);},[90,96,86],.22,1.4,(o.seed||81)+1,2,2);
  for(let i=0;i<(o.agac==null?3:o.agac);i++){const x=(r()-.5)*G*1.8, h=90+r()*90; leke(x,ufuk-h,40+r()*30,h*.5,R.siyah,.9); c.fillStyle='#050606'; c.fillRect(x-3,ufuk-h*.5,6,h*.5);}
}

// köşelerin ve tepenin karanlığa gömülmesi
export function karart(G,ust,alt){
  leke(-G,(ust+alt)/2,G*.7,(alt-ust)*.8,R.siyah,.75);
  leke(G,(ust+alt)/2,G*.7,(alt-ust)*.8,R.siyah,.75);
  leke(0,ust,G*1.4,300,R.siyah,.65);
}

// üstü yuvarlak duvar oyuğu (niş): içi karanlık
export function nis(x,y,w,h,o){
  o=o||{};
  const yol=()=>{c.moveTo(x-w/2,y); c.lineTo(x-w/2,y-h+w/2); c.arc(x,y-h+w/2,w/2,Math.PI,0); c.lineTo(x+w/2,y); c.closePath();};
  c.fillStyle=o.ic||'#0a0b09'; c.beginPath(); yol(); c.fill();
  c.save(); c.beginPath(); yol(); c.clip(); leke(x,y-h*.3,w*.7,h*.6,R.siyah,.6); tara(x-w/2,y-h,x+w/2,y,.9,6,R.murekkep,.5,(x|0)+3); c.restore();
  hat(yol,R.murekkep,.9,2,(x|0)+1,3,2);
  hat(()=>{c.moveTo(x-w/2-4,y+3); c.lineTo(x+w/2+4,y+2);},R.kirliSari,.25,2,(x|0)+2,1,1);
}

// bir eşyanın içini duvar dokusuyla doldur (ocak taşı, sıvalı davlumbaz, çeşme aynası); yol ile kırpılır
export function dokuIci(yol,x0,y0,x1,y1,tur,o){
  o=o||{};
  c.save(); c.beginPath(); yol(); c.clip();
  if(tur==='siva') sivaDuvar(x0,y0,x1,y1,{seed:o.seed,renk:o.renk,yama:o.yama==null?1:o.yama,catlak:3,yerel:true});
  else tasDuvar(x0,y0,x1,y1,{seed:o.seed,renk:o.renk,boy:o.boy||30,leke:.6,yerel:true});
  if(o.isikX!=null) leke(o.isikX,o.isikY,(x1-x0)*.5,(y1-y0)*.5,DURUM.isikRenk,o.isik==null?.12:o.isik);
  leke(o.golgeX==null?x0:o.golgeX,(y0+y1)/2,(x1-x0)*.7,(y1-y0)*.8,R.siyah,o.koyu==null?.45:o.koyu);
  c.restore();
  hat(yol,R.murekkep,.9,1.9,(o.seed||1)+3,3,2.4);
}
