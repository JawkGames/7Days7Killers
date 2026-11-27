// Ağıl: köyün dışında, kuru taş duvarlarla çevrili koyun ağılı; duvarların üstü hayvan aşmasın diye dikenli çalıyla
// örtülü. Arka duvarda dikenli çalıdan bağlanmış kapı, solda uzun taş yalak, sağ köşede taş duvarlı, dalla örtülü çoban
// barınağı. Zemin ezilmiş çamur: toynak izleri, koyun pisliği, gökyüzünü yansıtan birikintiler.
// Tek ışık: kapalı gök (yukarıdan, biraz soldan). Çamur ıslak ve koyu ama birikintiler ve kuru yerler açık.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba,lerp} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,yol3,golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,tasOrgu,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';
import {gokIsigi,gokCiz,sirt,agac,kaya,kuruDuvar,kirZemin,ot,cali,prizma} from '../dis-yardim.js';

const isik=gokIsigi();
const TAS=[180,172,150], CAMUR=[128,116,94], KURU=[166,154,128];
const ARKA_Z=1000, KAPI={x:[-40,72]}, SOL_X=-430;
const YALAK={x:[-250,-40], z:[600,648], h:42};
const BARINAK={x:[230,600], z:[760,ARKA_Z], h:136, kapi:[320,410]};

// Duvar üstüne yığılmış dikenli çalı: koyu, kabarık, uçları dışarı taşan
function dikenliTepe(P,A,B,h,R,{kalin=60}={}){
  const L=Math.hypot(B[0]-A[0],B[1]-A[1]), n=Math.ceil(L/14);
  for(let i=0;i<n;i++){const t=(i+R())/n, X=lerp(A[0],B[0],t), Z=lerp(A[1],B[1],t)+(R()-.5)*kalin*.5, s=P.n(X,h+6,Z), o=P.olcek(X,h,Z), w=(14+R()*14)*o, hh=(8+R()*12)*o;
    c.fillStyle=rgba(golgele([62,60,50],.6+R()*.6),.55); c.beginPath(); c.ellipse(s[0],s[1]-hh*.3,w*.8,hh*.7,0,0,TAU); c.fill();
    for(let k=0;k<7;k++){const a=-Math.PI/2+(R()-.5)*2.6, l=(10+R()*22)*o; titrek(()=>{let px=s[0], py=s[1]-hh*.4; c.moveTo(px,py); for(let m=0;m<3;m++){px+=Math.cos(a+(m%2?.5:-.5))*l*.4; py+=Math.sin(a+(m%2?.5:-.5))*l*.4; c.lineTo(px,py);}},[30,28,22],.7,Math.max(.6,1.1*o),(R()*1e5)|0,1,.4);}
  }
}

// Çalı kapı: iki direk arasında bağlanmış dikenli dal demeti, biraz yana yatık
function caliKapi(P,R){
  const z=ARKA_Z-34, x0=KAPI.x[0], x1=KAPI.x[1];
  cokgen3(P,[[x0,0,ARKA_Z+40],[x1,0,ARKA_Z+40],[x1,150,ARKA_Z+40],[x0,150,ARKA_Z+40]],[150,148,132]); // aralıktan görünen dışarı
  for(const x of[x0+4,x1-4]){const a=P.n(x,0,z), b=P.n(x,150,z), o=P.olcek(x,70,z); c.strokeStyle='rgb(80,68,52)'; c.lineWidth=9*o; c.lineCap='round'; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); c.strokeStyle='rgba(160,144,112,.6)'; c.lineWidth=2.5*o; c.beginPath(); c.moveTo(a[0]-2.5*o,a[1]); c.lineTo(b[0]-2.5*o,b[1]); c.stroke();}
  duzlemde(P,[(x0+x1)/2,0,z-4],DUZLEM.zemin,()=>leke(0,0,70,16,[0,0,0],.5));
  // demet: dallar çoğunlukla yatay ve çapraz
  for(let i=0;i<120;i++){const y=6+R()*130, xa=x0+R()*30-10, xb=x1-R()*30+10, ya=y+(R()-.5)*40, A=P.n(xa,ya,z-6+R()*6), B=P.n(xb,y+(R()-.5)*40,z-6+R()*6), o=P.olcek(x0,y,z);
    c.strokeStyle=rgba(golgele([70,62,48],.5+R()*.8),.85); c.lineWidth=(.8+R()*1.6)*o; c.beginPath(); c.moveTo(A[0],A[1]); c.quadraticCurveTo((A[0]+B[0])/2+(R()-.5)*10,(A[1]+B[1])/2+(R()-.5)*10,B[0],B[1]); c.stroke();
    if(R()<.5){const m=[lerp(A[0],B[0],R()),lerp(A[1],B[1],R())]; c.lineWidth=.7*o; c.beginPath(); c.moveTo(m[0],m[1]); c.lineTo(m[0]+(R()-.5)*14*o,m[1]-(3+R()*8)*o); c.stroke();}}
  for(const y of[40,110]) hat3(P,[[x0-6,y,z-8],[x1+6,y+6,z-8]],[60,52,40],.9,3,700+y,1,.3); // bağlama sırıkları
  const s=P.n((x0+x1)/2,70,z); leke(s[0],s[1],60,70,[0,0,0],.25);
}

// Çoban barınağı: alçak kuru taş duvar, dal ve topraktan eğik dam, karanlık ağız
function barinak(P,R){
  const B=BARINAK, k=B.kapi;
  // kapı ağzının ardı: karanlık iç
  cokgen3(P,[[k[0],0,B.z[0]+40],[k[1],0,B.z[0]+40],[k[1],B.h,B.z[0]+40],[k[0],B.h,B.z[0]+40]],[20,20,17]);
  cokgen3(P,[[k[0],0,B.z[0]],[k[0],0,B.z[0]+40],[k[0],B.h-8,B.z[0]+40],[k[0],B.h-8,B.z[0]]],[60,58,48]);
  kuruDuvar(P,isik,[B.x[0],B.z[1]],[B.x[0],B.z[0]],{h:B.h,kalin:50,renk:TAS,R,sira:13,ust:false});
  kuruDuvar(P,isik,[B.x[0]-25,B.z[0]],[k[0],B.z[0]],{h:B.h,kalin:46,renk:TAS,R,sira:13,ust:false});
  kuruDuvar(P,isik,[k[1],B.z[0]],[B.x[1]+300,B.z[0]],{h:B.h,kalin:46,renk:TAS,R,sira:13,ust:false});
  // kapı lentosu: kalın ağaç
  hat3(P,[[k[0]-20,B.h-4,B.z[0]-24],[k[1]+20,B.h-4,B.z[0]-24]],[74,62,46],1,8*P.olcek(k[0],B.h,B.z[0]),762,1,0);
  // dam: önde sarkan dal saçağı, üstünde toprak
  const on=B.z[0]-36, x0=B.x[0]-40, x1=B.x[1]+300;
  cokgen3(P,[[x0,B.h+2,on],[x1,B.h-6,on],[x1,B.h+26,on+60],[x0,B.h+34,on+60]],[66,60,48]);
  for(let i=0;i<220;i++){const X=lerp(x0,x1,R()), y=B.h+R()*10, a=P.n(X,y,on), o=P.olcek(X,y,on), l=(10+R()*34)*o, aa=Math.PI/2+(R()-.5)*1.0;
    c.strokeStyle=rgba(golgele([72,64,50],.35+R()*.9),.9); c.lineWidth=(.7+R()*1.5)*o; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(a[0]+Math.cos(aa)*l*.4,a[1]+Math.sin(aa)*l); c.stroke();}
  for(let i=0;i<50;i++){const X=lerp(x0,x1,R()), a=P.n(X,B.h+28,on+40), o=P.olcek(X,B.h,on); leke(a[0],a[1],(14+R()*20)*o,(4+R()*6)*o,[110,100,82],.5);}
  hat3(P,[[x0,B.h+2,on],[x1,B.h-6,on]],MUREKKEP,.55,1.2,760,2,1);
  kaya(P,isik,(k[0]+k[1])/2,B.z[0]-20,{en:80,boy:10,derin:30,renk:TAS,tohum:761,nA:8,nK:2}); // eşik taşı
}

export default {
  id:'agil',
  kamera:{odak:800, yukseklik:155, egim:.15},
  isik,
  yuvalar:{
    'zemin-on':     {duzlem:'zemin', konum:[110,0,320], yuzey:'camur', alan:14},
    'zemin-orta':   {duzlem:'zemin', konum:[170,0,560], yuzey:'camur', alan:12},
    'zemin-kose':   {duzlem:'zemin', konum:[-330,0,880], yuzey:'toprak', alan:8},
    'yalak-kenari': {duzlem:'ust', konum:[-90,YALAK.h,YALAK.z[0]+5], yuzey:'tas', alan:5, aci:0},
    'kapi-onu':     {duzlem:'zemin', konum:[(KAPI.x[0]+KAPI.x[1])/2,0,ARKA_Z-90], yuzey:'camur', alan:10},
    'duvar':        {duzlem:'arka', konum:[-170,82,ARKA_Z-30], yuzey:'tas', alan:16, uygunsuz:['saat']},
    'barinak-onu':  {duzlem:'zemin', konum:[(BARINAK.kapi[0]+BARINAK.kapi[1])/2,0,BARINAK.z[0]-80], yuzey:'toprak', alan:8},
    'beden':        {duzlem:'zemin', konum:[-50,0,440], aci:-.28, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(1907), Y=YALAK;
    gokCiz(P,R);
    sirt(P,{z:14000,h:1200,renk:[150,150,138],yogun:5200,tohum:71,sisAlt:.6,cizgi:.15});
    sirt(P,{z:5000,h:460,taban:-40,renk:[130,124,102],yogun:4600,tohum:72,nokta:80,teras:3,sisAlt:.5});
    agac(P,isik,-900,2600,{tur:'citlembik',boy:620,en:640,yogun:4000,tohum:73,golge:0});
    kirZemin(P,isik,{x:[-2400,2400],z:[ARKA_Z,6000],renk:[150,140,112],R,yogun:4600,tohum:701,cakil:40});
    // ağılın içi: ezilmiş çamur
    kirZemin(P,isik,{x:[SOL_X,1400],z:[200,ARKA_Z],renk:CAMUR,R,yogun:6000,tohum:702,cakil:60,doku:1.4});
    // kuru yerler (açık), birikintiler (gök yansır)
    for(let i=0;i<26;i++){const X=SOL_X+R()*1500, Z=260+R()*700, s=P.n(X,0,Z), o=P.olcek(X,0,Z); leke(s[0],s[1],(40+R()*90)*o,(10+R()*20)*o,KURU,.18+R()*.15);}
    for(const [x,z,rx,rz] of [[260,420,60,22],[-220,800,50,16],[40,760,34,12],[330,700,26,10],[-330,360,40,14]]){
      const n=Array.from({length:14},(_,i)=>{const t=i/14*TAU, w=.65+R()*.5; return [x+Math.cos(t)*rx*w,0,z+Math.sin(t)*rz*w];});
      const s=P.n(x,0,z), o=P.olcek(x,0,z); leke(s[0],s[1],rx*1.5*o,rz*1.2*o*.4,[0,0,0],.4);
      c.save(); c.beginPath(); yol3(P,n); c.fillStyle='rgba(150,152,142,.8)'; c.fill(); c.clip(); leke(s[0]-rx*.3*o,s[1],rx*.8*o,rz*.4*o,[205,206,196],.45); tara(s[0]-rx*o,s[1]-rz*o,s[0]+rx*o,s[1]+rz*o,0,2.4,[30,30,26],.25,(x+z)|0,.5); c.restore();
      titrek(()=>yol3(P,n),[20,20,16],.45,1,(x*3+z)|0,1,.4);}
    // toynak izleri ve koyun pisliği
    for(let i=0;i<500;i++){const X=SOL_X+20+R()*1400, Z=240+Math.pow(R(),.8)*740, s=P.n(X,0,Z), o=P.olcek(X,0,Z); if(s[0]<-5||s[0]>1005) continue;
      for(const d of[-1.6,1.6]){c.fillStyle='rgba(20,18,14,.45)'; c.beginPath(); c.ellipse(s[0]+d*o,s[1],1.4*o,2.1*o*.45,0,0,TAU); c.fill();}
      c.fillStyle='rgba(210,204,186,.25)'; c.fillRect(s[0]-2*o,s[1]-1.2*o,4*o,.6*o);}
    for(let i=0;i<70;i++){const X=SOL_X+40+R()*1300, Z=250+R()*700; for(let k=0;k<4+R()*10;k++){const s=P.n(X+(R()-.5)*30,0,Z+(R()-.5)*20), o=P.olcek(X,0,Z); c.fillStyle='rgba(16,14,12,.85)'; c.beginPath(); c.ellipse(s[0],s[1],1.3*o,.8*o,0,0,TAU); c.fill(); c.fillStyle='rgba(200,196,180,.4)'; c.fillRect(s[0]-.5*o,s[1]-.7*o,.6*o,.3*o);}}
    // saman çöpleri (yemlikten dağılmış)
    for(let i=0;i<260;i++){const X=SOL_X+R()*1200, Z=260+R()*700, s=P.n(X,0,Z), o=P.olcek(X,0,Z), a=R()*TAU, l=(3+R()*7)*o; c.strokeStyle=`rgba(${R()<.7?'214,200,156':'50,44,32'},${.3+R()*.3})`; c.lineWidth=Math.max(.5,.7*o); c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+Math.cos(a)*l,s[1]+Math.sin(a)*l*.35); c.stroke();}
    // arka duvar (kapı aralığıyla) ve sol duvar; üstleri dikenli çalı
    kuruDuvar(P,isik,[-1400,ARKA_Z],[KAPI.x[0],ARKA_Z],{h:150,kalin:60,renk:TAS,R,sira:15});
    kuruDuvar(P,isik,[KAPI.x[1],ARKA_Z],[1400,ARKA_Z],{h:150,kalin:60,renk:TAS,R,sira:15});
    dikenliTepe(P,[-1400,ARKA_Z],[KAPI.x[0],ARKA_Z],150,R);
    dikenliTepe(P,[KAPI.x[1],ARKA_Z],[1400,ARKA_Z],150,R);
    caliKapi(P,R);
    barinak(P,R);
    kuruDuvar(P,isik,[SOL_X,ARKA_Z],[SOL_X,180],{h:150,kalin:60,renk:TAS,R,sira:15});
    dikenliTepe(P,[SOL_X,ARKA_Z],[SOL_X,180],150,R);
    // duvar dibinde çamur sıçrantısı
    { const a=P.n(-1400,0,ARKA_Z-30), b=P.n(1400,0,ARKA_Z-30); const g=c.createLinearGradient(0,a[1]-30,0,a[1]); g.addColorStop(0,'rgba(40,36,28,0)'); g.addColorStop(1,'rgba(40,36,28,.45)'); c.fillStyle=g; c.fillRect(Math.min(a[0],b[0]),a[1]-30,Math.abs(b[0]-a[0]),30); }
    // yalak: uzun taş tekne, içi su; dibi çamur, çevresi ıslak
    duzlemde(P,[(Y.x[0]+Y.x[1])/2,0,Y.z[0]-10],DUZLEM.zemin,()=>{leke(0,0,150,40,[0,0,0],.4); leke(20,-10,120,30,[20,20,16],.3);});
    prizma(P,isik,[[Y.x[0]-Y.x[0],0],[Y.x[1]-Y.x[0],0],[Y.x[1]-Y.x[0]+2,Y.h],[-2,Y.h]],Y.z[1]-Y.z[0],{O:[Y.x[0],0,Y.z[0]]},TAS,770,{cizgi:.7,doku:16});
    tasOrgu(P,isik,[0,0,Y.z[0]],DUZLEM.arka,[Y.x[0],Y.x[1],-Y.h,0],TAS,R,{sira:11,duzensiz:.4,harc:[90,86,72]});
    const su=[[Y.x[0]+9,Y.h-6,Y.z[0]+9],[Y.x[1]-9,Y.h-6,Y.z[0]+9],[Y.x[1]-9,Y.h-6,Y.z[1]-7],[Y.x[0]+9,Y.h-6,Y.z[1]-7]];
    cokgen3(P,su,[60,62,56]); c.save(); c.beginPath(); yol3(P,su); c.clip(); const sm=P.n((Y.x[0]+Y.x[1])/2,Y.h-6,Y.z[0]+20); leke(sm[0]-20,sm[1],100,6,[220,222,212],.5); c.restore();
    hat3(P,su,MUREKKEP,.6,1.1,771,2,1,true);
    // ön plan: duvardan düşmüş taşlar, kuru ot öbekleri, çalı parçası
    kaya(P,isik,-260,300,{en:44,boy:20,derin:30,renk:TAS,tohum:780,nA:8,nK:3});
    kaya(P,isik,330,270,{en:36,boy:16,derin:26,renk:TAS,tohum:781,nA:8,nK:3});
    cali(P,isik,-380,620,{en:80,boy:40,tohum:782,renk:[86,84,66]});
    for(let i=0;i<40;i++){const Z=240+R()*120, X=(R()-.5)*420; ot(P,X,Z,6+R()*8,R,{kat:.7});}
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.07,leke:.06});
    karanlik([[0,760,260,150,.3],[1000,760,260,150,.3]]);
  }
};
