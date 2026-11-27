// Sınır patikası: kireçtaşı kayalık yamaçta, köyden güneye (Suriye sınırına) inen dar katır yolu. Önde solda katmanlı
// kaya çıkıntısı, sağda yassı kaya; patika dikenli çalılar arasından kıvrılarak sırta tırmanır. Çamurlu yerlerde katır
// nalı izleri. Sırtta beyaz sınır taşı, çok uzakta, sisin üstünde karakol kulesinin karaltısı.
// Tek ışık: kapalı gök. Vadiler sisle dolu; uzak sırtlar katman katman açılır.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba,lerp} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {golgele,yol3} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';
import {gokIsigi,gokCiz,sirt,prizma,kaya,kirZemin,ot,cali,sisle,GOK} from '../dis-yardim.js';

const isik=gokIsigi();
const TOPRAK=[154,140,112], KIREC=[196,190,170], CAMUR=[96,88,72];
const KAYA_ON={x:-210,z:440};                      // soldaki kaya çıkıntısının ön yüzü
const YASSI={x:250,z:560};
// patikanın orta hattı: [X, Y, Z, yarı genişlik]
// yamaç: Z=900'den sonra düzgünce yükselir (zemin yüksekliği), sırt 2500'de biter
const YAMAC=Z=>Z<900?0:(Z-900)*.14+Math.max(0,Z-1800)*.05;
const YOL=[[-10,230,52],[20,360,48],[70,500,44],[130,640,40],[170,800,36],[150,980,32],[230,1180,28],[330,1420,24],[420,1700,20],[520,2000,16],[600,2380,12]].map(([x,z,w])=>[x,YAMAC(z)+.5,z,w]);
const yolNokta=t=>{const f=t*(YOL.length-1), i=Math.min(YOL.length-2,f|0), u=f-i, a=YOL[i], b=YOL[i+1]; return a.map((v,k)=>lerp(v,b[k],u));};

// Katmanlı kireçtaşı çıkıntı: üst üste, biraz kaymış yassı bloklar; her katın arası koyu
function cikinti(P,X,Z){
  duzlemde(P,[X,0,Z+50],DUZLEM.zemin,()=>leke(0,0,170,80,[0,0,0],.5));
  // arkada ve üstte yumrulu kayalar
  kaya(P,isik,X-40,Z+120,{en:220,boy:150,derin:120,renk:KIREC,tohum:471,nA:16,nK:6,catlak:4,cizgi:.3,puruz:.8});
  kaya(P,isik,X+110,Z+90,{en:120,boy:80,derin:90,renk:KIREC,tohum:472,nA:16,nK:6,catlak:2,cizgi:.3,puruz:.8});
  // önde ağır, kırık yüzlü blok: yüzü makineye bakar (yuva bu yüzde)
  const R=rng(470), pr=[]; const n=16;
  for(let i=0;i<n;i++){const a=Math.PI+i/(n-1)*Math.PI, w=1+(R()-.5)*.18; pr.push([Math.cos(a)*-110*w*-1,Math.max(0,Math.sin(-a))*92*w]);}
  const prof=[[-112,0],...pr.slice(1,-1),[112,0]];
  const T=prizma(P,isik,prof,80,{O:[X,0,Z],yaw:.05},golgele(KIREC,.97),480,{cizgi:.4,doku:24});
  duzlemde(P,T.O,T.D,()=>{
    c.save(); c.beginPath(); prof.forEach((q,k)=>k?c.lineTo(q[0],-q[1]):c.moveTo(q[0],-q[1])); c.closePath(); c.clip();
    leke(0,0,130,14,[0,0,0],.45); leke(-30,-70,70,30,[255,255,240],.12);
    for(const y of[-28,-56]) titrek(()=>{c.moveTo(-120,y+(R()-.5)*6); for(let x=-100;x<=120;x+=20) c.lineTo(x,y+(R()-.5)*7);},MUREKKEP,.35,1,488+y,1,.5);
    for(let k=0;k<3;k++){let x=(R()-.5)*160, y=0; titrek(()=>{c.moveTo(x,y); for(let m=0;m<4;m++){x+=(R()-.5)*16; y-=8+R()*10; c.lineTo(x,y);}},MUREKKEP,.4,1,490+k,1,.5);}
    for(let k=0;k<16;k++) leke((R()-.5)*200,-R()*80,4+R()*12,2+R()*6,[30,30,22],.2); // liken
    c.restore();
  });
  cali(P,isik,X+150,Z+40,{en:70,boy:46,tohum:495});
  return T;
}

export default {
  id:'sinir-patikasi',
  kamera:{odak:780, yukseklik:160, egim:.13},
  isik,
  yuvalar:{
    'zemin-on':  {duzlem:'zemin', konum:[-80,0,290], yuzey:'toprak', alan:12},
    'patika':    {duzlem:'zemin', konum:[150,0,700], yuzey:'camur', alan:8},
    'zemin-orta':{duzlem:'zemin', konum:[-20,0,650], yuzey:'toprak', alan:10},
    'cali-dibi': {duzlem:'zemin', konum:[330,0,820], yuzey:'toprak', alan:6},
    'kaya':      {duzlem:'arka', konum:[KAYA_ON.x+30,40,KAYA_ON.z], yuzey:'tas', alan:8, uygunsuz:['saat','civi']},
    'kaya-ustu': {duzlem:'ust', konum:[YASSI.x-6,31,YASSI.z-12], yuzey:'tas', alan:8},
    'beden':     {duzlem:'zemin', konum:[54,0,440], aci:1.15, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(5170);
    gokCiz(P,R,{ust:[150,152,144]});
    // uzak sırtlar: sınırın ötesi ovaya iner, aralar sis
    sirt(P,{z:30000,h:2600,renk:[120,122,112],yogun:22000,tohum:61,sisAlt:.7,cizgi:.12});
    const yk=sirt(P,{z:12000,h:1500,taban:-200,renk:[100,100,88],yogun:14000,tohum:62,sisAlt:.7,nokta:40,cizgi:.18});
    // karakol kulesi: uzak sırtın üstünde küçük karaltı
    { const X=900, Y=yk(900)-20, Z=12000, k=sisle([50,50,44],Z,14000), o=P.olcek(X,Y,Z), b=P.n(X,Y,Z);
      c.fillStyle=rgba(k,1); c.beginPath(); c.moveTo(b[0]-180*o,b[1]); c.lineTo(b[0]-150*o,b[1]-620*o); c.lineTo(b[0]+150*o,b[1]-620*o); c.lineTo(b[0]+180*o,b[1]); c.closePath(); c.fill();
      c.fillRect(b[0]-190*o,b[1]-680*o,380*o,70*o); c.fillStyle=rgba(sisle([30,30,28],Z,14000),1); c.fillRect(b[0]-40*o,b[1]-560*o,80*o,90*o);
      c.strokeStyle=rgba(k,1); c.lineWidth=1; c.beginPath(); c.moveTo(b[0],b[1]-680*o); c.lineTo(b[0],b[1]-880*o); c.stroke(); } // bayrak direği
    const vadi=c.createLinearGradient(0,P.ufuk-30,0,P.ufuk+60); vadi.addColorStop(0,rgba(GOK,0)); vadi.addColorStop(1,rgba(GOK,.75)); c.fillStyle=vadi; c.fillRect(0,P.ufuk-30,1000,90);
    sirt(P,{z:5200,h:560,taban:-120,renk:[124,120,100],yogun:5200,tohum:63,sisAlt:.6,nokta:120,teras:2});
    // yakın sırt: patika buraya tırmanır
    kirZemin(P,isik,{x:[-1600,1600],z:[200,960],renk:TOPRAK,R,yogun:4000,tohum:517,cakil:200,doku:1.3});
    // yamaç: uzaktan yakına şeritler; her şerit kendi yüksekliğinde, sisle açılır; üst kenarı sırt
    const sirtY=X=>Math.sin(X*.0012+1)*26+Math.sin(X*.004)*9;
    for(let Z=2500;Z>900;Z-=25){const Z2=Z-25, q=[];
      for(let X=-2600;X<=2600;X+=100) q.push([X,YAMAC(Z)+(Z>2470?sirtY(X):0)+Math.sin(X*.01+Z*.02)*3,Z]);
      for(let X=2600;X>=-2600;X-=100) q.push([X,YAMAC(Z2)+Math.sin(X*.01+Z2*.02)*3,Z2]);
      const a=.9+.08*Math.sin(Z*.05); c.beginPath(); yol3(P,q); c.fillStyle=rgba(sisle(golgele(TOPRAK,a*(isik.ortam+.5)),Z,4000),1); c.fill(); c.strokeStyle=c.fillStyle; c.lineWidth=1; c.stroke();}
    { const s0=P.n(0,YAMAC(2500),2500), s1=P.n(0,0,900); c.save(); c.beginPath(); c.rect(0,s0[1]-40,1000,s1[1]-s0[1]+40);
      c.clip(); for(let i=0;i<260;i++){const Z=900+R()*1600, X=(R()-.5)*Z*1.4, p=P.n(X,YAMAC(Z),Z), o=P.olcek(X,0,Z); leke(p[0],p[1],(20+R()*80)*o,(4+R()*12)*o,R()<.55?[0,0,0]:[220,210,186],.06+R()*.1);}
      tara(0,s0[1]-40,1000,s1[1],.1,6,MUREKKEP,.1,518,.9); c.restore();
      const tepe=[]; for(let X=-2600;X<=2600;X+=50) tepe.push(P.n(X,YAMAC(2500)+sirtY(X),2500)); c.strokeStyle=rgba(sisle([60,56,46],2500,4000),.5); c.lineWidth=1.2; c.beginPath(); tepe.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.stroke(); }
    // yamaçta çıplak kaya şeritleri (kireçtaşı damarları)
    for(let i=0;i<18;i++){const X=-1000+R()*2000, Z=1000+R()*1400; kaya(P,isik,X,Z,{en:60+R()*120,boy:16+R()*24,derin:40+R()*40,renk:KIREC,y:YAMAC(Z),tohum:520+i,nA:9,nK:2,yogun:4000,catlak:1});}
    // sırtta sınır taşı (badanalı, küçük)
    { const X=640, Z=2440; prizma(P,isik,[[-14,0],[14,0],[13,70],[0,80],[-13,70]],18,{O:[X,YAMAC(Z),Z]},[236,232,218],530,{cizgi:.5,yogun:4000}); }
    // patika: ezilmiş açık toprak şerit, kenarları taşlı; yer yer çamur
    const sol=[], sag=[]; for(let i=0;i<=60;i++){const q=yolNokta(i/60), q2=yolNokta(Math.min(1,i/60+.01)), dx=q2[0]-q[0], dz=q2[2]-q[2], l=Math.hypot(dx,dz)||1; sol.push([q[0]-dz/l*q[3],q[1],q[2]+dx/l*q[3]]); sag.push([q[0]+dz/l*q[3],q[1],q[2]-dx/l*q[3]]);}
    const yolP=[...sol,...sag.slice().reverse()];
    c.save(); c.beginPath(); yol3(P,yolP); c.fillStyle=rgba(golgele([178,166,138],1),1); c.fill(); c.clip();
    for(let i=0;i<120;i++){const t=R(), q=yolNokta(t), p=P.n(q[0]+(R()-.5)*q[3]*1.6,q[1],q[2]), o=P.olcek(q[0],q[1],q[2]); leke(p[0],p[1],(8+R()*24)*o,(2+R()*5)*o,R()<.6?[0,0,0]:[220,210,186],.08+R()*.12);}
    // çamur yerleri (yuvanın çevresi ve iki çukur)
    for(const t of[.36,.12,.5]){const q=yolNokta(t), p=P.n(q[0],q[1],q[2]), o=P.olcek(q[0],q[1],q[2]); leke(p[0],p[1],q[3]*1.3*o,q[3]*.32*o,CAMUR,.75); leke(p[0]-q[3]*.3*o,p[1],q[3]*.4*o,q[3]*.08*o,[200,200,190],.3);}
    // katır nalı izleri: patika boyunca iki sıra
    for(let i=0;i<70;i++){const t=.02+i/70*.6, q=yolNokta(t), yan=(i%2?1:-1)*q[3]*.25, p=P.n(q[0]+yan,q[1],q[2]+(R()-.5)*6), o=P.olcek(q[0],q[1],q[2]);
      if(t>.27&&t<.42&&Math.abs(q[0]-54)<70) continue; // kurbanın altına çizme
      if(R()<.35) continue;
      c.strokeStyle='rgba(30,26,20,.38)'; c.lineWidth=Math.max(.6,1.8*o); c.beginPath(); c.ellipse(p[0],p[1],3.6*o,2*o,0,-Math.PI*.2,Math.PI*1.2,true); c.stroke();
      c.fillStyle='rgba(20,18,14,.18)'; c.beginPath(); c.ellipse(p[0],p[1],3*o,1.6*o,0,0,TAU); c.fill();}
    tara(0,0,1000,750,.04,6,MUREKKEP,.1,540,.8);
    c.restore();
    for(let i=0;i<120;i++){const t=R()*.9, q=yolNokta(t), yan=(R()<.5?-1:1)*q[3]*(1+R()*.15), p=[q[0]+yan,q[1],q[2]], s=P.n(...p), o=P.olcek(...p), w=(2+R()*6)*o;
      leke(s[0]+w*.2,s[1]+w*.3,w*1.4,w*.6,[0,0,0],.4); c.fillStyle=rgba(golgele(KIREC,.45+R()*.3),1); c.beginPath(); c.moveTo(s[0]-w,s[1]); c.lineTo(s[0]-w*.4,s[1]-w*.5); c.lineTo(s[0]+w*.5,s[1]-w*.45); c.lineTo(s[0]+w,s[1]); c.closePath(); c.fill();}
    // çalılar ve kayalar: uzaktan yakına
    const isler=[];
    for(let i=0;i<40;i++){const Z=600+R()*1800, X=(R()-.5)*(Z*1.6), q=yolNokta(Math.min(1,(Z-230)/2150)); if(Math.abs(X-q[0])<q[3]+40) continue; const y=YAMAC(Z);
      isler.push({z:Z,ciz:()=>cali(P,isik,X,Z,{en:60+R()*80,boy:34+R()*40,y,yogun:4000,tohum:550+i})});}
    isler.push({z:820,ciz:()=>cali(P,isik,370,860,{en:110,boy:70,tohum:590})});
    isler.push({z:YASSI.z,ciz:()=>{duzlemde(P,[YASSI.x,0,YASSI.z+30],DUZLEM.zemin,()=>leke(0,0,80,50,[0,0,0],.5));
      prizma(P,isik,[[-62,0],[60,0],[54,28],[20,32],[-30,31],[-58,24]],78,{O:[YASSI.x,0,YASSI.z-40],yaw:-.12},KIREC,600,{cizgi:.45,doku:18});
      for(let k=0;k<6;k++) ot(P,YASSI.x+(R()-.5)*140,YASSI.z-46+R()*10,8+R()*10,R);}});
    isler.push({z:KAYA_ON.z+50,ciz:()=>cikinti(P,KAYA_ON.x,KAYA_ON.z)});
    for(const [i,[x,z,e]] of [[-320,700,70],[260,380,34],[-160,250,30],[180,980,50]].entries()) isler.push({z,ciz:()=>kaya(P,isik,x,z,{en:e,boy:e*.5,derin:e*.7,renk:KIREC,tohum:610+i,nA:9,nK:3})});
    for(let i=0;i<160;i++){const Z=240+Math.pow(R(),.9)*700, X=(R()-.5)*(Z*1.5+200), q=yolNokta(Math.min(1,(Z-230)/1550)); if(Math.abs(X-q[0])<q[3]) continue; isler.push({z:Z,ciz:()=>ot(P,X,Z,8+R()*14,R,{kat:.8})});}
    isler.sort((a,b)=>b.z-a.z);
    for(const s of isler) s.ciz();
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.07,leke:.06});
    karanlik([[0,760,260,160,.32],[1000,760,260,160,.3]]);
  }
};
