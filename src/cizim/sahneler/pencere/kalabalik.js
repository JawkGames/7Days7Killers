// Meydandaki kalabalık: tohumla üretilir (aynı tohum, aynı kalabalık), her karede kol, meşale ve baş salınımıyla oynar.
// Figürler uzun giysilidir; ayaklar iki küçük, hareketsiz lekedir; el yalnızca küçük bir yumru, yüz en fazla iki leke.
// Okunurluk ışıkla gelir: her ışığın havadaki parıltısı kendinden öndeki sıralardan önce çizilir, öndekiler ona karşı
// siluet kalır ve arkadan vuran ışık kenarlarında ince bir hat bırakır.
import {c} from '../../teknik/tuval.js';
import {leke,titrek} from '../../teknik/firca.js';
import {TAU,rgba,clamp,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {KALABALIK,OFKE_ESYA,COSKU_DURUS,GIYSI,BASLIK,RENK} from './ayar.js';

const K=KALABALIK;
function sec(r,tablo){let x=r(),i=0; for(;i<tablo.length-1;i++){x-=tablo[i][1]; if(x<0) break;} return tablo[i][0];}
export const ARALIK=[.2,.8]; // kalabalığın meydandaki eni (u): telefonda da bütünü görünür

// dış resimde zemin noktası: u (0 sol, 1 sağ), z (1 en ön)
export function zemin(u,z){return [K.resim[0]/2+(u-.5)*K.yayilim/z, K.ufuk+(K.onY-K.ufuk)/z];}
const boyOf=k=>K.boy*k.boy/k.z;
const isikRengi=k=>k.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik;

/* Döner: {kisiler (uzaktan yakına), isiklar, oran (0 hepsi coşkulu, 1 hepsi öfkeli), bol (iki grubun arası, u)} */
export function kalabalikKur(dogru,tohum){
  const r=rng((tohum|0)*7919+dogru*31+17);
  const oran=clamp((7-dogru)/6,0,1);
  const ofkeSolda=r()<.5;
  let bol=null;
  if(oran>0&&oran<1){
    const o=clamp(oran+(r()-.5)*2*K.oranOynama,.12,.88);
    bol=ARALIK[0]+(ARALIK[1]-ARALIK[0])*(ofkeSolda?o:1-o);
  }
  const grupOf=u=>{ if(oran>=1) return 'o'; if(oran<=0) return 'c'; return (u<bol)===ofkeSolda?'o':'c'; };
  const kisiler=[];
  const ekle=(u,z,seyirci)=>{
    if(bol!=null&&Math.abs(u-bol)<K.bosluk/2) return; // iki grubun arası boş kalır
    kisiler.push(kisiUret(r,u,z,grupOf(u),bol,dogru,seyirci));
  };
  const siraSay=K.sira[0]+Math.floor(r()*(K.sira[1]-K.sira[0]+1));
  const zSon=2.6, adim=Math.pow(zSon/1.0,1/(siraSay-1));
  for(let i=0;i<siraSay;i++){
    const z=Math.pow(adim,i)*(1+(r()-.5)*.03);
    const n=K.siraKisi[0]+Math.floor(r()*(K.siraKisi[1]-K.siraKisi[0]+1));
    const genis=ARALIK[1]-ARALIK[0];
    for(let j=0;j<n;j++){
      const u=ARALIK[0]+(j+.5+(i%2?.35:-.1)+(r()-.5)*.7)/n*genis;
      if(u>ARALIK[0]-.02&&u<ARALIK[1]+.02) ekle(u,z*(1+(r()-.5)*.04),false);
    }
  }
  // kenarlarda ve meydanın arka ucunda birkaç kişi: kalabalığa tam katılmamış, karanlıkta
  for(let i=0;i<3;i++){ekle(.06+r()*.12,1.2+r()*1.3,false); ekle(.82+r()*.12,1.2+r()*1.3,false);}
  for(let i=0;i<4;i++) ekle(.15+r()*.7,2.85+r()*.35,true);
  kisiler.sort((a,b)=>b.z-a.z);
  const isiklar=kisiler.filter(k=>k.esya==='mesale'||k.esya==='fener');
  // arkadan vuran ışık (kenar hattı) ve önden vuran ışık (yüz): konumlar sabit, bir kez hesaplanır
  for(const k of kisiler){
    const [x]=zemin(k.u,k.z); let arka=0, on=.0, yon=0;
    for(const s of isiklar){
      const [sx]=zemin(s.u,s.z), dz=s.z-k.z, dx=Math.abs(sx-x), m=Math.max(0,1-dx/(110/Math.min(s.z,k.z)+30));
      if(s===k){on+=.45; continue;}
      if(dz>0) arka+=m*Math.max(0,1-dz/.9);
      else on+=m*Math.max(0,1+dz/.5)*.6;
      yon+=m*Math.sign(sx-x||1);
    }
    k.arka=clamp(arka,0,1); k.on=clamp(on,0,1); k.isikYon=yon>=0?1:-1;
    if(k.z>2.3){k.arka*=.5; k.on*=.3;}
  }
  return {kisiler,isiklar,oran,bol,ofkeSolda};
}

function kisiUret(r,u,z,grup,bol,dogru,seyirci){
  const k={u,z,grup,seyirci:!!seyirci,faz:r()*TAU,hiz:.8+r()*.6,boy:.9+r()*.2,giysi:GIYSI[Math.floor(r()*GIYSI.length)],
    baslik:BASLIK[Math.floor(r()*BASLIK.length)],renk:RENK.giysi[Math.floor(r()*RENK.giysi.length)],taraf:r()<.5?-1:1,egim:(r()-.5)*.05,tohum:Math.floor(r()*1e6)};
  if(k.baslik==='yemeni') k.giysi=r()<.6?'entari':'aba'; // başörtülü kadınlar
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
  if(bol!=null){const d=u-bol, yakin=1-clamp(Math.abs(d)/.12,0,1); k.egim+=(grup==='o'?-1:1)*Math.sign(d)*.08*yakin;}
  return k;
}

/* ───────────── çizim (dış resim biriminde) ───────────── */
const GOVDE={aba:[.135,.18],entari:[.115,.145],kepenek:[.165,.19],salta:[.125,.155]};

function govdeYolu(k,h){
  const [om,et]=GOVDE[k.giysi], sw=om*h, hw=et*h, oy=-.79*h, ey=-.03*h;
  if(k.giysi==='kepenek'){ // keçe kepenek: köşeli, dik omuz, düz iner
    c.moveTo(-sw*.45,oy-.03*h); c.lineTo(sw*.45,oy-.03*h); c.lineTo(sw,oy+.04*h); c.lineTo(hw,ey); c.lineTo(-hw,ey); c.lineTo(-sw,oy+.04*h);
  }else{
    c.moveTo(-sw*.4,oy-.035*h); c.quadraticCurveTo(0,oy-.055*h,sw*.4,oy-.035*h);
    c.quadraticCurveTo(sw*.95,oy-.015*h,sw,oy+.07*h);
    c.quadraticCurveTo(hw*.92,-.42*h,hw,ey); c.quadraticCurveTo(0,ey+.015*h,-hw,ey);
    c.quadraticCurveTo(-hw*.92,-.42*h,-sw,oy+.07*h); c.quadraticCurveTo(-sw*.95,oy-.015*h,-sw*.4,oy-.035*h);
  }
  c.closePath();
}
function basYolu(k,h,bx,by){
  const r=.06*h;
  if(k.baslik==='yemeni'){ // başörtüsü omuzlara iner
    c.moveTo(bx-r*1.15,by+r*.3); c.quadraticCurveTo(bx-r*1.25,by-r*1.4,bx,by-r*1.45); c.quadraticCurveTo(bx+r*1.25,by-r*1.4,bx+r*1.15,by+r*.3);
    c.lineTo(bx+r*1.9,by+r*2.3); c.lineTo(bx-r*1.9,by+r*2.3); c.closePath(); return;
  }
  c.moveTo(bx+r*.9,by); c.ellipse(bx,by,r*.9,r*1.05,0,0,TAU);
  if(k.baslik==='kasket'){c.moveTo(bx+r*1.15,by-r*.45); c.ellipse(bx+r*.1,by-r*.45,r*1.05,r*.5,0,0,TAU); c.rect(bx-r*1.15,by-r*.55,r*2.5,r*.25);}
  else if(k.baslik==='pusu'){c.moveTo(bx+r*1.2,by-r*.4); c.ellipse(bx,by-r*.4,r*1.2,r*.72,0,0,TAU);}
  else if(k.baslik==='kulah'){c.moveTo(bx-r*.95,by-r*.2); c.quadraticCurveTo(bx-r*.6,by-r*1.9,bx+r*.1,by-r*1.95); c.quadraticCurveTo(bx+r*.8,by-r*1.6,bx+r*.95,by-r*.2); c.closePath();}
}

// kol: omuzdan dirseğe, dirsekten bileğe. aci: 0 yukarı, pi aşağı; buk: dirsek kırımı
function kolNoktalari(ox,oy,aci,buk,h){
  const u1=.18*h, u2=.17*h;
  const ex=ox+Math.sin(aci)*u1, ey=oy-Math.cos(aci)*u1, a2=aci+buk;
  return {ox,oy,ex,ey,wx:ex+Math.sin(a2)*u2,wy:ey-Math.cos(a2)*u2,a:a2};
}
function kolYolu(K2){c.moveTo(K2.ox,K2.oy); c.lineTo(K2.ex,K2.ey); c.lineTo(K2.wx,K2.wy);}

function alev(x,y,boy,t,faz,sakin){
  const f=sakin?1+.08*Math.sin(t*5+faz):1+.22*Math.sin(t*13+faz)*Math.sin(t*4.1+faz*1.7);
  const sal=(sakin?.05:.18)*Math.sin(t*7.3+faz)*boy, b=boy*f;
  c.fillStyle=rgba(RENK.ofkeIsik,.9);
  c.beginPath(); c.moveTo(x-boy*.3,y); c.quadraticCurveTo(x-boy*.42,y-b*.45,x+sal,y-b); c.quadraticCurveTo(x+boy*.42,y-b*.45,x+boy*.3,y); c.closePath(); c.fill();
  c.fillStyle=rgba(RENK.ofkeAlev,.95);
  c.beginPath(); c.moveTo(x-boy*.15,y); c.quadraticCurveTo(x-boy*.2,y-b*.3,x+sal*.6,y-b*.6); c.quadraticCurveTo(x+boy*.2,y-b*.3,x+boy*.15,y); c.closePath(); c.fill();
}

// eşyanın sapları ve ağzı (yol olarak): kenar hattı ve dolgu aynı yolla çizilir
function esyaYolu(k,w,h){
  const dx=Math.sin(w.a), dy=-Math.cos(w.a);
  const sap=(alt,ust)=>{c.moveTo(w.wx-dx*alt,w.wy-dy*alt); c.lineTo(w.wx+dx*ust,w.wy+dy*ust); return [w.wx+dx*ust,w.wy+dy*ust];};
  switch(k.esya){
    case 'mesale':{const [ux,uy]=sap(.06*h,.3*h); k.alevNokta=[ux,uy]; break;}
    case 'tirpan':{const [ux,uy]=sap(.3*h,.7*h); const yon=k.taraf; c.moveTo(ux,uy); c.quadraticCurveTo(ux+yon*.2*h,uy-.07*h,ux+yon*.38*h,uy+.06*h); break;}
    case 'dirgen':{const [ux,uy]=sap(.24*h,.62*h); const px=-dy, py=dx;
      c.moveTo(ux-px*.065*h,uy-py*.065*h); c.lineTo(ux+px*.065*h,uy+py*.065*h);
      for(const o of[-.065,0,.065]){c.moveTo(ux+px*o*h,uy+py*o*h); c.lineTo(ux+px*o*h+dx*.13*h,uy+py*o*h+dy*.13*h);} break;}
    case 'orak':{const cx=w.wx+dx*.08*h, cy=w.wy+dy*.08*h; c.moveTo(cx+Math.cos(w.a-Math.PI*1.45)*.08*h,cy+Math.sin(w.a-Math.PI*1.45)*.08*h); c.arc(cx,cy,.08*h,w.a-Math.PI*1.45,w.a-Math.PI*.35); break;}
    case 'sopa': sap(.08*h,.42*h); break;
    case 'fener':{const sal=k.fenerSal||0, fx=w.wx+Math.sin(sal)*.06*h, fy=w.wy+Math.cos(sal)*.06*h; c.moveTo(w.wx,w.wy); c.lineTo(fx,fy); k.alevNokta=[fx,fy+.055*h]; break;}
  }
}
function fenerCiz(k,h){
  const [fx,fy]=k.alevNokta, y0=fy-.055*h;
  c.fillStyle='#0e0a06'; c.fillRect(fx-.034*h,y0,.068*h,.013*h); c.fillRect(fx-.032*h,y0+.092*h,.064*h,.015*h);
  const g=c.createRadialGradient(fx,fy,0,fx,fy,.045*h); g.addColorStop(0,rgba([255,240,190],1)); g.addColorStop(1,rgba(RENK.coskuIsik,.8));
  c.fillStyle=g; c.fillRect(fx-.028*h,y0+.013*h,.056*h,.079*h);
}

// tek figür; (x,y) ayak noktası
function kisiCiz(k,t,hareket,kaynama){
  const [x,y]=zemin(k.u,k.z), h=boyOf(k), uzak=k.z>2.25, ph=k.faz, w=hareket?1:0;
  let bx=0, byo=0; k.bagir=0;
  if(k.grup==='o'&&!k.seyirci){const b=Math.max(0,Math.sin(t*2.6*k.hiz+ph)); k.bagir=hareket?b:.6; byo=b*.02*h*w; bx=b*.012*h*k.taraf*w;}
  else if(!k.seyirci) bx=Math.sin(t*1.1*k.hiz+ph)*.03*h*w;   // coşkuda baş yana sallanır
  c.save(); c.translate(x,y); c.rotate(k.egim);
  // kollar
  const sw=GOVDE[k.giysi][0]*h, oy=-.76*h, T=k.taraf;
  const pump=hareket?Math.sin(t*2.6*k.hiz+ph):.4, dalga=hareket?Math.sin(t*1.25*k.hiz+ph):.4;
  const kollar=[];
  if(k.durus==='kaldir'){
    const kaldir=k.esya==='yumruk'?-.2+pump*.2:.1+pump*.1;
    kollar.push([kolNoktalari(T*sw*.8,oy,T*(.2+kaldir),-T*(.3+pump*.25),h),true]);
  }else if(k.durus==='ikiKol'){
    kollar.push([kolNoktalari(sw*.8,oy,.5+dalga*.3,-.2,h),false]); kollar.push([kolNoktalari(-sw*.8,oy,-.5+dalga*.3,.2,h),false]);
  }else if(k.durus==='tekKol'){
    kollar.push([kolNoktalari(T*sw*.8,oy,T*(.35+dalga*.35),-T*.25,h),false]);
  }else if(k.durus==='fenerYukari'){
    kollar.push([kolNoktalari(T*sw*.8,oy,T*(.12+dalga*.05),-T*.08,h),true]);
  }else if(k.durus==='fenerAlt'){
    kollar.push([kolNoktalari(T*sw*.85,oy+.03*h,T*(Math.PI-.45),T*.3,h),true]);
  }
  // boştaki kol yanda sarkar: silueti mezar taşı gibi düz olmaktan çıkarır
  const dolu=new Set(kollar.map(([kn])=>Math.sign(kn.ox)));
  for(const yan of[-1,1]) if(!dolu.has(yan)) kollar.push([kolNoktalari(yan*sw*.92,oy+.03*h,yan*(Math.PI-.16),-yan*.06,h),false]);
  k.fenerSal=hareket?Math.sin(t*1.6+ph)*.14:0;
  k.alevNokta=null;
  const kalin=Math.max(1.3,.05*h), sapKalin=Math.max(.9,.016*h);
  const yol=()=>{c.beginPath(); govdeYolu(k,h); basYolu(k,h,bx,-.885*h+byo);};
  const esyaYollari=()=>{c.beginPath(); for(const [kn,e] of kollar) if(e&&k.esya&&k.esya!=='yumruk') esyaYolu(k,kn,h);};
  // 1) arkadan vuran ışığın kenar hattı: siluetin bir tık dışına taşan ışıklı çizgi
  const L=k.arka*(uzak?.6:1);
  if(L>.04){ // ışık tarafına kaymış: siluetin yalnızca bir yanında ince bir ay gibi görünür
    const renk=isikRengi(k);
    c.save(); c.translate(k.isikYon*.016*h,-.012*h);
    c.strokeStyle=rgba(renk,.5*L); c.lineJoin='round'; c.lineCap='round';
    c.lineWidth=kalin+.02*h; c.beginPath(); for(const [kn] of kollar) kolYolu(kn); c.stroke();
    c.lineWidth=sapKalin+.015*h; esyaYollari(); c.stroke();
    c.lineWidth=.022*h; yol(); c.stroke();
    c.restore();
  }
  // 2) siluet: eşya, kollar, gövde, baş
  const ten=uzak?k.renk.map(v=>v*.7):k.renk;
  c.strokeStyle='#060504'; c.lineWidth=sapKalin; c.lineCap='round'; esyaYollari(); c.stroke();
  if(k.esya==='tirpan'||k.esya==='orak') {c.strokeStyle=rgba([150,140,120],.25*(.4+k.arka+k.on)); c.lineWidth=sapKalin*.6; esyaYollari(); c.stroke();}
  c.strokeStyle=rgba(ten.map(v=>v*.85),1); c.lineWidth=kalin; c.lineJoin='round';
  c.beginPath(); for(const [kn] of kollar) kolYolu(kn); c.stroke();
  c.fillStyle=rgba(ten.map(v=>v*.85),1); for(const [kn] of kollar){c.beginPath(); c.arc(kn.wx,kn.wy,kalin*.55,0,TAU); c.fill();} // el yok: küçük bir yumru
  if(k.esya==='fener'&&k.alevNokta) fenerCiz(k,h);
  // ayaklar: iki küçük leke, hiç oynamaz
  c.fillStyle='rgba(4,4,3,.95)'; c.beginPath(); c.ellipse(-.045*h,-.01*h,.04*h,.016*h,0,0,TAU); c.ellipse(.045*h,-.008*h,.04*h,.016*h,0,0,TAU); c.fill();
  yol(); c.fillStyle=rgba(ten,1); c.fill();
  if(!uzak){
    c.save(); yol(); c.clip();
    if(k.on>.05) leke(k.isikYon*.1*h,-.6*h,.18*h,.32*h,isikRengi(k),.4*k.on);
    leke(0,-.05*h,.3*h,.22*h,[0,0,0],.55); // etek karanlığa gömülür
    if(k.giysi==='entari'||k.giysi==='salta'){c.fillStyle='rgba(70,60,40,.22)'; c.fillRect(-h,-.5*h,2*h,.022*h);} // kuşak
    // yüz: ışık yüzü yalnızca bir leke olarak yakalar; öfkelide ikinci leke bağıran ağız
    if(k.on>.12){
      const r=.06*h, fy=-.885*h+byo, fr=k.baslik==='yemeni'?.55:.75;
      leke(bx+k.isikYon*r*.15,fy+r*.2,r*.7*fr,r*.85*fr,RENK.kirliSari,.4*k.on);
      if(k.grup==='o'&&k.bagir>.3&&h>90) leke(bx,fy+r*.55,r*.22,r*.28*k.bagir,[6,4,3],.85);
    }
    c.restore();
    titrek(()=>{govdeYolu(k,h);},[4,3,3],.75,Math.max(.8,.011*h),k.tohum+kaynama,2,.01*h);
  }
  c.restore();
}

// havadaki parıltı: kendinden öndeki figürler buna karşı siluet kalır
function havaIsigi(s,carpan,t){
  if(!s.alevNokta) return;
  const [x,y]=zemin(s.u,s.z), h=boyOf(s), f=titre(t,s.faz,s.grup==='c');
  const ax=x+s.alevNokta[0], ay=y+s.alevNokta[1];
  c.globalCompositeOperation='lighter';
  leke(ax,ay+.25*h,.9*h,.75*h,isikRengi(s),(s.esya==='mesale'?.2:.15)*f*carpan);
  c.globalCompositeOperation='source-over';
}

/* Bütün kalabalığı uzaktan yakına çizer. hareket=false ise son duruşta donar. */
export function kalabalikCiz(KL,t,hareket,kaynama,carpan){
  const bekleyen=[];
  for(const k of KL.kisiler){
    // bu figürden en az bir sıra arkadaki ışıkların parıltısı önce
    for(let i=bekleyen.length-1;i>=0;i--) if(bekleyen[i].z>k.z+.04){havaIsigi(bekleyen[i],carpan,t); bekleyen.splice(i,1);}
    kisiCiz(k,t,hareket,kaynama);
    if(k.alevNokta) bekleyen.push(k);
  }
  for(const s of bekleyen) havaIsigi(s,carpan,t);
}

// zemine düşen ışık: figürlerden önce çizilir
export function zeminIsigi(KL,t,carpan){
  c.globalCompositeOperation='lighter';
  for(const s of KL.isiklar){
    const [x,y]=zemin(s.u,s.z), sk=1/s.z, f=titre(t,s.faz,s.grup==='c');
    leke(x,y-4*sk,130*sk,36*sk,isikRengi(s),.22*f*carpan);
  }
  c.globalCompositeOperation='source-over';
}
// alevler ve küçük haleler: en üstte
export function alevler(KL,t,hareket,carpan){
  const tt=hareket?t:0;
  for(const s of KL.isiklar){
    if(!s.alevNokta) continue;
    const [x,y]=zemin(s.u,s.z), h=boyOf(s), f=titre(tt,s.faz,s.grup==='c');
    c.save(); c.translate(x,y); c.rotate(s.egim);
    const [ax,ay]=s.alevNokta;
    if(s.esya==='mesale'){
      // meşalenin is dumanı
      if(hareket) for(let i=0;i<3;i++){const p=((tt*.7+i/3+s.faz)%1); leke(ax+Math.sin(tt*2+i+s.faz)*.05*h+p*.08*h,ay-.2*h-p*.5*h,(.05+p*.12)*h,(.05+p*.1)*h,RENK.ofkeDuman,.35*(1-p));}
      alev(ax,ay,.2*h,tt,s.faz,false);
    }
    c.globalCompositeOperation='lighter';
    leke(ax,ay-.06*h,.28*h,.28*h,isikRengi(s),.28*f*carpan);
    leke(ax,ay-.04*h,.09*h,.09*h,s.grup==='o'?RENK.ofkeAlev:RENK.coskuAlev,.4*f*carpan);
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
  return {renk,guc:clamp(top/12,.5,1),ofkePay:o/top};
}
