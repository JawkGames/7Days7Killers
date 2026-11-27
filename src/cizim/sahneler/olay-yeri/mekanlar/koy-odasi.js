// Köy odası (ağanın misafir odası): üç yanda sedir, üstünde minder ve duvara dayalı yastıklar; arka duvarda sıvalı ocak,
// solda demir parmaklıklı pencere, sağ köşede çiviye asılı tüfek; önde bakır sini üstünde cezve takımı. Tavan kavak kirişli.
// Tek ışık: arka duvardaki pencere (dışarısı aşırı pozlanmış). Işık sol arkadan girer, gölgeler sağa ve makineye düşer.
// Yüzeyler, dokulu kutu, pencere, güneş lekesi, minder ../ic-yardim.js içinde.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {silindir,cokgen3,hat3,yol3,aydinlik,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,zemin,karanlik,atmosfer,leke,titrek,MUREKKEP,daire3,kenarIsigi} from '../mekan-yardim.js';
import {etekBandi,pencere,torna,kutuDoku,gunesLekesi,tahtaYuzey,dipGolgesi,minder,badanaDuvar} from '../ic-yardim.js';

/* ─────────────── köy odası ─────────────── */

const SIVA=[186,178,158], TOPRAK=[124,112,92], AHSAP=[104,86,64], KIRIS=[92,78,60], BAKIR=[150,104,62], YUN=[132,92,70], YUN2=[96,84,98];
const ARKA=520, SOL=-262, SAG=262, TAVAN=236;
const PEN={x:[-206,-120], y:[96,184]};
const OCAK={x:[18,152], on:490, agiz:[46,124], agizY:92};
const SEDIR={en:76, y:34, minder:10};
const SINI={x:118, z:244, r:31};
const isik={konum:[-163,146,476], guc:1.6, menzil:380, ortam:.36};
const GUNES=[.32,-.78,-1];

// Yere serili hasır: sazdan dokuma, boyuna sık sap çizgileri, aralıklı koyu atkı bantları, saçaklanmış kenar
function hasir(P,[x0,x1],[z0,z1],r){
  const q=[[x0,0,z0],[x1,0,z0+4],[x1-3,0,z1],[x0+2,0,z1-3]];
  cokgen3(P,q,golgele([150,134,96],.72));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  for(let x=x0;x<x1;x+=2.6){const a=P.n(x,0,z0), b=P.n(x+(r()-.5),0,z1); c.strokeStyle=r()<.5?'rgba(0,0,0,.22)':'rgba(220,200,150,.16)'; c.lineWidth=.7; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();}
  for(let z=z0+18;z<z1;z+=34) cokgen3(P,[[x0,0,z],[x1,0,z],[x1,0,z+4],[x0,0,z+4]],[30,24,16],.55);
  for(let i=0;i<14;i++){const s=P.n(x0+r()*(x1-x0),0,z0+r()*(z1-z0)); leke(s[0],s[1],30+r()*60,10+r()*20,r()<.6?[0,0,0]:[200,184,140],.1+r()*.1);}
  c.restore();
  hat3(P,q,MUREKKEP,.45,1,951,2,.8,true);
  for(let x=x0;x<x1;x+=4){const a=P.n(x,0,z0), b=P.n(x+(r()-.5)*2,0,z0-2-r()*4); c.strokeStyle='rgba(170,150,110,.5)'; c.lineWidth=.8; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();}
}

// Sedir: alçak sıvalı seki, üstünde minder, duvara dayalı yastıklar. yan: -1 sol duvar, 1 sağ duvar
function sedir(P,yan,z0,z1,r,t){
  const X=yan<0?[SOL,SOL+SEDIR.en]:[SAG-SEDIR.en,SAG];
  kutuDoku(P,isik,X,[0,SEDIR.y],[z0,z1],[150,140,120],t,{doku:'tas',cizgi:.5,kenar:0});
  // sekinin önüne sarkan dokuma örtü: boyuna renkli şeritler, altta zikzak ve saçak
  const xo=yan<0?X[1]:X[0], oy=SEDIR.y+1, oh=20, band=(y0,y1,renk,a=1)=>cokgen3(P,[[xo,y0,z0],[xo,y0,z1],[xo,y1,z1],[xo,y1,z0]],golgele(renk,a));
  const ao=aydinlik(isik,[xo,oy-10,(z0+z1)/2],[-yan,0,0]);
  band(oy,oy-oh,[120,70,52],ao*1.05); band(oy-3,oy-6,[60,40,40],ao); band(oy-9,oy-11,[170,150,110],ao); band(oy-14,oy-17,[60,40,40],ao);
  { const pts=[]; for(let z=z0;z<=z1;z+=6) pts.push([xo,oy-12.5+((z-z0)/6%2?2:-2),z]); hat3(P,pts,[200,176,130],.5,1,t+5,1,.3); }
  for(let z=z0+2;z<z1;z+=3.2) hat3(P,[[xo,oy-oh,z],[xo,oy-oh-3-r()*2,z+(r()-.5)]],[150,120,90],.55,1,t+6+z,1,.3);
  hat3(P,[[xo,oy,z0],[xo,oy,z1],[xo,oy-oh,z1],[xo,oy-oh,z0]],MUREKKEP,.5,1,t+7,2,.8,true);
  // minderler: üç parça
  const parca=3, L=(z1-z0)/parca;
  // yastıklar önce (duvara dayalı, arkada kalır), sonra minder
  const xs=yan<0?[SOL+2,SOL+18]:[SAG-18,SAG-2], yp=4, YL=(z1-z0)/yp;
  for(let i=yp-1;i>=0;i--) minder(P,isik,xs,[SEDIR.y+SEDIR.minder-2,SEDIR.y+SEDIR.minder+36+r()*4],[z0+i*YL+3,z0+(i+1)*YL-3],i%2?YUN2:golgele(YUN2,1.2),r,t+40+i*5,{sis:5});
  for(let i=parca-1;i>=0;i--) minder(P,isik,[X[0]+(yan<0?0:3),X[1]-(yan<0?3:0)],[SEDIR.y,SEDIR.y+SEDIR.minder],[z0+i*L+1,z0+(i+1)*L-1],i%2?YUN:golgele(YUN,.85),r,t+20+i*5);
}

// Çiviye askılı tüfek (arka duvar düzleminde; çivi 0,0, y aşağı)
function tufek(P,X,Y){
  duzlemde(P,[X,Y,ARKA],DUZLEM.arka,()=>{
    c.save(); c.rotate(-.3); c.scale(1.15,1.15);
    const ciz=g=>{
      c.fillStyle=g?'rgba(0,0,0,.5)':'rgb(22,20,18)'; c.fillRect(-1.6,2,3.2,70); if(!g){c.fillStyle='rgba(220,210,180,.4)'; c.fillRect(-1.4,4,.8,60);}                     // namlu
      c.fillStyle=g?'rgba(0,0,0,.45)':rgba(golgele(AHSAP,.9),1);
      c.beginPath(); c.moveTo(-2.4,40); c.lineTo(2.6,40); c.lineTo(3.2,92); c.lineTo(5.5,104); c.lineTo(9,124); c.lineTo(-1,126); c.lineTo(-3.4,104); c.lineTo(-3,92); c.closePath(); c.fill(); // kundak, dipçik
      if(!g){c.fillStyle='rgb(30,28,26)'; c.fillRect(-2.8,84,5.6,6); c.strokeStyle='rgba(210,200,170,.35)'; c.lineWidth=.5; c.beginPath(); c.moveTo(-1.6,44); c.lineTo(-2,100); c.stroke();}
    };
    c.save(); c.translate(5,4); ciz(true); c.restore(); ciz(false);
    c.restore();
    // kayış: çividen namlu ucuna ve dipçiğe
    c.strokeStyle='rgb(40,32,24)'; c.lineWidth=1.3; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-4,14,Math.sin(.42)*8,Math.cos(.42)*8+4); c.stroke();
    c.fillStyle='rgb(20,18,16)'; c.beginPath(); c.arc(0,0,1.1,0,TAU); c.fill();
  });
}

export default {
  id:'koy-odasi',
  kamera:{odak:860, yukseklik:142, egim:.19},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[-20,0,238], yuzey:'toprak', alan:16, aci:1.5},
    'zemin-orta': {duzlem:'zemin', konum:[-70,0,468], yuzey:'toprak', alan:8, aci:1.5},
    'zemin-kose': {duzlem:'zemin', konum:[142,0,350], yuzey:'toprak', alan:6},
    'ocak-onu':   {duzlem:'zemin', konum:[86,0,432], yuzey:'toprak', alan:7},
    'duvar':      {duzlem:'arka', konum:[-66,166,ARKA], yuzey:'siva', alan:4},
    'sedir-ustu': {duzlem:'ust', konum:[-212,SEDIR.y+SEDIR.minder,402], yuzey:'tahta', alan:5, uygunsuz:['un']},
    'masa-ustu':  {duzlem:'ust', konum:[SINI.x-12,25,SINI.z+12], yuzey:'tas', alan:3, uygunsuz:['un','saat']},
    'beden':      {duzlem:'zemin', konum:[-36,0,350], aci:.1, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(6271), O=OCAK;
    c.fillStyle='#16140f'; c.fillRect(0,0,1000,750);
    // tavan: ince çubuk dizisi, üstünde kavak kirişler
    tahtaYuzey(P,isik,[0,TAVAN,0],DUZLEM.ust,[SOL,SAG,-ARKA,-150],[70,62,50],R,{en:5,yon:'v',boy:[400,600],asinma:0,civi:false,derz:.35});
    // arka duvar: badanalı sıva; pencere ve ocak ağzı kesilerek
    c.save(); c.beginPath(); c.rect(0,0,1000,750); yol3(P,[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1],PEN.y[0],ARKA]]); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-TAVAN,0],SIVA,R,{is:.25,yama:2});
    etekBandi(P,[0,0,ARKA],DUZLEM.arka,[SOL,SAG],70,R,.28);
    c.restore();
    badanaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[150,ARKA,-TAVAN,0],SIVA,R,{is:.25,yama:0});
    badanaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-150,-TAVAN,0],SIVA,R,{is:.25,yama:0});
    for(const z of[ARKA-6,446,382,318,254]) kutuDoku(P,isik,[SOL,SAG],[TAVAN-15,TAVAN],[z-8,z+8],KIRIS,400+z,{doku:'tahta',en:8,cizgi:.55,kenar:0});
    // zemin: sıvanmış toprak, pencereden düşen ışık
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:61,doku:.9});
    const pk=[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[1],PEN.y[0],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[0],PEN.y[1],ARKA]];
    hasir(P,[-176,150],[196,432],R);
    gunesLekesi(P,pk,GUNES,.34,{parmak:3});
    dipGolgesi(P,[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]],7,.45);
    // pencere
    pencere(P,isik,ARKA,PEN.x,PEN.y,R,{derin:38,parmak:3});
    // duvardaki çiviler: tüfek askısı ve boş çivi yuvasının çevresi
    tufek(P,214,196);
    // ocak: duvardan çıkıntı yapan sıvalı baca, kemerli ağız, önünde taş ocak taşı
    const yanY=[[O.x[0],0,O.on],[O.x[0],TAVAN,O.on],[O.x[0],TAVAN,ARKA],[O.x[0],0,ARKA]];
    cokgen3(P,yanY,golgele(SIVA,.42)); hat3(P,yanY,MUREKKEP,.5,1.1,801,2,1,true);
    const agiz=[[O.agiz[0],0],[O.agiz[0],-O.agizY+18]];
    for(let i=1;i<=12;i++){const a=Math.PI-i/12*Math.PI; agiz.push([(O.agiz[0]+O.agiz[1])/2+Math.cos(a)*(O.agiz[1]-O.agiz[0])/2,-O.agizY+18-Math.sin(a)*22]);}
    agiz.push([O.agiz[1],0]);
    c.save(); tabana(); c.beginPath(); c.rect(0,0,1000,750); duzlemYol(P,[0,0,O.on],DUZLEM.arka,agiz); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,O.on],DUZLEM.arka,[O.x[0],O.x[1],-TAVAN,0],golgele(SIVA,.97),R,{is:.35,yama:0,catlak:2});
    duzlemde(P,[0,0,O.on],DUZLEM.arka,()=>{leke(85,-120,48,60,[0,0,0],.45); leke(85,-170,60,70,[0,0,0],.25);}); // is
    c.restore();
    // ocak ağzının içi: isli, dipte kül ve yarı yanmış odun
    c.save(); tabana(); c.beginPath(); duzlemYol(P,[0,0,O.on],DUZLEM.arka,agiz); c.fillStyle='rgb(18,16,14)'; c.fill(); c.clip();
    const ai=P.n(85,40,ARKA-4); leke(ai[0],ai[1]+30,60,40,[70,66,58],.5);
    duzlemde(P,[85,0,ARKA-8],DUZLEM.arka,()=>{for(let i=0;i<40;i++){c.fillStyle=`rgba(${120+R()*60|0},${116+R()*50|0},${100+R()*40|0},${.25+R()*.35})`; c.beginPath(); c.ellipse((R()-.5)*60,-R()*6,2+R()*5,1+R()*2,0,0,TAU); c.fill();}});
    hat3(P,[[56,6,470],[112,10,500]],[30,24,18],1,5,810,1,.3); hat3(P,[[66,4,505],[110,12,476]],[40,32,24],1,4.4,811,1,.3);
    c.restore();
    titrek(()=>duzlemYol(P,[0,0,O.on],DUZLEM.arka,agiz,false),MUREKKEP,.8,1.4,812,2,1.2);
    hat3(P,[[O.x[0],0,O.on],[O.x[0],TAVAN,O.on]],MUREKKEP,.6,1.2,813,2,1);
    kutuDoku(P,isik,[O.x[0]-4,O.x[1]+4],[118,126],[O.on-10,O.on],golgele(AHSAP,.9),815,{doku:'tahta',en:8}); // ocak rafı
    // rafta bakır kap ve şamdan karaltısı
    torna(P,isik,56,O.on-5,[[4,126],[7,128],[7.6,134],[5,140],[2.4,143],[2.6,150],[3.6,152]],BAKIR,816,{dilim:18,ustRenk:[20,16,12]}); // güğüm
    torna(P,isik,128,O.on-5,[[5,126],[5,127.5],[1.4,129],[1.2,140],[3.6,141],[3.6,143]],golgele(BAKIR,.9),817,{dilim:14,ustRenk:[30,24,18]}); // şamdan
    kutuDoku(P,isik,[O.x[0]-8,O.x[1]+8],[0,9],[450,O.on],[150,144,128],818,{doku:'tas',cizgi:.55}); // ocak taşı
    // sedirler
    sedir(P,-1,300,ARKA,R,830);
    sedir(P,1,300,ARKA,R,860);
    // sini ve cezve takımı (önde, kadraj sağ alttan keser)
    silindir(P,isik,SINI.x,SINI.z+16,10,0,22,golgele(AHSAP,.8),880,{cizgi:.5}); // sini ayağı
    silindir(P,isik,SINI.x,SINI.z,SINI.r,22,25,BAKIR,881,{cizgi:.6,ustRenk:golgele(BAKIR,1.05),dilim:40});
    const sU=daire3(SINI.x,25.2,SINI.z,SINI.r-3);
    c.save(); c.beginPath(); yol3(P,sU); c.clip(); const sm=P.n(SINI.x,25,SINI.z); const so=P.olcek(SINI.x,25,SINI.z);
    leke(sm[0]-so*8,sm[1]-so*4,so*16,so*5,[240,226,190],.5); for(let i=1;i<4;i++){c.strokeStyle='rgba(40,26,14,.35)'; c.lineWidth=.8; c.beginPath(); yol3(P,daire3(SINI.x,25.2,SINI.z,(SINI.r-3)*i/4)); c.stroke();}
    c.restore();
    const cezve=(x,z,rr,h,t)=>{ // geniş dip, boğumlu boyun, ağız dudağı; uzun sap
      torna(P,isik,x,z,[[rr*.9,25],[rr,25+h*.15],[rr*.95,25+h*.45],[rr*.72,25+h*.78],[rr*.7,25+h*.86],[rr*.86,25+h]],golgele(BAKIR,.85),t,{dilim:18,ustRenk:[22,18,14]});
      hat3(P,[[x-rr*.8,25+h*.8,z],[x-rr-16,25+h+4,z+5]],[30,24,18],1,2.4,t+1,1,.3);
      kenarIsigi(P,[x-rr*.55,25+h*.2,z-rr*.8],[x-rr*.5,25+h*.75,z-rr*.6],R,{alfa:.6,parca:2});};
    cezve(SINI.x+10,SINI.z-4,5.5,11,890); cezve(SINI.x-4,SINI.z+14,4.5,9,893);
    for(const [x,z] of[[SINI.x+16,SINI.z+16],[SINI.x+22,SINI.z+6],[SINI.x-14,SINI.z-10]]){ // zarflı fincan
      torna(P,isik,x,z,[[1.4,25],[2.6,25.4],[2.8,27.4],[3.1,30]],golgele(BAKIR,.7),900+x,{dilim:14,cizgi:.45,ustRenk:[220,214,196]});
      const f=P.n(x,30.1,z), o=P.olcek(x,30,z); c.fillStyle='rgba(16,12,10,.9)'; c.beginPath(); c.ellipse(f[0],f[1],2.2*o,1*o,0,0,TAU); c.fill();}
    // ön sağda kenarda dibek taşı (kahve dövülen taş havan), kadraj keser
    silindir(P,isik,168,222,20,0,40,[140,134,118],905,{cizgi:.6,ustRenk:[120,114,100]});
    { const d=P.n(168,40.2,222), o=P.olcek(168,40,222); c.fillStyle='rgba(10,10,8,.85)'; c.beginPath(); c.ellipse(d[0],d[1],10*o,10*o*.45,0,0,TAU); c.fill(); }
    hat3(P,[[160,38,224],[146,96,240]],golgele(AHSAP,.7),1,4,906,1,.4); // tokmak
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    // pencereden giren ışık huzmesi
    c.save(); c.globalCompositeOperation='screen';
    const a=P.n(-163,170,ARKA), b=P.n(-90,0,320), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(140,136,116,.16)'); g.addColorStop(1,'rgba(140,136,116,0)');
    c.beginPath(); yol3(P,[[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1]+90,0,270],[PEN.x[0]+60,0,280]]); c.fillStyle=g; c.fill();
    c.restore();
    karanlik([[1000,90,240,200,.42],[0,740,200,140,.3],[1000,740,240,150,.32],[0,60,180,160,.25]]);
  }
};
