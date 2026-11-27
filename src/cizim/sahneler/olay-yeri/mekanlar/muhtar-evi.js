// Muhtarın evi (ev içi): solda arka duvara gömülü yüklük (yarı açık perde, üst üste yorgan ve döşek), ortada oymalı ceviz sandık,
// üstünde gaz lambası; duvarda mühürlü resmî kâğıt; sağda yere serili yatak; önde eski kilim. Tek ışık: sağ arkadaki açık kapı.
import {c} from '../../../teknik/tuval.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,yol3,golgele,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,zemin,aydinlikBosluk,karanlik,atmosfer,leke,tara,MUREKKEP} from '../mekan-yardim.js';
import {badanaDuvar,etekBandi,dipGolgesi,kutuDoku,tahtaYuzey,torna,minder,kenarIsigi} from './koy-odasi.js';

const SIVA=[180,172,150], TOPRAK=[118,106,86], CEVIZ=[96,72,52], AHSAP=[110,92,68], KIRIS=[88,74,56];
const ARKA=500, SOL=-250, SAG=250, TAVAN=232;
const KAPI={x:[122,198], ust:178};
const YUK={x:[-236,-66], y:[0,206], derin:56};           // yüklük
const SAN={x:[-44,62], y:[0,52], z:[448,ARKA-2]};          // sandık
const YATAK={x:[104,214], z:[262,452]};
const isik={konum:[160,120,468], guc:1.6, menzil:330, ortam:.36};

// Yere serili kilim: kenar şeridi, ortada baklava gözler, uçlarda saçak. Köşeler dünya noktası (zemin)
export function kilimSer(P,isik,[x0,x1],[z0,z1],renk,r,{Y=0,t=1}={}){
  const q=[[x0,Y,z0],[x1,Y,z0],[x1,Y,z1],[x0,Y,z1]];
  const a=aydinlik(isik,[(x0+x1)/2,Y,(z0+z1)/2],[0,1,0]);
  cokgen3(P,q,golgele(renk,a));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  const ic=(p,k,al)=>cokgen3(P,[[x0+p,Y,z0+p],[x1-p,Y,z0+p],[x1-p,Y,z1-p],[x0+p,Y,z1-p]],k,al);
  ic(5,golgele([60,36,30],a),1); ic(10,golgele(renk,a*1.05),1); ic(13,golgele([180,150,100],a),.5); ic(15,golgele(renk,a*.95),1);
  // baklavalar ve kancalar
  const gz=26, mx=(x0+x1)/2;
  for(let z=z0+15+gz/2;z<z1-15;z+=gz) for(let x=mx-Math.floor((x1-x0-30)/gz/2)*gz;x<=x1-15-gz/2+.1;x+=gz){
    const b=[[x,Y,z-gz*.42],[x+gz*.42,Y,z],[x,Y,z+gz*.42],[x-gz*.42,Y,z]];
    cokgen3(P,b,golgele(((x+z)/gz|0)%2?[150,60,44]:[40,44,60],a),.85);
    cokgen3(P,b.map(([bx,by,bz])=>[x+(bx-x)*.45,by,z+(bz-z)*.45]),golgele([200,176,120],a),.7);
  }
  // aşınma: ortası yürünmüş, soluk
  const s=P.n(mx,Y,(z0+z1)/2), o=P.olcek(mx,Y,(z0+z1)/2);
  leke(s[0],s[1],(x1-x0)*o*.3,(z1-z0)*o*.18,[170,160,130],.25);
  for(let i=0;i<10;i++){const p=P.n(x0+r()*(x1-x0),Y,z0+r()*(z1-z0)); leke(p[0],p[1],10+r()*30,4+r()*10,[0,0,0],.12+r()*.1);}
  tara(...[0,0,1000,750],.3,3,[0,0,0],.12,t,.5);
  c.restore();
  hat3(P,q,MUREKKEP,.5,1,t+1,2,.8,true);
  for(const z of[z0,z1]) for(let x=x0+2;x<x1;x+=3){const p=P.n(x,Y,z), e=P.n(x+(r()-.5)*2,Y,z+(z===z0?-1:1)*(4+r()*3)); c.strokeStyle='rgba(190,176,140,.45)'; c.lineWidth=.8; c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(e[0],e[1]); c.stroke();}
}

// Yüklük: duvara gömülü dolap; üstte açık göz, içinde istif yatak; altta iki kapak; sol yarıda çekilmiş perde
function yukluk(P,r){
  const [x0,x1]=YUK.x, [,y1]=YUK.y, Z1=ARKA+YUK.derin, raf=86;
  // iç: karanlık oyuk
  cokgen3(P,[[x0,raf,Z1],[x1,raf,Z1],[x1,y1,Z1],[x0,y1,Z1]],[26,22,18]);
  cokgen3(P,[[x1,raf,ARKA],[x1,y1,ARKA],[x1,y1,Z1],[x1,raf,Z1]],[34,30,24]); // iç sağ yan (görünür)
  cokgen3(P,[[x0,y1,ARKA],[x1,y1,ARKA],[x1,y1,Z1],[x0,y1,Z1]],[20,18,14]); // tavanı
  // istif: altta döşekler, üstte yorganlar; her kat ayrı renk ve desen
  const katlar=[[13,[184,176,150]],[11,[150,92,76]],[14,[196,190,168]],[15,[112,120,150]],[11,[180,150,104]],[16,[200,192,170]],[10,[150,86,78]],[12,[170,166,150]]];
  let y=raf+1; const isikI={...isik,konum:[60,320,330],ortam:.5,guc:.9,menzil:700};
  for(const [i,[h,k]] of katlar.entries()){
    if(y+h>y1-22) break;
    const pay=r()*6;
    minder(P,isikI,[x0+4+pay,x1-4-r()*6],[y,y+h],[ARKA+6,Z1-4],k,r,1300+i*7,{sis:4,seritAra:i%2?6:14,serit:i%3!==2});
    y+=h+.5;
  }
  // en üstte bohçalar
  for(let i=0;i<3;i++){const bx=x0+18+i*48+r()*8; minder(P,isikI,[bx,bx+38],[y,y+14+r()*6],[ARKA+16,Z1-8],i%2?[160,140,110]:[130,90,80],r,1360+i*3,{sis:6,serit:false});}
  // perde: çubuktan sarkan kıvrımlı bez, sol yarıyı örter
  const pz=ARKA+3, px1=x0+70, kat=7;
  for(let i=0;i<kat;i++){
    const xa=x0+(px1-x0)*i/kat, xb=x0+(px1-x0)*(i+1)/kat, xm=(xa+xb)/2, a=i%2?.75:1.05;
    cokgen3(P,[[xa,raf,pz],[xb,raf,pz],[xb,y1-4,pz],[xa,y1-4,pz]],golgele([176,150,136],a*aydinlik({...isik,ortam:.55},[xm,150,pz],[0,0,-1])));
    hat3(P,[[xm,raf+2,pz-1],[xm+(r()-.5)*2,y1-6,pz-1]],[0,0,0],.18,1,1370+i,1,.4);
  }
  // perdede baskı çiçek deseni (küçük noktalar)
  for(let i=0;i<70;i++){const x=x0+3+r()*(px1-x0-6), yy=raf+4+r()*(y1-raf-12), s=P.n(x,yy,pz); c.fillStyle='rgba(50,30,30,.35)'; c.beginPath(); c.arc(s[0],s[1],1.3,0,TAU); c.fill();}
  hat3(P,[[x0,raf+2,pz],[px1,raf+5,pz]],MUREKKEP,.5,1,1380,1,.6); // perde eteği
  hat3(P,[[x0-4,y1-4,pz],[x1+4,y1-4,pz]],[30,26,20],1,2.4,1381,1,.3); // çubuk
  // alt kapaklar: çerçeveli tahta, demir kulp
  for(const [i,xx] of [[x0,(x0+x1)/2],[(x0+x1)/2,x1]].entries()){
    tahtaYuzey(P,isik,[0,0,ARKA],DUZLEM.arka,[xx[0]+2,xx[1]-2,-raf+4,-4],AHSAP,r,{en:14,yon:'v'});
    hat3(P,[[xx[0]+12,14,ARKA],[xx[1]-12,14,ARKA],[xx[1]-12,raf-12,ARKA],[xx[0]+12,raf-12,ARKA]],[20,16,12],.6,1.1,1390+i,2,.8,true);
    const k=P.n(i?xx[0]+8:xx[1]-8,48,ARKA); c.fillStyle='rgb(26,24,22)'; c.beginPath(); c.arc(k[0],k[1],2.4,0,TAU); c.fill();
  }
  // çerçeve: dikmeler, ara kuşak, üst korniş
  for(const x of[x0,x1]) kutuDoku(P,isik,[x-6,x+6],[0,y1+8],[ARKA-6,ARKA],CEVIZ,1400+x,{doku:'tahta',en:6,yonOn:'v'});
  kutuDoku(P,isik,[x0-6,x1+6],[raf-4,raf+2],[ARKA-8,ARKA],CEVIZ,1402,{doku:'tahta',en:6});
  kutuDoku(P,isik,[x0-12,x1+12],[y1+8,y1+20],[ARKA-12,ARKA],CEVIZ,1403,{doku:'tahta',en:6});
  // oyma şerit kornişte
  for(let x=x0-6;x<x1+6;x+=8){const s=P.n(x,y1+14,ARKA-12); c.fillStyle='rgba(10,8,6,.5)'; c.beginPath(); c.arc(s[0],s[1],1.6,0,TAU); c.fill();}
}

// Oymalı ceviz sandık: kapak, ön yüzde üç gül oyma, demir köşebent ve kilit
function sandik(P,r){
  const [x0,x1]=SAN.x, [,y1]=SAN.y, [z0,z1]=SAN.z;
  // ayaklar
  for(const x of[x0+4,x1-4]) kutuDoku(P,isik,[x-4,x+4],[0,6],[z0+2,z0+8],CEVIZ,1500+x,{doku:'duz',cizgi:.5,kenar:0});
  kutuDoku(P,isik,[x0,x1],[6,y1-8],[z0+2,z1],CEVIZ,1502,{doku:'tahta',en:11});
  kutuDoku(P,isik,[x0-2,x1+2],[y1-8,y1],[z0,z1+2],golgele(CEVIZ,1.05),1503,{doku:'tahta',en:13,kenar:.45}); // kapak
  // oyma: ön yüzde üç gül (yerel küçük çizim)
  for(let i=0;i<3;i++){
    const x=x0+(x1-x0)*(i+.5)/3;
    duzlemde(P,[x,(6+y1-8)/2,z0+2],DUZLEM.arka,()=>{
      c.strokeStyle='rgba(8,6,4,.6)'; c.lineWidth=.9;
      c.beginPath(); c.arc(0,0,11,0,TAU); c.stroke(); c.beginPath(); c.arc(0,0,4,0,TAU); c.stroke();
      for(let k=0;k<8;k++){const a=k/8*TAU; c.beginPath(); c.ellipse(Math.cos(a)*7.5,Math.sin(a)*7.5,3.2,1.6,a,0,TAU); c.stroke();}
      c.strokeStyle='rgba(220,200,160,.22)'; c.beginPath(); c.arc(-.5,-.5,11,Math.PI,Math.PI*1.6); c.stroke();
    });
  }
  // demir köşebentler ve kilit
  for(const x of[x0,x1-8]) cokgen3(P,[[x,8,z0+1.5],[x+8,8,z0+1.5],[x+8,y1-9,z0+1.5],[x,y1-9,z0+1.5]],[40,38,34],.85);
  const k=[[(x0+x1)/2-5,y1-20,z0+1],[(x0+x1)/2+5,y1-20,z0+1],[(x0+x1)/2+5,y1-7,z0+1],[(x0+x1)/2-5,y1-7,z0+1]];
  cokgen3(P,k,[44,40,34]); hat3(P,k,MUREKKEP,.6,1,1510,1,.5,true);
  const kd=P.n((x0+x1)/2,y1-15,z0+1); c.fillStyle='rgb(10,10,8)'; c.fillRect(kd[0]-.8,kd[1]-2.5,1.6,5);
}

// Mühürlü resmî kâğıt: çiviyle tutturulmuş, üstte ay yıldız, başlık, satırlar, mor mühür ve imza
function resmiKagit(P,X,Y){
  duzlemde(P,[X,Y,ARKA],DUZLEM.arka,()=>{
    c.save(); c.rotate(.025);
    c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(-15,-19,32,43); // duvara düşen gölge
    c.fillStyle='rgb(206,198,172)'; c.beginPath(); c.moveTo(-17,-21); c.lineTo(15,-21.5); c.lineTo(15.5,21); c.lineTo(-16.5,21.5); c.closePath(); c.fill();
    c.fillStyle='rgba(120,100,60,.18)'; c.fillRect(-17,10,32,11); // sararmış alt
    c.fillStyle='rgb(40,36,30)'; c.beginPath(); c.arc(-.6,-16.5,2.2,0,TAU); c.fill(); c.fillStyle='rgb(206,198,172)'; c.beginPath(); c.arc(.2,-16.6,1.8,0,TAU); c.fill(); // ay
    c.fillStyle='rgb(40,36,30)'; c.fillRect(1.6,-17.2,1.2,1.2);
    c.fillStyle='rgba(30,26,22,.8)'; c.fillRect(-9,-12.5,18,1.4); c.fillRect(-6,-10,12,1);
    for(let i=0;i<9;i++) c.fillRect(-13,-6+i*2.4,i===8?12:26-((i*7)%5),.7);
    c.strokeStyle='rgba(80,50,100,.7)'; c.lineWidth=.8; c.beginPath(); c.arc(-7,16,4.2,0,TAU); c.stroke(); c.beginPath(); c.arc(-7,16,2.6,0,TAU); c.stroke(); // mühür
    c.strokeStyle='rgba(30,26,22,.8)'; c.lineWidth=.6; c.beginPath(); c.moveTo(2,17); c.bezierCurveTo(5,12,6,19,9,14); c.bezierCurveTo(10,13,11,18,13,15); c.stroke(); // imza
    c.fillStyle='rgb(30,28,24)'; for(const [x,y] of[[-15,-19],[13,-19.5]]){c.beginPath(); c.arc(x,y,.9,0,TAU); c.fill();}
    c.restore();
  });
  // kâğıdın üstünde ince kenar ışığı
}

export default {
  id:'muhtar-evi',
  kamera:{odak:860, yukseklik:146, egim:.22},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[-36,0,236], yuzey:'toprak', alan:16},
    'zemin-orta': {duzlem:'zemin', konum:[34,0,420], yuzey:'toprak', alan:8},
    'zemin-kose': {duzlem:'zemin', konum:[-196,0,438], yuzey:'toprak', alan:6},
    'esik':       {duzlem:'zemin', konum:[160,4,506], yuzey:'tas', alan:5},
    'duvar':      {duzlem:'arka', konum:[96,150,ARKA], yuzey:'siva', alan:3},
    'sandik-ustu':{duzlem:'ust', konum:[-14,SAN.y[1],468], yuzey:'tahta', alan:5},
    'yatak':      {duzlem:'ust', konum:[150,14,320], yuzey:'tahta', alan:8, uygunsuz:['un']},
    'beden':      {duzlem:'zemin', konum:[-78,0,330], aci:-.08, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(8123), K=KAPI;
    c.fillStyle='#15130f'; c.fillRect(0,0,1000,750);
    // arka duvar: kapı ve yüklük kesilerek
    c.save(); c.beginPath(); c.rect(0,0,1000,750);
    yol3(P,[[K.x[0],0,ARKA],[K.x[0],K.ust,ARKA],[K.x[1],K.ust,ARKA],[K.x[1],0,ARKA]]);
    yol3(P,[[YUK.x[0],YUK.y[0],ARKA],[YUK.x[0],YUK.y[1],ARKA],[YUK.x[1],YUK.y[1],ARKA],[YUK.x[1],YUK.y[0],ARKA]]);
    c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-TAVAN,0],SIVA,R,{is:.2,yama:1});
    etekBandi(P,[0,0,ARKA],DUZLEM.arka,[SOL,SAG],60,R,.25);
    c.restore();
    badanaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[150,ARKA,-TAVAN,0],SIVA,R,{is:.2,yama:0});
    badanaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-150,-TAVAN,0],SIVA,R,{is:.2,yama:0});
    tahtaYuzey(P,isik,[0,TAVAN,0],DUZLEM.ust,[SOL,SAG,-ARKA,-150],[64,56,46],R,{en:5,yon:'v',boy:[400,600],asinma:0,civi:false,derz:.35});
    for(const z of[ARKA-8,440]) kutuDoku(P,isik,[SOL,SAG],[TAVAN-14,TAVAN],[z-8,z+8],KIRIS,500+z,{doku:'tahta',en:8,kenar:0});
    // kapı: dışarısı bembeyaz, içe açık kanat, eşik taşı, söve
    aydinlikBosluk(P,[[K.x[0],0,ARKA+40],[K.x[0],K.ust,ARKA+40],[K.x[1],K.ust,ARKA+40],[K.x[1],0,ARKA+40]],R);
    cokgen3(P,[[K.x[0],0,ARKA],[K.x[0],K.ust,ARKA],[K.x[0],K.ust,ARKA+40],[K.x[0],0,ARKA+40]],[150,142,124]);
    cokgen3(P,[[K.x[0],K.ust,ARKA],[K.x[1],K.ust,ARKA],[K.x[1],K.ust,ARKA+40],[K.x[0],K.ust,ARKA+40]],[34,28,22]);
    kutuDoku(P,{...isik,ortam:.5},[K.x[0]-4,K.x[1]+4],[0,5],[ARKA-10,ARKA+40],[140,134,118],1601,{doku:'tas'});
    const kn=[[K.x[1],2,ARKA],[K.x[1],K.ust-2,ARKA],[K.x[1]+18,K.ust-4,ARKA-60],[K.x[1]+18,4,ARKA-60]]; // açık kanat (sağ duvara doğru)
    tahtaYuzey(P,{...isik,ortam:.3},[K.x[1],0,ARKA],{u:[.287,0,-.958],v:[0,-1,0]},[0,62.6,-K.ust+2,-2],golgele(AHSAP,.8),R,{en:16,yon:'v'});
    hat3(P,kn,MUREKKEP,.7,1.3,1602,2,1,true);
    kutuDoku(P,isik,[K.x[0]-12,K.x[1]+12],[K.ust,K.ust+12],[ARKA-4,ARKA+2],AHSAP,1603,{doku:'tahta',en:6});
    // zemin: sıvanmış toprak; kapıdan içeri ışık
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:91,doku:.9});
    c.save(); c.globalCompositeOperation='lighter';
    c.beginPath(); yol3(P,[[K.x[0]+2,0,ARKA-2],[K.x[1]-2,0,ARKA-2],[K.x[1]-20,0,300],[K.x[0]-90,0,300]]); c.clip();
    { const a=P.n(160,0,ARKA), b=P.n(110,0,300), g=c.createLinearGradient(a[0],a[1],b[0],b[1]); g.addColorStop(0,'rgba(110,106,90,.55)'); g.addColorStop(1,'rgba(110,106,90,0)'); c.fillStyle=g; c.fillRect(0,0,1000,750); }
    c.restore();
    dipGolgesi(P,[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]],7,.45);
    kilimSer(P,isik,[-206,58],[204,300],[120,84,66],R,{t:1610});
    yukluk(P,R);
    resmiKagit(P,6,150);
    // gaz lambası rafı ve duvar yuvası çevresi: lamba sandığın sağ ucunda
    sandik(P,R);
    torna(P,isik,44,474,[[6,SAN.y[1]],[6.2,SAN.y[1]+1.5],[2.4,SAN.y[1]+3],[2.2,SAN.y[1]+7],[7,SAN.y[1]+11],[7.4,SAN.y[1]+15],[4,SAN.y[1]+19],[3.4,SAN.y[1]+21]],[150,146,130],1620,{dilim:20,ustRenk:[40,36,30]}); // gövde
    torna(P,isik,44,474,[[3.6,SAN.y[1]+21],[4.8,SAN.y[1]+25],[4.6,SAN.y[1]+29],[2.4,SAN.y[1]+33],[2.2,SAN.y[1]+41]],[196,198,188],1621,{dilim:20,cizgi:.4,ustRenk:[30,28,24]}); // şişe
    { const s=P.n(44,SAN.y[1]+28,474-4), o=P.olcek(44,SAN.y[1]+28,474); leke(s[0]-1.5*o,s[1],1.4*o,6*o,[255,255,240],.6); c.fillStyle='rgba(20,18,14,.7)'; c.fillRect(s[0]-1.2*o,s[1]+1*o,2.4*o,1.4*o); } // isli fitil
    // yer yatağı: döşek, ayakta katlanmış yorgan, başta yastık
    const [yx0,yx1]=YATAK.x, [yz0,yz1]=YATAK.z;
    minder(P,isik,[yx0,yx1],[0,8],[yz0,yz1],[200,194,172],R,1650,{sis:4,seritAra:5}); // döşek
    minder(P,isik,[yx0+8,yx1-6],[8,22],[yz1-54,yz1-8],[206,200,184],R,1655,{sis:7,serit:false}); // yastık (arka uçta)
    minder(P,isik,[yx0-3,yx1+3],[8,14],[yz0-2,yz1-70],[160,104,88],R,1660,{sis:5,serit:false}); // serili yorgan
    minder(P,isik,[yx0-3,yx1+3],[8,21],[yz1-84,yz1-62],[186,176,150],R,1661,{sis:7,serit:false}); // geri katlanmış ucu
    // yorganın dikiş deseni (kapitone baklava)
    for(let i=0;i<9;i++){const z=yz0+6+i*13; hat3(P,[[yx0,14.2,z],[yx1,14.2,z+(R()-.5)*3]],[30,16,12],.25,1,1670+i,1,.6);}
    for(let i=1;i<4;i++){const x=yx0+(yx1-yx0)*i/4; hat3(P,[[x,14.2,yz0],[x+(R()-.5)*3,14.2,yz1-72]],[30,16,12],.2,1,1680+i,1,.6);}
    kenarIsigi(P,[yx0-3,14,yz1-70],[yx0-3,14,yz0],R,{alfa:.25});
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    c.save(); c.globalCompositeOperation='screen';
    const a=P.n(160,KAPI.ust,ARKA), b=P.n(120,0,300), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(130,126,108,.16)'); g.addColorStop(1,'rgba(130,126,108,0)');
    c.beginPath(); yol3(P,[[KAPI.x[0],KAPI.ust,ARKA],[KAPI.x[1],KAPI.ust,ARKA],[KAPI.x[1]-20,0,300],[KAPI.x[0]-90,0,300]]); c.fillStyle=g; c.fill();
    c.restore();
    karanlik([[0,80,260,220,.42],[0,740,220,160,.3],[1000,740,220,150,.25],[1000,40,200,140,.25]]);
  }
};
