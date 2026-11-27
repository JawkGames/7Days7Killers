// Bakkal dükkânı (içeriden): solda kepenkleri açılmış giriş (dışarısı aşırı pozlanmış); sağda arka duvar boyunca raflar
// (kavanozlar, kelle şekerleri, sabun, kibrit, şişe, top basma); rafların önünde tahta tezgâh, üstünde iki kefeli terazi,
// dirhemler ve veresiye defteri; tezgâhın önünde gaz tenekeleri; sol önde ağzı açık bakliyat çuvalları ve kepçe.
// Tek ışık: açık giriş (sol arka). Gölgeler sağa ve makineye doğru düşer.
import {c} from '../../../teknik/tuval.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,yol3,golgele,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,zemin,aydinlikBosluk,karanlik,atmosfer,leke,MUREKKEP} from '../mekan-yardim.js';
import {badanaDuvar,dipGolgesi,kutuDoku,tahtaYuzey,torna,daire3,kenarIsigi} from './koy-odasi.js';

const SIVA=[180,172,150], TOPRAK=[126,114,94], AHSAP=[116,94,66], TENEKE=[150,150,142], CUVAL=[168,156,126];
const ARKA=500, SOL=-250, SAG=250, TAVAN=250;
const GIRIS={x:[-236,-120], ust:200};
const RAF={x:[-34,246], z:[466,ARKA], katlar:[0,40,82,124,166,208]};
const TEZ={x:[-44,214], y:[0,94], z:[392,440]};
const isik={konum:[-178,130,470], guc:1.65, menzil:420, ortam:.36};

// ağzı açık, kenarı dışa kıvrılmış çuval; içinde bakliyat. X,Z taban merkezi
function acikCuval(P,X,Z,rr,h,ic,R,t,{kepce=false}={}){
  const prof=[[rr*.9,0],[rr*1.14,h*.16],[rr*1.12,h*.42],[rr*1.0,h*.72],[rr*.9,h*.86],[rr*.94,h*.93],[rr*1.04,h*.97],[rr*1.02,h]];
  duzlemde(P,[X,0,Z],DUZLEM.zemin,()=>{leke(rr*.6,-rr*.4,rr*1.6,rr*.9,[0,0,0],.55);});
  torna(P,isik,X,Z,prof,CUVAL,t,{dilim:20,ust:false});
  // çuval dokusu (çaprazlama ince hatlar), sarkık kıvrımlar, bağ ipi izi
  for(let i=0;i<22;i++){const a=Math.PI*(1.05+i*.04), ca=Math.cos(a), sa=Math.sin(a); if(ca*-X+sa*-Z<0) continue;
    hat3(P,[[X+ca*rr*1.1,h*.2,Z+sa*rr*1.1],[X+ca*rr*.95,h*.85,Z+sa*rr*.95]],i%2?[0,0,0]:[230,220,190],.1,.8,t+60+i,1,.4);}
  for(let i=0;i<7;i++){const a=Math.PI*(1.12+i*.11), x=X+Math.cos(a)*rr*1.06, z=Z+Math.sin(a)*rr*1.06; hat3(P,[[x,h*.92,z],[x+(R()-.5)*6,h*.55,z],[x+(R()-.5)*8,h*.15,z]],[20,16,12],.45,1.1,t+20+i,1,.6);}
  { const bant=daire3(X,h*.88,Z,rr*.92,rr*.92,24).filter(q=>P.derinlik(...q)<P.derinlik(X,h*.88,Z)).sort((a,b)=>P.n(...a)[0]-P.n(...b)[0]); hat3(P,bant,[30,24,18],.5,1.2,t+30,1,.4); }
  // ağız: kıvrık kenarın içi ve bakliyat yüzeyi
  const agiz=daire3(X,h,Z,rr*1.02,rr*1.02,24).map((q,k)=>[q[0]+(R()-.5)*2,q[1]+(k%3?0:R()*2),q[2]+(R()-.5)*2]), yuz=daire3(X,h-3,Z,rr*.86,rr*.86,24);
  cokgen3(P,agiz,golgele(CUVAL,.55));
  cokgen3(P,yuz,golgele(ic,aydinlik(isik,[X,h,Z],[0,1,0])*1.05));
  c.save(); c.beginPath(); yol3(P,yuz); c.clip();
  const m=P.n(X,h-3,Z), o=P.olcek(X,h,Z);
  for(let i=0;i<220;i++){const a=R()*TAU, u=Math.sqrt(R())*rr, s=P.n(X+Math.cos(a)*u,h-3+(1-u/rr)*4,Z+Math.sin(a)*u); c.fillStyle=R()<.5?'rgba(0,0,0,.35)':`rgba(${ic[0]+60},${ic[1]+56},${ic[2]+40},.5)`; c.beginPath(); c.ellipse(s[0],s[1],(.6+R()*.6)*o,(.4+R()*.4)*o,R()*3,0,TAU); c.fill();}
  leke(m[0]-rr*o*.3,m[1]-rr*o*.1,rr*o*.5,rr*o*.25,[230,220,190],.2);
  c.restore();
  hat3(P,agiz,MUREKKEP,.6,1.1,t+40,2,.8,true); hat3(P,yuz,MUREKKEP,.3,.8,t+41,1,.5,true);
  if(kepce){ // teneke kepçe bakliyata saplanmış
    torna(P,isik,X+rr*.25,Z-rr*.1,[[5,h-2],[5.4,h+8]],TENEKE,t+50,{dilim:14,ustRenk:[40,38,34]});
    hat3(P,[[X+rr*.25+4,h+4,Z-rr*.1],[X+rr*.25+18,h+20,Z-rr*.1-4]],[60,58,52],1,2.4,t+51,1,.2);
  }
}

// gaz tenekesi: kare teneke, üstte vidalı ağız ve tel sap; kenarları ezik, yüzünde kabartma çapraz
function teneke(P,X,Z,R,t){
  const w=12, h=35;
  duzlemde(P,[X,0,Z],DUZLEM.zemin,()=>{leke(8,-8,22,12,[0,0,0],.5);});
  kutuDoku(P,isik,[X-w,X+w],[0,h],[Z-w,Z+w],TENEKE,t,{doku:'duz',cizgi:.6,kenar:.6});
  const yuz=[[X-w,0,Z-w],[X+w,0,Z-w],[X+w,h,Z-w],[X-w,h,Z-w]];
  c.save(); c.beginPath(); yol3(P,yuz); c.clip();
  hat3(P,[[X-w+2,2,Z-w],[X+w-2,h-2,Z-w]],[255,255,250],.18,1.4,t+1,1,.3); hat3(P,[[X+w-2,2,Z-w],[X-w+2,h-2,Z-w]],[0,0,0],.25,1.4,t+2,1,.3);
  for(let i=0;i<5;i++){const s=P.n(X+(R()-.5)*w*2,R()*h,Z-w), o=P.olcek(X,0,Z); leke(s[0],s[1],(3+R()*6)*o,(2+R()*5)*o,R()<.5?[60,44,30]:[230,230,220],.3);} // pas, parlama
  c.restore();
  torna(P,isik,X+w*.5,Z+w*.4,[[2.6,h],[2.6,h+3]],[70,70,66],t+3,{dilim:12});
  hat3(P,[[X-w*.6,h,Z],[X,h+9,Z-1],[X+w*.6,h,Z]],[50,50,46],1,1.4,t+4,1,.2);
}

// raf ve üzerindekiler
function raflar(P,R){
  const [x0,x1]=RAF.x, [z0,z1]=RAF.z, K=RAF.katlar;
  // arka pano (rafların ardı karanlık)
  cokgen3(P,[[x0,0,z1-1],[x1,0,z1-1],[x1,K[K.length-1]+10,z1-1],[x0,K[K.length-1]+10,z1-1]],[44,38,30]);
  for(let i=1;i<K.length;i++){
    const y=K[i];
    kutuDoku(P,isik,[x0,x1],[y-3,y],[z0,z1],golgele(AHSAP,1.05),6000+i,{doku:'tahta',en:8,kenar:.45});
    // eşyalar (bir alt katın üstüne dizilir)
    const yb=K[i-1]===0?4:K[i-1], ust=y-3-yb;
    if(i===1) continue; // en alt göz tezgâhın ardında kalır
    let x=x0+6;
    while(x<x1-14){
      const zc=z0+16+R()*8, k=R(), tur=[2,3,4,0,2,4,3][(R()*7)|0];
      if(tur===2){ // kavanozlar (şeker, lokum) ve kelle şeker
        if(k<.6){const rr=6+R()*2, hh=Math.min(ust-6,18+R()*8); torna(P,isik,x+rr,zc,[[rr*.9,yb],[rr,yb+2],[rr,yb+hh*.85],[rr*.6,yb+hh],[rr*.62,yb+hh+3]],[190,192,184],6100+x,{dilim:16,cizgi:.45,ustRenk:[90,70,50]});
          const s=P.n(x+rr,yb+hh*.45,zc-rr), o=P.olcek(x,yb,zc); for(let j=0;j<9;j++){c.fillStyle=`rgba(${80+R()*120|0},${60+R()*90|0},${50+R()*60|0},.8)`; c.fillRect(s[0]+(R()-.5)*rr*1.4*o,s[1]+(R()-.4)*hh*.6*o,2.2*o,1.6*o);} leke(s[0]-rr*o*.4,s[1]-hh*o*.2,1.2*o,hh*o*.3,[255,255,250],.5); x+=rr*2+3;}
        else{const rr=6, hh=Math.min(ust-4,26); torna(P,isik,x+rr,zc,[[rr,yb],[rr*.8,yb+hh*.4],[.6,yb+hh]],[70,84,120],6150+x,{dilim:14,cizgi:.45}); x+=rr*2+3;} // kelle şeker (mavi kâğıtta)
      }else if(tur===3){ // sabun kalıpları ve kibrit kutuları yığını
        const w=14+R()*8, hh=6+R()*10, renk=R()<.5?[200,190,150]:[150,70,50];
        for(let j=0;j*7<hh;j++) kutuDoku(P,isik,[x,x+w],[yb+j*7,yb+j*7+6.5],[zc-6,zc+6],golgele(renk,.9+R()*.2),6200+x+j,{doku:'duz',cizgi:.45,kenar:.3});
        x+=w+3;
      }else if(tur===4){ // şişeler
        const rr=3+R()*1.6, hh=Math.min(ust-4,16+R()*16); torna(P,isik,x+rr,zc,[[rr,yb],[rr,yb+hh*.6],[1.4,yb+hh*.8],[1.2,yb+hh]],R()<.5?[60,74,64]:[120,90,50],6300+x,{dilim:12,cizgi:.45,ustRenk:[30,24,18]});
        const s=P.n(x+rr*.6,yb+hh*.35,zc-rr), o=P.olcek(x,yb,zc); leke(s[0],s[1],1*o,hh*o*.2,[255,255,245],.5); x+=rr*2+3;
      }else{ // top basmalar (katlı kumaş) ve teneke kutular
        if(R()<.55){const w=22+R()*10, hh=Math.min(ust-6,10+R()*12), renk=[[150,80,70],[90,100,130],[170,160,120],[110,120,90]][(R()*4)|0];
          kutuDoku(P,isik,[x,x+w],[yb,yb+hh],[zc-12,zc+10],renk,6400+x,{doku:'duz',cizgi:.45,kenar:.3});
          for(let j=1;j<hh/2.4;j++) hat3(P,[[x,yb+j*2.4,zc-12],[x+w,yb+j*2.4,zc-12]],[0,0,0],.18,.7,6450+x+j,1,.2); x+=w+3;}
        else{const rr=5+R()*2, hh=12+R()*6; torna(P,isik,x+rr,zc,[[rr,yb],[rr,yb+hh]],[130,124,110],6500+x,{dilim:14,cizgi:.45}); hat3(P,[[x,yb+hh*.5,zc-rr*.7],[x+rr*2,yb+hh*.5,zc-rr*.7]],[120,40,30],.8,2.2*P.olcek(x,yb,zc)/1.6,6550+x,1,.2); x+=rr*2+3;}
      }
    }
  }
  for(const x of[x0,(x0+x1)/2-2,x1-4]) kutuDoku(P,isik,[x,x+4],[0,K[K.length-1]+10],[z0,z0+4],golgele(AHSAP,.95),6600+x,{doku:'tahta',en:4,yonOn:'v',kenar:.3});
  kutuDoku(P,isik,[x0-4,x1+4],[K[K.length-1]+10,K[K.length-1]+18],[z0-4,z1],golgele(AHSAP,.9),6610,{doku:'tahta',en:8});
}

// tezgâh: tahta pano önü, kalın üst; terazi, dirhemler, veresiye defteri, kâğıt külah
function tezgah(P,R){
  const [x0,x1]=TEZ.x, [,y1]=TEZ.y, [z0,z1]=TEZ.z;
  kutuDoku(P,isik,[x0,x1],[0,y1-5],[z0+3,z1],golgele(AHSAP,.95),6700,{doku:'tahta',en:13,yonOn:'v'});
  for(let x=x0+40;x<x1-10;x+=56) hat3(P,[[x,6,z0+2.8],[x,y1-8,z0+2.8]],[20,16,12],.5,1.2,6710+x,1,.4); // pano bölmeleri
  for(let x=x0;x<x1-20;x+=56) hat3(P,[[x+8,14,z0+2.8],[x+48,14,z0+2.8],[x+48,y1-18,z0+2.8],[x+8,y1-18,z0+2.8]],[0,0,0],.3,1,6720+x,1,.4,true);
  duzlemde(P,[(x0+x1)/2,0,z0],DUZLEM.arka,()=>{leke(0,-8,(x1-x0)*.5,12,[0,0,0],.3); leke(-60,-30,40,22,[0,0,0],.15);}); // ayak sürtmesi
  kutuDoku(P,isik,[x0-4,x1+4],[y1-5,y1],[z0-4,z1+2],AHSAP,6730,{doku:'tahta',en:12,kenar:.55});
  // terazi: dikme, kol, zincirli iki kefe; yanında dirhemler
  const tx=130, tz=414, Y=y1;
  torna(P,isik,tx,tz,[[10,Y],[10,Y+2.5],[3.4,Y+5],[2.4,Y+44],[3.6,Y+46]],[190,160,96],6740,{dilim:16});
  hat3(P,[[tx-40,Y+47,tz],[tx+40,Y+45,tz]],[40,34,24],1,3,6741,1,.2);
  hat3(P,[[tx-40,Y+48,tz-.5],[tx+40,Y+46,tz-.5]],[230,210,150],.45,.9,6742,1,.2);
  hat3(P,[[tx,Y+47,tz],[tx,Y+58,tz]],[40,34,24],1,1.8,6743,1,.2); // dil
  for(const [dx,dy] of[[-40,1],[40,-1]]){
    const kx=tx+dx, ky=Y+12+dy;
    for(const a of[0,2.1,4.2]) hat3(P,[[kx,Y+47+dy,tz],[kx+Math.cos(a)*14,ky+3,tz+Math.sin(a)*14]],[50,44,34],.8,.9,6750+dx+a*10,1,.2);
    torna(P,isik,kx,tz,[[5,ky-4],[13,ky],[15,ky+3]],[190,160,96],6760+dx,{dilim:22,ustRenk:[140,112,66]});
  }
  for(const [i,[rr,h]] of[[6,7],[4.6,6],[3.6,5],[2.6,4]].entries()) torna(P,isik,tx+56+i*11,tz+8,[[rr,Y],[rr,Y+h],[1,Y+h+.5],[1,Y+h+2]],[90,88,80],6770+i,{dilim:14});
  // veresiye defteri ve külah kâğıtları
  const d=[[x0+20,Y+.6,z0+8],[x0+78,Y+.6,z0+6],[x0+80,Y+.6,z0+38],[x0+22,Y+.6,z0+40]];
  cokgen3(P,d,[200,194,172]); hat3(P,d,MUREKKEP,.5,.9,6780,1,.4,true); hat3(P,[[x0+50,Y+.8,z0+7],[x0+51,Y+.8,z0+39]],[60,50,40],.6,1,6781,1,.2);
  for(let i=0;i<7;i++){hat3(P,[[x0+24,Y+.8,z0+34-i*4],[x0+44+R()*4,Y+.8,z0+34-i*4]],[40,40,50],.5,.7,6782+i,1,.3); hat3(P,[[x0+54,Y+.8,z0+34-i*4],[x0+70+R()*6,Y+.8,z0+34-i*4]],[40,40,50],.5,.7,6790+i,1,.3);}
  for(let i=0;i<3;i++) cokgen3(P,[[x1-50+i,Y+.5+i*.4,z0+10],[x1-20,Y+.5+i*.4,z0+8+i],[x1-18,Y+.5+i*.4,z0+30],[x1-48,Y+.5+i*.4,z0+32]],[170,150,110]);
  kenarIsigi(P,[x0-4,y1,z0-4],[x1+4,y1,z0-4],R,{alfa:.45});
}

// giriş: dışarısı bembeyaz; kepenk kanatları katlanıp sola yaslanmış, üst kepenk kalkık
function giris(P,R){
  const [x0,x1]=GIRIS.x, u=GIRIS.ust;
  aydinlikBosluk(P,[[x0,0,ARKA+30],[x0,u,ARKA+30],[x1,u,ARKA+30],[x1,0,ARKA+30]],R);
  cokgen3(P,[[x1,0,ARKA],[x1,u,ARKA],[x1,u,ARKA+30],[x1,0,ARKA+30]],[60,52,42]); // sağ söve (görünmez yüz: karanlık)
  cokgen3(P,[[x0,u,ARKA],[x1,u,ARKA],[x1,u,ARKA+30],[x0,u,ARKA+30]],[30,26,20]);
  kutuDoku(P,{...isik,ortam:.5},[x0-4,x1+4],[0,4],[ARKA-6,ARKA+30],[120,112,96],6800,{doku:'tas',kenar:.4});
  // katlı kepenk kanatları: girişin solunda içe açılmış, duvara yaslı (zikzak)
  const kat=[[x0,ARKA],[x0+4,ARKA-34],[x0-2,ARKA-68],[x0+4,ARKA-102]];
  for(let i=0;i<kat.length-1;i++){
    const a=kat[i], b=kat[i+1], u0=[b[0]-a[0],0,b[1]-a[1]], l=Math.hypot(u0[0],u0[2]), D={u:[u0[0]/l,0,u0[2]/l],v:[0,-1,0]};
    tahtaYuzey(P,{...isik,ortam:.3+i*.04},[a[0],0,a[1]],D,[0,l,-u+4,-2],golgele(AHSAP,.85+i*.08),R,{en:12,yon:'v'});
    hat3(P,[[a[0],2,a[1]],[a[0],u-4,a[1]],[b[0],u-4,b[1]],[b[0],2,b[1]]],MUREKKEP,.6,1.1,6810+i,2,.8,true);
    hat3(P,[[a[0]+u0[0]/l*4,100,a[1]+u0[2]/l*4],[b[0]-u0[0]/l*4,100,b[1]-u0[2]/l*4]],[34,32,28],1,2,6820+i,1,.2); // demir lama
  }
  kutuDoku(P,isik,[x0-10,x1+10],[u,u+14],[ARKA-8,ARKA],AHSAP,6830,{doku:'tahta',en:7});
}

export default {
  id:'bakkal',
  kamera:{odak:860, yukseklik:152, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[-30,0,228], yuzey:'toprak', alan:12, aci:1.5},
    'zemin-orta': {duzlem:'zemin', konum:[-104,0,430], yuzey:'toprak', alan:8, aci:1.5},
    'zemin-kose': {duzlem:'zemin', konum:[-196,0,456], yuzey:'toprak', alan:6},
    'esik':       {duzlem:'zemin', konum:[-178,4,500], yuzey:'tas', alan:4},
    'duvar':      {duzlem:'arka', konum:[-70,120,ARKA], yuzey:'siva', alan:3},
    'masa-ustu':  {duzlem:'ust', konum:[28,TEZ.y[1],416], yuzey:'tahta', alan:5},
    'cuval-dibi': {duzlem:'zemin', konum:[-112,0,290], yuzey:'un', alan:5},
    'beden':      {duzlem:'zemin', konum:[30,0,322], aci:.12, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(6619);
    c.fillStyle='#16150f'; c.fillRect(0,0,1000,750);
    tahtaYuzey(P,isik,[0,TAVAN,0],DUZLEM.ust,[SOL,SAG,-ARKA,-150],[70,62,50],R,{en:5,yon:'v',boy:[400,600],asinma:0,civi:false,derz:.35});
    c.save(); c.beginPath(); c.rect(0,0,1000,750); yol3(P,[[GIRIS.x[0],0,ARKA],[GIRIS.x[0],GIRIS.ust,ARKA],[GIRIS.x[1],GIRIS.ust,ARKA],[GIRIS.x[1],0,ARKA]]); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-TAVAN,0],SIVA,R,{is:.25,yama:1});
    c.restore();
    badanaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[150,ARKA,-TAVAN,0],SIVA,R,{is:.25,yama:0});
    badanaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-150,-TAVAN,0],SIVA,R,{is:.25,yama:0});
    for(const z of[ARKA-8,430,360]) kutuDoku(P,isik,[SOL,SAG],[TAVAN-14,TAVAN],[z-8,z+8],[88,74,56],7000+z,{doku:'tahta',en:8,kenar:0});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:71,doku:.9});
    c.save(); c.globalCompositeOperation='lighter';
    c.beginPath(); yol3(P,[[GIRIS.x[0]+2,0,ARKA-2],[GIRIS.x[1]-2,0,ARKA-2],[GIRIS.x[1]+80,0,290],[GIRIS.x[0]+10,0,280]]); c.clip();
    { const a=P.n(-178,0,ARKA), b=P.n(-120,0,290), g=c.createLinearGradient(a[0],a[1],b[0],b[1]); g.addColorStop(0,'rgba(110,106,90,.55)'); g.addColorStop(1,'rgba(110,106,90,0)'); c.fillStyle=g; c.fillRect(0,0,1000,750); }
    c.restore();
    dipGolgesi(P,[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]],7,.45);
    giris(P,R);
    raflar(P,R);
    tezgah(P,R);
    teneke(P,-70,452,R,7100); teneke(P,-74,416,R,7110);
    // sağ önde tahta kasa içinde soğan (kadraj keser)
    duzlemde(P,[136,0,222],DUZLEM.zemin,()=>{leke(14,-12,50,26,[0,0,0],.5);});
    kutuDoku(P,isik,[96,176],[0,32],[200,242],golgele(AHSAP,1.1),7400,{doku:'tahta',en:8});
    for(let i=0;i<46;i++){const x=100+R()*72, z=204+R()*34, y=30+R()*6, s=P.n(x,y,z), o=P.olcek(x,y,z), k=.7+R()*.4;
      c.fillStyle=`rgb(${178*k|0},${150*k|0},${100*k|0})`; c.beginPath(); c.ellipse(s[0],s[1],3.8*o,3.2*o,0,0,TAU); c.fill(); c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=.6; c.stroke();
      c.fillStyle='rgba(255,240,200,.35)'; c.beginPath(); c.arc(s[0]-1.2*o,s[1]-1.2*o,1*o,0,TAU); c.fill();}
    // çuvallar (sol önde, kadraj keser)
    acikCuval(P,-216,384,24,54,[150,120,70],R,7200);                 // bulgur
    acikCuval(P,-196,324,26,58,[170,90,60],R,7250,{kepce:true});    // mercimek
    acikCuval(P,-152,256,25,52,[200,190,150],R,7300);                // nohut
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    c.save(); c.globalCompositeOperation='screen';
    const a=P.n(-178,GIRIS.ust,ARKA), b=P.n(-120,0,290), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(130,126,108,.16)'); g.addColorStop(1,'rgba(130,126,108,0)');
    c.beginPath(); yol3(P,[[GIRIS.x[0],GIRIS.ust,ARKA],[GIRIS.x[1],GIRIS.ust,ARKA],[GIRIS.x[1]+80,0,290],[GIRIS.x[0]+10,0,280]]); c.fillStyle=g; c.fill();
    c.restore();
    karanlik([[1000,60,240,200,.38],[1000,740,220,150,.3],[0,740,200,140,.25]]);
  }
};
