// Sahne yerleri (şablon varyantları): duvar, zemin, ışık ve nesnelerin konacağı adlandırılmış noktalar.
// Her yer bir işlevdir: (ip) => {isik, arka(G,ust,alt), orta?(G), sabit:[öğe], yer:{ad:[x,y,s]}, oturma:[...], ayakta:[...], hayvan:[...], kanit:{x,y,s}}
// öğe = {nesne:'ad', x, y, s, ...seçenek}. Öğeler y'ye göre sıralanıp çizilir (arkadaki önce).
import {c} from '../../teknik/tuval.js';
import {TAU,rgba} from '../../../cekirdek/matematik.js';
import {R,hat,leke,tara,sekil} from './cizer.js';
import {tasDuvar,sivaDuvar,tahtaDuvar,kaya,toprakZemin,tavan,gok,uzakEvler,karart,nis} from './mekan.js';
import {OLCU} from './ayar.js';

const Z=OLCU.zeminY;

// ev içi: tavan, duvar, toprak zemin
function icOda(G,ust,alt,o){
  o=o||{}; const tavanY=o.tavanY==null?70:o.tavanY;
  const duvar={siva:sivaDuvar,tas:tasDuvar,tahta:tahtaDuvar,kaya}[o.duvar||'siva'];
  duvar(-G,tavanY-10,G,Z+4,{seed:o.seed||21,renk:o.renk});
  tavan(tavanY,ust-20,G,{seed:(o.seed||21)+1});
  toprakZemin(Z,alt+10,G,{seed:(o.seed||21)+2,renk:o.zemin});
}
// duvar dibine çivi
function civi(x,y){c.fillStyle='#0d0d0c'; c.beginPath(); c.arc(x,y,4.5,0,TAU); c.fill(); leke(x+3,y+5,7,6,R.siyah,.4);}
// duvarda raf: üstüne nesne konur
function raf(x,y,w){sekil(()=>{c.rect(x-w/2,y,w,12);},R.tahta,[x-w/2,y,x+w/2,y+12],{seed:(x|0)+900,aralik:4}); leke(x,y+30,w*.6,22,R.siyah,.5);}
// minare: şerefeli, külahlı; arkasındaki gökten (ay ya da şafak) ayrılsın diye ışık yanında ince parlak kenar,
// gövdede mürekkep hatları ve tarama; tepesi kadrajın içinde kalır
function minare(x,taban,boy,o){
  o=o||{}; const isik=o.isik||[150,165,160], yon=o.yon||-1, kul=70, sk=taban-boy*.68;
  if(o.hale) leke(x+yon*30,taban-boy-20,210,190,isik,o.hale); // arkadaki gök parlaklığı
  const govde=()=>{c.moveTo(x-30,taban); c.lineTo(x-27,taban-boy); c.lineTo(x+27,taban-boy); c.lineTo(x+30,taban); c.closePath();};
  const serefe=()=>{c.moveTo(x-50,sk); c.lineTo(x+50,sk); c.lineTo(x+36,sk+24); c.lineTo(x-36,sk+24); c.closePath();};
  const kulah=()=>{c.moveTo(x-30,taban-boy); c.lineTo(x,taban-boy-kul); c.lineTo(x+30,taban-boy); c.closePath();};
  for(const p of[govde,serefe,kulah]){ // kenar ışığı, sonra kara kütle
    c.save(); c.translate(yon*2.5,-1); c.fillStyle=rgba(isik,.45); c.beginPath(); p(); c.fill(); c.restore();
    c.fillStyle='#07090a'; c.beginPath(); p(); c.fill();
  }
  c.save(); c.beginPath(); govde(); c.clip(); tara(x-30,taban-boy,x+30,taban,1.3,6,R.murekkep,.5,962); leke(x-yon*20,taban-boy*.5,30,boy*.6,R.siyah,.5); c.restore();
  c.fillStyle='#07090a'; c.fillRect(x-24,taban-boy-6,48,8);
  hat(govde,R.murekkep,.8,1.6,961,3,2); hat(serefe,R.murekkep,.8,1.4,963,2,1.5); hat(kulah,R.murekkep,.8,1.4,964,2,1.5);
  hat(()=>{c.moveTo(x,taban-boy-kul); c.lineTo(x,taban-boy-kul-22); c.moveTo(x-6,taban-boy-kul-14); c.lineTo(x+6,taban-boy-kul-14);},[20,22,22],.95,2,960,1,0); // alem
  for(const yy of[sk-60,sk+70]) {c.fillStyle='#020303'; c.fillRect(x-4,yy,8,22);} // mazgal
}

export const YERLER={
  /* ───── ev içi ───── */
  // yer sofrası: bekleyenler sofranın arkasında, boş yer önde
  'sofra':ip=>({
    isik:{tur:'lamba',x:-250,y:580},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum});
      nis(-250,580,96,170); raf(260,470,200); civi(420,420);
      karart(G,ust,alt);},
    sabit:[{nesne:'sofra',x:30,y:905,rx:200}],
    yer:{sofra:[30,866],sol:[-70,868],sag:[140,870],orta:[30,862],bos:[280,958],raf:[260,470],nis:[-250,580],duvar:[420,420]},
    oturma:[[-150,830,.82],[140,822,.8],[-360,905,.95],[330,850,.86],[10,815,.78],[-260,860,.86],[240,838,.82],[-60,822,.8]],
    kanit:{x:-470,y:930,s:1}
  }),
  // köy odası: başköşede minder ve yastık, önde iki fincanlı sini, yanda mangal
  'koy-odasi':ip=>({
    isik:{tur:'lamba',x:260,y:600},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+3,renk:[84,74,56]});
      nis(260,600,100,180); nis(-420,560,80,150);
      // pencere: kapalı tahta kanat
      sekil(()=>{c.rect(-260,360,150,170);},[34,26,18],[-260,360,-110,530],{seed:903,aralik:5}); hat(()=>{c.moveTo(-185,360); c.lineTo(-185,530);},R.murekkep,.8,2,904,2,1);
      karart(G,ust,alt);},
    sabit:[{nesne:'minder',x:-370,y:812,s:.85,renk:[58,44,32]},{nesne:'minder',x:-420,y:900,s:.9,renk:[54,40,30]},{nesne:'minder',x:410,y:820,s:.85,renk:[58,44,32]}],
    yer:{baskose:[-40,806],onu:[60,940],sini1:[28,930],sini2:[96,934],mangal:[320,945],mangalUstu:[318,903],nis:[260,600]},
    oturma:[[-370,824,.9],[400,840,.88]],
    kanit:{x:-200,y:830,s:.8}
  }),
  // çeyiz sandığı: sandığın yanında oturan ana
  'ceyiz':ip=>({
    isik:{tur:'lamba',x:250,y:560},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+5});
      raf(250,560,180); civi(-120,420); civi(-60,420);
      karart(G,ust,alt);},
    sabit:[],
    yer:{sandik:[20,880],raf:[250,560],yan:[-200,900]},
    oturma:[[-230,880,.95],[330,830,.84]],
    kanit:{x:180,y:900,s:.85}
  }),
  // ocak başı: yanan ocak tek ışık; ocağın önünde sofra
  'ocak-basi':ip=>({
    isik:{tur:'ocak',x:-160,y:700,ic:70,dis:820},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+7,renk:[70,62,46]});
      civi(330,470); raf(-460,480,160);
      karart(G,ust,alt);},
    sabit:[{nesne:'ocak',x:-160,y:Z+4,w:200,h:170,yanik:true},{nesne:'sofra',x:110,y:930,rx:160}],
    yer:{sofra:[110,894],ocakOnu:[-160,840],duvar:[330,470],bos:[-190,930]},
    oturma:[[-420,880,.95],[40,850,.8],[200,856,.8],[-30,870,.8],[300,900,.85],[130,840,.78]],
    kanit:{x:-330,y:880,s:.8}
  }),
  // kiler kapısı: demirli, kilitli
  'kiler':ip=>({
    isik:{tur:'lamba',x:170,y:900},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'tas',seed:ip.tohum+9});
      civi(150,520); // anahtarın asıldığı boş çivi
      karart(G,ust,alt);},
    sabit:[{nesne:'kapi',x:-30,y:Z+4,w:200,h:350,kilit:true,demir:true}],
    yer:{yer:[170,900],civi:[150,520]},
    oturma:[[-330,900,.95]], ayakta:[[330,850,.9]],
    kanit:{x:-210,y:820,s:.75}
  }),
  // masa başı: üstünde mühür ve imzasız kâğıt
  'masa-basi':ip=>({
    isik:{tur:'lamba',x:-120,y:754},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+11});
      nis(300,560,90,150); civi(-380,430);
      karart(G,ust,alt);},
    sabit:[{nesne:'masa',x:0,y:910,w:340,h:156}],
    yer:{masa:[30,756],masaSol:[-120,756],bos:[60,1000]},
    oturma:[[-370,880,.9],[350,860,.88]],
    kanit:{x:250,y:930,s:.8}
  }),

  /* ───── işler ───── */
  'demirci':ip=>({
    isik:{tur:'kor',x:-200,y:640,ic:70,dis:1080},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'tas',seed:ip.tohum+13,renk:[54,50,40]});
      leke(-230,300,300,320,R.siyah,.7); // is
      civi(330,430); civi(400,450);
      karart(G,ust,alt);},
    sabit:[{nesne:'korukOcak',x:-220,y:Z+10},{nesne:'ors',x:130,y:915,s:1.25},{nesne:'suTeknesi',x:440,y:935}],
    yer:{ors:[96,724],masa:[96,724],orsYan:[250,935],teknede:[440,877],ocakDibi:[-150,Z+40]},
    oturma:[], ayakta:[[-480,860,.82]],
    kanit:{x:360,y:950,s:.85}
  }),
  'okul':ip=>({
    isik:{tur:'gun',x:-500,y:-100},
    arka(G,ust,alt){gok(ust-20,330,G,{tur:'bulut',seed:ip.tohum+15}); uzakEvler(330,G,{seed:ip.tohum+16,agac:0});
      sivaDuvar(-G*.85,240,G*.85,Z+4,{seed:ip.tohum+17,renk:[96,92,74],yama:6});
      sekil(()=>{c.moveTo(-G*.88,240); c.lineTo(G*.88,240); c.lineTo(G*.88,214); c.lineTo(-G*.88,214); c.closePath();},[40,34,24],[-G,214,G,240],{seed:905,aralik:5}); // saçak
      toprakZemin(Z,alt+10,G,{seed:ip.tohum+18,renk:[46,40,30]});
      karart(G,ust,alt);},
    sabit:[{nesne:'kapi',x:150,y:Z+4,w:180,h:310,kilit:true},{nesne:'pencere',x:-210,y:650,w:230,h:170,icerik:'karatahta'}],
    yer:{kapiOnu:[150,800],esik:[150,790]},
    ayakta:[[60,880,.95],[200,872,.9],[-40,866,.88],[300,890,.95],[-150,898,.98],[110,850,.85]],
    kanit:{x:-380,y:900,s:.85}
  }),
  'ebe-kapi':ip=>({
    isik:{tur:'aralik',x:270,y:620},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+19,renk:[66,60,46]});
      civi(-60,410); civi(-360,420);
      karart(G,ust,alt);},
    sabit:[{nesne:'kapi',x:270,y:Z+4,w:170,h:320,isik:true,halka:true},{nesne:'sedir',x:-260,y:820,w:520}],
    yer:{sedir:[-260,746],duvar:[-60,410],duvar2:[-360,420],yer:[30,930]},
    kanit:{x:-30,y:930,s:.85}
  }),
  'dukkan':ip=>({
    isik:{tur:'safak',x:420,y:120},
    arka(G,ust,alt){gok(ust-20,280,G,{tur:'safak',seed:ip.tohum+21}); uzakEvler(280,G,{seed:ip.tohum+22,agac:0});
      tasDuvar(-G*.9,180,G*.9,Z+4,{seed:ip.tohum+23});
      sekil(()=>{c.rect(-G*.92,150,G*1.84,32);},[36,30,22],[-G,150,G,182],{seed:906,aralik:5});
      toprakZemin(Z,alt+10,G,{seed:ip.tohum+24,renk:[44,38,28]});
      karart(G,ust,alt);},
    sabit:[{nesne:'kepenk',x:0,y:Z+4,w:440,h:320}],
    yer:{esik:[0,800],kepenkAlti:[40,782]},
    ayakta:[[-320,880,.95],[300,870,.92],[450,840,.86],[-470,850,.88]],
    kanit:{x:150,y:792,s:.7}
  }),

  /* ───── tek başına yerler ───── */
  'cami-avlu':ip=>{const gece=ip.zaman==='gece'; return {
    isik:gece?{tur:'ay',x:120,y:560}:{tur:'safak',x:300,y:300},
    arka(G,ust,alt){gok(ust-20,490,G,{tur:gece?'gece':'safak',seed:ip.tohum+25,ay:gece?[170,250]:null});
      minare(300,480,250,gece?{isik:[170,186,180],yon:-1,hale:.16}:{isik:[190,180,150],yon:1,hale:.1});
      tasDuvar(-G*.95,470,G*.95,Z+4,{seed:ip.tohum+26,renk:[78,74,60]});
      sekil(()=>{c.rect(-G,452,G*2,24);},[58,54,44],[-G,452,G,476],{seed:907,aralik:5}); // duvar başı
      toprakZemin(Z,alt+10,G,{seed:ip.tohum+27,renk:[52,48,40]});
      for(let x=-G;x<G;x+=120) hat(()=>{c.moveTo(x,Z); c.lineTo(x*1.5,alt);},R.murekkep,.35,1.4,908+(x|0),1,3); // avlu taşları
      karart(G,ust,alt);},
    sabit:[{nesne:'kapi',x:-170,y:Z+4,w:170,h:280,halka:true}],
    yer:{kapiYani:[-40,Z+6],esik:[-170,806],seki:[150,800],sekiUstu:[230,714]},
    kanit:{x:0,y:830,s:.8}
  };},
  'cesme':ip=>{const gece=ip.zaman==='gece'; return {
    isik:gece?{tur:'ay',x:40,y:700,ic:160,dis:1000}:{tur:'aksam',x:-120,y:560,ic:200,dis:1100},
    arka(G,ust,alt){gok(ust-20,430,G,{tur:gece?'gece':'aksam',seed:ip.tohum+29,ay:gece?[420,170]:null}); uzakEvler(430,G,{seed:ip.tohum+30,agac:0});
      tasDuvar(-G*.95,420,G*.95,Z+4,{seed:ip.tohum+31,renk:[70,66,54]});
      toprakZemin(Z,alt+10,G,{seed:ip.tohum+32,renk:[44,40,32]});
      leke(0,Z+60,360,40,R.ay,.06); // ıslak zemin
      karart(G,ust,alt);},
    sabit:[{nesne:'cesme',x:0,y:Z+30,suSon:(ip.nesneler||[]).some(n=>n.nesne==='gugum'&&n.yer==='yalak')?-118:-44}],
    yer:{yalak:[0,Z-14],lule:[0,Z-120],on:[-60,Z+110],yan:[-250,Z+70],sag:[240,Z+60]},
    ayakta:[[-250,880,.92],[250,872,.9],[400,840,.82],[-420,850,.86]],
    hayvan:[[-330,860,1,{yon:1}]],
    kanit:{x:200,y:Z+86,s:.8}
  };},
  'dikis':ip=>({
    isik:{tur:'lamba',x:250,y:780},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+33,renk:[78,70,58]});
      civi(-300,420); civi(-240,420); raf(330,520,180);
      // duvara iğnelenmiş kalıp kâğıtları
      for(let i=0;i<3;i++) sekil(()=>{c.rect(-470+i*70,450+i*12,56,80);},[108,100,80],[-470+i*70,450,-414+i*70,530+i*12],{seed:909+i,tara:false,kalin:1});
      karart(G,ust,alt);},
    sabit:[{nesne:'dikisMakinesi',x:110,y:910},{nesne:'manken',x:-240,y:924,s:.92}],
    yer:{masaUstu:[250,780],makine:[110,910],bos:[-40,1010],yer:[-30,980]},
    kanit:{x:-420,y:960,s:.85}
  }),
  'ambar':ip=>({
    isik:{tur:'safak',x:330,y:300,ic:30,dis:900},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'tas',seed:ip.tohum+35,renk:[60,56,44]});
      // tepede küçük pencere: dışarısı şafak
      c.fillStyle='#4a4e46'; c.fillRect(300,250,70,56); leke(335,278,40,30,[180,190,175],.5);
      for(let x=312;x<370;x+=18) hat(()=>{c.moveTo(x,250); c.lineTo(x,306);},R.demir,.9,3,910+x,1,0);
      // pencereden inen soluk ışık sütunu
      c.save(); c.globalCompositeOperation='lighter'; const g=c.createLinearGradient(330,300,140,Z+60); g.addColorStop(0,'rgba(120,130,120,.16)'); g.addColorStop(1,'rgba(120,130,120,0)');
      c.fillStyle=g; c.beginPath(); c.moveTo(300,300); c.lineTo(370,300); c.lineTo(230,Z+120); c.lineTo(60,Z+120); c.closePath(); c.fill(); c.restore();
      civi(180,500); civi(260,480);
      karart(G,ust,alt);},
    sabit:[{nesne:'kapi',x:-200,y:Z+4,w:280,h:390,demir:true},{nesne:'cuval',x:380,y:900},{nesne:'cuval',x:450,y:880,seed:3},{nesne:'cuval',x:-430,y:900,seed:5}],
    yer:{civi:[180,500],civi2:[260,480],yer:[100,940]},
    kanit:{x:300,y:960,s:.85}
  }),
  'degirmen':ip=>({
    isik:{tur:'fener',x:-60,y:560},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'tas',seed:ip.tohum+37,renk:[58,56,46]});
      nis(-380,600,90,140); civi(-60,450);
      leke(-200,Z+60,300,40,[120,140,140],.12);
      karart(G,ust,alt);},
    sabit:[{nesne:'degirmenTasi',x:80,y:900},{nesne:'ark',x:-200,y:Z+60},{nesne:'cuval',x:-430,y:920},{nesne:'cuval',x:390,y:930,seed:7}],
    yer:{nis:[-380,600],yer:[260,960]},
    kanit:{x:-110,y:960,s:.85}
  }),
  'karakol':ip=>({
    isik:{tur:'lamba',x:-150,y:754},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+39,renk:[74,74,60]});
      civi(320,420);
      karart(G,ust,alt);},
    sabit:[{nesne:'pencere',x:330,y:640,w:170,h:180},{nesne:'tufekAskisi',x:-360,y:380},{nesne:'masa',x:0,y:910,w:360,h:156}],
    yer:{defter:[-20,756],mektup:[130,760],masaSol:[-150,756],bos:[40,1010]},
    kanit:{x:-420,y:940,s:.85}
  }),
  'magara':ip=>({
    isik:{tur:'ay',x:150,y:640,ic:150,dis:980},
    arka(G,ust,alt){
      kaya(-G,ust-20,G,Z+60,{seed:ip.tohum+41});
      // mağaranın ağzı: geniş, düzensiz kemer; dışarıda gece, ay ve uzak tepeler
      // düzensiz, yamuk ağız: solda yüksek ve dik, sağda alçalıp kayaya karışır; kenarı dişli
      const AG=[[-240,Z+30],[-252,740],[-236,690],[-250,640],[-214,590],[-196,540],[-150,512],[-120,470],[-70,452],[-40,430],[10,436],[60,420],[96,446],[150,452],[186,488],[236,506],[262,548],[300,584],[312,640],[346,676],[350,730],[372,Z+30]];
      const agiz=()=>{c.moveTo(AG[0][0],AG[0][1]); for(let i=1;i<AG.length;i++){const p=AG[i], q=AG[i-1]; c.quadraticCurveTo(q[0]+(p[0]-q[0])*.2+((i%3)-1)*6,q[1]+(p[1]-q[1])*.8,p[0],p[1]);} c.closePath();};
      c.save(); c.beginPath(); agiz(); c.clip();
      gok(380,Z+30,G,{tur:'gece',seed:ip.tohum+42,ay:[240,500]});
      c.fillStyle='#0b0e0f'; c.beginPath(); c.moveTo(-200,Z-40); c.bezierCurveTo(-60,Z-90,80,Z-60,180,Z-80); c.bezierCurveTo(280,Z-100,360,Z-60,420,Z-70); c.lineTo(420,Z+40); c.lineTo(-200,Z+40); c.closePath(); c.fill(); // uzak tepe
      hat(()=>{c.moveTo(-200,Z-40); c.bezierCurveTo(-60,Z-90,80,Z-60,180,Z-80); c.bezierCurveTo(280,Z-100,360,Z-60,420,Z-70);},[120,136,132],.3,1.4,914,2,2);
      c.restore();
      // ağzın kalın kaya kenarı: ışığa bakan iç kenarda soğuk parıltı
      c.save(); c.strokeStyle='rgba(150,170,166,.28)'; c.lineWidth=5; c.beginPath(); agiz(); c.stroke(); c.restore();
      hat(agiz,R.murekkep,.95,3.2,912,3,4);
      toprakZemin(Z+20,alt+10,G,{seed:ip.tohum+44,renk:[38,36,30]});
      // ağızdan içeri dökülen ay ışığı: zeminde soğuk bir dil
      c.save(); c.globalCompositeOperation='lighter'; leke(110,Z+90,330,70,R.ay,.1); leke(60,Z+170,240,60,R.ay,.06); c.restore();
      for(let i=0;i<7;i++) leke(-460+i*150,Z+44,90,26,R.tasKoyu,.6);
      // ön planda kara kaya kütleleri: kadrajın tepesi ve iki yanı
      c.fillStyle='#040505';
      c.beginPath(); c.moveTo(-G,ust-20); c.lineTo(G,ust-20); c.lineTo(G,260); c.bezierCurveTo(G*.5,300,200,250,80,300); c.bezierCurveTo(-60,350,-300,240,-G,320); c.closePath(); c.fill();
      hat(()=>{c.moveTo(G,260); c.bezierCurveTo(G*.5,300,200,250,80,300); c.bezierCurveTo(-60,350,-300,240,-G,320);},R.murekkep,.9,2.4,915,2,3);
      karart(G,ust,alt);},
    sabit:[{nesne:'duzTas',x:170,y:850,s:.9}],
    yer:{ates:[-40,948],kaput:[-260,944],tas:[170,812],yer:[60,990]},
    kanit:{x:0,y:950,s:.85}
  }),
  'ahir':ip=>({
    isik:{tur:'fener',x:-20,y:560},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'tas',seed:ip.tohum+45,renk:[56,52,42]});
      civi(-20,470); civi(380,460);
      karart(G,ust,alt);},
    sabit:[{nesne:'ahirBolme',x:0,y:948,w:1320,h:110,dikme:[-640,-430,280,620]}],
    yer:{dikme:[-20,560],duvar:[380,460],yer:[150,990]},
    // iki katır başları fenerin altında birbirine dönük; üçüncüsü solda, arkada, karanlıkta (yalnız kulak ve yük seçilir)
    hayvan:[[-200,940,1.2,{yon:1}],[330,892,1.0,{yon:-1}],[-520,886,.96,{yon:1}]],
    kanit:{x:150,y:945,s:.9}
  }),
  'agil':ip=>({
    isik:{tur:'ay',x:60,y:780,ic:160,dis:1000},
    arka(G,ust,alt){gok(ust-20,600,G,{tur:'gece',seed:ip.tohum+47,ay:[-400,160]});
      // alçak tepeler
      c.fillStyle='#08090a'; c.beginPath(); c.moveTo(-G,600); c.bezierCurveTo(-G*.6,560,-G*.3,590,0,575); c.bezierCurveTo(G*.3,560,G*.7,600,G,580); c.lineTo(G,Z+10); c.lineTo(-G,Z+10); c.closePath(); c.fill();
      tara(-G,460,G,Z,.1,10,R.murekkep,.3,913);
      toprakZemin(Z-40,alt+10,G,{seed:ip.tohum+48,renk:[32,30,24]});
      karart(G,ust,alt);},
    sabit:[{nesne:'agilDuvar',x:0,y:850,w:1700,kapi:240}],
    yer:{kapi:[90,910],duvarUstu:[-330,702],yer:[-200,960]},
    suru:[-760,760,716,1.1],
    kanit:{x:-260,y:950,s:.85}
  }),
  'baraka':ip=>({
    isik:{tur:'ay',x:330,y:600,ic:40,dis:900},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'tahta',seed:ip.tohum+49});
      raf(-160,560,200);
      // tahta aralığından süzülen ay ışığı çizgileri
      c.save(); c.globalCompositeOperation='lighter';
      for(const x of[40,180,410]){const g=c.createLinearGradient(0,120,0,Z); g.addColorStop(0,'rgba(150,170,165,0)'); g.addColorStop(.5,'rgba(150,170,165,.22)'); g.addColorStop(1,'rgba(150,170,165,.05)'); c.fillStyle=g; c.fillRect(x,120,3,Z-120);}
      c.restore();
      karart(G,ust,alt);},
    sabit:[{nesne:'kapi',x:330,y:Z+4,w:160,h:310,isik:'ay'}],
    yer:{tas:[0,930],raf:[-160,560],tabure:[-330,900],sal:[-330,840]},
    hayvan:[[-150,915,1,{poz:'otur',yon:1}],[150,925,1.05,{poz:'otur',yon:-1}],[-40,880,.9,{poz:'yat',yon:1}],[260,860,.9,{poz:'bak',yon:1}],[-270,880,.9,{poz:'otur',yon:1}],[70,990,1.1,{poz:'otur',yon:-1}],[420,880,.85,{poz:'otur',yon:-1}]],
    kanit:{x:-440,y:960,s:.85}
  }),
  'oda':ip=>({
    isik:{tur:'lamba',x:-200,y:580},
    arka(G,ust,alt){icOda(G,ust,alt,{duvar:'siva',seed:ip.tohum+51}); nis(-200,640,90,150); karart(G,ust,alt);},
    sabit:[], yer:{orta:[0,900],nis:[-200,640],bos:[100,980]},
    oturma:[[-330,880,.9],[330,860,.88]],
    kanit:{x:300,y:960,s:.85}
  })
};
