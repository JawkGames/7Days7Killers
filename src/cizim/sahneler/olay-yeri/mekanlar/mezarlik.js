// Mezarlık: köyün dışında, kuru otlu yamaçta sıra sıra eğri büğrü mezar taşları; taş çerçeveli toprak tümsekler, ortada
// kesme taş sanduka, sağda yeni kazılmış bir mezar. Arkada kuru taş sınır duvarı, ardında bir çitlembik ve iki servi.
// Tek ışık: kapalı gök (yukarıdan, biraz soldan). Taşların ön yüzü okunur, gölgeler kısa ve yumuşak.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {gokIsigi,gokCiz,sirt,agac,prizma,kaya,kuruDuvar,kirZemin,ot,cali} from './harman-yeri.js';

const isik=gokIsigi({konum:[-1700,2500,-700]});
const KIRECTASI=[198,192,172], TOPRAK=[150,138,114], TAZE=[104,92,74], KURU=[178,170,148];
const DUVAR_Z=1150;
const SANDUKA={O:[-250,0,640], yaw:.08, boy:200, en:84, h:46};
const BUYUK={O:[196,0,566]};                    // yuvası olan dik baş taşı (ön yüzü makineye bakar)
const TAZE_M={x:360,z:760};

// Mezar taşı profilleri (x sağ, y yukarı, cm)
function profil(tur,w,h,R){
  const j=()=>(R()-.5)*w*.12;
  if(tur==='sivri') return [[-w,0],[w,0],[w+j(),h*.78],[w*.3,h*.95],[0,h],[-w*.3,h*.95],[-w+j(),h*.78]];
  if(tur==='yuvarlak'){const n=[[-w,0],[w,0]]; for(let i=0;i<=8;i++){const a=i/8*Math.PI; n.push([Math.cos(a)*w,h-w*.9+Math.sin(a)*w*.9]);} return n;}
  if(tur==='sarikli') return [[-w,0],[w,0],[w*.9,h*.62],[w*.55,h*.68],[w*.95,h*.76],[w*1.05,h*.88],[w*.6,h*.99],[-w*.6,h*.99],[-w*1.05,h*.88],[-w*.95,h*.76],[-w*.55,h*.68],[-w*.9,h*.62]];
  // kaba: işlenmemiş tarla taşı
  return [[-w,0],[w*.9,0],[w+j()*2,h*.4],[w*.7+j(),h*.85],[w*.1,h],[-w*.5+j(),h*.92],[-w-j(),h*.5]];
}

// Baş (ve ayak) taşı: eğik prizma, ön yüzünde okunmaz kazıma, dibinde toprak
function tas(P,X,Z,{tur='sivri',w=18,h=70,kalin=11,yaw=0,egX=0,egZ=0,tohum=1,yazi=true,renk=KIRECTASI}={}){
  const R=rng(tohum);
  duzlemde(P,[X,0,Z+kalin/2],DUZLEM.zemin,()=>{leke(0,0,w*1.6,kalin*1.8,[0,0,0],.45); leke(4,-4,w*1.1,kalin*1.2,[0,0,0],.3);});
  const T=prizma(P,isik,profil(tur,w,h,R),kalin,{O:[X,0,Z],yaw,egX,egZ},renk,tohum,{cizgi:.65,doku:8});
  duzlemde(P,T.O,T.D,()=>{
    // yosun ve kir: dipte koyu, yağmur izi aşağı iner
    c.save(); c.beginPath(); profil(tur,w,h,rng(tohum)).forEach((q,i)=>i?c.lineTo(q[0],-q[1]):c.moveTo(q[0],-q[1])); c.closePath(); c.clip();
    leke(0,-4,w*1.3,h*.25,[30,30,22],.35);
    for(let i=0;i<4;i++){const x=(R()-.5)*w*1.5; leke(x,-h*(.3+R()*.4),2+R()*3,h*.3,[20,20,14],.12);}
    if(yazi&&h>50) for(let i=0;i<Math.min(5,(h-30)/12|0);i++){const y=-h*.72+i*10, x0=-w*.65;
      titrek(()=>{c.moveTo(x0,y); for(let k=0;k<10;k++) c.quadraticCurveTo(x0+k*w*.13+w*.06,y-2-R()*4,x0+(k+1)*w*.13,y+(R()-.5)*1.5);},[40,38,30],.45,.9,tohum*13+i,1,.5);}
    c.restore();
  });
  return T;
}

// Toprak tümsek: alçak, uzun; çevresi yere gömülü taşlarla çerçeveli
function tumsek(P,X,Z,{boy=180,en=70,h=24,taze=false,tohum=1}={}){
  const R=rng(tohum), cerceve=[];
  if(!taze) for(let i=0;i<22;i++){const t=i/22*TAU, x=X+Math.cos(t)*boy*.55, z=Z+Math.sin(t)*en*.62; cerceve.push([x,z,R()]);}
  const tasCiz=q=>kaya(P,isik,q[0],q[1],{en:18+q[2]*12,boy:9+q[2]*8,derin:14+q[2]*6,renk:KURU,tohum:tohum*40+(q[0]|0),nA:6,nK:2,cizgi:.35,catlak:0});
  cerceve.filter(q=>q[1]>Z).sort((a,b)=>b[1]-a[1]).forEach(tasCiz);
  kaya(P,isik,X,Z,{en:boy,boy:h,derin:en,renk:taze?TAZE:TOPRAK,tohum,nA:20,nK:4,puruz:.2,cizgi:taze?.4:.25,catlak:0,duz:true,us:.45});
  const s=P.n(X,h,Z), o=P.olcek(X,h,Z);
  if(taze){ // yeni kazılmış: iri kesekler, kürek izi
    for(let i=0;i<40;i++){const x=X+(R()-.5)*boy*.9, z=Z+(R()-.5)*en*.8, p=P.n(x,h*.7,z), rr=(2+R()*5)*o; leke(p[0]+rr*.3,p[1]+rr*.4,rr*1.3,rr*.6,[0,0,0],.45); c.fillStyle=rgba(golgele(TAZE,.8+R()*.6),1); c.beginPath(); c.ellipse(p[0],p[1],rr,rr*.6,0,0,TAU); c.fill();}
  }else{
    for(let i=0;i<10;i++) ot(P,X+(R()-.5)*boy*.8,Z+(R()-.5)*en*.6,10+R()*12,R,{y:h*.6});
  }
  cerceve.filter(q=>q[1]<=Z).sort((a,b)=>b[1]-a[1]).forEach(tasCiz);
  void s;
}

// Sandukanın baş ucunda, kapağın üstüne dikilmiş sarıklı taş
function tasUstte(P,X,Y,Z){
  prizma(P,isik,profil('sarikli',13,58,rng(550)),12,{O:[X,Y,Z],yaw:SANDUKA.yaw+1.5,egZ:.05},KIRECTASI,550,{cizgi:.7,doku:8});
}

// Sanduka: kesme taştan yükseltilmiş mezar; üstü düz kapak, baş ucunda sarıklı taş
function sanduka(P,R){
  const S=SANDUKA, w=S.boy/2, d=S.en;
  duzlemde(P,[S.O[0],0,S.O[2]+d/2],DUZLEM.zemin,()=>{c.rotate(-S.yaw); leke(4,0,w*1.15,d*.75,[0,0,0],.45);});
  const govde=prizma(P,isik,[[-w,0],[w,0],[w,S.h],[-w,S.h]],d,{O:S.O,yaw:S.yaw},KIRECTASI,501,{cizgi:.7,doku:14});
  // kesme taş derzleri (ön yüz)
  duzlemde(P,govde.O,govde.D,()=>{for(let x=-w+40+R()*10;x<w-10;x+=44+R()*12) titrek(()=>{c.moveTo(x,0); c.lineTo(x+(R()-.5)*2,-S.h);},MUREKKEP,.4,1,520+x|0,1,.5); titrek(()=>{c.moveTo(-w,-S.h*.5); c.lineTo(w,-S.h*.5);},MUREKKEP,.3,.9,530,1,.5);});
  // kapak: biraz taşan, kenarı pahlı
  const kap=prizma(P,isik,[[-w-6,0],[w+6,0],[w+3,8],[-w-3,8]],d+12,{O:[S.O[0]-6*Math.sin(S.yaw),S.h,S.O[2]-6],yaw:S.yaw},golgele(KIRECTASI,1.04),540,{cizgi:.7,doku:10});
  void kap;
  tasUstte(P,S.O[0]-w*Math.cos(S.yaw)+16,S.h+8,S.O[2]+d*.5+w*Math.sin(S.yaw));
}

export default {
  id:'mezarlik',
  kamera:{odak:820, yukseklik:155, egim:.14},
  isik,
  yuvalar:{
    'zemin-on':     {duzlem:'zemin', konum:[110,0,318], yuzey:'toprak', alan:16},
    'zemin-orta':   {duzlem:'zemin', konum:[40,0,600], yuzey:'toprak', alan:10},
    'zemin-kose':   {duzlem:'zemin', konum:[270,0,930], yuzey:'toprak', alan:6},
    'sanduka-ustu': {duzlem:'ust', konum:[-262,SANDUKA.h+8,620], yuzey:'tas', alan:12, aci:SANDUKA.yaw},
    'mezar-tasi':   {duzlem:'arka', konum:[BUYUK.O[0],62,BUYUK.O[2]], yuzey:'tas', alan:3, uygunsuz:['civi']},
    'taze-mezar':   {duzlem:'zemin', konum:[TAZE_M.x-30,0,TAZE_M.z-80], yuzey:'toprak', alan:10},
    'duvar':        {duzlem:'arka', konum:[150,72,DUVAR_Z-30], yuzey:'tas', alan:20, uygunsuz:['saat']},
    'beden':        {duzlem:'zemin', konum:[-70,0,440], aci:.1, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(6113);
    gokCiz(P,R);
    sirt(P,{z:14000,h:1100,renk:[150,150,138],yogun:5200,tohum:21,sisAlt:.6,cizgi:.15});
    sirt(P,{z:5200,h:300,taban:-40,renk:[128,124,104],yogun:4600,tohum:22,nokta:90,teras:3,sisAlt:.5});
    // duvarın ardındaki ağaçlar: çitlembik ve serviler (yalnız karaltı ve birkaç dal)
    agac(P,isik,-520,2100,{tur:'citlembik',boy:720,en:760,yogun:4000,tohum:31,golge:.25});
    agac(P,isik,520,1520,{tur:'servi',boy:820,en:150,yogun:4600,tohum:32,golge:.2});
    agac(P,isik,700,1700,{tur:'servi',boy:640,en:120,yogun:4600,tohum:33,golge:.15});
    agac(P,isik,-900,1800,{tur:'servi',boy:700,en:130,yogun:4600,tohum:34,golge:.15});
    kirZemin(P,isik,{x:[-2400,2400],z:[200,6000],renk:[150,140,112],R,yogun:4600,tohum:611,cakil:90});
    // sınır duvarı (kuru taş, üstü kapak taşlı)
    kuruDuvar(P,isik,[-1400,DUVAR_Z+60],[1400,DUVAR_Z-40],{h:118,kalin:60,renk:[176,170,150],R,sira:16});
    // kuru ot: yamaç boyunca, yakında seyrek ve iri, uzakta sık ve küçük
    const otlar=[]; for(let i=0;i<300;i++){const Z=250+Math.pow(R(),.8)*850, X=(R()-.5)*(Z*1.4+200); otlar.push([X,Z]);}
    // mezarlar: uzaktan yakına (her biri tümsek + baş taşı + ayak taşı)
    const M=[
      [-560,1040,'kaba'],[-330,1010,'sivri'],[-90,1050,'yuvarlak'],[150,1000,'kaba'],[400,1030,'sivri'],[620,990,'yuvarlak'],
      [-470,860,'yuvarlak'],[-180,880,'kaba'],[120,850,'sivri'],[560,880,'kaba'],
      [-520,700,'sivri'],[480,560,'kaba'],[-420,470,'yuvarlak'],[340,400,'sivri']
    ];
    const isler=[];
    for(const [i,[x,z,t]] of M.entries()){
      isler.push({z:z+30,ciz:()=>{
        const Rr=rng(700+i), egX=(Rr()-.5)*.36, egZ=(Rr()-.5)*.34, h=48+Rr()*44, w=14+Rr()*8;
        tumsek(P,x,z,{boy:170+Rr()*30,en:62+Rr()*14,h:18+Rr()*10,tohum:710+i});
        tas(P,x-95,z,{tur:t,w,h,kalin:10,yaw:(Rr()-.5)*.3,egX,egZ,tohum:720+i});
        if(Rr()<.7) tas(P,x+92,z+6,{tur:'kaba',w:w*.7,h:h*.45,kalin:9,yaw:(Rr()-.5)*.4,egX:(Rr()-.5)*.4,egZ:(Rr()-.5)*.4,tohum:760+i,yazi:false});
      }});
    }
    isler.push({z:SANDUKA.O[2]+SANDUKA.en/2,ciz:()=>sanduka(P,R)});
    isler.push({z:TAZE_M.z,ciz:()=>{tumsek(P,TAZE_M.x,TAZE_M.z,{boy:190,en:80,h:30,taze:true,tohum:801});
      tas(P,TAZE_M.x-104,TAZE_M.z+2,{tur:'kaba',w:14,h:44,kalin:10,egX:-.06,egZ:.1,tohum:802,yazi:false});
      // kürek: tümseğe saplı ağaç sap, toprağa gömülü demir ağız
      const a=P.n(TAZE_M.x+60,26,TAZE_M.z-12), b=P.n(TAZE_M.x+86,150,TAZE_M.z+20), o=P.olcek(TAZE_M.x+70,60,TAZE_M.z);
      titrek(()=>{c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},[92,78,58],1,4*o,803,1,0); titrek(()=>{c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]);},MUREKKEP,.5,1,804,2,.6);
      c.fillStyle='rgba(60,60,56,1)'; c.beginPath(); c.moveTo(a[0]-9*o,a[1]+2*o); c.lineTo(a[0]+9*o,a[1]); c.lineTo(a[0]+7*o,a[1]+8*o); c.lineTo(a[0]-6*o,a[1]+9*o); c.closePath(); c.fill();
    }});
    isler.push({z:BUYUK.O[2]+10,ciz:()=>tas(P,BUYUK.O[0],BUYUK.O[2],{tur:'sivri',w:27,h:112,kalin:15,tohum:901})});
    // önde yıkılmış eski bir taş, yarısı otta
    isler.push({z:330,ciz:()=>{const T=prizma(P,isik,profil('yuvarlak',17,70,rng(950)),11,{O:[-150,0,300],yaw:1.2,egX:-1.5},golgele(KIRECTASI,.95),951,{cizgi:.6,doku:8}); void T;
      for(let i=0;i<14;i++) ot(P,-150+(R()-.5)*90,270+R()*40,8+R()*12,R);}});
    for(const [X,Z] of otlar) isler.push({z:Z,ciz:()=>ot(P,X,Z,8+R()*12,R,{kat:.7})});
    isler.push({z:980,ciz:()=>cali(P,isik,-640,980,{en:110,boy:60,tohum:961})});
    isler.push({z:760,ciz:()=>cali(P,isik,700,760,{en:120,boy:70,tohum:962})});
    isler.sort((a,b)=>b.z-a.z);
    for(const s of isler) s.ciz();
    // ön planda kuru ot ve taş kırıkları (alt kenar boş kalmasın)
    for(let i=0;i<26;i++){const Z=236+R()*50, X=(R()-.5)*380; ot(P,X,Z,7+R()*9,R,{kat:.7});}
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.07,leke:.06});
    karanlik([[0,760,240,140,.3],[1000,760,240,140,.3],[0,0,300,200,.15]]);
  }
};
