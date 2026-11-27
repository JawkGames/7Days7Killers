// Harman yeri: köyün kenarında dövülüp düzlenmiş yuvarlak toprak alan. Ortada döven (altı çakmak taşlı kızak), sağda
// büyük saman yığını ve ona dayalı ağaç yaba, önde taş silindir (yuvgu); harmanın çevresi taş dizili, ötesi anız.
// Uzakta yamaca kurulmuş toprak damlı evler. Tek ışık: kapalı gök (yukarıdan, biraz soldan ve arkadan; gölgeler yumuşak).
// Dış mekân yardımcıları (gök, sis, sırt, köy, ağaç, kaya, kuru duvar, kır zemini, ot, çalı, prizma) ../dis-yardim.js içinde.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {hat3,yol3,golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';
import {kaya,yatikSilindir,agac,gokIsigi,sisle,sirt,koy,kirZemin,ot,gokCiz,prizma} from '../dis-yardim.js';

/* ═══════════════ Harman yeri ═══════════════ */

const isik=gokIsigi();
const TARLA=[132,120,96], HARMAN=[184,174,148], SAMAN=[214,200,156], AHSAP=[136,118,90], TAS=[184,178,160];
const MERKEZ=[30,770], YARI=470;                                // harmanın merkezi (x,z) ve yarıçapı
const DOVEN={O:[-178,0,580], yaw:.32}, YUVGU={A:[196,22,420], B:[256,22,456]};
const YIGIN={x:330,z:1060,en:520,boy:290,derin:300};

// Saman yığını: yumuşak kubbe, yüzünde saman çöpleri; tepesi gökle buluşur
function samanYigini(P,R){
  const Y=YIGIN;
  kaya(P,isik,Y.x,Y.z,{en:Y.en,boy:Y.boy,derin:Y.derin,renk:SAMAN,tohum:61,nA:36,nK:10,puruz:.12,cizgi:0,catlak:0,duz:true,us:.85});
  // saman dokusu: yüzeye dağılmış kısa çöpler, ışıkta açık, gölgede koyu
  const s=P.n(Y.x,0,Y.z), o=P.olcek(Y.x,0,Y.z), w=Y.en*.5*o, h=Y.boy*o;
  c.save(); c.beginPath(); c.ellipse(s[0],s[1],w*1.02,h*1.03,0,Math.PI,TAU); c.lineTo(s[0]+w,s[1]+12); c.lineTo(s[0]-w,s[1]+12); c.closePath(); c.clip();
  // çöpler yamaç boyunca aşağı sarkar: yön, kubbenin o noktadaki eğimi
  for(let i=0;i<1400;i++){const a=Math.PI+R()*Math.PI, d=Math.sqrt(R()), x=s[0]+Math.cos(a)*w*d, y=s[1]+Math.sin(a)*h*d+R()*8, t=(y-(s[1]-h))/h, l=(3+R()*6)*o*3;
    const aa=Math.atan2(-Math.sin(a)*h,-Math.cos(a)*w*.35)+Math.PI+(R()-.5)*.9;
    c.strokeStyle=R()<.45?`rgba(60,50,30,${.1+t*.22})`:`rgba(246,236,200,${.22*(1-t)+.06})`; c.lineWidth=.5+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(aa)*l,y+Math.abs(Math.sin(aa))*l); c.stroke();}
  leke(s[0]+w*.2,s[1]-h*.15,w*.8,h*.35,[0,0,0],.18);
  c.restore();
  // dibinde dökülmüş saman
  duzlemde(P,[Y.x,0,Y.z-Y.derin*.42],DUZLEM.zemin,()=>{for(let i=0;i<220;i++){const x=(R()-.5)*Y.en*1.1, y=R()*90-10, a=R()*TAU, l=5+R()*12; c.strokeStyle=`rgba(${R()<.6?'224,212,170':'60,52,36'},${.3+R()*.3})`; c.lineWidth=.8; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); c.stroke();}});
  // dış hatta dışarı taşan gevşek saman, dipte yere yayılan saçak
  for(let i=0;i<260;i++){const a=Math.PI+R()*Math.PI, x=s[0]+Math.cos(a)*w*.97, y=s[1]+Math.sin(a)*h*.97, l=(3+R()*9)*o*3, aa=a+(R()-.5)*1.4;
    c.strokeStyle=R()<.5?'rgba(70,60,40,.5)':'rgba(236,226,190,.6)'; c.lineWidth=.6+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(aa)*l,y+Math.sin(aa)*l); c.stroke();}
  for(let i=0;i<160;i++){const x=s[0]+(R()-.5)*w*2.1, y=s[1]-R()*8*o*3, l=(4+R()*10)*o*3, aa=-Math.PI/2+(R()-.5)*2.6;
    c.strokeStyle=R()<.4?'rgba(60,50,34,.45)':'rgba(230,218,176,.55)'; c.lineWidth=.6+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(aa)*l,y+Math.sin(aa)*l*.5); c.stroke();}
}

// Döven: kalın tahta kızak, ön ucu yukarı kalkık; üstte tahta ekleri, önde çekme halkası
function doven(P){
  const pr=[[-82,0],[48,0],[66,5],[80,16],[90,32],[84,35],[73,23],[59,14],[46,11],[-82,11]];
  const D=prizma(P,isik,pr,66,{O:DOVEN.O,yaw:DOVEN.yaw},AHSAP,301,{cizgi:.7,doku:10});
  for(const z of[16,33,50]) hat3(P,[D.dunya([-82,11.2,z]),D.dunya([46,11.2,z]),D.dunya([59,14.2,z])],MUREKKEP,.55,1,310+z,2,.8);
  for(let i=0;i<10;i++){const p=D.dunya([-74+i*13,11.3,4+(i%3)*22]), s=P.n(...p); c.fillStyle='rgba(20,18,14,.7)'; c.fillRect(s[0]-1,s[1]-.6,2,1.2);} // çivi başları
  const h=P.n(...D.dunya([86,24,33])), o=P.olcek(...D.dunya([86,24,33]));
  titrek(()=>{c.ellipse(h[0]+5*o,h[1]+2*o,6*o,4*o,0,0,TAU);},[30,28,24],.8,1.4,320,2,.6);
  // altındaki çakmak taşlarından birkaçı kenardan görünür
  for(let i=0;i<9;i++){const p=D.dunya([-76+i*14,0,0]), s=P.n(...p); c.fillStyle='rgba(210,206,190,.7)'; c.fillRect(s[0]-1.2,s[1]-1,2.4,1.6);}
  return D;
}

export default {
  id:'harman-yeri',
  kamera:{odak:800, yukseklik:160, egim:.12},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[-150,0,300], yuzey:'toprak', alan:10},
    'zemin-orta': {duzlem:'zemin', konum:[60,0,640], yuzey:'toprak', alan:12},
    'zemin-kose': {duzlem:'zemin', konum:[-360,0,760], yuzey:'toprak', alan:12},
    'doven-ustu': {duzlem:'ust', konum:[-196,11.5,586], yuzey:'tahta', alan:5, aci:DOVEN.yaw},
    'yuvgu-dibi': {duzlem:'zemin', konum:[150,0,372], yuzey:'toprak', alan:6},
    'saman-dibi': {duzlem:'zemin', konum:[236,0,800], yuzey:'toprak', alan:12},
    'beden':      {duzlem:'zemin', konum:[10,0,470], aci:-.18, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(9043);
    gokCiz(P,R);
    // uzak sırtlar ve yamaçtaki köy
    sirt(P,{z:18000,h:1500,renk:[150,150,136],yogun:6000,tohum:3,sisAlt:.6,cizgi:.15});
    sirt(P,{z:7000,h:760,taban:-60,renk:[128,124,104],yogun:6000,tohum:8,nokta:70,teras:4,sisAlt:.45});
    koy(P,isik,R,{x:[-4400,-300],z:[4600,6400],n:18,yamac:.3,yogun:6000});
    for(const [x,z,t] of [[1500,3400,4],[2100,3900,5],[-600,3300,6]]) agac(P,isik,x,z,{tur:'citlembik',boy:560,en:520,yogun:3000,tohum:t,golge:0});
    // anız ve harman
    kirZemin(P,isik,{x:[-3000,3000],z:[200,7000],renk:TARLA,R,yogun:4200,tohum:901,cakil:120});
    // anız: sıra sıra kısa sap dipleri (uzaklaştıkça incelir)
    for(let Z=1250;Z<2600;Z+=40+Z*.02){for(let X=-1600+R()*30;X<1600;X+=22+Z*.012+R()*30){if(Math.hypot(X-MERKEZ[0],(Z-MERKEZ[1])*1)<YARI+60) continue; const s=P.n(X+(R()-.5)*8,0,Z), o=P.olcek(X,0,Z); if(s[0]<-5||s[0]>1005) continue; c.strokeStyle=rgba(sisle([70,64,50],Z,4200),.25+R()*.25); c.lineWidth=Math.max(.5,1.2*o*2); c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+(R()-.5)*2,s[1]-Math.max(1,(6+R()*8)*o)); c.stroke();}}
    // harman: dövülüp düzlenmiş açık toprak; döven izinin halkaları
    const cember=(rr,t0=0,t1=TAU)=>{const n=[]; for(let i=0;i<=72;i++){const t=t0+(t1-t0)*i/72; n.push([MERKEZ[0]+Math.cos(t)*rr,0,MERKEZ[1]+Math.sin(t)*rr]);} return n;};
    c.save(); c.beginPath(); yol3(P,cember(YARI)); c.clip();
    const sm=P.n(MERKEZ[0],0,MERKEZ[1]), sn=P.n(MERKEZ[0],0,MERKEZ[1]+YARI), sa=P.n(MERKEZ[0],0,200);
    let g=c.createLinearGradient(0,sn[1],0,sa[1]); g.addColorStop(0,rgba(sisle(HARMAN,1100,4200),1)); g.addColorStop(1,rgba(golgele(HARMAN,.95),1)); c.fillStyle=g; c.fillRect(0,0,1000,750);
    for(let rr=40;rr<YARI;rr+=14+R()*22){const t0=R()*TAU; c.beginPath(); yol3(P,cember(rr+(R()-.5)*6,t0,t0+1.5+R()*3.5),false); c.strokeStyle=R()<.5?`rgba(60,54,40,${.06+R()*.08})`:`rgba(236,228,200,${.08+R()*.1})`; c.lineWidth=.8+R()*2.4; c.stroke();}
    // savrulmuş saman ve kavuz: açık, ince çöpler
    for(let i=0;i<700;i++){const a=R()*TAU, d=Math.sqrt(R())*YARI, X=MERKEZ[0]+Math.cos(a)*d, Z=MERKEZ[1]+Math.sin(a)*d, s=P.n(X,0,Z), o=P.olcek(X,0,Z), l=(2+R()*6)*o, aa=a+Math.PI/2+(R()-.5)*1.2;
      c.strokeStyle=`rgba(${R()<.7?'232,222,186':'50,44,32'},${.12+R()*.25})`; c.lineWidth=Math.max(.5,.9*o*2); c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+Math.cos(aa)*l,s[1]+Math.sin(aa)*l*.3); c.stroke();}
    leke(sm[0],sm[1]+20,500,50,[255,252,236],.12);
    tara(0,sn[1],1000,760,.02,5,MUREKKEP,.12,905,.8);
    c.restore();
    // harmanı çeviren taş dizisi (uzak yay ve yanlar)
    const tasT=[]; for(let i=0;i<130;i++){const t=-Math.PI*.5+.42+i/130*(TAU-.84)+(R()-.5)*.02; tasT.push(t);}
    tasT.sort((a,b)=>Math.sin(b)-Math.sin(a)); // uzaktan yakına
    for(const [i,t] of tasT.entries()){const X=MERKEZ[0]+Math.cos(t)*(YARI+8), Z=MERKEZ[1]+Math.sin(t)*(YARI+8); if(Z<250) continue;
      kaya(P,isik,X,Z,{en:22+R()*16,boy:9+R()*8,derin:18+R()*10,renk:TAS,tohum:400+i,nA:7,nK:2,cizgi:.35,catlak:0});}
    // saman yığını ve ona dayalı yaba
    samanYigini(P,R);
    const yb0=[150,0,850], yb1=[182,214,930];
    hat3(P,[yb0,yb1],[96,82,60],1,3.2,330,1,0); hat3(P,[yb0,yb1],MUREKKEP,.6,1,331,2,.6);
    for(let i=-2;i<=2;i++){const b=[yb1[0]+i*5,yb1[1]+2,yb1[2]+2], u=[yb1[0]+i*8,yb1[1]+38,yb1[2]+16]; hat3(P,[b,[b[0]+i*1.5,b[1]+20,b[2]+6],u],[80,68,50],.9,1.6,340+i,1,.3);}
    hat3(P,[[yb1[0]-12,yb1[1],yb1[2]],[yb1[0]+12,yb1[1],yb1[2]]],[70,60,44],.9,2.2,346,1,.3);
    // döven
    duzlemde(P,[DOVEN.O[0]+2,0,DOVEN.O[2]+30],DUZLEM.zemin,()=>{c.rotate(-DOVEN.yaw); leke(0,0,96,44,[0,0,0],.4);});
    doven(P);
    // yuvgu: taş silindir, uçlarında mil deliği
    duzlemde(P,[(YUVGU.A[0]+YUVGU.B[0])/2,0,(YUVGU.A[2]+YUVGU.B[2])/2],DUZLEM.zemin,()=>leke(0,0,50,26,[0,0,0],.55));
    yatikSilindir(P,isik,YUVGU.A,YUVGU.B,22,TAS,350,{doku:60,uc:p=>{const s=P.n(...p.O), o=P.olcek(...p.O); c.fillStyle='rgba(10,10,8,.85)'; c.beginPath(); c.ellipse(s[0],s[1],4*o,4.5*o,0,0,TAU); c.fill(); leke(s[0]-6*o,s[1]-6*o,10*o,8*o,[230,226,210],.25);}});
    // ön plan: harman kenarında kuru ot, birkaç taş
    const on=[]; for(let i=0;i<260;i++){const X=-700+R()*1400, Z=245+R()*300; if(Math.hypot(X-MERKEZ[0],Z-MERKEZ[1])<YARI+25) continue; on.push([X,Z]);}
    on.sort((a,b)=>b[1]-a[1]); for(const [X,Z] of on) ot(P,X,Z,8+R()*14,R,{yogun:4200,kat:.9});
    for(const [x,z,t] of [[-330,300,1],[360,290,2]]) kaya(P,isik,x,z,{en:34+t*8,boy:16+t*3,derin:26,renk:TAS,tohum:470+t,nA:8,nK:2,catlak:1});
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.06,leke:.05});
    karanlik([[0,750,260,160,.3],[1000,750,260,160,.3]]);
  }
};
