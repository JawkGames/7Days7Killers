// Fıstıklık: kırmızı, taşlı toprakta sıra sıra alçak, budaklı fıstık ağaçları; iki sıranın arasından uzağa bakılır.
// Solda tarlayı sınırlayan kuru taş duvar derine uzanır, ortada yontulmamış sınır taşı. Uzakta fıstık benekli taraçalı yamaç.
// Tek ışık: kapalı gök (yukarıdan, biraz soldan). Ağaçların altında yumuşak gölge, sürülmüş toprakta sıra izleri.
import {c} from '../../../teknik/tuval.js';
import {rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,titrek} from '../mekan-yardim.js';
import {gokIsigi,gokCiz,sirt,agac,prizma,kaya,kuruDuvar,kirZemin,ot,cali} from './harman-yeri.js';

const isik=gokIsigi({konum:[1200,2600,-900]}); // sağdan: soldaki duvarın yüzü ışık alır
const TOPRAK=[162,130,104], TAS=[192,186,166];
const DUVAR={A:[-420,300], B:[-600,3000], h:104, kalin:56};
const SINIR={O:[150,0,700]};
const YAKIN={x:350,z:640};                       // en yakın ağaç (sağda, taçı kadrajdan taşar)
const duvarX=z=>DUVAR.A[0]+(DUVAR.B[0]-DUVAR.A[0])*(z-DUVAR.A[1])/(DUVAR.B[1]-DUVAR.A[1]);

export default {
  id:'fistiklik',
  kamera:{odak:800, yukseklik:155, egim:.12},
  isik,
  yuvalar:{
    'zemin-on':     {duzlem:'zemin', konum:[-50,0,330], yuzey:'toprak', alan:14},
    'zemin-orta':   {duzlem:'zemin', konum:[30,0,960], yuzey:'toprak', alan:14},
    'zemin-kose':   {duzlem:'zemin', konum:[-330,0,600], yuzey:'toprak', alan:8},
    'sinir-tasi':   {duzlem:'arka', konum:[SINIR.O[0],52,SINIR.O[2]], yuzey:'tas', alan:3, uygunsuz:['civi']},
    'agac-dibi':    {duzlem:'zemin', konum:[YAKIN.x-60,0,YAKIN.z-70], yuzey:'toprak', alan:8},
    'duvar-ustu':   {duzlem:'ust', konum:[duvarX(820)+4,DUVAR.h+6,820], yuzey:'tas', alan:4},
    'agac-govdesi': {duzlem:'arka', konum:[YAKIN.x-4,62,YAKIN.z-34], yuzey:'tahta', alan:2, uygunsuz:['saat']},
    'beden':        {duzlem:'zemin', konum:[-30,0,560], aci:1.38, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(3317);
    gokCiz(P,R);
    sirt(P,{z:15000,h:1300,renk:[150,150,138],yogun:5000,tohum:41,sisAlt:.6,cizgi:.15});
    sirt(P,{z:6500,h:520,taban:-40,renk:[132,120,100],yogun:4800,tohum:42,nokta:260,teras:6,sisAlt:.45});
    kirZemin(P,isik,{x:[-3000,3000],z:[200,6500],renk:TOPRAK,R,yogun:4800,tohum:331,cakil:220,doku:1.3});
    // sürülmüş toprağın kesekleri: yakında iri, uzakta ince; her birinin üstü ışık, altı gölge
    for(let i=0;i<650;i++){const Z=240+Math.pow(R(),1.8)*1600, X=(R()-.5)*(Z*1.5+300), p=P.n(X,0,Z), o=P.olcek(X,0,Z), w=(2+R()*4.5)*o, h=w*(.3+R()*.25);
      if(p[0]<-10||p[0]>1010) continue;
      leke(p[0]+w*.2,p[1]+h*.3,w*1.4,h*.7,[0,0,0],.35);
      c.fillStyle=rgba(golgele(TOPRAK,.75+R()*.4),1); c.beginPath(); c.moveTo(p[0]-w,p[1]); for(let k=1;k<6;k++){const a=Math.PI+k/6*Math.PI; c.lineTo(p[0]+Math.cos(a)*w*(.6+R()*.5),p[1]+Math.sin(a)*h*(.5+R()*.9));} c.lineTo(p[0]+w,p[1]); c.closePath(); c.fill();
      leke(p[0]-w*.3,p[1]-h*.8,w*.5,h*.35,golgele(TOPRAK,1.35),.5);}
    // sürülmüş toprak: ağaç sıralarına koşut, uzağa doğru birleşen saban izleri
    for(let x=-700;x<=900;x+=60+R()*50){
      const n=[]; for(let z=250;z<=3400;z+=60) n.push(P.n(x+Math.sin(z*.004+x)*6,0,z));
      c.strokeStyle=R()<.5?'rgba(40,30,24,.08)':'rgba(220,196,170,.08)'; c.lineWidth=1+R()*2.6; c.beginPath(); n.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.stroke();
    }
    // uzak taraça duvarı (sıraların sonunda)
    kuruDuvar(P,isik,[-2400,3500],[2400,3400],{h:90,kalin:50,renk:[176,168,148],R,yogun:4800,sira:15});
    // ağaçlar: iki sıra arasından bakılır; duvarın ardındaki sıra önce çizilir
    const ag=[];
    for(const z of[1300,2000,2700]) ag.push([-1000,z]);
    for(const z of[950,1600,2250,2900]) ag.push([-230,z]);
    for(const z of[1260,1900,2550,3150]) ag.push([380,z]);
    for(const z of[900,1550,2200,2850]) ag.push([1000,z]);
    const cizAgac=([x,z],i)=>{agac(P,isik,x,z,{tur:'fistik',boy:330+((x*7+z)%60),en:430+((x+z*3)%80),yogun:4800,tohum:900+i*7,golge:.4});
      for(let k=0;k<6;k++) ot(P,x+(R()-.5)*160,z-40+(R()-.5)*60,10+R()*10,R,{yogun:4800});};
    ag.filter(q=>q[0]<-700).sort((a,b)=>b[1]-a[1]).forEach(cizAgac);
    kuruDuvar(P,isik,DUVAR.A,DUVAR.B,{h:DUVAR.h,kalin:DUVAR.kalin,renk:[180,172,150],R,sira:15});
    const isler=ag.filter(q=>q[0]>=-700).map((q,i)=>({z:q[1],ciz:()=>cizAgac(q,i+20)}));
    // kireçtaşı kayalar: toprağı delip çıkmış
    for(const [i,[x,z,e]] of [[620,1100,90],[-120,1500,70],[180,2300,60],[700,420,50],[-180,780,36],[560,1600,70]].entries())
      isler.push({z,ciz:()=>kaya(P,isik,x,z,{en:e,boy:e*.45,derin:e*.7,renk:TAS,tohum:340+i,nA:9,nK:3,yogun:4800})});
    // sınır taşı: kaba yontulmuş dik taş, başı badanalı, dibine taş yığılmış
    isler.push({z:SINIR.O[2]+10,ciz:()=>{
      duzlemde(P,[SINIR.O[0],0,SINIR.O[2]+12],DUZLEM.zemin,()=>{leke(0,0,40,22,[0,0,0],.5);});
      for(let i=0;i<7;i++){const a=i/7*Math.PI*2, x=SINIR.O[0]+Math.cos(a)*24, z=SINIR.O[2]+12+Math.sin(a)*18; if(z<SINIR.O[2]+6) continue; kaya(P,isik,x,z,{en:16,boy:9,derin:12,renk:TAS,tohum:380+i,nA:6,nK:2,catlak:0,cizgi:.35});}
      const T=prizma(P,isik,[[-15,0],[15,0],[14,50],[13,78],[2,88],[-12,79],[-14,46]],22,{O:SINIR.O,egZ:.03},[184,178,158],381,{cizgi:.75,doku:12});
      duzlemde(P,T.O,T.D,()=>{ // badana: tepeden aşağı akmış kireç
        c.save(); c.beginPath(); c.moveTo(-15,0); c.lineTo(15,0); c.lineTo(14,-50); c.lineTo(13,-78); c.lineTo(2,-88); c.lineTo(-12,-79); c.lineTo(-14,-46); c.closePath(); c.clip();
        c.fillStyle='rgba(236,232,216,.55)'; c.beginPath(); c.moveTo(-20,-90); c.lineTo(20,-90); c.lineTo(20,-66); for(let x=18;x>-20;x-=4) c.lineTo(x,-66+(R()*12)); c.closePath(); c.fill();
        titrek(()=>{c.moveTo(-5,-36); c.lineTo(5,-36); c.moveTo(0,-42); c.lineTo(0,-30);},[40,36,30],.5,1.4,382,1,.4); // kazınmış haç işareti (sınır)
        leke(0,-4,22,8,[20,18,14],.35);
        c.restore();
      });
      for(let k=0;k<5;k++) ot(P,SINIR.O[0]+(R()-.5)*70,SINIR.O[2]-8+R()*20,8+R()*10,R);
    }});
    isler.push({z:1200,ciz:()=>cali(P,isik,-330,1200,{en:90,boy:50,tohum:391,yogun:4800})});
    // en yakın ağaç: taçı kadrajın sağ üstünden taşar
    isler.push({z:YAKIN.z,ciz:()=>agac(P,isik,YAKIN.x,YAKIN.z,{tur:'fistik',boy:360,en:520,tohum:777,golge:.45,yon:-.2})});
    isler.sort((a,b)=>b.z-a.z);
    for(const s of isler) s.ciz();
    // ön plan: düşmüş yapraklar, taş kırıkları, kuru ot
    for(let i=0;i<40;i++){const Z=240+R()*120, X=(R()-.5)*420, p=P.n(X,0,Z), o=P.olcek(X,0,Z); if(R()<.5){c.fillStyle=rgba(golgele([120,100,70],.6+R()*.6),.7); c.beginPath(); c.ellipse(p[0],p[1],4*o,1.6*o,R()*3,0,Math.PI*2); c.fill();} else ot(P,X,Z,6+R()*8,R,{kat:.6});}
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.07,leke:.06});
    karanlik([[0,760,260,150,.3],[1000,760,260,150,.3],[1000,0,300,200,.2]]);
  }
};
