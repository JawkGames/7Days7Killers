// Ağa konağının taş avlusu (hayat): arkada kesme taş cephe, ortasında sivri kemerli derin eyvan; solda çivili konak kapısı;
// sağda cepheye dayalı taş merdiven, basamaklarında fesleğen saksıları; solda önde bilezik taşlı kuyu ve çıkrığı.
// Tek ışık: sol önden, yüksekten vuran güneş. Cephe aydınlık; eyvanın içi ve merdiven altı gölgede, gölgeler sağa ve geriye düşer.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {silindir,cokgen3,hat3,yol3,golgele,tabana,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,tasOrgu,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {kutuDoku,tahtaYuzey,tasDoseme,torna,daire3,kenarIsigi,duzlemCizgi,minder} from './koy-odasi.js';

const TAS=[184,172,144], TAS2=[160,150,128], DOSEME=[156,148,128], AHSAP=[100,82,60], DEMIR=[40,38,36], TOPRAK=[150,110,80];
const ON=650;                                            // cephenin yüzü
const KEMER={x:[-118,108], omuz:196, tepe:292, derin:250, seki:34};
const KAPI={x:[-232,-148], ust:196};
const KUYU={x:-236, z:462, r:44, h:68};
const MER={x0:150, z:[548,ON], basamak:26, en:30, n:10};
const isik={konum:[-1500,1100,-700], guc:1.1, menzil:5000, ortam:.34};
const GUNES=(()=>{const d=[-isik.konum[0],-isik.konum[1],-isik.konum[2]], l=Math.hypot(...d); return d.map(v=>v/l);})();

// sivri kemer noktaları (cephe düzleminde yerel; y aşağı)
function kemerNoktalari(pay=0,k=KEMER,alt=0){
  const x0=k.x[0]-pay, x1=k.x[1]+pay, w=(x1-x0)/2, m=(x0+x1)/2, n=[[x0,-alt],[x0,-k.omuz]];
  const q=(a,b,cc,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*cc[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*cc[1]];
  for(let i=1;i<=12;i++) n.push(q([x0,-k.omuz],[x0+w*.1,-k.tepe+20-pay*.3],[m,-k.tepe-pay],i/12));
  for(let i=1;i<=12;i++) n.push(q([m,-k.tepe-pay],[x1-w*.1,-k.tepe+20-pay*.3],[x1,-k.omuz],i/12));
  n.push([x1,-alt]); return n;
}
// yerdeki gölge: dünya noktalarının güneş yönünde zemine izdüşümü
const golgeNoktasi=(q,Y=0)=>{const t=(q[1]-Y)/-GUNES[1]; return [q[0]+GUNES[0]*t,Y,q[2]+GUNES[2]*t];};

// Toprak saksıda fesleğen (Y: oturduğu yüzey)
function saksi(P,X,Y,Z,r,t){
  torna(P,isik,X,Z,[[6,Y],[6.6,Y+2],[9,Y+15],[10.4,Y+16],[10.4,Y+18]],TOPRAK,t,{dilim:16,ustRenk:[40,30,22]});
  for(let i=0;i<26;i++){const a=r()*TAU, u=Math.sqrt(r())*12, s=P.n(X+Math.cos(a)*u,Y+19+r()*14-u*.4,Z+Math.sin(a)*u*.6), o=P.olcek(X,Y,Z), k=.35+r()*.6;
    c.fillStyle=rgba([46*k+10,58*k+12,40*k+8],1); c.beginPath(); c.ellipse(s[0],s[1],(2.4+r()*2)*o,(1.4+r())*o,r()*3,0,TAU); c.fill();}
}

function merdiven(P,R){
  const {x0,z,basamak:b,en,n}=MER, Z0=z[0], Z1=z[1], X1=x0+en*n+120;
  // yan yüz (makineye bakan, basamaklı profil): kesme taş, yerinde ışık
  const prof=[[x0,0]]; for(let i=0;i<n;i++){prof.push([x0+i*en,-(i+1)*b]); prof.push([x0+(i+1)*en,-(i+1)*b]);} prof.push([X1,-n*b]); prof.push([X1,0]);
  // basamak yüzleri (rıht ve basamak üstü) yan yüzden önce
  for(let i=n-1;i>=0;i--){
    const xa=x0+i*en, Y=(i+1)*b;
    const riht=[[xa,Y-b,Z0],[xa,Y,Z0],[xa,Y,Z1],[xa,Y-b,Z1]];
    cokgen3(P,riht,golgele(TAS2,aydinlik(isik,[xa,Y-b/2,(Z0+Z1)/2],[-1,0,0])*.95)); hat3(P,riht,MUREKKEP,.4,1,2100+i,1,.6,true);
    if(Y<P.yukseklik){const ust=[[xa,Y,Z0],[xa+en,Y,Z0],[xa+en,Y,Z1],[xa,Y,Z1]]; cokgen3(P,ust,golgele(TAS,aydinlik(isik,[xa+en/2,Y,(Z0+Z1)/2],[0,1,0])*(.9+R()*.15)));
      c.save(); c.beginPath(); yol3(P,ust); c.clip(); const m=P.n(xa+en*.4,Y,(Z0+Z1)/2), o=P.olcek(xa,Y,Z0); leke(m[0],m[1],en*o*.4,30*o*.5,[220,210,180],.25); leke(m[0]+en*o*.4,m[1],en*o*.3,40*o*.5,[0,0,0],.2); c.restore();
      hat3(P,ust,MUREKKEP,.35,1,2150+i,1,.6,true); kenarIsigi(P,[xa,Y,Z0],[xa+en,Y,Z0],R,{alfa:.45,parca:3});}
  }
  c.save(); tabana(); c.beginPath(); duzlemYol(P,[0,0,Z0],DUZLEM.arka,prof); c.clip();
  tasOrgu(P,{...isik,ortam:.3},[0,0,Z0],DUZLEM.arka,[x0,X1,-n*b-10,0],golgele(TAS2,.9),R,{sira:16,harc:[60,56,46],duzensiz:.7});
  // merdiven altının gölgesi yan yüzün dibinde
  duzlemde(P,[0,0,Z0],DUZLEM.arka,()=>{leke(x0+160,-10,160,26,[0,0,0],.3);});
  c.restore();
  tabana(); titrek(()=>duzlemYol(P,[0,0,Z0],DUZLEM.arka,prof,false),MUREKKEP,.7,1.3,2190,2,1);
  // saksılar basamak uçlarında
  for(const i of[0,3,4,6]) saksi(P,x0+i*en+en*.5,(i+1)*b,Z0+14+R()*8,R,2200+i);
}

function kuyu(P,R){
  const {x:X,z:Z,r:rr,h}=KUYU;
  // yerdeki gölgesi (güneşin tersine)
  const g=daire3(X,h,Z,rr,rr,20).map(q=>golgeNoktasi(q)), tab=daire3(X,0,Z,rr,rr,20);
  c.save(); c.beginPath(); yol3(P,tab); yol3(P,g); c.fillStyle='rgba(0,0,0,.4)'; c.fill(); c.restore();
  cokgen3(P,[...tab.slice(5,16),...g.slice(5,16).reverse()],[0,0,0],.38);
  silindir(P,isik,X,Z,rr,0,h,TAS,2300,{ustRenk:golgele(TAS,1.05),dilim:36});
  // bilezik taşları: dikey derzler ve iki sıra
  for(let i=0;i<14;i++){const a=i/14*TAU+.1, nx=Math.cos(a), nz=Math.sin(a); if(nx*(-X-nx*rr)+nz*(-Z-nz*rr)<=0) continue;
    const ys=i%2?[0,h*.5]:[h*.5,h]; hat3(P,[[X+nx*rr,ys[0],Z+nz*rr],[X+nx*rr,ys[1],Z+nz*rr]],[60,52,40],.6,1,2310+i,1,.4);}
  const orta=daire3(X,h*.5,Z,rr+.2,rr+.2,36).filter(q=>P.derinlik(...q)<P.derinlik(X,h*.5,Z)).sort((a,b)=>P.n(...a)[0]-P.n(...b)[0]);
  hat3(P,orta,[60,52,40],.55,1,2330,1,.4);
  // ağız: kapkara kuyu
  const ic=daire3(X,h+.2,Z,rr-11,rr-11,30);
  cokgen3(P,ic,[8,8,7]);
  c.save(); c.beginPath(); yol3(P,ic); c.clip(); const im=P.n(X,h,Z+rr*.4), o=P.olcek(X,h,Z); leke(im[0],im[1]-6*o,rr*o,rr*o*.3,[70,66,56],.45); c.restore();
  hat3(P,ic,MUREKKEP,.6,1.1,2340,2,.8,true);
  // ip oluğu aşınmaları
  for(let i=0;i<4;i++){const a=-1.9+i*.25, s=P.n(X+Math.cos(a)*(rr-6),h+.3,Z+Math.sin(a)*(rr-6)); c.fillStyle='rgba(30,26,20,.5)'; c.fillRect(s[0]-1,s[1]-.6,3,1.2);}
  // çıkrık: iki direk, makara, ip, kova
  for(const dx of[-rr-4,rr+4]) kutuDoku(P,isik,[X+dx-4,X+dx+4],[0,176],[Z-4,Z+4],AHSAP,2350+dx,{doku:'tahta',en:8,yonOn:'v'});
  kutuDoku(P,isik,[X-rr-10,X+rr+10],[176,184],[Z-6,Z+6],golgele(AHSAP,.9),2352,{doku:'tahta',en:8});
  kutuDoku(P,isik,[X-rr+4,X+rr-4],[146,158],[Z-6,Z+6],golgele(AHSAP,.8),2353,{doku:'tahta',en:5,cizgi:.6}); // makara
  for(let i=0;i<8;i++) hat3(P,[[X-rr+8+i*11,146,Z-6.2],[X-rr+8+i*11,158,Z-6.2]],[30,24,16],.35,1,2360+i,1,.3);
  hat3(P,[[X+6,146,Z-2],[X+5,h+4,Z+2]],[60,52,40],.9,1.6,2370,1,.4);
  // kova bileziğin üstünde
  torna(P,isik,X+28,Z-24,[[10,h],[12.5,h+20]],[90,90,86],2380,{dilim:18,ustRenk:[16,16,14]});
  hat3(P,[[X+15.5,h+20,Z-24],[X+28,h+31,Z-24],[X+40.5,h+20,Z-24]],DEMIR,.9,1.3,2381,1,.3);
  kenarIsigi(P,[X+16,h+19,Z-30],[X+18,h+2,Z-32],R,{alfa:.5,parca:2});
}

export default {
  id:'aga-konagi',
  kamera:{odak:820, yukseklik:155, egim:.14},
  isik,
  yuvalar:{
    'zemin-on':     {duzlem:'zemin', konum:[-60,0,268], yuzey:'tas', alan:18, aci:1.5},
    'zemin-orta':   {duzlem:'zemin', konum:[-60,0,560], yuzey:'tas', alan:10, aci:1.5},
    'zemin-kose':   {duzlem:'zemin', konum:[-300,0,600], yuzey:'tas', alan:8},
    'esik':         {duzlem:'zemin', konum:[-272,4,ON+4], yuzey:'tas', alan:6},
    'duvar':        {duzlem:'arka', konum:[332,66,MER.z[0]], yuzey:'tas', alan:4, uygunsuz:['saat']},
    'kuyu-kenari':  {duzlem:'ust', konum:[KUYU.x-14,KUYU.h,KUYU.z-KUYU.r+5], yuzey:'tas', alan:3, uygunsuz:['un','saat']},
    'merdiven':     {duzlem:'ust', konum:[MER.x0+MER.en*1.5,MER.basamak*2,MER.z[0]+26], yuzey:'tas', alan:4, uygunsuz:['un']},
    'eyvan-sekisi': {duzlem:'ust', konum:[-40,17,ON-15], yuzey:'tas', alan:8},
    'beden':        {duzlem:'zemin', konum:[10,0,392], aci:.12, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(3407), K=KEMER, D=KAPI, ic=[0,0,ON+K.derin];
    c.fillStyle='#1a1914'; c.fillRect(0,0,1000,750);
    // eyvanın içi: derin, gölgede; arka duvarda niş ve sedir karaltısı
    const isikIc={...isik,ortam:.2,guc:.25};
    tasOrgu(P,isikIc,ic,DUZLEM.arka,[K.x[0],K.x[1],-K.tepe,0],TAS2,R,{sira:26,harc:[40,36,30]});
    duzlemde(P,ic,DUZLEM.arka,()=>{c.fillStyle='rgba(10,10,8,.7)'; c.beginPath(); c.moveTo(-34,-K.seki); c.lineTo(-34,-150); c.quadraticCurveTo(-4,-186,26,-150); c.lineTo(26,-K.seki); c.closePath(); c.fill();});
    minder(P,isikIc,[K.x[0],K.x[1]],[K.seki,K.seki+30],[ON+K.derin-60,ON+K.derin],[96,70,60],R,2010,{sis:4});
    for(const s of[-1,1]){const x=s<0?K.x[0]:K.x[1]; const q=[[x,K.seki,ON],[x,K.tepe+20,ON],[x,K.tepe+20,ON+K.derin],[x,K.seki,ON+K.derin]]; // iç yan duvarlar
      if(s<0){c.save(); c.beginPath(); yol3(P,q); c.clip(); tasOrgu(P,{...isik,ortam:.24,guc:.5},[x,0,0],DUZLEM.sol,[ON,ON+K.derin,-K.tepe-20,-K.seki],TAS2,R,{sira:26,harc:[40,36,30]}); c.restore();}
      else cokgen3(P,q,golgele(TAS2,.2));}
    // eyvan tabanı ve tonoz gölgesi
    const tab=[[K.x[0],K.seki,ON],[K.x[1],K.seki,ON],[K.x[1],K.seki,ON+K.derin],[K.x[0],K.seki,ON+K.derin]];
    c.save(); c.beginPath(); yol3(P,tab); c.clip(); tasDoseme(P,{...isik,ortam:.3,guc:.5},[K.x[0],K.x[1]],[ON,ON+K.derin],TAS2,R,{boy:40,Y:K.seki,derz:[30,28,24]});
    { const a=P.n(0,K.seki,ON), b=P.n(0,K.seki,ON+K.derin), g=c.createLinearGradient(0,a[1],0,b[1]); g.addColorStop(0,'rgba(0,0,0,.05)'); g.addColorStop(1,'rgba(0,0,0,.7)'); c.fillStyle=g; c.fillRect(0,0,1000,750); }
    c.restore();
    // cephe: kesme taş, kemer ve kapı kesilerek
    c.save(); tabana(); c.beginPath(); c.rect(0,0,1000,750);
    duzlemYol(P,[0,0,ON],DUZLEM.arka,kemerNoktalari(0,K,K.seki));
    duzlemYol(P,[0,0,ON],DUZLEM.arka,[[D.x[0],0],[D.x[0],-D.ust],[D.x[1],-D.ust],[D.x[1],0]]);
    c.clip('evenodd');
    tasOrgu(P,isik,[0,0,ON],DUZLEM.arka,[-560,560,-480,0],TAS,R,{sira:30,harc:[118,110,92],duzensiz:.08});
    // kemerin taşı: ışığa bakmayan iç kenar karanlık, cephe dibinde nem lekesi
    duzlemde(P,[0,0,ON],DUZLEM.arka,()=>{for(let i=0;i<10;i++) leke(-500+i*110+R()*40,-20,70+R()*50,26+R()*18,[30,32,26],.22);});
    c.restore();
    // kemer: kesme taş kemer taşları (yelpaze derzler), içe dönen kalınlık
    tabana();
    const kn=kemerNoktalari(0,K,K.seki), kd=kemerNoktalari(16,K,K.seki);
    c.save(); c.beginPath(); duzlemYol(P,[0,0,ON],DUZLEM.arka,kd); duzlemYol(P,[0,0,ON],DUZLEM.arka,kn.slice().reverse()); c.closePath(); c.fillStyle=rgba(golgele(TAS,aydinlik(isik,[0,250,ON],[0,0,-1])*1.06),1); c.fill('evenodd'); c.restore();
    for(let i=2;i<kn.length-2;i+=2){const a=kn[i], b=kd[i]; c.beginPath(); duzlemCizgi(P,[0,0,ON],DUZLEM.arka,[a,b]); c.strokeStyle='rgba(60,54,44,.6)'; c.lineWidth=1; c.stroke();}
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,kn,false),MUREKKEP,.8,1.4,2020,2,1.2);
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,kd,false),MUREKKEP,.45,1,2021,2,1.2);
    // kemer içi kalınlık (sağ yanda görünür, ışık almaz)
    cokgen3(P,[[K.x[1],K.seki,ON],[K.x[1],K.omuz,ON],[K.x[1],K.omuz,ON+30],[K.x[1],K.seki,ON+30]],golgele(TAS,.42));
    // eyvan sekisi önü ve basamak
    kutuDoku(P,isik,[K.x[0]-4,K.x[1]+4],[0,K.seki],[ON-2,ON+20],TAS2,2030,{doku:'tas',on:false});
    kutuDoku(P,isik,[K.x[0]+10,K.x[1]-10],[0,17],[ON-28,ON-2],TAS,2031,{doku:'tas',kenar:.5});
    { const q=[[K.x[0]-4,0,ON-2],[K.x[1]+4,0,ON-2],[K.x[1]+4,K.seki,ON-2],[K.x[0]-4,K.seki,ON-2]]; c.save(); c.beginPath(); yol3(P,q); c.clip(); tasOrgu(P,isik,[0,0,ON-2],DUZLEM.arka,[K.x[0]-4,K.x[1]+4,-K.seki,0],TAS2,R,{sira:17,harc:[80,74,60]}); c.restore(); hat3(P,q,MUREKKEP,.5,1.1,2032,2,1,true); kenarIsigi(P,[K.x[0]-4,K.seki,ON-2],[K.x[1]+4,K.seki,ON-2],R,{alfa:.5}); }
    // silme kuşağı ve üst kat pencereleri (kadraj üstten keser)
    kutuDoku(P,isik,[-600,600],[318,328],[ON-8,ON],TAS,2040,{doku:'tas',kenar:.5});
    for(const x of[-300,236]){
      const q=[[x-36,340,ON],[x+36,340,ON],[x+36,440,ON],[x-36,440,ON]]; cokgen3(P,q,[24,22,18]);
      tahtaYuzey(P,isik,[0,0,ON+6],DUZLEM.arka,[x-34,x-1,-440,-342],golgele(AHSAP,.9),R,{en:8,yon:'v'});
      tahtaYuzey(P,isik,[0,0,ON+6],DUZLEM.arka,[x+1,x+34,-440,-342],golgele(AHSAP,.8),R,{en:8,yon:'v'});
      kutuDoku(P,isik,[x-44,x+44],[330,340],[ON-12,ON],TAS,2050+x,{doku:'tas'});
    }
    // konak kapısı: çift kanat, demir çivili; taş söve ve kitabeli lento
    tahtaYuzey(P,isik,[0,0,ON+10],DUZLEM.arka,[D.x[0],D.x[1],-D.ust,0],golgele(AHSAP,1.05),R,{en:13,yon:'v'});
    cokgen3(P,[[D.x[0],0,ON],[D.x[0],D.ust,ON],[D.x[0],D.ust,ON+10],[D.x[0],0,ON+10]],golgele(TAS,.5));
    cokgen3(P,[[D.x[0],D.ust,ON],[D.x[1],D.ust,ON],[D.x[1],D.ust,ON+10],[D.x[0],D.ust,ON+10]],golgele(TAS,.3));
    hat3(P,[[(D.x[0]+D.x[1])/2,0,ON+10],[(D.x[0]+D.x[1])/2,D.ust,ON+10]],[10,8,6],.8,1.5,2060,1,.4);
    for(let y=16;y<D.ust;y+=26) for(let x=D.x[0]+9;x<D.x[1];x+=18){const s=P.n(x,y,ON+10); c.fillStyle='rgba(16,14,12,.85)'; c.beginPath(); c.arc(s[0],s[1],1.6,0,TAU); c.fill(); c.fillStyle='rgba(230,220,190,.3)'; c.fillRect(s[0]-1.2,s[1]-1.4,1,1);}
    for(const x of[(D.x[0]+D.x[1])/2-10,(D.x[0]+D.x[1])/2+10]){const s=P.n(x,100,ON+10); c.strokeStyle='rgb(20,18,16)'; c.lineWidth=1.6; c.beginPath(); c.arc(s[0],s[1]+5,4.5,0,TAU); c.stroke();} // tokmak halkaları
    kutuDoku(P,isik,[D.x[0]-14,D.x[1]+14],[D.ust,D.ust+26],[ON-6,ON],golgele(TAS,1.05),2061,{doku:'tas',kenar:.5});
    duzlemde(P,[(D.x[0]+D.x[1])/2,D.ust+13,ON-6],DUZLEM.arka,()=>{for(let i=0;i<2;i++){c.fillStyle='rgba(40,36,28,.45)'; c.fillRect(-36,-6+i*6,72,2);}}); // kitabe
    hat3(P,[[D.x[0],0,ON],[D.x[0],D.ust,ON],[D.x[1],D.ust,ON],[D.x[1],0,ON]],MUREKKEP,.7,1.3,2062,2,1);
    kutuDoku(P,isik,[D.x[0]-8,D.x[1]+8],[0,5],[ON-14,ON+10],TAS2,2063,{doku:'tas',kenar:.5}); // eşik taşı
    // avlu: taş döşeme; cephe dibinde gölge
    tasDoseme(P,isik,[-620,620],[200,ON],DOSEME,R,{boy:50,derz:[84,76,62]});
    { const a=P.n(-600,0,ON), b=P.n(600,0,ON); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=6; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
    // merdivenin yere düşen gölgesi (sağa ve geriye)
    { const tepe=[[MER.x0,0,MER.z[0]],[MER.x0+MER.en*MER.n,MER.n*MER.basamak,MER.z[0]],[MER.x0+MER.en*MER.n,0,MER.z[0]]].map(q=>golgeNoktasi(q)); cokgen3(P,[[MER.x0,0,MER.z[0]],tepe[1],[MER.x0+MER.en*MER.n+200,0,MER.z[0]]],[0,0,0],.22); }
    merdiven(P,R);
    kuyu(P,R);
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    karanlik([[1000,0,300,170,.3],[0,0,260,150,.25],[1000,740,260,150,.3],[0,740,200,120,.2]]);
  }
};
