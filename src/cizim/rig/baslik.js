// Başlık: kasket, kep, yemeni (yazma), takke, sarık, şal.
// baslikArka: başın arkasına düşen kumaş (gövdeden önce çizilir). baslikOn: yüzün üstüne oturan kısım.
// baslikGovde: şalın omuzlara düşen kısmı (gövdenin en üstüne çizilir; baş oynasa da omuzda sabit kalır).
import {c} from '../teknik/tuval.js';
import {leke,tara,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,hex,rgba} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir} from './gorunus.js';
import {kumas,lifDoldur,kivrimlar} from './doku.js';
import {yuzYolu} from './yuz.js';
import {icGolge,yuzNoktalari} from './yapi.js';

const RENK={kasket:'#2e2b25', kep:'#4a4a35', yemeni:'#7d7458', takke:'#8c8672', sarik:'#9a947e', sal:'#585145'};
const renkAl=()=>hex(G.baslik.renk||RENK[G.baslik.tur]);

/* desen: yazmadaki küçük çiçek benekleri */
function benek(x0,y0,x1,y1,seed){
  const D=G.baslik.desenRenk?hex(G.baslik.desenRenk):karistir(renkAl(),'#3a1c20',.55), r=rng(seed);
  for(let i=0;i<150;i++){
    const x=x0+r()*(x1-x0), y=y0+r()*(y1-y0), s=2+r()*2.2;
    c.fillStyle=rgba(D,.38+r()*.25);
    for(let p=0;p<4;p++){const a=p/4*TAU+r(); c.beginPath(); c.arc(x+Math.cos(a)*s,y+Math.sin(a)*s,s*.6,0,TAU); c.fill();}
  }
}

/* ───────── yemeni / şal: yüzü çerçeveleyen örtü ───────── */
function ortuOlcu(){
  const sal=G.baslik.tur==='sal', Y=G.yuz, e=Y.en, u=Y.alin, b=Y.boy;
  return {sal, e, u, b, m:e*Y.elmacik, j:e*Y.cene, ju:e*Y.ceneUc,
    w:(sal?196:178)*e, ust:(sal?-240:-236)*u, alin:(sal?-120:-134)*u, alt:sal?330:300};
}
function ortuDis(O){ // başın ve yanlara düşen kumaşın dış silüeti
  const s=poz.sallanti*.4, w=O.w;
  c.moveTo(0,O.ust); c.bezierCurveTo(w*.74,O.ust,w*1.02,O.ust*.66,w,-70*O.u);
  c.bezierCurveTo(w*.99,40,w*.92+s,130,w*.7+s,210); c.bezierCurveTo(w*.56+s,250,w*.6+s,O.alt-40,w*.68+s,O.alt);
  c.quadraticCurveTo(w*.3+s,O.alt+20,s*1.5,O.alt+64); c.quadraticCurveTo(-w*.3+s,O.alt+20,-w*.68+s,O.alt); // ucu göğse düşen üçgen
  c.bezierCurveTo(-w*.6+s,O.alt-40,-w*.56+s,250,-w*.7+s,210); c.bezierCurveTo(-w*.92+s,130,-w*.99,40,-w,-70*O.u);
  c.bezierCurveTo(-w*1.02,O.ust*.66,-w*.74,O.ust,0,O.ust); c.closePath();
}
function ortuPencere(O,p){ // yüzün açıkta kalan kısmı: yüz silüetinin biraz içinde kalır, kumaş yüzün kenarını örter
  if(G.ozel) return ortuPencereOzel(O,p||c);
  const {e,b,m,j,ju}=O, a=O.alin, k=O.sal?.93:.92;
  c.moveTo(0,a); c.bezierCurveTo(-74*e,a-2,-128*e*k,a+18,-150*e*k,a+76);
  c.bezierCurveTo(-158*m*k,10,-146*m*k,84*b,-118*j*k,140*b); c.bezierCurveTo(-100*j*k,178*b,-64*ju,206*b,-32*ju,215*b);
  c.bezierCurveTo(-13*ju,220*b,13*ju,220*b,32*ju,215*b); c.bezierCurveTo(64*ju,206*b,100*j*k,178*b,118*j*k,140*b);
  c.bezierCurveTo(146*m*k,84*b,158*m*k,10,150*e*k,a+76); c.bezierCurveTo(128*e*k,a+18,74*e,a-2,0,a); c.closePath();
}
/* yeni yol: kumaş alını ve şakakları örter, yanaktan aşağısında yüzün kendi hattı görünür (kumaş yüzün arkasından
   çeneye dolanır). Böylece yüz "delikten bakan maske" değil, örtünün önünde duran bir hacim olur. */
function ortuPencereOzel(O,p){
  const N=yuzNoktalari(), a=O.alin, e=O.e, k=O.sal?.94:.93, [y1,y2,y3]=N.yanak, [c1,c2,c3]=N.cene, [u1]=N.uc;
  const t=[150*e*k,a+76];
  p.moveTo(0,a); p.bezierCurveTo(-74*e,a-2,-128*e*k,a+18,-t[0],t[1]);
  p.bezierCurveTo(-y1[0]+2,y1[1],-y2[0],y2[1],-y3[0],y3[1]); p.bezierCurveTo(-c1[0],c1[1],-c2[0],c2[1],-c3[0],c3[1]);
  p.bezierCurveTo(-u1[0],u1[1],u1[0],u1[1],c3[0],c3[1]); p.bezierCurveTo(c2[0],c2[1],c1[0],c1[1],y3[0],y3[1]);
  p.bezierCurveTo(y2[0],y2[1],y1[0]-2,y1[1],t[0],t[1]); p.bezierCurveTo(128*e*k,a+18,74*e,a-2,0,a); p.closePath();
}
// yüzün örtüye düşen gölgesi (çene ve yanak hattı boyunca) ve yüzün alt hattının yeniden çizimi
function ortuYuzGolgesi(O,k){
  const N=yuzNoktalari(), [,,y3]=N.yanak, [,,c3]=N.cene;
  leke(y3[0]+20,y3[1]+30,40,90,PAL.siyah,.75); leke(-y3[0]-12,y3[1]+30,26,80,PAL.siyah,.45);
  leke(14,c3[1]+22,c3[0]+50,18,PAL.siyah,.4);
  leke(-30,c3[1]+70,90,40,karistir(renkAl(),'#ddd4b4',.3),.22*poz.isik); // çenenin altına dolanan kumaş ışık alır
  return k;
}
function ortuOn(){
  const O=ortuOlcu(), R=renkAl(), k=poz.kaynama;
  // kumaşın yüze düşen gölgesi: alında ve iki yanda
  c.save(); c.beginPath(); yuzYolu(); c.clip();
  leke(0,O.alin+8,160*O.e,30,PAL.siyah,.6); leke(140*O.e,40,50,220,PAL.siyah,.55); leke(-140*O.e,40,34,200,PAL.siyah,.4);
  c.restore();
  const yol=()=>{ortuDis(O); ortuPencere(O);};
  c.beginPath(); yol(); c.save(); c.clip('evenodd');
  const g=c.createLinearGradient(-O.w,O.ust,O.w,O.alt);
  g.addColorStop(0,rgba(karistir(R,'#cfc8a8',.18),1)); g.addColorStop(.4,rgba(R,1)); g.addColorStop(1,rgba(karistir(R,[0,0,0],.8),1));
  c.fillStyle=g; c.fillRect(-O.w-20,O.ust-10,O.w*2+40,O.alt-O.ust+90);
  if(!O.sal&&G.baslik.desen!=='duz') benek(-O.w,O.ust,O.w,O.alt,63);
  if(O.sal){ // kaba yün: kısa lifler
    const r=rng(66); for(let i=0;i<700;i++){const x=-O.w+r()*O.w*2, y=O.ust+r()*(O.alt-O.ust), a=r()*TAU, L=3+r()*6; c.strokeStyle=rgba(r()<.5?karistir(R,'#d0c6a6',.3):karistir(R,[0,0,0],.5),.22+r()*.2); c.lineWidth=1+r(); c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L); c.stroke();}
  }
  leke(-O.w*.5,O.ust+80,O.w*.42,80,karistir(R,'#ddd4b4',.3),.3*poz.isik,-.4);
  leke(O.w*.8,60,O.w*.5,300,PAL.siyah,.75);
  leke(0,O.alt-10,O.w*.9,110,PAL.siyah,G.ozel?.35:.55);
  leke(0,250*O.b,120,50,PAL.siyah,G.ozel?.18:.5); // çenenin altındaki gölge
  if(G.ozel){ ortuKivrim(O,R,k); ortuYuzGolgesi(O,k); }
  tara(O.w*.15,O.ust,O.w+10,O.alt+70,1.05,7,PAL.murekkep,.42,640+k,1.1);
  if(G.ozel) tara(0,150,O.w,O.alt+70,.4,9,PAL.murekkep,.22,641+k,1); // yeni yol: yalnızca gölge yanı
  else tara(-O.w,150,O.w,O.alt+70,.4,9,PAL.murekkep,.22,641+k,1);
  if(!G.ozel){ // kıvrımlar: yanlarda düşen ve çenenin altında toplanan
    c.strokeStyle=rgba(PAL.murekkep,.45); c.lineWidth=1.4;
    for(const s of[-1,1]){ c.beginPath(); c.moveTo(s*O.w*.84,-40); c.quadraticCurveTo(s*O.w*.86,120,s*O.w*.58,O.alt-50); c.stroke();
      c.beginPath(); c.moveTo(s*O.w*.66,O.ust*.62); c.quadraticCurveTo(s*O.w*.96,-120,s*O.w*.92,0); c.stroke();
      c.beginPath(); c.moveTo(s*70,236*O.b); c.quadraticCurveTo(s*30,262*O.b,-s*10,O.alt-30); c.stroke(); }
  }
  c.restore();
  titrek(()=>{ortuDis(O);},PAL.murekkep,.85,1.8,642+k,2,2.2);
  if(G.ozel){ ortuKenar(O,R,k);
    // yüzün yanak-çene hattı kumaşın önünde: mürekkebi yeniden çiz (yalnızca alın kenarının altında)
    c.save(); c.beginPath(); c.rect(-400,O.alin+80,800,600); c.clip(); titrek(()=>{yuzYolu();},PAL.murekkep,.8,2,646+k,2,2.2); c.restore(); }
  else titrek(()=>{ortuPencere(O);},PAL.murekkep,.75,1.5,643+k,2,1.8);
  if(!O.sal){ // oya: alın kenarında küçük dişler
    const a=O.alin, r=rng(64); c.fillStyle=rgba(karistir(R,'#e0d6b0',.3),.55);
    for(let i=0;i<15;i++){const t=-1+i/7, x=t*112*O.e, y=a+16*t*t-1; c.beginPath(); c.arc(x,y+1,2.2+r()*.8,0,TAU); c.fill();}
  }
}
/* yeni yol: kumaşın ağırlığı. Yüzün çevresinde içe dönen kalın kenar, şakaktan ve çeneden inen kıvrımlar
   (her kıvrımın bir yanı aydınlık, öbür yanı koyu), kıvrım hatları titrek mürekkeple. Kumaş kırpılmışken çizilir. */
function ortuKivrim(O,R,k){
  const r=rng(650), w=O.w, a=O.alin;
  const kivrim=(P,g)=>{ // P: bezier noktaları [x0,y0,x1,y1,x2,y2,x3,y3]; g: gölgenin yönü (sağ/sol)
    c.lineCap='round';
    // kıvrımın gölgesi: tek düz şerit değil, uca doğru incelen birkaç yumuşak leke
    for(let t=.15;t<.95;t+=.2){const q=1-t, x=q*q*q*P[0]+3*q*q*t*P[2]+3*q*t*t*P[4]+t*t*t*P[6], y=q*q*q*P[1]+3*q*q*t*P[3]+3*q*t*t*P[5]+t*t*t*P[7];
      leke(x+g*9,y,10+r()*6,30+r()*16,PAL.siyah,.2+r()*.12); leke(x-g*7,y,6,22,karistir(R,'#ddd4b4',.35),.1*poz.isik);}
  };
  const hat=[];
  for(const s of[-1,1]){
    // şakaktan omuza düşen uzun kıvrımlar
    for(let i=0;i<3;i++){const x0=s*(w*.62+i*w*.1), P=[x0,-150*O.u+i*30,s*(w*.8+i*8),-40,s*(w*.84+i*6+r()*10),140,s*(w*.6+i*w*.1),O.alt-30-i*20]; kivrim(P,-s); hat.push(P);}
    // çenenin altında toplanan kıvrımlar (düğüme doğru)
    for(let i=0;i<1;i++){const P=[s*(96-i*16),(214+i*8)*O.b,s*(84-i*10),(250+i*10)*O.b,s*(40-i*8),O.alt-40+i*10,s*(6+i*6),O.alt+20+i*12]; kivrim(P,s); hat.push(P);}
    // alnın üstünde kumaşın gerildiği çapraz kıvrım
    const P=[s*40,O.ust+20,s*w*.5,O.ust+30,s*w*.7,a-40,s*w*.78,a+20]; kivrim(P,s); hat.push(P);
  }
  c.save(); c.globalAlpha=1;
  hat.forEach((P,i)=>{c.setLineDash([40+i*7%30,14+i*5%20,70,22]); // kopuk, elle çekilmiş kıvrım hattı
    titrek(()=>{c.moveTo(P[0],P[1]); c.bezierCurveTo(P[2],P[3],P[4],P[5],P[6],P[7]);},PAL.murekkep,.4+(P[0]>0?.15:0),1.2,655+i+k,2,1.8);});
  c.setLineDash([]);
  c.restore();
  // yüzün çevresindeki kalın kenar: kumaş içe döner, ışık yanında aydınlık bir şerit, gölge yanında koyu
  c.save(); c.lineJoin='round'; c.beginPath(); c.rect(-400,-400,800,a+400+120); c.clip();
  c.beginPath(); ortuPencere(O); c.lineWidth=26; c.strokeStyle=rgba(karistir(R,[0,0,0],.3),.3); c.stroke();
  c.save(); c.beginPath(); c.rect(-400,-400,400*O.e,900); c.clip(); // aydınlık şerit yalnızca ışık yanında
  c.beginPath(); ortuPencere(O); c.lineWidth=12; c.strokeStyle=rgba(karistir(R,'#e0d6b6',.25),.28*poz.isik); c.stroke(); c.restore();
  leke(w*.62,40,80,200,PAL.siyah,.5); // kenarın gölge yanı
  c.restore();
}
function ortuKenar(O,R,k){
  // pencere hattı ve onun 12 birim dışında kenarın dönüş hattı: kalınlığı veren iki mürekkep
  c.save(); c.beginPath(); c.rect(-400,-400,800,O.alin+400+110); c.clip();
  titrek(()=>{ortuPencere(O);},PAL.murekkep,.85,1.9,643+k,2,1.8);
  c.translate(0,-4); c.scale(1.075,1.05);
  titrek(()=>{ortuPencere(O);},PAL.murekkep,.38,1.2,644+k,2,2.4);
  c.restore();
}
// yüzün üstüne düşen gölge (saçtan ve başlıktan önce): örtünün içe gölgesi ve örtünün altından görünen saç
export function baslikGolge(){
  const t=G.baslik.tur;
  if(t==='yemeni'||t==='sal'){
    const O=ortuOlcu();
    c.save(); c.beginPath(); yuzYolu(); c.clip();
    ortuSac(O);
    icGolge(()=>ortuPencere(O),46,10,18,.97);
    icGolge(()=>ortuPencere(O),14,3,5,.8);
    c.restore();
  }
}
// örtünün alın kenarından görünen saç: ortadan ayrılmış, iki yana taranmış (yaşlıda kır ve seyrek)
function ortuSac(O){
  const R=G.renk, e=O.e, a=O.alin, kir=G.yasIzi.kirSac;
  const yol=()=>{c.moveTo(0,a-14); c.lineTo(-150*e,a-14); c.lineTo(-150*e,a+96); c.bezierCurveTo(-120*e,a+70,-84*e,a+44,-40*e,a+28); c.quadraticCurveTo(-12*e,a+20,0,a+8);
    c.quadraticCurveTo(12*e,a+20,40*e,a+28); c.bezierCurveTo(84*e,a+44,120*e,a+70,150*e,a+96); c.lineTo(150*e,a-14); c.closePath();};
  lifDoldur(yol,[-150*e,a-14,150*e,a+96],{renk:R.sac,koyu:R.sacKoyu,isik:R.sacIsik,n:kir>.5?160:260,boy:30,
    yon:x=>x<0?Math.PI*.96:Math.PI*.04,dag:.35,kivrim:.5,seed:657,acik:kir>.5?.5:.22,parlak:.6});
  leke(0,a+6,26,10,R.tenGolge,.6); // ayrım çizgisinde ten
}
function ortuArka(){
  const O=ortuOlcu(), R=karistir(renkAl(),[0,0,0],.45), s=poz.sallanti*.5;
  const yol=()=>{c.moveTo(-O.w*.9,-100); c.bezierCurveTo(-O.w*1.05,100,-O.w*1.2+s,300,-O.w*1.25+s,470); c.lineTo(O.w*1.25+s,470); c.bezierCurveTo(O.w*1.2+s,300,O.w*1.05,100,O.w*.9,-100); c.closePath();};
  kumas(yol,[-O.w*1.25,-100,O.w*1.25,470],{renk:R,seed:670,tara:.9,golge:1});
}

/* ───────── şapkalar ───────── */
function siperGolgesi(alt,e){ // siperin alına ve gözlere düşen gölgesi
  c.save(); c.beginPath(); yuzYolu(); c.clip();
  const g=c.createLinearGradient(0,alt,0,alt+124); g.addColorStop(0,'rgba(4,3,5,.95)'); g.addColorStop(.5,'rgba(4,3,5,.72)'); g.addColorStop(1,'rgba(4,3,5,0)');
  c.fillStyle=g; c.fillRect(-200*e,alt-10,400*e,140);
  leke(0,-6,190*e,44,PAL.siyah,.2);
  c.restore();
}
// şapkanın kafanın yanlarına (kulak, şakak saçı) düşürdüğü gölge
function yanGolge(alt,e){
  for(const s of[-1,1]) leke(s*150*e,alt+46,46*e,64,PAL.siyah,s>0?.75:.5);
  leke(0,alt+20,170*e,26,PAL.siyah,.35);
}
function kasketOzel(){ // yeni yol: kabarık, öne sarkan tepe; kumaş kıvrımı ve dikiş; yanlara düşen gölge
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-126*u;
  siperGolgesi(alt,e); yanGolge(alt,e);
  const tepe=()=>{c.moveTo(-172*e,alt+2); c.bezierCurveTo(-200*e,alt-40,-196*e,-232*u,-90*e,-252*u); c.bezierCurveTo(10*e,-270*u,150*e,-262*u,196*e,-210*u);
    c.bezierCurveTo(222*e,-180*u,214*e,alt-14,182*e,alt-4); c.quadraticCurveTo(0,alt+18,-172*e,alt+2); c.closePath();};
  kumas(tepe,[-200*e,-270*u,222*e,alt+18],{renk:R,seed:680,tara:1,desen:()=>{
    const r=rng(683); for(let i=0;i<700;i++){c.fillStyle=rgba(r()<.5?karistir(R,'#cfc6a4',.35):[0,0,0],.22+r()*.25); c.fillRect(-200*e+r()*420*e,-270*u+r()*150,1.6,1.6);}
    // tepenin öne sarkan kabarıklığı: altında koyu, üstünde ışık
    leke(-20*e,alt-14,190*e,20,PAL.siyah,.55); leke(-70*e,-236*u,90*e,18,karistir(R,'#d8d0b0',.3),.25*poz.isik,-.2);
    // kumaş kıvrımları: aydınlık-koyu çift
    for(const [x0,y0,x1,y1] of [[-120,-238,-150,alt+4],[-20,-252,-40,alt+8],[70,-248,110,alt+2],[150,-226,176,alt-6]]){
      c.lineCap='round'; c.strokeStyle=rgba(PAL.siyah,.16); c.lineWidth=10; c.beginPath(); c.moveTo(x0*e+6,y0*u); c.quadraticCurveTo((x0+x1)/2*e+16,(y0*u+y1)/2,x1*e+6,y1); c.stroke();
      c.strokeStyle=rgba(karistir(R,'#d8d0b0',.3),.08*poz.isik); c.lineWidth=5; c.beginPath(); c.moveTo(x0*e-5,y0*u); c.quadraticCurveTo((x0+x1)/2*e+4,(y0*u+y1)/2,x1*e-5,y1); c.stroke();
    }
  }});
  titrek(()=>{c.moveTo(-90*e,-252*u); c.quadraticCurveTo(-140*e,-190*u,-150*e,alt+2); c.moveTo(-90*e,-252*u); c.quadraticCurveTo(40*e,-200*u,110*e,alt+2); c.moveTo(150*e,-226*u); c.quadraticCurveTo(178*e,-170*u,176*e,alt-6);},PAL.murekkep,.45,1.2,681+k,2,1.6);
  // ön düğme
  c.fillStyle=rgba(karistir(R,[0,0,0],.4),1); c.beginPath(); c.arc(-40*e,alt-8,6,0,TAU); c.fill();
  const siper=()=>{c.moveTo(-156*e,alt+4); c.quadraticCurveTo(0,alt+20,156*e,alt+4); c.quadraticCurveTo(10*e,alt+66,-156*e,alt+4); c.closePath();};
  c.beginPath(); siper(); c.fillStyle='#0b0a09'; c.fill();
  c.save(); c.clip(); leke(-60*e,alt+16,90*e,8,karistir(R,'#d0c8a8',.25),.4*poz.isik); c.restore();
  titrek(siper,PAL.murekkep,.85,1.8,682+k,2,1.8);
}
function kasket(){
  if(G.ozel) return kasketOzel();
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-128*u;
  siperGolgesi(alt,e);
  const tepe=()=>{c.moveTo(-168*e,alt-2); c.bezierCurveTo(-190*e,-168*u,-176*e,-226*u,-60*e,-236*u); c.bezierCurveTo(70*e,-246*u,196*e,-224*u,190*e,alt-6); c.quadraticCurveTo(0,alt+14,-168*e,alt-2); c.closePath();};
  kumas(tepe,[-190*e,-246*u,196*e,alt+14],{renk:R,seed:680,tara:1,desen:()=>{ // tüvit: küçük benekler
    const r=rng(683); for(let i=0;i<500;i++){c.fillStyle=rgba(r()<.5?karistir(R,'#cfc6a4',.35):[0,0,0],.25+r()*.25); c.fillRect(-190*e+r()*386*e,-246*u+r()*130,1.5,1.5);}}});
  // dikiş hatları
  titrek(()=>{c.moveTo(-60*e,-236*u); c.quadraticCurveTo(-110*e,-190*u,-140*e,alt-4); c.moveTo(-60*e,-236*u); c.quadraticCurveTo(40*e,-190*u,100*e,alt+4);},PAL.murekkep,.4,1.1,681+k,2,1.6);
  const siper=()=>{c.moveTo(-150*e,alt+2); c.quadraticCurveTo(0,alt+16,150*e,alt+2); c.quadraticCurveTo(0,alt+62,-150*e,alt+2); c.closePath();};
  c.beginPath(); siper(); c.fillStyle='#0b0a09'; c.fill();
  c.save(); c.clip(); leke(-60*e,alt+14,90*e,8,karistir(R,'#d0c8a8',.25),.4*poz.isik); c.restore();
  titrek(siper,PAL.murekkep,.85,1.6,682+k,2,1.8);
}
function kep(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=-134*u, bant=-186*u;
  siperGolgesi(alt,e); if(G.ozel) yanGolge(alt,e);
  const tepe=()=>{c.moveTo(-156*e,bant+4); c.bezierCurveTo(-196*e,-214*u,-196*e,-252*u,-120*e,-260*u); c.quadraticCurveTo(0,-272*u,120*e,-260*u); c.bezierCurveTo(196*e,-252*u,196*e,-214*u,156*e,bant+4); c.quadraticCurveTo(0,bant+12,-156*e,bant+4); c.closePath();};
  kumas(tepe,[-196*e,-272*u,196*e,bant+12],{renk:R,seed:690,tara:1});
  const serit=()=>{c.moveTo(-156*e,bant+4); c.quadraticCurveTo(0,bant+12,156*e,bant+4); c.lineTo(152*e,alt-2); c.quadraticCurveTo(0,alt+8,-152*e,alt-2); c.closePath();};
  kumas(serit,[-156*e,bant,156*e,alt+8],{renk:karistir(R,[0,0,0],.45),seed:691,tara:.7});
  // çene kayışı ve arma
  titrek(()=>{c.moveTo(-140*e,alt-12); c.quadraticCurveTo(0,alt-2,140*e,alt-12);},hex('#1c1712'),.9,3,692+k,2,1.4);
  c.fillStyle='#6e5d32'; c.beginPath(); c.arc(0,bant-14,11,0,TAU); c.fill();
  c.fillStyle='#2a2412'; c.beginPath(); c.arc(2,bant-14,7,0,TAU); c.fill(); c.fillStyle='#6e5d32'; c.beginPath(); c.arc(5,bant-14,5.5,0,TAU); c.fill();
  leke(-4,bant-18,6,4,hex('#d8c48a'),.5*poz.isik);
  titrek(()=>{c.arc(0,bant-14,11,0,TAU);},PAL.murekkep,.6,1.2,693+k,2,1);
  const siper=()=>{c.moveTo(-156*e,alt-2); c.quadraticCurveTo(0,alt+10,156*e,alt-2); c.quadraticCurveTo(0,alt+66,-156*e,alt-2); c.closePath();};
  c.beginPath(); siper(); c.fillStyle='#060606'; c.fill();
  c.save(); c.clip(); leke(-50*e,alt+12,100*e,7,hex('#b8b4a0'),.45*poz.isik); c.restore();
  titrek(siper,PAL.murekkep,.9,1.6,694+k,2,1.8);
}
function takke(){
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama, alt=G.baslik.tur==='sarik'?-170*u:-150*u;
  const yol=()=>{c.moveTo(-132*e,alt); c.bezierCurveTo(-140*e,-236*u,-60*e,-250*u,0,-250*u); c.bezierCurveTo(60*e,-250*u,140*e,-236*u,132*e,alt); c.quadraticCurveTo(0,alt+10,-132*e,alt); c.closePath();};
  kumas(yol,[-140*e,-250*u,140*e,alt+10],{renk:R,seed:700,tara:.7,desen:()=>{const r=rng(701); c.fillStyle=rgba(karistir(R,[0,0,0],.4),.5); for(let i=0;i<220;i++) c.fillRect(-140*e+r()*280*e,-250*u+r()*(alt+250*u),1.6,1.6);}});
  titrek(()=>{c.moveTo(-128*e,alt-8); c.quadraticCurveTo(0,alt+2,128*e,alt-8);},PAL.murekkep,.4,1.1,702+k,2,1.4);
}
function sarik(){
  takke();
  const Y=G.yuz, e=Y.en, u=Y.alin, R=renkAl(), k=poz.kaynama;
  const yol=()=>{c.moveTo(-176*e,-132*u); c.bezierCurveTo(-206*e,-168*u,-190*e,-214*u,-120*e,-218*u); c.quadraticCurveTo(0,-226*u,120*e,-218*u); c.bezierCurveTo(190*e,-214*u,206*e,-168*u,176*e,-132*u); c.quadraticCurveTo(0,-112*u,-176*e,-132*u); c.closePath();};
  c.save(); c.beginPath(); yuzYolu(); c.clip(); leke(0,-100*u,180*e,34,PAL.siyah,.6); c.restore();
  kumas(yol,[-206*e,-226*u,206*e,-112*u],{renk:R,seed:710,tara:.8});
  // sargı katları
  for(let i=0;i<4;i++){ titrek(()=>{c.moveTo(-170*e,(-140-i*20)*u); c.bezierCurveTo(-90*e,(-178-i*14)*u,60*e,(-128-i*20)*u,180*e,(-170-i*12)*u);},PAL.murekkep,.45,1.2,711+i+k,2,1.6); }
}

export function baslikArka(){
  const t=G.baslik.tur;
  if(t==='yemeni'||t==='sal') ortuArka();
}
export function baslikOn(){
  const t=G.baslik.tur;
  if(t==='yok') return;
  if(t==='yemeni'||t==='sal') ortuOn();
  else if(t==='kasket') kasket();
  else if(t==='kep') kep();
  else if(t==='takke') takke();
  else if(t==='sarik') sarik();
}
export function baslikGovde(X,erit){ // X: omuz eşlemesi, erit(yol): alt kenarı etek rengine eritir (govde.js)
  if(G.baslik.tur!=='sal') return;
  const R=renkAl();
  for(const s of[-1,1]){
    const yol=()=>{c.moveTo(s*70,748); c.bezierCurveTo(s*170,756,X(s*300),800,X(s*350),880); c.bezierCurveTo(X(s*390),960,X(s*396),1100,X(s*400),1300);
      c.lineTo(s*150,1300); c.bezierCurveTo(s*170,1100,s*150,940,s*96,850); c.quadraticCurveTo(s*70,800,s*70,748); c.closePath();};
    const ozel=G.ozel, KR=ozel?karistir(R,[0,0,0],s>0?.4:.22):s>0?karistir(R,[0,0,0],.15):R;
    kumas(yol,[s<0?X(-400):40,740,s<0?-40:X(400),1300],{renk:KR,seed:720+s,tara:1,golge:s>0?1:.6,desen:ozel?()=>{
      // yün şalın ağır kıvrımları: omuzdan sarkan, göğüste toplanan
      kivrimlar([[[s*110,800,X(s*200),880,X(s*230),1000,X(s*210),1220],s,1.2],[[s*170,790,X(s*280),860,X(s*320),1000,X(s*330),1240],-s,1],
        [[s*100,860,s*130,960,s*150,1080,s*160,1240],s,.9],[[X(s*300),840,X(s*360),930,X(s*380),1080,X(s*390),1250],s,.7]],KR,730+(s>0?10:0));
      leke(s*120,800,70,40,PAL.siyah,.5); // başın şala düşen gölgesi
    }:null});
    if(erit) erit(yol);
    if(!ozel){
      c.strokeStyle=rgba(PAL.murekkep,.4); c.lineWidth=1.3;
      for(let i=0;i<3;i++){c.beginPath(); c.moveTo(s*(110+i*50),800+i*14); c.quadraticCurveTo(X(s*(200+i*50)),950,X(s*(180+i*60)),1200); c.stroke();}
    }
  }
}
