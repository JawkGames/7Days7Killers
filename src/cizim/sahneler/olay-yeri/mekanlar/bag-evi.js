// Bağ evi: bağın ortasında tek göz taş kulübe (toprak dam, karanlık kapı), önüne çatılmış ağaç direkli asma çardağı;
// çardağın altında kayadan oyulmuş şırahane taşı (üstte ezme teknesi, oluktan alttaki küçük gözeye), duvar dibinde üzüm
// küfeleri, biri devrik. Solda yere yatık bodur bağ kütükleri sıra sıra uzaklaşır.
// Tek ışık: kapalı gök (yukarıdan, biraz soldan). Çardağın altı loş, yaprak gölgesi yere benek benek düşer.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,golgele,silindir,kutu} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,tasOrgu,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';
import {gokIsigi,gokCiz,sirt,agac,prizma,kaya,kirZemin,ot,cali,yatikSilindir} from './harman-yeri.js';

const isik=gokIsigi();
const TAS=[184,176,154], TOPRAK=[160,142,116], AHSAP=[122,104,80], SEPET=[170,150,110], KAYA=[190,184,164];
const EV={x:[130,520], z:[770,1110], h:228};
const KAPI={x:[196,282], h:168};
const CARDAK={x:[-230,128], z:[500,EV.z[0]], h:212};
const SIRA={x:-70, z:630, en:150, derin:80, h:58};   // şırahane taşı

// Bodur bağ kütüğü: yere yakın, kıvrık kollar, kuru yaprak kümesi
function kutuk(P,X,Z,tohum,yogun=4200){
  const R=rng(tohum), s=P.n(X,0,Z), o=P.olcek(X,0,Z);
  cali(P,isik,X,Z,{en:110,boy:54,yogun,tohum,renk:[92,90,70]});
  for(let i=0;i<4;i++){const a=-Math.PI/2+(R()-.5)*2.2, l=(40+R()*30)*o;
    titrek(()=>{c.moveTo(s[0],s[1]); c.quadraticCurveTo(s[0]+Math.cos(a)*l*.3+(R()-.5)*10*o,s[1]-l*.5,s[0]+Math.cos(a)*l,s[1]+Math.sin(a)*l*.6);},[44,38,30],.7,Math.max(.8,3*o),tohum+i,1,.5);}
}

// Üzüm küfesi: söğüt örgü, ağzı geniş
function kufe(P,X,Z,tohum){
  duzlemde(P,[X,0,Z],DUZLEM.zemin,()=>leke(0,0,34,26,[0,0,0],.5));
  silindir(P,isik,X,Z,24,0,44,SEPET,tohum,{ustRenk:[46,40,32],cizgi:.6});
  const a=P.n(X-24,0,Z), b=P.n(X+24,44,Z), o=P.olcek(X,20,Z);
  c.save(); c.beginPath(); c.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]); c.clip();
  tara(a[0],b[1],b[0],a[1],.9,3*o,[40,32,22],.35,tohum+1,.9); tara(a[0],b[1],b[0],a[1],-.9,3*o,[40,32,22],.3,tohum+2,.9);
  for(let y=6;y<44;y+=7){const p0=P.n(X-24,y,Z), p1=P.n(X+24,y,Z); c.strokeStyle='rgba(230,214,170,.25)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(p0[0],p0[1]); c.quadraticCurveTo((p0[0]+p1[0])/2,p0[1]+4*o,p1[0],p1[1]); c.stroke();}
  leke(b[0],(a[1]+b[1])/2,(b[0]-a[0])*.4,(a[1]-b[1])*.6,[0,0,0],.35);
  c.restore();
  // ağzında birkaç salkım (koyu yumru)
  const t=P.n(X,44,Z); for(let i=0;i<5;i++){const R=rng(tohum*3+i); c.fillStyle='rgba(30,28,26,.75)'; c.beginPath(); c.ellipse(t[0]+(R()-.5)*30*o,t[1]-2*o-R()*4*o,5*o,3.5*o,0,0,TAU); c.fill();}
}

export default {
  id:'bag-evi',
  kamera:{odak:800, yukseklik:155, egim:.12},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[150,0,320], yuzey:'toprak', alan:12},
    'zemin-orta': {duzlem:'zemin', konum:[230,0,560], yuzey:'toprak', alan:10},
    'zemin-kose': {duzlem:'zemin', konum:[-330,0,560], yuzey:'toprak', alan:8},
    'esik':       {duzlem:'zemin', konum:[(KAPI.x[0]+KAPI.x[1])/2,6,EV.z[0]-16], yuzey:'tas', alan:4},
    'duvar':      {duzlem:'arka', konum:[400,118,EV.z[0]], yuzey:'tas', alan:10, uygunsuz:['saat']},
    'sirahane':   {duzlem:'ust', konum:[SIRA.x+52,SIRA.h,SIRA.z-SIRA.derin/2+8], yuzey:'tas', alan:4},
    'kufe-yani':  {duzlem:'zemin', konum:[110,0,560], yuzey:'toprak', alan:5},
    'beden':      {duzlem:'zemin', konum:[-80,0,410], aci:.22, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(2207), E=EV, K=KAPI, C=CARDAK, S=SIRA;
    gokCiz(P,R);
    sirt(P,{z:15000,h:1200,renk:[150,150,138],yogun:5200,tohum:51,sisAlt:.6,cizgi:.15});
    sirt(P,{z:5600,h:420,taban:-40,renk:[130,124,102],yogun:4600,tohum:52,nokta:160,teras:5,sisAlt:.45});
    for(const [x,z,t] of [[-1500,3600,1],[1600,3200,2],[2300,4200,3]]) agac(P,isik,x,z,{tur:'zeytin',boy:420,en:460,yogun:4200,tohum:530+t,golge:0});
    kirZemin(P,isik,{x:[-3000,3000],z:[200,6000],renk:TOPRAK,R,yogun:4600,tohum:221,cakil:110});
    // bağ: bodur kütükler sıra sıra (soldan ve evin ardından uzaklaşır)
    const kut=[];
    for(let row=0;row<6;row++) for(let z=900+row*20;z<3600;z+=230+row*10) kut.push([-320-row*240+(R()-.5)*30,z]);
    for(let row=0;row<4;row++) for(let z=1500;z<3600;z+=240) kut.push([200+row*260+(R()-.5)*30,z+row*40]);
    kut.sort((a,b)=>b[1]-a[1]).forEach((q,i)=>kutuk(P,q[0],q[1],600+i));
    // kulübe: önce sol yan, sonra ön yüz (kapı boşluğu kesilerek)
    tasOrgu(P,isik,[E.x[0],0,0],DUZLEM.sag,[-E.z[1],-E.z[0],-E.h,0],golgele(TAS,1.05),R,{sira:14,duzensiz:.5,harc:[96,90,76]});
    c.save(); c.beginPath(); c.rect(0,0,1000,750);
    const kp=[[K.x[0],0,E.z[0]],[K.x[1],0,E.z[0]],[K.x[1],K.h,E.z[0]],[K.x[0],K.h,E.z[0]]].map(q=>P.n(...q));
    kp.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip('evenodd');
    tasOrgu(P,isik,[0,0,E.z[0]],DUZLEM.arka,[E.x[0],E.x[1],-E.h,0],TAS,R,{sira:14,duzensiz:.5,harc:[100,94,80]});
    c.restore();
    // köşe taşları (iri, yontulmuş)
    for(let y=0;y<E.h-10;y+=30){kutu(P,isik,[E.x[0],E.x[0]+(y/30%2?34:22)],[y,y+28],[E.z[0],E.z[0]+(y/30%2?22:34)],golgele(TAS,1.05),700+y,{cizgi:.4,ust:false});}
    // kapı: içerisi karanlık; ağaç kasa, lento, eşik taşı
    cokgen3(P,[[K.x[0],0,E.z[0]+40],[K.x[1],0,E.z[0]+40],[K.x[1],K.h,E.z[0]+40],[K.x[0],K.h,E.z[0]+40]],[22,22,18]);
    cokgen3(P,[[K.x[0],0,E.z[0]],[K.x[0],0,E.z[0]+40],[K.x[0],K.h,E.z[0]+40],[K.x[0],K.h,E.z[0]]],[70,66,56]);
    { const a=P.n(K.x[0],0,E.z[0]+40), b=P.n(K.x[1],K.h,E.z[0]+40); leke((a[0]+b[0])/2,a[1]-10,(b[0]-a[0])*.5,20,[90,86,72],.25); }
    kutu(P,isik,[K.x[0]-16,K.x[1]+16],[K.h,K.h+16],[E.z[0]-4,E.z[0]+8],AHSAP,710,{ust:false});
    kutu(P,isik,[K.x[0]-12,K.x[1]+12],[0,6],[E.z[0]-30,E.z[0]+2],KAYA,711,{cizgi:.5});
    // aralık kapı kanadı: içe açık, kenarı görünür
    cokgen3(P,[[K.x[1]-4,4,E.z[0]+4],[K.x[1]-30,4,E.z[0]+36],[K.x[1]-30,K.h-6,E.z[0]+36],[K.x[1]-4,K.h-6,E.z[0]+4]],golgele(AHSAP,.5));
    hat3(P,[[K.x[1]-4,4,E.z[0]+4],[K.x[1]-30,4,E.z[0]+36],[K.x[1]-30,K.h-6,E.z[0]+36],[K.x[1]-4,K.h-6,E.z[0]+4]],MUREKKEP,.6,1,712,2,1,true);
    // mazgal pencere
    cokgen3(P,[[420,140,E.z[0]],[446,140,E.z[0]],[446,178,E.z[0]],[420,178,E.z[0]]],[24,24,20]);
    // toprak dam: taşan kenar, üstünde ot, dam taşı (loğ)
    const p=10, t=18, H=E.h;
    const dam=[]; for(let i=0;i<=10;i++){const x=E.x[0]-p+(E.x[1]-E.x[0]+2*p)*i/10; dam.push([x,H+t+(i%10?R()*7:0),E.z[0]-p]);}
    cokgen3(P,[[E.x[0]-p,H,E.z[0]-p],[E.x[1]+p,H,E.z[0]-p],...dam.slice().reverse()],[96,86,70]);
    cokgen3(P,[[E.x[0]-p,H,E.z[0]-p],[E.x[0]-p,H,E.z[1]+p],[E.x[0]-p,H+t,E.z[1]+p],[E.x[0]-p,H+t,E.z[0]-p]],[84,76,62]);
    for(let i=0;i<14;i++){const x=E.x[0]-p+R()*(E.x[1]-E.x[0]+2*p), q=P.n(x,H+t+4,E.z[0]-p+R()*30), o=P.olcek(x,H,E.z[0]); for(let k=0;k<5;k++){c.strokeStyle='rgba(50,46,36,.6)'; c.lineWidth=1; c.beginPath(); c.moveTo(q[0],q[1]); c.lineTo(q[0]+(R()-.5)*8*o,q[1]-(6+R()*12)*o); c.stroke();}}
    hat3(P,[[E.x[0]-p,H,E.z[0]-p],[E.x[1]+p,H,E.z[0]-p]],MUREKKEP,.7,1.6,720,2,1);
    for(let x=E.x[0]+20;x<E.x[1];x+=36){const q=P.n(x,H-6,E.z[0]); const o=P.olcek(x,H,E.z[0]); c.fillStyle='rgba(30,26,20,.8)'; c.fillRect(q[0]-3*o,q[1]-3*o,7*o,7*o);} // hatıl uçları
    // duvar dibi
    { const a=P.n(E.x[0],0,E.z[0]), b=P.n(E.x[1],0,E.z[0]), d=P.n(E.x[0],0,E.z[1]); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=7; c.beginPath(); c.moveTo(d[0],d[1]); c.lineTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
    // çardağın yerdeki benekli gölgesi (yumuşak kenarlı)
    { const m=P.n((C.x[0]+C.x[1])/2,0,(C.z[0]+C.z[1])/2), o=P.olcek((C.x[0]+C.x[1])/2,0,(C.z[0]+C.z[1])/2);
      leke(m[0],m[1],(C.x[1]-C.x[0])*.62*o,(C.z[1]-C.z[0])*.12*o,[0,0,0],.28);
      for(let i=0;i<70;i++){const X=C.x[0]+R()*(C.x[1]-C.x[0]), Z=C.z[0]+R()*(C.z[1]-C.z[0]), q=P.n(X,0,Z), oo=P.olcek(X,0,Z); leke(q[0],q[1],(12+R()*20)*oo,(4+R()*6)*oo,R()<.6?[0,0,0]:[220,214,190],.12+R()*.12);} }
    // küfeler (duvar dibinde) ve devrik küfe, dökülmüş salkımlar
    kufe(P,96,EV.z[0]-30,740); kufe(P,40,EV.z[0]-15,741);
    duzlemde(P,[64,0,610],DUZLEM.zemin,()=>leke(0,0,40,24,[0,0,0],.45));
    yatikSilindir(P,isik,[40,22,620],[86,22,590],22,SEPET,742,{doku:30,uc:q=>{const s=P.n(...q.O), o=P.olcek(...q.O); c.fillStyle='rgba(24,22,18,.85)'; c.beginPath(); c.ellipse(s[0],s[1],18*o,19*o,0,0,TAU); c.fill();}});
    for(let i=0;i<6;i++){const q=P.n(20-R()*40,0,580+R()*40), o=P.olcek(10,0,600); c.fillStyle='rgba(28,26,24,.8)'; c.beginPath(); c.ellipse(q[0],q[1]-2*o,5*o,3.5*o,0,0,TAU); c.fill(); leke(q[0]-1.5*o,q[1]-3.5*o,2*o,1.5*o,[220,220,210],.4);}
    // şırahane taşı: kayadan oyulmuş tekne; ön yüzünde oluk, altında küçük göze
    duzlemde(P,[S.x,0,S.z],DUZLEM.zemin,()=>leke(0,0,S.en*.65,S.derin*.7,[0,0,0],.5));
    const T=prizma(P,isik,[[-S.en/2,0],[S.en/2,0],[S.en/2+3,S.h-6],[S.en/2-4,S.h],[-S.en/2+5,S.h],[-S.en/2-2,S.h-8]],S.derin,{O:[S.x,0,S.z-S.derin/2],yaw:.06},KAYA,750,{cizgi:.75,doku:16});
    const ic=[[S.x-S.en/2+14,S.h+.5,S.z-S.derin/2+12],[S.x+S.en/2-14,S.h+.5,S.z-S.derin/2+12],[S.x+S.en/2-14,S.h+.5,S.z+S.derin/2-10],[S.x-S.en/2+14,S.h+.5,S.z+S.derin/2-10]].map(q=>[q[0],q[1],q[2]+ (q[0]-S.x)*.06]);
    cokgen3(P,ic,[44,40,34]); hat3(P,ic,MUREKKEP,.6,1.2,751,2,1,true);
    { const a=P.n(...ic[0]), b=P.n(...ic[2]); c.save(); c.beginPath(); ic.map(q=>P.n(...q)).forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.clip(); leke(a[0]+20,b[1]+6,(b[0]-a[0])*.6,8,[0,0,0],.6); leke((a[0]+b[0])/2,a[1]-3,(b[0]-a[0])*.4,4,[90,84,70],.4); c.restore(); }
    duzlemde(P,T.O,T.D,()=>{ // şıra lekesi: oluktan aşağı koyu akıntı
      c.fillStyle='rgba(30,26,24,.5)'; c.beginPath(); c.moveTo(-6,-S.h); c.lineTo(6,-S.h); c.lineTo(4,-S.h+30); c.quadraticCurveTo(0,-8,-3,-S.h+32); c.closePath(); c.fill();
      leke(0,-S.h+10,12,16,[0,0,0],.3);
    });
    // oluk ağzı ve alttaki göze
    const ol=P.n(S.x,S.h-4,S.z-S.derin/2-2), oo=P.olcek(S.x,S.h,S.z-S.derin/2);
    c.fillStyle='rgba(20,18,16,.9)'; c.beginPath(); c.ellipse(ol[0],ol[1],5*oo,3*oo,0,0,TAU); c.fill();
    kaya(P,isik,S.x,S.z-S.derin/2-26,{en:56,boy:14,derin:40,renk:KAYA,tohum:752,nA:9,nK:2,catlak:1});
    { const g=P.n(S.x,14.5,S.z-S.derin/2-26); cokgen3(P,[[S.x-17,14.5,S.z-S.derin/2-36],[S.x+17,14.5,S.z-S.derin/2-36],[S.x+17,14.5,S.z-S.derin/2-16],[S.x-17,14.5,S.z-S.derin/2-16]],[38,34,30]); leke(g[0]-4,g[1],14*oo,3*oo,[180,176,160],.35); }
    // çardak: çatal ağaç direkler, kirişler, üstte sırıklar; asma kütüğü direğe sarılır
    const dir=[[C.x[0],C.z[0]],[C.x[1],C.z[0]],[C.x[0],C.z[1]-6]];
    for(const [i,[x,z]] of dir.entries()){
      duzlemde(P,[x,0,z],DUZLEM.zemin,()=>leke(0,0,14,8,[0,0,0],.5));
      const a=P.n(x,0,z), b=P.n(x+(i-1)*3,C.h,z), o=P.olcek(x,100,z);
      c.strokeStyle='rgb(86,74,56)'; c.lineCap='round'; c.lineWidth=13*o; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();
      c.strokeStyle='rgba(150,134,104,.6)'; c.lineWidth=3*o; c.beginPath(); c.moveTo(a[0]-3.5*o,a[1]); c.lineTo(b[0]-3.5*o,b[1]); c.stroke();
      titrek(()=>{c.moveTo(a[0]+4.5*o,a[1]); c.lineTo(b[0]+4.5*o,b[1]);},MUREKKEP,.6,1,770+i,2,.6);
      const ca=P.n(x-14,C.h+14,z), cb=P.n(x+14,C.h+14,z); c.strokeStyle='rgb(76,66,50)'; c.lineWidth=6*o; c.beginPath(); c.moveTo(ca[0],ca[1]); c.lineTo(b[0],b[1]); c.lineTo(cb[0],cb[1]); c.stroke(); // çatal
    }
    const kir=(A,B,k,t)=>{hat3(P,[A,B],[80,68,52],1,k,t,1,0); hat3(P,[A,B],MUREKKEP,.5,1,t+1,2,.6);};
    kir([C.x[0]-20,C.h+8,C.z[0]],[C.x[1]+20,C.h+8,C.z[0]],6,780);
    kir([C.x[0],C.h+12,C.z[0]-20],[C.x[0],C.h+12,C.z[1]],5,782);
    kir([C.x[1],C.h+12,C.z[0]-20],[C.x[1],C.h+12,C.z[1]],5,784);
    for(let x=C.x[0]+30;x<C.x[1];x+=40+R()*10) hat3(P,[[x,C.h+16,C.z[0]-18],[x+(R()-.5)*10,C.h+16,C.z[1]+4]],[70,60,46],.9,2.4,790+x|0,1,.3);
    // asma kütüğü: kalın, burgulu; direğe sarılıp çardağa yayılır
    const v0=[C.x[0]+20,0,C.z[0]+10];
    for(let k=0;k<3;k++){const w=[7,4,2.2][k]; let px=v0[0], py=0;
      const nk=[]; for(let i=0;i<=12;i++){nk.push([px+Math.sin(i*.9+k*.7)*3+(i%3-1)*1.5,py,v0[2]+Math.cos(i*.7)*2]); py+=C.h/12; px+=1.2;}
      if(k) hat3(P,nk,[40,34,26],.6,w*P.olcek(...v0)*.5,800+k,1,.5); else {c.strokeStyle='rgb(58,48,36)'; c.lineWidth=w*P.olcek(...v0); c.lineJoin='round'; c.beginPath(); nk.forEach((q,i)=>{const e=P.n(...q); i?c.lineTo(e[0],e[1]):c.moveTo(e[0],e[1]);}); c.stroke();}}
    // çardağın üstü: alttan görülen yaprak örtüsü; koyu, yer yer gök sızar; birkaç sarkan çubuk
    const yaprak=[]; for(let i=0;i<1100;i++){const X=C.x[0]-30+R()*(C.x[1]-C.x[0]+50), Z=C.z[0]-24+R()*(C.z[1]-C.z[0]+24); yaprak.push([X,C.h+16+R()*16,Z]);}
    yaprak.sort((a,b)=>b[2]-a[2]);
    for(const q of yaprak){const sp=P.n(...q), o=P.olcek(...q), w=(4+R()*4)*o;
      c.fillStyle=rgba(golgele([80,84,62],.45+R()*.55),.92); c.beginPath(); for(let k=0;k<5;k++){const a=k/5*TAU+R(), u=w*(.7+R()*.5); k?c.lineTo(sp[0]+Math.cos(a)*u,sp[1]+Math.sin(a)*u*.6):c.moveTo(sp[0]+Math.cos(a)*u,sp[1]+Math.sin(a)*u*.6);} c.closePath(); c.fill();}
    for(let i=0;i<12;i++){const X=C.x[0]+R()*(C.x[1]-C.x[0]), Z=C.z[0]-10+R()*(C.z[1]-C.z[0]), a=P.n(X,C.h+14,Z), o=P.olcek(X,C.h,Z), l=(14+R()*30)*o;
      titrek(()=>{c.moveTo(a[0],a[1]); c.quadraticCurveTo(a[0]+(R()-.5)*20*o,a[1]+l*.6,a[0]+(R()-.5)*14*o,a[1]+l);},[34,30,24],.7,1.1,820+i,1,.5);}
    // ön plan: bağ arası kuru ot, taş
    for(let i=0;i<120;i++){const Z=245+R()*400, X=(R()-.5)*(Z*1.3+200); ot(P,X,Z,6+R()*9,R,{kat:.7});}
    kutuk(P,-330,330,890); kutuk(P,360,300,891);
    kaya(P,isik,-200,300,{en:40,boy:16,derin:30,renk:KAYA,tohum:880,nA:8,nK:2});
    kaya(P,isik,200,280,{en:30,boy:12,derin:24,renk:KAYA,tohum:881,nA:8,nK:2});
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.07,leke:.06});
    karanlik([[0,760,260,150,.3],[1000,760,260,150,.3]]);
  }
};
