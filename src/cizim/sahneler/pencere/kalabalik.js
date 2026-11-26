// Meydandaki kalabalık: tohumla üretilir (aynı tohum, aynı kalabalık), her karede kol, meşale ve baş salınımıyla oynar.
// Figürler uzun giysilidir; ayaklar iki küçük, hareketsiz lekedir; el yalnızca küçük bir yumru, yüz en fazla iki leke.
import {c} from '../../teknik/tuval.js';
import {leke,titrek} from '../../teknik/firca.js';
import {TAU,rgba,clamp,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {KALABALIK,OFKE_ESYA,COSKU_DURUS,GIYSI,BASLIK,RENK} from './ayar.js';

const K=KALABALIK;
function sec(r,tablo){let x=r(),i=0; for(;i<tablo.length-1;i++){x-=tablo[i][1]; if(x<0) break;} return tablo[i][0];}
const ARALIK=[.17,.83]; // kalabalığın meydandaki eni (u); kenarlar ev duvarlarının gölgesinde kalır

// dış resimde zemin noktası: u (0 sol, 1 sağ), z (1 en ön)
export function zemin(u,z){return [K.resim[0]/2+(u-.5)*K.yayilim/z, K.ufuk+(K.onY-K.ufuk)/z];}

/* oran: 0 hepsi coşkulu, 1 hepsi öfkeli. Döner: {kisiler, isiklar, bolunme} */
export function kalabalikKur(dogru,tohum){
  const r=rng((tohum|0)*7919+dogru*31+17);
  const oran=clamp((7-dogru)/6,0,1);
  const ofkeSolda=r()<.5;
  let bol=null; // iki grup arası: u cinsinden orta çizgi
  if(oran>0&&oran<1){
    const o=clamp(oran+(r()-.5)*2*K.oranOynama,.12,.88);
    const oSol=ofkeSolda?o:1-o;
    bol=ARALIK[0]+(ARALIK[1]-ARALIK[0])*oSol;
  }
  const grupOf=u=>{ if(oran>=1) return 'o'; if(oran<=0) return 'c'; return (u<bol)===ofkeSolda?'o':'c'; };
  const kisiler=[];
  const siraSay=K.sira[0]+Math.floor(r()*(K.sira[1]-K.sira[0]+1));
  const zSon=2.75, adim=Math.pow(zSon/1.0,1/(siraSay-1));
  for(let i=0;i<siraSay;i++){
    const z=1.0*Math.pow(adim,i)*(1+(r()-.5)*.03);
    const n=K.siraKisi[0]+Math.floor(r()*(K.siraKisi[1]-K.siraKisi[0]+1));
    for(let j=0;j<n;j++){
      let u=ARALIK[0]+(j+.5+(r()-.5)*.8)/n*(ARALIK[1]-ARALIK[0]);
      u+=(i%2?.5:0)/n*(ARALIK[1]-ARALIK[0])*.5;
      if(bol!=null&&Math.abs(u-bol)<K.bosluk/2) continue; // iki grubun arası boş kalır
      if(u<ARALIK[0]-.02||u>ARALIK[1]+.02) continue;
      kisiler.push(kisiUret(r,u,z,grupOf(u),bol,ofkeSolda,dogru));
    }
  }
  // meydanın arka ucunda birkaç seyirci: kalabalığa katılmamış, karanlıkta duran
  for(let i=0;i<5;i++){const u=.12+r()*.76, z=2.9+r()*.35; kisiler.push(kisiUret(r,u,z,grupOf(u),bol,ofkeSolda,dogru,true));}
  kisiler.sort((a,b)=>b.z-a.z);
  const isiklar=[];
  for(const k of kisiler) if(k.esya==='mesale'||k.esya==='fener') isiklar.push(k);
  // her figürün ne kadar aydınlandığı: yakındaki ışıkların toplamı (konumlar sabit, bir kez hesaplanır)
  for(const k of kisiler){
    const [x,y]=zemin(k.u,k.z); let L=0, yon=0;
    for(const s of isiklar){ if(s===k) {L+=.5; continue;}
      const [sx,sy]=zemin(s.u,s.z), d=Math.hypot(sx-x,(sy-y)*1.6), m=Math.max(0,1-d/(150/s.z+40));
      L+=m*.7; yon+=m*Math.sign(sx-x||1);
    }
    k.isik=clamp(L,0,1)*(k.z>2.3?.35:1); k.isikYon=yon>=0?1:-1;
  }
  return {kisiler,isiklar,oran,bol,ofkeSolda};
}

function kisiUret(r,u,z,grup,bol,ofkeSolda,dogru,seyirci){
  const k={u,z,grup,seyirci:!!seyirci,faz:r()*TAU,hiz:.8+r()*.6,boy:.9+r()*.2,giysi:GIYSI[Math.floor(r()*GIYSI.length)],
    baslik:BASLIK[Math.floor(r()*BASLIK.length)],renk:RENK.giysi[Math.floor(r()*RENK.giysi.length)],taraf:r()<.5?-1:1,egim:(r()-.5)*.05,tohum:Math.floor(r()*1e6)};
  if(k.baslik==='yemeni') k.giysi=r()<.6?'entari':'aba'; // başörtülü kadınlar: entari ya da aba
  if(seyirci){k.durus='dur'; k.esya=null; return k;}
  if(grup==='o'){
    k.esya=sec(r,OFKE_ESYA);
    if(dogru===0&&k.esya==='yumruk'&&r()<.5) k.esya='mesale'; // en kötü sonda meşale artar
    k.durus='kaldir';
  }else{
    k.durus=sec(r,COSKU_DURUS);
    k.esya=k.durus.startsWith('fener')?'fener':null;
  }
  // gerginlik: iki grubun birbirine bakan kenarındakiler boşluğa doğru eğilir (öfkeli) ya da geri çekilir (coşkulu)
  if(bol!=null){const d=u-bol, yakin=1-clamp(Math.abs(d)/.14,0,1); k.egim+=(grup==='o'?-1:1)*Math.sign(d)*.07*yakin; k.kenar=yakin;}
  return k;
}

/* ───────────── çizim (dış resim biriminde) ───────────── */
const GOVDE={aba:[.17,.215],entari:[.135,.165],kepenek:[.21,.225],salta:[.15,.175]};

function govdeYolu(k,h){
  const [om,et]=GOVDE[k.giysi], sw=om*h, hw=et*h, oy=-.8*h, ey=-.035*h;
  c.beginPath();
  if(k.giysi==='kepenek'){ // keçe kepenek: köşeli, dik omuz, düz iner
    c.moveTo(-sw*.55,oy-.03*h); c.lineTo(sw*.55,oy-.03*h); c.lineTo(sw,oy+.03*h); c.lineTo(hw,ey); c.lineTo(-hw,ey); c.lineTo(-sw,oy+.03*h);
  }else{
    c.moveTo(-sw*.45,oy-.04*h); c.quadraticCurveTo(0,oy-.07*h,sw*.45,oy-.04*h);
    c.quadraticCurveTo(sw,oy-.01*h,sw*.98,oy+.08*h);
    c.quadraticCurveTo(hw*1.02,-.4*h,hw,ey); c.quadraticCurveTo(0,ey+.02*h,-hw,ey);
    c.quadraticCurveTo(-hw*1.02,-.4*h,-sw*.98,oy+.08*h); c.quadraticCurveTo(-sw,oy-.01*h,-sw*.45,oy-.04*h);
  }
  c.closePath();
}

function basCiz(k,h,bx,by,renk,isik,uzak,kaynama){
  const r=.068*h;
  c.fillStyle=rgba(renk,1);
  if(k.baslik==='yemeni'){ // başörtüsü omuzlara iner
    c.beginPath(); c.moveTo(bx-r*1.25,by+r*.2); c.quadraticCurveTo(bx-r*1.3,by-r*1.45,bx,by-r*1.5); c.quadraticCurveTo(bx+r*1.3,by-r*1.45,bx+r*1.25,by+r*.2);
    c.lineTo(bx+r*2.1,by+r*2.4); c.lineTo(bx-r*2.1,by+r*2.4); c.closePath(); c.fill();
  }else{
    c.beginPath(); c.ellipse(bx,by,r*.92,r*1.05,0,0,TAU); c.fill();
    if(k.baslik==='kasket'){c.beginPath(); c.ellipse(bx,by-r*.55,r*1.15,r*.55,0,Math.PI,TAU); c.fill(); c.fillRect(bx-r*1.2,by-r*.6,r*2.4,r*.28);}
    else if(k.baslik==='pusu'){c.beginPath(); c.ellipse(bx,by-r*.45,r*1.22,r*.72,0,0,TAU); c.fill();}
    else if(k.baslik==='kulah'){c.beginPath(); c.moveTo(bx-r*.95,by-r*.3); c.quadraticCurveTo(bx-r*.6,by-r*1.9,bx+r*.1,by-r*1.95); c.quadraticCurveTo(bx+r*.8,by-r*1.6,bx+r*.95,by-r*.3); c.fill();}
  }
  if(uzak) return;
  // yüz: ışık yüzü yalnızca bir leke olarak yakalar; öfkelide ikinci leke bağıran ağız
  if(isik>.08){
    const fr=k.baslik==='yemeni'?.6:.8;
    leke(bx+k.isikYon*r*.2,by+r*.15,r*.75*fr,r*.9*fr,RENK.kirliSari,.32*isik);
    if(k.grup==='o'&&k.bagir>.3) leke(bx,by+r*.5,r*.24,r*.3*k.bagir,[6,4,3],.85);
  }
}

// kol: omuzdan dirseğe, dirsekten bileğe. aci: 0 yukarı, pi aşağı; buk: dirsek kırımı
function kol(ox,oy,aci,buk,h,renk,kalin){
  const u1=.17*h, u2=.16*h;
  const ex=ox+Math.sin(aci)*u1, ey=oy-Math.cos(aci)*u1, a2=aci+buk, wx=ex+Math.sin(a2)*u2, wy=ey-Math.cos(a2)*u2;
  c.strokeStyle=rgba(renk,1); c.lineWidth=kalin; c.lineCap='round'; c.lineJoin='round';
  c.beginPath(); c.moveTo(ox,oy); c.lineTo(ex,ey); c.lineTo(wx,wy); c.stroke();
  c.fillStyle=rgba(renk,1); c.beginPath(); c.arc(wx,wy,kalin*.55,0,TAU); c.fill(); // el yok: küçük bir yumru
  return {wx,wy,a:a2};
}

function alev(x,y,boy,t,faz,sakin,isik){
  const f=sakin?1+.08*Math.sin(t*5+faz):1+.22*Math.sin(t*13+faz)*Math.sin(t*4.1+faz*1.7);
  const sal=(sakin?.05:.16)*Math.sin(t*7.3+faz)*boy, b=boy*f;
  c.fillStyle=rgba(isik,.85);
  c.beginPath(); c.moveTo(x-boy*.32,y); c.quadraticCurveTo(x-boy*.42,y-b*.5,x+sal,y-b); c.quadraticCurveTo(x+boy*.42,y-b*.5,x+boy*.32,y); c.closePath(); c.fill();
  c.fillStyle=rgba(sakin?RENK.coskuAlev:RENK.ofkeAlev,.95);
  c.beginPath(); c.moveTo(x-boy*.16,y); c.quadraticCurveTo(x-boy*.2,y-b*.3,x+sal*.6,y-b*.62); c.quadraticCurveTo(x+boy*.2,y-b*.3,x+boy*.16,y); c.closePath(); c.fill();
}

function esyaCiz(k,w,h,t,uzak){
  const mur=[6,5,4], dx=Math.sin(w.a), dy=-Math.cos(w.a), lw=Math.max(.9,.018*h);
  c.strokeStyle=rgba(mur,1); c.lineCap='round'; c.lineWidth=lw;
  const sap=(alt,ust)=>{c.beginPath(); c.moveTo(w.wx-dx*alt,w.wy-dy*alt); c.lineTo(w.wx+dx*ust,w.wy+dy*ust); c.stroke(); return [w.wx+dx*ust,w.wy+dy*ust];};
  switch(k.esya){
    case 'mesale':{const [ux,uy]=sap(.06*h,.3*h); c.fillStyle=rgba([20,12,8],1); c.fillRect(ux-lw*1.3,uy-lw*.5,lw*2.6,lw*2.2); k.alevNokta=[ux,uy]; break;}
    case 'tirpan':{const [ux,uy]=sap(.28*h,.68*h); const yon=k.taraf;
      c.lineWidth=lw*1.3; c.beginPath(); c.moveTo(ux,uy); c.quadraticCurveTo(ux+yon*.2*h,uy-.06*h,ux+yon*.36*h,uy+.07*h); c.stroke();
      c.strokeStyle=rgba([120,112,96],.35); c.lineWidth=lw*.7; c.beginPath(); c.moveTo(ux+yon*.03*h,uy+.012*h); c.quadraticCurveTo(ux+yon*.2*h,uy-.035*h,ux+yon*.33*h,uy+.07*h); c.stroke(); break;}
    case 'dirgen':{const [ux,uy]=sap(.22*h,.62*h); const px=-dy, py=dx;
      c.beginPath(); c.moveTo(ux-px*.06*h,uy-py*.06*h); c.lineTo(ux+px*.06*h,uy+py*.06*h); c.stroke();
      for(const o of[-.06,0,.06]){c.beginPath(); c.moveTo(ux+px*o*h,uy+py*o*h); c.lineTo(ux+px*o*h+dx*.12*h,uy+py*o*h+dy*.12*h); c.stroke();} break;}
    case 'orak':{c.lineWidth=lw*1.2; c.beginPath(); c.arc(w.wx+dx*.07*h,w.wy+dy*.07*h,.075*h,w.a-Math.PI*.95,w.a+Math.PI*.15); c.stroke(); break;}
    case 'sopa': sap(.08*h,.4*h); break;
    case 'fener':{ // gaz feneri bilekten sarkar
      const sal=Math.sin(t*1.6+k.faz)*.12, fx=w.wx+Math.sin(sal)*.06*h, fy=w.wy+Math.cos(sal)*.06*h;
      c.lineWidth=lw*.7; c.beginPath(); c.moveTo(w.wx,w.wy); c.lineTo(fx,fy); c.stroke();
      if(!uzak){c.fillStyle=rgba([14,10,6],1); c.fillRect(fx-.032*h,fy,.064*h,.012*h); c.fillRect(fx-.03*h,fy+.085*h,.06*h,.014*h);}
      const g=c.createRadialGradient(fx,fy+.05*h,0,fx,fy+.05*h,.04*h); g.addColorStop(0,rgba([255,236,180],.95)); g.addColorStop(1,rgba(RENK.coskuIsik,.7));
      c.fillStyle=g; c.fillRect(fx-.026*h,fy+.012*h,.052*h,.074*h);
      k.alevNokta=[fx,fy+.05*h]; break;}
  }
}

// tek figür; (x,y) ayak noktası, h boy (dış resim biriminde)
function kisiCiz(k,t,hareket,kaynama,isikCarpan){
  const [x,y]=zemin(k.u,k.z), h=K.boy*k.boy/k.z, uzak=k.z>2.25, ten=k.renk;
  const ph=k.faz, w=hareket?1:0;
  // baş salınımı: coşkuda yana, öfkede ileri doğru bağırma
  let bx=0, byo=0; k.bagir=0;
  if(k.grup==='o'&&!k.seyirci){const b=Math.max(0,Math.sin(t*2.6*k.hiz+ph)); k.bagir=hareket?b:.6; byo=b*.025*h*w;}
  else if(!k.seyirci) bx=Math.sin(t*1.1*k.hiz+ph)*.03*h*w;
  c.save(); c.translate(x,y); c.rotate(k.egim);
  // ayaklar: iki küçük leke, hiç oynamaz
  c.fillStyle='rgba(4,4,3,.95)'; c.beginPath(); c.ellipse(-.05*h,-.01*h,.045*h,.018*h,0,0,TAU); c.ellipse(.05*h,-.008*h,.045*h,.018*h,0,0,TAU); c.fill();
  // kollar: giysinin arkasından çıkan kaldırılmış kollar önce (gövde omzu örter)
  const sw=GOVDE[k.giysi][0]*h, oy=-.77*h, kalin=Math.max(1.4,.055*h);
  const kolRenk=ten.map(v=>v*.8);
  const kollar=[];
  const pump=hareket?Math.sin(t*2.6*k.hiz+ph):0, dalga=hareket?Math.sin(t*1.25*k.hiz+ph):0;
  const T=k.taraf;
  if(k.durus==='kaldir'){
    const kaldir=k.esya==='yumruk'?-.15+pump*.22:.12+pump*.12;
    kollar.push([T*sw*.8,oy,T*(.18+kaldir),-T*(.35+pump*.25),true]);
    kollar.push([-T*sw*.8,oy+.02*h,-T*(Math.PI-.2),T*.15,false]);
  }else if(k.durus==='ikiKol'){
    kollar.push([sw*.8,oy,.42+dalga*.28,-.25,true]); kollar.push([-sw*.8,oy,-.42+dalga*.28,.25,true]);
  }else if(k.durus==='tekKol'){
    kollar.push([T*sw*.8,oy,T*(.3+dalga*.35),-T*.3,true]);
  }else if(k.durus==='fenerYukari'){
    kollar.push([T*sw*.8,oy,T*(.12+dalga*.06),-T*.1,true]);
  }else if(k.durus==='fenerAlt'){
    kollar.push([T*sw*.82,oy+.02*h,T*(Math.PI-.42),T*.35,true]);
  }
  k.alevNokta=null;
  for(const [ox,oyy,a,b,esyali] of kollar){
    const wr=kol(ox,oyy,a,b,h,kolRenk,kalin);
    if(esyali&&k.esya&&k.esya!=='yumruk') esyaCiz(k,wr,h,t,uzak);
  }
  // gövde
  govdeYolu(k,h);
  c.fillStyle=rgba(ten,1); c.fill();
  if(!uzak){
    c.save(); c.clip();
    if(k.isik>.05) leke(k.isikYon*.12*h,-.55*h,.2*h,.36*h,k.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik,.42*k.isik*isikCarpan);
    leke(0,-.1*h,.3*h,.2*h,[0,0,0],.5); // etek karanlığa gömülür
    if(k.giysi==='entari'||k.giysi==='salta'){c.fillStyle='rgba(70,60,40,.25)'; c.fillRect(-h,-.5*h,2*h,.025*h);} // kuşak
    c.restore();
    titrek(()=>govdeYolu(k,h),[4,3,3],.8,Math.max(.8,.012*h),k.tohum+kaynama,2,.012*h);
    if(k.giysi==='aba'){titrek(()=>{c.moveTo(.02*h,-.74*h); c.lineTo(.03*h,-.06*h);},[4,3,3],.45,.9,k.tohum+3+kaynama,1,.01*h);}
  }
  // baş
  basCiz(k,h,bx,-.885*h+byo,ten.map(v=>v*.85),k.isik*isikCarpan,uzak,kaynama);
  c.restore();
}

/* Bütün kalabalığı çizer. hareket=false ise son duruşta donar. dis: {t, kaynama, isik(0..1+), ofkeYogun} */
export function kalabalikCiz(KL,t,hareket,kaynama,isikCarpan){
  for(const k of KL.kisiler) kisiCiz(k,t,hareket,kaynama,isikCarpan);
}

// zemine düşen ışık: figürlerden önce çizilir
export function zeminIsigi(KL,t,carpan){
  for(const s of KL.isiklar){
    const [x,y]=zemin(s.u,s.z), sk=1/s.z, f=titre(t,s.faz,s.grup==='c');
    leke(x,y-6*sk,120*sk,40*sk,s.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik,.32*f*carpan);
    leke(x,y-70*sk,90*sk,110*sk,s.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik,.09*f*carpan);
  }
}
// alevler ve halelerin parıltısı: figürlerden sonra, toplanarak
export function alevler(KL,t,hareket,carpan){
  const tt=hareket?t:0;
  for(const s of KL.isiklar){
    if(!s.alevNokta) continue;
    const [x,y]=zemin(s.u,s.z); const h=K.boy*s.boy/s.z;
    c.save(); c.translate(x,y); c.rotate(s.egim);
    const [ax,ay]=s.alevNokta, f=titre(tt,s.faz,s.grup==='c');
    if(s.esya==='mesale') alev(ax,ay,.17*h,tt,s.faz,false,RENK.ofkeIsik);
    c.globalCompositeOperation='lighter';
    leke(ax,ay-.05*h,.55*h,.5*h,s.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik,(s.esya==='mesale'?.28:.2)*f*carpan);
    leke(ax,ay-.03*h,.12*h,.12*h,s.grup==='o'?RENK.ofkeAlev:RENK.coskuAlev,.35*f*carpan);
    c.globalCompositeOperation='source-over';
    c.restore();
  }
}
export function titre(t,faz,sakin){
  return sakin?.93+.05*Math.sin(t*2.1+faz)+.02*Math.sin(t*5.3+faz*2)
              :.84+.1*Math.sin(t*11+faz)*Math.sin(t*4.3+faz*2)+.06*Math.sin(t*23+faz);
}
// kalabalık ışığının ortalama rengi ve gücü (odaya vuran ışık için)
export function ortalamaIsik(KL){
  let o=0,cc=0; for(const s of KL.isiklar){if(s.grup==='o') o++; else cc++;}
  const top=Math.max(1,o+cc), renk=[0,1,2].map(i=>lerp(RENK.odaCosku[i],RENK.odaOfke[i],o/top));
  return {renk,guc:clamp(top/14,.45,1),ofkePay:o/top};
}
