// Ebe Ana'nın evi: gece, tek gaz lambasıyla. Tavandaki sırığa baş aşağı asılmış kurutulmuş ot demetleri; arka
// duvardaki rafta şişeler ve yanan lamba; sağda ocak ve önünde sacayak üstünde bakır kazan; önde doğum iskemlesi,
// leğen ve katlı temiz bezler; solda yerde havan. Tek ışık: raftaki gaz lambası (gölgeler ondan uzağa, uzun).
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,cokgen3,hat3,golgele,tabana,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,zemin,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {RENK_EV,odaDuvarlari,odaKenarlari,tavanCiz,bosluk,yuzDoku,tabanGolgesi,yumusakKutu,yatakYigini,gazLambasi,sise,tas,agacCivi} from '../ic-yardim.js';

const SOL=-260, SAG=260, ARKA=440, TAVAN=238, ON=60;
const RAF={x:[-214,-36], y:128, d:22};
const LAMBA=[-122,RAF.y,ARKA-11];
const OCAK={x:[64,176], y1:104, derin:40};
const ISKEMLE={x:172, z:296};
const isik={konum:[LAMBA[0],LAMBA[1]+24,LAMBA[2]-4], guc:2.5, menzil:250, ortam:.2};
const {badana:BADANA, toprak:TOPRAK, ahsap:AHSAP, bakir:BAKIR}=RENK_EV;
const OT=[[116,112,84],[96,96,70],[130,118,86],[88,82,62]];

// Baş aşağı asılı ot demeti (ekrana paralel): bağlı sapların ucu yukarıda, yapraklı başlar aşağıda dağınık.
// Karaltı + birkaç mürekkep hattı; lamba alttan vurduğu için alt kenar açık.
function otDemeti(P,R,X,Y,Z,boy,en,renk,t){
  const s=P.n(X,Y,Z), o=P.olcek(X,Y,Z), L=P.n(...isik.konum), yan=Math.sign(L[0]-s[0])||1;
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  const n=[[-1.6,4],[-en*.22,boy*.3]], adim=13;
  for(let i=0;i<=adim;i++){const f=i/adim, x=-en/2+en*f, y=boy*(i%2?.55+R()*.2:.8+R()*.3)-Math.abs(f-.5)*boy*.3; n.push([x+(R()-.5)*5,y]);}
  n.push([en*.22,boy*.3]);
  n.push([1.6,4]);
  const yol=()=>{c.moveTo(0,0); c.lineTo(n[0][0],n[0][1]); for(let i=1;i<n.length;i++){const p=n[i-1], q=n[i]; c.quadraticCurveTo(p[0]+(R()-.5)*4,p[1]+(R()-.5)*4,(p[0]+q[0])/2,(p[1]+q[1])/2);} c.closePath();};
  c.beginPath(); yol(); c.fillStyle=rgba(golgele(renk,.55),1); c.fill();
  c.save(); c.clip(); leke(yan*en*.25,boy*.8,en*.4,boy*.3,golgele(renk,1.5),.5); leke(-yan*en*.3,boy*.4,en*.35,boy*.5,[0,0,0],.45); c.restore();
  for(let i=0;i<7;i++){const x=(i-3)*en*.12; titrek(()=>{c.moveTo(x*.15,5); c.quadraticCurveTo(x*.6,boy*.4,x+(R()-.5)*5,boy*(.7+R()*.25));},[20,18,12],.5,.6/o,t+i,1,.3/o);}
  for(let i=0;i<9;i++){const x=(R()-.5)*en, y=boy*(.55+R()*.4); c.fillStyle=rgba(golgele(renk,i<2?1.5:.3),.75); c.beginPath(); c.ellipse(x,y,2+R()*2.5,.8+R()*.8,R()*3,0,TAU); c.fill();} // yaprak, çiçek başı
  titrek(yol,MUREKKEP,.55,.9/o,t+20,1,.6/o);
  c.fillStyle='rgb(150,130,96)'; c.fillRect(-2.4,2,4.8,2.2); // bağ
  c.restore();
}

// Bakır kazan (ekrana paralel profil): şişkin gövde, kalın ağız kenarı, iki kulp; sacayak üstünde
function kazan(P,R,X,Z){
  const s=P.n(X,0,Z), o=P.olcek(X,0,Z), L=P.n(...isik.konum), yan=Math.sign(L[0]-s[0])||1;
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  leke(-yan*20,0,48,9,[0,0,0],.6);
  for(const x of[-22,22,0]) {c.strokeStyle='rgb(30,28,26)'; c.lineWidth=2.2; c.beginPath(); c.moveTo(x*1.1,x?0:3); c.lineTo(x*.7,-16); c.stroke();} // sacayak
  c.strokeStyle='rgb(36,34,30)'; c.lineWidth=2.6; c.beginPath(); c.ellipse(0,-16,22,5,0,0,TAU); c.stroke();
  const g=()=>{c.moveTo(-26,-50); c.quadraticCurveTo(-32,-30,-20,-17); c.quadraticCurveTo(0,-8,20,-17); c.quadraticCurveTo(32,-30,26,-50); c.closePath();};
  c.beginPath(); g(); c.fillStyle=rgba(golgele(BAKIR,.55),1); c.fill();
  c.save(); c.clip(); leke(yan*16,-34,7,13,[255,220,170],.6); leke(yan*10,-30,14,18,golgele(BAKIR,1.3),.4); leke(-yan*18,-28,16,22,[0,0,0],.55); leke(0,-14,26,8,[0,0,0],.55);
  for(let i=0;i<5;i++){c.strokeStyle='rgba(20,10,6,.3)'; c.lineWidth=.5; c.beginPath(); c.ellipse(0,-48+i*7,26-i*1.2,2.4,0,0,Math.PI); c.stroke();} // dövme izleri
  c.restore();
  titrek(g,MUREKKEP,.85,.9,9101,2,.5);
  c.beginPath(); c.ellipse(0,-50,27.5,5.2,0,0,TAU); c.fillStyle=rgba(golgele(BAKIR,.9),1); c.fill(); // ağız kenarı
  c.beginPath(); c.ellipse(0,-50,24.5,3.9,0,0,TAU); c.fillStyle='rgb(18,14,10)'; c.fill();
  leke(yan*10,-51.5,8,1.4,[255,226,180],.6);
  titrek(()=>c.ellipse(0,-50,27.5,5.2,0,0,TAU),MUREKKEP,.8,.7,9102,2,.4);
  for(const k of[-1,1]) titrek(()=>{c.moveTo(k*25,-46); c.bezierCurveTo(k*34,-48,k*35,-40,k*28,-38);},[40,30,20],.95,2,9103+k,1,.2);
  c.restore();
}

// Tunç havan ve havan eli (ekrana paralel)
function havan(P,X,Z){
  const s=P.n(X,0,Z), o=P.olcek(X,0,Z), L=P.n(...isik.konum), yan=Math.sign(L[0]-s[0])||1;
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  leke(-yan*12,0,22,5,[0,0,0],.6);
  const g=()=>{c.moveTo(-10,0); c.lineTo(10,0); c.lineTo(9,-3); c.quadraticCurveTo(6,-5,6.5,-9); c.quadraticCurveTo(8,-17,11,-21); c.lineTo(-11,-21); c.quadraticCurveTo(-8,-17,-6.5,-9); c.quadraticCurveTo(-6,-5,-9,-3); c.closePath();};
  // havan eli: içinden eğik çıkar
  c.strokeStyle='rgb(70,60,40)'; c.lineWidth=3.4; c.lineCap='round'; c.beginPath(); c.moveTo(2,-16); c.lineTo(14,-36); c.stroke();
  c.fillStyle='rgb(70,60,40)'; c.beginPath(); c.ellipse(14.5,-37,2.8,2.4,0,0,TAU); c.fill();
  c.strokeStyle='rgba(240,220,170,.5)'; c.lineWidth=.6; c.beginPath(); c.moveTo(1.4,-18); c.lineTo(12.6,-36); c.stroke();
  c.beginPath(); g(); c.fillStyle='rgb(92,76,46)'; c.fill();
  c.save(); c.clip(); leke(yan*5,-12,2.4,8,[255,230,170],.6); leke(-yan*5,-10,5,10,[0,0,0],.5); c.restore();
  c.beginPath(); c.ellipse(0,-21,11,2.4,0,0,TAU); c.fillStyle='rgb(30,24,14)'; c.fill();
  titrek(g,MUREKKEP,.85,.6,9110,2,.3); titrek(()=>c.ellipse(0,-21,11,2.4,0,0,TAU),MUREKKEP,.7,.5,9111,1,.2);
  c.restore();
}

// Doğum iskemlesi: alçak, oturağı at nalı biçiminde oyuk (oyuğun ağzı öne bakar), arkalıklı
function iskemle(P,R){
  const {x,z}=ISKEMLE, Y=34, w=22, d=22, O=[x,Y,z];
  tabanGolgesi(P,isik,x-w,x+w,z-d,z+d,.6,1);
  for(const [dx,dz] of [[w-4,d-4],[-w+4,d-4]]) kutu(P,isik,[x+dx-2.5,x+dx+2.5],[0,Y],[z+dz-2.5,z+dz+2.5],AHSAP,9120+dx,{cizgi:.5});
  // arkalık
  for(const dx of[-w+3,w-3]) kutu(P,isik,[x+dx-2.5,x+dx+2.5],[Y,Y+34],[z+d-5,z+d],AHSAP,9130+dx,{cizgi:.55});
  kutu(P,isik,[x-w+1,x+w-1],[Y+22,Y+32],[z+d-4,z+d-1],AHSAP,9135,{cizgi:.55});
  kutu(P,isik,[x-w+1,x+w-1],[Y+8,Y+13],[z+d-4,z+d-1],AHSAP,9136,{cizgi:.5});
  // oturak: kalın tahta, önden açık oyuk
  const dis=[[-w,d],[w,d],[w,-d],[9,-d],[9,-2]];
  for(let i=1;i<10;i++){const a=i/10*Math.PI; dis.push([Math.cos(a)*9,-2+Math.sin(a)*9]);}
  dis.push([-9,-2],[-9,-d],[-w,-d]);
  // kalınlık: ön kenar
  const on=[[x-w,Y-4,z-d],[x-9,Y-4,z-d],[x-9,Y,z-d],[x-w,Y,z-d]], on2=[[x+9,Y-4,z-d],[x+w,Y-4,z-d],[x+w,Y,z-d],[x+9,Y,z-d]];
  cokgen3(P,on,golgele(AHSAP,aydinlik(isik,[x,Y,z-d],[0,0,-1]))); cokgen3(P,on2,golgele(AHSAP,aydinlik(isik,[x,Y,z-d],[0,0,-1])));
  for(const dx of[-w+4,w-4]) kutu(P,isik,[x+dx-2.5,x+dx+2.5],[0,Y-4],[z-d+1,z-d+6],AHSAP,9140+dx,{cizgi:.55}); // ön ayaklar
  tabana(); c.beginPath(); duzlemYol(P,O,DUZLEM.ust,dis.map(([a,b])=>[a,-b])); c.fillStyle=rgba(golgele(AHSAP,Math.min(1.2,aydinlik(isik,O,[0,1,0])*1.15)),1); c.fill();
  c.save(); c.clip(); const sm=P.n(...O); leke(sm[0],sm[1],30,10,[0,0,0],.2); c.restore();
  yuzDoku(P,[[x-w,Y,z-d],[x+w,Y,z-d],[x+w,Y,z+d],[x-w,Y,z+d]],R,{sik:5,alfa:.2,lek:0});
  titrek(()=>duzlemYol(P,O,DUZLEM.ust,dis.map(([a,b])=>[a,-b])),MUREKKEP,.8,1.2,9150,2,.8);
  hat3(P,on,MUREKKEP,.6,1,9151,1,.6,true); hat3(P,on2,MUREKKEP,.6,1,9152,1,.6,true);
}

export default {
  id:'ebe-evi',
  kamera:{odak:720, yukseklik:155, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':    {duzlem:'zemin', konum:[10,0,236], yuzey:'toprak', alan:16},
    'zemin-orta':  {duzlem:'zemin', konum:[-120,0,404], yuzey:'toprak', alan:8},
    'zemin-kose':  {duzlem:'zemin', konum:[-228,0,330], yuzey:'toprak', alan:5},
    'duvar':       {duzlem:'arka', konum:[14,142,ARKA], yuzey:'siva', alan:5},
    'raf-ustu':    {duzlem:'ust', konum:[-160,RAF.y,ARKA-11], yuzey:'tahta', alan:3, uygunsuz:['un']},
    'ocak-onu':    {duzlem:'zemin', konum:[110,0,352], yuzey:'toprak', alan:6},
    'iskemle-dibi':{duzlem:'zemin', konum:[104,0,256], yuzey:'toprak', alan:5},
    'beden':       {duzlem:'zemin', konum:[-34,0,322], aci:-.18, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(9107), O=OCAK;
    c.fillStyle='#0a0b09'; c.fillRect(0,0,1000,750);
    odaDuvarlari(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON,renk:BADANA,is:.3,catlak:3,yama:{sol:[[320,-70,24,18]]},
      delik:{arka:[bosluk(O.x[0],O.x[1],0,O.y1,40)]}});
    tavanCiz(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,on:ON,y:TAVAN,kirisX:[-170,-40,90,210],renk:[96,82,62]});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:9160,doku:.8});
    odaKenarlari(P,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON});
    // ocak: kemerli oyuk, içi isli ve külle dolu; üstünde çıkıntılı yaşmak
    { const Od=[0,0,ARKA], y=bosluk(O.x[0],O.x[1],0,O.y1,40);
      tabana(); c.save(); c.beginPath(); duzlemYol(P,Od,DUZLEM.arka,y); c.clip(); c.fillStyle='rgb(12,11,9)'; c.fillRect(0,0,1000,750);
      const ta=[[O.x[0],0,ARKA],[O.x[1],0,ARKA],[O.x[1],0,ARKA+O.derin],[O.x[0],0,ARKA+O.derin]]; cokgen3(P,ta,[70,66,58]);
      const km=P.n(120,0,ARKA+20); leke(km[0],km[1],50,10,[150,146,134],.45);
      cokgen3(P,[[O.x[0],0,ARKA],[O.x[0],0,ARKA+O.derin],[O.x[0],O.y1,ARKA+O.derin],[O.x[0],O.y1,ARKA]],[36,32,28]);
      c.restore(); titrek(()=>duzlemYol(P,Od,DUZLEM.arka,y,false),MUREKKEP,.8,1.4,9161,2,1);
      kutu(P,isik,[O.x[0]-14,O.x[1]+14],[O.y1+6,O.y1+16],[ARKA-18,ARKA],BADANA,9162,{cizgi:.6});
      duzlemde(P,[0,0,ARKA],DUZLEM.arka,()=>{leke(120,-170,70,60,[0,0,0],.45); leke(120,-230,50,40,[0,0,0],.35);}); } // is
    // raf ve üstünde şişeler, lamba
    kutu(P,isik,RAF.x,[RAF.y-4,RAF.y],[ARKA-RAF.d,ARKA],AHSAP,9170,{cizgi:.6});
    for(const x of[RAF.x[0]+12,RAF.x[1]-12]) hat3(P,[[x,RAF.y-4,ARKA-2],[x,RAF.y-20,ARKA-1],[x+10,RAF.y-4,ARKA-1]],[60,48,34],.9,2.4,9171+x,1,.2); // destek
    const siseler=[[-202,24,8,.45],[-188,18,7,.7],[-174,13,6,.3],[-92,15,9,.6],[-74,26,8,.35],[-58,11,7,.75],[-46,19,6,.5]];
    for(const [i,[x,h,w,t]] of siseler.entries()) sise(P,x,RAF.y,ARKA-10+(i%2)*4,{h,w,ton:t,tohum:9180+i,sol:x>LAMBA[0]});
    gazLambasi(P,...LAMBA,{yanik:true,olc:1.15,tohum:9190});
    // lambanın duvardaki ışık halkası ve rafın altına düşen gölge
    { const l=P.n(LAMBA[0],LAMBA[1]+30,ARKA); tabana(); c.save(); c.globalCompositeOperation='lighter'; leke(l[0],l[1],120,90,[120,100,70],.35); c.restore();
      const g=P.n(-120,RAF.y-20,ARKA); leke(g[0],g[1],150,20,[0,0,0],.35); }
    // duvarda çivide asılı bez çıkın ve makas yeri
    duzlemde(P,[0,0,ARKA],DUZLEM.arka,()=>{agacCivi(-150,-196); const ck=()=>{c.moveTo(-151,-194); c.quadraticCurveTo(-162,-178,-160,-168); c.quadraticCurveTo(-151,-160,-142,-168); c.quadraticCurveTo(-140,-178,-151,-194); c.closePath();}; leke(-146,-176,12,14,[0,0,0],.35); c.beginPath(); ck(); c.fillStyle='rgb(170,164,146)'; c.fill(); titrek(ck,MUREKKEP,.7,.8,9195,1,.4);});
    // tavanda sırık: iki kirişe iple bağlı; üstüne baş aşağı ot demetleri
    const SZ=330, SY=TAVAN-30;
    for(const x of[-40,90]) hat3(P,[[x,TAVAN-20,SZ],[x,SY,SZ]],[150,136,104],.8,1.2,9200+x,1,.2);
    hat3(P,[[-150,SY,SZ],[170,SY,SZ]],golgele(AHSAP,.9),.95,4.5*P.olcek(0,SY,SZ),9205,1,0);
    hat3(P,[[-150,SY-2,SZ],[170,SY-2,SZ]],MUREKKEP,.5,1,9206,1,.4);
    const demet=[[-138,40,22],[-104,52,26],[-70,36,20],[-34,48,28],[4,44,22],[40,56,30],[78,40,24],[112,50,26],[146,38,20]];
    for(const [i,[x,b,e]] of demet.entries()){hat3(P,[[x,SY,SZ],[x,SY-6,SZ]],[150,136,104],.8,1,9210+i,1,.2); otDemeti(P,R,x+(R()-.5)*4,SY-6,SZ,b,e,OT[i%OT.length],9220+i*31);}
    // ocağın önünde kazan
    kazan(P,R,120,ARKA-34);
    // solda havan; önde leğen ve katlı temiz bezler; iskemle
    havan(P,-150,272);
    tas(P,isik,206,0,392,{r:22,h:9,ic:[60,50,40],tohum:9230,renk:BAKIR});
    yumusakKutu(P,isik,R,[200,244],[0,7],[338,370],[200,196,182],9231,{yuvarlak:.3,cizgi:.55});
    yumusakKutu(P,isik,R,[202,240],[7,13],[340,366],[190,186,170],9232,{yuvarlak:.3,cizgi:.55});
    yumusakKutu(P,isik,R,[204,242],[13,18],[341,368],[206,200,186],9233,{yuvarlak:.3,cizgi:.55});
    iskemle(P,R);
    // sol duvar dibinde dürülü döşek ve heybe (karaltı)
    yatakYigini(P,isik,R,-222,392,[{h:14,renk:[110,96,84],desen:'serit'},{h:16,renk:[132,112,96],desen:'dikis'},{h:10,renk:[150,142,124]}],{en:64,boy:90,tohum:9240});
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.08});
    // lambanın sıcak parıltısı
    tabana(); c.save(); c.globalCompositeOperation='screen'; const l=P.n(LAMBA[0],LAMBA[1]+22,LAMBA[2]); leke(l[0],l[1],80,70,[200,170,110],.3); leke(l[0],l[1],22,24,[255,240,200],.45); c.restore();
    karanlik([[1000,560,300,330,.6],[1000,60,300,200,.5],[0,700,220,160,.45],[500,800,700,140,.4],[0,60,160,140,.35]]);
  }
};
