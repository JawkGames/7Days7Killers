// Yüz yapısı: yaşın, cinsiyetin ve kemik yapısının yüze yazılması (yalnızca G.ozel; varsayılan kadın eski yolla çizilir).
// Işık her karakterde aynıdır (soldan-yukarıdan, sahnenin tek ışığı); farkı gölgenin düştüğü yer verir:
// derin göz çukuru, elmacık altı çukuru, şakak, sarkık çene altı, gençte dolgun yanak.
// Tarama yalnızca gölgeli bölgelerde kalır: her bölge kendi eğri biçimine kırpılır (kutu görünmesin).
import {c} from '../teknik/tuval.js';
import {leke,tara,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {rgba,clamp} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir} from './gorunus.js';

const KUF=[70,82,58], SARI=[150,128,78];
// görünüşün kimliğinden sabit bir tohum: aynı karakter her karede aynı boya dokusunu alır
export function kimlikTohum(){let h=17; for(const ch of G.id) h=(h*31+ch.charCodeAt(0))|0; return Math.abs(h)%9000;}

/* Yüz silüeti (yeni yol): şakak çukuru, belirgin elmacık, köşeli ya da sarkık çene */
// yüz silüetinin noktaları (sağ yan; sol yan aynası). Başlığın yüz penceresi de bunları kullanır.
export function yuzNoktalari(){
  const Y=G.yuz, P=G.yapi, e=Y.en, m=e*Y.elmacik, j=e*Y.cene, ju=e*Y.ceneUc, b=Y.boy, u=Y.alin;
  const sk=P.sakak*8, km=P.kemik*6, sr=P.sarkik, ko=G.cinsiyet==='E'?P.kemik:0, dl=P.dolgun;
  // yuvarlak çene (varsayılan biçim) ile köşeli çene (düz çene hattı, çukur yanak) arasında ko oranında geçiş
  const L=(a,b2,t)=>a+(b2-a)*t;
  const kose=[118*j+sr*7+ko*8,(140+sr*10+ko*14)*b], ucN=[32*ju+ko*10,(215+sr*5)*b];
  const yuvC1=[100*j+sr*9,(178+sr*18)*b], yuvC2=[64*ju+sr*4,(206+sr*12)*b];
  const duzC1=[L(kose[0],ucN[0],.38)+4,L(kose[1],ucN[1],.38)+6], duzC2=[L(kose[0],ucN[0],.74)+2,L(kose[1],ucN[1],.74)+4];
  return {
    alin:[[95*e,-202*u],[152*e-sk*.6,-150*u],[158*e-sk,-50*u]],
    // yanak: genç ve dolguda yuvarlak, kemikli yüzde elmacıkta çıkıntı ve altında çukur, erkekte köşeli çene açısı
    yanak:[[161*m+km+dl*3,(20-ko*14)*b],[L(146*m+dl*6,136*m,ko),(88+ko*16)*b],kose],
    cene:[[L(yuvC1[0],duzC1[0],ko),L(yuvC1[1],duzC1[1],ko)],[L(yuvC2[0],duzC2[0],ko),L(yuvC2[1],duzC2[1],ko)],ucN],
    uc:[[L(13*ju,18*ju,ko),(220+sr*5-ko*2)*b]]
  };
}
export function yuzYoluOzel(p){
  p=p||c; const N=yuzNoktalari(), [a1,a2,a3]=N.alin, [y1,y2,y3]=N.yanak, [c1,c2,c3]=N.cene, [u1]=N.uc;
  p.moveTo(0,-200*G.yuz.alin);
  p.bezierCurveTo(a1[0],a1[1],a2[0],a2[1],a3[0],a3[1]); p.bezierCurveTo(y1[0],y1[1],y2[0],y2[1],y3[0],y3[1]); p.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],c3[0],c3[1]);
  p.bezierCurveTo(u1[0],u1[1],-u1[0],u1[1],-c3[0],c3[1]);
  p.bezierCurveTo(-c2[0],c2[1],-c1[0],c1[1],-y3[0],y3[1]); p.bezierCurveTo(-y2[0],y2[1],-y1[0],y1[1],-a3[0],a3[1]); p.bezierCurveTo(-a2[0],a2[1],-a1[0],a1[1],0,-200*G.yuz.alin);
  p.closePath();
}

// kırpılmış eğri bölgede tarama (kutu kenarı görünmez)
function bolgeTara(x,y,rx,ry,don,aci,aralik,alfa,seed,kalin){
  if(alfa<=.01) return;
  c.save(); c.beginPath(); c.ellipse(x,y,rx,ry,don,0,Math.PI*2); c.clip();
  const R=Math.max(rx,ry); tara(x-R,y-R,x+R,y+R,aci,aralik,PAL.murekkep,alfa,seed,kalin);
  c.restore();
}

/* Boya: yüz kırpılmışken, taban lekelerinden sonra çizilir */
export function yapiBoya(fx,fy,mx,dyA){
  const Y=G.yuz, P=G.yapi, R=G.renk, A=G.yasIzi, e=Y.en, b=Y.boy, u=Y.alin, ga=Y.gozAralik, I=poz.isik, k=poz.kaynama;
  const erkek=G.cinsiyet==='E', tohum=kimlikTohum();
  // çamurlu boya dokusu: geniş, kısa fırça darbeleri (vektör pürüzsüzlüğünü kırar); tohum sabit, kaynamaz
  const r=rng(900+tohum); c.lineCap='round';
  const yasli=clamp((G.yas-35)/40,0,1);
  for(let i=0;i<170;i++){
    const x=(-150+r()*300)*e, y=(-190+r()*400)*b, sol=x<0;
    const renk=[sol?R.tenIsik:R.tenGolge,R.tenOrta,PAL.morluk,KUF,SARI,R.tenDerin][Math.floor(r()*6)];
    // fırça yönü yüzün biçimini izler: alında yatay, yanakta elmacıktan ağza doğru çapraz
    const a=y<-90?(r()-.5)*.6:Math.PI/2+Math.sign(x||1)*-.7+(r()-.5)*.6, L=10+r()*22;
    c.strokeStyle=rgba(renk,(.05+r()*.08)*(.8+yasli*.6)); c.lineWidth=5+r()*11;
    c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+Math.cos(a)*L*.5+(r()-.5)*8,y+Math.sin(a)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L); c.stroke();
  }
  // gençlik: dolgun, yuvarlak yanak ışığı ve hafif kan rengi
  if(P.dolgun>0){
    leke(-84*e+fx*.4,76*b,58*e,44,R.tenIsik,.2*P.dolgun*I);
    for(const s of[-1,1]) leke(s*84*e+fx*.4,96*b,40,26,[128,76,66],(s<0?.13:.07)*P.dolgun);
    leke(-6+fx*.5,196*b+dyA*.3,34,16,R.tenIsik,.16*P.dolgun*I); // dolgun çene ucu
  }
  // derin göz çukuru: kaş kemerinin altına inen karanlık (yaşla, erkekte daha derin)
  for(const s of[-1,1]){
    leke(s*ga+fx,-26+fy,58,24,R.tenDerin,(s>0?.42:.3)*clamp(P.cukur-.5,0,1));
    leke(s*(ga+30)+fx,8+fy,22,30,R.tenDerin,(s>0?.35:.2)*clamp(P.cukur-.6,0,1)); // dış köşe çöküntüsü
  }
  // şakak çukuru
  for(const s of[-1,1]) leke(s*140*e,-66*u,30,62,R.tenDerin,(s>0?.6:.42)*P.sakak);
  // elmacık: üstünde ışık, altında çapraz inen çukur
  const km=P.kemik;
  leke(-106*e+fx*.4,34*b,46,15,R.tenIsik,(.12+.2*km)*I*(1-P.dolgun*.5),-.35);
  for(const s of[-1,1]) leke(s*96*e+fx*.4,112*b,24+8*km,66,R.tenDerin,(s>0?.5:.32)*(.15+.6*km)*(1-P.dolgun*.7),s*-.45);
  // burun-dudak oluğunun ışık yanındaki gölgesi (yaşla)
  const y01=clamp((G.yas-30)/40,0,1);
  if(y01>0) for(const s of[-1,1]) leke(s*(50*e)+mx,150+dyA*.6,12,34,R.tenDerin,(s>0?.4:.3)*y01,s*-.4);
  // çene altı sarkması: çene hattının altında gıdı, yanlarda düşük yanak
  if(P.sarkik>0){
    for(const s of[-1,1]) leke(s*92*e,196*b,40,26,R.tenDerin,(s>0?.55:.35)*P.sarkik,s*.4);
    leke(0,232*b,90*e,20,R.tenDerin,.45*P.sarkik);
  }
  // alt dudağın altındaki çukur ve çene ucu ışığı
  leke(mx,198+dyA,30,8,R.tenDerin,.3+.2*y01);
  leke(-12+fx*.4,214*b,28,12,R.tenIsik,.12*I);
  if(erkek) leke(fx*.6,-58*u,120*e,16,R.tenIsik,.1*I); // kaş kemerinin üstünde ışık: çıkıntı
  // yapı taraması: yalnızca gölge bölgeleri, karaktere göre (yaşlı ve kemikli yüzde daha çok)
  for(const s of[-1,1]){
    const g=s>0?1:.4;
    bolgeTara(s*98*e,112*b,30+8*km,62,s*-.45,1.05,5,.36*g*(.2+.8*km)*(1-P.dolgun*.8),800+s+k,1);
    bolgeTara(s*142*e,-66*u,26,58,0,.9,5,.34*g*P.sakak,804+s+k,1);
    bolgeTara(s*(ga+26)+fx,4+fy,40,26,s*.3,-.5,4.5,.28*g*clamp(P.cukur-.7,0,1),806+s+k,1);
    if(P.sarkik>0) bolgeTara(s*90*e,200*b,40,24,s*.4,.7,5,.32*g*P.sarkik,808+s+k,1);
  }
  // ışıkla gölgenin buluştuğu hat boyunca sık tarama: elle çizilmiş portrenin asıl gölgesi burada
  bolgeTara(34*e,10*b,30,200*b,0,1.15,4.5,.26*(1-.45*P.dolgun),812+k,1);
  bolgeTara(28*e,-120*u,40,50,.2,.6,5,.18,813+k,1);
  if(A.kirisik>.4) bolgeTara(mx+44,150+dyA*.6,14,34,-.4,1.1,4,.3*A.kirisik,810+k,1);
}

/* Hatlar: değişken kalınlıkta yüz çizgisi ve yapı hatları (kafa, yüz hattının yerine) */
export function yapiHat(fx,mx,dyA){
  const Y=G.yuz, P=G.yapi, e=Y.en, b=Y.boy, u=Y.alin, k=poz.kaynama, y01=clamp((G.yas-30)/40,0,1);
  // yüz hattı: ışık yanında ince ve soluk, gölge yanında ve çene altında kalın mürekkep
  // sakal varsa çene hattı sakalın altında kalır: hat yalnızca sakalın üstünde çizilir
  const sakalli=G.sakal.bicim!=='yok'&&G.sakal.bicim!=='kirli', altSinir=sakalli?30:400;
  c.save(); c.beginPath(); c.rect(-400,-400,800,400+altSinir); c.clip();
  titrek(()=>{yuzYoluOzel();},PAL.murekkep,.55,1.2,510+k,2,2.2);
  c.beginPath(); c.rect(-30*e,-260,400,600); c.clip();
  titrek(()=>{yuzYoluOzel();},PAL.murekkep,.75,2.1,512+k,2,2.6);
  c.restore();
  if(!sakalli){ c.save(); c.beginPath(); c.rect(-300,150*b,600,200); c.clip();
    titrek(()=>{yuzYoluOzel();},PAL.murekkep,.6,2,514+k,2,2.4);
    c.restore(); }
  // elmacık hattı: ışık yanında kırık kısa çizgi
  if(P.kemik>.25) titrek(()=>{c.moveTo(-132*e,30*b); c.quadraticCurveTo(-118*e,70*b,-98*e,104*b);},PAL.murekkep,.38*P.kemik*(1-P.dolgun*.6),1.2,516+k,2,1.8);
  if(P.kemik>.25) titrek(()=>{c.moveTo(132*e,30*b); c.quadraticCurveTo(118*e,70*b,100*e,108*b);},PAL.murekkep,.5*P.kemik*(1-P.dolgun*.6),1.4,517+k,2,1.8);
  // şakak çukuru kıvrımı
  if(P.sakak>.3) for(const s of[-1,1]) titrek(()=>{c.moveTo(s*128*e,-120*u); c.quadraticCurveTo(s*118*e,-70*u,s*130*e,-20);},PAL.murekkep,.3*P.sakak,1.1,518+s+k,2,1.6);
  // filtrum ve çene çukuru
  titrek(()=>{c.moveTo(mx-7,116+dyA*.5); c.lineTo(mx-9,136+dyA*.8); c.moveTo(mx+8,116+dyA*.5); c.lineTo(mx+9,136+dyA*.8);},PAL.murekkep,.22,1,519+k,2,1.2);
  titrek(()=>{c.moveTo(mx-22,198+dyA); c.quadraticCurveTo(mx,206+dyA,mx+24,197+dyA);},PAL.murekkep,.22+.25*y01,1.2,520+k,2,1.4);
  // sarkık gıdı hattı
  if(P.sarkik>.2) titrek(()=>{c.moveTo(-70*e,228*b); c.quadraticCurveTo(0,252*b+P.sarkik*8,74*e,226*b);},PAL.murekkep,.4*P.sarkik,1.3,521+k,2,2);
  // erkek: köşeli çene açısının altında koyu vurgu
  if(G.cinsiyet==='E'&&!sakalli) titrek(()=>{c.moveTo(108*e,150*b); c.quadraticCurveTo(100*e,186*b,64*e,212*b);},PAL.murekkep,.45,2.2,522+k,2,1.8);
}

/* başlığın ya da saçın yüze düşürdüğü yumuşak gölge: pencere yolunun dışı karanlık, içe doğru yumuşar.
   yol: açıkta kalan alanın yolu; dx,dy: gölgenin kayması (ışık sol-yukarıda: sağa-aşağı) */
export function icGolge(yol,bulanik,dx,dy,alfa){
  const m=c.getTransform(), s=Math.hypot(m.a,m.b);
  c.save(); c.beginPath(); c.rect(-2000,-2000,4000,4000); yol();
  c.shadowColor=`rgba(4,3,5,${alfa})`; c.shadowBlur=bulanik*s; c.shadowOffsetX=dx*s; c.shadowOffsetY=dy*s;
  c.fillStyle='rgba(4,3,5,1)'; c.fill('evenodd');
  c.restore();
}

// ten rengine yakın kirli göz akı (yaşlıda daha bulanık)
export function gozAki(){
  const R=G.renk, y01=clamp((G.yas-25)/45,0,1);
  return [karistir(karistir(R.tenIsik,'#9b9886',.5),[120,110,80],y01*.25),karistir(R.tenOrta,'#5f5d55',.4),[30,28,30]];
}

/* Boy ve irilik: karakterler yan yana gelince oranlar tutsun. boy: 1 = varsayılan kadın; .94-1.08 arası.
   Oturan figürde boyun her %1'i başı 7 birim yukarı kaldırır (gövde de birlikte); iri: bütün figürün ölçeği (.94-1.08),
   baş merkezi çevresinde. İkisi de 1 ise hiçbir dönüşüm yapılmaz (varsayılan kadın birebir aynı kalır). */
export const KAFA_Y=470, BOY_BIRIM=700; // KAFA_Y: sahnenin OLCU.kafaY'si (gövde bu koordinatlarda çizilir)
export function figurDonusumu(govdeMi){
  if(G.boy===1&&G.iri===1) return false;
  const d=(G.boy-1)*BOY_BIRIM, s=G.iri;
  c.save();
  if(govdeMi){c.translate(0,KAFA_Y-d); c.scale(s,s); c.translate(0,-KAFA_Y);}
  else{c.translate(0,-d); c.scale(s,s);}
  return true;
}
