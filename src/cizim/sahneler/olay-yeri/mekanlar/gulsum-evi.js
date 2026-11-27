// Dul Gülsüm'ün evi: terzinin tek göz odası; temiz, süpürülmüş, her şey yerli yerinde. Arka duvardaki pencerenin
// altında alçak sehpa üstünde el dikiş makinesi; solda çiviye asılı yarım kalmış açık renk bir entari; ortada nişte
// dürülmüş kumaş topları; sağ duvar dibinde sandık, üstünde katlanmış kumaşlar. Tek ışık: arka duvardaki pencere.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,cokgen3,hat3,yol3,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,zemin,karanlik,atmosfer,leke,titrek,MUREKKEP} from '../mekan-yardim.js';
import {RENK_EV,odaDuvarlari,odaKenarlari,tavanCiz,bosluk,duvarBoslugu,isikDusmesi,huzme,yuzDoku,tabanGolgesi,
  sandik,yumusakKutu,gazLambasi,nis,agacCivi} from './halil-evi.js';

const SOL=-250, SAG=250, ARKA=440, TAVAN=240, ON=60;
const PEN={x0:46, x1:136, y0:104, y1:172};               // arka duvarda pencere
const SEHPA={x:[20,170], y:[0,32], z:[ARKA-64,ARKA-8]};  // makinenin alçak sehpası
const isik={konum:[91,138,ARKA+50], guc:2.1, menzil:330, ortam:.3};
const {badana:BADANA, toprak:TOPRAK, ahsap:AHSAP}=RENK_EV;
const KUMAS=[[176,168,150],[96,84,74],[136,112,92],[70,74,82],[150,140,112],[118,60,52]];

// El dikiş makinesi (yandan): ağaç taban, döküm kol, iğne başı, sağda kollu el çarkı. Sehpa üstünde, arka düzlemde.
function makine(P,R){
  const X=96, Y=SEHPA.y[1], Z=SEHPA.z[0]+24;
  // ağaç taban kutusu (3B)
  yumusakKutu(P,isik,R,[X-46,X+40],[Y,Y+10],[Z-12,Z+14],golgele(AHSAP,1.1),5101,{yuvarlak:.08});
  duzlemde(P,[X,Y+10,Z],DUZLEM.arka,()=>{
    c.scale(1.35,1.35); leke(0,1,34,4,[0,0,0],.5);
    // döküm kol: sağda sütun, üstte kavisli kol, solda iğne başı
    const kol=()=>{c.moveTo(18,0); c.lineTo(18,-14); c.quadraticCurveTo(18,-24,8,-24); c.lineTo(-20,-24); c.quadraticCurveTo(-27,-24,-27,-18); c.lineTo(-27,-6); c.lineTo(-21,-6); c.lineTo(-21,-15); c.quadraticCurveTo(-21,-18,-16,-18); c.lineTo(6,-18); c.quadraticCurveTo(10,-18,10,-12); c.lineTo(10,0); c.closePath();};
    c.beginPath(); kol(); c.fillStyle='rgb(26,24,22)'; c.fill();
    c.save(); c.clip(); leke(-4,-24,22,2.4,[230,226,210],.55); leke(-26,-14,1.6,8,[220,216,200],.35);
      // altın yaldız süsleri (soluk)
      for(let i=0;i<3;i++) titrek(()=>{c.moveTo(-14+i*8,-21); c.quadraticCurveTo(-10+i*8,-23.5,-6+i*8,-21);},[200,176,110],.55,.5,5110+i,1,.2);
      titrek(()=>{c.arc(14,-8,3,0,TAU);},[200,176,110],.4,.4,5113,1,.2);
    c.restore();
    titrek(kol,MUREKKEP,.9,.8,5114,2,.4);
    // iğne mili ve baskı ayağı
    c.strokeStyle='rgb(150,148,140)'; c.lineWidth=.6; c.beginPath(); c.moveTo(-25,-6); c.lineTo(-25,-1); c.stroke();
    c.fillStyle='rgb(60,58,54)'; c.fillRect(-28,-1.4,6,1.4);
    // makaraya sarılı iplik (üstte, sütunun önünde)
    c.fillStyle='rgb(120,60,50)'; c.fillRect(2,-28.5,4,4.5); c.strokeStyle='rgb(30,28,26)'; c.lineWidth=.5; c.strokeRect(2,-28.5,4,4.5);
    titrek(()=>{c.moveTo(4,-28); c.quadraticCurveTo(-8,-30,-24,-23);},[200,190,170],.6,.3,5115,1,.1);
    // el çarkı ve kolu
    leke(25,-11,9,9,[0,0,0],.3);
    c.beginPath(); c.arc(24,-11,8.5,0,TAU); c.arc(24,-11,6.6,0,TAU,true); c.fillStyle='rgb(30,28,26)'; c.fill();
    for(let i=0;i<5;i++){const a=i/5*TAU+.3; c.strokeStyle='rgb(36,34,30)'; c.lineWidth=1; c.beginPath(); c.moveTo(24,-11); c.lineTo(24+Math.cos(a)*7,-11+Math.sin(a)*7); c.stroke();}
    c.strokeStyle='rgba(220,216,200,.5)'; c.lineWidth=.6; c.beginPath(); c.arc(24,-11,8.5,Math.PI*1.1,Math.PI*1.6); c.stroke();
    c.strokeStyle='rgb(40,36,30)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(24,-11); c.lineTo(30,-17); c.stroke();
    c.fillStyle='rgb(90,74,54)'; c.fillRect(29,-21,2.4,5.5); // tutamak
    titrek(()=>{c.arc(24,-11,8.5,0,TAU);},MUREKKEP,.8,.6,5116,2,.3);
    // iğnenin altında dikilmekte olan kumaş: tabandan sarkar
    const kum=()=>{c.moveTo(-40,0.5); c.lineTo(-14,-.8); c.lineTo(-10,1); c.quadraticCurveTo(-30,4,-38,14); c.quadraticCurveTo(-44,22,-40,30); c.lineTo(-48,30); c.quadraticCurveTo(-50,14,-40,.5); c.closePath();};
    c.beginPath(); kum(); c.fillStyle='rgb(190,184,168)'; c.fill(); c.save(); c.clip(); leke(-44,18,6,14,[0,0,0],.3); c.restore();
    titrek(kum,MUREKKEP,.6,.6,5117,1,.3);
  });
}

// Yarım kalmış entari: çiviye asılı ağaç askı; korsaj, tek kol, eteğin ucu teyelli. Karaltı + birkaç mürekkep hattı.
function entari(P,R,X,Y){
  duzlemde(P,[X,Y,ARKA],DUZLEM.arka,()=>{
    const bed=()=>{c.moveTo(-15,6); c.quadraticCurveTo(-18,10,-17,22); c.quadraticCurveTo(-13,34,-12,46); c.quadraticCurveTo(-24,90,-30,128); c.quadraticCurveTo(-4,134,26,128); c.quadraticCurveTo(22,90,12,46); c.quadraticCurveTo(13,34,17,22); c.quadraticCurveTo(18,10,15,6); c.quadraticCurveTo(7,5,4,10); c.quadraticCurveTo(0,14,-4,10); c.quadraticCurveTo(-7,5,-15,6); c.closePath();};
    // duvara düşen gölge (ışık sağ üstten)
    c.save(); c.translate(-7,4); c.beginPath(); bed(); c.fillStyle='rgba(0,0,0,.35)'; c.fill(); c.restore();
    c.beginPath(); bed(); c.fillStyle='rgb(196,190,172)'; c.fill();
    c.save(); c.clip();
    leke(-14,80,14,60,[0,0,0],.28); leke(10,30,10,30,[240,236,220],.35); // kıvrım gölgesi, ışık
    for(const x of[-18,-6,8]) titrek(()=>{c.moveTo(x*.4,48); c.quadraticCurveTo(x*.9,90,x*1.3+(R()-.5)*4,130);},[90,84,70],.45,.7,5130+x,1,.3); // etek pilileri
    titrek(()=>{c.moveTo(-14,46); c.quadraticCurveTo(0,49,14,46);},[90,84,70],.6,.8,5134,1,.3); // bel dikişi
    titrek(()=>{c.moveTo(-30,124); c.quadraticCurveTo(-2,130,26,124);},[60,56,46],.6,.5,5135,1,.3);  // teyel
    for(let i=0;i<9;i++){c.fillStyle='rgba(60,56,46,.7)'; c.fillRect(-27+i*6,125.5,2.6,.7);}
    c.restore();
    // tek kol (öbürü daha dikilmedi): omuzdan sarkar
    const kol=()=>{c.moveTo(15,8); c.quadraticCurveTo(24,12,26,30); c.quadraticCurveTo(28,48,25,58); c.lineTo(18,58); c.quadraticCurveTo(18,40,15,24); c.closePath();};
    c.beginPath(); kol(); c.fillStyle='rgb(178,172,154)'; c.fill(); c.save(); c.clip(); leke(17,36,4,18,[0,0,0],.25); c.restore();
    titrek(kol,MUREKKEP,.6,.7,5136,1,.4);
    titrek(bed,MUREKKEP,.7,.9,5137,2,.6);
    // dikilmemiş kol oyuğu: iğneyle tutturulmuş ağzı
    titrek(()=>{c.moveTo(-15,8); c.quadraticCurveTo(-11,16,-15,22);},MUREKKEP,.55,.6,5138,1,.3);
    for(let i=0;i<3;i++){c.fillStyle='rgba(220,220,214,.8)'; c.fillRect(-15.5+i*.6,10+i*5,3.2,.5);}
    // askı ve çivi
    titrek(()=>{c.moveTo(-17,6); c.quadraticCurveTo(0,1,17,6);},[100,80,60],.95,2.2,5139,1,.2);
    titrek(()=>{c.moveTo(0,3); c.lineTo(0,-4);},[60,58,54],.9,.7,5140,1,.1);
    agacCivi(-1,-6);
  });
}

// Nişte dürülmüş kumaş topları: uçları makineye bakan rulolar (sarmal hattı belli)
function kumasToplari(P,R,mrk){
  const [mx,my,mz]=mrk, top=[[-24,0,11],[0,0,12],[23,0,10.5],[-12,19,11],[12,19.5,11],[0,36,9.5]];
  for(const [i,[dx,dy,rr]] of top.entries()){
    const s=P.n(mx+dx,my+rr+dy,mz-6), o=P.olcek(mx+dx,my,mz-6), r=rr*o, k=KUMAS[i%KUMAS.length];
    tabana(); leke(s[0]+2,s[1]+r*.6,r*1.1,r*.5,[0,0,0],.5);
    c.beginPath(); c.arc(s[0],s[1],r,0,TAU); c.fillStyle=rgba(golgele(k,.95),1); c.fill();
    c.save(); c.clip(); leke(s[0]+r*.4,s[1]-r*.4,r*.7,r*.6,golgele(k,1.4),.45); leke(s[0]-r*.5,s[1]+r*.5,r*.8,r*.7,[0,0,0],.4); c.restore();
    titrek(()=>{for(let a=0;a<TAU*3.2;a+=.25){const u=r*.15+r*.8*a/(TAU*3.2), x=s[0]+Math.cos(a)*u, y=s[1]+Math.sin(a)*u; if(a) c.lineTo(x,y); else c.moveTo(x,y);}},[30,26,22],.4,.6,5150+i,1,.2);
    titrek(()=>{c.arc(s[0],s[1],r,0,TAU);},MUREKKEP,.75,.8,5160+i,1,.3);
  }
}

export default {
  id:'gulsum-evi',
  kamera:{odak:720, yukseklik:155, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[40,0,232], yuzey:'toprak', alan:16},
    'zemin-orta': {duzlem:'zemin', konum:[-132,0,380], yuzey:'toprak', alan:8},
    'zemin-kose': {duzlem:'zemin', konum:[-206,0,418], yuzey:'toprak', alan:4},
    'duvar':      {duzlem:'arka', konum:[-96,118,ARKA], yuzey:'siva', alan:5},
    'masa-ustu':  {duzlem:'ust', konum:[38,SEHPA.y[1],ARKA-34], yuzey:'tahta', alan:3},
    'hasir':      {duzlem:'zemin', konum:[150,0,360], yuzey:'toprak', alan:8},
    'sandik-ustu':{duzlem:'ust', konum:[194,66,334], yuzey:'tahta', alan:3, uygunsuz:['un']},
    'beden':      {duzlem:'zemin', konum:[-36,0,300], aci:-.14, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(5103), S=SEHPA;
    c.fillStyle='#0c0d0a'; c.fillRect(0,0,1000,750);
    odaDuvarlari(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON,renk:BADANA,is:.12,catlak:2,yama:{sag:[[200,-60,16,12]]},
      delik:{arka:[bosluk(PEN.x0,PEN.x1,PEN.y0,PEN.y1)]}});
    tavanCiz(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,on:ON,y:TAVAN,kirisX:[-150,-20,110,220],renk:[110,94,72]});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:5120,doku:.55});
    // süpürge izi: yay yay süpürülmüş toprak
    duzlemde(P,[-20,0,300],DUZLEM.zemin,()=>{for(let i=0;i<18;i++){const x=(R()-.5)*380, y=(R()-.5)*180; c.strokeStyle=`rgba(${R()<.5?'0,0,0':'190,180,150'},.1)`; c.lineWidth=.8; for(let k=0;k<4;k++){c.beginPath(); c.arc(x,y+k*2.4,30+R()*10,Math.PI*1.1,Math.PI*1.6); c.stroke();}}});
    odaKenarlari(P,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON});
    // pencere: aşırı pozlanmış dışarı, iki dikey ağaç kayıt ve bir yatay; denizlikte söndürülmüş gaz lambası
    duvarBoslugu(P,isik,R,{duvar:'arka',duz:ARKA,a0:PEN.x0,a1:PEN.x1,y0:PEN.y0,y1:PEN.y1,kalin:46});
    for(const x of[76,106]) kutu(P,{...isik,ortam:.15},[x-1.6,x+1.6],[PEN.y0,PEN.y1],[ARKA+20,ARKA+23],[60,50,40],5104+x,{cizgi:.4,ust:false});
    kutu(P,{...isik,ortam:.15},[PEN.x0,PEN.x1],[138,141],[ARKA+20,ARKA+23],[60,50,40],5105,{cizgi:.4,ust:false});
    gazLambasi(P,124,PEN.y0,ARKA+12,{tohum:5106});
    isikDusmesi(P,[[PEN.x0,0,ARKA-6],[PEN.x1,0,ARKA-6],[PEN.x1+40,0,250],[PEN.x0-150,0,250]],[91,0,ARKA-20],[20,0,250],.75);
    // yarım entari solda; aralarında niş, içinde kumaş topları
    entari(P,R,-168,206);
    const nm=nis(P,isik,R,{duz:ARKA,x0:-52,x1:22,y0:92,y1:176,derin:34,kemer:20});
    kumasToplari(P,R,nm);
    // hasır: pencerenin önünde, kenarları örgülü; üstünde minder
    const H=[[20,0,300],[250,0,300],[250,0,ARKA-4],[20,0,ARKA-4]];
    cokgen3(P,H,[118,106,78]);
    yuzDoku(P,H,R,{sik:34,renk:[50,42,28],alfa:.7,kalin:1.1,lek:5});
    yuzDoku(P,[H[1],H[2],H[3],H[0]],R,{sik:12,renk:[170,156,116],alfa:.25,kalin:.6,lek:0});
    hat3(P,H,MUREKKEP,.6,1.3,5107,2,1,true);
    hat3(P,[[20,.3,303],[250,.3,303]],[170,156,116],.4,2,5108,1,.4);
    // makine sehpası ve makine
    tabanGolgesi(P,isik,S.x[0],S.x[1],S.z[0],S.z[1],.6);
    kutu(P,isik,S.x,[S.y[1]-5,S.y[1]],S.z,AHSAP,5109,{cizgi:.6});
    for(const x of[S.x[0]+6,S.x[1]-6]) kutu(P,isik,[x-3,x+3],[0,S.y[1]-5],[S.z[0]+3,S.z[0]+9],AHSAP,5111+x,{cizgi:.45});
    yuzDoku(P,[[S.x[0],S.y[1],S.z[0]],[S.x[1],S.y[1],S.z[0]],[S.x[1],S.y[1],S.z[1]],[S.x[0],S.y[1],S.z[1]]],R,{sik:5,alfa:.25,lek:1});
    makine(P,R);
    // makinenin yanında: makas yeri boş, iğnelik ve bir iplik makarası (küçük, düzenli)
    duzlemde(P,[150,S.y[1],S.z[0]+20],DUZLEM.ust,()=>{leke(1,1,6,4,[0,0,0],.5); c.fillStyle='rgb(120,46,40)'; c.beginPath(); c.ellipse(0,0,5,3.6,0,0,TAU); c.fill(); for(let i=0;i<6;i++){c.strokeStyle='rgba(220,220,210,.8)'; c.lineWidth=.4; c.beginPath(); c.moveTo(-3+i,-1); c.lineTo(-4+i*1.2,-4); c.stroke();}});
    yumusakKutu(P,isik,R,[58,138],[0,12],[ARKA-128,ARKA-70],[120,84,70],5112,{yuvarlak:.35}); // minder
    // sağ duvar dibinde sandık, üstünde katlanmış kumaşlar
    sandik(P,isik,R,194,334,{en:84,boy:46,h:48,tohum:5170});
    let y=48; for(const [i,k] of [[78,6,KUMAS[0]],[72,5,KUMAS[3]],[66,6,KUMAS[2]],[60,4,KUMAS[4]]].entries()){yumusakKutu(P,isik,R,[194-k[0]/2+(i%2)*3,194+k[0]/2+(i%2)*3],[y,y+k[1]],[318,352],k[2],5180+i,{yuvarlak:.3,cizgi:.55}); y+=k[1];}
    // sol önde yün sepeti: içinde yumaklar, birinin ucu sarkar
    const sp=[-176,0,286], so=P.olcek(...sp), ss=P.n(...sp);
    tabanGolgesi(P,isik,-200,-152,270,302,.6);
    tabana(); c.save(); c.translate(ss[0],ss[1]); c.scale(so,so);
    const sep=()=>{c.moveTo(-24,-22); c.quadraticCurveTo(-22,0,-16,0); c.lineTo(16,0); c.quadraticCurveTo(22,0,24,-22); c.closePath();};
    for(const [x,y,rr,k] of [[-10,-24,8,[120,52,44]],[6,-26,8.5,[170,164,146]],[-2,-31,7,[90,90,100]]]){c.beginPath(); c.arc(x,y,rr,0,TAU); c.fillStyle=rgba(k,1); c.fill(); c.save(); c.clip(); leke(x+3,y-3,rr*.6,rr*.6,[240,236,220],.25); for(let i=0;i<5;i++){c.strokeStyle='rgba(0,0,0,.3)'; c.lineWidth=.5; c.beginPath(); c.ellipse(x,y,rr,rr*.4,i*.6,0,TAU); c.stroke();} c.restore(); titrek(()=>c.arc(x,y,rr,0,TAU),MUREKKEP,.6,.5,5190+x,1,.2);}
    c.beginPath(); sep(); c.fillStyle='rgb(112,92,62)'; c.fill(); c.save(); c.clip(); for(let i=-24;i<24;i+=3.4){c.strokeStyle='rgba(40,30,18,.6)'; c.lineWidth=.7; c.beginPath(); c.moveTo(i,-24); c.lineTo(i+2,0); c.stroke();} for(let j=0;j<4;j++){c.strokeStyle='rgba(190,170,120,.35)'; c.lineWidth=.8; c.beginPath(); c.moveTo(-24,-18+j*5); c.lineTo(24,-18+j*5); c.stroke();} leke(14,-10,10,12,[0,0,0],.35); c.restore();
    titrek(sep,MUREKKEP,.8,.9,5195,2,.5);
    titrek(()=>{c.moveTo(-10,-24); c.bezierCurveTo(-28,-20,-30,-6,-36,2);},[120,52,44],.85,1,5196,1,.2);
    c.restore();
    // sol duvar köşesinde süpürge
    // çalı süpürgesi: bağlı sap yukarıda, çalılar yere yayılır (karaltı + çizgiler)
    const sb=[[SOL+8,96,ARKA-60],[SOL+16,96,ARKA-66],[SOL+44,0,ARKA-92],[SOL+10,0,ARKA-50]]; cokgen3(P,sb,[120,104,72]);
    tabana(); c.save(); c.beginPath(); yol3(P,sb); c.clip(); const sm=P.n(SOL+24,40,ARKA-70); leke(sm[0]+10,sm[1],30,90,[0,0,0],.4); c.restore();
    for(let i=0;i<12;i++) hat3(P,[[SOL+12,92,ARKA-63],[SOL+10+i*3,0,ARKA-50-i*3.6]],[50,40,24],.55,.8,5199+i,1,.4);
    hat3(P,sb,MUREKKEP,.7,1.1,5198,2,.6,true);
    for(const y of[80,88]) hat3(P,[[SOL+8,y,ARKA-60],[SOL+19,y,ARKA-67]],[40,30,20],.9,2.2,5210+y,1,.2);
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.08});
    huzme(P,r,[[PEN.x0,PEN.y1,ARKA],[PEN.x1,PEN.y1,ARKA],[PEN.x1+40,0,250],[PEN.x0-150,0,250]],[91,160,ARKA],[20,0,260],.13,160);
    karanlik([[0,520,240,320,.5],[0,60,260,180,.45],[1000,60,260,180,.4],[1000,740,280,160,.4],[0,750,260,130,.4]]);
  }
};
