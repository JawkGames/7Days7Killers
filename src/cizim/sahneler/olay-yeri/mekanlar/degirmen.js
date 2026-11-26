// Su değirmeninin içi: taş seki üstünde değirmen taşı, asılı karlık, un oluğu ve tekne, sağda un çuvalları.
// Tek ışık: arka duvardaki açık kapı (dışarısı aşırı pozlanmış). Işık arkadan gelir, gölgeler makineye doğru düşer.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,silindir,cokgen3,hat3,yol3,aydinlik,golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,tasOrgu,zemin,aydinlikBosluk,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';

const TAS=[112,106,92], TOPRAK=[98,90,74], AHSAP=[90,76,58], UN=[196,192,176], CUVAL=[120,112,94];
const ARKA=520, SOL=-300, SAG=300;
const KAPI={x0:108, x1:194, ust:182};
const isik={konum:[151,115,488], guc:1.2, menzil:260, ortam:.2};
const SEKI={x:[-250,-40],y:[0,50],z:[370,510]}, TAS_={x:-146,z:440,r:54}, TEKNE={x:[-232,-136],y:[0,36],z:[296,352]};

function cuval(P,X,Z,boy,en,egim,r,t){
  const s=P.n(X,0,Z), o=P.olcek(X,0,Z), L=P.n(...isik.konum), yan=Math.sign(L[0]-s[0])||1;
  // gövde profili: tabanda yayvan, omuzda daralır, ağzı büzülüp bağlanmış; her noktada küçük yumru
  const pr=[[1,0],[1.08,-.22],[1.04,-.45],[.92,-.66],[.7,-.8],[.36,-.9],[.2,-.93]].map(([w,y])=>[w*en*.5*(.94+r()*.1),y*boy]);
  const sagY=pr.map(([x,y])=>[x,y]), solY=pr.slice().reverse().map(([x,y])=>[-x*(.95+r()*.08),y]);
  const tepe=[[en*.1,-boy*.97],[en*.16,-boy*1.06],[en*.04,-boy*1.0],[-en*.06,-boy*1.07],[-en*.12,-boy*.97]];
  const n=[...sagY,...tepe,...solY];
  const yol=()=>{c.moveTo(n[0][0],n[0][1]); for(let i=1;i<n.length;i++){const q=n[i], p=n[i-1]; c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);} c.lineTo(n[n.length-1][0],n[n.length-1][1]); c.quadraticCurveTo(0,3,n[0][0],n[0][1]); c.closePath();};
  c.save(); c.translate(s[0],s[1]); c.scale(o,o); c.rotate(egim);
  leke(-yan*en*.25,-1,en*.85,7,[0,0,0],.8);
  c.beginPath(); yol(); c.fillStyle=rgba(golgele(CUVAL,.4),1); c.fill();
  c.save(); c.clip();
  leke(yan*en*.3,-boy*.5,en*.4,boy*.55,golgele(CUVAL,1.05),.6);
  leke(yan*en*.5,-boy*.5,en*.1,boy*.45,golgele(UN,1),.4); // kenar ışığı
  leke(-yan*en*.35,-boy*.4,en*.45,boy*.7,[0,0,0],.55);
  leke(0,-boy*.08,en*.6,boy*.12,[0,0,0],.4);
  tara(-en,-boy*1.1,en,4,1.52,2.2,[10,9,8],.28,t,.6); tara(-en,-boy*1.1,en,4,.04,2.4,[10,9,8],.2,t+1,.6);
  // kıvrımlar: büzülmüş ağızdan aşağı inen
  for(let i=0;i<5;i++){const x=(i-2)*en*.09; titrek(()=>{c.moveTo(x*.4,-boy*.9); c.quadraticCurveTo(x*1.6,-boy*.75,x*2.6+(r()-.5)*4,-boy*(.5+r()*.15));},[10,9,8],.45,1/o,t+10+i,1,.5/o);}
  leke(-yan*en*.1,-boy*.25,en*.25,boy*.12,golgele(UN,.7),.18); // bulaşmış un
  c.restore();
  titrek(yol,MUREKKEP,.8,1.3/o,t+2,2,1.2/o);
  titrek(()=>{c.moveTo(-en*.13,-boy*.93); c.quadraticCurveTo(0,-boy*.89,en*.13,-boy*.93);},MUREKKEP,.8,1.8/o,t+3,2,1/o); // bağ
  c.restore();
}

export default {
  id:'degirmen',
  kamera:{odak:880, yukseklik:150, egim:.27},
  isik,
  yuvalar:{
    'zemin-on':  {duzlem:'zemin', konum:[-40,0,218], yuzey:'toprak', alan:22},
    'zemin-orta':{duzlem:'zemin', konum:[-178,0,262], yuzey:'un', alan:10},
    'zemin-kose':{duzlem:'zemin', konum:[172,0,286], yuzey:'toprak', alan:10},
    'esik':      {duzlem:'zemin', konum:[151,6,532], yuzey:'tas', alan:6},
    'duvar':     {duzlem:'arka', konum:[34,138,ARKA], yuzey:'tas', alan:8},
    'masa-ustu': {duzlem:'ust', konum:[-66,SEKI.y[1],394], yuzey:'tas', alan:5},
    'beden':     {duzlem:'zemin', konum:[10,0,330], aci:.25, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(4411), K=KAPI, S=SEKI, T=TAS_, tk=TEKNE;
    c.fillStyle='#0b0c0a'; c.fillRect(0,0,1000,750);
    // arka duvar, kapı boşluğu kesilerek; yan duvarlar
    c.save(); c.beginPath(); c.rect(0,0,1000,750); yol3(P,[[K.x0,0,ARKA],[K.x0,K.ust,ARKA],[K.x1,K.ust,ARKA],[K.x1,0,ARKA]]); c.clip('evenodd');
    tasOrgu(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-330,0],TAS,R,{sira:24});
    c.restore();
    tasOrgu(P,isik,[SOL,0,0],DUZLEM.sol,[100,ARKA,-330,0],TAS,R,{sira:24});
    tasOrgu(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-100,-330,0],TAS,R,{sira:24});
    // tavan kirişlerinin duvara oturan uçları (kare dışına taşar)
    for(const x of[-200,-40,120,260]) kutu(P,isik,[x-9,x+9],[214,240],[ARKA-30,ARKA],AHSAP,300+x,{ust:false});
    // kapı: dışarısı bembeyaz; sağ söve içten görünür; üstte ağaç lento; eşik taşı
    aydinlikBosluk(P,[[K.x0,0,ARKA+60],[K.x0,K.ust,ARKA+60],[K.x1,K.ust,ARKA+60],[K.x1,0,ARKA+60]],R);
    cokgen3(P,[[K.x1,0,ARKA],[K.x1,K.ust,ARKA],[K.x1,K.ust,ARKA+60],[K.x1,0,ARKA+60]],[142,136,116]);
    duzlemde(P,[K.x1,0,ARKA],DUZLEM.sol,()=>{tara(0,-K.ust,60,0,1.2,5,MUREKKEP,.25,42,.8); leke(10,-K.ust*.5,14,K.ust*.5,[0,0,0],.3);});
    cokgen3(P,[[K.x0,K.ust,ARKA],[K.x1,K.ust,ARKA],[K.x1,K.ust,ARKA+60],[K.x0,K.ust,ARKA+60]],[30,24,18]);
    kutu(P,isik,[K.x0-14,K.x1+14],[K.ust,K.ust+16],[ARKA-4,ARKA+2],AHSAP,43,{ust:false});
    kutu(P,{...isik,ortam:.45},[K.x0-4,K.x1+4],[0,6],[ARKA-12,ARKA+60],TAS,40,{cizgi:.4});
    hat3(P,[[K.x0,6,ARKA],[K.x0,K.ust,ARKA],[K.x1,K.ust,ARKA],[K.x1,6,ARKA]],MUREKKEP,.6,1.6,41,2,1.4);
    // zemin
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:50});
    // kapıdan içeri düşen ışık (eşikten makineye doğru açılır)
    c.save(); c.globalCompositeOperation='lighter';
    c.beginPath(); yol3(P,[[K.x0+4,0,ARKA-4],[K.x1-2,0,ARKA-4],[K.x1+70,0,280],[K.x0-90,0,280]]); c.clip();
    let a=P.n(151,0,ARKA), b=P.n(151,0,280), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(120,116,96,.6)'); g.addColorStop(1,'rgba(120,116,96,0)'); c.fillStyle=g; c.fillRect(0,0,1000,750);
    c.restore();
    // duvar dibi karanlığı
    for(const q of[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]]){
      const s0=P.n(q[0],0,q[1]), s1=P.n(q[2],0,q[3]);
      c.strokeStyle='rgba(0,0,0,.55)'; c.lineWidth=7; c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();
    }
    // un tozu: teknenin önü ve sekinin çevresi bembeyaz değil ama belirgin unlu
    duzlemde(P,[-180,0,300],DUZLEM.zemin,()=>{
      leke(0,10,110,70,UN,.34); leke(10,40,60,36,UN,.28); leke(40,-60,90,40,UN,.2);
      for(let i=0;i<40;i++) leke((R()-.5)*220,(R()-.5)*150,6+R()*22,3+R()*9,UN,.05+R()*.1,R()*3);
      tara(-120,-90,120,90,.3,3,UN,.1,77,.7);
    });
    // duvarda asılı elek
    duzlemde(P,[-236,148,ARKA],DUZLEM.arka,()=>{
      leke(4,6,26,26,[0,0,0],.5);
      c.beginPath(); c.arc(0,0,23,0,TAU); c.arc(0,0,20,0,TAU,true); c.fillStyle=rgba(golgele(AHSAP,.6),1); c.fill();
      c.save(); c.beginPath(); c.arc(0,0,20,0,TAU); c.clip(); c.fillStyle='rgba(20,18,14,.85)'; c.fillRect(-20,-20,40,40); tara(-20,-20,20,20,.8,1.6,[110,106,90],.3,61,.4); tara(-20,-20,20,20,-.8,1.6,[110,106,90],.3,62,.4); c.restore();
      titrek(()=>{c.arc(0,0,23,0,TAU);},MUREKKEP,.7,.8,63,2,.6);
    });
    // değirmen taşının sekisi (taş örgü), üstü unlu
    kutu(P,isik,S.x,S.y,S.z,TAS,70,{cizgi:.5});
    tasOrgu(P,{...isik,ortam:.24},[0,0,S.z[0]],DUZLEM.arka,[S.x[0],S.x[1],-S.y[1],0],TAS,R,{sira:16});
    tasOrgu(P,{...isik,ortam:.3},[S.x[1],0,0],DUZLEM.sag,[-S.z[1],-S.z[0],-S.y[1],0],TAS,R,{sira:16});
    cokgen3(P,[[S.x[0],S.y[1],S.z[0]],[S.x[1],S.y[1],S.z[0]],[S.x[1],S.y[1],S.z[1]],[S.x[0],S.y[1],S.z[1]]],golgele(UN,.42));
    duzlemde(P,[0,S.y[1],S.z[0]],DUZLEM.ust,()=>{for(let i=0;i<14;i++) leke(S.x[0]+R()*(S.x[1]-S.x[0]),-R()*140,10+R()*20,6+R()*10,R()<.5?UN:[0,0,0],.1+R()*.12);});
    hat3(P,[[S.x[0],S.y[1],S.z[0]],[S.x[1],S.y[1],S.z[0]],[S.x[1],S.y[1],S.z[1]]],MUREKKEP,.6,1.3,71,2,1.2);
    // karlığı taşıyan direkler (kare dışına uzanır) ve kiriş
    kutu(P,isik,[T.x-66,T.x-54],[S.y[1],360],[T.z-6,T.z+6],AHSAP,80,{ust:false});
    kutu(P,isik,[T.x+54,T.x+66],[S.y[1],360],[T.z-6,T.z+6],AHSAP,81,{ust:false});
    kutu(P,isik,[T.x-66,T.x+66],[150,162],[T.z-6,T.z+6],AHSAP,82);
    // üst değirmen taşı: tahta kasnak içinde; oluklu yüz, ortada göz
    silindir(P,isik,T.x,T.z,T.r+6,S.y[1],S.y[1]+8,golgele(AHSAP,.8),90,{cizgi:.4});
    silindir(P,isik,T.x,T.z,T.r,S.y[1]+8,S.y[1]+28,TAS,91,{ustRenk:[150,146,132]});
    duzlemde(P,[T.x,S.y[1]+28,T.z],DUZLEM.ust,()=>{
      leke(0,0,T.r*.9,T.r*.9,UN,.28);
      for(let i=0;i<16;i++){const a=i/16*TAU; c.strokeStyle='rgba(20,20,16,.35)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(Math.cos(a)*12,Math.sin(a)*12); c.lineTo(Math.cos(a+.25)*T.r*.95,Math.sin(a+.25)*T.r*.95); c.stroke();}
      c.fillStyle='rgba(4,4,4,.9)'; c.beginPath(); c.arc(0,0,10,0,TAU); c.fill();
      c.fillStyle='rgba(40,40,38,1)'; c.fillRect(-11,-2,22,4);
    });
    // karlık: ters kesik piramit, tahta; taşın gözüne inen çakçak
    const ky=[174,108], kT=[[T.x-44,ky[0],T.z-44],[T.x+44,ky[0],T.z-44],[T.x+44,ky[0],T.z+44],[T.x-44,ky[0],T.z+44]], kA=[[T.x-8,ky[1],T.z-8],[T.x+8,ky[1],T.z-8],[T.x+8,ky[1],T.z+8],[T.x-8,ky[1],T.z+8]];
    const on=[kT[0],kT[1],kA[1],kA[0]], sag=[kT[1],kT[2],kA[2],kA[1]];
    hat3(P,[[T.x,ky[1],T.z],[T.x+2,S.y[1]+30,T.z-4]],[60,56,48],.9,3,112,1,.4);
    cokgen3(P,sag,golgele(AHSAP,aydinlik({...isik,ortam:.34},[T.x+26,140,T.z],[.7,-.6,0])));
    cokgen3(P,on,golgele(AHSAP,aydinlik({...isik,ortam:.28},[T.x,140,T.z-26],[0,-.45,-.9])));
    c.save(); c.beginPath(); yol3(P,on); yol3(P,sag); c.clip(); const km=P.n(T.x,140,T.z-20); tara(km[0]-120,km[1]-160,km[0]+120,km[1]+120,1.5,5,MUREKKEP,.35,113,.8); leke(km[0]+30,km[1]-30,50,40,UN,.14); c.restore();
    for(let i=1;i<4;i++){const f=i/4, l=(A,B)=>A.map((v,j)=>v+(B[j]-v)*f); hat3(P,[l(kT[0],kA[0]),l(kT[1],kA[1]),l(kT[2],kA[2])],MUREKKEP,.4,1,100+i,1,.8);}
    hat3(P,on,MUREKKEP,.75,1.3,110,2,1.2,true); hat3(P,sag,MUREKKEP,.6,1.2,111,2,1.2,true);
    // un oluğu ve tekne
    const olukU=[[T.x-6,S.y[1]+12,S.z[0]+16],[T.x+6,S.y[1]+12,S.z[0]+16],[T.x+6,tk.y[1]+4,tk.z[1]-6],[T.x-6,tk.y[1]+4,tk.z[1]-6]];
    kutu(P,{...isik,ortam:.28},tk.x,tk.y,tk.z,AHSAP,130);
    for(let i=1;i<3;i++){const y=i*12; hat3(P,[[tk.x[0],y,tk.z[0]],[tk.x[1],y,tk.z[0]],[tk.x[1],y,tk.z[1]]],MUREKKEP,.5,1,132+i,2,1);}
    duzlemde(P,[0,0,tk.z[0]],DUZLEM.arka,()=>{tara(tk.x[0],-36,tk.x[1],0,.02,2.4,MUREKKEP,.25,135,.7); leke(tk.x[0]+20,-30,40,10,UN,.2);});
    const ic=[[tk.x[0]+5,33,tk.z[0]+5],[tk.x[1]-5,33,tk.z[0]+5],[tk.x[1]-5,33,tk.z[1]-5],[tk.x[0]+5,33,tk.z[1]-5]];
    cokgen3(P,ic,golgele(UN,.55));
    c.save(); c.beginPath(); yol3(P,ic); c.clip(); const tm=P.n((tk.x[0]+tk.x[1])/2,34,tk.z[1]-12); leke(tm[0],tm[1],60,18,UN,.45); leke(tm[0],tm[1]+8,70,14,[0,0,0],.2); c.restore();
    hat3(P,ic,MUREKKEP,.5,1,131,2,1,true);
    cokgen3(P,olukU,golgele(AHSAP,.45)); hat3(P,olukU,MUREKKEP,.7,1.2,120,2,1,true);
    // un çuvalları (sağda, çerçeve kenarı keser)
    const cv=[[228,486,78,60,-.03],[292,470,84,62,.05],[196,446,66,56,-.07],[262,404,72,64,.06]];
    for(const [i,q] of cv.entries()) cuval(P,q[0],q[1],q[2],q[3],q[4],R,140+i*7);
  },
  ustCiz(P,r){
    const K=KAPI;
    atmosfer(r);
    // kapıdan giren ışık huzmesi: havada asılı un tozu
    c.save(); c.globalCompositeOperation='screen';
    c.beginPath(); yol3(P,[[K.x0,K.ust,ARKA],[K.x1,K.ust,ARKA],[K.x1+70,0,280],[K.x0-90,0,280]]); c.clip();
    const a=P.n(151,K.ust,ARKA), b=P.n(110,0,280), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(120,118,100,.18)'); g.addColorStop(1,'rgba(120,118,100,0)'); c.fillStyle=g; c.fillRect(0,0,1000,750);
    for(let i=0;i<160;i++){c.fillStyle=`rgba(220,216,196,${.05+r()*.14})`; c.fillRect(480+r()*420,60+r()*560,.9,.9);}
    c.restore();
    karanlik([[0,700,260,200,.55],[1000,700,260,240,.55],[0,80,220,260,.5],[1000,40,260,200,.35]]);
  }
};
