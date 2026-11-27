// Cami avlusu: arkada kesme taş cephe ve sivri kemerli taç kapı (oymalı çift kanat, kitabe); sağda minarenin kare kaidesi ve
// yukarıda kadrajdan çıkan gövdesi; solda saçaklı abdest duvarı: pirinç musluklar, altında taş oluk, önünde taş oturaklar;
// kapının sağında cepheye dayalı uzun taş seki. Tek ışık: sağ önden, yüksekten güneş. Gölgeler sola ve geriye düşer.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {silindir,cokgen3,hat3,yol3,golgele,tabana,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,tasOrgu,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {kutuDoku,tahtaYuzey,tasDoseme,daire3,kenarIsigi,duzlemCizgi,tasYuzey} from './koy-odasi.js';

const TAS=[186,176,150], TAS2=[166,156,134], DOSEME=[160,152,132], AHSAP=[96,76,54], PIRINC=[176,150,96];
const ON=700, SOLD=-262;                                       // cephe yüzü, abdest duvarı
const KAPI={x:[-138,-6], tepe:300, omuz:212, derin:44, kanat:[-112,-32], kanatY:206};
const MIN={x:[206,326], z:[606,726], h:250, r:46};
const SEKI={x:[34,186], y:[0,44], z:[648,ON]};
const MUSLUK=[430,482,534,586,638];
const isik={konum:[1300,1150,-900], guc:1.1, menzil:5000, ortam:.34};
const GUNES=(()=>{const d=[-isik.konum[0],-isik.konum[1],-isik.konum[2]], l=Math.hypot(...d); return d.map(v=>v/l);})();
const golgeNoktasi=(q,Y=0)=>{const t=(q[1]-Y)/-GUNES[1]; return [q[0]+GUNES[0]*t,Y,q[2]+GUNES[2]*t];};

function kemer(pay=0,k=KAPI){
  const x0=k.x[0]-pay, x1=k.x[1]+pay, w=(x1-x0)/2, m=(x0+x1)/2, n=[[x0,0],[x0,-k.omuz]];
  const q=(a,b,cc,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*cc[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*cc[1]];
  for(let i=1;i<=12;i++) n.push(q([x0,-k.omuz],[x0+w*.1,-k.tepe+16],[m,-k.tepe-pay],i/12));
  for(let i=1;i<=12;i++) n.push(q([m,-k.tepe-pay],[x1-w*.1,-k.tepe+16],[x1,-k.omuz],i/12));
  n.push([x1,0]); return n;
}

// taç kapı: derin sivri kemerli niş, içinde göbekli oymalı çift kanat, üstte kitabe
function tacKapi(P,R){
  const K=KAPI, ic=[0,0,ON+K.derin];
  tasOrgu(P,{...isik,ortam:.24,guc:.6},ic,DUZLEM.arka,[K.x[0],K.x[1],-K.tepe,0],TAS2,R,{sira:22,harc:[80,74,60]});
  // nişin iç yan yüzü (sol yan; ışık sağdan, bu yüz aydınlık)
  cokgen3(P,[[K.x[0],0,ON],[K.x[0],K.omuz,ON],[K.x[0],K.omuz,ON+K.derin],[K.x[0],0,ON+K.derin]],golgele(TAS2,.85));
  duzlemde(P,[K.x[0],0,ON],DUZLEM.sol,()=>{leke(30,-100,26,90,[0,0,0],.2);});
  // kanatlar
  const [kx0,kx1]=K.kanat, km=(kx0+kx1)/2;
  for(const [i,xx] of [[kx0,km],[km,kx1]].entries()){
    tahtaYuzey(P,{...isik,ortam:.3},ic,DUZLEM.arka,[xx[0]+.5,xx[1]-.5,-K.kanatY,0],golgele(AHSAP,1.05),R,{en:10,yon:'v'});
    for(const [y0,y1] of[[14,74],[86,150],[162,196]]){ // göbekli tablalar
      const q=[[xx[0]+6,y0,ON+K.derin],[xx[1]-6,y0,ON+K.derin],[xx[1]-6,y1,ON+K.derin],[xx[0]+6,y1,ON+K.derin]];
      hat3(P,q,[14,10,8],.7,1.1,3000+i*10+y0,1,.5,true);
      const q2=q.map(([x,y,z],k)=>[x+(k===0||k===3?3:-3),y+(k<2?3:-3),z]);
      hat3(P,[q2[3],q2[0],q2[1]],[200,180,140],.28,.8,3005+i*10+y0,1,.4);
      const m=P.n((xx[0]+xx[1])/2,(y0+y1)/2,ON+K.derin), o=P.olcek(0,y0,ON+K.derin);
      c.strokeStyle='rgba(14,10,8,.55)'; c.lineWidth=.9; c.beginPath(); c.moveTo(m[0],m[1]-(y1-y0)*o*.3); c.lineTo(m[0]+8*o,m[1]); c.lineTo(m[0],m[1]+(y1-y0)*o*.3); c.lineTo(m[0]-8*o,m[1]); c.closePath(); c.stroke();
    }
    const h=P.n(i?xx[0]+6:xx[1]-6,100,ON+K.derin), o=P.olcek(0,100,ON+K.derin); c.strokeStyle='rgb(24,20,16)'; c.lineWidth=1.6; c.beginPath(); c.arc(h[0],h[1]+4*o,4*o,0,TAU); c.stroke();
  }
  hat3(P,[[km,0,ON+K.derin],[km,K.kanatY,ON+K.derin]],[8,6,4],.8,1.5,3030,1,.3);
  // kanat çevresi taş söve, üstte kitabe (yazı okunmaz: kıvrık hatlar)
  kutuDoku(P,isik,[kx0-8,kx1+8],[K.kanatY,K.kanatY+12],[ON+K.derin-6,ON+K.derin],TAS,3031,{doku:'tas',kenar:.5});
  const kit=[[kx0-4,K.kanatY+16,ON+K.derin],[kx1+4,K.kanatY+16,ON+K.derin],[kx1+4,K.kanatY+56,ON+K.derin],[kx0-4,K.kanatY+56,ON+K.derin]];
  cokgen3(P,kit,golgele(TAS,.7)); hat3(P,kit,MUREKKEP,.6,1,3032,1,.5,true);
  for(let s=0;s<3;s++){const y=K.kanatY+26+s*11; titrek(()=>{const pts=[]; for(let x=kx0+4;x<kx1-4;x+=3) pts.push(P.n(x,y+Math.sin(x*1.3+s)*2+(R()-.5)*2,ON+K.derin)); pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));},[30,26,20],.55,1,3040+s,1,.4);}
  // eşik ve iki basamak
  kutuDoku(P,isik,[K.x[0]+2,K.x[1]-2],[0,12],[ON,ON+K.derin],TAS,3050,{doku:'tas',on:false,kenar:.4});
  kutuDoku(P,isik,[K.x[0]-12,K.x[1]+12],[0,13],[ON-34,ON],TAS,3051,{doku:'tas',kenar:.55});
}

// minare: kare kaide (kesme taş, küçük kapı), pabuç, silindir gövde (kadrajdan çıkar)
function minare(P,R){
  const M=MIN, [x0,x1]=M.x, [z0,z1]=M.z, cx=(x0+x1)/2, cz=(z0+z1)/2;
  // yerdeki gölgesi (sola, geriye)
  const g=[[x0,M.h,z0],[x1,M.h,z0],[x0,M.h,z1]].map(q=>golgeNoktasi(q));
  cokgen3(P,[[x0,0,z0],[x1,0,z0],g[1],g[0],g[2],[x0,0,z1]],[0,0,0],.3);
  // gövde (önce, kaidenin arkasında yükselir)
  silindir(P,isik,cx,cz,M.r,M.h+30,900,TAS,3100,{dilim:16});
  for(let y=M.h+60;y<900;y+=34){const h=daire3(cx,y,cz,M.r+.3,M.r+.3,16).filter(q=>P.derinlik(...q)<P.derinlik(cx,y,cz)).sort((a,b)=>P.n(...a)[0]-P.n(...b)[0]); hat3(P,h,[80,74,60],.5,1,3110+y,1,.4);}
  // pabuç: kaideden gövdeye geçen kesik piramit
  const ust=[[x0,M.h,z0],[x1,M.h,z0],[x1,M.h,z1],[x0,M.h,z1]], pb=[[cx-M.r,M.h+30,cz-M.r],[cx+M.r,M.h+30,cz-M.r],[cx+M.r,M.h+30,cz+M.r],[cx-M.r,M.h+30,cz+M.r]];
  for(const [a,b] of [[0,1],[3,0]]){const q=[ust[a],ust[b],pb[b],pb[a]]; const m=q.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4,s[2]+p[2]/4],[0,0,0]); cokgen3(P,q,golgele(TAS,aydinlik(isik,m,a===0?[0,.6,-.8]:[-.8,.6,0]))); hat3(P,q,MUREKKEP,.5,1,3120+a,1,.6,true);}
  // kaide: makineye bakan ve sol yüz, kesme taş
  tasOrgu(P,isik,[0,0,z0],DUZLEM.arka,[x0,x1,-M.h,0],TAS,R,{sira:32,harc:[120,112,96],duzensiz:.05});
  if(x0>0){c.save(); c.beginPath(); yol3(P,[[x0,0,z0],[x0,0,z1],[x0,M.h,z1],[x0,M.h,z0]]); c.clip(); tasOrgu(P,isik,[x0,0,0],DUZLEM.sag,[-z1,-z0,-M.h,0],TAS2,R,{sira:32,harc:[100,94,80],duzensiz:.05}); c.restore();}
  hat3(P,[[x0,0,z1],[x0,0,z0],[x0,M.h,z0],[x0,M.h,z1]],MUREKKEP,.6,1.2,3130,2,1); hat3(P,[[x0,M.h,z0],[x1,M.h,z0]],MUREKKEP,.6,1.2,3131,2,1);
  kutuDoku(P,isik,[x0-4,x1+4],[M.h-10,M.h],[z0-4,z1],TAS,3132,{doku:'tas',kenar:.5}); // silme
  // minare kapısı
  const kp=[[cx-15,0,z0],[cx-15,140,z0],[cx,156,z0],[cx+15,140,z0],[cx+15,0,z0]];
  cokgen3(P,kp,[38,30,22]); tahtaYuzey(P,{...isik,ortam:.25},[0,0,z0+.5],DUZLEM.arka,[cx-14,cx+14,-140,0],golgele(AHSAP,.7),R,{en:7,yon:'v'}); hat3(P,kp,MUREKKEP,.7,1.2,3133,2,1,true);
}

// abdest duvarı: sol yanda, yüzü sağa; saçak, musluklar, oluk, oturak taşları
function abdest(P,R){
  const z0=380, z1=ON, X=SOLD;
  tasOrgu(P,isik,[X,0,0],DUZLEM.sol,[z0,z1,-230,0],TAS2,R,{sira:26,harc:[110,104,88],duzensiz:.12});
  // ıslak duvar dibi
  duzlemde(P,[X,0,0],DUZLEM.sol,()=>{for(const z of MUSLUK) leke(z,-30,14,40,[20,22,18],.4);});
  // oluk: taş kanal, içinde su
  kutuDoku(P,isik,[X,X+34],[0,20],[z0,z1],TAS,3200,{doku:'tas',kenar:.5});
  const su=[[X+6,17,z0+4],[X+28,17,z0+4],[X+28,17,z1-2],[X+6,17,z1-2]]; cokgen3(P,su,[40,44,40]);
  c.save(); c.beginPath(); yol3(P,su); c.clip(); for(const z of MUSLUK){const s=P.n(X+16,17,z), o=P.olcek(X,17,z); leke(s[0],s[1],8*o,3*o,[230,230,220],.5);} c.restore();
  // musluklar: duvardan çıkan pirinç boru, aşağı kıvrık ağız, kelebek kol
  for(const [i,z] of MUSLUK.entries()){
    const y=74, b=[X,y,z], u=[X+11,y,z], a=[X+12,y-6,z];
    hat3(P,[b,u],golgele(PIRINC,.55),1,4*P.olcek(...u)/2,3210+i,1,.2); hat3(P,[u,a],golgele(PIRINC,.5),1,3.4*P.olcek(...u)/2,3220+i,1,.2);
    hat3(P,[[X+4,y+1,z],[X+11,y+1,z]],[240,220,170],.5,1,3230+i,1,.2); // pirinç parıltısı
    hat3(P,[[X+7,y+2,z-5],[X+7,y+5,z+5]],golgele(PIRINC,.6),1,2*P.olcek(...u)/2,3240+i,1,.2);
    duzlemde(P,[X,0,0],DUZLEM.sol,()=>{c.fillStyle='rgba(20,18,14,.8)'; c.beginPath(); c.ellipse(z,-y,4,4,0,0,TAU); c.fill();}); // duvardaki göbek
    hat3(P,[a,[X+12,18,z]],[220,224,214],.35,1,3250+i,1,.2); // damlayan su
    // oturak taşı
    kutuDoku(P,isik,[X+52,X+82],[0,30],[z-15,z+15],TAS2,3260+i,{doku:'tas',kenar:.5});
  }
  // saçak: ahşap kiriş ve tahta altlık (makine aşağıdan görür)
  kutuDoku(P,isik,[X,X+62],[214,222],[z0,z1],golgele(AHSAP,.9),3290,{doku:'tahta',en:12,yonUst:'v'});
  for(let z=z0+20;z<z1;z+=90){hat3(P,[[X,180,z],[X+50,214,z]],golgele(AHSAP,.7),1,4,3295+z,1,.3);} // payandalar
  hat3(P,[[X,0,z0],[X,230,z0]],MUREKKEP,.5,1.2,3299,2,1);
}

export default {
  id:'cami',
  kamera:{odak:820, yukseklik:155, egim:.14},
  isik,
  yuvalar:{
    'zemin-on':    {duzlem:'zemin', konum:[34,0,286], yuzey:'tas', alan:18},
    'zemin-orta':  {duzlem:'zemin', konum:[92,0,560], yuzey:'tas', alan:10},
    'zemin-kose':  {duzlem:'zemin', konum:[236,0,500], yuzey:'tas', alan:8},
    'esik':        {duzlem:'zemin', konum:[-72,13,ON-18], yuzey:'tas', alan:6},
    'duvar':       {duzlem:'arka', konum:[-196,150,ON], yuzey:'tas', alan:4, uygunsuz:['saat']},
    'seki-ustu':   {duzlem:'ust', konum:[104,SEKI.y[1],668], yuzey:'tas', alan:6},
    'musluk-onu':  {duzlem:'zemin', konum:[-196,0,520], yuzey:'camur', alan:6},
    'beden':       {duzlem:'zemin', konum:[-14,0,420], aci:-.14, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(9157), K=KAPI;
    c.fillStyle='#1b1a15'; c.fillRect(0,0,1000,750);
    tacKapi(P,R);
    // cephe: kesme taş, kapı nişi kesilerek
    c.save(); tabana(); c.beginPath(); c.rect(0,0,1000,750); duzlemYol(P,[0,0,ON],DUZLEM.arka,kemer()); c.clip('evenodd');
    tasOrgu(P,isik,[0,0,ON],DUZLEM.arka,[-600,600,-520,0],TAS,R,{sira:30,harc:[124,116,98],duzensiz:.06});
    duzlemde(P,[0,0,ON],DUZLEM.arka,()=>{for(let i=0;i<10;i++) leke(-560+i*120+R()*40,-14,70+R()*50,22,[34,36,30],.2);});
    c.restore();
    // kemer taşları: açık-koyu almaşık (ablak), çerçeve silmesi
    tabana();
    const kn=kemer(0), kd=kemer(18);
    for(let i=2;i<kn.length-3;i+=2){const q=[kn[i],kn[i+2],kd[i+2],kd[i]]; c.beginPath(); duzlemCizgi(P,[0,0,ON],DUZLEM.arka,q); c.closePath(); c.fillStyle=rgba(golgele(i%4?TAS:[120,112,96],aydinlik(isik,[0,250,ON],[0,0,-1])),1); c.fill(); c.strokeStyle='rgba(60,54,44,.6)'; c.lineWidth=.8; c.stroke();}
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,kn,false),MUREKKEP,.8,1.4,3301,2,1.2);
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,kd,false),MUREKKEP,.5,1,3302,2,1.2);
    const cer=[[K.x[0]-34,0],[K.x[0]-34,-K.tepe-44],[K.x[1]+34,-K.tepe-44],[K.x[1]+34,0]];
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,cer,false),MUREKKEP,.55,1.2,3303,2,1);
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,cer.map(([x,y])=>[x+(x<0?6:-6)*(x<K.x[0]?1:-1),y+(y<0?6:0)]),false),MUREKKEP,.35,1,3304,2,1);
    // cephe pencereleri: demir parmaklıklı, içi karanlık, üstte sivri alınlık
    for(const x of[-236,110]){
      const q=[[x-30,112,ON],[x+30,112,ON],[x+30,212,ON],[x-30,212,ON]]; cokgen3(P,q,[22,22,20]);
      for(let i=1;i<5;i++) hat3(P,[[x-30+i*12,112,ON+4],[x-30+i*12,212,ON+4]],[46,44,40],1,1.8,3310+x+i,1,.2);
      for(const y of[145,180]) hat3(P,[[x-30,y,ON+4],[x+30,y,ON+4]],[46,44,40],1,1.6,3320+x+y,1,.2);
      kutuDoku(P,isik,[x-36,x+36],[104,112],[ON-8,ON],TAS,3330+x,{doku:'tas',kenar:.5}); hat3(P,q,MUREKKEP,.6,1.1,3340+x,2,1,true);
      const al=[[x-30,224],[x,-0],[x+30,224]].map(([a,b])=>[a,-(b||262)]); titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,al,false),MUREKKEP,.5,1.1,3350+x,2,1);
    }
    // avlu
    tasDoseme(P,isik,[-620,620],[200,ON],DOSEME,R,{boy:48,derz:[92,84,68]});
    { const a=P.n(-600,0,ON), b=P.n(600,0,ON); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=5; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
    // musluk önü ıslak taş
    duzlemde(P,[-190,0,540],DUZLEM.zemin,()=>{leke(0,0,70,150,[10,12,10],.35); leke(-10,-30,30,60,[200,204,196],.12);});
    abdest(P,R);
    // taş seki: cepheye dayalı, üstü aşınmış
    kutuDoku(P,isik,SEKI.x,SEKI.y,SEKI.z,TAS,3400,{doku:'tas',kenar:.55});
    { const q=[[SEKI.x[0],0,SEKI.z[0]],[SEKI.x[1],0,SEKI.z[0]],[SEKI.x[1],SEKI.y[1],SEKI.z[0]],[SEKI.x[0],SEKI.y[1],SEKI.z[0]]]; c.save(); c.beginPath(); yol3(P,q); c.clip(); tasOrgu(P,isik,[0,0,SEKI.z[0]],DUZLEM.arka,[SEKI.x[0],SEKI.x[1],-SEKI.y[1],0],TAS2,R,{sira:22,harc:[100,94,80]}); c.restore(); hat3(P,q,MUREKKEP,.5,1.1,3401,2,1,true); }
    tasYuzey(P,isik,[0,SEKI.y[1],0],DUZLEM.ust,[SEKI.x[0],SEKI.x[1],-SEKI.z[1],-SEKI.z[0]],golgele(TAS,1.02),R,{adim:20});
    kenarIsigi(P,[SEKI.x[0],SEKI.y[1],SEKI.z[0]],[SEKI.x[1],SEKI.y[1],SEKI.z[0]],R,{alfa:.5});
    minare(P,R);
    // sağ önde çınar gövdesi (kadrajın sağını ve üstünü keser), kabuk lekeli; gölgesi yere
    { const X=330, Z=290; cokgen3(P,[[X-40,0,Z],[X+30,0,Z-20],golgeNoktasi([X+30,700,Z-20]),golgeNoktasi([X-40,700,Z])],[0,0,0],.25);
      silindir(P,{...isik,ortam:.3},X,Z,38,0,900,[110,104,90],3500,{dilim:20});
      const s0=P.n(X-38,0,Z), s1=P.n(X+38,600,Z); c.save(); c.beginPath(); c.rect(s0[0]-30,0,s1[0]-s0[0]+60,s0[1]+10); c.clip();
      for(let i=0;i<40;i++){const y=R()*500, a=-1.2+R()*2, q=P.n(X+Math.sin(a)*38,y,Z-Math.cos(a)*38), o=P.olcek(X,y,Z); leke(q[0],q[1],(8+R()*14)*o,(5+R()*12)*o,R()<.5?[200,196,176]:[30,28,24],.35);}
      c.restore();
      for(let i=0;i<5;i++) hat3(P,[[X-38+i*3,0,Z-10],[X-36+i*3,700,Z-10]],MUREKKEP,.25,1,3510+i,1,.6); }
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    karanlik([[0,0,260,160,.25],[1000,740,240,150,.3],[0,740,240,140,.25]]);
  }
};
