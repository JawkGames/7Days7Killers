// Kör Halil'in evi: katırcının evi; ev ile ahır iç içe. Solda yaşanan yer: duvar dibinde yük denkleri, gazyağı tenekeleri,
// duvardaki askılıkta katır koşumu. Sağda alçak taş bölmenin ardı ahır: bölmenin üstüne atılmış semerler, yerde saman,
// arka duvarda iç ahıra açılan kapkara ağız. Tek ışık: sol duvardaki açık kapı (gün ışığı).
// Ev parçaları (oda kabuğu, kirişli tavan, boşluk, yatak yığını, teneke...) ../ic-yardim.js içinde.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,silindir,cokgen3,hat3,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,tasOrgu,zemin,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {agacCivi,huzme,isikDusmesi,odaKenarlari,tabanGolgesi,yuzDoku,gugum,tavanCiz,teneke,bosluk,duvarBoslugu,yumusakKutu,RENK_EV,odaDuvarlari} from '../ic-yardim.js';

/* ════════════════════════ KÖR HALİL'İN EVİ ════════════════════════ */

const SOL=-250, SAG=270, ARKA=480, TAVAN=250, ON=60;
const KAPI={x0:-236, x1:-160, y1:176};                // arka duvarda, sol köşede açık kapı
const BOLME={x:[66,SAG], y:96, z:[404,432]};           // ahırı ayıran alçak taş bölme (X boyunca)
const isik={konum:[-198,118,ARKA+40], guc:1.9, menzil:340, ortam:.28};
const {badana:BADANA, tas:TAS, toprak:TOPRAK, ahsap:AHSAP, cuval:CUVAL, deri:DERI}=RENK_EV;

// Semer: bölmenin üstüne ata biner gibi atılmış; yandan görünür. Kapitone keçe yastık, iki uçta ağaç kaş,
// öne sarkan kapak ve yere doğru kolan. Bölmenin ön yüzü düzleminde çizilir (küçük nesne).
function semer(P,x,t){
  const Z=BOLME.z[0]-3, y=BOLME.y;
  duzlemde(P,[x,y,Z],DUZLEM.arka,()=>{
    leke(6,26,46,26,[0,0,0],.55); // kapağın duvara düşen gölgesi
    // sarkan kapak (keçe), alt kenarı dalgalı
    const kapak=()=>{c.moveTo(-40,-6); c.lineTo(40,-6); c.quadraticCurveTo(43,14,40,36); c.quadraticCurveTo(20,40,4,37); c.quadraticCurveTo(-18,41,-38,36); c.quadraticCurveTo(-43,14,-40,-6); c.closePath();};
    c.beginPath(); kapak(); c.fillStyle=rgba(golgele(DERI,.8),1); c.fill();
    c.save(); c.clip(); leke(-16,4,26,18,golgele(DERI,1.25),.45); leke(18,24,30,20,[0,0,0],.45);
    for(let i=-3;i<=3;i++) titrek(()=>{c.moveTo(i*11,-4); c.lineTo(i*11+(i*.6),34);},[18,12,8],.45,.8,t+i+10,1,.4); // kapitone dikiş
    titrek(()=>{c.moveTo(-39,30); c.quadraticCurveTo(0,34,39,30);},[150,120,80],.3,.8,t+30,1,.4); // kenar şeridi
    c.restore(); titrek(kapak,MUREKKEP,.8,1.2,t,2,.8);
    // yastık sırtı
    const sirt=()=>{c.moveTo(-42,-4); c.bezierCurveTo(-40,-20,-20,-23,0,-21); c.bezierCurveTo(20,-23,40,-20,42,-4); c.closePath();};
    c.beginPath(); sirt(); c.fillStyle=rgba(golgele(DERI,.95),1); c.fill(); c.save(); c.clip(); leke(-10,-16,30,7,[200,170,130],.3); c.restore(); titrek(sirt,MUREKKEP,.75,1.1,t+1,2,.6);
    // iki uçta ağaç kaş: yukarı kalkık kemer
    for(const k of[-1,1]){const kas=()=>{c.moveTo(k*42,-4); c.quadraticCurveTo(k*45,-20,k*36,-27); c.lineTo(k*31,-24); c.quadraticCurveTo(k*37,-17,k*35,-4); c.closePath();};
      c.beginPath(); kas(); c.fillStyle=rgba(golgele(AHSAP,1.1),1); c.fill(); c.save(); c.clip(); leke(k*38,-18,3,8,[230,210,170],.4); c.restore(); titrek(kas,MUREKKEP,.85,1,t+2+k,2,.4);}
    // kolan: kapağın altından sarkan kayış, ucunda toka
    titrek(()=>{c.moveTo(22,36); c.quadraticCurveTo(26,60,18,84);},[34,26,18],.95,2.6,t+5,1,.2);
    c.strokeStyle='rgba(120,112,96,.9)'; c.lineWidth=1.2; c.strokeRect(15,82,7,5);
  });
}

// Yük denkleri: çuvala sarılıp urganla çaprazlama bağlanmış balyalar
function denk(P,R,x0,x1,y0,y1,z0,z1,t){
  if(!y0) tabanGolgesi(P,isik,x0,x1,z0,z1,.7);
  const yz=yumusakKutu(P,isik,R,[x0,x1],[y0,y1],[z0,z1],golgele(CUVAL,.95+R()*.1),t,{yuvarlak:.2});
  yuzDoku(P,yz.on,R,{sik:9,alfa:.22,kalin:.7,lek:3});
  if(yz.ust) yuzDoku(P,yz.ust,R,{sik:6,alfa:.18,kalin:.7,lek:1});
  // kırışıklar: bağın sıktığı yerden yayılan kısa hatlar
  for(let i=0;i<5;i++){const xx=x0+(x1-x0)*(.15+R()*.7), yy=y0+(y1-y0)*(.3+R()*.5); hat3(P,[[xx,yy,z0-1],[xx+(R()-.5)*14,yy+(R()-.5)*10,z0-1]],[20,18,14],.35,.8,t+40+i,1,.5);}
  const ip=n=>{hat3(P,n,[176,164,130],.9,2.2,t+n.length*7,1,.2); hat3(P,n,[24,20,14],.45,.6,t+n.length*7+1,1,.5);};
  for(const f of[.3,.72]){const xx=x0+(x1-x0)*f; ip([[xx,y0+3,z0-1],[xx-1,(y0+y1)/2,z0-2.5],[xx,y1-1,z0-1.5],[xx,y1+1.5,z0+(z1-z0)*.5],[xx,y1,z1]]);}
  ip([[x0+3,(y0+y1)*.5+2,z0-1],[(x0+x1)/2,(y0+y1)*.5,z0-2.5],[x1-3,(y0+y1)*.5+2,z0-1]]);
}

export default {
  id:'halil-evi',
  kamera:{odak:720, yukseklik:160, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[70,0,238], yuzey:'toprak', alan:16},
    'zemin-orta': {duzlem:'zemin', konum:[-96,0,374], yuzey:'toprak', alan:7},
    'zemin-kose': {duzlem:'zemin', konum:[-196,0,300], yuzey:'toprak', alan:5},
    'esik':       {duzlem:'zemin', konum:[-198,0,ARKA-12], yuzey:'tas', alan:4},
    'duvar':      {duzlem:'arka', konum:[8,126,ARKA], yuzey:'siva', alan:6},
    'ahir-onu':   {duzlem:'zemin', konum:[178,0,350], yuzey:'camur', alan:10},
    'teneke-ustu':{duzlem:'ust', konum:[-206,70,372], yuzey:'tas', alan:2, uygunsuz:['kan','un']},
    'beden':      {duzlem:'zemin', konum:[-26,0,306], aci:.2, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(8121), K=KAPI, B=BOLME;
    c.fillStyle='#0c0d0a'; c.fillRect(0,0,1000,750);
    const kapi=bosluk(K.x0,K.x1,0,K.y1);
    odaDuvarlari(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON,renk:BADANA,is:.3,catlak:4,
      yama:{arka:[[-60,-60,22,16]], sol:[[300,-150,30,24]]}, delik:{arka:[kapi]}});
    // ahır yanı badanasız: bölmenin ardında duvar moloz taş, isli
    // ahır yanı: hayvan nefesi ve isle kararmış duvar, dibinde ıslak kuşak
    for(let i=0;i<9;i++){const s0=P.n(B.x[0]+40+R()*(SAG-B.x[0]-40),40+R()*170,ARKA); leke(s0[0],s0[1],40+R()*60,30+R()*50,[0,0,0],.12+R()*.1);}
    { const s0=P.n(170,30,ARKA); leke(s0[0],s0[1],160,40,[0,0,0],.35); }
    tavanCiz(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,on:ON,y:TAVAN,kirisX:[-160,-30,100,215]});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:820,doku:.9});
    odaKenarlari(P,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON});
    // kapı ve içeri düşen ışık
    duvarBoslugu(P,isik,R,{duvar:'arka',duz:ARKA,a0:K.x0,a1:K.x1,y0:0,y1:K.y1,kalin:50});
    kutu(P,{...isik,ortam:.55},[K.x0-6,K.x1+6],[0,6],[ARKA-10,ARKA+50],TAS,8131,{cizgi:.45}); // eşik taşı
    isikDusmesi(P,[[K.x0+2,0,ARKA-4],[K.x1-2,0,ARKA-4],[K.x1+150,0,210],[K.x0+10,0,210]],[-198,0,ARKA],[-120,0,220],.95);
    // yemlik: ahır yanında arka duvar dibinde taş tekne (bölmenin üstünden görünür)
    kutu(P,{...isik,ortam:.24},[120,256],[0,64],[ARKA-40,ARKA],TAS,8140,{cizgi:.5});
    cokgen3(P,[[128,64.5,ARKA-34],[248,64.5,ARKA-34],[248,64.5,ARKA-6],[128,64.5,ARKA-6]],[24,22,18]);
    for(let i=0;i<40;i++){const x=130+R()*116, z=ARKA-32+R()*24; hat3(P,[[x,65,z],[x+(R()-.5)*14,66+R()*5,z+(R()-.5)*6]],[170,150,100],.5,.8,8141+i,1,.3);} // yemlikte saman
    // bölme: alçak moloz taş duvar; sol ucunda tavana çıkan ağaç dikme
    tabanGolgesi(P,isik,B.x[0],B.x[1],B.z[0],B.z[1],.55);
    tasOrgu(P,{...isik,ortam:.42},[0,0,B.z[0]],DUZLEM.arka,[B.x[0],B.x[1],-B.y,0],TAS,R,{sira:16,duzensiz:.7,harc:[52,48,40]});
    tasOrgu(P,{...isik,ortam:.4},[B.x[0],0,0],DUZLEM.sag,[-B.z[1],-B.z[0],-B.y,0],TAS,R,{sira:16,duzensiz:.7,harc:[52,48,40]});
    cokgen3(P,[[B.x[0],B.y,B.z[0]],[B.x[1],B.y,B.z[0]],[B.x[1],B.y,B.z[1]],[B.x[0],B.y,B.z[1]]],golgele(TAS,1));
    yuzDoku(P,[[B.x[0],B.y,B.z[0]],[B.x[1],B.y,B.z[0]],[B.x[1],B.y,B.z[1]],[B.x[0],B.y,B.z[1]]],R,{sik:3,alfa:.3,lek:4});
    hat3(P,[[B.x[0],0,B.z[0]],[B.x[0],B.y,B.z[0]],[B.x[1],B.y,B.z[0]]],MUREKKEP,.75,1.3,8150,2,1);
    hat3(P,[[B.x[0],B.y,B.z[0]],[B.x[0],B.y,B.z[1]]],MUREKKEP,.6,1.2,8151,2,1);
    silindir(P,isik,B.x[0]+10,(B.z[0]+B.z[1])/2,8,B.y,TAVAN-20,AHSAP,8152,{cizgi:.6});
    // semerler bölmenin üstünde
    semer(P,128,8160); semer(P,222,8170);
    // askılık: arka duvarda ağaç çivili tahta; dizgin, yular, çıngıraklı boyunluk, heybe, kamçı
    kutu(P,isik,[-140,40],[184,192],[ARKA-5,ARKA],AHSAP,8180,{cizgi:.5,ust:false});
    duzlemde(P,[0,0,ARKA-5],DUZLEM.arka,()=>{
      for(const x of[-128,-90,-52,-14,22]) agacCivi(x,-182);
      const kayis=(x,u,g,t)=>{titrek(()=>{c.moveTo(x-2,-180); c.bezierCurveTo(x-g,-180+u*.6,x-g*.4,-180+u,x+2,-180+u); c.bezierCurveTo(x+g*.6,-180+u,x+g,-180+u*.6,x+3,-180);},[34,26,20],.95,2.6,t,1,.3); titrek(()=>{c.moveTo(x-2,-180); c.bezierCurveTo(x-g,-180+u*.6,x-g*.4,-180+u,x+2,-180+u);},[150,120,90],.35,.6,t+1,1,.3);};
      kayis(-128,60,16,8181); kayis(-125,44,9,8182);
      kayis(-90,38,13,8183); c.strokeStyle='rgba(60,56,50,1)'; c.lineWidth=1.6; c.beginPath(); c.arc(-90,-140,4,0,TAU); c.stroke(); titrek(()=>{c.moveTo(-90,-136); c.quadraticCurveTo(-86,-112,-92,-96);},[34,26,20],.9,2.2,8184,1,.3);
      // çıngıraklı boyunluk
      titrek(()=>{c.moveTo(-60,-180); c.bezierCurveTo(-74,-150,-64,-120,-50,-116); c.bezierCurveTo(-34,-120,-32,-150,-46,-180);},[40,30,22],.95,4.5,8185,1,.3);
      for(let i=0;i<6;i++){const a=.35+i*.45, x=-50+Math.cos(a+1.4)*13, y=-142+Math.sin(a+1.4)*22; leke(x+1,y+1.5,3,2.5,[0,0,0],.5); c.fillStyle='rgb(96,82,52)'; c.beginPath(); c.arc(x,y,2.4,0,TAU); c.fill(); c.fillStyle='rgba(230,214,160,.6)'; c.beginPath(); c.arc(x-.7,y-.7,.8,0,TAU); c.fill();}
      // heybe: dokuma iki gözlü torba (karaltı + birkaç çizgi)
      const hy=()=>{c.moveTo(-16,-181); c.lineTo(-30,-176); c.lineTo(-34,-134); c.quadraticCurveTo(-34,-126,-28,-126); c.lineTo(-2,-127); c.quadraticCurveTo(4,-127,3,-134); c.lineTo(0,-176); c.closePath();};
      leke(-12,-146,24,30,[0,0,0],.4); c.beginPath(); hy(); c.fillStyle='rgb(88,68,54)'; c.fill();
      c.save(); c.beginPath(); hy(); c.clip(); for(let i=0;i<4;i++){c.fillStyle='rgba(30,20,16,.45)'; c.fillRect(-28+i*8,-180,2.6,60);} for(let i=0;i<3;i++){c.fillStyle='rgba(190,170,130,.3)'; c.fillRect(-40,-166+i*13,50,1.6);} leke(-24,-150,8,18,[220,200,160],.2); c.restore();
      for(let i=0;i<9;i++) titrek(()=>{c.moveTo(-31+i*3.6,-126); c.lineTo(-31+i*3.6+(i%2?.6:-.6),-119);},[60,46,36],.8,.8,8190+i,1,.2); // saçak
      titrek(hy,MUREKKEP,.8,1,8186,2,.6);
      titrek(()=>{c.moveTo(22,-182); c.lineTo(24,-132); c.quadraticCurveTo(30,-104,18,-90);},[30,24,18],.9,1.6,8187,1,.3); // kamçı
    });
    // yük denkleri: arka duvar dibinde iki üst üste, yanında bir tane
    denk(P,R,-142,-56,0,50,ARKA-72,ARKA-6,8200); denk(P,R,-50,34,0,46,ARKA-68,ARKA-6,8210);
    denk(P,R,-132,-52,50,92,ARKA-66,ARKA-12,8220);
    // gazyağı tenekeleri: sol duvar dibinde, ışıkta; ikisinin üstünde bir üçüncü, biri yerde yan yatmış
    teneke(P,isik,R,-218,384,{tohum:8230}); teneke(P,isik,R,-194,384,{tohum:8231,ezik:1});
    teneke(P,isik,R,-206,372,{y:35,tohum:8240,ezik:1});
    teneke(P,isik,R,-226,346,{tohum:8245,ezik:2,h:28});
    // kapı yanında su güğümü
    gugum(P,-138,ARKA-20,{tohum:8248});
    // zeminde nal ve ayak izleriyle bozulmuş toprak; ahır önünde ıslak koyu çamur
    duzlemde(P,[-110,0,330],DUZLEM.zemin,()=>{for(let i=0;i<9;i++){const x=(R()-.5)*260, y=(R()-.5)*120; c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=1.2; c.beginPath(); c.arc(x,y,4+R()*2,Math.PI*.15,Math.PI*.85+R()*.4); c.stroke();} for(let i=0;i<20;i++) leke((R()-.5)*260,(R()-.5)*120,6+R()*14,3+R()*5,[0,0,0],.12+R()*.1);});
    duzlemde(P,[180,0,360],DUZLEM.zemin,()=>{leke(0,0,90,40,[18,16,12],.55); for(let i=0;i<7;i++){const x=(R()-.5)*150, y=(R()-.5)*60; c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=1.4; c.beginPath(); c.arc(x,y,4.5,Math.PI*.1,Math.PI*.9); c.stroke(); c.strokeStyle='rgba(160,150,120,.2)'; c.beginPath(); c.arc(x,y-1,4.5,Math.PI*1.1,Math.PI*1.9); c.stroke();}});
    // dağılmış saman: bölmenin önünden makineye doğru seyrelir
    for(let i=0;i<220;i++){const x=40+R()*(SAG-40), z=200+R()*(B.z[0]-200)*(.4+R()*.6), s=P.n(x,0,z), o=P.olcek(x,0,z), a=R()*Math.PI, u=(4+R()*9)*o;
      tabana(); c.strokeStyle=`rgba(${160+R()*50|0},${144+R()*40|0},${96+R()*30|0},${.15+R()*.3})`; c.lineWidth=.8; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+Math.cos(a)*u,s[1]+Math.sin(a)*u*.4); c.stroke();}
    // ahır önünde dökülmüş nallar
    duzlemde(P,[92,0,300],DUZLEM.zemin,()=>{for(const [x,y,a] of[[0,0,.4],[14,10,2.2],[-8,16,4]]){c.save(); c.translate(x,y); c.rotate(a); leke(1,1,9,7,[0,0,0],.5); c.strokeStyle='rgb(58,56,52)'; c.lineWidth=2.6; c.beginPath(); c.arc(0,0,6,Math.PI*.15,Math.PI*1.85); c.stroke(); c.strokeStyle='rgba(200,196,180,.5)'; c.lineWidth=.6; c.beginPath(); c.arc(0,0,7,Math.PI*1.1,Math.PI*1.6); c.stroke(); c.restore();}});
    // önde: urgan yumağı ve sürüklenmiş ucu
    const u=P.n(-150,0,236), uo=P.olcek(-150,0,236);
    tabana(); leke(u[0]+8*uo,u[1]+2*uo,30*uo,9*uo,[0,0,0],.55);
    c.fillStyle='rgba(70,62,46,1)'; c.beginPath(); c.ellipse(u[0],u[1]-6*uo,16*uo,7*uo,0,0,TAU); c.fill();
    for(let i=0;i<12;i++){const a=i*.9; titrek(()=>{c.ellipse(u[0]+Math.cos(a)*3*uo,u[1]-6*uo+Math.sin(a)*1.5*uo,(15-i*.5)*uo,(6-i*.2)*uo,(R()-.5)*.3,0,TAU);},[170,156,120],.55,1.8,8250+i,1,.4);}
    titrek(()=>{c.moveTo(u[0]+14*uo,u[1]-3*uo); c.bezierCurveTo(u[0]+40*uo,u[1]+8*uo,u[0]+60*uo,u[1]-6*uo,u[0]+96*uo,u[1]+4*uo);},[170,156,120],.7,2,8270,1,.4);
  },
  ustCiz(P,r){
    const K=KAPI;
    atmosfer(r,{tarama:.08,leke:.09});
    huzme(P,r,[[K.x0,K.y1,ARKA],[K.x1,K.y1,ARKA],[K.x1+150,0,220],[K.x0+10,0,220]],[-198,150,ARKA],[-120,0,240],.15,140);
    karanlik([[1000,520,240,300,.55],[1000,40,320,180,.5],[0,40,200,140,.4],[1000,740,300,140,.45],[0,740,200,100,.3]]);
  }
};
