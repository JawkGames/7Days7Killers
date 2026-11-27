// Kedili Nine'nin evi: köyün en eski evi, yıkılmaya yüz tutmuş. Badana dökülmüş, moloz taş görünüyor; bir kiriş
// sarkmış, altına dikme vurulmuş; tavanın bir yeri çökmüş. Arka duvarda bitişik barakaya açılan aralık kapı;
// önünde süt tasları. Solda eski sandık ve duvar dibinde ince döşek. Tek ışık: tavandaki çöküntüden inen gün ışığı.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,cokgen3,hat3,yol3,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,zemin,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {RENK_EV,odaDuvarlari,odaKenarlari,tavanCiz,bosluk,duvarBoslugu,huzme,yuzDoku,tabanGolgesi,
  sandik,yumusakKutu,nis,tas,sise} from './halil-evi.js';

const SOL=-260, SAG=250, ARKA=450, TAVAN=232, ON=60;
const DELIK={z:[350,410], x:[-70,40]};                 // tavanda çöküntü
const BARAKA={x0:108, x1:184, y1:164};                  // arka duvarda barakaya açılan kapı
const isik={konum:[-14,TAVAN+10,380], guc:2.2, menzil:300, ortam:.26};
const {tas:TAS, toprak:TOPRAK, ahsap:AHSAP}=RENK_EV;
const ESKI=[150,142,122], SUT=[214,210,196];
const sarkma=(x,z)=>Math.abs(x-60)<5?16*Math.sin(Math.PI*(z-ON)/(ARKA-ON)):0;

// Tavandaki çöküntü: kırık çubuklar, sarkan saz ve kökler; içinden aşırı pozlanmış gök
function cokuntu(P,R){
  const D=DELIK, n=Array.from({length:16},(_,i)=>{const a=i/16*TAU, f=.7+R()*.35; return [(D.x[0]+D.x[1])/2+Math.cos(a)*(D.x[1]-D.x[0])/2*f,TAVAN+2,(D.z[0]+D.z[1])/2+Math.sin(a)*(D.z[1]-D.z[0])/2*f];});
  tabana(); cokgen3(P,n.map(q=>[q[0]*1.12,q[1],(q[2]-380)*1.15+380]),[30,26,20]);   // kırık kenar: toprak kalınlığı
  cokgen3(P,n,[236,232,214]);
  const m=P.n(-14,TAVAN,380); leke(m[0],m[1],70,22,[255,255,250],.6);
  for(let i=0;i<22;i++){const q=n[(R()*n.length)|0], u=6+R()*22; hat3(P,[[q[0],q[1],q[2]],[q[0]+(R()-.5)*8,q[1]-u,q[2]+(R()-.5)*6]],[60,52,40],.8,1+R(),7200+i,1,.5);} // sarkan saz
  for(let i=0;i<5;i++){const z=D.z[0]+R()*(D.z[1]-D.z[0]), x=D.x[0]-10+R()*20; hat3(P,[[x,TAVAN,z],[x+30+R()*30,TAVAN-14-R()*20,z+(R()-.5)*20]],[70,60,44],.95,3,7230+i,1,.3);} // kırılıp sarkan çubuk
  titrek(()=>{n.forEach((q,i)=>{const s=P.n(...q); i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]);}); c.closePath();},MUREKKEP,.7,1.2,7240,2,1);
}

// Yere dökülmüş enkaz: sıva parçaları, toprak yığıntısı, saz
function enkaz(P,R){
  duzlemde(P,[-14,0,384],DUZLEM.zemin,()=>{leke(0,0,70,40,[150,140,116],.45); leke(10,6,40,22,[60,52,40],.35);});
  for(let i=0;i<60;i++){
    const a=R()*TAU, u=Math.sqrt(R())*60, X=-14+Math.cos(a)*u*1.3, Z=384+Math.sin(a)*u*.8, s=P.n(X,0,Z), o=P.olcek(X,0,Z), w=(1.5+R()*(i<14?7:3))*o, h=w*(.4+R()*.4);
    tabana(); leke(s[0]+w*.4,s[1]+h*.3,w*1.2,h*.8,[0,0,0],.45);
    c.fillStyle=rgba(golgele(R()<.5?ESKI:TAS,.7+R()*.5),1); c.beginPath(); c.moveTo(s[0]-w,s[1]); c.lineTo(s[0]-w*.3,s[1]-h*1.2); c.lineTo(s[0]+w*.8,s[1]-h*.8); c.lineTo(s[0]+w,s[1]+h*.2); c.closePath(); c.fill();
    if(i<14){c.strokeStyle='rgba(8,7,10,.6)'; c.lineWidth=.7; c.stroke();}
  }
  for(let i=0;i<30;i++){const X=-70+R()*120, Z=350+R()*70; hat3(P,[[X,0,Z],[X+(R()-.5)*20,0,Z+(R()-.5)*8]],[170,150,100],.5,.8,7260+i,1,.3);}
}

export default {
  id:'sultan-evi',
  kamera:{odak:720, yukseklik:155, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[60,0,236], yuzey:'toprak', alan:16},
    'zemin-orta': {duzlem:'zemin', konum:[-30,0,412], yuzey:'toprak', alan:8},
    'zemin-kose': {duzlem:'zemin', konum:[196,0,300], yuzey:'toprak', alan:6},
    'esik':       {duzlem:'zemin', konum:[146,0,ARKA-10], yuzey:'tas', alan:4},
    'duvar':      {duzlem:'arka', konum:[22,124,ARKA], yuzey:'siva', alan:5},
    'sandik-ustu':{duzlem:'ust', konum:[-168,54,404], yuzey:'tahta', alan:4},
    'tas-dibi':   {duzlem:'zemin', konum:[84,0,350], yuzey:'toprak', alan:5},
    'beden':      {duzlem:'zemin', konum:[-40,0,298], aci:.32, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(7207), B=BARAKA;
    c.fillStyle='#0b0c0a'; c.fillRect(0,0,1000,750);
    odaDuvarlari(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON,renk:ESKI,is:.45,catlak:10,
      yama:{arka:[[-196,-160,46,40],[50,-196,40,28],[214,-110,30,44],[-120,-34,40,20],[-10,-70,22,18]], sol:[[300,-110,46,50],[420,-190,30,30]], sag:[[-300,-150,40,50]]},
      delik:{arka:[bosluk(B.x0,B.x1,0,B.y1)]}});
    // nem ve akıntı: tavandan inen koyu izler
    for(let i=0;i<7;i++){const x=SOL+30+R()*(SAG-SOL-60), s0=P.n(x,TAVAN-4,ARKA), s1=P.n(x+(R()-.5)*20,TAVAN-60-R()*90,ARKA); tabana(); leke((s0[0]+s1[0])/2,(s0[1]+s1[1])/2,10+R()*14,Math.abs(s1[1]-s0[1])*.6,[0,0,0],.2);}
    tavanCiz(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,on:ON,y:TAVAN,kirisX:[-170,-50,60,180],sarkma,renk:[84,72,56],kirik:[[DELIK.z[0]-4,DELIK.z[1]+4]]});
    cokuntu(P,R);
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:7210,doku:1.2});
    odaKenarlari(P,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON});
    // çöküntünün altında güneş lekesi: keskin kenarlı, açık
    tabana(); c.save(); c.globalCompositeOperation='lighter';
    const lk=Array.from({length:16},(_,i)=>{const a=i/16*TAU, f=.75+R()*.3; return [-14+Math.cos(a)*68*f,0,392+Math.sin(a)*40*f];});
    for(const f of[1.15,1,.85]){c.beginPath(); yol3(P,lk.map(q=>[-14+(q[0]+14)*f,0,392+(q[2]-392)*f])); c.fillStyle='rgba(110,106,88,.32)'; c.fill();}
    c.restore();
    enkaz(P,R);
    // sarkan kirişin altına vurulmuş eğri dikme, ayağında taş
    { const z=410, yb=TAVAN-24-sarkma(60,z);
      kutu(P,isik,[48,74],[0,9],[z-12,z+12],TAS,7270,{cizgi:.5});
      kutu(P,isik,[53,67],[9,yb],[z-7,z+7],[96,80,58],7271,{cizgi:.7,ust:false});
      yuzDoku(P,[[53,9,z-7],[67,9,z-7],[67,yb,z-7],[53,yb,z-7]].map(q=>[q[0],q[1],q[2]]),R,{sik:3,alfa:.4,lek:2});
      hat3(P,[[53,yb*.6,z-7.5],[67,yb*.6+4,z-7.5]],[40,30,20],.8,2,7274,1,.3); // bağ teli
    }
    // barakaya açılan kapı: içerisi karanlık; tahta kanat içeri doğru aralık
    duvarBoslugu(P,isik,R,{duvar:'arka',duz:ARKA,a0:B.x0,a1:B.x1,y0:0,y1:B.y1,aydin:false,kalin:30,renk:ESKI});
    { const z0=ARKA-2, a=.95, L=B.x1-B.x0-4, x1=B.x1-2, xa=x1-L*Math.cos(a), za=z0-L*Math.sin(a);
      // aralıktan sızan ince ışık (barakanın deliklerinden)
      const ar=[[B.x0+2,2,ARKA+20],[B.x0+12,2,ARKA+20],[B.x0+12,B.y1-6,ARKA+20],[B.x0+2,B.y1-6,ARKA+20]]; cokgen3(P,ar,[120,116,96],.5);
      const kn=[[x1,1,z0],[xa,1,za],[xa,B.y1-3,za],[x1,B.y1-3,z0]];
      cokgen3(P,kn,golgele(AHSAP,.9));
      for(let i=1;i<5;i++){const f=i/5; hat3(P,[[x1-L*Math.cos(a)*f,2,z0-L*Math.sin(a)*f],[x1-L*Math.cos(a)*f,B.y1-4,z0-L*Math.sin(a)*f]],[30,24,18],.7,1,7280+i,1,.4);}
      yuzDoku(P,kn,R,{sik:8,alfa:.25,lek:5});
      for(const y of[24,B.y1-28]) hat3(P,[[x1,y,z0],[xa,y,za]],[50,40,30],.9,3.6*P.olcek(xa,y,za),7290+y,1,.2); // kuşak
      hat3(P,kn,MUREKKEP,.8,1.3,7295,2,.8,true);
      cokgen3(P,[[xa,1,za],[xa-1,1,za+3],[xa-1,B.y1-3,za+3],[xa,B.y1-3,za]],golgele(AHSAP,.5)); }
    // kapının önünde süt tasları: biri dolu, biri yarım, biri devrilmiş (dökülen süt)
    duzlemde(P,[160,0,392],DUZLEM.zemin,()=>{leke(-6,6,22,10,SUT,.5); leke(-14,10,10,5,SUT,.4);});
    tas(P,isik,96,0,396,{r:11,h:6,ic:golgele(SUT,.9),tohum:7300});
    tas(P,isik,128,0,412,{r:9,h:5,ic:golgele(SUT,.6),tohum:7301});
    tas(P,isik,150,0,380,{r:8,h:4,tohum:7302,renk:[120,110,96]});
    { const s=P.n(170,0,394), o=P.olcek(170,0,394); tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o); c.rotate(-.5);
      leke(2,1,12,5,[0,0,0],.5); c.beginPath(); c.ellipse(0,-5,5,9,0,0,TAU); c.fillStyle='rgb(60,56,48)'; c.fill(); c.beginPath(); c.ellipse(0,-5,3.6,7.4,0,0,TAU); c.fillStyle='rgb(150,146,130)'; c.fill(); titrek(()=>c.ellipse(0,-5,5,9,0,0,TAU),MUREKKEP,.7,.6,7303,1,.3); c.restore(); }
    tas(P,isik,186,0,420,{r:13,h:4,ic:[90,86,74],tohum:7304,renk:[130,122,104]}); // su tası
    // niş: içinde çatlak bakraç, şişe, bir yumak
    const nm=nis(P,isik,R,{duz:ARKA,x0:-100,x1:-36,y0:96,y1:156,derin:30,kemer:12,renk:ESKI});
    sise(P,nm[0]-14,nm[1],nm[2],{h:20,w:7,ton:.35,tohum:7310});
    tas(P,isik,nm[0]+12,nm[1],nm[2],{r:9,h:8,tohum:7311,renk:[110,92,70]});
    // eski sandık (solda), üstünde yırtık bir örtü katlı
    sandik(P,isik,R,-168,404,{en:100,boy:46,h:54,eski:1,renk:[96,82,62],tohum:7320});
    yumusakKutu(P,isik,R,[-208,-148],[54,60],[388,420],[98,86,78],7321,{yuvarlak:.35,cizgi:.6});
    // duvar dibinde ince döşek
    yumusakKutu(P,isik,R,[-258,-196],[0,9],[236,372],[118,106,90],7330,{yuvarlak:.15});
    // duvara dayalı değnek
    hat3(P,[[-108,0,ARKA-8],[-96,128,ARKA-2]],[96,80,58],.95,3.2,7340,1,.2); hat3(P,[[-96,128,ARKA-2],[-88,134,ARKA-2],[-86,126,ARKA-2]],[96,80,58],.95,3.2,7341,1,.2);
    hat3(P,[[-110,0,ARKA-8],[-98,128,ARKA-2]],MUREKKEP,.6,1,7342,1,.4);
    // köşede örümcek ağı
    { const k=P.n(SOL,TAVAN-2,ARKA); tabana(); for(let i=0;i<6;i++){const a=.1+i*.25; c.strokeStyle='rgba(200,196,180,.25)'; c.lineWidth=.5; c.beginPath(); c.moveTo(k[0],k[1]); c.lineTo(k[0]+Math.cos(a)*60,k[1]+Math.sin(a)*60); c.stroke();} for(let j=1;j<4;j++){c.beginPath(); for(let i=0;i<6;i++){const a=.1+i*.25; c[i?'lineTo':'moveTo'](k[0]+Math.cos(a)*j*16,k[1]+Math.sin(a)*j*16+2);} c.stroke();} }
    // sağ önde çalı çırpı yığını (ocak için toplanmış)
    tabanGolgesi(P,isik,110,220,240,290,.55);
    for(let i=0;i<34;i++){const x=120+R()*80, z=246+R()*36, a=(R()-.5)*.5, u=40+R()*40, h=R()*14;
      const p0=[x-Math.cos(a)*u/2,h,z-Math.sin(a)*u/2], p1=[x+Math.cos(a)*u/2,h+R()*6,z+Math.sin(a)*u/2];
      hat3(P,[p0,p1],golgele(AHSAP,.5+R()*.7),.95,(2+R()*2.5)*P.olcek(x,0,z),7350+i,1,.2);
      if(i%3===0) hat3(P,[p0,p1],MUREKKEP,.4,.7,7400+i,1,.5);}
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.09,leke:.1});
    const D=DELIK; huzme(P,r,[[D.x[0],TAVAN,D.z[0]],[D.x[1],TAVAN,D.z[0]],[D.x[1]+20,0,D.z[0]-10],[D.x[0]-40,0,D.z[0]-10],[D.x[0]-30,0,D.z[1]+10],[D.x[0],TAVAN,D.z[1]]],[-14,TAVAN,380],[-14,0,390],.2,220);
    karanlik([[1000,520,260,320,.55],[0,560,200,260,.45],[1000,60,260,180,.5],[0,60,220,170,.45],[1000,740,300,140,.45],[0,750,260,120,.4]]);
  }
};
